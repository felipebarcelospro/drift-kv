import { AtomicOperation, Kv, KvEntryMaybe, KvKeyPart } from "@deno/kv";
import { z } from "zod";
import { DriftError } from "../errors.js";
import {
  DriftCreateArgs,
  DriftCreateManyArgs,
  DriftKey,
  DriftQueryArgs,
  DriftQueryKvOptions,
  DriftTableDefinition,
  WithMaybeVersionstamp,
  WithTimestamps,
  WithVersionstamp
} from "../types";
import { mergeValueAndVersionstamp, schemaToKeys } from "../utils";
import { BatchOperationManager } from "./BatchOperationManager";
import { KeyManager } from "./KeyManager";
import { RelationManager } from "./RelationManager";
import { SearchManager } from "./SearchManager";

/**
 * Manages CRUD operations for Drift tables.
 */
export class CrudManager {
  private kv: Kv;
  private options?: {
    timestamps?: boolean;
  };

  public keyManager: KeyManager;
  public relationManager: RelationManager;
  public batchOperationManager: BatchOperationManager<
    z.output<DriftTableDefinition["schema"]>
  >;
  public searchManager: SearchManager;

  /**
   * Creates an instance of CrudManager.
   * @param kv - The key-value store instance.
   */
  constructor(kv: Kv, options?: { timestamps?: boolean }) {
    this.kv = kv;
    this.options = options;
    this.searchManager = new SearchManager();
    this.keyManager = new KeyManager(kv, this.searchManager, this);
    this.relationManager = new RelationManager(kv);
    this.batchOperationManager = new BatchOperationManager<
      z.output<DriftTableDefinition["schema"]>
    >(kv);
  }

  /**
   * Lists all entries in a specified table.
   * @param tableName - The name of the table to list.
   * @returns A promise that resolves to an array of entries in the table.
   * @example
   * const entries = await crudManager.listTable('users');
   */
  async listTable<T extends DriftTableDefinition>(
    tableName: string,
  ): Promise<KvEntryMaybe<z.output<T["schema"]>>[]> {
    const items: KvEntryMaybe<z.output<T["schema"]>>[] = [];

    for await (const item of this.kv.list({ prefix: [tableName] })) {
      items.push(item);
    }

    return items;
  }

  /**
   * Lists all entries in tables with specified index prefixes.
   * @param prefixes - The index prefixes to filter the entries.
   * @returns A promise that resolves to an array of entries matching the prefixes.
   * @example
   * const entries = await crudManager.listTableWithIndexPrefixes('user:', 'admin:');
   */
  async listTableWithIndexPrefixes<T extends DriftTableDefinition>(
    ...prefixes: KvKeyPart[]
  ): Promise<KvEntryMaybe<z.output<T["schema"]>>[]> {
    const items: KvEntryMaybe<z.output<T["schema"]>>[] = [];

    for (let i = 0; i < prefixes.length; i++) {
      for await (const item of this.kv.list({ prefix: [prefixes[i]] })) {
        items.push(item);
      }
    }

    return items;
  }

  /**
   * Reads multiple entries by their keys.
   * @param keys - The keys of the entries to read.
   * @param kvOptions - Optional key-value options.
   * @returns A promise that resolves to an array of entries.
   * @example
   * const entries = await crudManager.read([{ denoKey: 'user:1' }, { denoKey: 'user:2' }]);
   */
  async read<T extends DriftTableDefinition>(
    keys: DriftKey[],
    kvOptions?: DriftQueryKvOptions,
  ): Promise<KvEntryMaybe<z.output<T["schema"]>>[]> {
    const result = await this.kv.getMany(
      keys.map(({ kvKey }) => kvKey),
      kvOptions,
    );

    if (keys.length > 1) {
      const unique = [] as (string | null)[];
      return result.filter(
        (x) => !unique.includes(x.versionstamp) && unique.push(x.versionstamp),
      );
    }

    return result as KvEntryMaybe<z.output<T["schema"]>>[];
  }

  /**
   * Removes entries by their keys.
   * @param keys - The keys of the entries to remove.
   * @returns A promise that resolves when the operation is complete.
   * @example
   * await crudManager.remove(['user:1', 'user:2']);
   */
  async remove<T extends DriftTableDefinition>(
    tableName: string,
    tableDefinition: T,
    queryArgs: {
      where?: Partial<WithMaybeVersionstamp<z.output<T["schema"]>>>;
    },
  ): Promise<void> {
    const keys = schemaToKeys(
      tableName,
      tableDefinition.schema,
      queryArgs.where ?? [],
    );

    await this.batchOperationManager.executeBatch(
      keys,
      (res, key: DriftKey) => {
        res.delete(key.kvKey);
      },
      "delete",
      this.options,
    );
  }

