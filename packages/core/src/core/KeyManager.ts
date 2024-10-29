import { Kv, KvEntry, KvEntryMaybe, KvKeyPart } from "@deno/kv";
import { z } from "zod";
import { DriftError, DriftKeyError } from "../errors";
import { DriftEntity } from "../generators/DriftEntity";
import {
  DriftAccessKey,
  DriftKey,
  DriftKeyProperty,
  DriftQueryArgs,
  EntityInput,
} from "../types";
import { CrudManager } from "./CrudManager";
import { SearchManager } from "./SearchManager";

/**
 * Manages keys and their associated operations for the database.
 */
export class KeyManager<T extends DriftEntity<any, any, any>> {
  private kv: Kv;
  private searchManager: SearchManager<T>;
  private crudManager: CrudManager<T>;
  private KeyPropertySchema = z.enum(["primary", "unique", "index"]);
  private entity: T;

  /**
   * Creates an instance of KeyManager.
   * @param kv - The key-value store instance.
   * @param searchManager - The instance of SearchManager for filtering entries.
   * @param crudManager - The instance of CrudManager for CRUD operations.
   */
  constructor({
    kv,
    entity,
    searchManager,
    crudManager,
  }: {
    kv: Kv;
    entity: T;
    searchManager: SearchManager<T>;
    crudManager: CrudManager<T>;
  }) {
    this.kv = kv;
    this.entity = entity;
    this.searchManager = searchManager;
    this.crudManager = crudManager;
  }

  /**
   * Retrieves the key property schema.
   * @returns The key property schema.
   */
  static getKeyPropertySchema() {
    return z.enum(["primary", "unique", "index"]);
  }

  /**
   * Generates DriftKeys based on the table schema and provided values.
   * @param tableName - The name of the table.
   * @param schema - The Zod schema of the table.
   * @param values - Partial values to generate keys from.
   * @returns An array of DriftKey objects.
   */
  public generateKeys<T extends DriftEntity<any, any, any>>(
    entity: T,
    values: Partial<z.input<T["schema"]>>,
  ): DriftKey[] {
    return this.schemaToKeys(values);
  }

  /**
   * Retrieves items from the database based on the provided keys and query arguments.
   * @param tableName - The name of the table.
   * @param keys - An array of DriftKey objects.
   * @param where - Query conditions.
   * @param indexPrefixes - Prefixes for indexing.
   * @returns A promise that resolves to an array of Deno.KvEntry objects.
   */
  public async retrieveItems<T extends DriftEntity<any, any, any>>(
    keys: DriftKey[],
    where: DriftQueryArgs<T>["where"],
    indexPrefixes: KvKeyPart[],
  ): Promise<KvEntryMaybe<z.output<T["schema"]>>[]> {
    return (await this.keysToItems(
      this.kv,
      keys,
      where,
      indexPrefixes,
    )) as KvEntryMaybe<z.output<T["schema"]>>[];
  }

  /**
   * Selects specific fields from the retrieved items based on the select input.
   * @param items - An array of Deno.KvEntry objects.
   * @param select - Selection criteria.
   * @returns An array of Deno.KvEntry objects with selected fields.
   */
  public selectFields<
    T extends DriftEntity<any, any, any>,
    Q extends DriftQueryArgs<T>,
    S extends NonNullable<Q["select"]>,
  >(
    items: KvEntryMaybe<z.output<T["schema"]>>[],
    select: S,
  ): KvEntryMaybe<Pick<z.output<T["schema"]>, keyof S & string>>[] {
    return this.selectFromEntries(items, select);
  }

  /**
   * Parses key properties from a given property string.
   * @param tableName - The name of the table.
   * @param property - The property name.
   * @param keyPropertyString - A comma-separated string of key properties.
   * @returns A DriftKeyProperty or undefined.
   */
  public parseKeyPropertiesInternal(
    property: string,
    keyPropertyString: string,
  ): DriftKeyProperty | undefined {
    return this.parseKeyProperties(this.entity.name, property, keyPropertyString);
  }

  /**
   * Converts DriftAccessKeys to Deno.KvKey arrays for indexing.
   * @param tableName - The name of the table.
   * @param accessKeys - An array of DriftAccessKey objects.
   * @returns A two-dimensional array of Deno.KvKey.
   */
  public convertAccessKeysToIndexes(
    accessKeys: DriftAccessKey[],
  ): KvKeyPart[][][] {
    return this.keysToIndexes(accessKeys);
  }

