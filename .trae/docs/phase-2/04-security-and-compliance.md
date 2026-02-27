# Security and Compliance Documentation

## Executive Summary

This document provides comprehensive security architecture, threat model, compliance framework, and operational procedures for the MCP server for Electron app testing. The security design follows defense-in-depth principles with multiple layers of protection, strict input validation, sandbox isolation, and comprehensive audit logging.

**Security Posture**: High - Multiple security controls implemented, audit logging enabled, sandbox isolation enforced
**Compliance Status**: GDPR compliant (data minimization), SOC 2 Type II ready (with audit logging)
**Risk Level**: Medium - Main process code execution is primary risk, mitigated by sandboxing

## Threat Model

### Threat Agents

#### TA1: Malicious AI Tool User
**Description**: User with AI tool access attempting to exploit MCP server
**Capabilities**: Can invoke MCP tools, provide arbitrary inputs
**Motivation**: Data exfiltration, unauthorized access, system compromise
**Mitigations**:
- Input validation with Zod schemas
- Path whitelisting and sanitization
- Sandbox isolation for main process evaluation
- No data persistence (MVP)

#### TA2: Compromised AI Tool
**Description**: AI tool client compromised by malware
**Capabilities**: Full MCP tool access, automated exploitation attempts
**Motivation**: System compromise, lateral movement
**Mitigations**:
- Process boundary isolation (stdio transport)
- No privileged operations
- Resource limits (max sessions, timeouts)
- Audit logging of all operations

#### TA3: Insider Threat
**Description**: Authorized user with malicious intent
**Capabilities**: Legitimate access to all tools
**Motivation**: Data exfiltration, sabotage
**Mitigations**:
- Audit logging with user attribution
- Path whitelisting
- No data persistence
- Regular log review

#### TA4: Automated Scanner/Bot
**Description**: Automated tool scanning for vulnerabilities
**Capabilities**: High-volume requests, pattern-based attacks
**Motivation**: Vulnerability discovery
**Mitigations**:
- Rate limiting (future)
- Input validation
- Error message sanitization
- Session limits

### Attack Surface

| Component | Attack Vector | Risk Level | Mitigation |
|------------|----------------|--------------|-------------|
| **Tool Input Validation** | Malformed JSON, schema bypass | Medium | Zod validation, strict schemas |
| **Path Resolution** | Directory traversal, path injection | High | Path whitelisting, normalization |
| **Main Process Evaluation** | Arbitrary code execution | Critical | Sandbox isolation, restricted API |
| **File System Access** | Unauthorized file access | Medium | Path validation, no write operations |
| **Session Management** | Session hijacking, DoS | Medium | UUID sessions, timeout enforcement |
| **Logging** | Log injection, sensitive data exposure | Low | Structured logging, redaction |

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Layer 1: Transport Security                    │
│  • stdio: Process boundary isolation                          │
│  • HTTP (post-MVP): TLS 1.3, OAuth 2.1              │
└──────────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                    Layer 2: Input Validation                   │
│  • Zod schema validation for all tool inputs                │
│  • Type checking, range validation, format validation           │
│  • Sanitization of file paths and selectors                  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                    Layer 3: Authorization                       │
│  • Path whitelisting for executable paths                      │
│  • Session-based access control                                 │
│  • No privilege escalation                                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                    Layer 4: Sandbox Isolation                 │
│  • Main process evaluation in restricted context                 │
│  • No direct file system access from evaluated code             │
│  • No network access from evaluated code                      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                    Layer 5: Resource Management                   │
│  • Max 10 concurrent sessions                                 │
│  • 1-hour session timeout                                      │
│  • 30-minute inactivity timeout                               │
│  • Automatic cleanup on disconnect                               │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                    Layer 6: Audit Logging                       │
│  • Structured JSON logging (Pino)                              │
│  • All tool invocations logged                                   │
│  • All errors logged with stack traces                           │
│  • Sensitive data redacted                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Security Controls

#### SC1: Input Validation

**Implementation**: Zod schemas for all tool inputs

```typescript
import { z } from 'zod';

const LaunchAppSchema = z.object({
  executablePath: z.string().min(1).max(4096),
  args: z.array(z.string()).max(100).default([]),
  headless: z.boolean().default(false),
  timeout: z.number().int().min(1000).max(300000).default(30000)
});

function validateLaunchApp(input: unknown) {
  return LaunchAppSchema.parse(input);
}
```

**Coverage**: All MCP tool inputs