  /**
   * Updates multiple entries.
   * @param entries - The entries to update.
   * @returns A promise that resolves to an array of updated entries with versionstamps.
   * @example
   * const updatedEntries = await crudManager.update([{ key: 'user:1', value: { name: 'John' } }]);
   */
  async update<
    T extends DriftTableDefinition,
    Item extends z.output<T["schema"]>,
  >(entries: KvEntryMaybe<Item>[]): Promise<WithVersionstamp<Item>[]> {
    const isTimestampsEnabled = this.options?.timestamps;
    const timestamp = new Date().toISOString();

    const entriesWithVersionstamps =
      await this.batchOperationManager.executeBatch(
        entries,
        (res, entry: any) => {
          res.check(entry);
          
          if (isTimestampsEnabled) {
            entry.value = { ...entry.value, updatedAt: timestamp };
          }

          res.set(entry.key, entry.value);
        },
        "update",
      );

    return entriesWithVersionstamps.map(({ value, versionstamp }) => ({
      ...value,
      versionstamp,
    }));
  }

  /**
   * Creates a single entry in the specified table.
   * @param res - The atomic operation instance.
   * @param item - The item to create.
   * @param keys - The keys associated with the item.
   */
  private createOne<T extends DriftTableDefinition>(
    res: AtomicOperation,
    item: z.output<T["schema"]>,
    keys: DriftKey[],
  ) {
    const timestamp = new Date().toISOString();
    const isTimestampsEnabled = this.options?.timestamps;

    if(isTimestampsEnabled) {
      item = { ...item, createdAt: timestamp, updatedAt: null };
    }

    for (const { accessKey, kvKey } of keys) {
      switch (accessKey.type) {
        case "primary":
        case "unique":
          res = res.check({ key: kvKey, versionstamp: null });
        case "index":
          res = res.set(kvKey, item);
          break;
        default:
          throw new DriftError(`Unknown index key ${kvKey}`);
      }
    }
  }

  /**
   * Creates a single entry in the specified table.
   * @param tableName - The name of the table.
   * @param tableDefinition - The definition of the table.
   * @param createArgs - The arguments for creating the entry.
   * @returns A promise that resolves to the created entry with a versionstamp or timestamps.
   * @example
   * const newEntry = await crudManager.create('users', userTableDefinition, { data: { name: 'John' } });
   */
  async create<T extends DriftTableDefinition>(
    tableName: string,
    tableDefinition: T,
    createArgs: DriftCreateArgs<T>,
  ): Promise<WithVersionstamp<z.output<T["schema"]>> | WithTimestamps<z.output<T["schema"]>>> {
    const createdEntries = await this.createMany(tableName, tableDefinition, {
      data: [createArgs.data],
    });
    
    return createdEntries[0] as WithVersionstamp<z.output<T["schema"]>> | WithTimestamps<z.output<T["schema"]>>;
  }

  /**
   * Creates multiple entries in the specified table.
   * @param tableName - The name of the table.
   * @param tableDefinition - The definition of the table.
   * @param createManyArgs - The arguments for creating multiple entries.
   * @returns A promise that resolves to an array of created entries with versionstamps or timestamps.
   * @example
   * const newEntries = await crudManager.createMany('users', userTableDefinition, { data: [{ name: 'John' }, { name: 'Jane' }] });
   */
  async createMany<T extends DriftTableDefinition>(
    tableName: string,
    tableDefinition: T,
    createManyArgs: DriftCreateManyArgs<T>,
  ): Promise<(WithVersionstamp<z.output<T["schema"]>> | WithTimestamps<z.output<T["schema"]>>)[]> {
    const entriesWithVersionstamps = await this.batchOperationManager.executeBatch(
      createManyArgs.data,
      (res, data) => {
        const parsedData: z.output<T["schema"]> = tableDefinition.schema.parse(data);
        const keys = schemaToKeys(tableName, tableDefinition.schema, parsedData);

        this.createOne(res, parsedData, keys);
        return parsedData;
      },
      "create",
      this.options,
    );

    return entriesWithVersionstamps as (WithVersionstamp<z.output<T["schema"]>> | WithTimestamps<z.output<T["schema"]>>)[];
  }

