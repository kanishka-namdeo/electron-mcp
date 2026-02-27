import { SessionManager } from '../../session/index.js';
import { createLogger } from '../../core/logger.js';
import {
  LaunchElectronAppInput,
  ConnectToElectronCDPInput,
  CloseSessionInput,
  ListSessionsInput,
} from '../validation.js';

const logger = createLogger('AppLifecycleHandler');

export class AppLifecycleHandler {
  constructor(private sessionManager: SessionManager) {}

  async launchApp(input: LaunchElectronAppInput) {
    try {
      logger.info({ executablePath: input.executablePath }, 'Launching Electron app');

      const metadata = await this.sessionManager.createSession({
        executablePath: input.executablePath,
        args: input.args,
        headless: input.headless,
        slowMo: input.slowMo,
      });

      return {
        success: true,
        sessionId: metadata.id,
        status: metadata.status,
        createdAt: metadata.createdAt.toISOString(),
      };
    } catch (error) {
      logger.error({ error }, 'Failed to launch Electron app');
      throw error;
    }
  }

  async connectToCDP(input: ConnectToElectronCDPInput) {
    try {
      logger.info({ port: input.port, host: input.host }, 'Connecting to Electron CDP');

      const metadata = await this.sessionManager.createSession({
        port: input.port,
        host: input.host,
        timeout: input.timeout,
      });

      return {
        success: true,
        sessionId: metadata.id,
        status: metadata.status,
        createdAt: metadata.createdAt.toISOString(),
      };
    } catch (error) {
      logger.error({ error }, 'Failed to connect to Electron CDP');
      throw error;
    }
  }

  async closeSession(input: CloseSessionInput) {
    try {
      logger.info({ sessionId: input.sessionId }, 'Closing session');

      await this.sessionManager.closeSession(input.sessionId);

      return {
        success: true,
        message: 'Session closed successfully',
      };
    } catch (error) {
      logger.error({ error, sessionId: input.sessionId }, 'Failed to close session');
      throw error;
    }
  }

  async listSessions(_input: ListSessionsInput) {
    try {
      const sessions = this.sessionManager.listSessions();

      logger.info({ count: sessions.length }, 'Listing sessions');

      return {
        success: true,
        sessions: sessions.map(s => ({
          id: s.id,
          status: s.status,
          createdAt: s.createdAt.toISOString(),
          lastActivityAt: s.lastActivityAt.toISOString(),
        })),
      };
    } catch (error) {
      logger.error({ error }, 'Failed to list sessions');
      throw error;
    }
  }
}
