// src/entities/DriftEntity.ts

import { ZodSchema } from "zod";
import { Drift } from "../core/Drift";
import { DriftPlugin } from "../core/Plugin";
import { DriftWatcher } from "../core/Watcher";

/**
 * Represents the possible query actions that can be performed on an entity
 * @example
 * type Action = 'create' | 'findUnique' | 'findMany' | 'update' | 'delete' | 'upsert' | 'count' | 'aggregate'
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
 * Interface for entity hooks that can be executed before and after queries
 * @example
 * const hooks: EntityHooks<User> = {
 *   beforeQuery: async (params, context) => {
 *     console.log('Before query:', params);
 *   },
 *   afterQuery: async (result, context) => {
 *     console.log('After query:', result);
 *   }
 * }
 */
interface EntityHooks<T> {
  beforeQuery?: (params: QueryParams<T>, context: any) => Promise<void>;
  afterQuery?: (result: any, context: any) => Promise<void>;
}

/**
 * Configuration options for creating a new entity
 * @example
 * const userEntity = new DriftEntity<User>(drift, {
 *   name: 'User',
 *   description: 'User entity',
 *   schema: userSchema,
 *   options: {
 *     timestamps: true,
 *     indexes: ['email']
 *   },
 *   hooks: {
 *     beforeQuery: async (params, context) => {
 *       // Hook logic
 *     }
 *   }
 * })
 */
interface EntityOptions<T> {
  name: string;
  description?: string;
  schema: ZodSchema<T>;
  options?: {
    timestamps?: boolean;
    indexes?: string[];
  };
  hooks?: EntityHooks<T>;
}

/**
 * Type for handling single items or arrays of items
 * @example
 * type Users = Enumerable<User> // User | User[]
 */
type Enumerable<T> = T | T[];

/**
 * Type for constructing where clauses in queries
 * @example
 * const where: WhereInput<User> = {
 *   AND: [
 *     { email: { contains: '@example.com' } },
 *     { age: { gte: 18 } }
 *   ],
 *   OR: [
 *     { role: 'ADMIN' },
 *     { role: 'MODERATOR' }
 *   ],
 *   NOT: { status: 'BANNED' }
 * }
 */
type WhereInput<T> = {
  AND?: Enumerable<WhereInput<T>>;
  OR?: Enumerable<WhereInput<T>>;
  NOT?: Enumerable<WhereInput<T>>;
} & {
  [P in keyof T]?:
    | T[P]
    | { equals?: T[P] }
    | { not?: T[P] }
    | { in?: T[P][] }
    | { notIn?: T[P][] }
    | { lt?: T[P] }
    | { lte?: T[P] }
    | { gt?: T[P] }
    | { gte?: T[P] }
    | { contains?: string }
    | { startsWith?: string }
    | { endsWith?: string };
};

/**
 * Type for specifying sort order in queries
 * @example
 * const orderBy: OrderByInput<User> = {
 *   createdAt: 'desc',
 *   email: 'asc'
 * }
 */
type OrderByInput<T> = {
  [P in keyof T]?: "asc" | "desc";
};

/**
 * Type for selecting specific fields to return
 * @example
 * const select: SelectInput<User> = {
 *   id: true,
 *   email: true,
 *   profile: true
 * }
 */
type SelectInput<T> = {
  [P in keyof T]?: boolean;
};

/**
 * Type for including related entities in queries
 * @example
 * const include: IncludeInput<User> = {
 *   posts: {
 *     select: { title: true },
 *     where: { published: true },
 *     orderBy: { createdAt: 'desc' },
 *     take: 10
 *   },
 *   profile: true
 * }
 */
type IncludeInput<T> = {
  [P in keyof T]?:
    | boolean
    | {
        select?: SelectInput<T[P]>;
        where?: WhereInput<T[P]>;
        orderBy?: OrderByInput<T[P]>;
        skip?: number;
        take?: number;
      };
};

/**
 * Interface for query parameters used in entity operations
 * @example
 * const params: QueryParams<User> = {
 *   action: 'findMany',
 *   where: { age: { gte: 18 } },
 *   select: { id: true, email: true },
 *   include: { posts: true },
 *   orderBy: { createdAt: 'desc' },
 *   take: 10
 * }
 */
