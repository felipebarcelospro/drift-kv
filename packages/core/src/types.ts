import { Kv, KvKey } from "@deno/kv";
import { z, ZodSchema } from "zod";
import { KeyPropertySchema } from "./utils";

/********************/
/*                  */
/*  QUEUE TYPES     */
/*                  */
/********************/

export type DriftQueueJob<T = any, O = any> = {
  topic: string;
  status: "scheduled" | "processing" | "completed" | "failed";
  input: T;

  error?: Error;
  output?: O;

  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
};

export type DriftQueueJobOptions = {
  timeout?: number;
}

export type DriftQueueJobParams<T = any, O = any> = {
  data: {
    topic: string;
    data: T;
  };
  options?: DriftQueueJobOptions;
  hooks?: Partial<DriftQueueHooks<T, O>>;
}

/**
 * Type helper to extract input and output types from DriftQueueHooks.
 */
export type Awaitable<T> = T | Promise<T>;

export type ExtractQueueHookTypes<T extends DriftQueueOptions<any, any>> = {
  input: z.output<T["schema"]>;
  output: Awaitable<ReturnType<T["handler"]>>;
};

/**
 * Interface defining lifecycle hooks for queue operations.
 *
 * @interface DriftQueueHooks
 * @template T - The type of job data.
 * @template O - The type of job output.
 */
export interface DriftQueueHooks<T, O = any> {
  /**
   * Called before a job is scheduled.
   *
   * @param {DriftQueueJob<T, Awaitable<O>>} job - The job data to be scheduled.
   * @returns {Promise<void>}
   */
  onJobBeforeSchedule?: (job: DriftQueueJob<T, Awaitable<O>>) => Promise<void>;

  /**
   * Called when a job is scheduled.
   *
   * @param {DriftQueueJob<T, Awaitable<O>>} job - The job data that was scheduled.
   * @returns {Promise<void>}
   */
  onJobSchedule?: (job: DriftQueueJob<T, Awaitable<O>>) => Promise<void>;

  /**
   * Called when a job starts processing.
   *
   * @param {DriftQueueJob<T, Awaitable<O>>} job - The job data being processed.
   * @returns {Promise<void>}
   */
  onJobStart?: (job: DriftQueueJob<T, Awaitable<O>>) => Promise<void>;

  /**
   * Called when a job ends.
   *
   * @param {DriftQueueJob<T, Awaitable<O>>} job - The result of the job processing.
   * @returns {Promise<void>}
   */
  onJobEnd?: (job: DriftQueueJob<T, Awaitable<O>>) => Promise<void>;

  /**
   * Called when a job encounters an error.
   *
   * @param {DriftQueueJob<T, Awaitable<O>>} job - The job data that encountered the error.
   * @returns {Promise<void>}
   */
  onJobError?: (job: DriftQueueJob<T, Awaitable<O>>) => Promise<void>;
}

/**
 * Interface defining configuration options for creating a new queue.
 *
 * @interface DriftQueueOptions
 * @template T - The type of job data.
 */
export interface DriftQueueOptions<T = any, O = any> {
  /**
   * Unique name identifier for the queue.
   *
   * @type {string}
   */
  name: string;

  /**
   * Optional description of the queue's purpose.
   *
   * @type {string}
   */
  description?: string;

  /**
   * Zod schema for validating job data.
   *
   * @type {ZodSchema<T>}
   */
  schema: ZodSchema<T>;

  /**
   * Additional queue configuration options.
   *
   * @type {Object}
   */
  options?: {
    /**
     * Number of retry attempts for failed jobs.
     *
     * @type {number}
     */
    retryAttempts?: number;

    /**
     * Timeout duration for job processing.
     *
     * @type {number}
     */
    timeout?: number;
  };

  /**
   * Lifecycle hooks for queue events.
   *
   * @type {DriftQueueHooks<T, O>}
   */
  hooks?: DriftQueueHooks<T, O>;

  /**
   * Main job processing function.
   *
   * @param {T} data - The job data to be processed.
   * @returns {Promise<O>}
   */
  handler: (data: T) => Promise<O>;
}

/********************/
/*                  */
/*  WATCH TYPES     */
/*                  */
/********************/

