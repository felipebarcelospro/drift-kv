import { Kv } from "@deno/kv";
import { DriftEntity } from "../entities/DriftEntity";
import { DriftQueue } from "../entities/DriftQueue";
import { Awaitable, DriftEntityOptions, DriftQueryArgs, DriftQueueHooks, DriftQueueJob, DriftQueueOptions, QueryResponse } from "../types";
import { DriftPlugin } from "./Plugin";


/**
 * Interface defining lifecycle hooks for Drift operations.
 *
 * @interface DriftHooks
 * @template TEntities - The type of entities involved in the hooks.
 * @template TQueues - The type of queues involved in the hooks.
 */
interface DriftHooks<
  TEntities extends Record<string, DriftEntityOptions<any>>,
  TQueues extends Record<string, DriftQueueOptions<any>>,
> {
  /** Called before establishing database connection. */
  beforeConnect?: () => Promise<void>;
  /** Called after database connection is established. */
  afterConnect?: (client: Kv) => Promise<void>;
  /** Called when database connection is made. */
  onConnect?: (client: Kv) => Promise<void>;
  /** Called when closing database connection. */
  onEnd?: () => Promise<void>;
  /** Called when an error occurs. */
  onError?: (error: Error) => Promise<void>;

  /** Called before executing a query. */
  beforeQuery?: (query: DriftQueryArgs<TEntities[keyof TEntities]["schema"]>) => Promise<void>;
  /** Called during query execution. */
  onQuery?: (query: DriftQueryArgs<TEntities[keyof TEntities]["schema"]>) => Promise<void>;
  /** Called after query execution. */
  afterQuery?: (result: QueryResponse<TEntities[keyof TEntities]["schema"], any>) => Promise<void>;

  /** Called before starting a transaction. */
  beforeTransaction?: () => Promise<void>;
  /** Called after completing a transaction. */
  afterTransaction?: () => Promise<void>;

  /** Called before a job is scheduled */
  onJobBeforeSchedule?: (job: DriftQueueJob<InferQueue<TQueues[keyof TQueues]>['schema'], ReturnType<TQueues[keyof TQueues]['handler']>>) => Promise<void>;
  /** Called after a job is scheduled */
  onJobSchedule?: (job: DriftQueueJob<InferQueue<TQueues[keyof TQueues]>['schema'], ReturnType<TQueues[keyof TQueues]['handler']>>) => Promise<void>;
  /** Called when a job encounters an error */
  onJobError?: (error: Error, job: DriftQueueJob<InferQueue<TQueues[keyof TQueues]>['schema'], ReturnType<TQueues[keyof TQueues]['handler']>>) => Promise<void>;
  /** Called after a job is processed */
  onJobEnd?: (result: DriftQueueJob<InferQueue<TQueues[keyof TQueues]>['schema'], ReturnType<TQueues[keyof TQueues]['handler']>>) => Promise<void>;
}

/**
 * Infer queue type from schema.
 *
 * @template TQueues - The type of queues to infer the queue from.
 * @template K - The key of the queue in TQueues.
 */
type InferQueue<T> = T extends DriftQueueOptions<infer U, any> ? U : never;

/**
 * Schema definitions for entities and queues with type inference.
 *
 * @interface DriftSchemas
 * @template TEntities - The type of entities defined in the schemas.
 * @template TQueues - The type of queues defined in the schemas.
 */
export interface DriftSchemas<
  TEntities extends Record<string, DriftEntityOptions<any>>,
  TQueues extends Record<string, DriftQueueOptions<any>>,
> {
  entities: {
    [K in keyof TEntities]: TEntities[K];
  };
  queues: {
    [K in keyof TQueues]: TQueues[K];
  };
}

/**
 * Configuration options for initializing Drift.
 *
 * @interface DriftConfig
 * @template TEntities - The type of entities for the Drift instance.
 * @template TQueues - The type of queues for the Drift instance.
 * @template TPlugins - The type of plugins for the Drift instance.
 */
interface DriftConfig<
  TEntities extends Record<string, DriftEntityOptions<any>> = {},
  TQueues extends Record<string, DriftQueueOptions<any>> = {},
  TPlugins extends DriftPlugin[] = DriftPlugin[],
> {
  /** Deno KV database client instance. */
  client: Kv;
  /** Schema definitions for entities and queues. */
  schemas: DriftSchemas<TEntities, TQueues>;
  /** Array of plugins to extend functionality. */
  plugins?: TPlugins;
  /** Lifecycle hooks. */
  hooks?: DriftHooks<TEntities, TQueues>;
}

/**
 * Main Drift class that manages database connections, entities, queues, and plugins.
 *
 * @class Drift
 * @template TEntities - The type of entities managed by Drift.
 * @template TQueues - The type of queues managed by Drift.
 * @template TPlugins - The type of plugins used by Drift.
 */
export class Drift<
  TEntities extends Record<string, DriftEntityOptions<any>> = {},
  TQueues extends Record<string, DriftQueueOptions<any>> = {},
  TPlugins extends DriftPlugin[] = DriftPlugin[],
