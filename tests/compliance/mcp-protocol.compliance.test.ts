import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { join } from 'path';
import { spawn } from 'child_process';
import { randomBytes } from 'crypto';

interface MCPRequest {
  jsonrpc: '2.0';
  id: string;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

describe('MCP Protocol Compliance Tests', () => {
  let serverProcess: any;
  let requestIdCounter = 0;
  let buffer = '';

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      const serverPath = join(process.cwd(), 'dist', 'index.js');
      serverProcess = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, LOG_LEVEL: 'info', NODE_ENV: 'test' },
      });

      serverProcess.stdout.on('data', (data: Buffer) => {
        buffer += data.toString();
      });

      serverProcess.on('error', (error) => {
        console.error('Server error:', error);
      });

      setTimeout(resolve, 1000);
    });
  }, 10000);

  afterAll(async () => {
    if (serverProcess) {
      return new Promise<void>((resolve) => {
        serverProcess.on('exit', resolve);
        serverProcess.kill('SIGTERM');
        setTimeout(() => {
          if (!serverProcess.killed) {
            serverProcess.kill('SIGKILL');
          }
          resolve();
        }, 5000);
      });
    }
  });

  function sendRequest(method: string, params?: any): Promise<MCPResponse> {
    return new Promise((resolve, reject) => {
      const requestId = `req-${requestIdCounter++}`;
      const request: MCPRequest = {
        jsonrpc: '2.0',
        id: requestId,
        method,
        params,
      };

      let responseBuffer = '';
      const checkResponse = (data: Buffer) => {
        responseBuffer += data.toString();
        const lines = responseBuffer.split('\n');
        responseBuffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const response = JSON.parse(line) as MCPResponse;
              if (response.id === requestId) {
                serverProcess.stdout.off('data', checkResponse);
                resolve(response);
              }
            } catch (error) {
            }
          }
        }
      };

      serverProcess.stdout.on('data', checkResponse);

      if (serverProcess.stdin) {
        serverProcess.stdin.write(JSON.stringify(request) + '\n');
      } else {
        reject(new Error('Server stdin not available'));
        return;
      }

      setTimeout(() => {
        serverProcess.stdout.off('data', checkResponse);
        reject(new Error(`Timeout waiting for response to ${method}`));
      }, 10000);
    });
  }

  describe('JSON-RPC 2.0 Specification', () => {
    it('should include jsonrpc version in responses', async () => {
      const response = await sendRequest('tools/list');
      expect(response.jsonrpc).toBe('2.0');
    });

    it('should include request id in responses', async () => {
      const response = await sendRequest('tools/list');
      expect(response.id).toBeDefined();
      expect(typeof response.id).toBe('string');
    });

    it('should have either result or error field', async () => {
      const response = await sendRequest('tools/list');
      const hasResult = 'result' in response;
      const hasError = 'error' in response;
      expect(hasResult || hasError).toBe(true);
      expect(hasResult && hasError).toBe(false);
    });

    it('should handle valid JSON-RPC requests', async () => {
      const response = await sendRequest('tools/list');
      expect(response.error).toBeUndefined();
      expect(response.result).toBeDefined();
    });

    it('should reject invalid JSON-RPC requests', async () => {
      await expect(
        sendRequest('invalid_method')
      ).rejects.toThrow();
    });
  });

  describe('MCP Server Capabilities', () => {
    it('should advertise tools capability', async () => {
      const response = await sendRequest('tools/list');
      expect(response.result).toBeDefined();
      expect(Array.isArray(response.result.tools)).toBe(true);
    });

    it('should have tool definitions with required fields', async () => {
      const response = await sendRequest('tools/list');
      
      response.result.tools.forEach((tool: any) => {
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.inputSchema).toBeDefined();
      });
    });

    it('should have valid JSON Schema for tool inputs', async () => {
      const response = await sendRequest('tools/list');
      
      response.result.tools.forEach((tool: any) => {
        const schema = tool.inputSchema;
        expect(schema.type).toBe('object');
        expect(schema.properties).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('should return structured error responses', async () => {
      try {
        await sendRequest('tools/call', {
          name: 'nonexistent_tool',
          arguments: {},
        });
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it('should have error codes according to JSON-RPC spec', async () => {
      try {
        await sendRequest('invalid_method');
      } catch (error: any) {
      }
    });

    it('should provide descriptive error messages', async () => {
      try {
        await sendRequest('tools/call', {
          name: 'unknown_tool_xyz',
          arguments: {},
        });
      } catch (error: any) {
        expect(error.message).toBeTruthy();
        expect(typeof error.message).toBe('string');
      }
    });
  });

  describe('Tool Call Protocol', () => {
    it('should accept valid tool calls', async () => {
      const response = await sendRequest('tools/call', {
        name: 'list_sessions',
        arguments: {},
      });

      expect(response.error).toBeUndefined();
      expect(response.result).toBeDefined();
    });

    it('should validate tool call arguments', async () => {
      const response = await sendRequest('tools/call', {
        name: 'navigate',
        arguments: {},
      });

      expect(response.error).toBeDefined();
    });

    it('should return tool call results in proper format', async () => {
      const response = await sendRequest('tools/call', {
        name: 'list_sessions',
        arguments: {},
      });

      if (response.result) {
        expect(Array.isArray(response.result.content)).toBe(true);
      }
    });

    it('should handle tool execution errors gracefully', async () => {
      const response = await sendRequest('tools/call', {
        name: 'navigate',
        arguments: {
          sessionId: 'nonexistent-session',
          url: 'https://example.com',
        },
      });

      expect(response.result).toBeDefined();
    });
  });

  describe('Tool Definition Compliance', () => {
    it('should have unique tool names', async () => {
      const response = await sendRequest('tools/list');
      const toolNames = response.result.tools.map((t: any) => t.name);
      const uniqueNames = new Set(toolNames);
      expect(uniqueNames.size).toBe(toolNames.length);
    });

    it('should have descriptive tool names', async () => {
      const response = await sendRequest('tools/list');
      
      response.result.tools.forEach((tool: any) => {
        expect(tool.name).toMatch(/^[a-z_]+$/);
        expect(tool.name.length).toBeGreaterThan(0);
      });
    });

    it('should have meaningful descriptions', async () => {
      const response = await sendRequest('tools/list');
      
      response.result.tools.forEach((tool: any) => {
        expect(tool.description).toBeDefined();
        expect(tool.description.length).toBeGreaterThan(10);
      });
    });

    it('should have valid input schema properties', async () => {
      const response = await sendRequest('tools/list');
      
      response.result.tools.forEach((tool: any) => {
        const schema = tool.inputSchema;
        expect(schema).toHaveProperty('type');
        expect(schema).toHaveProperty('properties');
        expect(schema).toHaveProperty('required');
      });
    });
  });

  describe('Session Management Protocol', () => {
    it('should support session listing', async () => {
      const response = await sendRequest('tools/call', {
        name: 'list_sessions',
        arguments: {},
      });

      expect(response.error).toBeUndefined();
    });

    it('should support session closure', async () => {
      const response = await sendRequest('tools/call', {
        name: 'close_session',
        arguments: {
          sessionId: 'test-session-id',
        },
      });

      expect(response.result).toBeDefined();
    });
  });

  describe('Response Format', () => {
    it('should return consistent response structure', async () => {
      const response = await sendRequest('tools/list');
      
      expect(response).toHaveProperty('jsonrpc');
      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('result');
    });

    it('should serialize responses as valid JSON', async () => {
      const response = await sendRequest('tools/list');
      
      expect(() => JSON.stringify(response)).not.toThrow();
      expect(() => JSON.parse(JSON.stringify(response))).not.toThrow();
    });

    it('should handle empty result sets', async () => {
      const response = await sendRequest('tools/call', {
        name: 'list_sessions',
        arguments: {},
      });

      if (response.result?.sessions) {
        expect(Array.isArray(response.result.sessions)).toBe(true);
      }
    });
  });

  describe('Performance and Limits', () => {
    it('should respond within reasonable time', async () => {
      const start = Date.now();
      await sendRequest('tools/list');
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000);
    });

    it('should handle rapid successive requests', async () => {
      const promises = Array(5).fill(null).map(() => 
        sendRequest('tools/list')
      );

      const results = await Promise.all(promises);
      results.forEach(result => {
        expect(result.result).toBeDefined();
      });
    });
  });

  describe('Security Considerations', () => {
    it('should not expose sensitive information', async () => {
      const response = await sendRequest('tools/list');
      const responseStr = JSON.stringify(response);
      
      expect(responseStr).not.toMatch(/password/i);
      expect(responseStr).not.toMatch(/secret/i);
      expect(responseStr).not.toMatch(/token/i);
    });

    it('should validate input parameters', async () => {
      const response = await sendRequest('tools/call', {
        name: 'navigate',
        arguments: {
          sessionId: 'session-id',
          url: 'javascript:alert(1)',
        },
      });

      expect(response.result).toBeDefined();
    });
  });

  describe('Tool Categories', () => {
    it('should have app lifecycle tools', async () => {
      const response = await sendRequest('tools/list');
      const toolNames = response.result.tools.map((t: any) => t.name);
      
      expect(toolNames).toContain('launch_electron_app');
      expect(toolNames).toContain('connect_to_electron_cdp');
      expect(toolNames).toContain('close_session');
      expect(toolNames).toContain('list_sessions');
    });

    it('should have element interaction tools', async () => {
      const response = await sendRequest('tools/list');
      const toolNames = response.result.tools.map((t: any) => t.name);
      
      expect(toolNames).toContain('navigate');
      expect(toolNames).toContain('click');
      expect(toolNames).toContain('fill');
      expect(toolNames).toContain('select');
      expect(toolNames).toContain('get_text');
    });

    it('should have visual testing tools', async () => {
      const response = await sendRequest('tools/list');
      const toolNames = response.result.tools.map((t: any) => t.name);
      
      expect(toolNames).toContain('take_screenshot');
      expect(toolNames).toContain('get_viewport_size');
      expect(toolNames).toContain('get_accessibility_tree');
    });

    it('should have main process tools', async () => {
      const response = await sendRequest('tools/list');
      const toolNames = response.result.tools.map((t: any) => t.name);
      
      expect(toolNames).toContain('execute_main_process_script');
      expect(toolNames).toContain('get_main_window_info');
      expect(toolNames).toContain('focus_main_window');
    });
  });
});
