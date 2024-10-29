import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Drift, DriftEntity } from "../index";
import { InMemoryDenoKv } from './kv-mock';

describe('DriftWatcher', () => {
  let client = new InMemoryDenoKv();
  const user = new DriftEntity({
    name: 'user',
    schema: (z) => ({
      name: z.string(),
    }),
  });

  let drift = new Drift({
    client,
    schemas: {
      entities: {
        user,
      },
      queues: {},
    },
  });

  beforeEach(() => {
    client.clear();
  });

  it('should initialize DriftWatcher', () => {
    expect(drift.entities.user.watch).toBeDefined();
  });

  it('should watch changes to a single entity', async () => {
    const callback = vi.fn();

    const userData = {
      name: 'John',
    };

    const user = await drift.entities.user.create({
      data: userData,
    });

    const { cancel } = drift.entities.user.watch({
      where: { id: user.id },
      callback,
    });

    await drift.entities.user.update({
      where: { id: user.id },
      data: {
        name: 'Jane',
      },
    });

    // Wait for the callback to be called
    await new Promise((resolve) => setTimeout(resolve, 1500));

    expect(callback).toHaveBeenCalledWith({
      ...userData,
      name: 'Jane',
    });

    await cancel();
  });
});