interface QueryParams<T> {
  action: QueryAction;
  data?: Partial<T> | Partial<T>[];
  where?: WhereInput<T>;
  select?: SelectInput<T>;
  include?: IncludeInput<T>;
  orderBy?: OrderByInput<T>;
  skip?: number;
  take?: number;
  cursor?: { id: any };
  distinct?: Array<keyof T>;
  [key: string]: any;
}

/**
 * Main entity class that provides CRUD operations and real-time subscriptions
 * @see {@link https://github.com/yourusername/drift/blob/main/README.md#entity Entity Documentation}
 * @example
 * const userEntity = new DriftEntity<User>(drift, {
 *   name: 'User',
 *   schema: userSchema
 * });
 *
 * // Create a user
 * const user = await userEntity.create({
 *   data: { email: 'test@example.com' }
 * });
 *
 * // Find users
 * const users = await userEntity.findMany({
 *   where: { age: { gte: 18 } },
 *   orderBy: { createdAt: 'desc' }
 * });
 *
 * // Watch for changes
 * userEntity.watchAll({
 *   where: { status: 'ACTIVE' }
 * }, (users) => {
 *   console.log('Active users changed:', users);
 * });
 */
export class DriftEntity<T extends { id: any }> {
  public name: string;
  public description?: string;
  public schema: ZodSchema<T>;
  public options?: EntityOptions<T>["options"];
  public hooks?: EntityHooks<T>;

  private drift: Drift;
  private client: any;
  private plugins: DriftPlugin[];
  private watcher: DriftWatcher<T>;

  constructor(drift: Drift, options: EntityOptions<T>) {
    this.drift = drift;
    this.client = drift.client;
    this.plugins = drift.plugins;
    this.name = options.name;
    this.description = options.description;
    this.schema = options.schema;
    this.options = options.options;
    this.hooks = options.hooks;
    this.watcher = new DriftWatcher<T>(this.drift, this);
  }

  /** ===============================
   * Create Method
   * =============================== */
  /**
   * Creates a new entity record
   * @see {@link https://github.com/yourusername/drift/blob/main/README.md#create Create Documentation}
   * @example
   * const user = await userEntity.create({
   *   data: {
   *     email: 'test@example.com',
   *     name: 'Test User'
   *   },
   *   select: {
   *     id: true,
   *     email: true
   *   },
   *   include: {
   *     profile: true
   *   }
   * });
   */
  public async create(params: {
    data: T;
    select?: SelectInput<T>;
    include?: IncludeInput<T>;
  }) {
    const { data, select, include } = params;
    const action: QueryAction = "create";

    // Validate data using Zod
    const validatedData = this.schema.parse(data);

    // Apply timestamps if enabled
    if (this.options?.timestamps) {
      const timestamp = new Date().toISOString();
      (validatedData as any).createdAt = timestamp;
      (validatedData as any).updatedAt = timestamp;
    }

    // Execute beforeQuery hooks
    await this.executeHook("beforeQuery", { action, data: validatedData });

    // Intercept query via plugins
    await this.executePluginIntercepts("beforeExecute", {
      action,
      data: validatedData,
    });

    // Save data to Deno KV
    const key = [this.name, validatedData.id];
    await this.client.set(key, validatedData);

    // Execute afterQuery hooks
    await this.executeHook("afterQuery", validatedData);

    // Intercept query via plugins
    await this.executePluginIntercepts("afterExecute", validatedData);

    // Return result with applied select/include
    return this.applySelectInclude(validatedData, select, include);
  }

  /** ===============================
   * Find Unique Method
   * =============================== */
  /**
   * Finds a single entity record by unique identifier
   * @see {@link https://github.com/yourusername/drift/blob/main/README.md#findunique FindUnique Documentation}
   * @example
   * const user = await userEntity.findUnique({
   *   where: { id: '123' },
   *   select: {
   *     email: true,
   *     name: true
   *   },
   *   include: {
   *     posts: {
   *       where: { published: true }
   *     }
   *   }
   * });
   */
  public async findUnique(params: {
    where: { id: any };
    select?: SelectInput<T>;
    include?: IncludeInput<T>;
  }) {
    const { where, select, include } = params;
    const action: QueryAction = "findUnique";

    // Execute beforeQuery hooks
    await this.executeHook("beforeQuery", { action, params });

    // Intercept query via plugins
    await this.executePluginIntercepts("beforeExecute", { action, params });

    // Get data from Deno KV
    const key = [this.name, where.id];
    const result = (await this.client.get(key)) as any;

    // Execute afterQuery hooks
    await this.executeHook("afterQuery", result.value);

    // Intercept query via plugins
    await this.executePluginIntercepts("afterExecute", result.value);

    // Return result with applied select/include
    return result.value
      ? this.applySelectInclude(result.value, select, include)
      : null;
  }

