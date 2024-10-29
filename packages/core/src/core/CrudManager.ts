import { AtomicOperation, Kv, KvEntry, KvEntryMaybe, KvKeyPart } from "@deno/kv";
import { z } from "zod";
import { DriftError } from "../errors.js";
import { DRIFT_ENTITY_DEFAULT_FIELDS_WITH_TIMESTAMPS, DriftEntity } from "../generators/DriftEntity.js";
import { DriftCreateAndUpdateResponse, DriftCreateArgs, DriftCreateManyArgs, DriftKey, DriftQueryArgs, Entity, EntityInput, QueryResponse } from "../types.js";
import { BatchOperationManager } from "./BatchOperationManager";
import { KeyManager } from "./KeyManager";
import { SearchManager } from "./SearchManager";

/**
 * Manages CRUD operations for Drift tables.
 */
export class CrudManager<T extends DriftEntity<any, any, any>> {
  private kv: Kv;
  private entity: T;

  public keyManager: KeyManager<T>;
  public batchOperationManager: BatchOperationManager<T>;
  public searchManager: SearchManager<T>;

  /**
   * Creates an instance of CrudManager.
   * @param kv - The key-value store instance.
   */
  constructor({
    kv,
    entity,
  }: {
    kv: Kv;
    entity: T;
  }) {
    this.kv = kv;
    this.entity = entity;
    this.searchManager = new SearchManager();

    this.keyManager = new KeyManager({
      kv,
      entity,
      searchManager: this.searchManager,
      crudManager: this,
    });

    this.batchOperationManager = new BatchOperationManager<T>({
      kv,
      entity,
    });
  }

