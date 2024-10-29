/**
 * DriftQueue - A queue system for handling asynchronous jobs in Drift KV
 *
 * @description
 * DriftQueue provides a robust queue system for handling background jobs and tasks.
 * It supports job scheduling, processing with configurable concurrency, retries,
 * hooks for job lifecycle events, and plugin integration.
 */

import { Kv } from "@deno/kv";
import { DriftQueue } from "../generators/DriftQueue";
import { DriftQueueHooks, DriftQueueWorkerParams, QueueInput } from "../types";

/**
 * DriftQueue class for managing job queues
 * @template T The type of job data
 */
export class DriftQueueManager<
  T extends DriftQueue<any, any, any, any, any>,
> {
  kv: Kv;
  queue: T;

  /**
   * Creates a new DriftQueue instance
   * @param drift The Drift KV instance
   * @param options Queue configuration options
   */
  constructor({
    queue,
    client,
  }: {
    queue: T;
    client: Kv;
  }) {
    this.queue = queue;
    this.kv = client;
  }

  /** ===============================
   * Schedule Method
   * =============================== */
  /**
   * Schedules a new job in the queue
   * @param params Object containing job name and data
   */
  public async schedule(params: {
    data: QueueInput<T['schema']>;
    options?: { delay?: number };
  }) {
    const { data, options } = params;

    // Validate data using Zod
    const validatedData = this.queue.schema.parse(data);

    // Execute onBeforeEnqueue hook
    if (this.queue.hooks?.onJobBeforeSchedule) {
      await this.executeHook({
        hookName: "onJobBeforeSchedule",
        args: [validatedData],
      });
    }

    // Enqueue job
    const result = await this.kv.enqueue(
      {
        topic: this.queue.name,
        data: validatedData,
      },
      options,
    );

    // Execute onJobSchedule hook
    if (this.queue.hooks?.onJobSchedule) {
      await this.executeHook({
        hookName: "onJobSchedule",
        args: [validatedData],
      });
    }

    return {
      id: data.id,
      status: result.ok ? "SCHEDULED" : "ERROR",
      topic: this.queue.name
    };
  }

  public async registerHooks(hooks: DriftQueueHooks<T>) {
    this.queue.hooks = hooks;
  }

  /** ===============================
   * Helper Methods
   * =============================== */

  /**
   * Processes a single job
   * @param data The job data
   * @param options Processing options for the job
   */
  public async process(
    input: DriftQueueWorkerParams<{
      handler: T['handler'],
      schema: T['schema'],
    }>
  ) {
    const { data, hooks } = input;
  
    try {
      // Execute onJobBeforeSchedule hook
      if (hooks?.onJobBeforeSchedule) {
        await this.executeHook({ hookName: "onJobBeforeSchedule", args: [data], workerHooks: hooks });
      }

      // Execute onJobSchedule hook
      if (hooks?.onJobSchedule) {
        await this.executeHook({ hookName: "onJobSchedule", args: [data], workerHooks: hooks });
      }

      // Execute onJobStart hook
      if (hooks?.onJobStart) {
        await this.executeHook({ hookName: "onJobStart", args: [data], workerHooks: hooks });
      }
  
      // Execute job handler
      await this.queue.handler(data.data);
      
  
      // Execute onJobEnd hook
      if (hooks?.onJobEnd) {
        await this.executeHook({ hookName: "onJobEnd", args: [data], workerHooks: hooks });
      }
    } catch (error) {
      // Execute onJobError hook
      if (hooks?.onJobError) {
        await this.executeHook({ hookName: "onJobError", args: [error, data], workerHooks: hooks });
      }
    } finally {
      // Execute onJobEnd hook
      if (hooks?.onJobEnd) {
        await this.executeHook({ hookName: "onJobEnd", args: [data], workerHooks: hooks });
      }
    }
  }

  /**
   * Executes a specific hook if it exists
   * @param hookName The name of the hook to execute
   * @param args Arguments to pass to the hook
   */
  private async executeHook({
    hookName,
    args,
    workerHooks
  }: {
    hookName: string;
    args: unknown[];
    workerHooks?: Partial<DriftQueueHooks<T>>;
  }) {
    const hooks = { ...this.queue.hooks, ...workerHooks };
    if (hooks[hookName]) {
      const hookFunctions = Array.isArray(hooks[hookName]) ? hooks[hookName] : [hooks[hookName]];
      for (const hookFunction of hookFunctions) {
        await (hookFunction as (...args: unknown[]) => Promise<void>)(...args);
      }
    }
  }
}
