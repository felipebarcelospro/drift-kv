/**
 * DriftQueue - A queue system for handling asynchronous jobs in Drift KV
 *
 * @description
 * DriftQueue provides a robust queue system for handling background jobs and tasks.
 * It supports job scheduling, processing with configurable concurrency, retries,
 * hooks for job lifecycle events, and plugin integration.
 */

import { ZodSchema } from "zod";
import { Drift } from "../core/Drift";
import { DriftPlugin } from "../core/Plugin";

/**
 * Queue lifecycle hooks for customizing behavior at different stages
 */
interface QueueHooks<T> {
  /** Called before a job is enqueued */
  onBeforeEnqueue?: (data: T) => Promise<void>;
  /** Called when a job starts processing */
  onStart?: (data: T) => Promise<void>;
  /** Called when a job completes successfully */
  onSuccess?: (data: T) => Promise<void>;
  /** Called when a job encounters an error */
  onError?: (error: Error, data: T) => Promise<void>;
  /** Called when job processing ends (success or failure) */
  onEnd?: () => Promise<void>;
}

/**
 * Configuration options for creating a new queue
 */
interface QueueOptions<T> {
  /** Unique name identifier for the queue */
  name: string;
  /** Optional description of the queue's purpose */
  description?: string;
  /** Zod schema for validating job data */
  schema: ZodSchema<T>;
  /** Additional queue configuration options */
  options?: {
    /** Number of retry attempts for failed jobs */
    retryAttempts?: number;
    /** Timeout duration for job processing */
    timeout?: number;
  };
  /** Lifecycle hooks for queue events */
  hooks?: QueueHooks<T>;
  /** Main job processing function */
  handler: (data: T) => Promise<void>;
}

/**
 * DriftQueue class for managing job queues
 * @template T The type of job data
 */
export class DriftQueue<T> {
  public name: string;
  public description?: string;
  public schema: ZodSchema<T>;
  public options?: QueueOptions<T>["options"];
  public hooks?: QueueHooks<T>;

  private drift: Drift;
  private client: any;
  private plugins: DriftPlugin[];
  private handler: QueueOptions<T>["handler"];

  /**
   * Creates a new DriftQueue instance
   * @param drift The Drift KV instance
   * @param options Queue configuration options
   */
  constructor(drift: Drift, options: QueueOptions<T>) {
    this.drift = drift;
    this.client = drift.client;
    this.plugins = drift.plugins;
    this.name = options.name;
    this.description = options.description;
    this.schema = options.schema;
    this.options = options.options;
    this.hooks = options.hooks;
    this.handler = options.handler;
  }

  /** ===============================
   * Schedule Method
   * =============================== */
  /**
   * Schedules a new job in the queue
   * @param params Object containing job name and data
   */
  public async schedule(params: { job: string; data: T }) {
    const { data } = params;

    // Validate data using Zod
    const validatedData = this.schema.parse(data);

    // Execute onBeforeEnqueue hook
    if (this.hooks?.onBeforeEnqueue) {
      await this.hooks.onBeforeEnqueue(validatedData);
    }

    // Intercept before enqueue via plugins
    await this.executePluginIntercepts("beforeEnqueue", validatedData);

    // Enqueue job
    const key = ["queue", this.name, Date.now().toString()];
    await this.client.set(key, validatedData);

    // Execute onEnd hook
    if (this.hooks?.onEnd) {
      await this.hooks.onEnd();
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
    concurrency?: number;
    timeout?: number;
    onWorkerStart?: () => Promise<void>;
    onWorkerEnd?: () => Promise<void>;
    onWorkerError?: (error: Error) => Promise<void>;
    onJobStart?: (job: T) => Promise<void>;
  }) {
    const concurrency = options?.concurrency || 1;

    // Execute onWorkerStart hook
    if (options?.onWorkerStart) {
      await options.onWorkerStart();
    }

    const iterator = this.client.list({ prefix: ["queue", this.name] });

    const tasks: Promise<void>[] = [];
    for await (const res of iterator) {
      const task = this.processJob(res.key, res.value, options);
      tasks.push(task);

      if (tasks.length >= concurrency) {
        await Promise.all(tasks);
        tasks.length = 0;
      }
    }

    if (tasks.length > 0) {
      await Promise.all(tasks);
    }

    // Execute onWorkerEnd hook
    if (options?.onWorkerEnd) {
      await options.onWorkerEnd();
    }
  }

  /** ===============================
   * Helper Methods
   * =============================== */

  /**
   * Processes a single job
   * @param key The job's key in the queue
   * @param data The job data
   * @param options Processing options for the job
   */
  private async processJob(
    key: any[],
    data: T,
    options?: {
      timeout?: number;
      onWorkerError?: (error: Error) => Promise<void>;
      onJobStart?: (job: T) => Promise<void>;
    },
  ) {
    try {
      // Execute onJobStart hook
      if (options?.onJobStart) {
        await options.onJobStart(data);
      }

      // Execute onStart hook
      if (this.hooks?.onStart) {
        await this.hooks.onStart(data);
      }

      // Intercept before job execution via plugins
      await this.executePluginIntercepts("beforeExecute", data);

      // Execute job handler
      await this.handler(data);

      // Intercept after job execution via plugins
      await this.executePluginIntercepts("afterExecute", data);

      // Execute onSuccess hook
      if (this.hooks?.onSuccess) {
        await this.hooks.onSuccess(data);
      }

      // Remove job from queue
      await this.client.delete(key);
    } catch (error) {
      // Execute onError hook
      if (this.hooks?.onError) {
        await this.hooks.onError(error, data);
      }

      // Handle retries if configured
      const retryAttempts = this.options?.retryAttempts || 0;
      const retryKey = [...key, "retries"];
      const retries = (await this.client.get(retryKey)).value || 0;

      if (retries < retryAttempts) {
        await this.client.set(retryKey, retries + 1);
      } else {
        // Exceeded retry attempts, move job to failed queue or handle accordingly
        await this.client.delete(key);
      }

      // Execute onWorkerError hook
      if (options?.onWorkerError) {
        await options.onWorkerError(error);
      }
    } finally {
      // Execute onEnd hook
      if (this.hooks?.onEnd) {
        await this.hooks.onEnd();
      }
    }
  }

  /**
   * Executes plugin intercepts for queue operations
   * @param interceptName The name of the intercept to execute
   * @param data The data to pass to the intercept
   */
  private async executePluginIntercepts(
    interceptName: "beforeExecute" | "afterExecute" | "beforeEnqueue",
    data: any,
  ) {
    for (const plugin of this.plugins) {
      if (plugin.query) {
        // Execute plugin query with proper action and params
        const result = await plugin.query(
          "create", // Using create as default action for queue
          data, // Query parameters
          this, // Context is the queue instance
        );

        if (result !== undefined) {
          return result; // Return any results from plugin query
        }
      }
    }
  }
}
