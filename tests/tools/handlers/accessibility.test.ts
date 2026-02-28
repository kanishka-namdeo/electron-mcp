import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccessibilityHandler } from '../../../src/tools/handlers/accessibility.js';
import { SessionManager } from '../../../src/session/index.js';

describe('AccessibilityHandler', () => {
  let handler: AccessibilityHandler;
  let sessionManager: SessionManager;

  beforeEach(() => {
    sessionManager = {
      getSession: vi.fn(),
    } as any;
    handler = new AccessibilityHandler(sessionManager);
  });

  describe('getAccessibilitySnapshot', () => {
    it('should get accessibility snapshot successfully', async () => {
      const mockPage = {
        context: vi.fn().mockReturnValue({
          newCDPSession: vi.fn().mockResolvedValue({
            send: vi.fn().mockResolvedValue({
              nodes: [
                { role: 'button', name: 'Click me' },
                { role: 'text', name: 'Some text' },
              ],
            }),
          }),
        }),
      };

      vi.mocked(sessionManager.getSession).mockResolvedValue({
        context: {
          pages: vi.fn().mockReturnValue([mockPage]),
        },
      } as any);

      const result = await handler.getAccessibilitySnapshot('test-session-id', false);

      expect(result.success).toBe(true);
      expect(result.snapshot).toHaveLength(2);
    });

    it('should handle empty accessibility tree', async () => {
      const mockPage = {
        context: vi.fn().mockReturnValue({
          newCDPSession: vi.fn().mockResolvedValue({
            send: vi.fn().mockResolvedValue({
              nodes: [],
            }),
          }),
        }),
      };

      vi.mocked(sessionManager.getSession).mockResolvedValue({
        context: {
          pages: vi.fn().mockReturnValue([mockPage]),
        },
      } as any);

      const result = await handler.getAccessibilitySnapshot('test-session-id', false);

      expect(result.success).toBe(true);
      expect(result.snapshot).toHaveLength(0);
    });
  });

  describe('findAccessibleNode', () => {
    it('should find nodes by role', async () => {
      const mockLocator = {
        count: vi.fn().mockResolvedValue(2),
        nth: vi.fn().mockReturnValue({
          boundingBox: vi.fn().mockResolvedValue({ x: 10, y: 20, width: 100, height: 50 }),
        }),
      };

      const mockPage = {
        getByRole: vi.fn().mockReturnValue(mockLocator),
      };

      vi.mocked(sessionManager.getSession).mockResolvedValue({
        context: {
          pages: vi.fn().mockReturnValue([mockPage]),
        },
      } as any);

      const result = await handler.findAccessibleNode({
        sessionId: 'test-session-id',
        role: 'button',
        limit: 2,
      });

      expect(result.success).toBe(true);
      expect(result.matches).toBe(2);
      expect(result.nodes).toHaveLength(2);
    });

    it('should find nodes by name', async () => {
      const mockLocator = {
        count: vi.fn().mockResolvedValue(1),
        nth: vi.fn().mockReturnValue({
          boundingBox: vi.fn().mockResolvedValue({ x: 10, y: 20, width: 100, height: 50 }),
        }),
      };

      const mockPage = {
        getByText: vi.fn().mockReturnValue(mockLocator),
      };

      vi.mocked(sessionManager.getSession).mockResolvedValue({
        context: {
          pages: vi.fn().mockReturnValue([mockPage]),
        },
      } as any);

      const result = await handler.findAccessibleNode({
        sessionId: 'test-session-id',
        name: 'Click me',
        exact: true,
      });

      expect(result.success).toBe(true);
      expect(result.matches).toBe(1);
    });

    it('should return no results when no matches', async () => {
      const mockLocator = {
        count: vi.fn().mockResolvedValue(0),
      };

      const mockPage = {
        getByRole: vi.fn().mockReturnValue(mockLocator),
      };

      vi.mocked(sessionManager.getSession).mockResolvedValue({
        context: {
          pages: vi.fn().mockReturnValue([mockPage]),
        },
      } as any);

      const result = await handler.findAccessibleNode({
        sessionId: 'test-session-id',
        role: 'button',
      });

      expect(result.success).toBe(false);
      expect(result.matches).toBe(0);
      expect(result.nodes).toHaveLength(0);
    });

    it('should throw error when neither role nor name provided', async () => {
      vi.mocked(sessionManager.getSession).mockResolvedValue({
        context: {
          pages: vi.fn().mockReturnValue([{}]),
        },
      } as any);

      await expect(
        handler.findAccessibleNode({
          sessionId: 'test-session-id',
        })
      ).rejects.toThrow('At least one of role or name must be provided');
    });
  });

  describe('interactAccessibleNode', () => {
    it('should click an accessible node', async () => {
      const mockTarget = {
        click: vi.fn().mockResolvedValue(undefined),
      };

      const mockLocator = {
        count: vi.fn().mockResolvedValue(1),
        first: vi.fn().mockReturnValue(mockTarget),
      };

      const mockPage = {
        getByRole: vi.fn().mockReturnValue(mockLocator),
      };

      vi.mocked(sessionManager.getSession).mockResolvedValue({
        context: {
          pages: vi.fn().mockReturnValue([mockPage]),
        },
      } as any);

      const result = await handler.interactAccessibleNode({
        sessionId: 'test-session-id',
        role: 'button',
        name: 'Click me',
        action: 'click',
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe('click');
      expect(mockTarget.click).toHaveBeenCalledOnce();
    });

    it('should fill an accessible node', async () => {
      const mockTarget = {
        fill: vi.fn().mockResolvedValue(undefined),
      };

      const mockLocator = {
        count: vi.fn().mockResolvedValue(1),
        first: vi.fn().mockReturnValue(mockTarget),
      };

      const mockPage = {
        getByRole: vi.fn().mockReturnValue(mockLocator),
      };

      vi.mocked(sessionManager.getSession).mockResolvedValue({
        context: {
          pages: vi.fn().mockReturnValue([mockPage]),
        },
      } as any);

      const result = await handler.interactAccessibleNode({
        sessionId: 'test-session-id',
        role: 'textbox',
        name: 'Username',
        action: 'fill',
        value: 'testuser',
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe('fill');
      expect(mockTarget.fill).toHaveBeenCalledWith('testuser');
    });

    it('should throw error when fill action without value', async () => {
      const mockLocator = {
        count: vi.fn().mockResolvedValue(1),
        first: vi.fn(),
      };

      const mockPage = {
        getByRole: vi.fn().mockReturnValue(mockLocator),
      };

      vi.mocked(sessionManager.getSession).mockResolvedValue({
        context: {
          pages: vi.fn().mockReturnValue([mockPage]),
        },
      } as any);

      await expect(
        handler.interactAccessibleNode({
          sessionId: 'test-session-id',
          role: 'textbox',
          name: 'Username',
          action: 'fill',
        })
      ).rejects.toThrow('value is required when action is "fill"');
    });

    it('should throw error when node not found', async () => {
      const mockLocator = {
        count: vi.fn().mockResolvedValue(0),
      };

      const mockPage = {
        getByRole: vi.fn().mockReturnValue(mockLocator),
      };

      vi.mocked(sessionManager.getSession).mockResolvedValue({
        context: {
          pages: vi.fn().mockReturnValue([mockPage]),
        },
      } as any);

      await expect(
        handler.interactAccessibleNode({
          sessionId: 'test-session-id',
          role: 'button',
          name: 'Click me',
          action: 'click',
        })
      ).rejects.toThrow('No accessible node found for role="button" and name="Click me"');
    });

    it('should throw error for unsupported action', async () => {
      const mockTarget = {
        click: vi.fn(),
        fill: vi.fn(),
      };

      const mockLocator = {
        count: vi.fn().mockResolvedValue(1),
        first: vi.fn().mockReturnValue(mockTarget),
      };

      const mockPage = {
        getByRole: vi.fn().mockReturnValue(mockLocator),
      };

      vi.mocked(sessionManager.getSession).mockResolvedValue({
        context: {
          pages: vi.fn().mockReturnValue([mockPage]),
        },
      } as any);

      await expect(
        handler.interactAccessibleNode({
          sessionId: 'test-session-id',
          role: 'button',
          name: 'Click me',
          action: 'invalid' as any,
        })
      ).rejects.toThrow('Unsupported action: invalid');
    });
  });
});
