/**
 * Drift KV - A lightweight and flexible ORM for key-value databases
 * @module Drift
 */

export { Drift } from "./core/Drift";
export { DriftPlugin } from "./core/Plugin";
export { DriftWatcher } from "./core/Watcher";
export { DriftEntity } from "./entities/DriftEntity";
export { DriftQueue } from "./entities/DriftQueue";

// Export types
export type { QueueHooks, QueueOptions, WatchParams } from "./types";

// Export errors
export {
  ConnectionError,
  DriftError,
  QueryError,
  ValidationError
} from "./errors";

// Export utilities
export { createEntity, createQueue, createWatcher } from "./utils";

// Export constants
export { DEFAULT_CONFIG, ERROR_CODES, PLUGIN_EVENTS } from "./constants";