  /**
   * Lists all entries in a specified table.
   * @param tableName - The name of the table to list.
   * @returns A promise that resolves to an array of entries in the table.
   * @example
   * const entries = await crudManager.listTable('users');
   */
  async listTable<T extends DriftEntity<any, any, any>>(
    tableName: string,
  ): Promise<KvEntryMaybe<Entity<T>>[]> {
    const items: KvEntryMaybe<Entity<T>>[] = [];

    for await (const item of this.kv.list({ prefix: [tableName] })) {
      items.push(item as KvEntryMaybe<Entity<T>>);
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
  async listTableWithIndexPrefixes<T extends DriftEntity<any, any, any>>(
    ...prefixes: KvKeyPart[]
  ): Promise<KvEntryMaybe<Entity<T>>[]> {
    const items: KvEntryMaybe<Entity<T>>[] = [];

    for (let i = 0; i < prefixes.length; i++) {
      for await (const item of this.kv.list({ prefix: [prefixes[i]] })) {
        items.push(item as KvEntryMaybe<Entity<T>>);
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
  async read<T extends DriftEntity<any, any, any>>(
    keys: DriftKey[]
  ): Promise<KvEntryMaybe<z.output<T["schema"]>>[]> {
    const result = await this.kv.getMany(
      keys.map(key => key.kv),
    );

    if (keys.length > 1) {
      const unique = [] as (string | null)[];

      return result.filter(
        (x) => !unique.includes(x.versionstamp) && unique.push(x.versionstamp),
      ) as KvEntryMaybe<Entity<T>>[];
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
  async remove<T extends DriftEntity<any, any, any>>(
    queryArgs: {
      where?: Partial<Entity<T>>;
    },
  ): Promise<void> {
    const keys = this.keyManager.schemaToKeys(
      queryArgs.where ?? [],
    );

    await this.batchOperationManager.executeBatch(
      keys,
      (res, key: DriftKey) => {
        res.delete(key.kv);
      },
      "delete",
      this.entity.options,
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
    T extends DriftEntity<any, any, any>,
    Item extends EntityInput<T>,
  >(entries: KvEntryMaybe<Item>[]): Promise<Entity<T>[]> {
    const isTimestampsEnabled = this.entity.options?.timestamps;
    const timestamp = new Date().toISOString();

    const updatedEntries = await this.batchOperationManager.executeBatch(
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

    return updatedEntries.map(({ value, versionstamp }) => ({
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
  private createOne<T extends DriftEntity<any, any, any>>(
    res: AtomicOperation,
    item: EntityInput<T>,
    keys: DriftKey[],
  ) {
    for (const key of keys) {
      switch (key.access.type) {
        case "primary":
        case "unique":
          res = res.check({ key: key.kv, versionstamp: null });
        case "index":
          res = res.set(key.kv, item);
          break;
        default:
          throw new DriftError(`Unknown index key ${key.kv}`);
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
  async create<T extends DriftEntity<any, any, any>>(
    createArgs: DriftCreateArgs<T>,
  ): Promise<DriftCreateAndUpdateResponse<T>> {
    const createdEntries = await this.createMany({
      data: [createArgs.data],
    });
    
    return createdEntries[0];
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
  async createMany<T extends DriftEntity<any, any, any>>(
    createManyArgs: DriftCreateManyArgs<T>,
  ): Promise<DriftCreateAndUpdateResponse<T>[]> {
    let entriesWithVersionstamps = await this.batchOperationManager.executeBatch(
      createManyArgs.data,
      (res, data: EntityInput<T> & { id?: string, createdAt?: Date, updatedAt?: Date }) => {
        if(!data.id) {
          data.id = DRIFT_ENTITY_DEFAULT_FIELDS_WITH_TIMESTAMPS.id.default();
        }

        if(this.entity.options?.timestamps) {
          if(!data.createdAt) data.createdAt = DRIFT_ENTITY_DEFAULT_FIELDS_WITH_TIMESTAMPS.createdAt.default();
          if(!data.updatedAt) data.updatedAt = DRIFT_ENTITY_DEFAULT_FIELDS_WITH_TIMESTAMPS.updatedAt.default();
        }

        const parsedData = this.entity.schema.parse(data);
        const keys = this.keyManager.schemaToKeys(parsedData);

        this.createOne(res, parsedData, keys);
        return parsedData;
      },
      "create",
      this.entity.options,
    );

    return entriesWithVersionstamps;
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
  async findMany<T extends DriftEntity<any, any, any>>(
    queryArgs: DriftQueryArgs<T> = {},
  ): Promise<QueryResponse<T>[]> {
    const indexPrefixes = this.keyManager.getIndexPrefixes();

    const keys = this.keyManager.schemaToKeys(
      queryArgs.where ?? [],
    );

    let foundItems = await this.keyManager.keysToItems(
      this.kv,
      keys.length > 0? keys : [],
      queryArgs.where?? {},
      indexPrefixes.length > 0? [indexPrefixes[0]] : [],
    )

    if (queryArgs.orderBy) {
      const orderByKeys = Object.keys(queryArgs.orderBy);
      foundItems.sort((a, b) => {
        for (const key of orderByKeys) {
          const order = queryArgs.orderBy?.[key];
          const comparison =
            a.value[key] > b.value[key]
             ? 1
              : a.value[key] < b.value[key]
               ? -1
                : 0;
          if (comparison!== 0) {
            return order === "asc"? comparison : -comparison;
          }
        }
        return 0;
      });
    }

    if (queryArgs.skip!== undefined) {
      foundItems = foundItems.slice(queryArgs.skip);
    }

    if (queryArgs.take!== undefined) {
      foundItems = foundItems.slice(0, queryArgs.take);
    }

    if (!foundItems.length) {
      return [];
    }

    if(queryArgs.select) {  
      foundItems = this.keyManager.selectFromEntries(
        foundItems as KvEntry<z.output<T["schema"]>>[],
        queryArgs.select,
      ) as KvEntry<z.output<T["schema"]>>[];
    }

    return foundItems.map((item) => {
      return {
        ...item.value,
        versionstamp: item.versionstamp,
      }
    }) as QueryResponse<T>[];
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
  async findFirst<T extends DriftEntity<any, any, any>>(
    queryArgs: DriftQueryArgs<T>,
  ): Promise<QueryResponse<T>> {
    if (!queryArgs.where) {
      throw new Error("findUnique requires a where clause");
    }

    return (
      await this.findMany(queryArgs)
    )?.[0] as QueryResponse<T>;
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
  async findUnique<T extends DriftEntity<any, any, any>>(
    queryArgs: DriftQueryArgs<T>,
  ): Promise<QueryResponse<T>> {
    return (
      (await this.findFirst(queryArgs)) ?? null  
    );
  }
}
