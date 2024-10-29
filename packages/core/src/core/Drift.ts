import { Kv } from "@deno/kv";
import { DriftEntityManager } from "../entities/DriftEntity";
import { DriftQueueManager } from "../entities/DriftQueue";
import { DriftEntity } from "../generators/DriftEntity";
import { DriftQueue } from "../generators/DriftQueue";
import { DriftQueryArgs, DriftQueueJob, QueryResponse, WorkerQueueHooks } from "../types";

/**
 * Interface defining lifecycle hooks for Drift operations.
 *
 * @interface DriftHooks
 * @template TEntities - The type of entities involved in the hooks.
 * @template TQueues - The type of queues involved in the hooks.
 */
interface DriftHooks<
  TEntities extends Record<string, DriftEntity<any, any, any>>,
  TQueues extends Record<string, DriftQueue<any, any, any, any, any>>,
> {  
  /** Called when database connection is made. */
  onConnect?: (client: Kv) => Promise<void>;
  /** Called when an error occurs. */
  onError?: (error: Error) => Promise<void>;

  /** Called before executing a query. */
  beforeQuery?: (query: DriftQueryArgs<TEntities[keyof TEntities]>) => Promise<void>;
  /** Called during query execution. */
  onQuery?: (query: DriftQueryArgs<TEntities[keyof TEntities]>) => Promise<void>;
  /** Called after query execution. */
  afterQuery?: (result: QueryResponse<TEntities[keyof TEntities]>) => Promise<void>;

  /** Called before a job is scheduled */
  onJobBeforeSchedule?: (job: DriftQueueJob<TQueues[keyof TQueues]>) => Promise<void>;
  /** Called after a job is scheduled */
  onJobSchedule?: (job: DriftQueueJob<TQueues[keyof TQueues]>) => Promise<void>;
  /** Called when a job encounters an error */
  onJobError?: (error: Error, job: DriftQueueJob<TQueues[keyof TQueues]>) => Promise<void>;
  /** Called after a job is processed */
  onJobEnd?: (result: DriftQueueJob<TQueues[keyof TQueues]>) => Promise<void>;
}

/**
 * Schema definitions for entities and queues with type inference.
 *
 * @interface DriftSchemas
 * @template TEntities - The type of entities defined in the schemas.
 * @template TQueues - The type of queues defined in the schemas.
 */
export interface DriftSchemas<
  TEntities extends Record<string, DriftEntity<any, any, any>>,
  TQueues extends Record<string, DriftQueue<any, any, any, any, any>>,
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
  TEntities extends Record<string, DriftEntity<any, any, any>> = {},
  TQueues extends Record<string, DriftQueue<any, any, any, any, any>> = {}
> {
  /** Deno KV database client instance. */
  client: Kv;
  /** Schema definitions for entities and queues. */
  schemas: DriftSchemas<TEntities, TQueues>;
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
  TEntities extends Record<string, DriftEntity<any, any, any>> = {},
  TQueues extends Record<string, DriftQueue<any, any, any, any, any>> = {},
> {
  private client: Kv;
  private hooks?: DriftHooks<TEntities, TQueues>;
  public entities: {
    [K in keyof TEntities]: DriftEntityManager<TEntities[K]>;
  };
  public queues: {
    [K in Extract<keyof TQueues, string>]: DriftQueueManager<TQueues[K]>;
  };

  /**
   * Creates a new Drift instance.
   *
   * @param {DriftConfig} config - Configuration options for the Drift instance.
   */
  constructor(config: DriftConfig<TEntities, TQueues>) {
    this.client = config.client;
    this.hooks = config.hooks || ({} as DriftHooks<TEntities, TQueues>);
    
    this.entities = {} as {
      [K in keyof TEntities]: DriftEntityManager<TEntities[K]>;
    };

    this.queues = {} as {
      [K in Extract<keyof TQueues, string>]: DriftQueueManager<TQueues[K]>;
    };

    // Register entities
    this.registerEntities(config.schemas?.entities || {});

    // Register queues
    this.registerQueues(config.schemas?.queues || {});

    // Execute connection hooks
    this.initialize();
  }

  
  private registerEntities(entities: TEntities) {
    for (const [name, entityFactory] of Object.entries(entities)) {
      this.entities[name as keyof TEntities] = new DriftEntityManager({
        entity: entityFactory as TEntities[keyof TEntities],
        client: this.client,
      });
    }
  }

  /**
   * Registers queues.
   *
   * @param {Record<string, QueueOptions<any>>} queues - Queue schema definitions.
   */
  private registerQueues(queues: Record<string, DriftQueue<any, any, any, any, any>>) {
    for (const [name, queueFactory] of Object.entries(queues)) {
      this.queues[name as Extract<keyof TQueues, string>] = new DriftQueueManager({
        queue: queueFactory as TQueues[Extract<keyof TQueues, string>],
        client: this.client,
      });
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
    hooks?: WorkerQueueHooks<TQueues[keyof TQueues]>
    options?: {
      timeout?: number;
    }    
  }) {
    // Execute onWorkerStart hook
    if (options?.hooks?.onWorkerStart) {
      await options.hooks.onWorkerStart();
    }

    const tasks: Promise<void>[] = [];
    
    this.client.listenQueue(async (data: { topic: string; data: TQueues[keyof TQueues] }) => {
      const task = this.queues[data.topic as Extract<keyof TQueues, string>].process({        
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

    if (tasks.length > 0) {
      const timeout = options?.options?.timeout;

      if (timeout) {
        await Promise.race([
          Promise.all(tasks),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout exceeded')), timeout))
        ]);
      } else {
        await Promise.all(tasks);
      }
    }

    // Execute onWorkerEnd hook
    if (options?.hooks?.onWorkerEnd) {
      await options.hooks.onWorkerEnd();
    }
  }

  /**
   * Initializes database connection and executes connection lifecycle hooks.
   *
   * @private
   */
  private async initialize() {
    try {
      if (this.hooks?.onConnect) {
        await this.hooks.onConnect(this.client);
      }
    } catch (error) {
      if (this.hooks?.onError) {
        await this.hooks.onError(error);
      } else {
        throw error;
      }
    }
  }
}
