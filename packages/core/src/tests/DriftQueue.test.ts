import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DriftQueueManager } from '../entities/DriftQueue';
import { DriftQueue } from '../generators/DriftQueue';
import { Drift } from "../index";
import { InMemoryDenoKv } from './kv-mock';

function makeSut({
  client = new InMemoryDenoKv(),
  handler = async (data: any) => {
    // do nothing
  },
}) {
  const testQueue = DriftQueue.create({
    name: 'testQueue',
    schema: (z) => ({
      task: z.string(),
    }),
    handler: handler,
  })

  let drift = new Drift({
    client,
    schemas: {
      entities: {},
      queues: {
        testQueue,
      },
    },
  });

  return { drift };
}

describe('DriftQueue', () => {
  let client = new InMemoryDenoKv();  

  beforeEach(() => {
    client.clear();
  });

  it('should initialize DriftQueue', () => {
    let { drift } = makeSut({
      client,
      handler: vi.fn()
    });

    expect(drift.queues.testQueue).toBeInstanceOf(DriftQueueManager);
  });

  it('should schedule a new job in the queue with UUID v7', async () => {
    let { drift } = makeSut({
      client,
      handler: vi.fn(),
    });

    const jobData = { task: 'testTask' }; // No ID provided
    const result = await drift.queues.testQueue.schedule({ 
      data: {
        task: jobData.task,
      }
     });
    
    expect(result.status).toBe('SCHEDULED');
    expect(result.topic).toBe('testQueue');
  });

  it('should schedule a new job in the queue with provided ID', async () => {
    let { drift } = makeSut({
      client,
      handler: vi.fn(),
    });

    const jobData = { id: crypto.randomUUID(), task: 'testTask' };
    const result = await drift.queues.testQueue.schedule({ data: jobData });
    
    expect(result.status).toBe('SCHEDULED');
    expect(result.topic).toBe('testQueue');
  });
});