  /**
   * Transforms `DriftAccessKey` to `Deno.KvKey[]` used to filter items.
   * @param tableName - Name of the "table" (e.g., "users").
   * @param accessKeys - The `DriftAccessKey[]` returned by `schemaToKeys()`.
   * @returns A two-dimensional array of Deno.KvKey.
   */
  public keysToIndexes(
    accessKeys: DriftAccessKey[],
  ): KvKeyPart[][][] {
    const primaryKey = accessKeys.find(({ type }) => type === "primary");

    return accessKeys.map((accessKey) => {
      const accessKeyValueArr =
        accessKey.value instanceof Array ? accessKey.value : [accessKey.value];

      // Primary key
      if (accessKey.type === "primary") {
        return accessKeyValueArr.map((accessKeyValue) => [
          this.entity.name,
          accessKeyValue,
        ]);
      }

      // Unique indexed key
      if (accessKey.type === "unique") {
        return accessKeyValueArr.map((accessKeyValue) => [
          `${this.entity.name}${accessKey.value}`,
          accessKeyValue,
        ]);
      }

      // Non-unique indexed key
      if (accessKey.type === "index") {
        if (!primaryKey) {
          throw new DriftError(
            `Table '${this.entity.name}' can't use a non-unique index without a primary index`,
          );
        }
        const primaryKeyValueArr =
          primaryKey.value instanceof Array
            ? primaryKey.value
            : [primaryKey.value];
        return accessKeyValueArr
          .map((accessKeyValue) =>
            primaryKeyValueArr.map((primaryKeyValue) => [
              `${this.entity.name}${accessKey.value}`,
              accessKeyValue,
              primaryKeyValue,
            ]),
          )
          .flat();
      }

      throw new DriftError("Invalid access key");
    }) as KvKeyPart[][][];
  }

  /**
   * Retrieves items from the key-value store based on the provided keys and query arguments.
   * @param kv - The key-value store instance.
   * @param tableName - The name of the table.
   * @param keys - An array of DriftKey objects.
   * @param where - Query conditions.
   * @param indexPrefixes - Prefixes for indexing.
   * @returns A promise that resolves to an array of Deno.KvEntry objects.
   */
  public async keysToItems<T extends DriftEntity<any, any, any>>(
    kv: Kv,
    keys: DriftKey[],
    where: DriftQueryArgs<T>["where"],
    indexPrefixes: KvKeyPart[],
  ) {
    const entries =
      keys.length > 0
        ? await this.crudManager.read<T>(keys)
        : await this.crudManager.listTableWithIndexPrefixes(...indexPrefixes);

    // Sort using `where`
    return this.searchManager.filterEntries(entries, where);
  }

  /**
   * Selects specific fields from the entries based on the provided selection criteria.
   * @param items - An array of Deno.KvEntry objects.
   * @param select - Selection criteria.
   * @returns An array of Deno.KvEntry objects with selected fields.
   */
  public selectFromEntries<
    T extends DriftEntity<any, any, any>,
    Q extends DriftQueryArgs<T>,
    S extends NonNullable<Q["select"]>,
  >(
    items: KvEntryMaybe<z.output<T["schema"]>>[],
    select: S,
  ): KvEntryMaybe<Pick<z.output<T["schema"]>, keyof S & string>>[] {
    return items.map((item) => {
      if (item.value === null) {
        item.value = {};
      }

      item.value = Object.keys(select).reduce(
        (previous, current) => ({
          ...previous,
          [current]: item.value?.[current],
        }),
        {} as Partial<z.output<T["schema"]>>,
      );

      return item;
    });
  }

  /**
   * Retrieves index prefixes based on the table schema.
   * @param tableName - The name of the table.
   * @param schema - The Zod schema of the table.
   * @returns An array of KvKeyPart representing index prefixes.
   */
  public getIndexPrefixes(): KvKeyPart[] {
    const indexPrefixes = Object.entries(this.entity.schema.shape).reduce(
      (current, [indexKey, indexValue]) => {
        const description = (indexValue as z.ZodTypeAny).description;
        if (!description) {
          return current;
        }

        const keyType = this.parseKeyProperties(this.entity.name, indexKey, description);

        switch (keyType) {
          case "primary":
            current.push(this.entity.name);
            break;
          case "unique":
            current.push(`${this.entity.name}_by_unique_${indexKey}`);
            break;
          case "index":
            current.push(`${this.entity.name}_by_${indexKey}`);
            break;
        }

        return current;
      },
      [] as string[],
    );
    return indexPrefixes;
  }

