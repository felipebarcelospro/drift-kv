import { z, ZodTypeAny } from "zod";
import { SchemaOptionalRawField, SchemaRawField, SchemaRawFieldOutput, SchemaRawShape, SchemaRawShapeToObject } from "../types";

/**
 * Defines configuration options for extending a field within a schema.
 * @template T - The Zod field type.
 * @typedef {Object} DriftSchemaFieldExtension
 * @property {"REQUIRED" | "OPTIONAL" | "HIDDEN"} rule - Rule determining the field's inclusion and requirement level.
 * @property {T} schema - The Zod schema for the field.
 * @property {() => SchemaRawFieldOutput<T>} [default] - Optional function to provide a default value.
 */
export interface DriftSchemaFieldExtension<T extends SchemaRawField = SchemaRawField> {
  rule: "REQUIRED" | "OPTIONAL" | "HIDDEN";
  schema: T;
  default?: () => SchemaRawFieldOutput<T>;
}

/**
 * Parameters required for extending the base schema with additional fields.
 * @template T - The base schema shape.
 * @template E - The additional fields to extend.
 * @typedef {Object} DriftSchemaExtendParams
 * @property {T} shape - The base schema defined by the user.
 * @property {E} extensions - Additional fields to extend the base schema with.
 */
export interface DriftSchemaExtendParams<T extends SchemaRawShape, E extends Record<string, DriftSchemaFieldExtension>> {
  shape: T;
  extensions: E;
}

/**
 * Type to build the extended Zod shape by combining the base shape with additional fields.
 * Marks additional fields as optional or required based on the field rule.
 * @template T - The base schema shape.
 * @template E - The additional fields to extend.
 */
export type DriftExtendedShape<
  T extends SchemaRawShape, 
  E extends Record<string, DriftSchemaFieldExtension>
> = 
  T & {
    [K in keyof E as E[K]['rule'] extends "REQUIRED"? K : E[K]['rule'] extends "OPTIONAL"? K : never]: E[K]['rule'] extends "REQUIRED"? E[K]['schema'] : SchemaOptionalRawField<E[K]['schema']>;
  };

/**
 * Class responsible for extending base schemas with additional fields based on rules.
 * @template DriftSchemaBaseShape - The base schema shape.
 * @template DriftSchemaExtensions - The fields to extend the schema with.
 */
export class DriftSchema<DriftSchemaBaseShape extends SchemaRawShape, DriftSchemaExtensions extends Record<string, DriftSchemaFieldExtension>> {
  public schema: SchemaRawShapeToObject<DriftExtendedShape<DriftSchemaBaseShape, DriftSchemaExtensions>>;
  public shape: DriftExtendedShape<DriftSchemaBaseShape, DriftSchemaExtensions>;

  /**
   * Static method to extend a base Zod schema with additional fields.
   *
   * @template DriftSchemaBaseShape - The base schema shape.
   * @template DriftSchemaExtensions - Additional fields to be added.
   * @param {DriftSchemaExtendParams<DriftSchemaBaseShape, DriftSchemaExtensions>} params - Object containing the base schema and fields to extend.
   * @returns {SchemaRawShapeToObject<DriftExtendedShape<DriftSchemaBaseShape, DriftSchemaExtensions>>} - A new extended ZodObject schema.
   */
  public extend(
    params: DriftSchemaExtendParams<DriftSchemaBaseShape, DriftSchemaExtensions>
  ): SchemaRawShapeToObject<DriftExtendedShape<DriftSchemaBaseShape, DriftSchemaExtensions>> {
    const { shape, extensions } = params;

    const additionalFields: Record<string, ZodTypeAny> = {};

    for (const key in extensions) {
      const field = extensions[key];
      let fieldSchema = field.schema;
      
      if (field.rule === "HIDDEN") continue;
      if (field.rule === "OPTIONAL") fieldSchema = fieldSchema.optional();

      additionalFields[key] = fieldSchema;
    }

    const baseSchema = z.object(shape);
    const extendedSchema = baseSchema.extend(additionalFields);

    this.schema = extendedSchema as SchemaRawShapeToObject<DriftExtendedShape<DriftSchemaBaseShape, DriftSchemaExtensions>>;
    this.shape = this.schema.shape as DriftExtendedShape<DriftSchemaBaseShape, DriftSchemaExtensions>;

    return this.schema;
  }
}
