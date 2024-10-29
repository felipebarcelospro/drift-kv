import { describe, expect, it, vi } from 'vitest';
import { Drift } from '../core/Drift';
import { DriftEntity } from '../generators/DriftEntity';
import { DriftQueue } from '../generators/DriftQueue';
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

    expect(drift.entities).toEqual({});
    expect(drift.queues).toEqual({});
  });

  it('should register entities and queues', () => {
    const entity = DriftEntity.create({
      name: 'testEntity',
      schema: (z) => ({
        name: z.string(),
      }),
    })

    const queue = DriftQueue.create({
      name: 'testQueue',
      schema: (z) => ({
        name: z.string(),
      }),
      handler: async (data) => {
        // do nothing
      }
    })

    const drift = new Drift({
      client,
      schemas: {
        entities: { 
          testEntity: entity,
        },
        queues: { 
          testQueue: queue,
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

    new Drift({ 
      client, 
      hooks,
      schemas: {
        entities: {},
        queues: {},
      },
    });

    expect(hooks.onConnect).toHaveBeenCalled();
  });
});
