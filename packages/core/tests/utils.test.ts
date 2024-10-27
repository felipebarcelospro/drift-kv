import { beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { Drift } from '../src/core/Drift';
import { DriftWatcher } from '../src/core/Watcher';
import { DriftEntity } from '../src/entities/DriftEntity';
import { DriftQueue } from '../src/entities/DriftQueue';
import { createEntity, createQueue, createWatcher } from '../src/utils';
import { MockDenoKVClient } from './mocks/MockDenoKVClient';

describe('Utility Functions', () => {
  let drift: Drift;

  beforeEach(() => {
    const client = new MockDenoKVClient();
    drift = new Drift({ client });
  });

  describe('createEntity', () => {
    it('should create a DriftEntity instance', () => {
      const entityOptions = {
        name: 'testEntity',
        schema: z.object({
          id: z.string(),
          name: z.string(),
        }),
      };
      const entity = createEntity(drift, entityOptions);
      expect(entity).toBeInstanceOf(DriftEntity);
      expect(entity.name).toBe('testEntity');
    });
  });

  describe('createQueue', () => {
    it('should create a DriftQueue instance', () => {
      const queueOptions = {
        name: 'testQueue',
        schema: z.object({
          id: z.string(),
          task: z.string(),
        }),
        handler: async (data: any) => {
          // handler logic
        },
      };
      const queue = createQueue(drift, queueOptions);
      expect(queue).toBeInstanceOf(DriftQueue);
      expect(queue.name).toBe('testQueue');
    });
  });

  describe('createWatcher', () => {
    it('should create a DriftWatcher instance', () => {
      const entityOptions = {
        name: 'testEntity',
        schema: z.object({
          id: z.string(),
          name: z.string(),
        }),
      };
      const entity = createEntity(drift, entityOptions);
      const watcher = createWatcher(drift, entity);
      expect(watcher).toBeInstanceOf(DriftWatcher);
    });
  });
});
