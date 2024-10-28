import { ERROR_CODES } from "./constants";

export class DriftError extends Error {
  code: string;

  constructor(message: string) {
    super(message);
    this.name = "DriftError";
    this.code = ERROR_CODES.DRIFT_CONNECTION_ERROR; // Adjusted to use an existing error code
  }
}

export class DriftConnectionError extends DriftError {
  constructor(message: string) {
    super(message);
    this.name = "DriftConnectionError";
    this.code = ERROR_CODES.DRIFT_CONNECTION_ERROR;
  }
}

export class DriftQueryError extends DriftError {
  constructor(message: string) {
    super(message);
    this.name = "DriftQueryError";
    this.code = ERROR_CODES.DRIFT_QUERY_ERROR;
  }
}

export class DriftValidationError extends DriftError {
  constructor(message: string) {
    super(message);
    this.name = "DriftValidationError";
    this.code = ERROR_CODES.DRIFT_VALIDATION_ERROR;
  }
}

export class DriftKeyError extends DriftError {
  constructor(message: string) {
    super(message);
    this.name = "DriftKeyError";
    this.code = ERROR_CODES.DRIFT_KEY_ERROR;
  }
}

export class DriftBatchOpError extends DriftError {
  constructor(message: string) {
    super(message);
    this.name = "DriftBatchOpError";
    this.code = ERROR_CODES.DRIFT_BATCH_OP_ERROR;
  }
}
