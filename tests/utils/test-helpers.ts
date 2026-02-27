import { mkdir, writeFile, readFile, unlink, access } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

export interface MockSession {
  id: string;
  appPath: string;
  createdAt: number;
  metadata?: Record<string, any>;
}

export interface MockPage {
  goto: (url: string) => Promise<void>;
  click: (selector: string) => Promise<void>;
  fill: (selector: string, value: string) => Promise<void>;
  selectOption: (selector: string, value: string) => Promise<void>;
  waitForSelector: (selector: string, options?: any) => Promise<void>;
  content: () => Promise<string>;
  title: () => Promise<string>;
  evaluate: (script: string) => Promise<any>;
  url: () => Promise<string>;
  screenshot: (options?: any) => Promise<Buffer>;
}

export class TestHelpers {
  static generateId(prefix: string = 'test'): string {
    return `${prefix}-${randomBytes(8).toString('hex')}`;
  }

  static generateSessionId(): string {
    return this.generateId('session');
  }

  static async createTempDir(baseDir: string): Promise<string> {
    const tempDir = join(baseDir, '.temp', this.generateId('dir'));
    await mkdir(tempDir, { recursive: true });
    return tempDir;
  }

  static async cleanupTempDir(dir: string): Promise<void> {
    const { rm } = await import('fs/promises');
    try {
      await rm(dir, { recursive: true, force: true });
    } catch (error) {
    }
  }

  static async createMockSession(options: Partial<MockSession> = {}): Promise<MockSession> {
    return {
      id: options.id || this.generateSessionId(),
      appPath: options.appPath || '/mock/path/to/app',
      createdAt: options.createdAt || Date.now(),
      metadata: options.metadata || {},
    };
  }

  static createMockPage(overrides: Partial<MockPage> = {}): MockPage {
    return {
      goto: overrides.goto || (async () => {}),
      click: overrides.click || (async () => {}),
      fill: overrides.fill || (async () => {}),
      selectOption: overrides.selectOption || (async () => {}),
      waitForSelector: overrides.waitForSelector || (async () => {}),
      content: overrides.content || (async () => 'Mock page content'),
      title: overrides.title || (async () => 'Mock Page Title'),
      evaluate: overrides.evaluate || (async () => 'Mock result'),
      url: overrides.url || (async () => 'https://mock.example.com'),
      screenshot: overrides.screenshot || (async () => Buffer.from('mock-screenshot')),
    };
  }

