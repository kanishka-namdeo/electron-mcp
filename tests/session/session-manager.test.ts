import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SessionManager } from '../../src/session/index.js';

describe('SessionManager', () => {
  let sessionManager: SessionManager;

  beforeEach(() => {
    sessionManager = new SessionManager();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    try {
      await sessionManager.cleanup();
    } catch (error) {
    }
  });

  describe('listSessions', () => {
    it('should return empty list when no sessions', () => {
      const sessions = sessionManager.listSessions();
      expect(sessions).toEqual([]);
    });
  });

  describe('getSession', () => {
    it('should throw SessionNotFoundError for non-existent session', async () => {
      await expect(sessionManager.getSession('non-existent')).rejects.toThrow('Session not found');
    });
  });

  describe('closeSession', () => {
    it('should throw SessionNotFoundError for non-existent session', async () => {
      await expect(sessionManager.closeSession('non-existent')).rejects.toThrow('Session not found');
    });
  });

  describe('pauseSession', () => {
    it('should throw SessionNotFoundError for non-existent session', async () => {
      await expect(sessionManager.pauseSession('non-existent')).rejects.toThrow('Session not found');
    });
  });

  describe('resumeSession', () => {
    it('should throw SessionNotFoundError for non-existent session', async () => {
      await expect(sessionManager.resumeSession('non-existent')).rejects.toThrow('Session not found');
    });
  });
});
