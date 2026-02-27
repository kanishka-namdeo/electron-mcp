/**
 * Debug Tools for MCP Server
 * 
 * Provides tools for controlling and monitoring the debug system:
 * - Enable/disable debug mode
 * - Configure log levels and categories
 * - View debug status and statistics
 * - Retrieve logs
 */

import { z } from 'zod';
import { 
  getDebugManager, 
  LogLevel, 
  LogCategory, 
  initializeDebugManager,
  closeDebugManager
} from '../core/debug-manager.js';
import { createLogger } from '../core/logger.js';
// readdir is dynamically imported when needed
import { resolve, join } from 'path';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

const logger = createLogger('DebugTools');

// Zod schemas for tool validation
export const EnableDebugSchema = z.object({
  level: z.enum(['debug', 'info', 'notice', 'warning', 'error', 'critical', 'alert', 'emergency'])
    .optional()
    .describe('Minimum log level to capture'),
  categories: z.array(z.enum([
    'SESSION', 'CDP', 'TOOLS', 'NETWORK', 'ELEMENT', 'VISUAL', 
    'MAIN_PROCESS', 'CONFIG', 'ERROR', 'PERFORMANCE', 'MCP', 'DEBUG'
  ])).optional().describe('Log categories to enable'),
  logToFile: z.boolean().optional().describe('Enable file logging'),
  logToConsole: z.boolean().optional().describe('Enable console logging'),
  logDirectory: z.string().optional().describe('Custom log directory path'),
});

export const ConfigureDebugSchema = z.object({
  level: z.enum(['debug', 'info', 'notice', 'warning', 'error', 'critical', 'alert', 'emergency'])
    .optional()
    .describe('New minimum log level'),
  categories: z.array(z.enum([
    'SESSION', 'CDP', 'TOOLS', 'NETWORK', 'ELEMENT', 'VISUAL', 
    'MAIN_PROCESS', 'CONFIG', 'ERROR', 'PERFORMANCE', 'MCP', 'DEBUG'
  ])).optional().describe('New log categories'),
  addCategories: z.array(z.enum([
    'SESSION', 'CDP', 'TOOLS', 'NETWORK', 'ELEMENT', 'VISUAL', 
    'MAIN_PROCESS', 'CONFIG', 'ERROR', 'PERFORMANCE', 'MCP', 'DEBUG'
  ])).optional().describe('Categories to add'),
  removeCategories: z.array(z.enum([
    'SESSION', 'CDP', 'TOOLS', 'NETWORK', 'ELEMENT', 'VISUAL', 
    'MAIN_PROCESS', 'CONFIG', 'ERROR', 'PERFORMANCE', 'MCP', 'DEBUG'
  ])).optional().describe('Categories to remove'),
});

export const GetLogsSchema = z.object({
  limit: z.number().min(1).max(10000).optional().describe('Maximum number of log entries to retrieve'),
  level: z.enum(['debug', 'info', 'notice', 'warning', 'error', 'critical', 'alert', 'emergency'])
    .optional()
    .describe('Filter by minimum log level'),
  categories: z.array(z.enum([
    'SESSION', 'CDP', 'TOOLS', 'NETWORK', 'ELEMENT', 'VISUAL', 
    'MAIN_PROCESS', 'CONFIG', 'ERROR', 'PERFORMANCE', 'MCP', 'DEBUG'
  ])).optional().describe('Filter by categories'),
  sessionId: z.string().optional().describe('Filter by session ID'),
  since: z.string().datetime().optional().describe('Filter entries after this ISO timestamp'),
  until: z.string().datetime().optional().describe('Filter entries before this ISO timestamp'),
  search: z.string().optional().describe('Search text in message field'),
});

// Type exports
export type EnableDebugInput = z.infer<typeof EnableDebugSchema>;
export type ConfigureDebugInput = z.infer<typeof ConfigureDebugSchema>;
export type GetLogsInput = z.infer<typeof GetLogsSchema>;

/**
 * Enable debug mode with specified configuration
 */
