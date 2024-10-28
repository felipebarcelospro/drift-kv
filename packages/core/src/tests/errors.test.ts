import { describe, expect, it } from 'vitest';
import { DriftConnectionError, DriftError, DriftQueryError, DriftValidationError } from "../errors";

describe('Custom Error Classes', () => {
  it('should create a DriftError with the correct message', () => {
    const error = new DriftError('Test DriftError');
    expect(error.name).toBe('DriftError');
  });

  it('should create a DriftConnectionError with the correct message', () => {
    const error = new DriftConnectionError('Test DriftConnectionError');
    expect(error.name).toBe('DriftConnectionError');
  });

  it('should create a DriftQueryError with the correct message', () => {
    const error = new DriftQueryError('Test DriftQueryError');
    expect(error.name).toBe('DriftQueryError');
  });

  it('should create a DriftValidationError with the correct message', () => {
    const error = new DriftValidationError('Test DriftValidationError');
    expect(error.name).toBe('DriftValidationError');
  });

  it('should handle and propagate DriftError correctly', () => {
    try {
      throw new DriftError('Test DriftError');
    } catch (error: any) {
      expect(error).toBeInstanceOf(DriftError);
    }
  });

  it('should handle and propagate DriftConnectionError correctly', () => {
    try {
      throw new DriftConnectionError('Test DriftConnectionError');
    } catch (error: any) {
      expect(error).toBeInstanceOf(DriftConnectionError);
    }
  });

  it('should handle and propagate DriftQueryError correctly', () => {
    try {
      throw new DriftQueryError('Test DriftQueryError');
    } catch (error: any) {
      expect(error).toBeInstanceOf(DriftQueryError);
    }
  });

  it('should handle and propagate DriftValidationError correctly', () => {
    try {
      throw new DriftValidationError('Test DriftValidationError');
    } catch (error: any) {
      expect(error).toBeInstanceOf(DriftValidationError);
    }
  });
});
