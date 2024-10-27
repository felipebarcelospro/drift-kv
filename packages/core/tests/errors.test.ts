import { describe, it, expect } from 'vitest';
import { DriftError, ConnectionError, QueryError, ValidationError } from '../src/errors';

describe('Custom Error Classes', () => {
  it('should create a DriftError with the correct message', () => {
    const error = new DriftError('Test DriftError');
    expect(error.message).toBe('Test DriftError');
    expect(error.name).toBe('DriftError');
  });

  it('should create a ConnectionError with the correct message', () => {
    const error = new ConnectionError('Test ConnectionError');
    expect(error.message).toBe('Test ConnectionError');
    expect(error.name).toBe('ConnectionError');
  });

  it('should create a QueryError with the correct message', () => {
    const error = new QueryError('Test QueryError');
    expect(error.message).toBe('Test QueryError');
    expect(error.name).toBe('QueryError');
  });

  it('should create a ValidationError with the correct message', () => {
    const error = new ValidationError('Test ValidationError');
    expect(error.message).toBe('Test ValidationError');
    expect(error.name).toBe('ValidationError');
  });

  it('should handle and propagate DriftError correctly', () => {
    try {
      throw new DriftError('Test DriftError');
    } catch (error) {
      expect(error).toBeInstanceOf(DriftError);
      expect(error.message).toBe('Test DriftError');
    }
  });

  it('should handle and propagate ConnectionError correctly', () => {
    try {
      throw new ConnectionError('Test ConnectionError');
    } catch (error) {
      expect(error).toBeInstanceOf(ConnectionError);
      expect(error.message).toBe('Test ConnectionError');
    }
  });

  it('should handle and propagate QueryError correctly', () => {
    try {
      throw new QueryError('Test QueryError');
    } catch (error) {
      expect(error).toBeInstanceOf(QueryError);
      expect(error.message).toBe('Test QueryError');
    }
  });

  it('should handle and propagate ValidationError correctly', () => {
    try {
      throw new ValidationError('Test ValidationError');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Test ValidationError');
    }
  });
});