  /** ===============================
   * Find Many Method
   * =============================== */
  /**
   * Finds multiple entity records based on query parameters
   * @see {@link https://github.com/yourusername/drift/blob/main/README.md#findmany FindMany Documentation}
   * @example
   * const users = await userEntity.findMany({
   *   where: {
   *     AND: [
   *       { age: { gte: 18 } },
   *       { status: 'ACTIVE' }
   *     ]
   *   },
   *   select: {
   *     id: true,
   *     email: true
   *   },
   *   orderBy: {
   *     createdAt: 'desc'
   *   },
   *   take: 10,
   *   skip: 0
   * });
   */
  public async findMany(params: {
    where?: WhereInput<T>;
    select?: SelectInput<T>;
    include?: IncludeInput<T>;
    orderBy?: OrderByInput<T>;
    skip?: number;
    take?: number;
    cursor?: { id: any };
    distinct?: Array<keyof T>;
  }) {
    const action: QueryAction = "findMany";

    // Execute beforeQuery hooks
    await this.executeHook("beforeQuery", { action, params });

    // Intercept query via plugins
    await this.executePluginIntercepts("beforeExecute", { action, params });

    // Retrieve all records for the entity
    const iterator = this.client.list({ prefix: [this.name] });
    let results: T[] = [];
    for await (const res of iterator) {
      results.push(res.value);
    }

    // Apply filters
    if (params.where) {
      results = this.applyWhere(results, params.where);
    }

    // Apply distinct
    if (params.distinct) {
      results = this.applyDistinct(results, params.distinct);
    }

    // Apply orderBy
    if (params.orderBy) {
      results = this.applyOrderBy(results, params.orderBy);
    }

    // Apply cursor, skip, take
    results = this.applyPagination(results, params);

    // Execute afterQuery hooks
    await this.executeHook("afterQuery", results);

    // Intercept query via plugins
    await this.executePluginIntercepts("afterExecute", results);

    // Apply select/include
    return results.map((item) =>
      this.applySelectInclude(item, params.select, params.include),
    );
  }

  /** ===============================
   * Update Method
   * =============================== */
  /**
   * Updates an existing entity record
   * @see {@link https://github.com/yourusername/drift/blob/main/README.md#update Update Documentation}
   * @example
   * const updatedUser = await userEntity.update({
   *   where: { id: '123' },
   *   data: {
   *     email: 'newemail@example.com',
   *     status: 'ACTIVE'
   *   },
   *   select: {
   *     id: true,
   *     email: true,
   *     updatedAt: true
   *   }
   * });
   */
  public async update(params: {
    where: { id: any };
    data: Partial<T>;
    select?: SelectInput<T>;
    include?: IncludeInput<T>;
  }) {
    const { where, data, select, include } = params;
    const action: QueryAction = "update";

    // Execute beforeQuery hooks
    await this.executeHook("beforeQuery", { action, params });

    // Intercept query via plugins
    await this.executePluginIntercepts("beforeExecute", { action, params });

    // Get existing data
    const key = [this.name, where.id];
    const existing = await this.client.get(key);
    if (!existing.value) {
      throw new Error("Record not found");
    }

    // Merge data
    const updatedData = { ...existing.value, ...data };

    // Validate updated data
    const validatedData = this.schema.parse(updatedData);

    // Update timestamps if enabled
    if (this.options?.timestamps) {
      (validatedData as any).updatedAt = new Date().toISOString();
    }

    // Save updated data
    await this.client.set(key, validatedData);

    // Execute afterQuery hooks
    await this.executeHook("afterQuery", validatedData);

    // Intercept query via plugins
    await this.executePluginIntercepts("afterExecute", validatedData);

    // Return result with applied select/include
    return this.applySelectInclude(validatedData, select, include);
  }

