import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { Drift, DriftEntity, DriftWatcher } from "../index";
import { MockDenoKVClient } from "./mocks/MockDenoKVClient";

describe('DriftWatcher', () => {
  let drift: Drift;
  let entity: DriftEntity<any>;
  let watcher: DriftWatcher<any>;
  let client: MockDenoKVClient;

  beforeEach(() => {
    client = new MockDenoKVClient();
    drift = new Drift({ client });
    entity = new DriftEntity(drift, {
      name: 'testEntity',
      schema: z.object({
        id: z.string(),
        name: z.string(),
        age: z.number(),
      }),
    });
    watcher = new DriftWatcher(drift, entity);
  });

  it('should initialize DriftWatcher', () => {
    expect(watcher).toBeInstanceOf(DriftWatcher);
  });

  it('should watch changes to a single entity', async () => {
    const callback = vi.fn();
    const params = { where: { age: { gt: 18 } } };

    watcher.watch('1', params, callback);

    await client.set(['testEntity', '1'], { id: '1', name: 'John', age: 20 });

    expect(callback).toHaveBeenCalledWith({ id: '1', name: 'John', age: 20 });
  });

  it('should watch changes to all entities of a specific type', async () => {
    const callback = vi.fn();
    const params = { where: { age: { gt: 18 } } };

    watcher.watchAll(params, callback);

    await client.set(['testEntity', '1'], { id: '1', name: 'John', age: 20 });
    await client.set(['testEntity', '2'], { id: '2', name: 'Jane', age: 25 });

    expect(callback).toHaveBeenCalledWith([
      { id: '1', name: 'John', age: 20 },
      { id: '2', name: 'Jane', age: 25 },
    ]);
  });

  it('should apply filters, sorting, and pagination in watch method', async () => {
    const callback = vi.fn();
    const params = {
      where: { age: { gt: 18 } },
      orderBy: { age: 'desc' as "asc" | "desc" },
      skip: 1,
      take: 1,
    };

    watcher.watchAll(params, callback);

    await client.set(['testEntity', '1'], { id: '1', name: 'John', age: 20 });
    await client.set(['testEntity', '2'], { id: '2', name: 'Jane', age: 25 });
    await client.set(['testEntity', '3'], { id: '3', name: 'Doe', age: 30 });

    expect(callback).toHaveBeenCalledWith([
      { id: '2', name: 'Jane', age: 25 },
    ]);
  });
});