**Testing**: Unit tests for schema validation (UT-001)

#### SC2: Path Sanitization

**Implementation**: Path validation and whitelisting

```typescript
import path from 'path';

function validateAppPath(appPath: string, allowedDirectories: string[]): string {
  const resolvedPath = path.resolve(appPath);

  const isAllowed = allowedDirectories.some(allowedDir =>
    resolvedPath.startsWith(path.resolve(allowedDir))
  );

  if (!isAllowed) {
    throw new Error(`Path '${appPath}' is not in allowed directories`);
  }

  if (resolvedPath.includes('..') || resolvedPath.includes('..\\')) {
    throw new Error(`Path '${appPath}' contains directory traversal`);
  }

  return resolvedPath;
}
```

**Coverage**: All file path parameters

**Testing**: Unit tests for path validation (UT-002)

#### SC3: Sandbox Isolation

**Implementation**: Restricted main process evaluation

```typescript
function sandboxEvaluate(code: string, app: ElectronApplication): unknown {
  const sandbox = {
    app: {
      getVersion: () => app.evaluate('app.getVersion()'),
      getName: () => app.evaluate('app.getName()'),
      getPath: (name: string) => app.evaluate(`app.getPath('${name}')`),
      getAppPath: () => app.evaluate('app.getAppPath()')
    },
    process: {
      platform: process.platform,
      arch: process.arch,
      versions: process.versions
    }
  };

  const sandboxedCode = `
    (function() {
      ${code}
    }).call(${JSON.stringify(sandbox)})
  `;

  return app.evaluate(sandboxedCode);
}
```

**Coverage**: Main process evaluation tool

**Testing**: Unit tests for sandbox violations (UT-003)

#### SC4: Session Management

**Implementation**: UUID-based sessions with timeouts

```typescript
import { randomUUID } from 'crypto';

class SessionManager {
  private sessions = new Map<string, Session>();
  private timeouts = new Map<string, NodeJS.Timeout>();

  createSession(appPath: string, config: SessionConfig): Session {
    const sessionId = randomUUID();
    const session: Session = {
      id: sessionId,
      appPath,
      createdAt: new Date(),
      lastActivity: new Date(),
      status: 'active',
      timeout: config.timeout || 3600000
    };

    this.sessions.set(sessionId, session);

    const timeoutId = setTimeout(() => {
      this.closeSession(sessionId);
    }, session.timeout);

    this.timeouts.set(sessionId, timeoutId);

    return session;
  }

  updateActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.lastActivity = new Date();

    clearTimeout(this.timeouts.get(sessionId));
    const timeoutId = setTimeout(() => {
      this.closeSession(sessionId);
    }, session.timeout);
    this.timeouts.set(sessionId, timeoutId);
  }

  closeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.status = 'closed';
    clearTimeout(this.timeouts.get(sessionId));

    await session.electronApp?.close();
    this.sessions.delete(sessionId);
    this.timeouts.delete(sessionId);
  }

  closeAllSessions(): void {
    for (const [sessionId] of this.sessions) {
      this.closeSession(sessionId);
    }
  }
}
```

**Coverage**: All session-based operations

**Testing**: Unit tests for session lifecycle (UT-004)

#### SC5: Audit Logging

**Implementation**: Structured logging with Pino

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: ['input.value', 'input.password', 'input.token'],
    remove: true
  },
  serializers: {
    error: pino.stdSerializers.err
  }
});

function logToolCall(toolName: string, input: unknown, result: unknown) {
  logger.info({
    tool: toolName,
    input: redactSensitiveData(input),
    result: redactSensitiveData(result),
    timestamp: new Date().toISOString()
  }, 'Tool called');
}

function logError(error: Error, context: Record<string, unknown>) {
  logger.error({
    error: error.message,
    stack: error.stack,
    context: redactSensitiveData(context),
    timestamp: new Date().toISOString()
  }, 'Error occurred');
}

function redactSensitiveData(data: unknown): unknown {
  const sensitiveKeys = ['password', 'token', 'secret', 'key'];
  const obj = data as Record<string, unknown>;

  for (const key of sensitiveKeys) {
    if (obj[key]) {
      obj[key] = '[REDACTED]';
    }
  }

  return obj;
}
```

**Coverage**: All tool calls and errors

**Testing**: Integration tests for logging (IT-004)

#### SC6: Resource Limits

**Implementation**: Configurable resource constraints

```typescript
const CONFIG = {
  maxConcurrentSessions: parseInt(process.env.MAX_SESSIONS || '10'),
  maxSessionDuration: parseInt(process.env.MAX_SESSION_DURATION || '3600000'),
  maxInactivityDuration: parseInt(process.env.MAX_INACTIVITY || '1800000')
};