export async function enableDebug(input: EnableDebugInput): Promise<{
  success: boolean;
  message: string;
  config: Record<string, unknown>;
}> {
  try {
    const levelMap: Record<string, LogLevel> = {
      'debug': LogLevel.DEBUG,
      'info': LogLevel.INFO,
      'notice': LogLevel.NOTICE,
      'warning': LogLevel.WARNING,
      'error': LogLevel.ERROR,
      'critical': LogLevel.CRITICAL,
      'alert': LogLevel.ALERT,
      'emergency': LogLevel.EMERGENCY,
    };

    const config: Partial<import('../core/debug-manager.js').DebugConfig> = {
      enabled: true,
      level: input.level ? levelMap[input.level] : LogLevel.DEBUG,
      categories: input.categories as LogCategory[] || Object.values(LogCategory),
      logToFile: input.logToFile ?? true,
      logToConsole: input.logToConsole ?? true,
    };

    if (input.logDirectory) {
      config.logDirectory = input.logDirectory;
    }

    // Initialize or update debug manager
    let debugManager = getDebugManager();
    if (!debugManager) {
      debugManager = initializeDebugManager(config);
    } else {
      debugManager.updateConfig(config);
    }

    logger.info('Debug mode enabled');

    return {
      success: true,
      message: 'Debug mode enabled successfully',
      config: debugManager.getStatus(),
    };
  } catch (error) {
    logger.error({ error }, 'Failed to enable debug mode');
    return {
      success: false,
      message: `Failed to enable debug mode: ${error instanceof Error ? error.message : 'Unknown error'}`,
      config: {},
    };
  }
}

/**
 * Disable debug mode
 */
