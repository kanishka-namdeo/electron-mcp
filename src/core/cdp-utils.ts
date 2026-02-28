import { chromium } from 'playwright';

export interface CDPConnectionOptions {
  host?: string;
  port: number;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface CDPProtocolInfo {
  browser: string;
  protocolVersion: string;
  webSocketDebuggerUrl?: string;
  userAgent: string;
  v8Version?: string;
  webKitVersion?: string;
}

export interface NetworkConditions {
  offline: boolean;
  downloadThroughput?: number;
  uploadThroughput?: number;
  latency?: number;
}

export interface Geolocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export class CDPUtils {
  private static instance: CDPUtils;
  private static readonly DEFAULT_TIMEOUT = 30000;
  private static readonly DEFAULT_RETRIES = 3;
  private static readonly DEFAULT_RETRY_DELAY = 1000;
  private static readonly MAX_RETRY_DELAY = 5000;

  private constructor() {}

  static getInstance(): CDPUtils {
    if (!CDPUtils.instance) {
      CDPUtils.instance = new CDPUtils();
    }
    return CDPUtils.instance;
  }

  static async connectWithRetry(
    options: CDPConnectionOptions
  ): Promise<ReturnType<typeof chromium.connectOverCDP>> {
    const {
      host = 'localhost',
      port,
      timeout = this.DEFAULT_TIMEOUT,
      retries = this.DEFAULT_RETRIES,
      retryDelay = this.DEFAULT_RETRY_DELAY,
    } = options;

    const hosts = [host, '127.0.0.1', '::1'];
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      const delay = Math.min(
        retryDelay * Math.pow(2, attempt - 1),
        this.MAX_RETRY_DELAY
      );

      if (attempt > 0) {
        await this.sleep(delay);
      }

      for (const currentHost of hosts) {
        try {
          const formattedHost = currentHost.includes(':') ? `[${currentHost}]` : currentHost;
          const browser = await chromium.connectOverCDP(
            `http://${formattedHost}:${port}`,
            { timeout }
          );

          return browser;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));

          if (error instanceof Error) {
            const errorCode = (error as any).code;
            const isConnectionError = 
              errorCode === 'ECONNREFUSED' ||
              errorCode === 'ETIMEDOUT' ||
              errorCode === 'ENOTFOUND' ||
              errorCode === 'EHOSTUNREACH' ||
              error.message.includes('ECONNREFUSED') ||
              error.message.includes('ETIMEDOUT') ||
              error.message.includes('connect');

            if (!isConnectionError) {
              throw error;
            }
          }

          if (attempt === retries && currentHost === hosts[hosts.length - 1]) {
            throw new Error(
              `Failed to connect to CDP after ${retries} retries: ${lastError?.message}`
            );
          }
        }
      }
    }

    throw lastError || new Error('Failed to connect to CDP');
  }

  static async getProtocolInfo(
    browser: Awaited<ReturnType<typeof chromium.connectOverCDP>>
  ): Promise<CDPProtocolInfo> {
    try {
      const version = await browser.version();
      const versionStr = typeof version === 'string' ? version : '';
      
      return {
        browser: 'Chromium',
        protocolVersion: '1.3',
        userAgent: versionStr,
      };
    } catch {
      return {
        browser: 'unknown',
        protocolVersion: 'unknown',
        userAgent: 'unknown',
      };
    }
  }

  static async emulateNetworkConditions(
    page: any,
    conditions: NetworkConditions
  ): Promise<void> {
    const client = await page.context().newCDPSession(page);

    await client.send('Network.emulateNetworkConditions', {
      offline: conditions.offline,
      downloadThroughput: conditions.downloadThroughput,
      uploadThroughput: conditions.uploadThroughput,
      latency: conditions.latency,
    });
  }

  static async resetNetworkConditions(page: any): Promise<void> {
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    });
  }

  static async setGeolocation(
    page: any,
    geolocation: Geolocation
  ): Promise<void> {
    const client = await page.context().newCDPSession(page);
    await client.send('Emulation.setGeolocationOverride', {
      latitude: geolocation.latitude,
      longitude: geolocation.longitude,
      accuracy: geolocation.accuracy || 0,
    });
  }

  static async clearGeolocationOverride(page: any): Promise<void> {
    const client = await page.context().newCDPSession(page);
    await client.send('Emulation.clearGeolocationOverride');
  }

  static async setDeviceMetrics(
    page: any,
    options: {
      width: number;
      height: number;
      deviceScaleFactor?: number;
      mobile?: boolean;
    }
  ): Promise<void> {
    const client = await page.context().newCDPSession(page);
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: options.width,
      height: options.height,
      deviceScaleFactor: options.deviceScaleFactor || 1,
      mobile: options.mobile || false,
    });
  }

  static async getUserAgent(page: any): Promise<string> {
    return await page.evaluate(() => navigator.userAgent);
  }

  static async captureConsoleMessages(page: any): Promise<any[]> {
    const messages: any[] = [];
    page.on('console', (msg: any) => {
      messages.push({
        type: msg.type(),
        text: msg.text(),
        location: {
          url: page.url(),
          lineNumber: msg.location().lineNumber,
          columnNumber: msg.location().columnNumber,
        },
        timestamp: new Date().toISOString(),
      });
    });
    return messages;
  }

  static async capturePerformanceMetrics(page: any): Promise<any> {
    const client = await page.context().newCDPSession(page);
    const metrics = await client.send('Performance.getMetrics');
    return metrics;
  }

  static async clearBrowserCache(page: any): Promise<void> {
    const client = await page.context().newCDPSession(page);
    await client.send('Network.clearBrowserCache');
    await client.send('Network.clearBrowserCookies');
  }

  static async getNavigationHistory(page: any): Promise<{
    currentIndex: number;
    entries: Array<{ id: number; url: string; title: string }>;
  }> {
    const client = await page.context().newCDPSession(page);
    const result = await client.send('Page.getNavigationHistory');

    return {
      currentIndex: result.currentIndex,
      entries: (result.entries || []).map((entry: any) => ({
        id: entry.id,
        url: entry.url,
        title: entry.title,
      })),
    };
  }

  static async navigateToHistoryEntry(page: any, entryId: number): Promise<void> {
    const client = await page.context().newCDPSession(page);
    await client.send('Page.navigateToHistoryEntry', { entryId });
  }

  static isConnectionError(error: any): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const errorCode = error.code || error.errno;
    const errorMessage = String(error.message || error);

    return (
      errorCode === 'ECONNREFUSED' ||
      errorCode === 'ETIMEDOUT' ||
      errorCode === 'ENOTFOUND' ||
      errorCode === 'EHOSTUNREACH' ||
      errorCode === 'ECONNRESET' ||
      errorCode === 'EPIPE' ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('ETIMEDOUT') ||
      errorMessage.includes('ENOTFOUND') ||
      errorMessage.includes('EHOSTUNREACH') ||
      errorMessage.includes('connect ') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('Timeout')
    );
  }

  static isProtocolError(error: any): boolean {
    if (!error) {
      return false;
    }

    const errorMessage = String(error.message || error);
    return (
      errorMessage.includes('Target') ||
      errorMessage.includes('Session') ||
      errorMessage.includes('CDP') ||
      errorMessage.includes('Protocol') ||
      errorMessage.includes('WebSocket') ||
      errorMessage.includes('disconnected')
    );
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

