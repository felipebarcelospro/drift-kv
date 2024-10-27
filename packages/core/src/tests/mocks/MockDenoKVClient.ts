export class MockDenoKVClient {
  private store: Map<string, any>;

  constructor() {
    this.store = new Map();
  }

  async set(key: string[], value: any) {
    const compositeKey = key.join(":");
    this.store.set(compositeKey, value);
  }

  async get(key: string[]) {
    const compositeKey = key.join(":");
    return { value: this.store.get(compositeKey) };
  }

  async delete(key: string[]) {
    const compositeKey = key.join(":");
    this.store.delete(compositeKey);
  }

  async *list({ prefix }: { prefix: string[] }) {
    const compositePrefix = prefix.join(":");
    for (const [key, value] of this.store) {
      if (key.startsWith(compositePrefix)) {
        yield { key: key.split(":"), value };
      }
    }
  }

  async *watch({ key }: { key: string[] }) {
    const compositeKey = key.join(":");
    while (true) {
      if (this.store.has(compositeKey)) {
        yield { value: this.store.get(compositeKey) };
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