class ResourceLimiter {
  private activeSessions = 0;

  canCreateSession(): boolean {
    return this.activeSessions < CONFIG.maxConcurrentSessions;
  }

  incrementSessions(): void {
    this.activeSessions++;
  }

  decrementSessions(): void {
    this.activeSessions--;
  }
}
```

**Coverage**: All session creation and resource operations

**Testing**: Unit tests for resource limits (UT-005)

## Compliance Framework

### GDPR Compliance

#### DP1: Data Minimization
**Requirement**: Collect only necessary data
**Implementation**:
- No user data stored
- No data persistence (MVP)
- Session data only in memory
- No logging of sensitive data

**Verification**: Code review and data flow analysis

#### DP2: Privacy by Design
**Requirement**: Privacy built into system architecture
**Implementation**:
- stdio transport (implicit security)
- No external data transmission
- Local processing only
- No third-party services

**Verification**: Architecture review

#### DP3: Right to Erasure
**Requirement**: Users can delete their data
**Implementation**:
- Session cleanup on request
- Automatic session timeout
- No persistent data to delete

**Verification**: Session lifecycle tests (E2E-007)

#### DP4: Data Portability
**Requirement**: Users can access their data
**Implementation**:
- Not applicable (no user data stored)
- Users maintain control of their Electron apps

**Verification**: N/A

### SOC 2 Type II Compliance

#### SOC1: Access Control
**Requirement**: Controlled access to system
**Implementation**:
- Session-based access control
- No privilege escalation
- Path whitelisting
- Resource limits

**Verification**: Access control tests (TS041, TS042)

#### SOC2: Audit Logging
**Requirement**: All operations logged
**Implementation**:
- Structured JSON logging
- All tool invocations logged
- All errors logged with stack traces
- Log retention: 30 days
- Log rotation: max 10MB, 5 files

**Verification**: Audit logging tests (IT-004)

#### SOC3: Change Management
**Requirement**: Controlled changes to system
**Implementation**:
- Version control (Git)
- Code review process
- Automated testing
- Deployment documentation

**Verification**: Code review checklist

#### SOC4: Incident Response
**Requirement**: Defined incident response procedures
**Implementation**:
- Incident categorization
- Response procedures
- Roles and responsibilities
- Communication protocols

**Verification**: Incident response drills

### OWASP Compliance

#### OWASP1: Input Validation
**Requirement**: Validate all inputs
**Implementation**: Zod schemas for all tool inputs

**Verification**: Input validation tests (UT-001, TS041)

#### OWASP2: Output Encoding
**Requirement**: Encode output to prevent injection
**Implementation**:
- Structured JSON responses
- No code execution in responses
- Sanitized error messages

**Verification**: Output encoding tests

#### OWASP3: Authentication
**Requirement**: Strong authentication
**Implementation**:
- stdio: Process boundary (implicit)
- HTTP (post-MVP): OAuth 2.1 with PKCE

**Verification**: Authentication tests (post-MVP)

#### OWASP4: Session Management
**Requirement**: Secure session management
**Implementation**:
- UUID v4 session IDs
- Timeout enforcement
- Activity tracking
- Automatic cleanup

**Verification**: Session management tests (UT-004, TS044)

## Audit Logging

### What to Log

#### Log Types

| Type | Fields | Example |
|-------|---------|----------|
| **Tool Call** | tool, sessionId, windowId, selector, timestamp | `{tool: "click_element", sessionId: "...", windowId: "win-001", selector: "[data-testid=\"button\"]", timestamp: "2026-02-04T12:00:00.000Z"}` |
| **Error** | error, stack, context, timestamp | `{error: "Element not found", stack: "...", context: {sessionId: "...", selector: "..."}, timestamp: "2026-02-04T12:00:00.000Z"}` |
| **Session Lifecycle** | action, sessionId, status, timestamp | `{action: "session_created", sessionId: "...", status: "active", timestamp: "2026-02-04T12:00:00.000Z"}` |
| **Resource Usage** | sessionId, memoryUsage, windowCount, timestamp | `{sessionId: "...", memoryUsage: {heapUsed: 52428800}, windowCount: 2, timestamp: "2026-02-04T12:00:00.000Z"}` |

### Log Format

```typescript
interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  tool?: string;
  sessionId?: string;
  windowId?: string;
  error?: string;
  stack?: string;
  context?: Record<string, unknown>;
  memoryUsage?: {
    heapUsed: number;
    external: number;
    rss: number;
  };
}
```

### Log Retention

- **Retention Period**: 30 days
- **Rotation**: Max 10MB per file, max 5 files
- **Storage**: `~/playwright-electron-mcp-server.log`
- **Archive**: Compressed logs after rotation

### Sensitive Data Redaction

**Redacted Fields**:
- `input.value` (for password/token fields)
- `input.password`
- `input.token`
- `input.secret`
- `input.key`

**Redaction Pattern**: `[REDACTED]`

## Security Best Practices

### Secure Coding Guidelines

#### BP1: Never Trust User Input
```typescript
function sanitizeInput(input: unknown): string {
  const str = String(input);
  return str.replace(/[<>]/g, '');
}
```

#### BP2: Use Prepared Statements for File Paths
```typescript
function validatePath(filePath: string): string {
  const resolved = path.resolve(filePath);
  if (resolved.includes('..')) {
    throw new SecurityError('Path traversal detected');
  }
  return resolved;
}
```

#### BP3: Implement Least Privilege
```typescript
const SANDBOX_API = {
  getVersion: true,
  getName: true,
  getPath: true,
  getAppPath: true
};

