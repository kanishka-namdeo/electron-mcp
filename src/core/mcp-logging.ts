/**
 * MCP-compliant logging integration
 * 
 * Implements the MCP logging specification:
 * - RFC 5424 syslog severity levels
 * - logging/setLevel request handling
 * - notifications/message notifications
 * - Proper capability declaration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { 
  SetLevelRequestSchema,
  LoggingLevel,
} from '@modelcontextprotocol/sdk/types.js';
import { getDebugManager, LogLevel, LogCategory } from './debug-manager.js';
import { createLogger } from './logger.js';

const logger = createLogger('MCPLogging');

/**
 * Map MCP logging levels to our internal LogLevel
 */
const MCP_TO_INTERNAL_LEVEL: Record<LoggingLevel, LogLevel> = {
  'debug': LogLevel.DEBUG,
  'info': LogLevel.INFO,
  'notice': LogLevel.NOTICE,
  'warning': LogLevel.WARNING,
  'error': LogLevel.ERROR,
  'critical': LogLevel.CRITICAL,
  'alert': LogLevel.ALERT,
  'emergency': LogLevel.EMERGENCY,
};

/**
 * Map our internal LogLevel to MCP logging levels
 */
const INTERNAL_TO_MCP_LEVEL: Record<LogLevel, LoggingLevel> = {
  [LogLevel.DEBUG]: 'debug',
  [LogLevel.INFO]: 'info',
  [LogLevel.NOTICE]: 'notice',
  [LogLevel.WARNING]: 'warning',
  [LogLevel.ERROR]: 'error',
  [LogLevel.CRITICAL]: 'critical',
  [LogLevel.ALERT]: 'alert',
  [LogLevel.EMERGENCY]: 'emergency',
};

/**
 * Send a log message notification to MCP clients
 */
export type LogNotificationSender = (level: LoggingLevel, logger: string, data: Record<string, unknown>) => void;

let notificationSender: LogNotificationSender | undefined;

/**
 * Initialize MCP logging integration
 * 
 * @param server - The MCP server instance
 * @param sendNotification - Function to send notifications to clients
 * @returns The server instance with logging capability
 */
export function initializeMCPLogging(
  server: Server,
  sendNotification: LogNotificationSender
): Server {
  notificationSender = sendNotification;
  const debugManager = getDebugManager();

  // Register the MCP notification handler
  if (debugManager) {
    debugManager.setMCPNotificationHandler((level, category, data) => {
      sendNotification(
        INTERNAL_TO_MCP_LEVEL[level],
        category,
        data
      );
    });
  }

  // Set up the logging/setLevel request handler
  server.setRequestHandler(SetLevelRequestSchema, async (request) => {
    const { level } = request.params;
    
    logger.info({ level }, 'Received logging/setLevel request');

    const internalLevel = MCP_TO_INTERNAL_LEVEL[level];
    if (internalLevel === undefined) {
      throw new Error(`Invalid log level: ${level}`);
    }

    // Update the debug manager level
    if (debugManager) {
      debugManager.setLevel(internalLevel);
    }

    return {}; // Empty result per MCP spec
  });

  logger.info('MCP logging integration initialized');

  return server;
}

/**
 * Send a log message notification to clients
 * 
 * @param level - The log level
 * @param loggerName - The logger/category name
 * @param data - Additional log data
 */
export function sendLogNotification(
  level: LogLevel,
  loggerName: string,
  data: Record<string, unknown>
): void {
  if (!notificationSender) {
    logger.warn('Notification sender not initialized, log message dropped');
    return;
  }

  notificationSender(
    INTERNAL_TO_MCP_LEVEL[level],
    loggerName,
    data
  );
}

/**
 * Create a category-specific logger that integrates with MCP
 */
export function createCategoryLogger(category: LogCategory) {
  const debugManager = getDebugManager();

  return {
    debug: (message: string, context?: Record<string, unknown>, options?: any) => {
      debugManager?.debug(category, message, context, options);
    },
    info: (message: string, context?: Record<string, unknown>, options?: any) => {
      debugManager?.info(category, message, context, options);
    },
    notice: (message: string, context?: Record<string, unknown>, options?: any) => {
      debugManager?.notice(category, message, context, options);
    },
    warn: (message: string, context?: Record<string, unknown>, options?: any) => {
      debugManager?.warn(category, message, context, options);
    },
    error: (message: string, context?: Record<string, unknown>, options?: any) => {
      debugManager?.error(category, message, context, options);
    },
    critical: (message: string, context?: Record<string, unknown>, options?: any) => {
      debugManager?.critical(category, message, context, options);
    },
    alert: (message: string, context?: Record<string, unknown>, options?: any) => {
      debugManager?.alert(category, message, context, options);
    },
    emergency: (message: string, context?: Record<string, unknown>, options?: any) => {
      debugManager?.emergency(category, message, context, options);
    },
  };
}

// Export category-specific loggers
export const sessionLogger = createCategoryLogger(LogCategory.SESSION);
export const cdpLogger = createCategoryLogger(LogCategory.CDP);
export const toolsLogger = createCategoryLogger(LogCategory.TOOLS);
export const networkLogger = createCategoryLogger(LogCategory.NETWORK);
export const elementLogger = createCategoryLogger(LogCategory.ELEMENT);
export const visualLogger = createCategoryLogger(LogCategory.VISUAL);
export const mainProcessLogger = createCategoryLogger(LogCategory.MAIN_PROCESS);
export const configLogger = createCategoryLogger(LogCategory.CONFIG);
export const errorLogger = createCategoryLogger(LogCategory.ERROR);
export const performanceLogger = createCategoryLogger(LogCategory.PERFORMANCE);
export const mcpLogger = createCategoryLogger(LogCategory.MCP);
