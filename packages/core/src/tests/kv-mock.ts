import {
  AtomicCheck,
  AtomicOperation,
  Kv,
  KvCommitResult,
  KvConsistencyLevel,
  KvEntry,
  KvEntryMaybe,
  KvKey,
  KvListIterator,
  KvListOptions,
  KvListSelector,
} from "@deno/kv";
export class InMemoryDenoKv implements Kv {
  private store: Map<
    string,
    { value: unknown; versionstamp: string; expires: string | null }
  > = new Map();
  private queueListeners: Set<(value: unknown) => void> = new Set();

  atomic(): AtomicOperation {
    const operations: {
      actions: Array<() => void>;
      checks: Array<AtomicCheck>;
    } = {
      actions: [],
      checks: [],
    };

    const atomicOperations: AtomicOperation = {
      check: (...checks: AtomicCheck[]) => {
        operations.checks.push(...checks);
        return atomicOperations;
      },
      commit: async () => {
        // Check version stamps first
        for (const check of operations.checks) {
          const key = JSON.stringify(check.key);
          const data = this.store.get(key);
          if (check.versionstamp !== (data ? data.versionstamp : null)) {
            return { ok: false };
          }
        }

        // If checks pass, perform all operations
        for (const action of operations.actions) {
          action();
        }

        return { ok: true, versionstamp: Date.now().toString() };
      },
      delete: (key: KvKey) => {
        operations.actions.push(() => {
          this.store.delete(JSON.stringify(key));
        });
        return atomicOperations;
      },
      enqueue: (
        value: unknown,
        options?: { delay?: number; keysIfUndelivered?: KvKey[] },
      ) => {
        operations.actions.push(() => {
          for (const fn of this.queueListeners) {
            if (options?.delay) {
              setTimeout(() => fn(value), options.delay);
            } else {
              fn(value);
            }
          }
        });
        return atomicOperations;
      },
      max: (key: KvKey, n: bigint) => {
        operations.actions.push(() => {
          const serializedKey = JSON.stringify(key);
          const currentValue = this.store.get(serializedKey);
          if (
            !currentValue ||
            typeof currentValue.value !== "bigint" ||
            currentValue.value < n
          ) {
            this.store.set(serializedKey, {
              value: n,
              versionstamp: Date.now().toString(),
              expires: null,
            });
          }
        });
        return atomicOperations;
      },
      min: (key: KvKey, n: bigint) => {
        operations.actions.push(() => {
          const serializedKey = JSON.stringify(key);
          const currentValue = this.store.get(serializedKey);
          if (
            !currentValue ||
            typeof currentValue.value !== "bigint" ||
            currentValue.value > n
          ) {
            this.store.set(serializedKey, {
              value: n,
              versionstamp: Date.now().toString(),
              expires: null,
            });
          }
        });
        return atomicOperations;
      },
      set: (key: KvKey, value: unknown, options?: { expireIn?: number }) => {
        operations.actions.push(() => {
          const data = {
            value,
            versionstamp: Date.now().toString(),
            expires: options?.expireIn
              ? new Date(Date.now() + options.expireIn).toISOString()
              : null,
          };
          this.store.set(JSON.stringify(key), data);
        });
        return atomicOperations;
      },
      sum: (key: KvKey, n: bigint) => {
        operations.actions.push(() => {
          const serializedKey = JSON.stringify(key);
          const currentValue = this.store.get(serializedKey);
          const currentSum = (currentValue?.value as bigint) ?? BigInt(0);
          this.store.set(serializedKey, {
            value: currentSum + n,
            versionstamp: Date.now().toString(),
            expires: null,
          });
        });
        return atomicOperations;
      },
    };

    return atomicOperations;
  }

  close(): void {
    this.store.clear();
  }

  async delete(key: KvKey): Promise<void> {
    this.store.delete(JSON.stringify(key));
  }

  async enqueue(
    value: unknown,
    options?: { delay?: number; keysIfUndelivered?: KvKey[] },
  ): Promise<KvCommitResult> {
    for (const fn of this.queueListeners) {
      options?.delay && setTimeout(() => fn(value), options.delay);
    }
    return { ok: true, versionstamp: Date.now().toString() };
  }

