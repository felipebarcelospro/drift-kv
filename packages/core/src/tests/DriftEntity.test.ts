import { Drift } from "@drift/core/src/core/Drift";
import { DriftEntity } from "@drift/core/src/entities/DriftEntity";
import { MockDenoKVClient } from "@drift/core/src/tests/mocks/MockDenoKVClient";
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

describe('DriftEntity', () => {
  let client: MockDenoKVClient;
  let drift: Drift;
  let entity: DriftEntity<{ id: string, name: string, age?: number}>;

  beforeEach(() => {
    client = new MockDenoKVClient();
    
    drift = new Drift({ 
      client,
    });

    entity = new DriftEntity(drift, {
      name: 'testEntity',
      schema: z.object({
        id: z.string(),
        name: z.string(),
        age: z.number().optional(),
      }),
    });
  });

  it('should initialize correctly', () => {
    expect(entity.name).toBe('testEntity');
    expect(entity.schema).toBeDefined();
  });

  it('should create a new entity record', async () => {
    const data = { id: '1', name: 'Test' };
    const result = await entity.create({ data });
    expect(result).toEqual(data);
  });

  it('should find a unique entity record', async () => {
    const data = { id: '1', name: 'Test' };
    await entity.create({ data });
    const result = await entity.findUnique({ where: { id: '1' } });
    expect(result).toEqual(data);
  });

  it('should find multiple entity records', async () => {
    const data1 = { id: '1', name: 'Test1' };
    const data2 = { id: '2', name: 'Test2' };
    await entity.create({ data: data1 });
    await entity.create({ data: data2 });
    const results = await entity.findMany({});
    expect(results).toEqual([data1, data2]);
  });

  it('should update an existing entity record', async () => {
    const data = { id: '1', name: 'Test' };
    await entity.create({ data });
    const updatedData = { name: 'Updated Test' };
    const result = await entity.update({ where: { id: '1' }, data: updatedData });
    expect(result.name).toBe('Updated Test');
  });

  it('should delete an entity record', async () => {
    const data = { id: '1', name: 'Test' };
    await entity.create({ data });
    const result = await entity.delete({ where: { id: '1' } });
    expect(result).toEqual(data);
    const findResult = await entity.findUnique({ where: { id: '1' } });
    expect(findResult).toBeNull();
  });

  it('should apply filters in findMany', async () => {
    const data1 = { id: '1', name: 'Test1', age: 20 };
    const data2 = { id: '2', name: 'Test2', age: 30 };
    await entity.create({ data: data1 });
    await entity.create({ data: data2 });
    const results = await entity.findMany({ where: { age: { gte: 25 } } });
    expect(results).toEqual([data2]);
  });

  it('should apply sorting in findMany', async () => {
    const data1 = { id: '1', name: 'Test1', age: 20 };
    const data2 = { id: '2', name: 'Test2', age: 30 };
    await entity.create({ data: data1 });
    await entity.create({ data: data2 });
    const results = await entity.findMany({ orderBy: { age: 'desc' } });
    expect(results).toEqual([data2, data1]);
  });

  it('should apply pagination in findMany', async () => {
    const data1 = { id: '1', name: 'Test1', age: 20 };
    const data2 = { id: '2', name: 'Test2', age: 30 };
    await entity.create({ data: data1 });
    await entity.create({ data: data2 });
    const results = await entity.findMany({ skip: 1, take: 1 });
    expect(results).toEqual([data2]);
  });

  it('should apply distinct filtering in findMany', async () => {
    const data1 = { id: '1', name: 'Test1', age: 20 };
    const data2 = { id: '2', name: 'Test2', age: 20 };
    await entity.create({ data: data1 });
    await entity.create({ data: data2 });
    const results = await entity.findMany({ distinct: ['age'] });
    expect(results).toEqual([data1]);
  });

  it('should execute hooks', async () => {
    const beforeQuery = vi.fn();
    const afterQuery = vi.fn();
    entity.hooks = { beforeQuery, afterQuery };

    const data = { id: '1', name: 'Test' };
    await entity.create({ data });

    expect(beforeQuery).toHaveBeenCalled();
    expect(afterQuery).toHaveBeenCalled();
  });

  it('should integrate with plugins', async () => {
    const plugin = {
      query: vi.fn(),
    };
    drift.plugins.push(plugin);

    const data = { id: '1', name: 'Test' };
    await entity.create({ data });

    expect(plugin.query).toHaveBeenCalled();
  });

  it('should handle real-time subscriptions', async () => {
    const callback = vi.fn();
    entity.watch('1', {}, callback);

    const data = { id: '1', name: 'Test' };
    await entity.create({ data });

    expect(callback).toHaveBeenCalledWith(data);
  });

  it('should handle real-time subscriptions for all records', async () => {
    const callback = vi.fn();
    entity.watchAll({}, callback);

    const data1 = { id: '1', name: 'Test1' };
    const data2 = { id: '2', name: 'Test2' };
    await entity.create({ data: data1 });
    await entity.create({ data: data2 });

    expect(callback).toHaveBeenCalledWith([data1, data2]);
  });
});
