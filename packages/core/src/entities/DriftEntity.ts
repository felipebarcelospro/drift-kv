import { Kv, KvEntryMaybe } from "@deno/kv";
import { z } from "zod";
import { CrudManager } from "../core/CrudManager";
import { Drift } from "../core/Drift";
import { DriftPlugin } from "../core/Plugin";
import { DriftWatcher } from "../core/Watcher";
import { DriftError } from "../errors";
import {
  DriftCreateAndUpdateResponse,
  DriftCreateArgs,
  DriftCreateManyArgs,
  DriftDeleteResponse,
  DriftEntityHooks,
  DriftEntityMethods,
  DriftEntityOptions,
  DriftQueryAction,
  DriftQueryArgs,
  DriftTableDefinition,
  DriftUpdateArgs,
  WithMaybeVersionstamp
} from "../types";
import { schemaToKeys } from "../utils";

/**
 * Main entity class that provides CRUD operations and real-time subscriptions
 * @see {@link https://github.com/yourusername/drift/blob/main/README.md#entity Entity Documentation}
 */
export class DriftEntity<
  T extends DriftEntityOptions<any>,
> implements DriftEntityMethods<T> {
  private name: string;
  private description?: string;
  private options?: T['options'];  
  private hooks?: T['hooks'];
  private metadata: DriftTableDefinition<T['schema']>;
  private drift: Drift;
  private plugins: DriftPlugin[];
  private watcher: DriftWatcher<T>;
  private kv: Kv;
  private crudManager: CrudManager;

  constructor(drift: Drift, entity: DriftEntityOptions<any>) {
    this.drift = drift;
    this.plugins = drift.plugins;
    this.name = entity.name;
    this.description = entity.description;
    this.hooks = entity.hooks;
    this.kv = drift.client;
    this.options = entity.options;

    this.metadata = {
      schema: entity.schema,
      relations: entity.relations,
    };

    this.watcher = new DriftWatcher<T>(this.drift);
    this.crudManager = new CrudManager(this.kv);
  }

  /** ===============================
   * Create Method
   * =============================== */
  public async create(params: DriftCreateArgs<T>) {
    const { data } = params;
    const action: DriftQueryAction = "create";

    // Execute beforeQuery hooks
    await this.executeHook("beforeQuery", { action, data: data });

    // Intercept query via plugins
    await this.executePluginIntercepts("beforeExecute", {
      action,
      data: data,
    });

    // Save data using CrudManager
    const result = await this.crudManager.create(
      this.name,
      this.metadata,
      params,
    );

    // Execute afterQuery hooks
    await this.executeHook("afterQuery", result);

    // Intercept query via plugins
    await this.executePluginIntercepts("afterExecute", result);

    // Return result with applied select/include
    return result;
  }

  /** ===============================
   * Find First Method
   * =============================== */
  public async findFirst(params: DriftQueryArgs<T>) {
    const action: DriftQueryAction = "findFirst";

    // Execute beforeQuery hooks
    await this.executeHook("beforeQuery", { action, params });

    // Intercept query via plugins
    await this.executePluginIntercepts("beforeExecute", {
      action,
      params,
    });

    // Find data using CrudManager
    const result = await this.crudManager.findFirst(
      this.name,
      this.metadata,
      params,
    );

    // Execute afterQuery hooks
    await this.executeHook("afterQuery", result);

    // Intercept query via plugins
    await this.executePluginIntercepts("afterExecute", result);

    // Return result with applied select/include
    return result;
  }

  /** ===============================
   * Delete Many Method
   * =============================== */
  public async deleteMany(params: DriftQueryArgs<T>): Promise<DriftDeleteResponse> {
    const action: DriftQueryAction = "deleteMany";

    // Execute beforeQuery hooks
    await this.executeHook("beforeQuery", { action, params });

    // Intercept query via plugins
    await this.executePluginIntercepts("beforeExecute", {
      action,
      params,
    });

    // Delete data using CrudManager
    await this.crudManager.remove(
      this.name,
      this.metadata,
      params,
    );

    // Execute afterQuery hooks
    await this.executeHook("afterQuery", {
      status: "DELETED",
    });

    // Intercept query via plugins
    await this.executePluginIntercepts("afterExecute", {
      status: "DELETED",
    });

    // Return result
    return {
      status: 'DELETED'
    };
  }

  /** ===============================
   * Create Many Method
   * =============================== */
  public async createMany<Args extends DriftCreateManyArgs<T>>(params: Args): Promise<DriftCreateAndUpdateResponse<T>[]> {
    const { data } = params;
    const action: DriftQueryAction = "createMany";

    // Apply timestamps if enabled
    if (this.options?.timestamps) {
      const timestamp = new Date().toISOString();
      for (const item of data) {
        (item as any).createdAt = timestamp;
        (item as any).updatedAt = timestamp;
      }
    }

    // Execute beforeQuery hooks
    await this.executeHook("beforeQuery", { action, data });

    // Intercept query via plugins
    await this.executePluginIntercepts("beforeExecute", {
      action,
      data,
    });

    // Save data using CrudManager
    const result = await this.crudManager.createMany(
      this.name,
      this.metadata,
      params,
    );

    // Execute afterQuery hooks
    await this.executeHook("afterQuery", result);

    // Intercept query via plugins
    await this.executePluginIntercepts("afterExecute", result);

    // Return result with applied select/include
    return result;
  }

  /** ===============================
   * Find Unique Method
   * =============================== */
  public async findUnique(params: DriftQueryArgs<T>) {
    const action: DriftQueryAction = "findUnique";

    // Execute beforeQuery hooks
    await this.executeHook("beforeQuery", { action, params });

    // Intercept query via plugins
    await this.executePluginIntercepts("beforeExecute", { action, params });

    // Get data using CrudManager
    const result = await this.crudManager.findUnique<typeof this.metadata>(
      this.name,
      this.metadata,
      params,
    );

    // Execute afterQuery hooks
    await this.executeHook("afterQuery", result);

    // Intercept query via plugins
    await this.executePluginIntercepts("afterExecute", result);

    // Return result with applied select/include
    return result ?? null;
  }

  /** ===============================
   * Find Many Method
   * =============================== */
  public async findMany(params: DriftQueryArgs<T>) {
    const action: DriftQueryAction = "findMany";

    // Execute beforeQuery hooks
    await this.executeHook("beforeQuery", { action, params });

    // Intercept query via plugins
    await this.executePluginIntercepts("beforeExecute", { action, params });

    // Get records using CrudManager
    let results = await this.crudManager.findMany<typeof this.metadata>(
      this.name,
      this.metadata,
      params,
    );

    // Execute afterQuery hooks
    await this.executeHook("afterQuery", results);

    // Intercept query via plugins
    await this.executePluginIntercepts("afterExecute", results);

    // Return results with applied select/include
    return results;
  }

  /** ===============================
   * Update Method
   * =============================== */
  public async update(params: DriftUpdateArgs<T>) {
    const action: DriftQueryAction = "update";

    // Execute beforeQuery hooks
    await this.executeHook("beforeQuery", { action, params });

    // Intercept query via plugins
    await this.executePluginIntercepts("beforeExecute", { action, params });

    // Get existing data
    const existing = await this.crudManager.findUnique<typeof this.metadata>(
      this.name,
      this.metadata,
      params,
    );

    if (!existing) {
      throw new Error("Record not found");
    }

    // Update data using CrudManager
    const updated = await this.updateMany({
      where: { id: existing.id },
      data: params.data,
    });

    // Execute afterQuery hooks
    await this.executeHook("afterQuery", updated);

    // Intercept query via plugins
    await this.executePluginIntercepts("afterExecute", updated);

    // Return result with applied select/include
    return updated[0];
  }

  /** ===============================
   * Update Many Method
   * =============================== */
  public async updateMany(params: DriftUpdateArgs<T>) {
    const action: DriftQueryAction = "updateMany";

    // Execute beforeQuery hooks
    await this.executeHook("beforeQuery", { action, params });

    // Intercept query via plugins
    await this.executePluginIntercepts("beforeExecute", { action, params });

    const keys = schemaToKeys(
      this.name,
      this.metadata.schema as z.ZodObject<z.ZodRawShape, "strip", z.ZodTypeAny, { [x: string]: any; }, { [x: string]: any; }>,
      params.where ?? [],
    );
    const items = await this.crudManager.keyManager.keysToItems(
      this.kv,
      this.name,
      keys,
      params.where,
      this.crudManager.keyManager.getIndexPrefixes(
        this.name,
        this.metadata.schema,
      ),
    );

    if (items.length === 0) {
      return;
    }

    try {
      const updatedItems = items.map((existingItem) => ({
        key: existingItem.key,
        value: this.metadata.schema.parse({
          ...existingItem.value,
          ...params.data,
        }),
        versionstamp: params.data.versionstamp ?? existingItem.versionstamp,
      }));

      const updatedRecords = await this.crudManager.update(
        updatedItems as KvEntryMaybe<z.output<typeof this.metadata.schema>>[],
      );

      // Execute afterQuery hooks
      await this.executeHook("afterQuery", updatedRecords);

      // Intercept query via plugins
      await this.executePluginIntercepts("afterExecute", updatedRecords);

      // Return results with applied select/include
      return updatedRecords;
    } catch {
      throw new DriftError(`An error occurred while updating items`);
    }
  }

  /** ===============================
   * Delete Method
   * =============================== */
  public async delete(params: DriftQueryArgs<T>) {
    const action: DriftQueryAction = "delete";

    // Execute beforeQuery hooks
    await this.executeHook("beforeQuery", { action, params });

    // Intercept query via plugins
    await this.executePluginIntercepts("beforeExecute", { action, params });

    // Get existing data
    const existing = await this.crudManager.findFirst<typeof this.metadata>(
      this.name,
      this.metadata,
      params,
    );
    if (!existing) {
      return null;
    }

    // Delete record using CrudManager
    await this.crudManager.remove(this.name, this.metadata, {
      where: { id: existing.id },
    });

    // Execute afterQuery hooks
    await this.executeHook("afterQuery", {
      id: existing.id,
      status: "DELETED",
    });

    // Intercept query via plugins
    await this.executePluginIntercepts("afterExecute", {
      id: existing.id,
      status: "DELETED",
    });

    return null;
  }

  /** ===============================
   * Helper Methods
   * =============================== */

  /**
   * Executes entity hooks
   * @private
   */
  private async executeHook(hookName: keyof DriftEntityHooks, params: any) {
    if (this.hooks && this.hooks[hookName]) {
      await this.hooks[hookName]!(params, this);
    }
  }

  /**
   * Executes plugin intercepts
   * @private
   */
  private async executePluginIntercepts(
    interceptName: "beforeExecute" | "afterExecute",
    data: any,
  ) {
    for (const plugin of this.plugins) {
      if (plugin.query) {
        const result = await plugin.query(data.action, data, this);

        if (result !== undefined) {
          return result;
        }
      }
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
    where?: Partial<
      WithMaybeVersionstamp<z.output<typeof this.metadata.schema>>
    >;
    callback: (changes: z.output<typeof this.metadata.schema> | null) => void;
  }) {
    return this.watcher.watch(
      this.name,
      this.metadata,
      params,
      params.callback,
    );
  }
}
