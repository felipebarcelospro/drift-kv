import { describe, expect, it, vi } from 'vitest';
import { Drift } from '../src/core/Drift';
import { DriftPlugin } from '../src/core/Plugin';
import { MockDenoKVClient } from './mocks/MockDenoKVClient';

describe('DriftPlugin', () => {
  const mockClient = new MockDenoKVClient();
  const mockDrift = new Drift({ client: mockClient });

  it('should initialize the plugin', () => {
    const plugin = new DriftPlugin({
      name: 'TestPlugin',
      description: 'A test plugin',
      config: { enabled: true },
      hooks: {},
      methods: {},
    });

    plugin.initialize(mockDrift);

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

    await plugin.executeHook('onConnect', mockClient, {});

    expect(onConnectHook).toHaveBeenCalledWith(mockClient, {});
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
      client: mockClient,
      plugins: [plugin],
    });

    expect(drift.plugins).toContain(plugin);
  });
});