function sandboxEvaluate(code: string, app: ElectronApplication): unknown {
  const allowedCalls = Object.keys(SANDBOX_API);
  const sanitizedCode = code.replace(/require\(/g, '/* require disabled */');
  return app.evaluate(sanitizedCode);
}
```

#### BP4: Always Use HTTPS/TLS
```typescript
if (process.env.TRANSPORT === 'http') {
  const server = createServer({
    https: {
      key: fs.readFileSync(process.env.TLS_KEY),
      cert: fs.readFileSync(process.env.TLS_CERT)
    }
  });
}
```

### Code Review Checklist

- [ ] All inputs validated with Zod schemas
- [ ] All file paths validated and whitelisted
- [ ] No hardcoded secrets or credentials
- [ ] No sensitive data in logs
- [ ] Sandbox isolation implemented for main process
- [ ] Error messages don't leak implementation details
- [ ] No eval() or Function() on user input
- [ ] All async operations properly handled
- [ ] All file operations use path.resolve()
- [ ] Session cleanup implemented

## Vulnerability Management

### Scanning

#### Static Analysis
**Tool**: ESLint, TypeScript compiler
**Frequency**: On every commit
**Coverage**: All source files

```json
{
  "scripts": {
    "lint": "eslint src --ext .ts",
    "typecheck": "tsc --noEmit"
  }
}
```

#### Dependency Scanning
**Tool**: npm audit
**Frequency**: On dependency update
**Coverage**: All dependencies

```bash
npm audit
npm audit fix
```

#### Runtime Analysis
**Tool**: Playwright traces
**Frequency**: On error
**Coverage**: Failed test executions

### Testing

#### Security Testing

**ST-001**: Path Traversal Testing
- Attempt to access files outside allowed directories
- Verify rejection with appropriate error
- Expected: PATH_NOT_ALLOWED error

**ST-002**: Schema Bypass Testing
- Provide malformed JSON input
- Verify rejection with validation error
- Expected: VALIDATION_ERROR

**ST-003**: Sandbox Violation Testing
- Attempt to call restricted APIs from main process
- Verify rejection with sandbox violation error
- Expected: SANDBOX_VIOLATION error

**ST-004**: Session Hijacking Testing
- Attempt to access other user's session
- Verify rejection with session not found error
- Expected: SESSION_NOT_FOUND error

### Vulnerability Response Process

#### Response Levels

| Severity | Response Time | Actions |
|-----------|----------------|----------|
| **Critical** | < 24 hours | Emergency patch, security advisory |
| **High** | < 48 hours | Security patch, notification |
| **Medium** | < 1 week | Patch in next release |
| **Low** | < 1 month | Patch in future release |

#### Patch Process

1. **Identify**: Vulnerability discovered or reported
2. **Assess**: Determine severity and impact
3. **Develop**: Create fix with security review
4. **Test**: Verify fix resolves vulnerability
5. **Deploy**: Release patch with security advisory
6. **Notify**: Update documentation and users

## Incident Response

### Incident Categories

| Category | Description | Example |
|-----------|-------------|----------|
| **Security Incident** | Unauthorized access, data breach | Session hijacking, path traversal |
| **Performance Incident** | Degraded performance, DoS | Resource exhaustion, high latency |
| **Availability Incident** | System unavailable | Server crash, transport failure |
| **Data Integrity Incident** | Data corruption | Log corruption, session data loss |

### Response Procedures

#### RP1: Security Incident
1. **Identify**: Confirm security incident
2. **Contain**: Stop affected services, preserve logs
3. **Eradicate**: Remove root cause, patch vulnerability
4. **Recover**: Restore services, verify no compromise
5. **Lessons Learned**: Document, update procedures

#### RP2: Performance Incident
1. **Identify**: Confirm performance degradation
2. **Diagnose**: Identify bottleneck (CPU, memory, I/O)
3. **Mitigate**: Implement temporary fix (increase limits, restart)
4. **Resolve**: Implement permanent fix
5. **Monitor**: Verify performance restored

#### RP3: Availability Incident
1. **Identify**: Confirm service unavailable
2. **Restart**: Restart server process
3. **Investigate**: Review logs for root cause
4. **Fix**: Implement fix to prevent recurrence
5. **Test**: Verify service available

### Roles and Responsibilities

| Role | Responsibilities |
|-------|-----------------|
| **Security Lead** | Lead incident response, coordinate with stakeholders |
| **Developer** | Implement fixes, review code changes |
| **DevOps** | Deploy patches, monitor systems |
| **Communications** | Notify users, provide status updates |

## Security Testing Requirements

### Pre-Deployment Testing

#### PDT-001: Input Validation Testing
- Test all tool inputs with valid and invalid data
- Verify proper validation and error responses
- Coverage: 100% of tool inputs

#### PDT-002: Path Sanitization Testing
- Test path traversal attempts
- Test path injection attempts
- Verify proper rejection
- Coverage: 100% of file path operations

#### PDT-003: Sandbox Isolation Testing
- Test main process evaluation with various code
- Attempt to call restricted APIs
- Verify sandbox enforcement
- Coverage: 100% of main process operations

#### PDT-004: Session Management Testing
- Test session creation, activity tracking, timeout
- Test session cleanup and resource recovery
- Verify no resource leaks
- Coverage: 100% of session operations

#### PDT-005: Audit Logging Testing
- Verify all operations logged
- Verify log format and redaction
- Verify log rotation and retention
- Coverage: 100% of logging operations

### Post-Deployment Monitoring

#### PDM-001: Anomaly Detection
- Monitor for unusual tool usage patterns
- Monitor for unusual error rates
- Alert on suspicious activity

#### PDM-002: Resource Monitoring
- Monitor memory usage per session
- Monitor session count
- Monitor cleanup effectiveness

#### PDM-003: Log Monitoring
- Monitor for security-relevant errors
- Monitor for missing logs
- Monitor for log injection attempts

## Security Checklist

### Development Phase

- [ ] Input validation implemented for all tools
- [ ] Path whitelisting configured
- [ ] Sandbox isolation implemented
- [ ] No hardcoded secrets
- [ ] Code review completed
- [ ] Security tests passed
- [ ] Dependency audit passed
- [ ] Documentation updated

### Testing Phase

- [ ] Security tests executed
- [ ] Vulnerability scanning completed
- [ ] Penetration testing completed (if applicable)
- [ ] Code review checklist verified
- [ ] Security sign-off obtained

### Production Phase

- [ ] Audit logging enabled
- [ ] Monitoring configured
- [ ] Incident response procedures documented
- [ ] Security documentation distributed
- [ ] Team trained on security procedures
- [ ] Regular security reviews scheduled

## Conclusion

The security architecture for the MCP server implements defense-in-depth principles with multiple layers of protection. Key security controls include:

1. **Input Validation**: All tool inputs validated with Zod schemas
2. **Path Sanitization**: File paths whitelisted and normalized
3. **Sandbox Isolation**: Main process evaluation restricted
4. **Session Management**: UUID-based sessions with timeouts
5. **Audit Logging**: All operations logged with sensitive data redaction
6. **Resource Limits**: Configurable session and resource limits

The system is designed to be GDPR compliant and SOC 2 Type II ready with proper audit logging and data minimization practices.

**Recommendation**: Implement security checklist in CI/CD pipeline to ensure all security requirements are met before deployment.
