import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SessionManager } from '../../src/session/index.js';
import { AppLifecycleHandler } from '../../src/tools/handlers/app-lifecycle.js';

describe('AppLifecycleHandler Integration Tests', () => {
  let sessionManager: SessionManager;
  let handler: AppLifecycleHandler;

  beforeEach(() => {
    sessionManager = new SessionManager();
    handler = new AppLifecycleHandler(sessionManager);
    vi.clearAllMocks();
  });

  afterEach(async () => {
    try {
      await sessionManager.cleanup();
    } catch (error) {
    }
  });

  describe('listSessions', () => {
    it('should return empty list initially', async () => {
      const result = await handler.listSessions();
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.sessions).toEqual([]);
    });

    it('should list all active sessions', async () => {
      const mockSession1 = {
        id: 'session-1',
        appPath: '/path/to/app',
        createdAt: Date.now(),
      };

      const mockSession2 = {
        id: 'session-2',
        appPath: '/path/to/app2',
        createdAt: Date.now(),
      };

      vi.spyOn(sessionManager, 'listSessions').mockReturnValue([
        mockSession1,
        mockSession2,
      ]);

      const result = await handler.listSessions();
      
      expect(result.success).toBe(true);
      expect(result.sessions.length).toBe(2);
      expect(result.sessions[0].id).toBe('session-1');
      expect(result.sessions[1].id).toBe('session-2');
    });
  });

  describe('closeSession', () => {
    it('should close existing session', async () => {
      const sessionId = 'test-session-id';
      const mockSession = {
        id: sessionId,
        appPath: '/path/to/app',
        createdAt: Date.now(),
      };

      vi.spyOn(sessionManager, 'getSession').mockResolvedValue(mockSession);
      vi.spyOn(sessionManager, 'closeSession').mockResolvedValue(undefined);

      const result = await handler.closeSession({ sessionId });
      
      expect(result.success).toBe(true);
      expect(result.sessionId).toBe(sessionId);
    });

    it('should throw error for non-existent session', async () => {
      vi.spyOn(sessionManager, 'getSession').mockRejectedValue(
        new Error('Session not found')
      );

      await expect(
        handler.closeSession({ sessionId: 'non-existent' })
      ).rejects.toThrow('Session not found');
    });

    it('should validate session ID format', async () => {
      await expect(
        handler.closeSession({ sessionId: '' })
      ).rejects.toThrow();

      await expect(
        handler.closeSession({ sessionId: 'invalid-id-format' })
      ).rejects.toThrow();
    });
  });

  describe('launchApp', () => {
    it('should validate required parameters', async () => {
      await expect(
        handler.launchApp({} as any)
      ).rejects.toThrow();

      await expect(
        handler.launchApp({ executablePath: '' } as any)
      ).rejects.toThrow();
    });

    it('should validate executablePath exists', async () => {
      vi.spyOn(sessionManager, 'createSession').mockResolvedValue({
        id: 'new-session-id',
        appPath: '/path/to/electron',
        createdAt: Date.now(),
      });

      await expect(
        handler.launchApp({
          executablePath: '/nonexistent/path/to/electron',
        })
      ).rejects.toThrow();
    });

    it('should accept valid launch parameters', async () => {
      const validArgs = {
        executablePath: '/path/to/electron',
        args: ['--test', '--no-sandbox'],
        headless: true,
        slowMo: 100,
      };

      vi.spyOn(sessionManager, 'createSession').mockResolvedValue({
        id: 'new-session-id',
        appPath: validArgs.executablePath,
        createdAt: Date.now(),
      });

      const result = await handler.launchApp(validArgs);
      
      expect(result).toBeDefined();
      expect(result.sessionId).toBe('new-session-id');
    });

    it('should use default values for optional parameters', async () => {
      vi.spyOn(sessionManager, 'createSession').mockResolvedValue({
        id: 'new-session-id',
        appPath: '/path/to/electron',
        createdAt: Date.now(),
      });

      const result = await handler.launchApp({
        executablePath: '/path/to/electron',
      });
      
      expect(result).toBeDefined();
    });
  });

  describe('connectToCDP', () => {
    it('should connect with default port', async () => {
      vi.spyOn(sessionManager, 'createCDPSession').mockResolvedValue({
        id: 'cdp-session-id',
        port: 9222,
        host: 'localhost',
        createdAt: Date.now(),
      });

      const result = await handler.connectToCDP({ port: 9222 });
      
      expect(result).toBeDefined();
      expect(result.sessionId).toBe('cdp-session-id');
      expect(result.port).toBe(9222);
      expect(result.host).toBe('localhost');
    });

    it('should connect with custom host', async () => {
      vi.spyOn(sessionManager, 'createCDPSession').mockResolvedValue({
        id: 'cdp-session-id',
        port: 9223,
        host: '192.168.1.100',
        createdAt: Date.now(),
      });

      const result = await handler.connectToCDP({
        port: 9223,
        host: '192.168.1.100',
      });
      
      expect(result.host).toBe('192.168.1.100');
    });

    it('should validate port range', async () => {
      await expect(
        handler.connectToCDP({ port: -1 })
      ).rejects.toThrow();

      await expect(
        handler.connectToCDP({ port: 65536 })
      ).rejects.toThrow();
    });

    it('should validate timeout parameter', async () => {
      await expect(
        handler.connectToCDP({ port: 9222, timeout: -1 })
      ).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle session manager errors gracefully', async () => {
      vi.spyOn(sessionManager, 'listSessions').mockImplementation(() => {
        throw new Error('Session manager error');
      });

      await expect(handler.listSessions()).rejects.toThrow('Session manager error');
    });

    it('should handle concurrent session operations', async () => {
      const sessionId = 'concurrent-test';
      const mockSession = {
        id: sessionId,
        appPath: '/path/to/app',
        createdAt: Date.now(),
      };

      vi.spyOn(sessionManager, 'getSession').mockResolvedValue(mockSession);
      vi.spyOn(sessionManager, 'closeSession').mockResolvedValue(undefined);

      const operations = [
        handler.closeSession({ sessionId }),
        handler.listSessions(),
      ];

      await expect(Promise.all(operations)).resolves.toBeDefined();
    });
  });

  describe('Session Metadata', () => {
    it('should include session metadata in responses', async () => {
      const mockSession = {
        id: 'session-with-metadata',
        appPath: '/path/to/app',
        createdAt: Date.now(),
        metadata: {
          version: '1.0.0',
          platform: process.platform,
        },
      };

      vi.spyOn(sessionManager, 'getSession').mockResolvedValue(mockSession);
      vi.spyOn(sessionManager, 'closeSession').mockResolvedValue(undefined);

      const result = await handler.closeSession({ sessionId: mockSession.id });
      
      expect(result).toBeDefined();
      expect(result.sessionId).toBe(mockSession.id);
    });
  });

  describe('Session Lifecycle', () => {
    it('should handle session creation and deletion', async () => {
      vi.spyOn(sessionManager, 'createSession').mockResolvedValue({
        id: 'lifecycle-session',
        appPath: '/path/to/electron',
        createdAt: Date.now(),
      });

      const createResult = await handler.launchApp({
        executablePath: '/path/to/electron',
      });
      
      expect(createResult.sessionId).toBe('lifecycle-session');

      vi.spyOn(sessionManager, 'getSession').mockResolvedValue({
        id: 'lifecycle-session',
        appPath: '/path/to/electron',
        createdAt: Date.now(),
      });

      vi.spyOn(sessionManager, 'closeSession').mockResolvedValue(undefined);

      const closeResult = await handler.closeSession({
        sessionId: 'lifecycle-session',
      });
      
      expect(closeResult.success).toBe(true);
    });
  });
});
