import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { Drift } from '../core/Drift';
import { DriftPlugin } from '../core/Plugin';
import { InMemoryDenoKv } from './kv-mock';

describe('Drift', () => {
  let client = new InMemoryDenoKv();

  it('should initialize with default configuration', () => {
    const drift = new Drift({ 
      client,
      schemas: {
        entities: {},
        queues: {},
      },
    });

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

  it('should register entities and queues', () => {
    const drift = new Drift({
      client,
      schemas: {
        entities: { 
          testEntity: {
            name: 'testEntity',
            schema: z.object({
              id: z.string().uuid().describe('primary'),
              name: z.string(),
            }),
          },
        },
        queues: { 
          testQueue: {
            name: 'testQueue',
            schema: z.object({
              id: z.string().uuid().describe('primary'),
              name: z.string(),
            }),
            handler: vi.fn(),
          },
        },
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

    const drift = new Drift({ 
      client, 
      hooks,
      schemas: {
        entities: {},
        queues: {},
      },
    });

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

    const drift = new Drift({ 
      client, 
      plugins: [plugin],
      schemas: {
        entities: {},
        queues: {},
      },
    });

    await drift.executeHook('beforeQuery', {});
    expect(pluginHook).toHaveBeenCalled();
  });

  it('should properly clean up on close', async () => {
    const hooks = {
      onEnd: vi.fn(),
    };
    
    const drift = new Drift({ 
      client, 
      hooks,
      schemas: {
        entities: {},
        queues: {},
      },
    });
    
    await drift.close();
    expect(hooks.onEnd).toHaveBeenCalled();
  });
});
