import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { Drift, DriftQueue } from "../index";
import { MockDenoKVClient } from "./mocks/MockDenoKVClient";

describe('DriftQueue', () => {
  let drift: Drift;
  let queue: DriftQueue<any>;
  let client: MockDenoKVClient;

  beforeEach(() => {
    client = new MockDenoKVClient();
    drift = new Drift({ client });
    queue = new DriftQueue(drift, {
      name: 'testQueue',
      schema: z.object({
        id: z.string(),
        task: z.string(),
      }),
      handler: vi.fn(),
    });
  });

  it('should initialize DriftQueue', () => {
    expect(queue).toBeInstanceOf(DriftQueue);
  });

  it('should schedule a new job in the queue', async () => {
    const jobData = { id: '1', task: 'testTask' };
    await queue.schedule({ job: 'testJob', data: jobData });

    const storedJob = await client.get(['queue', 'testQueue', expect.any(String)]);
    expect(storedJob.value).toEqual(jobData);
  });

  it('should process jobs in the queue', async () => {
    const jobData = { id: '1', task: 'testTask' };
    await client.set(['queue', 'testQueue', '1'], jobData);

    const handler = vi.fn();
    queue = new DriftQueue(drift, {
      name: 'testQueue',
      schema: z.object({
        id: z.string(),
        task: z.string(),
      }),
      handler,
    });

    await queue.process();

    expect(handler).toHaveBeenCalledWith(jobData);
  });

  it('should execute queue hooks', async () => {
    const hooks = {
      onBeforeEnqueue: vi.fn(),
      onStart: vi.fn(),
      onSuccess: vi.fn(),
      onError: vi.fn(),
      onEnd: vi.fn(),
    };

    queue = new DriftQueue(drift, {
      name: 'testQueue',
      schema: z.object({
        id: z.string(),
        task: z.string(),
      }),
      handler: vi.fn(),
      hooks,
    });

    const jobData = { id: '1', task: 'testTask' };
    await queue.schedule({ job: 'testJob', data: jobData });
    await queue.process();

    expect(hooks.onBeforeEnqueue).toHaveBeenCalledWith(jobData);
    expect(hooks.onStart).toHaveBeenCalledWith(jobData);
    expect(hooks.onSuccess).toHaveBeenCalledWith(jobData);
    expect(hooks.onEnd).toHaveBeenCalled();
  });

  it('should handle retries and timeouts in job processing', async () => {
    const jobData = { id: '1', task: 'testTask' };
    await client.set(['queue', 'testQueue', '1'], jobData);

    const handler = vi.fn().mockImplementation(() => {
      throw new Error('Test error');
    });

    queue = new DriftQueue(drift, {
      name: 'testQueue',
      schema: z.object({
        id: z.string(),
        task: z.string(),
      }),
      handler,
      options: {
        retryAttempts: 1,
      },
    });

    await queue.process();

    const retries = await client.get(['queue', 'testQueue', '1', 'retries']);
    expect(retries.value).toBe(1);
  });
});