/**
 * Parameters for watching data changes.
 * @template T - The type of data being watched.
 */
export interface DriftWatchParams<T> {
  /** Fields to select from the data. */
  select?: { [K in keyof T]?: boolean };

  /** Related data to include. */
  include?: {
    [K in keyof T]?:
      | boolean
      | {
          /** Fields to select from the included data. */
          select?: { [K2 in keyof T[K]]?: boolean };

          /** Conditions for filtering included data. */
          where?: { [K2 in keyof T[K]]?: any };

          /** Order of the included data. */
          orderBy?: { [K2 in keyof T[K]]?: "asc" | "desc" };

          /** Number of records to skip. */
          skip?: number;

          /** Number of records to take. */
          take?: number;
        };
  };

  /** Conditions for filtering the main data. */
  where?: { [K in keyof T]?: any };

  /** Order of the main data. */
  orderBy?: { [K in keyof T]?: "asc" | "desc" };

  /** Distinct fields to return. */
  distinct?: Array<keyof T>;
}

/********************/
/*                  */
/*  DRIFT TYPES     */
/*                  */
/********************/

/**
 * Drift Methods Interface for performing CRUD operations.
 * @template T - The type of table definition.
 */
export interface DriftEntityMethods<T extends DriftTableDefinition> {
  /** Finds the first record matching the given arguments. */
  findFirst: <Args extends DriftQueryArgs<T>>(
    args: Args,
  ) => Promise<QueryResponse<T, Args>>;

  /** Finds multiple records matching the given arguments. */
  findMany: <Args extends DriftQueryArgs<T>>(
    args: Args,
  ) => Promise<Array<QueryResponse<T, Args>>>;

  /** Creates a new record. */
  create: <Args extends DriftCreateArgs<T>>(
    args: Args,
  ) => Promise<DriftCreateAndUpdateResponse<T>>;

  /** Creates multiple new records. */
  createMany: <Args extends DriftCreateManyArgs<T>>(
    args: Args,
  ) => Promise<DriftCreateAndUpdateResponse<T>[]>;

  /** Updates an existing record. */
  update: <Args extends DriftUpdateArgs<T>>(
    args: Args,
  ) => Promise<DriftCreateAndUpdateResponse<T>>;

  /** Deletes a record. */
  delete: <Args extends DriftQueryArgs<T>>(
    args: Args,
  ) => Promise<DriftDeleteResponse>;

  /** Deletes multiple records. */
  deleteMany: <Args extends DriftQueryArgs<T>>(
    args: Args,
  ) => Promise<DriftDeleteResponse>;

  /** Updates multiple records. */
  updateMany: <Args extends DriftUpdateArgs<T>>(
    args: Args,
  ) => Promise<DriftCreateAndUpdateResponse<T>[]>;

  /** Finds a unique record matching the given arguments. */
  findUnique: <Args extends DriftQueryArgs<T>>(
    args: Args,
  ) => Promise<QueryResponse<T, Args> | null>;
}

/**
 * Drift Result Type representing methods for each table definition.
 * @template T - A record of table definitions.
 */
export type DriftResult<T extends Record<string, DriftTableDefinition>> = {
  [K in keyof T]: DriftEntityMethods<T[K]>;
};

/**
 * Type representing an object with a version stamp.
 * @template T - The base type.
 */
export type WithVersionstamp<T> = T & {
  versionstamp: string;
};

export type WithTimestamps<T> = T & {
  updatedAt?: string;
  createdAt: string;
} & WithVersionstamp<T>;

/**
 * Type representing an object that may have a version stamp.
 * @template T - The base type.
 */
export type WithMaybeVersionstamp<T> = T & {
  versionstamp?: string | null | undefined;
};

export type DriftLocalKey = DriftAccessKey;
export type DriftForeignKey = DriftAccessKey;

/**
 * Relation Definition Type for defining relationships between tables.
 */
export type RelationDefinition = [
  relationSchemaName: string,
  relationSchema: [ReturnType<typeof z.object>] | ReturnType<typeof z.object>,
  localKey: DriftLocalKey,
  foreignKey: DriftForeignKey,
];

/**
 * Table Definition Type for defining the schema and relations of a table.
 */
