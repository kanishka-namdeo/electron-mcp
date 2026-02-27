export class ElectronMCPError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ElectronMCPError';
  }
}

export class SessionNotFoundError extends ElectronMCPError {
  constructor(sessionId: string) {
    super(
      `Session not found: ${sessionId}`,
      'SESSION_NOT_FOUND',
      { sessionId }
    );
    this.name = 'SessionNotFoundError';
  }
}

export class SessionAlreadyExistsError extends ElectronMCPError {
  constructor(sessionId: string) {
    super(
      `Session already exists: ${sessionId}`,
      'SESSION_ALREADY_EXISTS',
      { sessionId }
    );
    this.name = 'SessionAlreadyExistsError';
  }
}

export class ElectronLaunchError extends ElectronMCPError {
  constructor(message: string, details?: unknown) {
    super(message, 'ELECTRON_LAUNCH_ERROR', details);
    this.name = 'ElectronLaunchError';
  }
}

export class ElementNotFoundError extends ElectronMCPError {
  constructor(selector: string, details?: unknown) {
    super(
      `Element not found: ${selector}`,
      'ELEMENT_NOT_FOUND',
      { selector, ...(details as any) }
    );
    this.name = 'ElementNotFoundError';
  }
}

export class TimeoutError extends ElectronMCPError {
  constructor(operation: string, timeout: number) {
    super(
      `Operation timed out: ${operation}`,
      'TIMEOUT_ERROR',
      { operation, timeout }
    );
    this.name = 'TimeoutError';
  }
}

export class ValidationError extends ElectronMCPError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export function isElectronMCPError(error: unknown): error is ElectronMCPError {
  return error instanceof ElectronMCPError;
}
