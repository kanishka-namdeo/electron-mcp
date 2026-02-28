import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { E2ETestHelper } from './e2e-helper.js';

describe('MCP Server E2E Tests', () => {
  let helper: E2ETestHelper;
  let sessionId: string;

  beforeAll(async () => {
    helper = new E2ETestHelper({
      serverPath: join(process.cwd(), 'dist', 'index.js'),
      env: {
        LOG_LEVEL: 'info',
        NODE_ENV: 'test',
      },
    });

    await helper.setup();
    await helper.createTestDirectory();
  }, 60000);

  afterAll(async () => {
    await helper.teardown();
  }, 30000);

  describe('Server Initialization', () => {
    it('should list all available tools', async () => {
      const tools = await helper.callMCPMethod('tools/list');
      
      expect(tools).toBeDefined();
      expect(Array.isArray(tools.tools)).toBe(true);
      expect(tools.tools.length).toBeGreaterThan(0);
      
      const toolNames = tools.tools.map((t: any) => t.name);
      expect(toolNames).toContain('launch_electron_app');
      expect(toolNames).toContain('connect_to_electron_cdp');
      expect(toolNames).toContain('navigate');
      expect(toolNames).toContain('click');
      expect(toolNames).toContain('fill');
    });

    it('should have proper tool schema definitions', async () => {
      const tools = await helper.callMCPMethod('tools/list');
      
      for (const tool of tools.tools) {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        
        expect(tool.name).toBeTruthy();
        expect(tool.description).toBeTruthy();
        expect(tool.inputSchema).toHaveProperty('type');
        expect(tool.inputSchema.type).toBe('object');
      }
    });
  });

  describe('Session Management', () => {
    it('should list empty sessions initially', async () => {
      const result = await helper.callTool('list_sessions', {});
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.sessions)).toBe(true);
      expect(result.sessions.length).toBe(0);
    });

    it('should connect to CDP and create session', async () => {
      sessionId = await helper.connectToCDP(9222);
      
      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
      expect(sessionId.length).toBeGreaterThan(0);
    }, 30000);

    it('should list active session after connection', async () => {
      const result = await helper.callTool('list_sessions', {});
      
      expect(result.success).toBe(true);
      expect(result.sessions.length).toBeGreaterThan(0);
      expect(result.sessions[0].id).toBe(sessionId);
    });

    it('should close session successfully', async () => {
      await helper.closeSession(sessionId);
      
      const result = await helper.callTool('list_sessions', {});
      expect(result.sessions.length).toBe(0);
    });
  });

  describe('Element Interaction Tools', () => {
    beforeEach(async () => {
      sessionId = await helper.connectToCDP(9222);
    });

    afterEach(async () => {
      try {
        await helper.closeSession(sessionId);
      } catch (error) {
      }
    });

    describe('navigate', () => {
      it('should navigate to a URL', async () => {
        const result = await helper.callTool('navigate', {
          sessionId,
          url: 'https://example.com',
        });

        expect(result.success).toBe(true);
        expect(result.url).toBe('https://example.com');
      }, 30000);

      it('should validate URL format', async () => {
        await expect(
          helper.callTool('navigate', {
            sessionId,
            url: 'not-a-valid-url',
          })
        ).rejects.toThrow();
      });
    });

    describe('get_page_info', () => {
      it('should get current page information', async () => {
        await helper.callTool('navigate', {
          sessionId,
          url: 'https://example.com',
        });

        const result = await helper.callTool('get_page_info', { sessionId });

        expect(result.success).toBe(true);
        expect(result.url).toContain('example.com');
        expect(result.title).toBeTruthy();
      }, 30000);
    });

    describe('execute', () => {
      it('should execute JavaScript in renderer process', async () => {
        const result = await helper.callTool('execute', {
          sessionId,
          script: 'document.title',
        });

        expect(result.success).toBe(true);
        expect(result.result).toBeTruthy();
      });

      it('should handle complex JavaScript expressions', async () => {
        const result = await helper.callTool('execute', {
          sessionId,
          script: '({ type: typeof document, title: document.title })',
        });

        expect(result.success).toBe(true);
        expect(result.result.type).toBe('object');
        expect(result.result.title).toBeTruthy();
      });
    });

    describe('wait_for_selector', () => {
      it('should wait for existing element', async () => {
        await helper.callTool('navigate', {
          sessionId,
          url: 'https://example.com',
        });

        const result = await helper.callTool('wait_for_selector', {
          sessionId,
          selector: 'h1',
          timeout: 5000,
          state: 'visible',
        });

        expect(result.success).toBe(true);
      }, 30000);

      it('should timeout for non-existent element', async () => {
        await helper.callTool('navigate', {
          sessionId,
          url: 'https://example.com',
        });

        await expect(
          helper.callTool('wait_for_selector', {
            sessionId,
            selector: '#non-existent-element-xyz',
            timeout: 3000,
          })
        ).rejects.toThrow();
      }, 30000);
    });

    describe('get_text', () => {
      it('should get text from element', async () => {
        await helper.callTool('navigate', {
          sessionId,
          url: 'https://example.com',
        });

        await helper.callTool('wait_for_selector', {
          sessionId,
          selector: 'h1',
          timeout: 5000,
        });

        const result = await helper.callTool('get_text', {
          sessionId,
          selector: 'h1',
        });

        expect(result.success).toBe(true);
        expect(result.text).toBeTruthy();
        expect(typeof result.text).toBe('string');
      }, 30000);
    });

    describe('fill', () => {
      it('should fill input field', async () => {
        await helper.callTool('navigate', {
          sessionId,
          url: 'https://example.com',
        });

        const result = await helper.callTool('fill', {
          sessionId,
          selector: 'input[type="text"], input:not([type]), textarea',
          value: 'test value',
        });

        expect(result).toBeDefined();
      }, 30000);
    });

    describe('click', () => {
      it('should click on element', async () => {
        await helper.callTool('navigate', {
          sessionId,
          url: 'https://example.com',
        });

        await helper.callTool('wait_for_selector', {
          sessionId,
          selector: 'a',
          timeout: 5000,
        });

        const result = await helper.callTool('click', {
          sessionId,
          selector: 'a:first-child',
        });

        expect(result).toBeDefined();
      }, 30000);
    });
  });

  describe('Visual Testing Tools', () => {
    beforeEach(async () => {
      sessionId = await helper.connectToCDP(9222);
    });

    afterEach(async () => {
      try {
        await helper.closeSession(sessionId);
      } catch (error) {
      }
    });

    describe('take_screenshot', () => {
      it('should take a full page screenshot', async () => {
        await helper.callTool('navigate', {
          sessionId,
          url: 'https://example.com',
        });

        const screenshotPath = helper.getScreenshotPath('test-screenshot.png');
        const result = await helper.callTool('take_screenshot', {
          sessionId,
          path: screenshotPath,
          fullPage: true,
        });

        expect(result.success).toBe(true);
        expect(result.path).toBe(screenshotPath);
        expect(result.size).toBeGreaterThan(0);
      }, 30000);

      it('should take viewport screenshot', async () => {
        await helper.callTool('navigate', {
          sessionId,
          url: 'https://example.com',
        });

        const screenshotPath = helper.getScreenshotPath('test-viewport-screenshot.png');
        const result = await helper.callTool('take_screenshot', {
          sessionId,
          path: screenshotPath,
          fullPage: false,
        });

        expect(result.success).toBe(true);
      }, 30000);
    });

    describe('get_viewport_size', () => {
      it('should get current viewport size', async () => {
        const result = await helper.callTool('get_viewport_size', {
          sessionId,
        });

        expect(result.success).toBe(true);
        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
      });
    });

    describe('set_viewport_size', () => {
      it('should set viewport size', async () => {
        const result = await helper.callTool('set_viewport_size', {
          sessionId,
          width: 1280,
          height: 720,
        });

        expect(result.success).toBe(true);
        expect(result.width).toBe(1280);
        expect(result.height).toBe(720);
      });

      it('should reflect new viewport size', async () => {
        await helper.callTool('set_viewport_size', {
          sessionId,
          width: 1920,
          height: 1080,
        });

        const result = await helper.callTool('get_viewport_size', {
          sessionId,
        });

        expect(result.width).toBe(1920);
        expect(result.height).toBe(1080);
      });
    });

    describe('get_accessibility_tree', () => {
      it('should retrieve accessibility tree', async () => {
        await helper.callTool('navigate', {
          sessionId,
          url: 'https://example.com',
        });

        const result = await helper.callTool('get_accessibility_tree', {
          sessionId,
        });

        expect(result.success).toBe(true);
        expect(result.accessibilityTree).toBeDefined();
        expect(typeof result.accessibilityTree).toBe('object');
      }, 30000);
    });
  });

  describe('Navigation History Tools', () => {
    beforeEach(async () => {
      sessionId = await helper.connectToCDP(9222);
    });

    afterEach(async () => {
      try {
        await helper.closeSession(sessionId);
      } catch (error) {
      }
    });

    it('should get and restore navigation history', async () => {
      await helper.callTool('navigate', {
        sessionId,
        url: 'https://example.com',
      });

      await helper.callTool('wait_for_selector', {
        sessionId,
        selector: 'h1',
        timeout: 10000,
      });

      await helper.callTool('navigate', {
        sessionId,
        url: 'https://example.com/?page=2',
      });

      const history = await helper.callTool('get_navigation_history', {
        sessionId,
      });

      expect(history.success).toBe(true);
      expect(Array.isArray(history.entries)).toBe(true);
      expect(history.entries.length).toBeGreaterThan(0);

      const restoreResult = await helper.callTool('restore_navigation_history', {
        sessionId,
        index: 0,
      });

      expect(restoreResult.success).toBe(true);

      const pageInfo = await helper.callTool('get_page_info', {
        sessionId,
      });

      expect(pageInfo.url).toContain('example.com');
    }, 60000);
  });

  describe('Codegen Recorder Tools', () => {
    beforeEach(async () => {
      sessionId = await helper.connectToCDP(9222);
    });

    afterEach(async () => {
      try {
        await helper.closeSession(sessionId);
      } catch (error) {
      }
    });

    it('should record a simple flow and export as test code', async () => {
      await helper.callTool('start_recording', {
        sessionId,
      });

      await helper.callTool('navigate', {
        sessionId,
        url: 'https://example.com',
      });

      await helper.callTool('wait_for_selector', {
        sessionId,
        selector: 'h1',
        timeout: 10000,
      });

      await helper.callTool('stop_recording', {
        sessionId,
      });

      const exportResult = await helper.callTool('export_recording_as_test', {
        sessionId,
        testName: 'recorded example.com flow',
      });

      expect(exportResult.success).toBe(true);
      expect(typeof exportResult.testCode).toBe('string');
      expect(exportResult.testCode).toContain('test(');
      expect(exportResult.testCode).toContain('page.goto');
    }, 60000);
  });

  describe('Error Handling', () => {
    it('should return error for unknown tool', async () => {
      await expect(
        helper.callMCPMethod('tools/call', {
          name: 'unknown_tool_xyz',
          arguments: {},
        })
      ).rejects.toThrow();
    });

    it('should handle invalid session ID', async () => {
      await expect(
        helper.callTool('navigate', {
          sessionId: 'invalid-session-id',
          url: 'https://example.com',
        })
      ).rejects.toThrow();
    });

    it('should return structured error response', async () => {
      try {
        await helper.callTool('navigate', {
          sessionId: 'non-existent-session',
          url: 'https://example.com',
        });
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toBeTruthy();
      }
    });
  });

  describe('Concurrency', () => {
    it('should handle multiple concurrent requests', async () => {
      const promises = [
        helper.callMCPMethod('tools/list'),
        helper.callMCPMethod('tools/list'),
        helper.callMCPMethod('tools/list'),
      ];

      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result.tools).toBeDefined();
        expect(result.tools.length).toBeGreaterThan(0);
      });
    });

    it('should maintain session isolation', async () => {
      const session1 = await helper.connectToCDP(9222);
      const session2 = await helper.connectToCDP(9223);

      const result1 = await helper.callTool('get_page_info', { sessionId: session1 });
      const result2 = await helper.callTool('get_page_info', { sessionId: session2 });

      expect(result1.sessionId).toBeDefined();
      expect(result2.sessionId).toBeDefined();

      await helper.closeSession(session1);
      await helper.closeSession(session2);
    }, 30000);
  });

  describe('Protocol Compliance', () => {
    it('should follow JSON-RPC 2.0 specification', async () => {
      const response = await helper.callMCPMethod('tools/list');
      
      expect(response).toHaveProperty('jsonrpc');
      expect(response.jsonrpc).toBe('2.0');
    });

    it('should return proper response structure', async () => {
      const response = await helper.callMCPMethod('tools/list');
      
      expect(response).toHaveProperty('tools');
      expect(Array.isArray(response.tools)).toBe(true);
    });

    it('should include tool metadata', async () => {
      const tools = await helper.callMCPMethod('tools/list');
      
      tools.tools.forEach((tool: any) => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        expect(tool.inputSchema).toHaveProperty('type');
        expect(tool.inputSchema).toHaveProperty('properties');
      });
    });
  });
});