> {
  /** Deno KV database client instance. */
  public client: Kv;

  /** Array of active plugins. */
  public plugins: TPlugins;

  /** Map of registered entities with inferred types. */
  public entities: {
    [K in keyof TEntities]: DriftEntity<TEntities[K]>;
  };

  /** Map of registered queues with inferred types. */
  public queues: {
    [K in Extract<keyof TQueues, string>]: DriftQueue<TQueues[K]["schema"], K, Awaitable<ReturnType<TQueues[K]["handler"]>>>;
  };

  /** Registered lifecycle hooks. */
  public hooks?: DriftHooks<TEntities, TQueues>;

  /**
   * Creates a new Drift instance.
   *
   * @param {DriftConfig} config - Configuration options for the Drift instance.
   */
  constructor(config: DriftConfig<TEntities, TQueues, TPlugins>) {
    this.client = config.client;
    this.plugins = config.plugins || ([] as TPlugins);
    this.hooks = config.hooks || ({} as DriftHooks<TEntities, TQueues>);
    
    this.entities = {} as {
      [K in keyof TEntities]: DriftEntity<TEntities[K]>;
    };

    this.queues = {} as {
      [K in Extract<keyof TQueues, string>]: DriftQueue<TQueues[K]["schema"], K, Awaitable<ReturnType<TQueues[K]["handler"]>>>;
    };

    // Initialize plugins
    this.plugins.forEach((plugin) => plugin.initialize(this));

    // Register entities
    this.registerEntities(config.schemas?.entities || {});

    // Register queues
    this.registerQueues(config.schemas?.queues || {});

    // Execute connection hooks
    this.initialize();
  }

  /**
   * Registers entities.
   *
   * @param {Record<string, EntityOptions<any>>} entities - Entity schema definitions.
   */
  private registerEntities(entities: Record<string, DriftEntityOptions<any>>) {
    for (const [name, entityFactory] of Object.entries(entities)) {
      this.entities[name as keyof TEntities] = new DriftEntity(
        this,
        entityFactory,
      );
    }
  }

  /**
   * Registers queues.
   *
   * @param {Record<string, QueueOptions<any>>} queues - Queue schema definitions.
   */
  private registerQueues(queues: Record<string, DriftQueueOptions<any>>) {
    for (const [name, queueFactory] of Object.entries(queues)) {
      this.queues[name as Extract<keyof TQueues, string>] = new DriftQueue(this, queueFactory);
    }
  }

  /**
   * Initializes database connection and executes connection lifecycle hooks.
   *
   * @private
   */
  private async initialize() {
    try {
      if (this.hooks.beforeConnect) {
        await this.hooks.beforeConnect();
      }
      if (this.hooks.onConnect) {
        await this.hooks.onConnect(this.client);
      }
      if (this.hooks.afterConnect) {
        await this.hooks.afterConnect(this.client);
      }
    } catch (error) {
      if (this.hooks.onError) {
        await this.hooks.onError(error);
      } else {
        throw error;
      }
    }
  }

  /**
   * Closes database connection and executes cleanup hooks.
   */
  public async close() {
    if (this.hooks.onEnd) {
      await this.hooks.onEnd();
    }
  }

  /**
   * Executes a specific lifecycle hook.
   *
   * @param {keyof DriftHooks<TEntities, TQueues>} hookName - Name of the hook to execute.
   * @param {...any[]} args - Arguments to pass to the hook.
   */
  public async executeHook(
    hookName: keyof DriftHooks<TEntities, TQueues>,
    ...args: any[]
  ) {
    // Execute hooks defined in Drift
    if (this.hooks[hookName]) {
      const hook = this.hooks[hookName] as (arg0: any, job: any) => Promise<void>;
      if (hook) {
        await hook(...(args as [any, any]));
      }
    }

    // Execute hooks defined in plugins
    for (const plugin of this.plugins) {
      if (plugin.hooks && plugin.hooks[hookName]) {
        const pluginHook = plugin.hooks[hookName];
        if (pluginHook) {
          await pluginHook(...args);
        }
      }
    }
  }

  /** ===============================
   * Process Method
   * =============================== */
  /**
   * Processes jobs in the queue
   * @param options Processing configuration options
   */
  public async process(options?: {
    topics?: (keyof TQueues)[];
    options?: {
      timeout?: number;
    }
    hooks?: {
      onWorkerStart?: () => Promise<void>;
      onWorkerEnd?: () => Promise<void>;
      onWorkerError?: (error: Error) => Promise<void>;
    } & DriftQueueHooks<InferQueue<TQueues[keyof TQueues]>>
  }) {
    // Execute onWorkerStart hook
    if (options?.hooks?.onWorkerStart) {
      await options.hooks.onWorkerStart();
    }

    const tasks: Promise<void>[] = [];
    
    this.client.listenQueue(async (data: { topic: string; data: InferQueue<TQueues[keyof TQueues]> }) => {
      const task = this.queues[data.topic as Extract<keyof TQueues, string>].process({        
        options: {
          timeout: options?.options?.timeout,
        },
        hooks: {
          onJobBeforeSchedule: options?.hooks?.onJobBeforeSchedule,
          onJobSchedule: options?.hooks?.onJobSchedule,
          onJobStart: options?.hooks?.onJobStart,
          onJobEnd: options?.hooks?.onJobEnd,
          onJobError: options?.hooks?.onJobError,
        },
        data: {
          topic: data.topic,
          data: data.data,
        },
      });

      tasks.push(task);
    });

    console.log("tasks", tasks);

    if (tasks.length > 0) {
      await Promise.all(tasks);
    }

    // Execute onWorkerEnd hook
    if (options?.hooks?.onWorkerEnd) {
      await options.hooks.onWorkerEnd();
    }
  }
}