export type DriftTableDefinition<
  T extends z.AnyZodObject = z.AnyZodObject,
> = {
  schema: T;
  relations?: Record<string, RelationDefinition>;
  options?: {
    timestamps?: boolean;
  };
};

/**
 * Query Response Type representing the response structure for queries.
 * @template T - The type of table definition.
 * @template PassedInArgs - The arguments passed to the query.
 */
export type QueryResponse<
  T extends DriftTableDefinition,
  PassedInArgs extends DriftQueryArgs<T>,
> = WithVersionstamp<
  Select<T, PassedInArgs["select"]> &
    Include<T["relations"], PassedInArgs["include"]>
>;

/**
 * Select Type for selecting specific fields from a table.
 * @template T - The type of table definition.
 * @template Selected - The selected fields.
 */
type Select<
  T extends DriftTableDefinition,
  Selected extends DriftQueryArgs<T>["select"] | undefined,
> =
  Selected extends Partial<Record<string, unknown>>
    ? Pick<z.output<T["schema"]>, keyof Selected & string>
    : z.output<T["schema"]>;

type Nothing = {};

/**
 * Include Type for including related data in queries.
 * @template Relations - The relations defined in the table.
 * @template ToBeIncluded - The details of what to include.
 */
type Include<
  Relations extends DriftTableDefinition["relations"],
  ToBeIncluded extends DriftIncludeDetails<Relations> | undefined,
> =
  Relations extends Record<string, RelationDefinition>
    ? ToBeIncluded extends Record<string, unknown>
      ? {
          [Rel in keyof Relations]: Relations[Rel][1] extends [
            { _output: infer OneToManyRelatedSchema },
          ]
            ? ToBeIncluded extends Record<
                Rel,
                infer DetailsToInclude extends Record<string, unknown>
              >
              ? DriftMatchAndSelect<OneToManyRelatedSchema, DetailsToInclude>[]
              : ToBeIncluded extends Record<Rel, true>
                ? OneToManyRelatedSchema[]
                : Nothing
            : Relations[Rel][1] extends { _output: infer OneToOneRelatedSchema }
              ? ToBeIncluded extends Record<
                  Rel,
                  infer DetailsToInclude extends Record<string, unknown>
                >
                ? ToBeIncluded extends Record<Rel, true>
                  ? DriftMatchAndSelect<OneToOneRelatedSchema, DetailsToInclude>
                  : Nothing
                : OneToOneRelatedSchema
              : Nothing;
        }
      : Nothing
    : Nothing;

/**
 * MatchAndSelect Type for matching and selecting fields from related schemas.
 * @template SourceSchema - The source schema to match against.
 * @template ToBeIncluded - The fields to include.
 */
type DriftMatchAndSelect<SourceSchema, ToBeIncluded> = {
  [Key in Extract<
    keyof SourceSchema,
    keyof ToBeIncluded
  >]: ToBeIncluded[Key] extends infer ToInclude
    ? SourceSchema[Key] extends infer Source
      ? ToInclude extends true
        ? Source
        : DriftMatchAndSelect<Source, ToInclude>
      : never
    : never;
};

/**
 * Delete Response Type representing the response structure for delete operations.
 */
export type DriftDeleteResponse = { status: "DELETED" };

/**
 * Create and Update Response Type representing the response structure for create and update operations.
 * @template T - The type of table definition.
 */
export type DriftCreateAndUpdateResponse<T extends DriftTableDefinition> =
  WithVersionstamp<z.output<T["schema"]>>;

/**
 * Create Args Type representing the arguments for creating a new record.
 * @template T - The type of table definition.
 */
export type DriftCreateArgs<T extends DriftTableDefinition> = Pick<
  DriftQueryArgs<T>,
  "select"
> & {
  /** The data to be created. */
  data: z.input<T["schema"]>;
};

/**
 * Create Many Args Type representing the arguments for creating multiple new records.
 * @template T - The type of table definition.
 */
export type DriftCreateManyArgs<T extends DriftTableDefinition> = Pick<
  DriftQueryArgs<T>,
  "select"
> & {
  /** The data to be created. */
  data: z.input<T["schema"]>[];
};

