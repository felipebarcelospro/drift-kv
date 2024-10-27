/**
 * DriftWatcher module for real-time data monitoring
 * @module DriftWatcher
 */

import { DriftEntity } from "../entities/DriftEntity";
import { Drift } from "./Drift";

/**
 * Parameters for configuring watch operations
 * @interface WatchParams
 * @template T Entity type being watched
 */
interface WatchParams<T> {
  /** Fields to select from the entity */
  select?: { [K in keyof T]?: boolean };
  /** Related entities to include */
  include?: {
    [K in keyof T]?:
      | boolean
      | {
          select?: { [K2 in keyof T[K]]?: boolean };
          where?: { [K2 in keyof T[K]]?: any };
          orderBy?: { [K2 in keyof T[K]]?: "asc" | "desc" };
          skip?: number;
          take?: number;
        };
  };
  /** Filter conditions */
  where?: { [K in keyof T]?: any };
  /** Sorting options */
  orderBy?: { [K in keyof T]?: "asc" | "desc" };
  /** Fields to get distinct values for */
  distinct?: Array<keyof T>;
}

/**
 * DriftWatcher class for monitoring real-time changes to entities
 * @class DriftWatcher
 * @template T Entity type being watched
 */
export class DriftWatcher<T extends { id: any }> {
  private drift: Drift;
  private entity: DriftEntity<T>;

  /**
   * Creates a new DriftWatcher instance
   * @param {Drift} drift - Drift instance
   * @param {DriftEntity<T>} entity - Entity to watch
   */
  constructor(drift: Drift, entity: DriftEntity<T>) {
    this.drift = drift;
    this.entity = entity;
  }

  /**
   * Watch changes to a single entity by ID
   * @param {any} id - ID of entity to watch
   * @param {WatchParams<T>} params - Watch configuration parameters
   * @param {function} callback - Function called with changes
   */
  public watch(
    id: any,
    params: WatchParams<T>,
    callback: (changes: T) => void,
  ) {
    const key = [this.entity.name, id];
    const watcher = this.drift.client.watch({ key });

    (async () => {
      for await (const res of watcher) {
        const value = res.value;
        if (!value) continue;

        // Apply where filters
        const filtered = this.entity["applyWhere"](
          [value],
          params.where || {},
        )[0];
        if (filtered) {
          // Apply select and include
          const result = this.entity["applySelectInclude"](
            filtered,
            params.select,
            params.include,
          );
          callback(result);
        }
      }
    })();
  }

  /**
   * Watch changes to all entities of this type
   * @param {WatchParams<T>} params - Watch configuration parameters
   * @param {function} callback - Function called with changes
   */
  public watchAll(params: WatchParams<T>, callback: (changes: T[]) => void) {
    const iterator = this.drift.client.watch({ prefix: [this.entity.name] });

    (async () => {
      for await (const res of iterator) {
        let records = [res.value];
        if (params.where) {
          records = this.entity["applyWhere"](records, params.where);
        }
        if (params.distinct) {
          records = this.entity["applyDistinct"](records, params.distinct);
        }
        if (params.orderBy) {
          records = this.entity["applyOrderBy"](records, params.orderBy);
        }
        const results = records.map((record) =>
          this.entity["applySelectInclude"](
            record,
            params.select,
            params.include,
          ),
        );
        callback(results);
      }
    })();
  }
}