  /**
   * Parses the key properties for validation against allowed schema properties.
   * @param tableName - The name of the table.
   * @param property - The specific property being parsed.
   * @param keyPropertyString - String representation of key properties.
   * @returns The parsed key property or undefined if invalid.
   * @throws DriftKeyError for invalid properties.
   */
  private parseKeyProperties(
    tableName: string,
    property: string,
    keyPropertyString: string
  ): DriftKeyProperty | undefined {
    const parsedProperties = keyPropertyString
      .split(",")
      .map((key) => key.trim())
      .map((key) => {
        try {
          return this.KeyPropertySchema.parse(key);
        } catch {
          throw new DriftKeyError(
            `Error parsing property string '${keyPropertyString}'. Your schema has invalid properties. Properties ${
              this.KeyPropertySchema.options.join(
                ", ",
              )
            } are supported, you passed in '${key}'`,
          );
        }
      });

    if (parsedProperties.length > 1) {
      throw new Error(
        `Table '${tableName}' can't have more than one type of index for property '${property}'. You are using indexes ${
          parsedProperties.map((p) => `'${p}'`).join(" and ")
        }. Use only one of the index values 'primary', 'unique' or 'index'.`,
      );
    }

    return parsedProperties[0];
  }

  /**
   * Converts schema and values into an array of DriftKeys for Deno KV operations.
   * @param values - Values to convert into keys.
   * @returns Array of generated DriftKeys.
   */
  public schemaToKeys(values: EntityInput<T>): DriftKey[] {
    const accessKeys = this.schemaToAccessKeys(values);
    const denoKeysArr = this.keysToIndexes(accessKeys);
    const driftKeys: DriftKey[] = [];

    for (let i = 0; i < accessKeys.length; i++) {
      denoKeysArr[i].forEach((key) => {
        driftKeys.push({
          access: accessKeys[i],
          kv: key,
        });
      });
    }

    return driftKeys;
  }

  /**
   * Generates access keys from the schema and values.
   * @param values - Values to convert into access keys.
   * @returns Array of DriftAccessKeys generated from schema and values.
   * @throws Error if more than one primary key is found.
   */
  public schemaToAccessKeys(values: EntityInput<T>): DriftAccessKey[] {
    const accessKeys = Object.entries(this.entity.schema.shape).reduce(
      (current, [key, value]: [string, z.ZodTypeAny]) => {
        const inputValue = values[key];
  
        if (!value.description || inputValue === undefined) {
          return current;
        }
  
        const keyType = this.parseKeyProperties(this.entity.name, key, value.description);
  
        switch (keyType) {
          case "primary":
            current.push({
              value: inputValue,
              type: "primary",
            });
            break;
          case "unique":
            current.push({
              value: inputValue,
              type: "unique",
              suffix: `_by_unique_${key}`,
            });
            break;
          case "index":
            current.push({
              value: inputValue,
              type: "index",
              suffix: `_by_${key}`,
            });
            break;
        }
  
        return current;
      },
      [] as DriftAccessKey[],
    );
  
    const primaryKeys = accessKeys.filter(({ type }) => type === "primary");
  
    if (primaryKeys.length > 1) {
      throw new Error(
        `Table '${this.entity.name}' can't have more than one primary key`,
      );
    }
  
    return accessKeys;
  }

  /**
   * Merges value and versionstamp from a KvEntry.
   * @param entry - KvEntry to merge.
   * @returns Object containing merged value and versionstamp.
   */
  public static mergeValueAndVersionstamp<T extends KvEntry<Record<string, unknown>>>(
    entry: T
  ) {
    return {
      ...entry.value,
      versionstamp: entry.versionstamp,
    };
  }

  /**
   * Checks if a value is a key of a given record.
   * @param value - Value to check.
   * @param record - Record to check against.
   * @returns True if value is a key of the record.
   */
  public static isKeyOf<T extends Record<string, unknown>>(
    value: string | number | symbol,
    record: T
  ): value is keyof T {
    return value in record;
  }

  /**
   * Checks if a KvEntry is a valid key entry.
   * @param entry - KvEntry to check.
   * @returns True if entry is valid.
   */
  public static isKeyEntry<T>(entry: KvEntryMaybe<T>): entry is KvEntry<T> {
    return entry.value !== null && entry.versionstamp !== null;
  }

  /**
   * Removes the versionstamp from an item.
   * @param item - Item from which to remove the versionstamp.
   * @returns Item without the versionstamp.
   */
  public static removeVersionstamp<T extends { versionstamp?: string | undefined | null }>(
    item: T
  ) {
    const { versionstamp: _, ...rest } = item;
    return rest;
  }

  /**
   * Removes the versionstamp from an array of items.
   * @param items - Array of items to process.
   * @returns Array of items without versionstamp.
   */
  public static removeVersionstamps<T extends { versionstamp?: string | undefined | null }>(
    items: T[]
  ) {
    return items.map(this.removeVersionstamp);
  }
}
