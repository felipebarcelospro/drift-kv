import { KvKey, KvKeyPart } from "@deno/kv";
import { z, ZodSchema } from "zod";
import { KeyManager } from "./core/KeyManager";
import { DriftEntity } from "./generators/DriftEntity";
import { DriftQueue } from "./generators/DriftQueue";

/********************/
/*                  */
/*  HELPER TYPES     */
/*                  */
/********************/

export type Awaitable<T> = T | Promise<T>;

export type SchemaRawShape<T extends z.ZodRawShape = z.ZodRawShape> = T;
export type SchemaRawShapeOutput<T extends SchemaRawShape> = z.output<SchemaRawShapeToObject<T>>;
export type SchemaRawShapeToObject<T extends SchemaRawShape> = z.ZodObject<T>;

export type SchemaObject<T extends z.ZodObject<z.ZodRawShape> = z.ZodObject<z.ZodRawShape>> = T;
export type SchemaObjectOutput<T extends z.ZodObject<z.ZodRawShape>> = z.infer<T>;
export type SchemaObjectInput<T extends z.ZodObject<z.ZodRawShape>> = z.input<T>;

export type SchemaAny = z.ZodType<any, any, any>;
export type SchemaRawField = z.ZodTypeAny;
export type SchemaOptionalRawField<T extends SchemaRawField> = z.ZodOptional<T>;
export type SchemaRawFieldOutput<T extends SchemaRawField> = z.output<T>;

/********************/
/*                  */
/*  QUEUE TYPES     */
/*                  */
/********************/

export type DriftQueueHandler<T extends SchemaObject> = (data: SchemaObjectOutput<T>) => Promise<void>;
export type QueueInput<T extends SchemaObject> = SchemaObjectOutput<T>;

export type DriftQueueJob<T extends DriftQueue<any, any, any, any, any>> = {
  topic: string;
  status: "scheduled" | "processing" | "completed" | "failed";
  input: SchemaObjectOutput<T['schema']>;
  output?: Awaitable<ReturnType<T['handler']>>;

  error?: Error;

  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
};

export type DriftQueueHandlerDefinition<T extends SchemaObject> = {
  schema: T;
  handler: DriftQueueHandler<T>;
}

export type DriftQueueWorkerParams<T extends DriftQueueHandlerDefinition<any>> = {
  data: SchemaObjectOutput<T['schema']>;
  hooks?: Partial<DriftQueueHooks<typeof this.handler>>;
}

export type ExtractQueueHookTypes<T extends DriftQueueHandlerDefinition<any>> = {
  input: SchemaObjectOutput<T["schema"]>;
  output: Awaitable<ReturnType<T["handler"]>>;
};

export type WorkerQueueHooks<T extends DriftQueue<any, any, any, any, any>> = {
  onWorkerStart?: () => Promise<void>;
  onWorkerEnd?: () => Promise<void>;
  onWorkerError?: (error: Error) => Promise<void>;
} & DriftQueueHooks<T>

export interface DriftQueueHooks<
  T extends DriftQueue<any, any, any, any, any>
> {
  onJobBeforeSchedule?: (job: DriftQueueJob<T>) => Promise<void>;
  onJobSchedule?: (job: DriftQueueJob<T>) => Promise<void>;
  onJobStart?: (job: DriftQueueJob<T>) => Promise<void>;
  onJobEnd?: (job: DriftQueueJob<T>) => Promise<void>;
  onJobError?: (job: DriftQueueJob<T>) => Promise<void>;
}

export interface DriftQueueOptions<T extends DriftQueue<any, any, any, any, any>> {
  name: string;
  description?: string;
  schema: ZodSchema<T>;
  hooks?: DriftQueueHooks<T>;
  handler: (data: T) => Promise<void>;
}

/********************/
/*                  */
/*  WATCH TYPES     */
/*                  */
/********************/

export interface DriftWatchParams<T extends DriftEntity<any, any, any>> {
  where?: Partial<Entity<T>>;
}

/********************/
/*                  */
/*  ENTITY TYPES     */
/*                  */
/********************/

