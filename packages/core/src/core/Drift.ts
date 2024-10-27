/**
 * Core module for the Drift KV system.
 * @module Drift
 */

import { DriftEntity } from "../entities/DriftEntity";
import { DriftPlugin } from "./Plugin";

/**
 * Interface defining lifecycle hooks for Drift operations
 * @interface DriftHooks
 */
interface DriftHooks {
  /** Called before establishing database connection */
  beforeConnect?: () => Promise<void>;
  /** Called after database connection is established */
  afterConnect?: (client: any) => Promise<void>;
  /** Called when database connection is made */
  onConnect?: (client: any) => Promise<void>;
  /** Called when closing database connection */
  onEnd?: () => Promise<void>;
  /** Called when an error occurs */
  onError?: (error: Error) => Promise<void>;

  /** Called before executing a query */
  beforeQuery?: (query: any) => Promise<void>;
  /** Called during query execution */
  onQuery?: (query: any) => Promise<void>;
  /** Called after query execution */
  afterQuery?: (result: any) => Promise<void>;

  /** Called before starting a transaction */
  beforeTransaction?: () => Promise<void>;
  /** Called after completing a transaction */
  afterTransaction?: () => Promise<void>;
}

/**
 * Configuration options for initializing Drift
 * @interface DriftConfig
 */
interface DriftConfig {
  /** Deno KV database client instance */
  client: any;
  /** Array of plugins to extend functionality */
  plugins?: DriftPlugin[];
  /** Schema definitions for entities and queues */
  schemas?: {
    /** Entity schema factories */
    entities?: { [key: string]: (drift: Drift) => DriftEntity<any> };
    /** Queue schema factories */
    queues?: { [key: string]: (drift: Drift) => DriftEntity<any> };
  };
  /** Lifecycle hooks */
  hooks?: DriftHooks;
}

/**
 * Main Drift class that manages database connections, entities, queues and plugins
 * @class Drift
 */
export class Drift {
  /** Deno KV database client instance */
  public client: any;
  /** Array of active plugins */
  public plugins: DriftPlugin[];
  /** Map of registered entities */
  public entities: { [key: string]: DriftEntity<any> } = {};
  /** Map of registered queues */
  public queues: { [key: string]: DriftEntity<any> } = {};
  /** Registered lifecycle hooks */
  public hooks: DriftHooks;

  /**
   * Creates a new Drift instance
   * @param {DriftConfig} config - Configuration options
   */
  constructor(config: DriftConfig) {
    this.client = config.client;
    this.plugins = config.plugins || [];
    this.hooks = config.hooks || {};

    // Initialize plugins
    this.plugins.forEach((plugin) => plugin.initialize(this));

    // Register entities
    if (config.schemas?.entities) {
      for (const [name, entityFactory] of Object.entries(
        config.schemas.entities,
      )) {
        this.entities[name] = entityFactory(this);
      }
    }

    // Register queues
    if (config.schemas?.queues) {
      for (const [name, queueFactory] of Object.entries(
        config.schemas.queues,
      )) {
        this.queues[name] = queueFactory(this);
      }
    }

    // Execute connection hooks
    this.initialize();
  }

  /**
   * Initializes database connection and executes connection lifecycle hooks
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
   * Closes database connection and executes cleanup hooks
   */
  public async close() {
    if (this.hooks.onEnd) {
      await this.hooks.onEnd();
    }
    // Close Deno KV client if needed
    // For Deno KV, explicit closing is not required
  }

  /**
   * Executes a specific lifecycle hook
   * @param {keyof DriftHooks} hookName - Name of the hook to execute
   * @param {...any[]} args - Arguments to pass to the hook
   */
  public async executeHook(hookName: keyof DriftHooks, ...args: any[]) {
    // Execute hooks defined in Drift
    if (this.hooks && this.hooks[hookName]) {
      const hook = this.hooks[hookName];
      if (hook) {
        await hook.apply(this, args);
      }
    }

    // Execute hooks defined in plugins
    for (const plugin of this.plugins) {
      if (plugin.hooks && plugin.hooks[hookName]) {
        await plugin.hooks[hookName]!(...args);
      }
    }
  }
}
