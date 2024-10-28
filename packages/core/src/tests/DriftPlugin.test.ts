import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { Drift, DriftPlugin } from "../index";
import { InMemoryDenoKv } from './kv-mock';
describe('DriftPlugin', () => {
  let client = new InMemoryDenoKv();
  let drift = new Drift({
    client,
    schemas: {
      entities: {
        testEntity: {
          name: 'testEntity',
          schema: z.object({
            id: z.string().uuid().describe('primary'),
            name: z.string(),
            age: z.number().optional(),
          }),
        },
      },
      queues: {},
    },
  });

  beforeEach(() => {
    client.clear();
  });

  it('should initialize the plugin', () => {
    const plugin = new DriftPlugin({
      name: 'TestPlugin',
      description: 'A test plugin',
      config: { enabled: true },
      hooks: {},
      methods: {},
    });

    plugin.initialize(drift);

    expect(plugin.name).toBe('TestPlugin');
    expect(plugin.description).toBe('A test plugin');
    expect(plugin.config.enabled).toBe(true);
  });

  it('should execute plugin hooks', async () => {
    const onConnectHook = vi.fn();
    const plugin = new DriftPlugin({
      name: 'TestPlugin',
      description: 'A test plugin',
      config: { enabled: true },
      hooks: {
        onConnect: onConnectHook,
      },
      methods: {},
    });

    await plugin.executeHook('onConnect', client, {});

    expect(onConnectHook).toHaveBeenCalledWith(client, {});
  });

  it('should execute query method with hooks', async () => {
    const beforeQueryHook = vi.fn();
    const afterQueryHook = vi.fn();
    const plugin = new DriftPlugin({
      name: 'TestPlugin',
      description: 'A test plugin',
      config: { enabled: true },
      hooks: {
        beforeQuery: beforeQueryHook,
        afterQuery: afterQueryHook,
      },
      methods: {},
    });

    await plugin.query('create', { data: 'test' }, {});

    expect(beforeQueryHook).toHaveBeenCalledWith({ action: 'create', params: { data: 'test' } }, {});
    expect(afterQueryHook).toHaveBeenCalledWith({ data: 'test' }, {});
  });

  it('should integrate with Drift class', async () => {
    const plugin = new DriftPlugin({
      name: 'TestPlugin',
      description: 'A test plugin',
      config: { enabled: true },
      hooks: {},
      methods: {},
    });

    const drift = new Drift({
      client,
      plugins: [plugin],
      schemas: {
        entities: {},
        queues: {},
      },
    });

    expect(drift.plugins).toContain(plugin);
  });
});
