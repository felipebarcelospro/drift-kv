export class DriftError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DriftError";
  }
}

export class ConnectionError extends DriftError {
  constructor(message: string) {
    super(message);
    this.name = "ConnectionError";
  }
}

export class QueryError extends DriftError {
  constructor(message: string) {
    super(message);
    this.name = "QueryError";
  }
}

export class ValidationError extends DriftError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
