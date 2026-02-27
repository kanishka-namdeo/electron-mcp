import { describe, it, expect } from 'vitest';
import {
  ElectronMCPError,
  SessionNotFoundError,
  SessionAlreadyExistsError,
  ElectronLaunchError,
  ElementNotFoundError,
  TimeoutError,
  ValidationError,
  isElectronMCPError,
} from '../../src/core/errors.js';

describe('Errors', () => {
  describe('ElectronMCPError', () => {
    it('should create error with message and code', () => {
      const error = new ElectronMCPError('Test error', 'TEST_ERROR');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.name).toBe('ElectronMCPError');
    });

    it('should include details', () => {
      const details = { foo: 'bar' };
      const error = new ElectronMCPError('Test error', 'TEST_ERROR', details);
      expect(error.details).toEqual(details);
    });
  });

  describe('SessionNotFoundError', () => {
    it('should create error with session ID', () => {
      const error = new SessionNotFoundError('session-123');
      expect(error.message).toBe('Session not found: session-123');
      expect(error.code).toBe('SESSION_NOT_FOUND');
      expect(error.details).toEqual({ sessionId: 'session-123' });
    });
  });

  describe('SessionAlreadyExistsError', () => {
    it('should create error with session ID', () => {
      const error = new SessionAlreadyExistsError('session-123');
      expect(error.message).toBe('Session already exists: session-123');
      expect(error.code).toBe('SESSION_ALREADY_EXISTS');
      expect(error.details).toEqual({ sessionId: 'session-123' });
    });
  });

  describe('ElectronLaunchError', () => {
    it('should create error with message', () => {
      const error = new ElectronLaunchError('Failed to launch');
      expect(error.message).toBe('Failed to launch');
      expect(error.code).toBe('ELECTRON_LAUNCH_ERROR');
    });

    it('should include details', () => {
      const details = { exitCode: 1 };
      const error = new ElectronLaunchError('Failed to launch', details);
      expect(error.details).toEqual(details);
    });
  });

  describe('ElementNotFoundError', () => {
    it('should create error with selector', () => {
      const error = new ElementNotFoundError('#button');
      expect(error.message).toBe('Element not found: #button');
      expect(error.code).toBe('ELEMENT_NOT_FOUND');
      expect(error.details).toEqual({ selector: '#button' });
    });
  });

  describe('TimeoutError', () => {
    it('should create error with operation and timeout', () => {
      const error = new TimeoutError('click', 10000);
      expect(error.message).toBe('Operation timed out: click');
      expect(error.code).toBe('TIMEOUT_ERROR');
      expect(error.details).toEqual({ operation: 'click', timeout: 10000 });
    });
  });

  describe('ValidationError', () => {
    it('should create error with message', () => {
      const error = new ValidationError('Invalid input');
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('isElectronMCPError', () => {
    it('should return true for ElectronMCPError instances', () => {
      const error = new ElectronMCPError('Test', 'TEST');
      expect(isElectronMCPError(error)).toBe(true);
    });

    it('should return true for subclass instances', () => {
      const error = new SessionNotFoundError('session-123');
      expect(isElectronMCPError(error)).toBe(true);
    });

    it('should return false for non-ElectronMCPError', () => {
      const error = new Error('Regular error');
      expect(isElectronMCPError(error)).toBe(false);
    });

    it('should return false for non-error objects', () => {
      expect(isElectronMCPError(null)).toBe(false);
      expect(isElectronMCPError(undefined)).toBe(false);
      expect(isElectronMCPError({})).toBe(false);
    });
  });
});
