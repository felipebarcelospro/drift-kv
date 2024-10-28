import { DriftPlugin } from 'src/mod';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { Drift } from '../core/Drift';
import { InMemoryDenoKv } from './kv-mock';

describe('DriftEntity', () => {
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

  it('should initialize correctly', () => {
    expect(drift.entities.testEntity).toBeDefined();
  });

  it('should create a new entity record', async () => {
    const data = { id: crypto.randomUUID(), name: 'Test' };
    const result = await drift.entities.testEntity.create({ data });
    expect(result).toHaveProperty('id', data.id);
    expect(result).toHaveProperty('name', data.name);
  });

  it('should find a unique entity record', async () => {
    const data = { id: crypto.randomUUID(), name: 'Test' };
    await drift.entities.testEntity.create({ data });
    const result = await drift.entities.testEntity.findUnique({ where: { id: data.id } });
    expect(result).toHaveProperty('id', data.id);
    expect(result).toHaveProperty('name', data.name);
  });

  it('should find multiple entity records', async () => {
    const data1 = { id: crypto.randomUUID(), name: 'Test1' };
    const data2 = { id: crypto.randomUUID(), name: 'Test2' };
    await drift.entities.testEntity.create({ data: data1 });
    await drift.entities.testEntity.create({ data: data2 });
    const results = await drift.entities.testEntity.findMany({});
    expect(results[0]).toHaveProperty('id', data1.id);
    expect(results[0]).toHaveProperty('name', data1.name);
    
    expect(results[1]).toHaveProperty('id', data2.id);
    expect(results[1]).toHaveProperty('name', data2.name);
  });

  it('should update an existing entity record', async () => {
    const data = { id: crypto.randomUUID(), name: 'Test' };
    await drift.entities.testEntity.create({ data });
    const updatedData = { name: 'Updated Test' };
    const result = await drift.entities.testEntity.update({ where: { id: data.id }, data: updatedData });
    expect(result).toHaveProperty('id', data.id);
    expect(result).toHaveProperty('name', updatedData.name);
  });

  it('should delete an entity record', async () => {
    const data = { id: crypto.randomUUID(), name: 'Test' };
    await drift.entities.testEntity.create({ data });
    const result = await drift.entities.testEntity.delete({ where: { id: data.id } });
    expect(result).toBeNull();
  });

  it('should apply filters in findMany', async () => {
    const data1 = { id: crypto.randomUUID(), name: 'Test1', age: 20 };
    const data2 = { id: crypto.randomUUID(), name: 'Test2', age: 30 };

    await drift.entities.testEntity.create({ data: data1 });
    await drift.entities.testEntity.create({ data: data2 });

    const results = await drift.entities.testEntity.findMany({ where: { age: 30 } });

    expect(results).toHaveLength(1);
    expect(results[0]).toHaveProperty('id', data2.id);
    expect(results[0]).toHaveProperty('name', data2.name);
    expect(results[0]).toHaveProperty('age', data2.age);
  });

  it('should apply sorting in findMany', async () => {
    const data1 = { id: crypto.randomUUID(), name: 'Test1', age: 20 };
    const data2 = { id: crypto.randomUUID(), name: 'Test2', age: 30 };
    await drift.entities.testEntity.create({ data: data1 });
    await drift.entities.testEntity.create({ data: data2 });
    const results = await drift.entities.testEntity.findMany({ orderBy: { age: 'desc' } });
    expect(results[0]).toHaveProperty('id', data2.id);
    expect(results[0]).toHaveProperty('name', data2.name);
    expect(results[0]).toHaveProperty('age', data2.age);
    
    expect(results[1]).toHaveProperty('id', data1.id);
    expect(results[1]).toHaveProperty('name', data1.name);
    expect(results[1]).toHaveProperty('age', data1.age);
  });

  it('should apply pagination in findMany', async () => {
    const data1 = { id: crypto.randomUUID(), name: 'Test1', age: 20 };
    const data2 = { id: crypto.randomUUID(), name: 'Test2', age: 30 };
    await drift.entities.testEntity.create({ data: data1 });
    await drift.entities.testEntity.create({ data: data2 });
    const results = await drift.entities.testEntity.findMany({ skip: 1, take: 1 });
    expect(results[0]).toHaveProperty('id', data2.id);
    expect(results[0]).toHaveProperty('name', data2.name);
    expect(results[0]).toHaveProperty('age', data2.age);
    
  });

  it('should apply distinct filtering in findMany', async () => {
    const data1 = { id: crypto.randomUUID(), name: 'Test1', age: 20 };
    const data2 = { id: crypto.randomUUID(), name: 'Test2', age: 20 };
    await drift.entities.testEntity.create({ data: data1 });
    await drift.entities.testEntity.create({ data: data2 });
    const results = await drift.entities.testEntity.findMany({ distinct: ['age'] });

    expect(results[0]).toHaveProperty('id', data1.id);
    expect(results[0]).toHaveProperty('name', data1.name);
    expect(results[0]).toHaveProperty('age', data1.age);    
  });

  it('should integrate with plugins', async () => {
    const plugin = new DriftPlugin({
      name: 'testPlugin',
      description: 'testPlugin',
      hooks: {
        beforeQuery: vi.fn(),
        afterQuery: vi.fn(),
      },
    });
    
    drift.plugins.push(plugin);

    const data = { id: crypto.randomUUID(), name: 'Test' };
    await drift.entities.testEntity.create({ data });

    expect(plugin.hooks.beforeQuery).toHaveBeenCalled();
    expect(plugin.hooks.afterQuery).toHaveBeenCalled();
  });

  it('should handle real-time subscriptions', async () => {
    const callback = vi.fn();

    const data = { id: crypto.randomUUID(), name: 'Test' };
    const user = await drift.entities.testEntity.create({ data });

    const { cancel } = drift.entities.testEntity.watch({
      where: { id: user.id },
      callback,
    });

    await drift.entities.testEntity.update({
      where: { id: user.id },
      data: {
        name: 'Updated Test',
      },
    });

    // Wait for the callback to be called
    await new Promise((resolve) => setTimeout(resolve, 1500));

    expect(callback).toHaveBeenCalledWith(expect.objectContaining({
      id: data.id,
      name: 'Updated Test',
    }));

    await cancel();
  });

  it('should handle real-time subscriptions for all records', async () => {
    const callback = vi.fn();

    const data1 = { id: crypto.randomUUID(), name: 'Test1' };

    await drift.entities.testEntity.create({ data: data1 });

    const { cancel } = drift.entities.testEntity.watch({
      callback,
    });

    await drift.entities.testEntity.update({
      where: { id: data1.id },
      data: {
        name: 'Updated Test1',
      },
    });

    // Wait for the callback to be called
    await new Promise((resolve) => setTimeout(resolve, 1500));

    expect(callback).toHaveBeenCalledTimes(2);
    await cancel();
  });
});