export async function disableDebug(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    closeDebugManager();
    logger.info('Debug mode disabled');

    return {
      success: true,
      message: 'Debug mode disabled successfully',
    };
  } catch (error) {
    logger.error({ error }, 'Failed to disable debug mode');
    return {
      success: false,
      message: `Failed to disable debug mode: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Configure debug settings
 */
export async function configureDebug(input: ConfigureDebugInput): Promise<{
  success: boolean;
  message: string;
  config: Record<string, unknown>;
}> {
  try {
    const debugManager = getDebugManager();
    if (!debugManager) {
      return {
        success: false,
        message: 'Debug mode is not enabled. Enable it first with enable_debug.',
        config: {},
      };
    }

    const levelMap: Record<string, LogLevel> = {
      'debug': LogLevel.DEBUG,
      'info': LogLevel.INFO,
      'notice': LogLevel.NOTICE,
      'warning': LogLevel.WARNING,
      'error': LogLevel.ERROR,
      'critical': LogLevel.CRITICAL,
      'alert': LogLevel.ALERT,
      'emergency': LogLevel.EMERGENCY,
    };

    // Update level if provided
    if (input.level) {
      debugManager.setLevel(levelMap[input.level]);
    }

    // Update categories
    let categories = debugManager.getConfig().categories;

    if (input.categories) {
      // Replace all categories
      categories = input.categories as LogCategory[];
    } else {
      // Add/remove categories
      if (input.addCategories) {
        categories = [...categories, ...(input.addCategories as LogCategory[])];
      }
      if (input.removeCategories) {
        categories = categories.filter(c => !(input.removeCategories as LogCategory[]).includes(c));
      }
    }

    // Remove duplicates
    categories = [...new Set(categories)];
    debugManager.setCategories(categories);

    logger.info('Debug configuration updated');

    return {
      success: true,
      message: 'Debug configuration updated successfully',
      config: debugManager.getStatus(),
    };
  } catch (error) {
    logger.error({ error }, 'Failed to configure debug');
    return {
      success: false,
      message: `Failed to configure debug: ${error instanceof Error ? error.message : 'Unknown error'}`,
      config: {},
    };
  }
}

/**
 * Get debug status
 */
export async function getDebugStatus(): Promise<{
  enabled: boolean;
  config: Record<string, unknown>;
}> {
  const debugManager = getDebugManager();
  
  if (!debugManager) {
    return {
      enabled: false,
      config: {},
    };
  }

  return {
    enabled: true,
    config: debugManager.getStatus(),
  };
}

/**
 * Retrieve logs based on filters
 */
export async function getLogs(input: GetLogsInput): Promise<{
  success: boolean;
  message: string;
  logs: import('../core/debug-manager.js').LogEntry[];
  total: number;
}> {
  try {
    const logDir = resolve(process.cwd(), '.electron-mcp/logs');
    
    // Check if log directory exists
    const { existsSync } = await import('fs');
    if (!existsSync(logDir)) {
      return {
        success: true,
        message: 'No logs found (log directory does not exist)',
        logs: [],
        total: 0,
      };
    }

    // Get all log files
    const { readdir } = await import('fs/promises');
    const files = await readdir(logDir);
    const logFiles = files
      .filter(f => f.startsWith('electron-mcp-') && f.endsWith('.log'))
      .sort()
      .reverse(); // Most recent first

    if (logFiles.length === 0) {
      return {
        success: true,
        message: 'No log files found',
        logs: [],
        total: 0,
      };
    }

    // Parse filters
    const { LogLevelFromName } = await import('../core/debug-manager.js');
    const levelFilter = input.level ? LogLevelFromName[input.level.toLowerCase()] : undefined;
    const categoryFilter = input.categories;
    const sinceDate = input.since ? new Date(input.since).getTime() : undefined;
    const untilDate = input.until ? new Date(input.until).getTime() : undefined;
    const searchText = input.search?.toLowerCase();
    const limit = input.limit || 1000;

    // Read and filter logs
    const logs = [];
    let totalProcessed = 0;

    for (const logFile of logFiles) {
      if (logs.length >= limit) break;

      const filePath = join(logDir, logFile);
      const fileStream = createReadStream(filePath);
      const rl = createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      for await (const line of rl) {
        totalProcessed++;

        if (logs.length >= limit) break;

        try {
          const entry = JSON.parse(line);

          // Apply filters
          if (levelFilter !== undefined && entry.level < levelFilter) continue;
          if (categoryFilter && !categoryFilter.includes(entry.category)) continue;
          if (input.sessionId && entry.sessionId !== input.sessionId) continue;
          if (sinceDate) {
            const entryTime = new Date(entry.timestamp).getTime();
            if (entryTime < sinceDate) continue;
          }
          if (untilDate) {
            const entryTime = new Date(entry.timestamp).getTime();
            if (entryTime > untilDate) continue;
          }
          if (searchText && !entry.message.toLowerCase().includes(searchText)) continue;

          logs.push(entry);
        } catch {
          // Skip invalid lines
          continue;
        }
      }

      // Note: fileStream is automatically closed by readline when iteration completes
      // Explicit close is not needed and would throw TypeError since ReadStream has no close() method
    }

    return {
      success: true,
      message: `Retrieved ${logs.length} log entries (processed ${totalProcessed} total)`,
      logs,
      total: logs.length,
    };
  } catch (error) {
    logger.error({ error }, 'Failed to get logs');
    return {
      success: false,
      message: `Failed to get logs: ${error instanceof Error ? error.message : 'Unknown error'}`,
      logs: [],
      total: 0,
    };
  }
}

/**
 * Clear all logs
 */
export async function clearLogs(): Promise<{
  success: boolean;
  message: string;
  filesRemoved: number;
}> {
  try {
    const logDir = resolve(process.cwd(), '.electron-mcp/logs');
    const { existsSync } = await import('fs');
    
    if (!existsSync(logDir)) {
      return {
        success: true,
        message: 'No logs to clear (log directory does not exist)',
        filesRemoved: 0,
      };
    }

    const { readdir, unlink } = await import('fs/promises');
    const files = await readdir(logDir);
    const logFiles = files.filter(f => f.startsWith('electron-mcp-'));

    let removed = 0;
    for (const file of logFiles) {
      await unlink(join(logDir, file));
      removed++;
    }

    logger.info({ filesRemoved: removed }, 'Logs cleared');

    return {
      success: true,
      message: `Cleared ${removed} log files`,
      filesRemoved: removed,
    };
  } catch (error) {
    logger.error({ error }, 'Failed to clear logs');
    return {
      success: false,
      message: `Failed to clear logs: ${error instanceof Error ? error.message : 'Unknown error'}`,
      filesRemoved: 0,
    };
  }
}
