import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SessionManager } from '../../src/session/index.js';
import { ElementInteractionHandler } from '../../src/tools/handlers/element-interaction.js';

describe('ElementInteractionHandler Integration Tests', () => {
  let sessionManager: SessionManager;
  let handler: ElementInteractionHandler;
  let mockSession: any;

  beforeEach(() => {
    sessionManager = new SessionManager();
    handler = new ElementInteractionHandler(sessionManager);
    vi.clearAllMocks();

    mockSession = {
      id: 'test-session-id',
      page: {
        goto: vi.fn().mockResolvedValue(undefined),
        click: vi.fn().mockResolvedValue(undefined),
        fill: vi.fn().mockResolvedValue(undefined),
        selectOption: vi.fn().mockResolvedValue(undefined),
        waitForSelector: vi.fn().mockResolvedValue(undefined),
        content: vi.fn().mockResolvedValue('Page content'),
        title: vi.fn().mockResolvedValue('Test Page'),
        evaluate: vi.fn().mockResolvedValue('evaluated result'),
        url: vi.fn().mockResolvedValue('https://example.com'),
        screenshot: vi.fn().mockResolvedValue(Buffer.from('fake-screenshot')),
      },
    };

    vi.spyOn(sessionManager, 'getSession').mockResolvedValue(mockSession);
  });

  afterEach(async () => {
    try {
      await sessionManager.cleanup();
    } catch (error) {
    }
  });

  describe('navigate', () => {
    it('should navigate to a valid URL', async () => {
      const result = await handler.navigate({
        sessionId: 'test-session-id',
        url: 'https://example.com',
      });

      expect(result.success).toBe(true);
      expect(result.url).toBe('https://example.com');
      expect(mockSession.page.goto).toHaveBeenCalledWith('https://example.com');
    });

    it('should validate URL format', async () => {
      await expect(
        handler.navigate({
          sessionId: 'test-session-id',
          url: 'not-a-valid-url',
        })
      ).rejects.toThrow();
    });

    it('should handle navigation errors', async () => {
      mockSession.page.goto.mockRejectedValue(new Error('Navigation failed'));

      await expect(
        handler.navigate({
          sessionId: 'test-session-id',
          url: 'https://example.com',
        })
      ).rejects.toThrow('Navigation failed');
    });

    it('should accept valid URL protocols', async () => {
      const validUrls = [
        'https://example.com',
        'http://example.com',
        'file:///path/to/file.html',
      ];

      for (const url of validUrls) {
        const result = await handler.navigate({
          sessionId: 'test-session-id',
          url,
        });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('click', () => {
    it('should click on element by selector', async () => {
      const result = await handler.click({
        sessionId: 'test-session-id',
        selector: '#button',
      });

      expect(result.success).toBe(true);
      expect(mockSession.page.click).toHaveBeenCalledWith('#button');
    });

    it('should validate selector parameter', async () => {
      await expect(
        handler.click({
          sessionId: 'test-session-id',
          selector: '',
        })
      ).rejects.toThrow();
    });

    it('should handle click errors', async () => {
      mockSession.page.click.mockRejectedValue(new Error('Element not found'));

      await expect(
        handler.click({
          sessionId: 'test-session-id',
          selector: '#nonexistent',
        })
      ).rejects.toThrow();
    });

    it('should accept timeout parameter', async () => {
      const result = await handler.click({
        sessionId: 'test-session-id',
        selector: '#button',
        timeout: 5000,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('fill', () => {
    it('should fill input field with value', async () => {
      const result = await handler.fill({
        sessionId: 'test-session-id',
        selector: '#input',
        value: 'test value',
      });

      expect(result.success).toBe(true);
      expect(mockSession.page.fill).toHaveBeenCalledWith('#input', 'test value');
    });

    it('should validate required parameters', async () => {
      await expect(
        handler.fill({
          sessionId: 'test-session-id',
          selector: '#input',
        })
      ).rejects.toThrow();
    });

    it('should handle fill errors', async () => {
      mockSession.page.fill.mockRejectedValue(new Error('Input not found'));

      await expect(
        handler.fill({
          sessionId: 'test-session-id',
          selector: '#nonexistent',
          value: 'test',
        })
      ).rejects.toThrow();
    });

    it('should accept timeout parameter', async () => {
      const result = await handler.fill({
        sessionId: 'test-session-id',
        selector: '#input',
        value: 'test',
        timeout: 3000,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('select', () => {
    it('should select option from dropdown', async () => {
      const result = await handler.select({
        sessionId: 'test-session-id',
        selector: '#select',
        value: 'option1',
      });

      expect(result.success).toBe(true);
      expect(mockSession.page.selectOption).toHaveBeenCalledWith('#select', 'option1');
    });

    it('should validate required parameters', async () => {
      await expect(
        handler.select({
          sessionId: 'test-session-id',
          selector: '#select',
        })
      ).rejects.toThrow();
    });

    it('should handle select errors', async () => {
      mockSession.page.selectOption.mockRejectedValue(
        new Error('Select element not found')
      );

      await expect(
        handler.select({
          sessionId: 'test-session-id',
          selector: '#nonexistent',
          value: 'option1',
        })
      ).rejects.toThrow();
    });
  });

  describe('getText', () => {
    it('should get text content of element', async () => {
      mockSession.page.evaluate.mockResolvedValue('Element text content');

      const result = await handler.getText({
        sessionId: 'test-session-id',
        selector: '#element',
      });

      expect(result.success).toBe(true);
      expect(result.text).toBe('Element text content');
    });

    it('should validate selector parameter', async () => {
      await expect(
        handler.getText({
          sessionId: 'test-session-id',
          selector: '',
        })
      ).rejects.toThrow();
    });

    it('should handle empty text', async () => {
      mockSession.page.evaluate.mockResolvedValue('');

      const result = await handler.getText({
        sessionId: 'test-session-id',
        selector: '#empty',
      });

      expect(result.success).toBe(true);
      expect(result.text).toBe('');
    });

    it('should accept timeout parameter', async () => {
      const result = await handler.getText({
        sessionId: 'test-session-id',
        selector: '#element',
        timeout: 5000,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('screenshot', () => {
    it('should take screenshot', async () => {
      const screenshotBuffer = Buffer.from('screenshot-data');
      mockSession.page.screenshot.mockResolvedValue(screenshotBuffer);

      const result = await handler.screenshot({
        sessionId: 'test-session-id',
        path: '/path/to/screenshot.png',
      });

      expect(result.success).toBe(true);
      expect(result.path).toBe('/path/to/screenshot.png');
      expect(result.size).toBe(screenshotBuffer.length);
    });

    it('should take full page screenshot', async () => {
      const result = await handler.screenshot({
        sessionId: 'test-session-id',
        path: '/path/to/screenshot.png',
        fullPage: true,
      });

      expect(result.success).toBe(true);
      expect(mockSession.page.screenshot).toHaveBeenCalledWith({
        path: '/path/to/screenshot.png',
        fullPage: true,
      });
    });

    it('should handle screenshot errors', async () => {
      mockSession.page.screenshot.mockRejectedValue(
        new Error('Screenshot failed')
      );

      await expect(
        handler.screenshot({
          sessionId: 'test-session-id',
          path: '/path/to/screenshot.png',
        })
      ).rejects.toThrow();
    });
  });

  describe('waitForSelector', () => {
    it('should wait for element to appear', async () => {
      const result = await handler.waitForSelector({
        sessionId: 'test-session-id',
        selector: '#element',
        timeout: 5000,
        state: 'visible',
      });

      expect(result.success).toBe(true);
      expect(mockSession.page.waitForSelector).toHaveBeenCalledWith('#element', {
        timeout: 5000,
        state: 'visible',
      });
    });

    it('should validate state parameter', async () => {
      const validStates = ['attached', 'detached', 'visible', 'hidden'];

      for (const state of validStates) {
        const result = await handler.waitForSelector({
          sessionId: 'test-session-id',
          selector: '#element',
          timeout: 5000,
          state: state as any,
        });

        expect(result.success).toBe(true);
      }
    });

    it('should use default timeout', async () => {
      const result = await handler.waitForSelector({
        sessionId: 'test-session-id',
        selector: '#element',
      });

      expect(result.success).toBe(true);
    });

    it('should handle timeout errors', async () => {
      mockSession.page.waitForSelector.mockRejectedValue(
        new Error('Timeout waiting for selector')
      );

      await expect(
        handler.waitForSelector({
          sessionId: 'test-session-id',
          selector: '#nonexistent',
          timeout: 1000,
        })
      ).rejects.toThrow();
    });
  });

  describe('execute', () => {
    it('should execute JavaScript in page context', async () => {
      mockSession.page.evaluate.mockResolvedValue('evaluated result');

      const result = await handler.execute({
        sessionId: 'test-session-id',
        script: 'document.title',
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe('evaluated result');
      expect(mockSession.page.evaluate).toHaveBeenCalledWith('document.title');
    });

    it('should validate script parameter', async () => {
      await expect(
        handler.execute({
          sessionId: 'test-session-id',
          script: '',
        })
      ).rejects.toThrow();
    });

    it('should handle execution errors', async () => {
      mockSession.page.evaluate.mockRejectedValue(
        new Error('Script execution failed')
      );

      await expect(
        handler.execute({
          sessionId: 'test-session-id',
          script: 'invalid javascript',
        })
      ).rejects.toThrow();
    });

    it('should return complex objects from execution', async () => {
      const complexResult = {
        type: 'object',
        value: { nested: { data: 'test' } },
      };

      mockSession.page.evaluate.mockResolvedValue(complexResult);

      const result = await handler.execute({
        sessionId: 'test-session-id',
        script: '({ type: typeof document, value: window.location })',
      });

      expect(result.success).toBe(true);
      expect(result.result).toEqual(complexResult);
    });
  });

  describe('getPageInfo', () => {
    it('should get page URL and title', async () => {
      const result = await handler.getPageInfo({
        sessionId: 'test-session-id',
      });

      expect(result.success).toBe(true);
      expect(result.url).toBe('https://example.com');
      expect(result.title).toBe('Test Page');
    });

    it('should handle missing page info', async () => {
      mockSession.page.url.mockResolvedValue(null);
      mockSession.page.title.mockResolvedValue(null);

      const result = await handler.getPageInfo({
        sessionId: 'test-session-id',
      });

      expect(result.success).toBe(true);
    });

    it('should handle errors getting page info', async () => {
      mockSession.page.url.mockRejectedValue(new Error('Failed to get URL'));

      await expect(
        handler.getPageInfo({
          sessionId: 'test-session-id',
        })
      ).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle session not found errors', async () => {
      vi.spyOn(sessionManager, 'getSession').mockRejectedValue(
        new Error('Session not found')
      );

      await expect(
        handler.click({
          sessionId: 'nonexistent-session',
          selector: '#button',
        })
      ).rejects.toThrow('Session not found');
    });

    it('should provide detailed error messages', async () => {
      mockSession.page.click.mockRejectedValue(
        new Error('Element with selector #button not found after 5000ms')
      );

      try {
        await handler.click({
          sessionId: 'test-session-id',
          selector: '#button',
        });
      } catch (error: any) {
        expect(error.message).toContain('Element');
      }
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple concurrent clicks', async () => {
      const promises = [
        handler.click({ sessionId: 'test-session-id', selector: '#button1' }),
        handler.click({ sessionId: 'test-session-id', selector: '#button2' }),
        handler.click({ sessionId: 'test-session-id', selector: '#button3' }),
      ];

      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('should handle mixed operations concurrently', async () => {
      const promises = [
        handler.navigate({
          sessionId: 'test-session-id',
          url: 'https://example.com',
        }),
        handler.getText({ sessionId: 'test-session-id', selector: '#title' }),
        handler.execute({
          sessionId: 'test-session-id',
          script: 'document.title',
        }),
      ];

      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });
});
