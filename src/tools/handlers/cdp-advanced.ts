import { createMCPError, classifyError, ErrorCategory } from '../../core/errors-enhanced.js';
import { CDPUtils } from '../../core/cdp-utils.js';
import { createLogger } from '../../core/logger.js';
import type { SessionManager } from '../../session/session-manager.js';

const logger = createLogger('CDPAdvancedHandler');

export class CDPAdvancedHandler {
  constructor(private sessionManager: SessionManager) {}

  async getProtocolInfo(sessionId: string) {
    try {
      const session = await this.sessionManager.getSession(sessionId);

      if (session.browserType === 'electron') {
        throw new Error('Protocol info not available for Electron sessions');
      }

      const protocolInfo = await CDPUtils.getProtocolInfo(session.browser as any);

      logger.info({ sessionId, protocolInfo }, 'Retrieved protocol info');

      return {
        success: true,
        protocolInfo,
      };
    } catch (error) {
      const mcpError = classifyError(error);
      if (mcpError) {
        throw mcpError;
      }

      logger.error({ sessionId, error }, 'Failed to get protocol info');
      throw createMCPError(
        ErrorCategory.PROTOCOL_ERROR,
        'GET_PROTOCOL_INFO_FAILED',
        'Failed to get CDP protocol info'
      );
    }
  }

  async emulateNetworkConditions(sessionId: string, conditions: any) {
    try {
      const session = await this.sessionManager.getSession(sessionId);

      await CDPUtils.emulateNetworkConditions(session.page, conditions);

      logger.info({ sessionId, conditions }, 'Emulated network conditions');

      return {
        success: true,
        message: `Network conditions emulated: ${JSON.stringify(conditions)}`,
      };
    } catch (error) {
      const mcpError = classifyError(error);
      if (mcpError) {
        throw mcpError;
      }

      logger.error({ sessionId, error }, 'Failed to emulate network conditions');
      throw createMCPError(
        ErrorCategory.RESOURCE_ERROR,
        'NETWORK_EMULATION_FAILED',
        'Failed to emulate network conditions'
      );
    }
  }

  async resetNetworkConditions(sessionId: string) {
    try {
      const session = await this.sessionManager.getSession(sessionId);

      await CDPUtils.resetNetworkConditions(session.page);

      logger.info({ sessionId }, 'Reset network conditions');

      return {
        success: true,
        message: 'Network conditions reset to default',
      };
    } catch (error) {
      const mcpError = classifyError(error);
      if (mcpError) {
        throw mcpError;
      }

      logger.error({ sessionId, error }, 'Failed to reset network conditions');
      throw createMCPError(
        ErrorCategory.RESOURCE_ERROR,
        'NETWORK_RESET_FAILED',
        'Failed to reset network conditions'
      );
    }
  }

  async setGeolocation(sessionId: string, latitude: number, longitude: number, accuracy?: number) {
    try {
      const session = await this.sessionManager.getSession(sessionId);

      await CDPUtils.setGeolocation(session.page, { latitude, longitude, accuracy });

      logger.info({ sessionId, latitude, longitude }, 'Set geolocation');

      return {
        success: true,
        message: `Geolocation set to lat: ${latitude}, lon: ${longitude}`,
      };
    } catch (error) {
      const mcpError = classifyError(error);
      if (mcpError) {
        throw mcpError;
      }

      logger.error({ sessionId, error }, 'Failed to set geolocation');
      throw createMCPError(
        ErrorCategory.RESOURCE_ERROR,
        'GEOLOCATION_SET_FAILED',
        'Failed to set geolocation'
      );
    }
  }

