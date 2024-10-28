/**
 * DriftQueue - A queue system for handling asynchronous jobs in Drift KV
 *
 * @description
 * DriftQueue provides a robust queue system for handling background jobs and tasks.
 * It supports job scheduling, processing with configurable concurrency, retries,
 * hooks for job lifecycle events, and plugin integration.
 */

import { Kv } from "@deno/kv";
import { z, ZodSchema } from "zod";
import { Drift } from "../core/Drift";
import { Awaitable, DriftQueueHooks, DriftQueueJobParams, DriftQueueOptions } from "../types";


/**
 * DriftQueue class for managing job queues
 * @template T The type of job data
 */
export class DriftQueue<
  T extends ZodSchema<any>,
  K extends string = string,
  O = Awaitable<ReturnType<DriftQueueOptions<T>["handler"]>>
> {
  public name: string;
  public description?: string;
  public schema: ZodSchema<T>;
  public options?: DriftQueueOptions<T>["options"];
  public hooks?: DriftQueueHooks<T, O>;

  private handler: DriftQueueOptions<T>["handler"];
  private kv: Kv;

  /**
   * Creates a new DriftQueue instance
   * @param drift The Drift KV instance
   * @param options Queue configuration options
   */
  constructor(drift: Drift, options: DriftQueueOptions<T>) {
    this.name = options.name;
    this.description = options.description;
    this.schema = options.schema;
    this.options = options.options;
    this.hooks = options.hooks;
    this.handler = options.handler;
    this.kv = drift.client;
  }

  /** ===============================
   * Schedule Method
   * =============================== */
  /**
   * Schedules a new job in the queue
   * @param params Object containing job name and data
   */
  public async schedule(params: {
    topic: K;
    data: z.output<T>;
    options?: { delay?: number };
  }) {
    const { topic, data, options } = params;

    // Validate data using Zod
    const validatedData = this.schema.parse(data);

    // Execute onBeforeEnqueue hook
    if (this.hooks?.onJobBeforeSchedule) {
      await this.executeHook({
        hookName: "onJobBeforeSchedule",
        args: [validatedData],
      });
    }

    // Enqueue job
    const result = await this.kv.enqueue(
      {
        topic: topic,
        data: validatedData,
      },
      options,
    );

    // Execute onJobSchedule hook
    if (this.hooks?.onJobSchedule) {
      await this.executeHook({
        hookName: "onJobSchedule",
        args: [validatedData],
      });
    }

    return {
      topic: topic,
      success: result.ok,
      versionstamp: result.versionstamp,
    };
  }

  public async registerHooks(hooks: DriftQueueHooks<T>) {
    this.hooks = hooks;
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
    input: DriftQueueJobParams<T, O>
  ) {
    const { data, hooks } = input;
    console.log("Starting job:", data);
  
    try {
      // Execute onJobBeforeSchedule hook
      if (hooks?.onJobBeforeSchedule) {
        console.log("Executing onJobBeforeSchedule hook");
        await this.executeHook({ hookName: "onJobBeforeSchedule", args: [data], workerHooks: hooks });
      }

      // Execute onJobSchedule hook
      if (hooks?.onJobSchedule) {
        console.log("Executing onJobSchedule hook");
        await this.executeHook({ hookName: "onJobSchedule", args: [data], workerHooks: hooks });
      }

      // Execute onJobStart hook
      if (hooks?.onJobStart) {
        console.log("Executing onJobStart hook");
        await this.executeHook({ hookName: "onJobStart", args: [data], workerHooks: hooks });
      }

      console.log("Executing job handler");
  
      // Execute job handler
      await this.handler(data.data);
      
  
      // Execute onJobEnd hook
      if (hooks?.onJobEnd) {
        console.log("Executing onJobEnd hook");
        await this.executeHook({ hookName: "onJobEnd", args: [data], workerHooks: hooks });
      }
    } catch (error) {
      // Execute onJobError hook
      if (hooks?.onJobError) {
        console.log("Executing onJobError hook");
        await this.executeHook({ hookName: "onJobError", args: [error, data], workerHooks: hooks });
      }
    } finally {
      // Execute onJobEnd hook
      if (hooks?.onJobEnd) {
        console.log("Executing onJobEnd hook");
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
    workerHooks?: Partial<DriftQueueHooks<T, O>>;
  }) {
    const hooks = { ...this.hooks, ...workerHooks };
    console.log("hooks", hooks);

    if (hooks[hookName]) {
      const hookFunctions = Array.isArray(hooks[hookName]) ? hooks[hookName] : [hooks[hookName]];
      for (const hookFunction of hookFunctions) {
        await (hookFunction as (...args: unknown[]) => Promise<void>)(...args);
      }
    }
  }
}
