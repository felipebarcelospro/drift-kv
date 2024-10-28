import { Kv, KvEntryMaybe, KvKeyPart } from "@deno/kv";
import { z } from "zod";
import { DriftError } from "../errors";
import {
  DriftAccessKey,
  DriftKey,
  DriftKeyProperty,
  DriftQueryArgs,
  DriftTableDefinition,
} from "../types";
import {
  isKeyOf,
  KeyPropertySchema,
  parseKeyProperties,
  schemaToKeys,
} from "../utils";
import { CrudManager } from "./CrudManager";
import { SearchManager } from "./SearchManager";

/**
 * Manages keys and their associated operations for the database.
 */
export class KeyManager {
  private kv: Kv;
  private searchManager: SearchManager;
  private crudManager: CrudManager;

  /**
   * Creates an instance of KeyManager.
   * @param kv - The key-value store instance.
   * @param searchManager - The instance of SearchManager for filtering entries.
   * @param crudManager - The instance of CrudManager for CRUD operations.
   */
  constructor(kv: Kv, searchManager: SearchManager, crudManager: CrudManager) {
    this.kv = kv;
    this.searchManager = searchManager;
    this.crudManager = crudManager;
  }

  /**
   * Retrieves the key property schema.
   * @returns The key property schema.
   */
  static getKeyPropertySchema() {
    return KeyPropertySchema;
  }

  /**
   * Generates DriftKeys based on the table schema and provided values.
   * @param tableName - The name of the table.
   * @param schema - The Zod schema of the table.
   * @param values - Partial values to generate keys from.
   * @returns An array of DriftKey objects.
   */
  public generateKeys<T extends ReturnType<typeof z.object>>(
    tableName: string,
    schema: T,
    values: Partial<z.input<T>>,
  ): DriftKey[] {
    return schemaToKeys(tableName, schema, values);
  }

  /**
   * Retrieves items from the database based on the provided keys and query arguments.
   * @param tableName - The name of the table.
   * @param keys - An array of DriftKey objects.
   * @param where - Query conditions.
   * @param indexPrefixes - Prefixes for indexing.
   * @returns A promise that resolves to an array of Deno.KvEntry objects.
   */
  public async retrieveItems<T extends DriftTableDefinition>(
    tableName: string,
    keys: DriftKey[],
    where: DriftQueryArgs<T>["where"],
    indexPrefixes: KvKeyPart[],
  ): Promise<KvEntryMaybe<z.output<T["schema"]>>[]> {
    return (await this.keysToItems(
      this.kv,
      tableName,
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
    T extends DriftTableDefinition,
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
    tableName: string,
    property: string,
    keyPropertyString: string,
  ): DriftKeyProperty | undefined {
    return parseKeyProperties(tableName, property, keyPropertyString);
  }

  /**
   * Converts DriftAccessKeys to Deno.KvKey arrays for indexing.
   * @param tableName - The name of the table.
   * @param accessKeys - An array of DriftAccessKey objects.
   * @returns A two-dimensional array of Deno.KvKey.
   */
  public convertAccessKeysToIndexes(
    tableName: string,
    accessKeys: DriftAccessKey[],
  ): KvKeyPart[][][] {
    return this.keysToIndexes(tableName, accessKeys);
  }

  /**
   * Transforms `DriftAccessKey` to `Deno.KvKey[]` used to filter items.
   * @param tableName - Name of the "table" (e.g., "users").
   * @param accessKeys - The `DriftAccessKey[]` returned by `schemaToKeys()`.
   * @returns A two-dimensional array of Deno.KvKey.
   */
  public keysToIndexes(
    tableName: string,
    accessKeys: DriftAccessKey[],
  ): KvKeyPart[][][] {
    const primaryKey = accessKeys.find(({ type }) => type === "primary");

    return accessKeys.map((accessKey) => {
      const accessKeyValueArr =
        accessKey.value instanceof Array ? accessKey.value : [accessKey.value];

      // Primary key
      if (accessKey.type === "primary") {
        return accessKeyValueArr.map((accessKeyValue) => [
          tableName,
          accessKeyValue,
        ]);
      }

      // Unique indexed key
      if (accessKey.type === "unique") {
        return accessKeyValueArr.map((accessKeyValue) => [
          `${tableName}${accessKey.suffix}`,
          accessKeyValue,
        ]);
      }

      // Non-unique indexed key
      if (accessKey.type === "index") {
        if (!primaryKey) {
          throw new DriftError(
            `Table '${tableName}' can't use a non-unique index without a primary index`,
          );
        }
        const primaryKeyValueArr =
          primaryKey.value instanceof Array
            ? primaryKey.value
            : [primaryKey.value];
        return accessKeyValueArr
          .map((accessKeyValue) =>
            primaryKeyValueArr.map((primaryKeyValue) => [
              `${tableName}${accessKey.suffix}`,
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
  public async keysToItems<T extends DriftTableDefinition>(
    kv: Kv,
    tableName: string,
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
    T extends DriftTableDefinition,
    Q extends DriftQueryArgs<T>,
    S extends NonNullable<Q["select"]>,
  >(
    items: KvEntryMaybe<z.output<T["schema"]>>[],
    select: S,
  ): KvEntryMaybe<Pick<z.output<T["schema"]>, keyof S & string>>[] {
    return items.map((item) => {
      item.value = Object.keys(select).reduce(
        (previous, current) =>
          !isKeyOf(current, item.value)
            ? previous
            : {
                ...previous,
                [current]: item.value[current],
              },
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
  public getIndexPrefixes<T extends DriftTableDefinition>(
    tableName: string,
    schema: T["schema"],
  ): KvKeyPart[] {
    const indexPrefixes = Object.entries(schema.shape).reduce(
      (current, [indexKey, indexValue]) => {
        const description = (indexValue as z.ZodTypeAny).description;
        if (!description) {
          return current;
        }

        const keyType = parseKeyProperties(tableName, indexKey, description);

        switch (keyType) {
          case "primary":
            current.push(tableName);
            break;
          case "unique":
            current.push(`${tableName}_by_unique_${indexKey}`);
            break;
          case "index":
            current.push(`${tableName}_by_${indexKey}`);
            break;
        }

        return current;
      },
      [] as string[],
    );
    return indexPrefixes;
  }
}
