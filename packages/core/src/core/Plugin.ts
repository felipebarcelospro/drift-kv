/**
 * Plugin system for extending Drift functionality
 * @module DriftPlugin
 */

/**
 * Query action types supported by Drift
 */
type QueryAction =
  | "create"
  | "findUnique"
  | "findMany"
  | "update"
  | "delete"
  | "upsert"
  | "count"
  | "aggregate";

/**
 * Configuration options for a plugin
 * @interface PluginConfig
 */
interface PluginConfig {
  /** Whether the plugin is enabled */
  enabled: boolean;
  /** Additional configuration options */
  [key: string]: any;
}

/**
 * Lifecycle hooks that can be implemented by plugins
 * @interface PluginHooks
 */
interface PluginHooks {
  /** Called when database connection is established */
  onConnect?: (client: any, context: any) => Promise<void>;
  /** Called when database connection is closed */
  onDisconnect?: () => Promise<void>;
  /** Called before executing a query */
  beforeExecute?: (params: any) => Promise<void>;
  /** Called after query execution */
  afterExecute?: (result: any) => Promise<void>;
  /** Called when an error occurs */
  onError?: (error: Error) => Promise<void>;
  /** Called before executing a query */
  beforeQuery?: (query: any, context: any) => Promise<void>;
  /** Called after query execution */
  afterQuery?: (result: any, context: any) => Promise<void>;
}

/**
 * Base plugin class for extending Drift functionality
 * @class DriftPlugin
 */
export class DriftPlugin {
  /** Plugin name */
  public name: string;
  /** Plugin description */
  public description: string;
  /** Plugin configuration */
  public config: PluginConfig;
  /** Plugin lifecycle hooks */
  public hooks: PluginHooks;
  /** Additional plugin methods */
  public methods: { [key: string]: Function };

  /**
   * Creates a new DriftPlugin instance
   * @param {Object} params - Plugin parameters
   * @param {string} params.name - Plugin name
   * @param {string} params.description - Plugin description
   * @param {PluginConfig} params.config - Plugin configuration
   * @param {PluginHooks} params.hooks - Plugin lifecycle hooks
   * @param {Object.<string, Function>} params.methods - Additional plugin methods
   */
  constructor({
    name,
    description,
    config,
    hooks,
    methods,
  }: {
    name: string;
    description: string;
    config: PluginConfig;
    hooks: PluginHooks;
    methods: { [key: string]: Function };
  }) {
    this.name = name;
    this.description = description;
    this.config = config;
    this.hooks = hooks;
    this.methods = methods;
  }

  /**
   * Initializes the plugin
   * @param {any} drift - Drift instance
   */
  public initialize(drift: any): void {
    console.log(`Initializing plugin: ${this.name}`);
  }

  /**
   * Executes a plugin hook
   * @param {keyof PluginHooks} hookName - Name of hook to execute
   * @param {any} params - Parameters to pass to hook
   * @param {any} context - Optional context object
   */
  public async executeHook(
    hookName: keyof PluginHooks,
    params?: any,
    context?: any,
  ): Promise<void> {
    if (this.hooks && this.hooks[hookName]) {
      const hook = this.hooks[hookName];
      if (typeof hook === "function") {
        if (
          hookName === "onConnect" ||
          hookName === "beforeQuery" ||
          hookName === "afterQuery"
        ) {
          await hook(params, context);
        } else if (hookName === "onError") {
          await hook(params as Error, {});
        } else {
          await hook(params, {});
        }
      }
    }
  }

  /**
   * Executes a query through the plugin
   * @param {QueryAction} action - Type of query action
   * @param {any} params - Query parameters
   * @param {any} context - Optional context object
   */
  public async query(
    action: QueryAction,
    params: any,
    context?: any,
  ): Promise<any> {
    await this.executeHook("beforeQuery", { action, params }, context);
    await this.executeHook("beforeExecute", { action, params });

    // Execute query logic here if needed

    await this.executeHook("afterExecute", params);
    await this.executeHook("afterQuery", params, context);
  }
}
