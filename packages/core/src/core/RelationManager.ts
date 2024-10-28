import { Kv, KvEntry, KvKey } from "@deno/kv";
import { z } from "zod";
import { RelationDefinition } from "../types";

/**
 * Manages relations between items in the key-value store.
 */
export class RelationManager {
  private kv: Kv;

  /**
   * Creates an instance of RelationManager.
   * @param kv - The key-value store instance.
   */
  constructor(kv: Kv) {
    this.kv = kv;
  }

  /**
   * Retrieves related items based on the relation definition and the provided key.
   * @param relationDefinition - The definition of the relation.
   * @param key - The key to retrieve related items for.
   * @returns A promise that resolves to an array of related items.
   */
  public async getRelatedItems(
    relationDefinition: RelationDefinition,
    key: KvKey,
  ): Promise<KvEntry<z.output<ReturnType<typeof this.getRelationSchema>>>[]> {
    const schema = this.getRelationSchema(relationDefinition);
    const relatedItems: KvEntry<z.output<typeof schema>>[] = [];

    for await (const item of this.kv.list({ prefix: key })) {
      if ("key" in item && "value" in item && "versionstamp" in item) {
        relatedItems.push(item);
      }
    }

    return relatedItems;
  }

  /**
   * Validates the relation definition.
   * @param relationDefinition - The definition of the relation to validate.
   * @returns A boolean indicating whether the relation definition is valid.
   */
  public validateRelationDefinition(
    relationDefinition: RelationDefinition,
  ): boolean {
    try {
      this.isValidRelationDefinition(relationDefinition);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Checks if the relation is a one-to-many relation.
   * @param relationDefinition - The definition of the relation to check.
   * @returns A boolean indicating whether the relation is one-to-many.
   */
  public isToManyRelation(relationDefinition: RelationDefinition): boolean {
    return Array.isArray(relationDefinition[1]);
  }

  /**
   * Retrieves the schema for the relation based on the relation definition.
   * @param relationDefinition - The definition of the relation.
   * @returns The Zod schema for the relation.
   */
  public getRelationSchema(
    relationDefinition: RelationDefinition,
  ): ReturnType<typeof z.object> {
    return this.isToManyRelation(relationDefinition)
      ? (relationDefinition[1][0] as ReturnType<typeof z.object>)
      : (relationDefinition[1] as ReturnType<typeof z.object>);
  }

  /**
   * Validates the relation definition.
   * @param relationDefinition - The definition of the relation to validate.
   * @throws An error if the validation is not implemented.
   */
  public isValidRelationDefinition(
    relationDefinition: RelationDefinition,
  ): void {
    if (!relationDefinition || relationDefinition.length < 2) {
      throw new Error(
        "Invalid relation definition: must contain at least two elements.",
      );
    }

    const [relationName, relationSchema] = relationDefinition;

    if (typeof relationName !== "string" || relationName.trim() === "") {
      throw new Error("Invalid relation name: must be a non-empty string.");
    }

    if (
      !relationSchema ||
      (typeof relationSchema !== "object" && !Array.isArray(relationSchema))
    ) {
      throw new Error(
        "Invalid relation schema: must be an object or an array.",
      );
    }
  }
}