  /** ===============================
   * Delete Method
   * =============================== */
  /**
   * Deletes an entity record
   * @see {@link https://github.com/yourusername/drift/blob/main/README.md#delete Delete Documentation}
   * @example
   * const deletedUser = await userEntity.delete({
   *   where: { id: '123' },
   *   select: {
   *     id: true,
   *     email: true
   *   }
   * });
   */
  public async delete(params: {
    where: { id: any };
    select?: SelectInput<T>;
    include?: IncludeInput<T>;
  }) {
    const { where, select, include } = params;
    const action: QueryAction = "delete";

    // Execute beforeQuery hooks
    await this.executeHook("beforeQuery", { action, params });

    // Intercept query via plugins
    await this.executePluginIntercepts("beforeExecute", { action, params });

    // Get existing data
    const key = [this.name, where.id];
    const existing = await this.client.get(key);
    if (!existing.value) {
      throw new Error("Record not found");
    }

    // Delete the record
    await this.client.delete(key);

    // Execute afterQuery hooks
    await this.executeHook("afterQuery", existing.value);

    // Intercept query via plugins
    await this.executePluginIntercepts("afterExecute", existing.value);

    // Return deleted record with applied select/include
    return this.applySelectInclude(existing.value, select, include);
  }

  /** ===============================
   * Helper Methods
   * =============================== */

  /**
   * Applies where conditions to filter records
   * @private
   */
  private applyWhere(records: T[], where: WhereInput<T>): T[] {
    return records.filter((record) => {
      const checkCondition = (condition: any, value: any): boolean => {
        if (condition === null) return value === null;
        if (typeof condition !== "object") return value === condition;

        for (const [operator, operand] of Object.entries(condition)) {
          switch (operator) {
            case "equals":
              if (value !== operand) return false;
              break;
            case "not":
              if (value === operand) return false;
              break;
            case "in":
              if (Array.isArray(operand) && !operand.includes(value))
                return false;
              break;
            case "notIn":
              if (Array.isArray(operand) && operand.includes(value))
                return false;
              break;
            case "lt":
              if (typeof operand === "number" && !(value < operand))
                return false;
              break;
            case "lte":
              if (typeof operand === "number" && !(value <= operand))
                return false;
              break;
            case "gt":
              if (typeof operand === "number" && !(value > operand))
                return false;
              break;
            case "gte":
              if (typeof operand === "number" && !(value >= operand))
                return false;
              break;
            case "contains":
              if (!String(value).includes(String(operand))) return false;
              break;
            case "startsWith":
              if (!String(value).startsWith(String(operand))) return false;
              break;
            case "endsWith":
              if (!String(value).endsWith(String(operand))) return false;
              break;
          }
        }
        return true;
      };

      // Handle AND
      if (where.AND) {
        const conditions = Array.isArray(where.AND) ? where.AND : [where.AND];
        if (
          !conditions.every(
            (condition) => this.applyWhere([record], condition).length > 0,
          )
        ) {
          return false;
        }
      }

      // Handle OR
      if (where.OR) {
        const conditions = Array.isArray(where.OR) ? where.OR : [where.OR];
        if (
          !conditions.some(
            (condition) => this.applyWhere([record], condition).length > 0,
          )
        ) {
          return false;
        }
      }

      // Handle NOT
      if (where.NOT) {
        const conditions = Array.isArray(where.NOT) ? where.NOT : [where.NOT];
        if (
          conditions.some(
            (condition) => this.applyWhere([record], condition).length > 0,
          )
        ) {
          return false;
        }
      }

      // Handle direct field conditions
      for (const key in where) {
        if (["AND", "OR", "NOT"].includes(key)) continue;
        if (!checkCondition(where[key], record[key])) return false;
      }

      return true;
    });
  }

