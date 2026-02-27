export enum ErrorCategory {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SESSION_ERROR = 'SESSION_ERROR',
  PROTOCOL_ERROR = 'PROTOCOL_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RESOURCE_ERROR = 'RESOURCE_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
}

export enum ErrorCode {
  CONNECTION_REFUSED = 'ECONNREFUSED',
  CONNECTION_TIMEOUT = 'ETIMEDOUT',
  HOST_NOT_FOUND = 'ENOTFOUND',
  HOST_UNREACHABLE = 'EHOSTUNREACH',
  PIPE_BROKEN = 'EPIPE',
  CONNECTION_RESET = 'ECONNRESET',
}

export interface ErrorContext {
  category: ErrorCategory;
  code: string;
  message: string;
  details?: any;
  retryAfter?: number;
  suggestion?: string;
}

export class MCPError extends Error {
  public readonly category: ErrorCategory;
  public readonly code: string;
  public readonly details?: any;
  public readonly retryAfter?: number;
  public readonly suggestion?: string;

  constructor(context: ErrorContext) {
    super(context.message);
    this.name = 'MCPError';
    this.category = context.category;
    this.code = context.code;
    this.details = context.details;
    this.retryAfter = context.retryAfter;
    this.suggestion = context.suggestion;
  }

  toJSON() {
    return {
      name: this.name,
      category: this.category,
      code: this.code,
      message: this.message,
      details: this.details,
      retryAfter: this.retryAfter,
      suggestion: this.suggestion,
    };
  }
}

export function createMCPError(
  category: ErrorCategory,
  code: string,
  message: string,
  options?: Partial<ErrorContext>
): MCPError {
  return new MCPError({
    category,
    code,
    message,
    ...options,
  });
}

export function classifyError(error: unknown): MCPError | null {
  if (error instanceof MCPError) {
    return error;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('econnrefused') || message.includes('connection refused')) {
      return createMCPError(
        ErrorCategory.CONNECTION_ERROR,
        ErrorCode.CONNECTION_REFUSED,
        'Connection to CDP server refused',
        {
          details: { originalError: error.message },
          retryAfter: 2000,
          suggestion: 'Ensure Electron app is running with --remote-debugging-port flag',
        }
      );
    }

    if (message.includes('etimedout') || message.includes('timeout')) {
      return createMCPError(
        ErrorCategory.TIMEOUT_ERROR,
        ErrorCode.CONNECTION_TIMEOUT,
        'Connection to CDP server timed out',
        {
          details: { originalError: error.message },
          retryAfter: 3000,
          suggestion: 'Increase timeout or check if Electron app is responsive',
        }
      );
    }

    if (message.includes('enotfound') || message.includes('host not found')) {
      return createMCPError(
        ErrorCategory.CONNECTION_ERROR,
        ErrorCode.HOST_NOT_FOUND,
        'CDP host not found',
        {
          details: { originalError: error.message },
          retryAfter: 1000,
          suggestion: 'Check host and port configuration',
        }
      );
    }

    if (message.includes('target') || message.includes('session')) {
      return createMCPError(
        ErrorCategory.PROTOCOL_ERROR,
        'PROTOCOL_ERROR',
        'CDP protocol error occurred',
        {
          details: { originalError: error.message },
          suggestion: 'CDP session may have been closed or browser restarted',
        }
      );
    }
  }

  return null;
}
