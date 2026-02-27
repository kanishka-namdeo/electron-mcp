import { spawn, ChildProcess } from 'child_process';
import { randomBytes } from 'crypto';
import { readFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';

interface MCPServerConfig {
  serverPath: string;
  env?: Record<string, string>;
}

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

interface MCPToolResult {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}

export class E2ETestHelper {
  private serverProcess: ChildProcess | null = null;
  private electronProcess: ChildProcess | null = null;
  private requestIdCounter = 0;
  private responseMap = new Map<string, { resolve: (value: any) => void; reject: (error: any) => void }>();
  private buffer = '';
  private tempDir: string;

  constructor(private mcpConfig: MCPServerConfig) {
    this.tempDir = join(process.cwd(), 'tests', 'e2e', '.temp');
  }

  async setup(): Promise<void> {
    await this.startMCPServer();
    await this.initializeConnection();
  }

  async teardown(): Promise<void> {
    await this.stopElectronApp();
    await this.stopMCPServer();
    this.cleanupTempFiles();
  }

  private async startMCPServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      const serverPath = this.mcpConfig.serverPath;
      const env = { ...process.env, ...this.mcpConfig.env };

      this.serverProcess = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env,
      });

      if (!this.serverProcess.stdin || !this.serverProcess.stdout || !this.serverProcess.stderr) {
        reject(new Error('Failed to create server process streams'));
        return;
      }

      this.serverProcess.stdout.on('data', (data) => this.handleServerOutput(data));
      this.serverProcess.stderr.on('data', (data) => {
        console.error('[MCP Server STDERR]:', data.toString());
      });

      this.serverProcess.on('error', reject);

      this.serverProcess.on('exit', (code, signal) => {
        if (code !== 0 && code !== null) {
          console.error(`[MCP Server] Exited with code ${code}, signal ${signal}`);
        }
      });

      setTimeout(resolve, 500);
    });
  }

  private async stopMCPServer(): Promise<void> {
    if (this.serverProcess) {
      return new Promise((resolve) => {
        this.serverProcess!.on('exit', resolve);
        this.serverProcess!.kill('SIGTERM');
        setTimeout(() => {
          if (this.serverProcess && !this.serverProcess.killed) {
            this.serverProcess.kill('SIGKILL');
          }
          resolve();
        }, 5000);
      });
    }
  }

  private handleServerOutput(data: Buffer): void {
    this.buffer += data.toString();

    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim()) {
        try {
          const response = JSON.parse(line) as MCPResponse;
          const handler = this.responseMap.get(response.id);
          if (handler) {
            handler.resolve(response);
            this.responseMap.delete(response.id);
          }
        } catch (error) {
          console.error('[E2E Helper] Failed to parse server output:', line);
        }
      }
    }
  }

  private async initializeConnection(): Promise<void> {
    const tools = await this.callMCPMethod('tools/list');
    console.log(`[E2E Helper] Connected to MCP server with ${tools.length} tools`);
  }

  async callMCPMethod(method: string, params?: any): Promise<any> {
    const response = await new Promise<any>((resolve, reject) => {
      const requestId = `req-${this.requestIdCounter++}`;

      const request: MCPRequest = {
        jsonrpc: '2.0',
        id: requestId,
        method,
        params,
      };

      this.responseMap.set(requestId, { resolve, reject });

      if (this.serverProcess?.stdin) {
        this.serverProcess.stdin.write(JSON.stringify(request) + '\n');
      } else {
        reject(new Error('Server process not available'));
        return;
      }

      setTimeout(() => {
        if (this.responseMap.has(requestId)) {
          this.responseMap.delete(requestId);
          reject(new Error(`Timeout waiting for response to ${method}`));
        }
      }, 30000);
    });

    if (response.error) {
      throw new Error(`MCP Error: ${JSON.stringify(response.error)}`);
    }

    return response.result || response;
  }

  async callTool(toolName: string, args: any): Promise<MCPToolResult & { isError?: boolean }> {
    const response = await this.callMCPMethod('tools/call', {
      name: toolName,
      arguments: args,
    });

    const content = JSON.parse(response.content[0].text);
    const result = { ...content, isError: response.isError };
    return result;
  }

  async launchTestApp(appPath: string, options: {
    headless?: boolean;
    args?: string[];
  } = {}): Promise<string> {
    const args = options.args || [];

    if (process.platform === 'win32') {
      args.push('--remote-debugging-port=9222');
    }

    const result = await this.callTool('launch_electron_app', {
      executablePath: appPath,
      args,
      headless: options.headless ?? true,
    });

    if (!result.success) {
      throw new Error(`Failed to launch app: ${result.error}`);
    }

    this.electronProcess = spawn(appPath, args, {
      detached: true,
      stdio: 'ignore',
    });

    this.electronProcess.unref();

    await this.sleep(2000);

    return result.sessionId;
  }

  async connectToCDP(port: number = 9222, host: string = 'localhost'): Promise<string> {
    const result = await this.callTool('connect_to_electron_cdp', {
      port,
      host,
    });

    if (!result.success) {
      throw new Error(`Failed to connect to CDP: ${result.error}`);
    }

    return result.sessionId;
  }

  async closeSession(sessionId: string): Promise<void> {
    await this.callTool('close_session', { sessionId });
  }

  async listSessions(): Promise<any[]> {
    const result = await this.callTool('list_sessions', {});
    return result.sessions || [];
  }

  private async stopElectronApp(): Promise<void> {
    if (this.electronProcess) {
      this.electronProcess.kill('SIGTERM');
      this.electronProcess = null;
    }
  }

  private cleanupTempFiles(): void {
    try {
      if (existsSync(this.tempDir)) {
        unlinkSync(this.tempDir);
      }
    } catch (error) {
    }
  }

  private generateSessionId(): string {
    return randomBytes(16).toString('hex');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getTestAppPath(): string {
    return join(process.cwd(), 'test-app');
  }

  getScreenshotPath(filename: string): string {
    return join(process.cwd(), 'tests', 'e2e', 'screenshots', filename);
  }

  async createTestDirectory(): Promise<void> {
    const fs = await import('fs/promises');
    const screenshotDir = join(process.cwd(), 'tests', 'e2e', 'screenshots');
    
    try {
      await fs.mkdir(screenshotDir, { recursive: true });
    } catch (error) {
    }
  }
}
