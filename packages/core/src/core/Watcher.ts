/**
 * DriftWatcher module for real-time data monitoring
 * @module DriftWatcher
 */

import { Kv } from "@deno/kv";
import { z } from "zod";
import { DriftTableDefinition, WithMaybeVersionstamp } from "../types";
import { schemaToKeys } from "../utils";
import { Drift } from "./Drift";
/**
 * DriftWatcher class for monitoring real-time changes to entities
 * @class DriftWatcher
 * @template T Entity type being watched
 */
export class DriftWatcher<T extends DriftTableDefinition> {
  private kv: Kv;
  /**
   * Creates a new DriftWatcher instance
   * @param {Drift} drift - Drift instance
   * @param {DriftEntity<T>} entity - Entity to watch
   */
  constructor(drift: Drift) {
    this.kv = drift.client;
  }

  /**
   * Watch changes to entities based on query arguments
   * @param {string} tableName - Name of the table to watch
   * @param {T} tableDefinition - Definition of the table schema
   * @param {Object} queryArgs - Query arguments for filtering entities
   * @param {Partial<WithMaybeVersionstamp<z.output<T["schema"]>>>} [queryArgs.where] - Optional filter conditions
   * @param {function} callback - Function called with changes
   * @returns {{promise: Promise<void>, cancel: () => Promise<void>}} Promise and cancel function
   */
  public watch(
    tableName: string,
    tableDefinition: DriftTableDefinition,
    queryArgs: {
      where?: Partial<
        WithMaybeVersionstamp<z.output<typeof tableDefinition.schema>>
      >;
    },
    callback: (changes: T | null) => void,
  ) {
    const keys = schemaToKeys(
      tableName,
      tableDefinition.schema,
      queryArgs.where ?? [],
    );

    let cancelled = false;

    const cancel = async () => {
      if (cancelled) return;
      cancelled = true;
    };

    const promise = (async () => {
      try {
        const stream = this.kv.watch(keys.map(({ kvKey }) => kvKey));
        // @ts-ignore
        for await (const entries of stream) {
          if (cancelled) break;
          const entry = entries[0];
          if (entry && entry.value !== undefined) {
            callback(entry.value as T | null);
          } else {
            callback(null);
          }
        }
      } catch (err) {
        console.error("Error watching entity:", err);
        throw err;
      }
    })();

    return { promise, cancel };
  }
}
