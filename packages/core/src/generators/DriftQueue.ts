import { z } from "zod";
import { DriftQueueHandler, DriftQueueHooks, SchemaRawShape, SchemaRawShapeToObject } from "../types";
import { DriftExtendedShape, DriftSchema } from "./DriftSchema";

/**
 * Default fields for a DriftQueue entity.
 * @typedef {Object} DefaultFields
 * @property {Object} id - The default id field.
 * @property {boolean} id.conditional - Whether the id field is conditional.
 * @property {z.ZodString} id.schema - The schema for the id field.
 * @property {function(): string} id.default - The default value for the id field.
 */
export const DRIFT_QUEUE_DEFAULT_FIELDS = {
  id: {
    rule: "HIDDEN" as const,
    schema: z.string(),
    default: () => crypto.randomUUID(),
  },
}

/**
 * Represents the data transfer object (DTO) for creating a DriftQueue entity.
 * @template T - The base schema shape.
 */
export type DriftQueueDTO<
  DriftQueueSchemaShape extends SchemaRawShape,
  DriftQueueExtendedShape extends DriftExtendedShape<DriftQueueSchemaShape, typeof DRIFT_QUEUE_DEFAULT_FIELDS>,
  DriftQueueExtendedSchema extends SchemaRawShapeToObject<DriftExtendedShape<DriftQueueSchemaShape, typeof DRIFT_QUEUE_DEFAULT_FIELDS>>,
  THandler extends DriftQueueHandler<DriftQueueExtendedSchema>,
  THooks extends DriftQueueHooks<DriftQueue<DriftQueueSchemaShape, DriftQueueExtendedShape, DriftQueueExtendedSchema, THandler, any>>,
> = {
  /** The name of the entity */
  name: string;
  /** Optional description of the entity */
  description?: string;
  /** Function to define the schema of the entity */
  schema: (schema: typeof z) => DriftQueueSchemaShape;
  /** Handler for queue operations */
  handler: THandler;
  /** Optional hooks for the entity */
  hooks?: THooks;
}

/**
 * Class representing a queue entity in Drift KV with schema validation using Zod.
 * @template T - The base schema shape.
 */
export class DriftQueue<
  DriftQueueSchemaShape extends SchemaRawShape,
  DriftQueueExtendedShape extends DriftExtendedShape<DriftQueueSchemaShape, typeof DRIFT_QUEUE_DEFAULT_FIELDS>,
  DriftQueueExtendedSchema extends SchemaRawShapeToObject<DriftExtendedShape<DriftQueueSchemaShape, typeof DRIFT_QUEUE_DEFAULT_FIELDS>>,
  THandler extends DriftQueueHandler<DriftQueueExtendedSchema>,
  THooks extends DriftQueueHooks<DriftQueue<DriftQueueSchemaShape, DriftQueueExtendedShape, DriftQueueExtendedSchema, THandler, any>>,
> {  
  private driftSchema: DriftSchema<DriftQueueSchemaShape, typeof DRIFT_QUEUE_DEFAULT_FIELDS>;

  name: string;
  description?: string;
  schema: DriftQueueExtendedSchema;
  handler: THandler;
  hooks?: THooks;

  /**
   * Constructs a new DriftQueue entity.
   * @param params - Parameters for creating the entity.
   */
  constructor(params: DriftQueueDTO<DriftQueueSchemaShape, DriftQueueExtendedShape, DriftQueueExtendedSchema, THandler, THooks>) {
    this.driftSchema = new DriftSchema<DriftQueueSchemaShape, typeof DRIFT_QUEUE_DEFAULT_FIELDS>();

    const { name, description, schema, hooks, handler } = params;

    if (!name || !schema) {
      throw new Error("Name and schema are required.");
    }

    const extendedSchema = this.driftSchema.extend({
      shape: schema(z),
      extensions: DRIFT_QUEUE_DEFAULT_FIELDS,
    });

    this.schema = extendedSchema as DriftQueueExtendedSchema;
    this.name = name;
    this.description = description;
    this.hooks = hooks;
    this.handler = handler ;
  }

  /**
   * Static method to create a new DriftQueue entity instance.
   * @param params - Parameters for creating the entity.
   * @returns A new instance of DriftQueue.
   */
  static create<
    DriftQueueSchemaShape extends SchemaRawShape,
    DriftQueueExtendedShape extends DriftExtendedShape<DriftQueueSchemaShape, typeof DRIFT_QUEUE_DEFAULT_FIELDS>,
    DriftQueueExtendedSchema extends SchemaRawShapeToObject<DriftExtendedShape<DriftQueueSchemaShape, typeof DRIFT_QUEUE_DEFAULT_FIELDS>>,
    THandler extends DriftQueueHandler<DriftQueueExtendedSchema>,
    THooks extends DriftQueueHooks<DriftQueue<DriftQueueSchemaShape, DriftQueueExtendedShape, DriftQueueExtendedSchema, THandler, any>>,
  >(params: DriftQueueDTO<DriftQueueSchemaShape, DriftQueueExtendedShape, DriftQueueExtendedSchema, THandler, THooks>): DriftQueue<DriftQueueSchemaShape, DriftQueueExtendedShape, DriftQueueExtendedSchema, THandler, THooks> {
    return new DriftQueue(params);
  }

  /** Returns the schema of the entity. */
  getObjectSchema(baseShape: DriftQueueSchemaShape) {
    return this.driftSchema.extend({
      shape: baseShape,
      extensions: DRIFT_QUEUE_DEFAULT_FIELDS,
    }) 
  }

  /** Returns the name of the entity. */
  getName() {
    return this.name;
  }

  /** Returns the description of the entity. */
  getDescription() {
    return this.description;
  }

  /** Returns the hooks of the entity. */
  getHooks() {
    return this.hooks;
  }

  /** Returns the handler of the entity. */
  getHandler() {
    return this.handler;
  }
}