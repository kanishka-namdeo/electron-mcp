import { _electron as electron, type BrowserContext, type Browser, type ElectronApplication, type Page } from 'playwright';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '../core/logger.js';
import {
  SessionConfig,
  SessionMetadata,
  ElectronConnectionOptions,
  ElectronLaunchOptions,
} from '../core/types.js';
import {
  SessionNotFoundError,
  SessionAlreadyExistsError,
  ElectronLaunchError,
} from '../core/errors.js';
import { CDPUtils, CDPConnectionOptions } from '../core/cdp-utils.js';

const logger = createLogger('SessionManager');

interface Session {
  config: SessionConfig;
  context: BrowserContext;
  metadata: SessionMetadata;
  browser: Browser | ElectronApplication;
  page?: Page;
  browserType: 'chromium' | 'electron';
}

export class SessionManager {
  private sessions = new Map<string, Session>();

  async createSession(options: ElectronConnectionOptions): Promise<SessionMetadata> {
    const sessionId = uuidv4();
    
    if (this.sessions.has(sessionId)) {
      throw new SessionAlreadyExistsError(sessionId);
    }

    logger.info({ sessionId, options }, 'Creating session');

    let context: BrowserContext;
    let browser: Browser | ElectronApplication;
    let page: Page | undefined;
    
    try {
      if (this.isLaunchOptions(options)) {
        const electronApp = await electron.launch({
          executablePath: options.executablePath,
          args: options.args,
        });
        browser = electronApp;
        const firstWindow = electronApp.firstWindow();
        if (firstWindow) {
          page = await firstWindow;
          context = page.context();
        } else {
          throw new Error('No window found in Electron app');
        }
      } else {
        const cdpOptions: CDPConnectionOptions = {
          host: options.host || 'localhost',
          port: options.port,
          timeout: 30000,
          retries: 3,
          retryDelay: 1000,
        };

        const chromiumBrowser = await CDPUtils.connectWithRetry(cdpOptions);
        browser = chromiumBrowser;
        const existingPages = chromiumBrowser.contexts().flatMap((c: any) => c.pages());

        if (existingPages.length > 0) {
          page = existingPages[0];
          context = page!.context();
          logger.info({ pagesCount: existingPages.length, host: options.host, port: options.port }, 'Using existing page from CDP connection');
        } else {
          throw new Error('No pages found in connected browser');
        }
      }
    } catch (error) {
      logger.error({ error, sessionId }, 'Failed to create session');
      throw new ElectronLaunchError(
        error instanceof Error ? error.message : 'Unknown error',
        { error }
      );
    }

    const now = new Date();
    const sessionConfig: SessionConfig = {
      id: sessionId,
      connectionOptions: options,
      createdAt: now,
      lastActivityAt: now,
    };

    const metadata: SessionMetadata = {
      id: sessionId,
      status: 'active',
      createdAt: now,
      lastActivityAt: now,
    };

    this.sessions.set(sessionId, {
      config: sessionConfig,
      context,
      metadata,
      browser,
      page,
      browserType: this.isLaunchOptions(options) ? 'electron' : 'chromium',
    });

    logger.info({ sessionId }, 'Session created successfully');
    return metadata;
  }

  async getSession(sessionId: string): Promise<Session> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new SessionNotFoundError(sessionId);
    }

    session.metadata.lastActivityAt = new Date();
    return session;
  }

  async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new SessionNotFoundError(sessionId);
    }

    logger.info({ sessionId }, 'Closing session');

    await session.context.close();
    if (session.page) {
      await session.page.close();
    }
    if (session.browser && 'close' in session.browser) {
      await (session.browser as Browser).close();
    }
    session.metadata.status = 'closed';
    this.sessions.delete(sessionId);

    logger.info({ sessionId }, 'Session closed');
  }

  listSessions(): SessionMetadata[] {
    return Array.from(this.sessions.values()).map(s => s.metadata);
  }

  async pauseSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new SessionNotFoundError(sessionId);
    }

    logger.info({ sessionId }, 'Pausing session');
    session.metadata.status = 'paused';
  }

  async resumeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new SessionNotFoundError(sessionId);
    }

    logger.info({ sessionId }, 'Resuming session');
    session.metadata.status = 'active';
  }

  private isLaunchOptions(
    options: ElectronConnectionOptions
  ): options is ElectronLaunchOptions {
    return 'executablePath' in options;
  }

  async cleanup(): Promise<void> {
    logger.info('Cleaning up all sessions');
    
    const closePromises = Array.from(this.sessions.entries()).map(
      async ([id, session]) => {
        try {
          await session.context.close();
          if (session.page) {
            await session.page.close();
          }
          if (session.browser && 'close' in session.browser) {
            await (session.browser as Browser).close();
          }
        } catch (error) {
          logger.error({ sessionId: id, error }, 'Error closing session during cleanup');
        }
      }
    );

    await Promise.all(closePromises);
    this.sessions.clear();
    
    logger.info('All sessions cleaned up');
  }
}
