import { KvEntry, KvEntryMaybe, KvKey } from "@deno/kv";
import { z } from "zod";
import { DriftKeyError } from "./errors";
import { DriftAccessKey, DriftKey, DriftKeyProperty } from "./types";

// Schema for defining key properties
export const KeyPropertySchema = z.enum(["primary", "unique", "index"]);

/**
 * Parses the key properties from a given string and validates them against the schema.
 *
 * @param tableName - The name of the table for which the properties are being parsed.
 * @param property - The specific property being parsed.
 * @param keyPropertyString - A string representation of the key properties.
 * @returns The parsed key property or undefined if not valid.
 * @throws DriftKeyError if the properties are invalid.
 */
export function parseKeyProperties(
  tableName: string,
  property: string,
  keyPropertyString: string,
): DriftKeyProperty | undefined {
  const parsedProperties = keyPropertyString
    .split(",")
    .map((key) => key.trim())
    .map((key) => {
      try {
        return KeyPropertySchema.parse(key);
      } catch {
        throw new DriftKeyError(
          `Error parsing property string '${keyPropertyString}'. Your schema has invalid properties. Properties ${KeyPropertySchema.options.join(
            ", ",
          )} are supported, you passed in '${key}'`,
        );
      }
    });

  if (parsedProperties.length > 1) {
    throw new Error(
      `Table '${tableName}' can't have more than one type of index for property '${property}'. You are using indexes ${parsedProperties
        .map((p) => `'${p}'`)
        .join(
          " and ",
        )}. Use only one of the index values 'primary', 'unique' or 'index'.`,
    );
  }

  return parsedProperties[0];
}

/**
 * Converts access keys to their corresponding index keys.
 *
 * @param tableName - The name of the table.
 * @param accessKeys - An array of access keys to convert.
 * @returns An array of key-value pairs representing the indexes.
 * @throws Error if a non-unique index is used without a primary index.
 */
function keysToIndexes(
  tableName: string,
  accessKeys: DriftAccessKey[],
): KvKey[][] {
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
        throw new Error(
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

    throw new Error("Invalid access key");
  });
}

/**
 * Converts a schema and its values into an array of DriftKeys.
 *
 * @param tableName - The name of the table.
 * @param schema - The schema defining the structure of the data.
 * @param values - The values to be converted into keys.
 * @returns An array of DriftKeys generated from the schema and values.
 */
export function schemaToKeys<T extends ReturnType<typeof z.object>>(
  tableName: string,
  schema: T,
  values: Partial<z.input<T>>,
): DriftKey[] {
  const accessKeys = schemaToAccessKeys(tableName, schema, values);
  const denoKeysArr = keysToIndexes(tableName, accessKeys);
  const driftKeys: DriftKey[] = [];

  for (let i = 0; i < accessKeys.length; i++) {
    denoKeysArr[i].forEach((kvKey) => {
      driftKeys.push({
        accessKey: accessKeys[i],
        kvKey,
      });
    });
  }

  return driftKeys;
}

/**
 * Generates access keys from a schema and its values.
 *
 * @param tableName - The name of the table.
 * @param schema - The schema defining the structure of the data.
 * @param values - The values to be converted into access keys.
 * @returns An array of DriftAccessKeys generated from the schema and values.
 * @throws Error if more than one primary key is found.
 */
export function schemaToAccessKeys<T extends ReturnType<typeof z.object>>(
  tableName: string,
  schema: T,
  values: Partial<z.input<T>>,
): DriftAccessKey[] {
  const accessKeys = Object.entries(schema.shape).reduce(
    (current, [key, value]) => {
      const inputValue = values[key];

      if (!value.description || inputValue === undefined) {
        return current;
      }

      const keyType = parseKeyProperties(tableName, key, value.description);

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
      `Table '${tableName}' can't have more than one primary key`,
    );
  }

  return accessKeys;
}

// @todo: make sure values confine to the limitations of the
// `structuralClone` algorithm.
export function isValidDatabaseValue() {}

/**
 * Merges the value and versionstamp from a KvEntry.
 *
 * @param entry - The KvEntry to merge.
 * @returns An object containing the merged value and versionstamp.
 */
export function mergeValueAndVersionstamp<
  T extends KvEntry<Record<string, unknown>>,
>(entry: T) {
  return {
    ...entry.value,
    versionstamp: entry.versionstamp,
  };
}

/**
 * Checks if a value is a key of a given record.
 *
 * @param value - The value to check.
 * @param record - The record to check against.
 * @returns True if the value is a key of the record, otherwise false.
 */
export function isKeyOf<T extends Record<string, unknown>>(
  value: string | number | symbol,
  record: T,
): value is keyof T {
  return value in record;
}

/**
 * Checks if a KvEntry is a valid key entry.
 *
 * @param entry - The KvEntry to check.
 * @returns True if the entry is valid, otherwise false.
 */
export function isKeyEntry<T>(entry: KvEntryMaybe<T>): entry is KvEntry<T> {
  return entry.value !== null && entry.versionstamp !== null;
}

/**
 * Removes the versionstamp from an item.
 *
 * @param item - The item from which to remove the versionstamp.
 * @returns The item without the versionstamp.
 */
export function removeVersionstamp<
  T extends { versionstamp?: string | undefined | null },
>(item: T) {
  const { versionstamp: _, ...rest } = item;

  return rest;
}

/**
 * Removes the versionstamp from an array of items.
 *
 * @param items - The array of items from which to remove the versionstamp.
 * @returns An array of items without the versionstamp.
 */
export function removeVersionstamps<
  T extends { versionstamp?: string | undefined | null },
>(items: T[]) {
  return items.map(removeVersionstamp);
}