/**
 * Update Args Type representing the arguments for updating an existing record.
 * @template T - The type of table definition.
 */
export type DriftUpdateArgs<T extends DriftTableDefinition> =
  DriftQueryArgs<T> & {
    /** The data to be updated. */
    data: Partial<WithMaybeVersionstamp<z.input<T["schema"]>>>;
  };

/**
 * Query Kv Options Type representing the options for querying with Kv.
 */
export type DriftQueryKvOptions = Parameters<Kv["get"]>[1];

/**
 * Include Details Type for specifying which related data to include in queries.
 * @template Relations - The relations defined in the table.
 */
type DriftIncludeDetails<Relations extends DriftTableDefinition["relations"]> =
  Relations extends Record<string, RelationDefinition>
    ? {
        [Rel in keyof Relations]?:
          | true
          | (Relations[Rel][1] extends [
              { _output: infer OneToManyRelatedSchema },
            ]
              ? DriftIncludable<OneToManyRelatedSchema>
              : Relations[Rel][1] extends {
                    _output: infer OneToOneRelatedSchema;
                  }
                ? DriftIncludable<OneToOneRelatedSchema>
                : never);
      }
    : never;

/**
 * Includable Type for specifying which fields of a related schema can be included.
 * @template T - The related schema type.
 */
type DriftIncludable<T> =
  T extends Record<string, unknown>
    ? { [K in keyof T]?: true | DriftIncludable<T[K]> }
    : never;

/**
 * Query Args Type representing the arguments for querying a table.
 * @template T - The type of table definition.
 */
export type DriftQueryArgs<T extends DriftTableDefinition> = {
  /** Conditions for filtering the main data. */
  where?: Partial<WithMaybeVersionstamp<z.output<T["schema"]>>>;

  /** Number of records to take. */
  take?: number;

  /** Number of records to skip. */
  skip?: number;

  /** Fields to select from the data. */
  select?: Partial<Record<keyof z.output<T["schema"]>, true>>;

  /** Order of the main data. */
  orderBy?: Partial<Record<keyof z.output<T["schema"]>, 'asc' | 'desc'>>;

  /** Related data to include. */
  include?: DriftIncludeDetails<T["relations"]>;

  /** Distinct fields to return. */
  distinct?: Array<keyof z.output<T["schema"]>>;

  /** Options for querying with Kv. */
  kvOptions?: DriftQueryKvOptions;
};

/**
 * Access Key Type representing the structure of an access key.
 */
export type DriftAccessKey = ({ value: KvKey } | { value: KvKey[] }) &
  (
    | { type: "primary" }
    | { type: "index"; suffix: string }
    | { type: "unique"; suffix: string }
  );

/**
 * Drift Key Type representing the structure of a drift key.
 */
export type DriftKey = {
  /** The access key associated with the drift key. */
  accessKey: DriftAccessKey;

  /** The Kv key associated with the drift key. */
  kvKey: KvKey;
};

/**
 * Key Property Type representing the structure of a key property.
 */
export type DriftKeyProperty = z.infer<typeof KeyPropertySchema>;

/**
 * Database Value Type representing the possible values that can be stored in the database.
 * @template T - The type of value.
 */
export type DriftDatabaseValue<T = unknown> =
  | undefined
  | null
  | boolean
  | number
  | string
  | bigint
  | Uint8Array
  | Array<T>
  | Record<string | number | symbol, T>
  | Map<unknown, unknown>
  | Set<T>
  | Date
  | RegExp;

/**
 * Represents the possible query actions that can be performed on an entity.
 * @example
 * type Action = 'create' | 'findUnique' | 'findMany' | 'update' | 'delete' | 'upsert' | 'count' | 'aggregate'
 */
export type DriftQueryAction = keyof DriftEntityMethods<any>;

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
export interface DriftEntityHooks {
  beforeQuery?: (
    params: DriftQueryArgs<DriftTableDefinition>,
    context: any,
  ) => Promise<void>;
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
export interface DriftEntityOptions<T extends z.AnyZodObject> {
  name: string;
  description?: string;
  schema: T;
  hooks?: DriftEntityHooks;
  relations?: DriftTableDefinition['relations'];
  options?: {
    timestamps?: boolean;
  };
}