  /**
   * Finds multiple entries in the specified table based on query arguments.
   * @param tableName - The name of the table.
   * @param tableDefinition - The definition of the table.
   * @param queryArgs - The arguments for querying the entries.
   * @returns A promise that resolves to an array of found entries with versionstamps.
   * @example
   * const foundEntries = await crudManager.findMany('users', userTableDefinition, { where: { name: 'John' } });
   */
  async findMany<T extends DriftTableDefinition>(
    tableName: string,
    tableDefinition: T,
    queryArgs: DriftQueryArgs<T>,
  ): Promise<WithVersionstamp<z.output<T["schema"]>>[]> {
    const keys = schemaToKeys(
      tableName,
      tableDefinition.schema as z.ZodObject<z.ZodRawShape, "strip", z.ZodTypeAny, { [x: string]: any; }, { [x: string]: any; }>,
      queryArgs.where ?? [],
    );

    const indexPrefixes = this.keyManager.getIndexPrefixes(
      tableName,
      tableDefinition.schema,
    );

    let foundItems = await this.keyManager.keysToItems(
      this.kv,
      tableName,
      keys.length > 0 ? keys : [],
      queryArgs.where ?? {},
      indexPrefixes.length > 0 ? [indexPrefixes[0]] : [],
    );

    if (queryArgs.include) {
      for (const [relationName, relationValue] of Object.entries(
        queryArgs.include,
      )) {
        const relationDefinition = tableDefinition.relations?.[relationName];
        if (!relationDefinition) {
          throw new DriftError(
            `No relation found for relation name '${relationName}', make sure it's defined in your Drift KV configuration.`,
          );
        }
        const tableName = relationDefinition[0];
        const localKey = relationDefinition[2];
        const foreignKey = relationDefinition[3];

        for (let i = 0; i < foundItems.length; i++) {
          const localKeyValue =
            foundItems[i].value[
              localKey.value as unknown as keyof z.output<T["schema"]>
            ];
          const foundRelationItems = await this.findMany(
            tableName,
            tableDefinition,
            {
              select: relationValue === true ? undefined : relationValue,
              where: {
                [foreignKey.value as unknown as string]: localKeyValue,
              } as Partial<WithMaybeVersionstamp<z.output<T["schema"]>>>,
            },
          );

          (foundItems[i].value as Record<string, unknown>)[relationName] =
            this.relationManager.isToManyRelation(relationDefinition)
              ? foundRelationItems
              : foundRelationItems.length > 0
                ? foundRelationItems[0]
                : undefined;
        }
      }
    }

    if (queryArgs.orderBy) {
      const orderByKeys = Object.keys(queryArgs.orderBy);
      foundItems.sort((a, b) => {
        for (const key of orderByKeys) {
          const order = queryArgs.orderBy[key];
          const comparison =
            a.value[key] > b.value[key]
              ? 1
              : a.value[key] < b.value[key]
                ? -1
                : 0;
          if (comparison !== 0) {
            return order === "asc" ? comparison : -comparison;
          }
        }
        return 0;
      });
    }

    if (queryArgs.skip !== undefined) {
      foundItems = foundItems.slice(queryArgs.skip);
    }

    if (queryArgs.take !== undefined) {
      foundItems = foundItems.slice(0, queryArgs.take);
    }

    const selectedItems = queryArgs.select
      ? this.keyManager.selectFromEntries(
          foundItems as KvEntryMaybe<z.output<T["schema"]>>[],
          queryArgs.select,
        )
      : foundItems;

    return selectedItems.map((item) => mergeValueAndVersionstamp(item)) as WithVersionstamp<z.output<T["schema"]>>[];
  }

  /**
   * Finds the first entry in the specified table based on query arguments.
   * @param tableName - The name of the table.
   * @param tableDefinition - The definition of the table.
   * @param queryArgs - The arguments for querying the entry.
   * @returns A promise that resolves to the found entry with a versionstamp or null if not found.
   * @example
   * const firstEntry = await crudManager.findFirst('users', userTableDefinition, { where: { name: 'John' } });
   */
  async findFirst<T extends DriftTableDefinition>(
    tableName: string,
    tableDefinition: T,
    queryArgs: DriftQueryArgs<T>,
  ): Promise<WithVersionstamp<z.output<T["schema"]>> | null> {
    if (!queryArgs.where) {
      throw new Error("findUnique requires a where clause");
    }

    return (
      await this.findMany(tableName, tableDefinition, queryArgs)
    )?.[0] as WithVersionstamp<z.output<T["schema"]>> | null;
  }

  /**
   * Finds a unique entry in the specified table based on query arguments.
   * @param tableName - The name of the table.
   * @param tableDefinition - The definition of the table.
   * @param queryArgs - The arguments for querying the entry.
   * @returns A promise that resolves to the found entry with a versionstamp or null if not found.
   * @example
   * const uniqueEntry = await crudManager.findUnique('users', userTableDefinition, { where: { id: '1' } });
   */
  async findUnique<T extends DriftTableDefinition>(
    tableName: string,
    tableDefinition: T,
    queryArgs: DriftQueryArgs<T>,
  ): Promise<WithVersionstamp<z.output<T["schema"]>> | null> {
    return (
      (await this.findFirst(tableName, tableDefinition, queryArgs)) ?? null  
    );
  }
}
