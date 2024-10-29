/**
 * DriftWatcher module for real-time data monitoring
 * @module DriftWatcher
 */

import { Kv } from "@deno/kv";
import { z } from "zod";
import { DriftEntity } from "../generators/DriftEntity";
import { DriftWatchParams } from "../types";
import { Drift } from "./Drift";
import { KeyManager } from "./KeyManager";
/**
 * DriftWatcher class for monitoring real-time changes to entities
 * @class DriftWatcher
 * @template T Entity type being watched
 */
export class DriftWatcher<T extends DriftEntity<any, any, any>> {
  private kv: Kv;
  private entity: T;
  private keyManager: KeyManager<T>;
  
  /**
   * Creates a new DriftWatcher instance
   * @param {Drift} drift - Drift instance
   * @param {DriftEntity<T>} entity - Entity to watch
   */
  constructor({
    entity,
    client,
    keyManager,
  }: {
    entity: T;
    client: Kv;
    keyManager: KeyManager<T>;
  }) {
    this.kv = client;
    this.entity = entity;
    this.keyManager = keyManager;
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
    queryArgs: DriftWatchParams<T>,
    callback: (changes: T | null) => void,
  ) {
    const keys = this.keyManager.schemaToKeys(
      queryArgs.where ?? [],
    );

    let cancelled = false;

    const cancel = async () => {
      if (cancelled) return;
      cancelled = true;
    };

    const promise = (async () => {
      try {
        const stream = this.kv.watch(keys.map((key) => key.kv));
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