  async clearGeolocation(sessionId: string) {
    try {
      const session = await this.sessionManager.getSession(sessionId);

      await CDPUtils.clearGeolocationOverride(session.page);

      logger.info({ sessionId }, 'Cleared geolocation override');

      return {
        success: true,
        message: 'Geolocation override cleared',
      };
    } catch (error) {
      const mcpError = classifyError(error);
      if (mcpError) {
        throw mcpError;
      }

      logger.error({ sessionId, error }, 'Failed to clear geolocation');
      throw createMCPError(
        ErrorCategory.RESOURCE_ERROR,
        'GEOLOCATION_CLEAR_FAILED',
        'Failed to clear geolocation'
      );
    }
  }

  async setDeviceMetrics(sessionId: string, width: number, height: number, deviceScaleFactor?: number, mobile?: boolean) {
    try {
      const session = await this.sessionManager.getSession(sessionId);

      await CDPUtils.setDeviceMetrics(session.page, { width, height, deviceScaleFactor, mobile });

      logger.info({ sessionId, width, height }, 'Set device metrics');

      return {
        success: true,
        message: `Device metrics set to ${width}x${height}`,
      };
    } catch (error) {
      const mcpError = classifyError(error);
      if (mcpError) {
        throw mcpError;
      }

      logger.error({ sessionId, error }, 'Failed to set device metrics');
      throw createMCPError(
        ErrorCategory.RESOURCE_ERROR,
        'DEVICE_METRICS_SET_FAILED',
        'Failed to set device metrics'
      );
    }
  }

  async getConsoleMessages(sessionId: string) {
    try {
      const session = await this.sessionManager.getSession(sessionId);

      const messages = await CDPUtils.captureConsoleMessages(session.page);

      logger.info({ sessionId, count: messages.length }, 'Captured console messages');

      return {
        success: true,
        messages,
      };
    } catch (error) {
      const mcpError = classifyError(error);
      if (mcpError) {
        throw mcpError;
      }

      logger.error({ sessionId, error }, 'Failed to capture console messages');
      throw createMCPError(
        ErrorCategory.RESOURCE_ERROR,
        'CONSOLE_CAPTURE_FAILED',
        'Failed to capture console messages'
      );
    }
  }

  async getPerformanceMetrics(sessionId: string) {
    try {
      const session = await this.sessionManager.getSession(sessionId);

      const metrics = await CDPUtils.capturePerformanceMetrics(session.page);

      logger.info({ sessionId }, 'Retrieved performance metrics');

      return {
        success: true,
        metrics,
      };
    } catch (error) {
      const mcpError = classifyError(error);
      if (mcpError) {
        throw mcpError;
      }

      logger.error({ sessionId, error }, 'Failed to get performance metrics');
      throw createMCPError(
        ErrorCategory.RESOURCE_ERROR,
        'PERFORMANCE_METRICS_FAILED',
        'Failed to get performance metrics'
      );
    }
  }

  async clearBrowserCache(sessionId: string) {
    try {
      const session = await this.sessionManager.getSession(sessionId);

      await CDPUtils.clearBrowserCache(session.page);

      logger.info({ sessionId }, 'Cleared browser cache');

      return {
        success: true,
        message: 'Browser cache and cookies cleared',
      };
    } catch (error) {
      const mcpError = classifyError(error);
      if (mcpError) {
        throw mcpError;
      }

      logger.error({ sessionId, error }, 'Failed to clear browser cache');
      throw createMCPError(
        ErrorCategory.RESOURCE_ERROR,
        'CACHE_CLEAR_FAILED',
        'Failed to clear browser cache'
      );
    }
  }

  async getUserAgent(sessionId: string) {
    try {
      const session = await this.sessionManager.getSession(sessionId);

      const userAgent = await CDPUtils.getUserAgent(session.page);

      logger.info({ sessionId }, 'Retrieved user agent');

      return {
        success: true,
        userAgent,
      };
    } catch (error) {
      const mcpError = classifyError(error);
      if (mcpError) {
        throw mcpError;
      }

      logger.error({ sessionId, error }, 'Failed to get user agent');
      throw createMCPError(
        ErrorCategory.RESOURCE_ERROR,
        'USER_AGENT_GET_FAILED',
        'Failed to get user agent'
      );
    }
  }
}
