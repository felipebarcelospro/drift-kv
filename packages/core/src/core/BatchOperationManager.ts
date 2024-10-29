import { AtomicOperation, Kv } from "@deno/kv";
import { DriftBatchOpError } from "../errors";
import { DriftEntity } from "../generators/DriftEntity";
import { Entity, EntityInput } from "../types";

const OPERATION_LIMIT = 10;

/**
 * Manages batch operations for Deno KV, allowing for efficient
 * processing of multiple operations in a single transaction.
 *
 * This class handles the batching of operations to comply with
 * the current limit of 10 operations per transaction.
 *
 * @template T - The type of items to be processed in batch operations.
 */
export class BatchOperationManager<T extends DriftEntity<any, any, any>> {
  private kv: Kv;
  private entity: T;

  /**
   * Creates an instance of BatchOperationManager.
   *
   * @param kv - The key-value store instance used for batch operations.
   */
  constructor({
    kv,
    entity,
  }: {
    kv: Kv;
    entity: T;
  }) {
    this.kv = kv;
    this.entity = entity;
  }

  /**
   * Executes a function on a batch of items, committing the operations
   * in groups of up to 10.
   *
   * @param itemsToBatch - The array of items to be processed.
   * @param fn - The function to execute for each item, which receives
   *             the atomic operation and the item itself.
   * @param opName - Optional name of the operation being performed
   *                 (e.g., "create", "update", "delete", "read").
   * @returns A promise that resolves to an array of items with versionstamps.
   * @throws DriftBatchOpError if the batched operation fails.
   */
  public async executeBatch(
    itemsToBatch: EntityInput<T>[],
    fn: (res: AtomicOperation, item: EntityInput<T>) => undefined | unknown,
    opName?: "create" | "update" | "delete" | "read",
    options?: {
      timestamps?: boolean;
    },
  ): Promise<Entity<T>[]> {
    const itemBatches: Entity<T>[][] = [];
    const itemsWithVersionstamps: Entity<T>[] = [];

    // Split items into batches
    for (let i = 0; i < itemsToBatch.length; i += OPERATION_LIMIT) {
      const batch = itemsToBatch.slice(i, i + OPERATION_LIMIT).map(item => item as Entity<T>);
      itemBatches.push(batch);
    }

    // Process each batch
    for (const batch of itemBatches) {
      const res = this.kv.atomic();
      for (let item of batch) {
        const returnData = fn(res, item);
        if (returnData) {
          item = returnData as Entity<T>;
        }
      }
      const commitResult = await res.commit();

      if (commitResult.ok === false) {
        throw new DriftBatchOpError(
          `Could not perform batched ${opName ? opName + " " : " "}operation.`,
        );
      }

      // Add versionstamp and timestamps to the batch
      const timestamp = new Date();
      for (const item of batch) {
        if (options?.timestamps) {
          itemsWithVersionstamps.push({
            ...item,
            versionstamp: commitResult.versionstamp,
            createdAt: timestamp,
            updatedAt: timestamp,
          });
        } else {
          itemsWithVersionstamps.push({
            ...item,
            versionstamp: commitResult.versionstamp,
          });
        }
      }
    }

    return itemsWithVersionstamps;
  }
}
