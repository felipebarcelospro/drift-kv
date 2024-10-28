import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { Drift, DriftQueue } from "../index";
import { InMemoryDenoKv } from './kv-mock';

function makeSut({
  client = new InMemoryDenoKv(),
  handler = async (data: any) => {
    console.log("Job completed", data);
  },
}) {
  let drift = new Drift({
    client,
    schemas: {
      entities: {},
      queues: {
        testQueue: {
          name: 'testQueue',
          handler,
          schema: z.object({
            id: z.string(),
            task: z.string(),
          }),
        },
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
    expect(drift.queues.testQueue).toBeInstanceOf(DriftQueue);
  });

  it('should schedule a new job in the queue', async () => {
    let { drift } = makeSut({
      client,
      handler: vi.fn(),
    });

    const jobData = { id: '1', task: 'testTask' };
    const result = await drift.queues.testQueue.schedule({ topic: 'testQueue', data: jobData });
    
    expect(result.success).toBe(true);
    expect(result.topic).toBe('testQueue');
    expect(result.versionstamp).toBeDefined();
  });
});