  static async createTestHTML(content: string, path: string): Promise<void> {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Test Page</title>
</head>
<body>
  ${content}
</body>
</html>`;

    await writeFile(path, html, 'utf-8');
  }

  static createBasicTestHTML(): string {
    return `
      <h1>Test Page</h1>
      <button id="test-button">Click Me</button>
      <input id="test-input" type="text" placeholder="Test input">
      <div id="test-output">Output will appear here</div>
      <select id="test-select">
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </select>
    `;
  }

  static createFormTestHTML(): string {
    return `
      <form id="test-form">
        <input name="username" type="text" id="username" placeholder="Username">
        <input name="email" type="email" id="email" placeholder="Email">
        <input name="age" type="number" id="age" min="0" max="120">
        <textarea name="message" id="message" placeholder="Message"></textarea>
        <button type="submit" id="submit-btn">Submit</button>
      </form>
      <div id="form-output"></div>
    `;
  }

  static createDynamicContentHTML(): string {
    return `
      <div id="counter">0</div>
      <button id="increment">Increment</button>
      <button id="decrement">Decrement</button>
      <button id="reset">Reset</button>
      <div id="dynamic-text">Dynamic text</div>
      <div id="hidden-element" style="display: none;">Hidden content</div>
      <button id="toggle-hidden">Toggle Hidden</button>
    `;
  }

  static createAccessibilityHTML(): string {
    return `
      <nav aria-label="Main Navigation">
        <ul>
          <li><a href="#" aria-label="Home">Home</a></li>
          <li><a href="#" aria-label="About">About</a></li>
          <li><a href="#" aria-label="Contact">Contact</a></li>
        </ul>
      </nav>
      <main>
        <h1>Accessible Page</h1>
        <button aria-label="Perform action">Action Button</button>
        <input aria-label="Search query" type="text" placeholder="Search...">
        <div role="alert" aria-live="polite" id="alert-box">Alert message</div>
      </main>
    `;
  }

  static async createScreenshotFixture(filename: string, width: number = 800, height: number = 600): Promise<Buffer> {
    const size = width * height * 4;
    const buffer = Buffer.alloc(size);
    
    for (let i = 0; i < size; i += 4) {
      buffer[i] = 255;
      buffer[i + 1] = 255;
      buffer[i + 2] = 255;
      buffer[i + 3] = 255;
    }

    return buffer;
  }

  static async saveScreenshotFixture(buffer: Buffer, path: string): Promise<void> {
    await writeFile(path, buffer);
  }

  static getTestAppPath(): string {
    return join(process.cwd(), 'test-app');
  }

  static getTestScreenshotsPath(): string {
    return join(process.cwd(), 'tests', 'e2e', 'screenshots');
  }

  static getTestFixturesPath(): string {
    return join(process.cwd(), 'tests', 'fixtures');
  }

  static async setupTestFixtures(): Promise<void> {
    const fixturesPath = this.getTestFixturesPath();
    const screenshotsPath = this.getTestScreenshotsPath();

    try {
      await access(fixturesPath);
    } catch {
      await mkdir(fixturesPath, { recursive: true });
    }

    try {
      await access(screenshotsPath);
    } catch {
      await mkdir(screenshotsPath, { recursive: true });
    }

    await this.createTestHTML(this.createBasicTestHTML(), join(fixturesPath, 'basic.html'));
    await this.createTestHTML(this.createFormTestHTML(), join(fixturesPath, 'form.html'));
    await this.createTestHTML(this.createDynamicContentHTML(), join(fixturesPath, 'dynamic.html'));
    await this.createTestHTML(this.createAccessibilityHTML(), join(fixturesPath, 'accessibility.html'));
  }

  static async cleanupTestFixtures(): Promise<void> {
    const { rm } = await import('fs/promises');
    const fixturesPath = this.getTestFixturesPath();

    try {
      await rm(fixturesPath, { recursive: true, force: true });
    } catch (error) {
    }
  }

  static async readFileAsBuffer(path: string): Promise<Buffer> {
    return readFile(path);
  }

  static async readFileAsText(path: string): Promise<string> {
    return readFile(path, 'utf-8');
  }

  static async fileExists(path: string): Promise<boolean> {
    try {
      await access(path);
      return true;
    } catch {
      return false;
    }
  }

  static async deleteFile(path: string): Promise<void> {
    try {
      await unlink(path);
    } catch (error) {
    }
  }

  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static retry<T>(
    fn: () => Promise<T>,
    options: { maxAttempts?: number; delay?: number } = {}
  ): Promise<T> {
    const { maxAttempts = 3, delay: retryDelay = 1000 } = options;

    return fn().catch(async (error) => {
      if (maxAttempts <= 1) {
        throw error;
      }
      await this.delay(retryDelay);
      return this.retry(fn, { maxAttempts: maxAttempts - 1, delay: retryDelay });
    });
  }

  static mockConsole(): {
    logs: string[];
    restore: () => void;
  } {
    const logs: string[] = [];
    const originalConsole = { ...console };

    ['log', 'warn', 'error', 'info'].forEach((method) => {
      console[method as keyof Console] = (...args: any[]) => {
        logs.push(`[${method.toUpperCase()}] ${args.join(' ')}`);
        (originalConsole[method as keyof Console] as any)(...args);
      };
    });

    return {
      logs,
      restore: () => {
        Object.assign(console, originalConsole);
      },
    };
  }
}

export class AssertionHelpers {
  static assertValidSession(session: any): void {
    expect(session).toBeDefined();
    expect(session.id).toBeDefined();
    expect(typeof session.id).toBe('string');
    expect(session.id.length).toBeGreaterThan(0);
    expect(session.appPath).toBeDefined();
    expect(session.createdAt).toBeDefined();
    expect(typeof session.createdAt).toBe('number');
  }

  static assertValidMCPResponse(response: any): void {
    expect(response).toBeDefined();
    expect(response.jsonrpc).toBe('2.0');
    expect(response.id).toBeDefined();
    expect(response.result !== undefined || response.error !== undefined).toBe(true);
  }

  static assertToolCallResult(result: any): void {
    expect(result).toBeDefined();
    expect(result.success !== undefined).toBe(true);
    if (!result.success && result.error) {
      expect(result.error.message).toBeDefined();
    }
  }

  static assertValidToolDefinition(tool: any): void {
    expect(tool).toBeDefined();
    expect(tool.name).toBeDefined();
    expect(tool.description).toBeDefined();
    expect(tool.inputSchema).toBeDefined();
    expect(tool.inputSchema.type).toBe('object');
    expect(tool.inputSchema.properties).toBeDefined();
  }
}
