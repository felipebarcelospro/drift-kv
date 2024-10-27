export const DEFAULT_CONFIG = {
  retryAttempts: 3,
  timeout: 30000,
};

export const ERROR_CODES = {
  CONNECTION_ERROR: "CONNECTION_ERROR",
  QUERY_ERROR: "QUERY_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
};

export const PLUGIN_EVENTS = {
  BEFORE_CONNECT: "beforeConnect",
  AFTER_CONNECT: "afterConnect",
  BEFORE_QUERY: "beforeQuery",
  AFTER_QUERY: "afterQuery",
  ON_ERROR: "onError",
};
