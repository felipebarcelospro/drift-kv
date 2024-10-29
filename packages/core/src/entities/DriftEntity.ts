import { Kv, KvEntryMaybe } from "@deno/kv";
import { CrudManager } from "../core/CrudManager";
import { DriftWatcher } from "../core/Watcher";
import { DriftError } from "../errors";
import { DriftEntity } from "../generators/DriftEntity";
import { DriftCreateAndUpdateResponse, DriftCreateArgs, DriftCreateManyArgs, DriftDeleteResponse, DriftEntityHookContext, DriftEntityHooks, DriftEntityMethods, DriftQueryAction, DriftQueryArgs, DriftUpdateArgs, Entity, EntityInput } from "../types";

/**
 * Main entity class that provides CRUD operations and real-time subscriptions
 * @see {@link https://github.com/yourusername/drift/blob/main/README.md#entity Entity Documentation}
 */
export class DriftEntityManager<
  T extends DriftEntity<any, any, any>,
> implements DriftEntityMethods<T> {
  private watcher: DriftWatcher<T>;
  private crudManager: CrudManager<T>;
  
  private kv: Kv;
  private entity: T;

  constructor({
    entity,
    client,
  }: {
    entity: T;
    client: Kv;
  }) {
    this.kv = client;
    this.entity = entity;

    this.crudManager = new CrudManager<T>({
      kv: client,
      entity,
    });

    this.watcher = new DriftWatcher<T>({
      entity,
      client,
      keyManager: this.crudManager.keyManager,
    });
  }

  /** ===============================
   * Create Method
   * =============================== */
  public async create(params: DriftCreateArgs<T>) {
    const { data } = params as { data: EntityInput<T> };
    const action: DriftQueryAction = "create";

    // Execute beforeQuery hooks
    await this.executeHook("beforeQuery", {
      action,
      query: data,
      entity: this.entity.name,
    });

    // Save data using CrudManager
    const result = await this.crudManager.create(params);

    // Execute afterQuery hooks
    await this.executeHook("afterQuery", {
      action,
      query: data,
      result,
      entity: this.entity.name,
    });

    // Return result with applied select/include
    return result;
  }

  /** ===============================
   * Find First Method
   * =============================== */
  public async findFirst(params: DriftQueryArgs<T>) {
    const action: DriftQueryAction = "findFirst";

    // Execute beforeQuery hooks
    await this.executeHook("beforeQuery", {
      action,
      query: params,
      entity: this.entity.name,
    });

    // Find data using CrudManager
    const result = await this.crudManager.findFirst(params);

    // Execute afterQuery hooks
    await this.executeHook("afterQuery", {
      action,
      query: params,
      result,
      entity: this.entity.name,
    });

    // Return result with applied select/include
    return result;
  }

  /** ===============================
   * Delete Many Method
   * =============================== */
  public async deleteMany(params: DriftQueryArgs<T>): Promise<DriftDeleteResponse> {
    const action: DriftQueryAction = "deleteMany";

    // Execute beforeQuery hooks
    await this.executeHook("beforeQuery", {
      action,
      query: params,
      entity: this.entity.name,
    });

    // Delete data using CrudManager
    await this.crudManager.remove(params);

    // Execute afterQuery hooks
    await this.executeHook("afterQuery", {
      action,
      query: params,
      result: {
        status: "DELETED",
      },
      entity: this.entity.name,
    });
  }

  /** ===============================
   * Create Many Method
   * =============================== */
  public async createMany<Args extends DriftCreateManyArgs<T>>(query: Args): Promise<DriftCreateAndUpdateResponse<T>[]> {
    const action: DriftQueryAction = "createMany";
    const { data } = query as { data: EntityInput<T>[] };

    // Execute beforeQuery hooks
    await this.executeHook("beforeQuery", {
      action,
      query: data,
      entity: this.entity.name,
    });

    // Save data using CrudManager
    const result = await this.crudManager.createMany(query);

    // Execute afterQuery hooks
    await this.executeHook("afterQuery", {
      action,
      query: data,
      result,
      entity: this.entity.name,
    });

    // Return result with applied select/include
    return result;
  }

  /** ===============================
   * Find Unique Method
   * =============================== */
  public async findUnique(params: DriftQueryArgs<T>) {
    const action: DriftQueryAction = "findUnique";

    // Execute beforeQuery hooks
    await this.executeHook("beforeQuery", {
      action,
      query: params,
      entity: this.entity.name,
    });

    // Get data using CrudManager
    const result = await this.crudManager.findUnique<T>(params);

    // Execute afterQuery hooks
    await this.executeHook("afterQuery", {
      action,
      query: params,
      result,
      entity: this.entity.name,
    });

    // Return result with applied select/include
    return result ?? null;
  }

  /** ===============================
   * Find Many Method
   * =============================== */
  public async findMany(params?: DriftQueryArgs<T>) {
    const action: DriftQueryAction = "findMany";

    // Execute beforeQuery hooks
    await this.executeHook("beforeQuery", {
      action,
      query: params,
      entity: this.entity.name,
    });

    // Get records using CrudManager
    let results = await this.crudManager.findMany<T>(params);

    // Execute afterQuery hooks
    await this.executeHook("afterQuery", {
      action,
      query: params,
      result: results,
      entity: this.entity.name,
    });

    // Return results with applied select/include
    return results;
  }

  /** ===============================
   * Update Method
   * =============================== */
  public async update(params: DriftUpdateArgs<T>) {
    const action: DriftQueryAction = "update";

    // Execute beforeQuery hooks
    await this.executeHook("beforeQuery", {
      action,
      query: params,
      entity: this.entity.name,
    });

    // Get existing data
    const existing = await this.crudManager.findUnique<T>(params);
    if (!existing) {
      throw new Error("Record not found");
    }

    // Update data using CrudManager
    const updated = await this.updateMany({
      where: { id: existing.id },
      data: params.data,
    });    

    // Execute afterQuery hooks
    await this.executeHook("afterQuery", {
      action,
      query: params,
      result: updated,
      entity: this.entity.name,
    });

    const recordUpdated = updated?.[0]

    if(!recordUpdated) {
      throw new Error("Record not found");
    }

    // Return result with applied select/include
    return recordUpdated;
  }

  /** ===============================
   * Update Many Method
   * =============================== */
  public async updateMany(params: DriftUpdateArgs<T>) {
    const action: DriftQueryAction = "updateMany";

    // Execute beforeQuery hooks
    await this.executeHook("beforeQuery", {
      action,
      query: params,
      entity: this.entity.name,
    });

    const keys = this.crudManager.keyManager.schemaToKeys(
      params.where ?? [],
    );

    const indexPrefixes = this.crudManager.keyManager.getIndexPrefixes();

    const items = await this.crudManager.keyManager.keysToItems(
      this.kv,
      keys,
      params.where,
      indexPrefixes,
    );

    if (items.length === 0) {
      return [];
    }

    try {
      const updatedItems = items.map((existingItem) => ({
        key: existingItem.key,
        versionstamp: params.data.versionstamp ?? existingItem.versionstamp,
        value: this.entity.schema.parse({
          ...existingItem.value,
          ...params.data,
        }),
      }));

      const updatedRecords = await this.crudManager.update(
        updatedItems as KvEntryMaybe<Entity<T>>[],
      );

      // Execute afterQuery hooks
      await this.executeHook("afterQuery", {
        action,
        query: params,
        result: updatedRecords,
        entity: this.entity.name,
      });

      // Return results with applied select/include
      return updatedRecords as DriftCreateAndUpdateResponse<T>[];
    } catch {
      throw new DriftError(`An error occurred while updating items`);
    }
  }

  /** ===============================
   * Delete Method
   * =============================== */
  public async delete(query: DriftQueryArgs<T>) {
    const action: DriftQueryAction = "delete";

    // Execute beforeQuery hooks
    await this.executeHook("beforeQuery", { 
      action,
      query,
      entity: this.entity.name,
    });

    // Get existing data
    const existing = await this.crudManager.findFirst<T>(query);
    if (!existing) {
      throw new Error("Record not found");
    }

    // Delete record using CrudManager
    await this.crudManager.remove({
      where: { id: existing.id },
    });

    // Execute afterQuery hooks
    await this.executeHook("afterQuery", {
      entity: this.entity.name,
      action: "delete",
      query,
      result: {
        id: existing.id,
        status: "DELETED",
      },
    });
  }

  /** ===============================
   * Helper Methods
   * =============================== */

  /**
   * Executes entity hooks
   * @private
   */
  private async executeHook(hookName: keyof DriftEntityHooks<T>, params: DriftEntityHookContext) {
    if (this.entity.hooks && this.entity.hooks[hookName]) {
      await this.entity.hooks[hookName]!(params.query, {
        entity: this.entity.name,
        action: params.action,
        query: params.query,
      });
    }
  }

  /** ===============================
   * Real-time Subscription Methods
   * =============================== */

  /**
   * Watch changes on a specific entity record
   * @returns An object containing the watcher promise and cancel function
   */
  /**
   * Watch changes on a specific entity record
   * @param id ID of the record to watch
   * @param params Watch configuration parameters
   * @param callback Function called with changes
   */
  public watch(params: {
    where?: Partial<Entity<T>>;
    callback: (changes: Entity<T> | null) => void;
  }) {
    return this.watcher.watch(
      params,
      params.callback,
    );
  }
}
