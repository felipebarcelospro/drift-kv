import { ZodSchema } from "zod";

export interface QueueHooks<T> {
  onBeforeEnqueue?: (data: T) => Promise<void>;
  onStart?: (data: T) => Promise<void>;
  onSuccess?: (data: T) => Promise<void>;
  onError?: (error: Error, data: T) => Promise<void>;
  onEnd?: () => Promise<void>;
}

export interface QueueOptions<T> {
  name: string;
  description?: string;
  schema: ZodSchema<T>;
  options?: {
    retryAttempts?: number;
    timeout?: number;
  };
  hooks?: QueueHooks<T>;
  handler: (data: T) => Promise<void>;
}

export interface WatchParams<T> {
  select?: { [K in keyof T]?: boolean };
  include?: {
    [K in keyof T]?:
      | boolean
      | {
          select?: { [K2 in keyof T[K]]?: boolean };
          where?: { [K2 in keyof T[K]]?: any };
          orderBy?: { [K2 in keyof T[K]]?: "asc" | "desc" };
          skip?: number;
          take?: number;
        };
  };
  where?: { [K in keyof T]?: any };
  orderBy?: { [K in keyof T]?: "asc" | "desc" };
  distinct?: Array<keyof T>;
}
