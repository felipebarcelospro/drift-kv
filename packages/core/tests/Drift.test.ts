import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Drift } from '../src/core/Drift';
import { DriftPlugin } from '../src/core/Plugin';
import { MockDenoKVClient } from './mocks/MockDenoKVClient';

describe('Drift', () => {
  let client: MockDenoKVClient;
  let drift: Drift;

  beforeEach(() => {
    client = new MockDenoKVClient();
    drift = new Drift({ client });
  });

  it('should initialize with default configuration', () => {
    expect(drift.client).toBe(client);
    expect(drift.plugins).toEqual([]);
    expect(drift.entities).toEqual({});
    expect(drift.queues).toEqual({});
  });

  it('should initialize with plugins', () => {
    const plugin = new DriftPlugin({
      name: 'TestPlugin',
      description: 'A test plugin',
      config: { enabled: true },
      hooks: {},
      methods: {},
    });
    drift = new Drift({ client, plugins: [plugin] });
    expect(drift.plugins).toContain(plugin);
  });

  it('should register entities and queues', () => {
    const entityFactory = vi.fn().mockReturnValue({});
    const queueFactory = vi.fn().mockReturnValue({});
    drift = new Drift({
      client,
      schemas: {
        entities: { testEntity: entityFactory },
        queues: { testQueue: queueFactory },
      },
    });
    expect(drift.entities.testEntity).toBeDefined();
    expect(drift.queues.testQueue).toBeDefined();
  });

  it('should execute lifecycle hooks', async () => {
    const hooks = {
      beforeConnect: vi.fn(),
      onConnect: vi.fn(),
      afterConnect: vi.fn(),
      onEnd: vi.fn(),
      onError: vi.fn(),
    };
    drift = new Drift({ client, hooks });
    await drift.close();
    expect(hooks.beforeConnect).toHaveBeenCalled();
    expect(hooks.onConnect).toHaveBeenCalled();
    expect(hooks.afterConnect).toHaveBeenCalled();
    expect(hooks.onEnd).toHaveBeenCalled();
  });

  it('should execute hooks and plugins during database operations', async () => {
    const pluginHook = vi.fn();
    const plugin = new DriftPlugin({
      name: 'TestPlugin',
      description: 'A test plugin',
      config: { enabled: true },
      hooks: { beforeQuery: pluginHook },
      methods: {},
    });
    drift = new Drift({ client, plugins: [plugin] });
    await drift.executeHook('beforeQuery', {});
    expect(pluginHook).toHaveBeenCalled();
  });

  it('should properly clean up on close', async () => {
    const hooks = {
      onEnd: vi.fn(),
    };
    drift = new Drift({ client, hooks });
    await drift.close();
    expect(hooks.onEnd).toHaveBeenCalled();
  });
});
