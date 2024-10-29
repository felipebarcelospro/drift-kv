import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Drift } from '../core/Drift';
import { DriftEntity } from '../generators/DriftEntity';
import { InMemoryDenoKv } from './kv-mock';

describe('DriftEntity', () => {
  let client = new InMemoryDenoKv();

  const user = new DriftEntity({
    name: 'user',
    options: {
      timestamps: true,
    },
    schema: (schema) => ({
      name: schema.string(),
      age: schema.number().optional(),
    }),
  });

  let drift = new Drift({
    client,
    schemas: {
      entities: {
        user,
      },
      queues: {},
    },
  });

  beforeEach(() => {
    client.clear();
  });

  it('should initialize correctly', () => {
    expect(drift.entities.user).toBeDefined();
  });

  it('should create a new entity record with provided ID', async () => {
    const data = { name: 'Test' };
    const result = await drift.entities.user.create({ data });
    expect(result).toHaveProperty('id', result.id);
    expect(result).toHaveProperty('name', data.name);
  });

  it('should find a unique entity record', async () => {
    const data = { name: 'Test' };
    const createdEntity = await drift.entities.user.create({ data });
    const result = await drift.entities.user.findUnique({ where: { id: createdEntity.id } });
    expect(result?.id).toBe(createdEntity.id)
    expect(result).toHaveProperty('id', createdEntity.id);
    expect(result).toHaveProperty('name', data.name);
  });

  it('should find multiple entity records', async () => {
    const data1 = { name: 'Test1' };
    const data2 = { name: 'Test2' };
    
    const createdEntity1 = await drift.entities.user.create({ data: data1 });
    const createdEntity2 = await drift.entities.user.create({ data: data2 });

    const results = await drift.entities.user.findMany();

    expect(results[0]).toHaveProperty('id', createdEntity1.id);
    expect(results[0]).toHaveProperty('name', data1.name);    
    expect(results[1]).toHaveProperty('id', createdEntity2.id);
    expect(results[1]).toHaveProperty('name', data2.name);
  });

  it('should update an existing entity record', async () => {
    const data = { name: 'Test' };
    const createdEntity = await drift.entities.user.create({ data });
    const updatedData = { name: 'Updated Test' };

    const updatedEntity = await drift.entities.user.update({
      where: { id: createdEntity.id },
      data: updatedData,
    });
    
    expect(updatedEntity).toBeInstanceOf(Object);
    expect(updatedEntity).toHaveProperty('name', updatedData.name);
  });

  it('should delete an entity record', async () => {
    const data = { name: 'Test' };
    const createdEntity = await drift.entities.user.create({ data });
    const result = await drift.entities.user.delete({ where: { id: createdEntity.id } });
    expect(result).toBeUndefined();
  });

  it('should apply filters in findMany', async () => {
    const data1 = { name: 'Test1', age: 20 };
    const data2 = { name: 'Test2', age: 30 };

    await drift.entities.user.create({ data: data1 });
    const createdEntity2 = await drift.entities.user.create({ data: data2 });

    const results = await drift.entities.user.findMany({ where: { age: 30 } });

    expect(results).toHaveLength(1);
    expect(results[0]).toHaveProperty('id', createdEntity2.id);
    expect(results[0]).toHaveProperty('name', data2.name);
    expect(results[0]).toHaveProperty('age', data2.age);
  });

  it('should apply sorting in findMany', async () => {
    const data1 = { name: 'Test1', age: 20 };
    const data2 = { name: 'Test2', age: 30 };
    const createdEntity1 = await drift.entities.user.create({ data: data1 });
    const createdEntity2 = await drift.entities.user.create({ data: data2 });
    const results = await drift.entities.user.findMany({ orderBy: { age: 'desc' } });
    expect(results[0]).toHaveProperty('id', createdEntity2.id);
    expect(results[0]).toHaveProperty('name', data2.name);
    expect(results[0]).toHaveProperty('age', data2.age);
    
    expect(results[1]).toHaveProperty('id', createdEntity1.id);
    expect(results[1]).toHaveProperty('name', data1.name);
    expect(results[1]).toHaveProperty('age', data1.age);
  });

  it('should apply pagination in findMany', async () => {
    const data1 = { name: 'Test1', age: 20 };
    const data2 = { name: 'Test2', age: 30 };
    const createdEntity1 = await drift.entities.user.create({ data: data1 });
    const createdEntity2 = await drift.entities.user.create({ data: data2 });
    const results = await drift.entities.user.findMany({ skip: 1, take: 1 });
    expect(results[0]).toHaveProperty('id', createdEntity2.id);
    expect(results[0]).toHaveProperty('name', createdEntity2.name);
    expect(results[0]).toHaveProperty('age', createdEntity2.age);
    
  });

  it('should handle real-time subscriptions', async () => {
    const callback = vi.fn();

    const data = { name: 'Test' };

    const user = await drift.entities.user.create({ data });

    const { cancel } = drift.entities.user.watch({
      where: { id: user.id },
      callback,
    });

    await drift.entities.user.update({
      where: { id: user.id },
      data: {
        name: 'Updated Test',
      },
    });

    // Wait for the callback to be called
    await new Promise((resolve) => setTimeout(resolve, 1500));

    expect(callback).toHaveBeenCalledWith(expect.objectContaining({
      id: user.id,
      name: 'Updated Test',
    }));

    await cancel();
  });

  it('should handle real-time subscriptions for all records', async () => {
    const callback = vi.fn();

    const data1 = { name: 'Test1' };
    const createdEntity1 = await drift.entities.user.create({ data: data1 });

    const { cancel } = drift.entities.user.watch({
      callback,
    });

    await drift.entities.user.update({
      where: { id: createdEntity1.id },
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
