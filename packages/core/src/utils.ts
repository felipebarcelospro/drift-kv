import { Drift } from "./core/Drift";
import { DriftWatcher } from "./core/Watcher";
import { DriftEntity } from "./entities/DriftEntity";
import { DriftQueue } from "./entities/DriftQueue";
import { QueueOptions } from "./types";

export function createEntity<T extends { id: any }>(
  drift: Drift,
  options: any,
): DriftEntity<T> {
  return new DriftEntity<T>(drift, options);
}

export function createQueue<T>(
  drift: Drift,
  options: QueueOptions<T>,
): DriftQueue<T> {
  return new DriftQueue<T>(drift, options);
}

export function createWatcher<T extends { id: any }>(
  drift: Drift,
  entity: DriftEntity<T>,
): DriftWatcher<T> {
  return new DriftWatcher<T>(drift, entity);
}
