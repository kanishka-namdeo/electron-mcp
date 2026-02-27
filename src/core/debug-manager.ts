/**
 * Debug Manager - Comprehensive logging and debugging system for MCP Server
 * 
 * Features:
 * - Granular log categories (SESSION, CDP, TOOLS, NETWORK, etc.)
 * - RFC 5424 compliant log levels (debug, info, notice, warning, error, critical, alert, emergency)
 * - MCP-compliant logging notifications to clients
 * - Project-local log file storage
 * - Structured JSON logging with rotation
 * - Performance metrics tracking
 */

import { createLogger, logger as baseLogger } from './logger.js';
import { createWriteStream, existsSync, mkdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const debugLogger = createLogger('DebugManager');

/**
 * RFC 5424 Log Levels (syslog severity)
 */
export enum LogLevel {
  DEBUG = 0,      // Detailed debugging information
  INFO = 1,       // General informational messages
  NOTICE = 2,     // Normal but significant events
  WARNING = 3,    // Warning conditions
  ERROR = 4,      // Error conditions
  CRITICAL = 5,   // Critical conditions
  ALERT = 6,      // Action must be taken immediately
  EMERGENCY = 7,  // System is unusable
}

export const LogLevelNames: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'debug',
  [LogLevel.INFO]: 'info',
  [LogLevel.NOTICE]: 'notice',
  [LogLevel.WARNING]: 'warning',
  [LogLevel.ERROR]: 'error',
  [LogLevel.CRITICAL]: 'critical',
  [LogLevel.ALERT]: 'alert',
  [LogLevel.EMERGENCY]: 'emergency',
};