  async get<T = unknown>(
    key: KvKey,
    options?: { consistency?: KvConsistencyLevel },
  ): Promise<KvEntryMaybe<T>> {
    const serializedKey = JSON.stringify(key);
    const data = this.store.get(serializedKey);

    if (!data || (data.expires && new Date(data.expires) < new Date())) {
      data && data.expires && this.store.delete(serializedKey);
      return { key, value: null, versionstamp: null };
    }

    return { key, ...data } as KvEntryMaybe<T>;
  }

  async getMany<T extends readonly unknown[]>(
    keys: readonly [...{ [K in keyof T]: KvKey }],
    options?: { consistency?: KvConsistencyLevel },
  ): Promise<{ [K in keyof T]: KvEntryMaybe<T[K]> }> {
    return Promise.all(keys.map((key) => this.get(key))) as Promise<{
      [K in keyof T]: KvEntryMaybe<T[K]>;
    }>;
  }

  list<T = unknown>(
    selector: KvListSelector,
    options?: KvListOptions,
  ): KvListIterator<T> {
    const entries = Array.from(this.store.entries())
      .map(([key, value]) => ({ key: JSON.parse(key), ...value }))
      .filter((entry) => {
        if ("prefix" in selector && selector.prefix) {
          const prefix = selector.prefix;
          if (
            !entry.key
              .slice(0, prefix.length)
              .every((part: any, index: number) => part === prefix[index])
          ) {
            return false;
          }
        }
        if ("start" in selector && selector.start) {
          if (JSON.stringify(entry.key) < JSON.stringify(selector.start)) {
            return false;
          }
        }
        if ("end" in selector && selector.end) {
          if (JSON.stringify(entry.key) >= JSON.stringify(selector.end)) {
            return false;
          }
        }
        return true;
      });

    let cursor = 0;
    return {
      next: async () => {
        if (cursor < entries.length) {
          const value = entries[cursor++];
          return { value, done: false } as IteratorResult<KvEntry<T>>;
        }
        return { done: true } as IteratorResult<KvEntry<T>>;
      },
      get cursor() {
        return cursor.toString();
      },
      [Symbol.asyncIterator]: function () {
        return this;
      },
    };
  }

  async listenQueue(
    handler: (value: unknown) => Promise<void> | void,
  ): Promise<void> {
    if (!this.queueListeners.has(handler)) {
      this.queueListeners.add(handler);
    }
  }

  async set(
    key: KvKey,
    value: unknown,
    options?: { expireIn?: number },
  ): Promise<KvCommitResult> {
    const data = {
      value,
      versionstamp: Date.now().toString(),
      expires: options?.expireIn
        ? new Date(Date.now() + options.expireIn).toISOString()
        : null,
    };
    this.store.set(JSON.stringify(key), data);
    return { ok: true, versionstamp: data.versionstamp };
  }

  watch<T extends readonly unknown[]>(
    keys: readonly [...{ [K in keyof T]: KvKey }],
    options?: { raw?: boolean },
  ): ReadableStream<{ [K in keyof T]: KvEntryMaybe<T[K]> }> {
    let interval: NodeJS.Timeout;
    const stream = new ReadableStream<{ [K in keyof T]: KvEntryMaybe<T[K]> }>({
      start: (controller) => {
        interval = setInterval(() => {
          const updates = keys.map((key) => {
            const serializedKey = JSON.stringify(key);
            const value = this.store.get(serializedKey);
            if (value) {
              return {
                key,
                value: value.value ?? null,
                versionstamp: value.versionstamp ?? null,
                expires: value.expires ?? null,
              };
            } else {
              return { key, value: null, versionstamp: null, expires: null };
            }
          });
          controller.enqueue(updates as any);
        }, 500);
      },
      cancel: () => {
        clearInterval(interval);
      },
    });

    return stream;
  }

  private streamClosed: () => void = () => {};

  public clear(): void {
    this.store.clear();
  }

  [Symbol.dispose](): void {
    this.close();
  }
}