  /**
   * Applies sorting to records
   * @private
   */
  private applyOrderBy(records: T[], orderBy: OrderByInput<T>): T[] {
    return [...records].sort((a, b) => {
      for (const [field, direction] of Object.entries(orderBy)) {
        if (a[field] < b[field]) return direction === "asc" ? -1 : 1;
        if (a[field] > b[field]) return direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }

  /**
   * Applies pagination to records
   * @private
   */
  private applyPagination(records: T[], params: any): T[] {
    const { cursor, skip, take } = params;
    let result = records;

    if (cursor) {
      const cursorIndex = records.findIndex((r) => r.id === cursor.id);
      if (cursorIndex !== -1) {
        result = result.slice(cursorIndex + 1);
      }
    }

    if (skip !== undefined) {
      result = result.slice(skip);
    }

    if (take !== undefined) {
      result = take >= 0 ? result.slice(0, take) : result.slice(take);
    }

    return result;
  }

  /**
   * Applies distinct filtering to records
   * @private
   */
  private applyDistinct(records: T[], distinctFields: Array<keyof T>): T[] {
    const uniqueRecords = new Map<string, T>();
    for (const record of records) {
      const key = distinctFields.map((field) => record[field]).join("|");
      if (!uniqueRecords.has(key)) {
        uniqueRecords.set(key, record);
      }
    }
    return Array.from(uniqueRecords.values());
  }

  /**
   * Applies select and include transformations to records
   * @private
   */
  private applySelectInclude(
    record: T,
    select?: SelectInput<T>,
    include?: IncludeInput<T>,
  ): any {
    let result = { ...record };

    // Apply select
    if (select) {
      result = Object.keys(select).reduce((acc, key) => {
        if (select[key]) {
          acc[key] = result[key];
        }
        return acc;
      }, {} as any);
    }

    // Apply include (relations)
    if (include) {
      for (const [key, value] of Object.entries(include)) {
        if (typeof value === "object") {
          // Handle nested select/where/orderBy
          const relation = result[key];
          if (Array.isArray(relation)) {
            result[key] = relation.map((item) =>
              this.applySelectInclude(item, value.select, undefined),
            );
            if (value.where) {
              result[key] = this.applyWhere(result[key], value.where);
            }
            if (value.orderBy) {
              result[key] = this.applyOrderBy(result[key], value.orderBy);
            }
            if (value.skip || value.take) {
              result[key] = this.applyPagination(result[key], value);
            }
          } else if (relation) {
            result[key] = this.applySelectInclude(
              relation,
              value.select,
              undefined,
            );
          }
        } else if (value) {
          // Simple include
          result[key] = record[key];
        }
      }
    }

    return result;
  }

  /**
   * Executes entity hooks
   * @private
   */
  private async executeHook(hookName: keyof EntityHooks<T>, params: any) {
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
        // Execute plugin query with proper action and params
        const result = await plugin.query(
          data.action, // QueryAction from data
          data, // Query parameters
          this, // Context is the entity instance
        );

        if (result !== undefined) {
          return result; // Return any results from plugin query
        }
      }
    }
  }

  /** ===============================
   * Real-time Subscription Methods
   * =============================== */

  /**
   * Watch changes on a specific entity record
   * @see {@link https://github.com/yourusername/drift/blob/main/README.md#watch Watch Documentation}
   * @example
   * userEntity.watch('123', {
   *   select: { email: true },
   *   where: { status: 'ACTIVE' }
   * }, (changes) => {
   *   console.log('User changed:', changes);
   * });
   */
  public watch(
    id: any,
    params: {
      select?: SelectInput<T>;
      include?: IncludeInput<T>;
      where?: WhereInput<T>;
      orderBy?: OrderByInput<T>;
    },
    callback: (changes: any) => void,
  ) {
    const key = [this.name, id];
    this.watcher.watch(key, params, (value) => {
      const filtered = this.applyWhere([value], params.where || {})[0];
      if (filtered) {
        const result = this.applySelectInclude(
          filtered,
          params.select,
          params.include,
        );
        callback(result);
      }
    });
  }

  /**
   * Watch changes on all records of this entity
   * @see {@link https://github.com/yourusername/drift/blob/main/README.md#watchall WatchAll Documentation}
   * @example
   * userEntity.watchAll({
   *   where: { status: 'ACTIVE' },
   *   orderBy: { createdAt: 'desc' },
   *   select: { id: true, email: true }
   * }, (changes) => {
   *   console.log('Users changed:', changes);
   * });
   */
  public watchAll(
    params: {
      select?: SelectInput<T>;
      include?: IncludeInput<T>;
      where?: WhereInput<T>;
      orderBy?: OrderByInput<T>;
      distinct?: Array<keyof T>;
    },
    callback: (changes: any[]) => void,
  ) {
    this.watcher.watchAll(params, (records) => {
      let filteredRecords = [...records];
      if (params.where) {
        filteredRecords = this.applyWhere(filteredRecords, params.where);
      }
      if (params.distinct) {
        filteredRecords = this.applyDistinct(filteredRecords, params.distinct);
      }
      if (params.orderBy) {
        filteredRecords = this.applyOrderBy(filteredRecords, params.orderBy);
      }
      const results = filteredRecords.map((record) =>
        this.applySelectInclude(record, params.select, params.include),
      );
      callback(results);
    });
  }
}