export type Entity<T extends DriftEntity<any, any, any>> = SchemaObjectOutput<T['schema']> & { versionstamp?: string };
export type EntityInput<T extends DriftEntity<any, any, any>> = SchemaObjectInput<T['schema']>;
export type DriftAccessKeyType = "primary" | "index" | "unique";
export type DriftLocalKey = DriftAccessKey;
export type DriftForeignKey = DriftAccessKey;
export type DriftKeyProperty = z.infer<ReturnType<typeof KeyManager.getKeyPropertySchema>>;
export type DriftQueryAction = keyof DriftEntityMethods<any>;
export type QueryResponse<T extends DriftEntity<any, any, any>> = Entity<T>;
export type DriftDeleteResponse = void;

export type DriftAccessKey =
  & (
    | { value: KvKeyPart }
    | { value: KvKeyPart[] }
  )
  & (
    | { type: "primary" }
    | { type: "index"; suffix: string }
    | { type: "unique"; suffix: string }
  );

export interface DriftEntityMethods<T extends DriftEntity<any, any, any>> {
  findFirst: <Args extends DriftQueryArgs<T>>(
    args: Args,
  ) => Promise<QueryResponse<T>>;

  findMany: <Args extends DriftQueryArgs<T>>(
    args: Args,
  ) => Promise<Array<QueryResponse<T>>>;

  create: <Args extends DriftCreateArgs<T>>(
    args: Args,
  ) => Promise<DriftCreateAndUpdateResponse<T>>;

  createMany: <Args extends DriftCreateManyArgs<T>>(
    args: Args,
  ) => Promise<DriftCreateAndUpdateResponse<T>[]>;

  update: <Args extends DriftUpdateArgs<T>>(
    args: Args,
  ) => Promise<DriftCreateAndUpdateResponse<T>>;

  delete: <Args extends DriftQueryArgs<T>>(
    args: Args,
  ) => Promise<DriftDeleteResponse>;

  deleteMany: <Args extends DriftQueryArgs<T>>(
    args: Args,
  ) => Promise<DriftDeleteResponse>;

  updateMany: <Args extends DriftUpdateArgs<T>>(
    args: Args,
  ) => Promise<Array<DriftCreateAndUpdateResponse<T>>>;

  findUnique: <Args extends DriftQueryArgs<T>>(
    args: Args,
  ) => Promise<QueryResponse<T> | null>;
}

export type DriftResult<T extends Record<string, DriftEntity<any, any, any>>> = {
  [K in keyof T]: DriftEntityMethods<T[K]>;
};

export type DriftCreateAndUpdateResponse<T extends DriftEntity<any, any, any>> =
  Entity<T>;

export type DriftCreateArgs<T extends DriftEntity<any, any, any>> = Pick<
  DriftQueryArgs<T>,
  "select"
> & {
  data: EntityInput<T>;
};

export type DriftCreateManyArgs<T extends DriftEntity<any, any, any>> = Pick<
  DriftQueryArgs<T>,
  "select"
> & {
  data: EntityInput<T>[];
};


export type DriftUpdateArgs<T extends DriftEntity<any, any, any>> =
  DriftQueryArgs<T> & {
    data: EntityInput<T>;
  };

export type DriftQueryArgs<T extends DriftEntity<any, any, any>> = {
  where?: Partial<Entity<T>>;
  take?: number;
  skip?: number;
  select?: Partial<Record<keyof Entity<T>, true>>;
  orderBy?: Partial<Record<keyof Entity<T>, 'asc' | 'desc'>>;
};

export type DriftKey = {
  access: DriftAccessKey;
  kv: KvKey;
};

export type DriftEntityHookContext = {
  entity: string
  action: DriftQueryAction
  query: any;
  result?: any;
}

export interface DriftEntityHooks<T extends DriftEntity<any, any, any>> {
  beforeQuery?: (params: DriftQueryArgs<T>, context: DriftEntityHookContext) => Promise<void>;
  afterQuery?: (result: T, context: DriftEntityHookContext) => Promise<void>;
}