export const LogLevelFromName: Record<string, LogLevel> = {
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
 * Granular log categories for filtering and organization
 */
export enum LogCategory {
  SESSION = 'SESSION',         // Session lifecycle (create, close, cleanup)
  CDP = 'CDP',                 // Chrome DevTools Protocol operations
  TOOLS = 'TOOLS',             // Tool execution and handlers
  NETWORK = 'NETWORK',         // Network emulation and monitoring
  ELEMENT = 'ELEMENT',         // Element interactions (click, fill, etc.)
  VISUAL = 'VISUAL',           // Visual testing (screenshots, accessibility)
  MAIN_PROCESS = 'MAIN_PROCESS', // Main process script execution
  CONFIG = 'CONFIG',           // Configuration and initialization
  ERROR = 'ERROR',             // Error handling and recovery
  PERFORMANCE = 'PERFORMANCE',   // Performance metrics and timing
  MCP = 'MCP',                 // MCP protocol communication
  DEBUG = 'DEBUG',             // Internal debugging
}

/**
 * Structured log entry format
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  levelName: string;
  category: LogCategory;
  message: string;
  context?: Record<string, unknown>;
  sessionId?: string;
  toolName?: string;
  durationMs?: number;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

/**
 * Configuration for the debug manager
 */
export interface DebugConfig {
  enabled: boolean;
  level: LogLevel;
  categories: LogCategory[];
  logToFile: boolean;
  logToConsole: boolean;
  logToMCP: boolean;
  logDirectory: string;
  maxFileSizeMB: number;
  maxFiles: number;
  compressOldLogs: boolean;
  includeTimestamp: boolean;
  includeContext: boolean;
  redactSensitiveData: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: DebugConfig = {
  enabled: false,
  level: LogLevel.INFO,
  categories: Object.values(LogCategory),
  logToFile: true,
  logToConsole: true,
  logToMCP: true,
  logDirectory: '.electron-mcp/logs',
  maxFileSizeMB: 10,
  maxFiles: 5,
  compressOldLogs: true,
  includeTimestamp: true,
  includeContext: true,
  redactSensitiveData: true,
};

/**
 * Sensitive keys that should be redacted from logs
 */
const SENSITIVE_KEYS = [
  'password', 'secret', 'token', 'key', 'auth', 'credential',
  'cookie', 'session', 'private', 'apikey', 'api_key', 'access_token'
];

/**
 * Debug Manager - Main class for handling debug operations
 */
export class DebugManager {
  private config: DebugConfig;
  private logStream?: ReturnType<typeof createWriteStream>;
  private currentLogFile: string = '';
  private currentFileSize: number = 0;
  private mcpNotificationHandler?: (level: LogLevel, logger: string, data: Record<string, unknown>) => void;
  private performanceMetrics: Map<string, number> = new Map();

  constructor(config?: Partial<DebugConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Override from environment variables
    this.loadConfigFromEnvironment();
    
    if (this.config.enabled) {
      this.initialize();
    }
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfigFromEnvironment(): void {
    const env = process.env;

    if (env.ELECTRON_MCP_DEBUG) {
      this.config.enabled = env.ELECTRON_MCP_DEBUG === 'true' || env.ELECTRON_MCP_DEBUG === '1';
    }

    if (env.ELECTRON_MCP_DEBUG_LEVEL) {
      const level = LogLevelFromName[env.ELECTRON_MCP_DEBUG_LEVEL.toLowerCase()];
      if (level !== undefined) {
        this.config.level = level;
      }
    }

    if (env.ELECTRON_MCP_DEBUG_CATEGORIES) {
      this.config.categories = env.ELECTRON_MCP_DEBUG_CATEGORIES
        .split(',')
        .map(c => c.trim().toUpperCase())
        .filter(c => Object.values(LogCategory).includes(c as LogCategory)) as LogCategory[];
    }

    if (env.ELECTRON_MCP_LOG_DIR) {
      this.config.logDirectory = env.ELECTRON_MCP_LOG_DIR;
    }

    if (env.ELECTRON_MCP_DEBUG_MCP) {
      this.config.logToMCP = env.ELECTRON_MCP_DEBUG_MCP === 'true' || env.ELECTRON_MCP_DEBUG_MCP === '1';
    }
  }

  /**
   * Initialize the debug manager
   */
  private initialize(): void {
    debugLogger.info('Debug mode enabled');

    if (this.config.logToFile) {
      this.initializeLogFile();
    }

    this.log(LogLevel.INFO, LogCategory.CONFIG, 'Debug manager initialized', {
      config: {
        ...this.config,
        // Don't log sensitive paths in production
        logDirectory: this.config.logDirectory ? '[REDACTED]' : undefined,
      },
    });
  }

  /**
   * Initialize the log file stream
   */
  private initializeLogFile(): void {
    try {
      // Resolve log directory relative to current working directory (project root)
      const logDir = resolve(process.cwd(), this.config.logDirectory);
      
      if (!existsSync(logDir)) {
        mkdirSync(logDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      this.currentLogFile = join(logDir, `electron-mcp-${timestamp}.log`);
      
      this.logStream = createWriteStream(this.currentLogFile, { flags: 'a' });
      this.currentFileSize = 0;

      // Check if we need to rotate based on file existence
      if (existsSync(this.currentLogFile)) {
        const stats = statSync(this.currentLogFile);
        this.currentFileSize = stats.size;
      }

      debugLogger.info({ logFile: this.currentLogFile }, 'Log file initialized');
    } catch (error) {
      debugLogger.error({ error }, 'Failed to initialize log file');
    }
  }

  /**
   * Rotate log file if it exceeds max size
   */
  private async rotateLogFile(): Promise<void> {
    if (!this.logStream || !this.currentLogFile) return;

    const maxSize = this.config.maxFileSizeMB * 1024 * 1024;
    if (this.currentFileSize < maxSize) return;

    try {
      // Close current stream
      this.logStream.end();

      // Compress old log if enabled
      if (this.config.compressOldLogs) {
        const compressedFile = `${this.currentLogFile}.gz`;
        await this.compressFile(this.currentLogFile, compressedFile);
        const { unlink } = await import('fs/promises');
        await unlink(this.currentLogFile);
      }

      // Clean up old logs
      await this.cleanupOldLogs();

      // Create new log file
      this.initializeLogFile();
    } catch (error) {
      debugLogger.error({ error }, 'Failed to rotate log file');
    }
  }

  /**
   * Compress a file using gzip
   */
  private async compressFile(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const { createReadStream } = require('fs');
      const { createGzip } = require('zlib');
      const { createWriteStream } = require('fs');
      
      const source = createReadStream(inputPath);
      const gzip = createGzip();
      const destination = createWriteStream(outputPath);
      
      source
        .pipe(gzip)
        .pipe(destination)
        .on('finish', () => resolve())
        .on('error', (err: Error) => reject(err));
    });
  }

  /**
   * Clean up old log files beyond maxFiles limit
   */
  private async cleanupOldLogs(): Promise<void> {
    try {
      const logDir = resolve(process.cwd(), this.config.logDirectory);
      const { readdir, unlink } = await import('fs/promises');
      const files = await readdir(logDir);

      const logFiles = files
        .filter(f => f.startsWith('electron-mcp-') && f.endsWith('.log'))
        .map(f => ({
          name: f,
          path: join(logDir, f),
          time: statSync(join(logDir, f)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time);

      // Remove old logs beyond maxFiles limit
      const filesToDelete = logFiles.slice(this.config.maxFiles);
      for (const file of filesToDelete) {
        await unlink(file.path);
      }
    } catch (error) {
      debugLogger.error({ error }, 'Failed to cleanup old logs');
    }
  }

  /**
   * Redact sensitive data from log context
   */
  private redactSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
    if (!this.config.redactSensitiveData) return data;

    const redacted: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive));
      
      if (isSensitive) {
        redacted[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        redacted[key] = this.redactSensitiveData(value as Record<string, unknown>);
      } else {
        redacted[key] = value;
      }
    }

    return redacted;
  }

  /**
   * Main log method
   */
  public log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    context?: Record<string, unknown>,
    options?: {
      sessionId?: string;
      toolName?: string;
      durationMs?: number;
      error?: Error;
    }
  ): void {
    // Check if debugging is enabled
    if (!this.config.enabled) return;

    // Check log level
    if (level < this.config.level) return;

    // Check category filter
    if (!this.config.categories.includes(category)) return;

    // Build log entry
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      levelName: LogLevelNames[level],
      category,
      message,
      context: context ? this.redactSensitiveData(context) : undefined,
      sessionId: options?.sessionId,
      toolName: options?.toolName,
      durationMs: options?.durationMs,
    };

    if (options?.error) {
      entry.error = {
        message: options.error.message,
        stack: options.error.stack,
        code: (options.error as any).code,
      };
    }

    // Output to different destinations
    this.outputLog(entry);
  }

  /**
   * Output log entry to configured destinations
   */
  private outputLog(entry: LogEntry): void {
    const logLine = JSON.stringify(entry) + '\n';

    // Console output
    if (this.config.logToConsole) {
      this.outputToConsole(entry);
    }

    // File output
    if (this.config.logToFile && this.logStream) {
      this.outputToFile(logLine);
    }

    // MCP notification
    if (this.config.logToMCP && this.mcpNotificationHandler) {
      this.outputToMCP(entry);
    }
  }

  /**
   * Output log entry to console
   */
  private outputToConsole(entry: LogEntry): void {
    const { levelName, category, message, context, error, durationMs } = entry;
    const timestamp = entry.timestamp.split('T')[1].split('.')[0];
    
    let output = `[${timestamp}] [${levelName.toUpperCase()}] [${category}] ${message}`;
    
    if (durationMs) {
      output += ` (${durationMs}ms)`;
    }

    const logMethod = this.getConsoleMethod(entry.level);
    
    if (error) {
      baseLogger[logMethod]({ error, context }, output);
    } else if (context && Object.keys(context).length > 0) {
      baseLogger[logMethod]({ context }, output);
    } else {
      baseLogger[logMethod](output);
    }
  }

  /**
   * Get console method based on log level
   */
  private getConsoleMethod(level: LogLevel): 'debug' | 'info' | 'warn' | 'error' {
    switch (level) {
      case LogLevel.DEBUG:
        return 'debug';
      case LogLevel.INFO:
      case LogLevel.NOTICE:
        return 'info';
      case LogLevel.WARNING:
        return 'warn';
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
      case LogLevel.ALERT:
      case LogLevel.EMERGENCY:
        return 'error';
      default:
        return 'info';
    }
  }

  /**
   * Output log line to file
   */
  private outputToFile(logLine: string): void {
    if (!this.logStream) return;

    this.logStream.write(logLine);
    this.currentFileSize += Buffer.byteLength(logLine, 'utf8');

    // Check if rotation is needed
    const maxSize = this.config.maxFileSizeMB * 1024 * 1024;
    if (this.currentFileSize >= maxSize) {
      this.rotateLogFile();
    }
  }

  /**
   * Output log entry as MCP notification
   */
  private outputToMCP(entry: LogEntry): void {
    if (!this.mcpNotificationHandler) return;

    this.mcpNotificationHandler(
      entry.level,
      entry.category,
      {
        message: entry.message,
        timestamp: entry.timestamp,
        context: entry.context,
        sessionId: entry.sessionId,
        toolName: entry.toolName,
        durationMs: entry.durationMs,
        error: entry.error,
      }
    );
  }

  /**
   * Set MCP notification handler for sending log messages to clients
   */
  public setMCPNotificationHandler(
    handler: (level: LogLevel, logger: string, data: Record<string, unknown>) => void
  ): void {
    this.mcpNotificationHandler = handler;
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<DebugConfig>): void {
    const wasEnabled = this.config.enabled;
    this.config = { ...this.config, ...config };

    // Initialize if enabling
    if (!wasEnabled && this.config.enabled) {
      this.initialize();
    }

    // Close stream if disabling
    if (wasEnabled && !this.config.enabled) {
      this.close();
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): DebugConfig {
    return { ...this.config };
  }

  /**
   * Set minimum log level
   */
  public setLevel(level: LogLevel): void {
    this.config.level = level;
    this.log(LogLevel.INFO, LogCategory.CONFIG, `Log level changed to ${LogLevelNames[level]}`);
  }

  /**
   * Enable/disable specific log categories
   */
  public setCategories(categories: LogCategory[]): void {
    this.config.categories = categories;
    this.log(LogLevel.INFO, LogCategory.CONFIG, `Log categories updated`, { categories });
  }

  /**
   * Start performance tracking for an operation
   */
  public startTimer(operationId: string): void {
    this.performanceMetrics.set(operationId, Date.now());
  }

  /**
   * End performance tracking and return duration
   */
  public endTimer(operationId: string): number {
    const startTime = this.performanceMetrics.get(operationId);
    if (!startTime) return 0;
    
    const duration = Date.now() - startTime;
    this.performanceMetrics.delete(operationId);
    return duration;
  }

  /**
   * Convenience methods for different log levels
   */
  public debug(category: LogCategory, message: string, context?: Record<string, unknown>, options?: any): void {
    this.log(LogLevel.DEBUG, category, message, context, options);
  }

  public info(category: LogCategory, message: string, context?: Record<string, unknown>, options?: any): void {
    this.log(LogLevel.INFO, category, message, context, options);
  }

  public notice(category: LogCategory, message: string, context?: Record<string, unknown>, options?: any): void {
    this.log(LogLevel.NOTICE, category, message, context, options);
  }

  public warn(category: LogCategory, message: string, context?: Record<string, unknown>, options?: any): void {
    this.log(LogLevel.WARNING, category, message, context, options);
  }

  public error(category: LogCategory, message: string, context?: Record<string, unknown>, options?: any): void {
    this.log(LogLevel.ERROR, category, message, context, options);
  }

  public critical(category: LogCategory, message: string, context?: Record<string, unknown>, options?: any): void {
    this.log(LogLevel.CRITICAL, category, message, context, options);
  }

  public alert(category: LogCategory, message: string, context?: Record<string, unknown>, options?: any): void {
    this.log(LogLevel.ALERT, category, message, context, options);
  }

  public emergency(category: LogCategory, message: string, context?: Record<string, unknown>, options?: any): void {
    this.log(LogLevel.EMERGENCY, category, message, context, options);
  }

  /**
   * Get summary of current debug status
   */
  public getStatus(): Record<string, unknown> {
    return {
      enabled: this.config.enabled,
      level: LogLevelNames[this.config.level],
      categories: this.config.categories,
      logDirectory: this.config.logDirectory,
      currentLogFile: this.currentLogFile,
      currentFileSize: this.currentFileSize,
      logToFile: this.config.logToFile,
      logToConsole: this.config.logToConsole,
      logToMCP: this.config.logToMCP,
      activeTimers: Array.from(this.performanceMetrics.keys()),
    };
  }

  /**
   * Flush pending logs and close streams
   */
  public close(): void {
    this.log(LogLevel.INFO, LogCategory.CONFIG, 'Debug manager closing');
    
    if (this.logStream) {
      this.logStream.end();
      this.logStream = undefined;
    }

    this.config.enabled = false;
    debugLogger.info('Debug manager closed');
  }
}

// Singleton instance
let globalDebugManager: DebugManager | undefined;

/**
 * Initialize the global debug manager
 */
export function initializeDebugManager(config?: Partial<DebugConfig>): DebugManager {
  if (!globalDebugManager) {
    globalDebugManager = new DebugManager(config);
  } else if (config) {
    globalDebugManager.updateConfig(config);
  }
  return globalDebugManager;
}

/**
 * Get the global debug manager instance
 */
export function getDebugManager(): DebugManager | undefined {
  return globalDebugManager;
}

/**
 * Close the global debug manager
 */
export function closeDebugManager(): void {
  if (globalDebugManager) {
    globalDebugManager.close();
    globalDebugManager = undefined;
  }
}

// Export convenience functions that use the global instance
export const debug = (category: LogCategory, message: string, context?: Record<string, unknown>, options?: any) => 
  globalDebugManager?.debug(category, message, context, options);

export const debugInfo = (category: LogCategory, message: string, context?: Record<string, unknown>, options?: any) => 
  globalDebugManager?.info(category, message, context, options);

export const debugWarn = (category: LogCategory, message: string, context?: Record<string, unknown>, options?: any) => 
  globalDebugManager?.warn(category, message, context, options);

export const debugError = (category: LogCategory, message: string, context?: Record<string, unknown>, options?: any) => 
  globalDebugManager?.error(category, message, context, options);

export const startPerfTimer = (operationId: string) => 
  globalDebugManager?.startTimer(operationId);

export const endPerfTimer = (operationId: string): number => 
  globalDebugManager?.endTimer(operationId) || 0;
