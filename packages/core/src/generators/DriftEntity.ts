import { z } from "zod";
import { DriftEntityHooks, SchemaRawShape, SchemaRawShapeToObject } from "../types";
import { DriftExtendedShape, DriftSchema } from "./DriftSchema";

/**
 * Interface for defining entity options.
 * @typedef {Object} EntityOptions
 * @property {boolean} [timestamps] - If true, adds 'createdAt' and 'updatedAt' timestamps to the entity schema.
 */
interface EntityOptions {
  timestamps?: boolean;
}

/**
 * Default fields for entities without timestamps.
 * These fields are always included in the entity schema.
 */
export const DRIFT_ENTITY_DEFAULT_FIELDS_WITHOUT_TIMESTAMPS = {
  id: {
    rule: "OPTIONAL" as const,
    schema: z.string().describe('primary'),
    default: () => crypto.randomUUID(),
  },
};

/**
 * Default fields for entities with timestamps.
 * Includes 'id', 'createdAt', and 'updatedAt' fields.
 */
export const DRIFT_ENTITY_DEFAULT_FIELDS_WITH_TIMESTAMPS = {
  ...DRIFT_ENTITY_DEFAULT_FIELDS_WITHOUT_TIMESTAMPS,
  createdAt: {
    rule: "OPTIONAL" as const,
    schema: z.date(),
    default: () => new Date(),
  },
  updatedAt: {
    rule: "OPTIONAL" as const,
    schema: z.date(),
    default: () => new Date(),
  },
};

/**
 * Type for default fields based on entity options.
 * If `timestamps` is enabled, includes 'createdAt' and 'updatedAt'.
 * @template T - The entity options.
 */
export type DriftEntityDefaultFields<T extends EntityOptions> = T extends { timestamps: true } 
  ? typeof DRIFT_ENTITY_DEFAULT_FIELDS_WITH_TIMESTAMPS 
  : typeof DRIFT_ENTITY_DEFAULT_FIELDS_WITHOUT_TIMESTAMPS;

/**
 * Data Transfer Object (DTO) for creating a DriftEntity instance.
 * @template DriftEntitySchemaShape - The base schema shape.
 * @template DriftEntityOptions - The entity options.
 * @template DriftEntityExtendedShape - The extended schema shape based on options.
 */
export type DriftEntityDTO<
  DriftEntitySchemaShape extends SchemaRawShape,
  DriftEntityOptions extends EntityOptions,
  DriftEntityExtendedShape extends SchemaRawShapeToObject<DriftExtendedShape<DriftEntitySchemaShape, DriftEntityDefaultFields<DriftEntityOptions>>>
> = {
  /** The name of the entity */
  name: string;
  /** Optional description of the entity */
  description?: string;
  /** Function to define the schema of the entity */
  schema: (schema: typeof z) => DriftEntitySchemaShape;
  /** Additional options for the entity */
  options?: DriftEntityOptions;
  /** Optional hooks for entity lifecycle events */
  hooks?: DriftEntityHooks<DriftEntity<DriftEntitySchemaShape, DriftEntityOptions, DriftEntityExtendedShape>>;
};

/**
 * Represents an entity in Drift KV, using Zod for schema validation.
 * @template DriftEntitySchemaShape - The base schema shape.
 * @template DriftEntityOptions - The entity options.
 * @template DriftEntityExtendedShape - The extended schema shape based on options.
 */
export class DriftEntity<
  DriftEntitySchemaShape extends SchemaRawShape,
  DriftEntityOptions extends EntityOptions,
  DriftEntityExtendedShape extends SchemaRawShapeToObject<DriftExtendedShape<DriftEntitySchemaShape, DriftEntityDefaultFields<DriftEntityOptions>>>
> {
  name: string;
  description?: string;
  schema: SchemaRawShapeToObject<DriftExtendedShape<DriftEntitySchemaShape, DriftEntityDefaultFields<DriftEntityOptions>>>;
  hooks?: DriftEntityHooks<DriftEntity<DriftEntitySchemaShape, DriftEntityOptions, DriftEntityExtendedShape>>;
  options?: DriftEntityOptions;

  private driftSchema: DriftSchema<DriftEntitySchemaShape, DriftEntityDefaultFields<DriftEntityOptions>>;

  /**
   * Constructs a new DriftEntity instance.
   *
   * @param {DriftEntityDTO<DriftEntitySchemaShape, DriftEntityOptions, DriftEntityExtendedShape>} params - Parameters to create the entity.
   * @throws {Error} If the name or schema is missing.
   */
  constructor(params: DriftEntityDTO<DriftEntitySchemaShape, DriftEntityOptions, DriftEntityExtendedShape>) {
    const { name, description, schema, hooks, options } = params;

    if (!name || !schema) {
      throw new Error("Name and schema are required.");
    }

    // Instantiate DriftSchema with base shape and extensions
    this.driftSchema = new DriftSchema<DriftEntitySchemaShape, DriftEntityDefaultFields<DriftEntityOptions>>();

    // Extend the base schema with default fields based on options
    const extendedSchema = this.driftSchema.extend({
      shape: schema(z),
      extensions: options?.timestamps ? DRIFT_ENTITY_DEFAULT_FIELDS_WITH_TIMESTAMPS : DRIFT_ENTITY_DEFAULT_FIELDS_WITHOUT_TIMESTAMPS as DriftEntityDefaultFields<DriftEntityOptions>,
    });

    this.schema = extendedSchema;
    this.name = name;
    this.description = description;
    this.hooks = hooks;
    this.options = options;
  }

  /**
   * Static method to create a new instance of DriftEntity.
   *
   * @param {DriftEntityDTO<DriftEntitySchemaShape, DriftEntityOptions, DriftEntityExtendedShape>} params - Parameters to create the entity.
   * @returns {DriftEntity<DriftEntitySchemaShape, DriftEntityOptions, DriftEntityExtendedShape>} A new instance of DriftEntity.
   */
  static create<
    DriftEntitySchemaShape extends SchemaRawShape,
    DriftEntityOptions extends EntityOptions,
    DriftEntityExtendedShape extends SchemaRawShapeToObject<DriftExtendedShape<DriftEntitySchemaShape, DriftEntityDefaultFields<DriftEntityOptions>>>
  >(params: DriftEntityDTO<DriftEntitySchemaShape, DriftEntityOptions, DriftEntityExtendedShape>): DriftEntity<DriftEntitySchemaShape, DriftEntityOptions, DriftEntityExtendedShape> {
    return new DriftEntity(params);
  }

  /** Returns the schema of the entity. */
  getSchema() {
    return this.schema;
  }

  /** Returns the name of the entity. */
  getName() {
    return this.name;
  }

  /** Returns the description of the entity. */
  getDescription() {
    return this.description;
  }

  /** Returns the hooks for the entity lifecycle. */
  getHooks() {
    return this.hooks;
  }

  /** Returns the options set for the entity. */
  getOptions() {
    return this.options;
  }
}
