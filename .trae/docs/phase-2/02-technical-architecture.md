# Technical Architecture Document

## Executive Summary

This document defines the comprehensive technical architecture for the MCP (Model Context Protocol) server that enables AI coding tools (Cursor, Claude Code) to test Electron applications using Playwright. The architecture implements a layered design with clear component boundaries, session-based lifecycle management, comprehensive error handling, and security-first principles. The system uses TypeScript 5.7.x, the official MCP SDK v1.x, Playwright 1.48.x, and Zod 4.x for validation, all configured for production deployment with stdio transport for AI tool integration.

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Technology Stack](#2-technology-stack)
3. [Component Design](#3-component-design)
4. [Data Design](#4-data-design)
5. [API Design](#5-api-design)
6. [Security Architecture](#6-security-architecture)
7. [Performance and Scalability](#7-performance-and-scalability)
8. [Operational Considerations](#8-operational-considerations)
9. [Implementation Guidance](#9-implementation-guidance)

---

## 1. System Architecture

### 1.1 High-Level Architecture

The MCP server for Electron testing follows a layered architecture pattern with clear separation of concerns. The system processes requests from AI tools through multiple layers, each with specific responsibilities:

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI Tool (Cursor/Claude Code)                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ stdio (MCP Protocol v1.x)
                            │ JSON messages
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      MCP Protocol Layer                          │
│  - Server initialization                                         │
│  - Tool registration                                             │
│  - Request/Response handling                                    │
│  - Stdio transport                                               │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Routes requests
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      Tool Router                                 │
│  - Maps tool name → handler                                     │
│  - Validates tool permissions                                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Validates inputs
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    Validation Layer (Zod)                        │
│  - Schema validation                                            │
│  - Type checking                                                 │
│  - Custom validators                                             │
└──────┬────────────────────┬──────────────┬──────────────────────┘
       │                    │              │
       │                    │              │
┌──────▼──────┐    ┌─────────▼─────────┐  ┌─▼─────────────────────┐
│   Session   │    │  Playwright       │  │  Error Handler         │
│   Manager   │◄───│  Adapter          │  │  (Error → Structured)  │
│             │    │                   │  │                        │
│  - Create   │    │  - Launch app     │  │  - Catch errors         │
│  - Track    │    │  - Connect CDP    │  │  - Format responses     │
│  - Cleanup  │    │  - Close app      │  │  - Retry logic          │
│  - Timeout  │    │  - Status query   │  │  - Log errors          │
└──────┬──────┘    └─────────┬─────────┘  └───────────────────────┘
       │                    │
       │                    │
┌──────▼────────────────────▼──────────────────────────────────────┐
│                    Window Manager                                 │
│  - Get first window                                               │
│  - List all windows                                               │
│  - Switch window                                                  │
│  - Track active window                                            │
└──────┬────────────────────┬───────────────────────────────────────┘
       │                    │
┌──────▼────────────────────▼──────────────────────────────────────┐
│                 Element Interaction Handler                        │
│  - Click elements                                                 │
│  - Fill form fields                                               │
│  - Select dropdown options                                        │
│  - Hover elements                                                 │
└──────┬──────────────────────────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────────────┐
│                 Main Process Access                              │
│  - Evaluate JavaScript                                           │
│  - Get app state                                                 │
│  - Send IPC messages (post-MVP)                                  │
└──────┬──────────────────────────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────────────┐
│                 Visual Testing Handler                           │
│  - Take screenshots                                               │
│  - Get HTML content                                               │
│  - Get text content                                               │
│  - Get accessibility tree (post-MVP)                             │
└──────┬──────────────────────────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────────────┐
│                   Electron Application                            │
│  - Running Electron app                                          │
│  - Main process                                                   │
│  - Renderer processes (windows)                                  │
└───────────────────────────────────────────────────────────────────┘

Supporting Services:
┌──────────────┐  ┌──────────────┐  ┌─────────────────┐
│   Logger     │  │    Metrics   │  │   Resource      │
│   (Pino)     │  │   (Future)   │  │   Manager       │
└──────────────┘  └──────────────┘  └─────────────────┘
```

### 1.2 Component Breakdown

#### MCP Protocol Layer
- **Responsibility**: Initialize MCP server, register tools, handle protocol communication
- **Inputs**: MCP protocol messages from AI tools via stdio
- **Outputs**: MCP protocol responses to AI tools
- **Dependencies**: @modelcontextprotocol/sdk
- **Key Functions**: Server initialization, tool registration, request handling, stdio transport management

#### Tool Router
- **Responsibility**: Route tool calls to appropriate handlers
- **Inputs**: Tool name and parameters from MCP layer
- **Outputs**: Handler function invocation results
- **Dependencies**: Tool Registry
- **Key Functions**: Route tool calls, validate permissions, invoke handlers

#### Validation Layer
- **Responsibility**: Validate all tool inputs using Zod schemas
- **Inputs**: Raw tool parameters from AI tools
- **Outputs**: Validated parameters or validation errors
- **Dependencies**: Zod
- **Key Functions**: Schema validation, type checking, custom validation

#### Session Manager
- **Responsibility**: Manage Electron app session lifecycle
- **Inputs**: Session creation/closure requests, activity updates
- **Outputs**: Session IDs, session status, cleanup events
- **Dependencies**: Playwright Adapter, Logger
- **Key Functions**: Create sessions, track activity, enforce timeouts, cleanup sessions

#### Playwright Adapter
- **Responsibility**: Wrap Playwright Electron API
- **Inputs**: App paths, configuration, mode selection
- **Outputs**: Electron app instances, app status
- **Dependencies**: Playwright
- **Key Functions**: Launch apps, connect via CDP, close apps, query status

#### Window Manager
- **Responsibility**: Manage Electron app windows
- **Inputs**: Session IDs, window requests
- **Outputs**: Window information, window references
- **Dependencies**: Session Manager, Playwright Adapter
- **Key Functions**: Get first window, list windows, switch windows, track active window

#### Element Interaction Handler
- **Responsibility**: Handle UI element interactions
- **Inputs**: Session IDs, selectors, interaction parameters
- **Outputs**: Interaction results, errors
- **Dependencies**: Window Manager, Playwright Adapter
- **Key Functions**: Click elements, fill forms, select options, hover elements

#### Main Process Access
- **Responsibility**: Execute code in Electron main process
- **Inputs**: Session IDs, JavaScript code
- **Outputs**: Evaluation results, app state
- **Dependencies**: Playwright Adapter
- **Key Functions**: Evaluate JavaScript, get app state, send IPC messages (post-MVP)

#### Visual Testing Handler
- **Responsibility**: Capture visual content and page data
- **Inputs**: Session IDs, screenshot/content parameters
- **Outputs**: Base64 images, HTML/text content
- **Dependencies**: Window Manager, Playwright Adapter
- **Key Functions**: Take screenshots, get HTML, get text, get accessibility tree (post-MVP)

#### Error Handler
- **Responsibility**: Centralized error handling and formatting
- **Inputs**: Errors from any component
- **Outputs**: Structured error responses
- **Dependencies**: Logger
- **Key Functions**: Catch errors, format responses, implement retry logic, log errors

#### Resource Manager
- **Responsibility**: Monitor and manage system resources
- **Inputs**: Session lifecycle events, resource metrics
- **Outputs**: Cleanup events, resource alerts
- **Dependencies**: Session Manager, Logger
- **Key Functions**: Enforce resource limits, monitor sessions, trigger cleanup

#### Logger
- **Responsibility**: Structured logging for all system events
- **Inputs**: Log messages from all components
- **Outputs**: Log files, console output
- **Dependencies**: Pino
- **Key Functions**: Log events, rotate logs, format logs

### 1.3 Service Boundaries

| Service | Boundary | Internal | External |
|---------|----------|----------|----------|
| MCP Protocol Layer | Protocol compliance | Tool routing, serialization | AI tools via stdio |
| Session Manager | Session lifecycle | Session storage, timeouts | Playwright Adapter |
| Playwright Adapter | Electron API | App lifecycle management | Electron apps |
| Window Manager | Window operations | Window tracking, active state | Playwright Page API |
| Element Interaction | UI interactions | Element selection, actions | Playwright Page API |
| Main Process Access | Main process execution | Code evaluation sandbox | Electron main process |
| Visual Testing | Content capture | Screenshot generation | Playwright Page API |
| Validation Layer | Input validation | Schema definitions | None (internal) |
| Error Handler | Error management | Error formatting, retry | None (internal) |

### 1.4 Communication Patterns

#### Synchronous Communication
- **Tool Invocation**: AI tool → MCP server → Playwright → Response
- **Validation**: Input → Validation Layer → Validated/Invalid
- **Status Queries**: Request → Session Manager → Response

#### Asynchronous Communication
- **App Launch**: Request → Playwright Adapter (async) → Session created
- **Window Opening**: App event → Window Manager (async) → Window tracked
- **Cleanup**: Session timeout → Resource Manager → Session closed (async)

#### Event-Driven Communication
- **Session Events**: Created, Activity, Timeout, Closed
- **Window Events**: Opened, Closed, Focused
- **Error Events**: Caught, Logged, Retried

---

## 2. Technology Stack

### 2.1 Core Technologies

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| TypeScript | 5.7.x | Language | Full type safety, matches MCP SDK and Playwright APIs, excellent tooling |
| @modelcontextprotocol/sdk | 1.x | MCP Protocol | Official SDK, full protocol support, TypeScript support, active maintenance |
| Playwright | 1.48.x | Electron Automation | Native Electron support, cross-platform, modern API, headless mode |
| Zod | 4.x | Validation | Required peer dependency for MCP SDK, runtime validation, excellent TypeScript integration |
| Pino | Latest | Logging | Fast structured logging, JSON format, log rotation support |
| Vitest | 2.1.x | Testing | Vite-native, fast execution, Jest-compatible API, built-in code coverage |
| TSX | 4.19.x | TypeScript Execution | Run TypeScript files directly, no compilation step, source map support |

### 2.2 Transport Technologies

| Transport | Status | Purpose | Rationale |
|-----------|--------|---------|-----------|
| Stdio | Primary (MVP) | AI tool integration | Native support from Cursor/Claude Code, simple configuration, secure via process boundaries |
| HTTP Streamable | Secondary (Post-MVP) | Remote scenarios | Multiple client connections, VS Code Copilot compatibility, remote deployment support |

### 2.3 Technology Alternatives Considered

#### MCP Framework Alternatives

**mcp-framework**
- **Considered**: For rapid prototyping with automatic tool discovery
- **Trade-off**: Less control over implementation, framework lock-in
- **Decision**: Not selected - Official SDK provides better production stability

**FastMCP**
- **Considered**: For session handling and custom HTTP routes
- **Trade-off**: Smaller community, less documentation
- **Decision**: Not selected - Official SDK provides standard implementation

#### Testing Framework Alternatives

**Jest**
- **Considered**: Popular testing framework
- **Trade-off**: Slower than Vitest, requires more configuration
- **Decision**: Not selected - Vitest provides better performance for TypeScript

#### Logging Alternatives

**Winston**
- **Considered**: Popular logging library
- **Trade-off**: Slower than Pino, less JSON-native
- **Decision**: Not selected - Pino provides better performance and structured logging

### 2.4 Technology Justification

All selected technologies:
- Are latest stable versions with no critical security vulnerabilities
- Are well-maintained with active communities
- Provide TypeScript-first development experience
- Are proven in production environments
- Are compatible with each other (no version conflicts)

---

## 3. Component Design

### 3.1 Session Manager

#### Interface
```typescript
interface ISessionManager {
  createSession(appPath: string, config: SessionConfig): Promise<Session>;
  getSession(sessionId: string): Session | undefined;
  updateActivity(sessionId: string): void;
  closeSession(sessionId: string): Promise<void>;
  closeAllSessions(): Promise<void>;
  getAllSessions(): Session[];
  getSessionStatus(sessionId: string): SessionStatus;
}
```

#### Data Structure
```typescript
interface Session {
  id: string; // UUID v4
  electronApp: ElectronApplication;
  mode: 'launch' | 'cdp';
  appPath: string;
  windows: Map<string, Page>; // windowId -> Page
  activeWindowId: string | null;
  createdAt: Date;
  lastActivityAt: Date;
  status: 'active' | 'inactive' | 'closing';
  config: SessionConfig;
}

interface SessionConfig {
  headless?: boolean;
  timeout?: number; // ms
  launchTimeout?: number; // ms
  cdpPort?: number; // for CDP mode
}

type SessionStatus = {
  sessionId: string;
  mode: string;
  appPath: string;
  windowCount: number;
  createdAt: Date;
  lastActivityAt: Date;
  status: string;
};
```

#### Responsibilities
1. Create unique session IDs using UUID v4
2. Store active sessions in memory (Map<sessionId, Session>)
3. Track session state (active, inactive, closing)
4. Enforce session timeout (configurable, default 1 hour)
5. Clean up inactive sessions (30 minutes inactivity)
6. Handle session queries
7. Update session activity on each tool call

#### Session Lifecycle
```
[AI Tool Request]
       │
       ▼
[Create Session]
       │
       ├─► Generate UUID v4 session ID
       ├─► Call Playwright Adapter to launch app
       ├─► Create Session object
       ├─► Store in memory Map
       ├─► Start timeout timer
       └─► Return session ID
       │
       ▼
[Active Session]
       │
       ├─► Update lastActivityAt on each tool call
       ├─► Maintain session state
       └─► Track windows and active window
       │
       ▼
[Session Timeout/Close]
       │
       ├─► Set status to 'closing'
       ├─► Close all windows
       ├─► Close Electron app
       ├─► Remove from memory Map
       ├─► Cancel timeout timer
       └─► Log cleanup event
```

### 3.2 Playwright Adapter

#### Interface
```typescript
interface IPlaywrightAdapter {
  launchApp(appPath: string, config: SessionConfig): Promise<ElectronApplication>;
  connectCDP(cdpUrl: string, config: SessionConfig): Promise<ElectronApplication>;
  closeApp(electronApp: ElectronApplication): Promise<void>;
  getAppStatus(electronApp: ElectronApplication): Promise<AppStatus>;
  getWindows(electronApp: ElectronApplication): Promise<Page[]>;
  getFirstWindow(electronApp: ElectronApplication, timeout?: number): Promise<Page>;
  evaluateMainProcess(electronApp: ElectronApplication, code: string): Promise<unknown>;
  getAppState(electronApp: ElectronApplication): Promise<AppState>;
}
```

#### Data Structure
```typescript
interface AppStatus {
  isRunning: boolean;
  windowCount: number;
  pid?: number;
}

interface AppState {
  path: string;
  version: string;
  name: string;
  windowCount: number;
  pids: number[];
  memory: number; // bytes
}
```

#### Responsibilities
1. Wrap Playwright `_electron.launch()` API
2. Support CDP mode connection to running apps
3. Support launch mode for fresh instances
4. Manage Electron app lifecycle
5. Provide unified API for both modes
6. Handle platform-specific behavior
7. Get app state and status

#### Mode Selection

**CDP Mode**
- Connect to running Electron app via Chrome DevTools Protocol
- Preserves app state
- Supports hot reload
- Faster iteration in development
- Requires app running with debug port
- Limited main process access
- Not suitable for CI/CD

**Launch Mode**
- Launch fresh Electron instance via Playwright
- Clean state for each test
- Full main process access
- Headless support for CI/CD
- Slower startup
- No state persistence
- Requires rebuilding app

### 3.3 Window Manager

#### Interface
```typescript
interface IWindowManager {
  getFirstWindow(sessionId: string, timeout?: number): Promise<WindowInfo>;
  listWindows(sessionId: string): Promise<WindowInfo[]>;
  switchWindow(sessionId: string, windowId: string): Promise<void>;
  getActiveWindow(sessionId: string): Promise<Page | null>;
  trackWindow(sessionId: string, page: Page): string;
  removeWindow(sessionId: string, windowId: string): void;
  setActiveWindow(sessionId: string, windowId: string): void;
}
```

#### Data Structure
```typescript
interface WindowInfo {
  id: string;
  url: string;
  title: string;
}
```

#### Responsibilities
1. Track all windows per session
2. Maintain active window reference
3. Get first window with timeout
4. List all windows
5. Switch between windows
6. Handle window open/close events

### 3.4 Element Interaction Handler

#### Interface
```typescript
interface IElementInteraction {
  click(sessionId: string, selector: string, options?: ClickOptions): Promise<void>;
  fill(sessionId: string, selector: string, value: string, timeout?: number): Promise<void>;
  select(sessionId: string, selector: string, value: string, timeout?: number): Promise<string>;
  hover(sessionId: string, selector: string, timeout?: number): Promise<void>;
  waitForElement(sessionId: string, selector: string, state: 'visible' | 'attached', timeout?: number): Promise<void>;
}
```

#### Data Structure
```typescript
interface ClickOptions {
  double?: boolean;
  right?: boolean;
  timeout?: number;
  force?: boolean;
}
```

#### Selector Strategy Priority
1. **data-testid** (highest priority, most stable)
2. **role-based selectors** (e.g., `getByRole('button', { name: 'Submit' })`)
3. **CSS selectors** (last resort, most fragile)

### 3.5 Main Process Access

#### Interface
```typescript
interface IMainProcessAccess {
  evaluate(sessionId: string, code: string): Promise<unknown>;
  getAppState(sessionId: string): Promise<AppState>;
  sendIPC(sessionId: string, channel: string, data: unknown): Promise<unknown>;
}
```

#### Sandbox Isolation
- Restrict JavaScript evaluation scope
- Don't expose full Node.js APIs
- Limit access to system resources
- No access to file system, network, process APIs
- Provide controlled access to Electron APIs only

### 3.6 Visual Testing Handler

#### Interface
```typescript
interface IVisualTesting {
  screenshot(sessionId: string, options?: ScreenshotOptions): Promise<ScreenshotResult>;
  getHTML(sessionId: string, windowId?: string): Promise<PageContent>;
  getText(sessionId: string, windowId?: string): Promise<PageContent>;
  getAccessibilityTree(sessionId: string): Promise<AccessibilityTree>;
}
```

#### Data Structure
```typescript
interface ScreenshotOptions {
  type?: 'viewport' | 'full-page' | 'element';
  windowId?: string;
  selector?: string; // for element screenshots
  format?: 'png' | 'jpeg';
  quality?: number; // 0-100 for JPEG
}

interface ScreenshotResult {
  data: string; // base64-encoded
  width: number;
  height: number;
  format: string;
}

interface PageContent {
  content: string;
  url: string;
  title: string;
}
```

### 3.7 Error Handler

#### Interface
```typescript
interface IErrorHandler {
  handleError(error: unknown, context: ErrorContext): ErrorResponse;
  isRetryable(error: unknown): boolean;
  shouldRetry(error: unknown, attempt: number): boolean;
}

interface ErrorContext {
  sessionId?: string;
  tool?: string;
  parameters?: Record<string, unknown>;
}

interface ErrorResponse {
  success: false;
  error: ErrorInfo;
  metadata: ResponseMetadata;
}

interface ErrorInfo {
  code: string;
  message: string;
  context?: Record<string, unknown>;
  retryable?: boolean;
  suggestions?: string[];
}

interface ResponseMetadata {
  sessionId: string;
  timestamp: Date;
  executionTime: number; // ms
}
```

#### Error Categories

1. **Input Validation Errors** (not retryable)
   - Invalid selector
   - Missing required field
   - Type mismatch

2. **Session Errors** (not retryable)
   - Session not found
   - Session already closed
   - Session timeout
   - Session limit exceeded

3. **Playwright Errors** (may be retryable)
   - Element not found
   - Timeout waiting for element
   - Click blocked

4. **Electron App Errors** (not retryable)
   - App failed to launch
   - App crashed
   - Invalid app path

5. **System Errors** (may be retryable)
   - Out of memory
   - File system errors

#### Retry Strategy
- Retry only for transient failures (network, timeout)
- Exponential backoff: 1s, 2s, 4s
- Max 3 retries
- Don't retry validation, session, or path errors

---

## 4. Data Design

### 4.1 Data Models

#### Session Model
```typescript
interface Session {
  id: string; // UUID v4
  electronApp: ElectronApplication;
  mode: 'launch' | 'cdp';
  appPath: string;
  windows: Map<string, Page>;
  activeWindowId: string | null;
  createdAt: Date;
  lastActivityAt: Date;
  status: 'active' | 'inactive' | 'closing';
  config: SessionConfig;
  timeoutTimer?: NodeJS.Timeout;
}
```

#### Window Model
```typescript
interface Window {
  id: string;
  page: Page;
  url: string;
  title: string;
  sessionId: string;
  createdAt: Date;
}
```

#### Tool Execution Model
```typescript
interface ToolExecution {
  toolName: string;
  sessionId: string;
  parameters: Record<string, unknown>;
  startTime: Date;
  endTime?: Date;
  success?: boolean;
  error?: ErrorInfo;
  result?: unknown;
}
```

### 4.2 Storage Strategy

#### In-Memory Storage
- **Session Storage**: Map<sessionId, Session>
- **Window Storage**: Map<sessionId, Map<windowId, Window>>
- **Tool Execution Log**: Array<ToolExecution> (circular buffer, last 1000)
- **Configuration**: In-memory with file-based persistence (config file)

#### No Persistent Storage (MVP)
- Sessions are transient
- No database required
- State is maintained in memory
- Sessions are cleaned up on shutdown

#### Future Enhancements
- Session persistence for recovery
- Action recording for test generation
- Metrics storage for monitoring
- Screenshot caching

### 4.3 Data Flow

#### Request Flow
```
AI Tool Request
    │
    ├─► MCP Protocol Layer (deserialize)
    │
    ├─► Tool Router (route to handler)
    │
    ├─► Validation Layer (Zod schemas)
    │
    ├─► Tool Handler (execute)
    │   │
    │   ├─► Session Manager (get session)
    │   │
    │   ├─► Window Manager (get window)
    │   │
    │   ├─► Element Interaction / Main Process / Visual Testing
    │   │
    │   └─► Playwright Adapter (interact with Electron)
    │
    └─► Error Handler (catch errors)
    │
    └─► Response Formatting
    │
    └─► MCP Protocol Layer (serialize)
    │
    └─► AI Tool Response
```

#### Session Lifecycle Flow
```
Launch Request
    │
    ├─► Generate Session ID (UUID v4)
    │
    ├─► Playwright Adapter.launchApp()
    │   │
    │   ├─► _electron.launch() or _electron.connect()
    │   │
    │   └─► Return ElectronApplication
    │
    ├─► Create Session object
    │
    ├─► Store in memory Map
    │
    ├─► Start timeout timer
    │
    └─► Return session ID

Tool Call
    │
    ├─► Update lastActivityAt
    │
    ├─► Execute tool
    │
    └─► Return result

Close/Timeout
    │
    ├─► Set status to 'closing'
    │
    ├─► Close all windows
    │
    ├─► Close Electron app
    │
    ├─► Remove from memory Map
    │
    ├─► Cancel timeout timer
    │
    └─► Log cleanup event
```

### 4.4 Caching Strategy

#### No Caching (MVP)
- Fresh data on each request
- Simpler implementation
- No cache invalidation complexity

#### Future Caching
- Window references (cached per session)
- App metadata (cached per session)
- Validation schemas (compiled at startup)
- Screenshot thumbnails (for visualization)

---

## 5. API Design

### 5.1 MCP Tool Definitions

#### Lifecycle Tools

**launch_electron_app**
```typescript
{
  name: 'launch_electron_app',
  description: 'Launch an Electron application for testing. Supports both launch mode (fresh instance) and CDP mode (connect to running app).',
  inputSchema: z.object({
    appPath: z.string().describe('Path to the Electron executable'),
    mode: z.enum(['launch', 'cdp']).optional().default('launch').describe('Mode: launch (fresh instance) or cdp (connect to running app)'),
    headless: z.boolean().optional().describe('Run in headless mode (requires Electron 28+)'),
    cdpPort: z.number().optional().describe('CDP port for cdp mode (default: 9222)'),
    timeout: z.number().optional().default(30000).describe('Launch timeout in milliseconds')
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.object({
      sessionId: z.string().describe('Unique session ID for subsequent operations'),
      mode: z.string(),
      status: z.string()
    }).optional(),
    error: z.any().optional(),
    metadata: z.object({
      sessionId: z.string(),
      timestamp: z.string(),
      executionTime: z.number()
    })
  })
}
```

**close_electron_app**
```typescript
{
  name: 'close_electron_app',
  description: 'Close an Electron application and clean up all resources including windows and processes.',
  inputSchema: z.object({
    sessionId: z.string().describe('Session ID of the app to close')
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.object({
      sessionId: z.string(),
      status: z.literal('closed')
    }).optional(),
    error: z.any().optional(),
    metadata: z.object({
      sessionId: z.string(),
      timestamp: z.string(),
      executionTime: z.number()
    })
  })
}
```

**get_app_status**
```typescript
{
  name: 'get_app_status',
  description: 'Query the status of running Electron applications. Returns all sessions if no sessionId provided.',
  inputSchema: z.object({
    sessionId: z.string().optional().describe('Session ID to query (optional, returns all if not provided)')
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.union([
      z.object({
        sessions: z.array(z.object({
          sessionId: z.string(),
          mode: z.string(),
          appPath: z.string(),
          windowCount: z.number(),
          status: z.string(),
          createdAt: z.string(),
          lastActivityAt: z.string()
        }))
      }),
      z.object({
        session: z.object({
          sessionId: z.string(),
          mode: z.string(),
          appPath: z.string(),
          windowCount: z.number(),
          status: z.string(),
          createdAt: z.string(),
          lastActivityAt: z.string()
        })
      })
    ]).optional(),
    error: z.any().optional(),
    metadata: z.object({
      sessionId: z.string().optional(),
      timestamp: z.string(),
      executionTime: z.number()
    })
  })
}
```

#### Window Management Tools

**get_first_window**
```typescript
{
  name: 'get_first_window',
  description: 'Get the first window opened by the Electron app. Waits for window to appear with configurable timeout.',
  inputSchema: z.object({
    sessionId: z.string().describe('Session ID'),
    timeout: z.number().optional().default(30000).describe('Timeout in milliseconds')
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.object({
      windowId: z.string(),
      url: z.string(),
      title: z.string()
    }).optional(),
    error: z.any().optional(),
    metadata: z.object({
      sessionId: z.string(),
      timestamp: z.string(),
      executionTime: z.number()
    })
  })
}
```

**list_windows**
```typescript
{
  name: 'list_windows',
  description: 'List all open windows in the Electron application. Returns window IDs, URLs, and titles.',
  inputSchema: z.object({
    sessionId: z.string().describe('Session ID')
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.object({
      windows: z.array(z.object({
        windowId: z.string(),
        url: z.string(),
        title: z.string()
      }))
    }).optional(),
    error: z.any().optional(),
    metadata: z.object({
      sessionId: z.string(),
      timestamp: z.string(),
      executionTime: z.number()
    })
  })
}
```

#### Element Interaction Tools

**click_element**
```typescript
{
  name: 'click_element',
  description: 'Click an element in the Electron window. Supports CSS, text, and role-based selectors. Supports double-click and right-click.',
  inputSchema: z.object({
    sessionId: z.string().describe('Session ID'),
    selector: z.string().describe('CSS selector, text selector, or role-based selector'),
    double: z.boolean().optional().default(false).describe('Perform double-click'),
    right: z.boolean().optional().default(false).describe('Perform right-click'),
    timeout: z.number().optional().default(5000).describe('Timeout in milliseconds')
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.object({
      element: z.string().describe('Selector of clicked element')
    }).optional(),
    error: z.any().optional(),
    metadata: z.object({
      sessionId: z.string(),
      timestamp: z.string(),
      executionTime: z.number()
    })
  })
}
```

**fill_element**
```typescript
{
  name: 'fill_element',
  description: 'Fill text into a form field. Clears existing content before filling. Supports special characters and emojis.',
  inputSchema: z.object({
    sessionId: z.string().describe('Session ID'),
    selector: z.string().describe('CSS selector, text selector, or role-based selector'),
    value: z.string().describe('Text value to fill'),
    timeout: z.number().optional().default(5000).describe('Timeout in milliseconds')
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.object({
      element: z.string().describe('Selector of filled element')
    }).optional(),
    error: z.any().optional(),
    metadata: z.object({
      sessionId: z.string(),
      timestamp: z.string(),
      executionTime: z.number()
    })
  })
}
```

**select_option**
```typescript
{
  name: 'select_option',
  description: 'Select an option from a dropdown or list element. Selects by value or label.',
  inputSchema: z.object({
    sessionId: z.string().describe('Session ID'),
    selector: z.string().describe('CSS selector, text selector, or role-based selector'),
    value: z.string().describe('Option value or label to select'),
    timeout: z.number().optional().default(5000).describe('Timeout in milliseconds')
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.object({
      element: z.string().describe('Selector of dropdown element'),
      selected: z.string().describe('Selected option value')
    }).optional(),
    error: z.any().optional(),
    metadata: z.object({
      sessionId: z.string(),
      timestamp: z.string(),
      executionTime: z.number()
    })
  })
}
```

**hover_element**
```typescript
{
  name: 'hover_element',
  description: 'Hover over an element to trigger hover states, tooltips, or other hover interactions.',
  inputSchema: z.object({
    sessionId: z.string().describe('Session ID'),
    selector: z.string().describe('CSS selector, text selector, or role-based selector'),
    timeout: z.number().optional().default(2000).describe('Timeout in milliseconds')
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.object({
      element: z.string().describe('Selector of hovered element')
    }).optional(),
    error: z.any().optional(),
    metadata: z.object({
      sessionId: z.string(),
      timestamp: z.string(),
      executionTime: z.number()
    })
  })
}
```

#### Main Process Tools

**evaluate_main_process**
```typescript
{
  name: 'evaluate_main_process',
  description: 'Execute JavaScript code in the Electron main process. Access to Electron app object and modules. Sandbox isolation for security.',
  inputSchema: z.object({
    sessionId: z.string().describe('Session ID'),
    code: z.string().describe('JavaScript code to evaluate')
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.object({
      result: z.any().describe('Evaluation result')
    }).optional(),
    error: z.any().optional(),
    metadata: z.object({
      sessionId: z.string(),
      timestamp: z.string(),
      executionTime: z.number()
    })
  })
}
```

**get_app_state**
```typescript
{
  name: 'get_app_state',
  description: 'Get Electron app state information including path, version, window count, process IDs, and memory usage.',
  inputSchema: z.object({
    sessionId: z.string().describe('Session ID')
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.object({
      path: z.string(),
      version: z.string(),
      name: z.string(),
      windowCount: z.number(),
      pids: z.array(z.number()),
      memory: z.number().describe('Memory usage in bytes')
    }).optional(),
    error: z.any().optional(),
    metadata: z.object({
      sessionId: z.string(),
      timestamp: z.string(),
      executionTime: z.number()
    })
  })
}
```

#### Visual Testing Tools

**take_screenshot**
```typescript
{
  name: 'take_screenshot',
  description: 'Capture screenshot of Electron window. Supports viewport, full-page, and element screenshots. Returns base64-encoded image.',
  inputSchema: z.object({
    sessionId: z.string().describe('Session ID'),
    windowId: z.string().optional().describe('Window ID (uses active window if not provided)'),
    type: z.enum(['viewport', 'full-page', 'element']).optional().default('viewport').describe('Screenshot type'),
    selector: z.string().optional().describe('CSS selector for element screenshot'),
    format: z.enum(['png', 'jpeg']).optional().default('png').describe('Image format'),
    quality: z.number().optional().min(0).max(100).describe('Image quality for JPEG (0-100)')
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.object({
      data: z.string().describe('Base64-encoded image'),
      width: z.number(),
      height: z.number(),
      format: z.string()
    }).optional(),
    error: z.any().optional(),
    metadata: z.object({
      sessionId: z.string(),
      timestamp: z.string(),
      executionTime: z.number()
    })
  })
}
```

**get_page_content**
```typescript
{
  name: 'get_page_content',
  description: 'Get HTML or text content of the Electron window page. Includes page URL and title.',
  inputSchema: z.object({
    sessionId: z.string().describe('Session ID'),
    windowId: z.string().optional().describe('Window ID (uses active window if not provided)'),
    type: z.enum(['html', 'text']).optional().default('html').describe('Content type')
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.object({
      content: z.string(),
      url: z.string(),
      title: z.string()
    }).optional(),
    error: z.any().optional(),
    metadata: z.object({
      sessionId: z.string(),
      timestamp: z.string(),
      executionTime: z.number()
    })
  })
}
```

### 5.2 Request/Response Formats

#### Request Format
All MCP tool calls follow this format:
```json
{
  "method": "tools/call",
  "params": {
    "name": "launch_electron_app",
    "arguments": {
      "appPath": "/path/to/app",
      "mode": "launch",
      "headless": false
    }
  }
}
```

#### Success Response Format
```json
{
  "result": {
    "success": true,
    "data": {
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "mode": "launch",
      "status": "active"
    },
    "metadata": {
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2026-02-04T10:30:00.000Z",
      "executionTime": 1250
    }
  }
}
```

#### Error Response Format
```json
{
  "result": {
    "success": false,
    "error": {
      "code": "SESSION_NOT_FOUND",
      "message": "Session '550e8400-e29b-41d4-a716-446655440000' not found or already closed",
      "context": {
        "sessionId": "550e8400-e29b-41d4-a716-446655440000",
        "tool": "click_element"
      },
      "retryable": false,
      "suggestions": [
        "Verify session ID is correct",
        "Check if the session was closed",
        "Launch a new session if needed"
      ]
    },
    "metadata": {
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2026-02-04T10:30:00.000Z",
      "executionTime": 5
    }
  }
}
```

### 5.3 Error Handling Conventions

#### Error Codes
| Code | Description | Retryable |
|------|-------------|-----------|
| `VALIDATION_ERROR` | Input validation failed | No |
| `SESSION_NOT_FOUND` | Session doesn't exist | No |
| `SESSION_CLOSED` | Session was already closed | No |
| `SESSION_TIMEOUT` | Session exceeded timeout | No |
| `SESSION_LIMIT_EXCEEDED` | Too many concurrent sessions | No |
| `ELEMENT_NOT_FOUND` | Element not located | Yes |
| `ELEMENT_TIMEOUT` | Timeout waiting for element | Yes |
| `APP_LAUNCH_FAILED` | Electron app failed to launch | No |
| `APP_CRASHED` | Electron app crashed | No |
| `INVALID_APP_PATH` | App path invalid or not accessible | No |
| `WINDOW_NOT_FOUND` | Window doesn't exist | No |
| `EVALUATION_FAILED` | JavaScript evaluation failed | No |
| `INTERNAL_ERROR` | Unexpected server error | Maybe |

### 5.4 Versioning Strategy

#### MVP Versioning
- MCP protocol version: v1.x
- API version: v1.0.0
- No breaking changes in MVP
- Semantic versioning: MAJOR.MINOR.PATCH

#### Post-MVP Versioning
- Follow semantic versioning
- MAJOR: Breaking changes
- MINOR: New features, backward compatible
- PATCH: Bug fixes, backward compatible

#### Deprecation Policy
- Deprecate features for at least 2 minor versions before removal
- Document deprecation notices in release notes
- Provide migration guides for breaking changes

---

## 6. Security Architecture

### 6.1 Authentication and Authorization

#### Local Development (MVP)
- **Transport**: stdio
- **Authentication**: Implicit via process boundaries
- **Authorization**: No authentication required (local execution)
- **Security**: Process isolation provides implicit security

#### HTTP Transport (Post-MVP)
- **Transport**: HTTP Streamable with HTTPS/TLS
- **Authentication**: OAuth 2.1 with PKCE
- **Authorization**: Resource indicators (RFC 8707)
- **Security**: OAuth Resource Server classification

### 6.2 Input Validation

#### Path Validation
- Validate all file paths before use
- Use `path.resolve()` for normalization
- Prevent directory traversal: `../`, `..\\`
- Whitelist allowed directories (configurable)
- Check file existence and accessibility
- Resolve symlinks to prevent attacks

```typescript
function validateAppPath(appPath: string, allowedDirectories: string[]): string {
  const resolvedPath = path.resolve(appPath);

  // Check if path is in allowed directories
  const isAllowed = allowedDirectories.some(allowedDir =>
    resolvedPath.startsWith(path.resolve(allowedDir))
  );

  if (!isAllowed) {
    throw new Error(`Path '${appPath}' is not in allowed directories`);
  }

  // Check for directory traversal attempts
  if (resolvedPath.includes('..') || resolvedPath.includes('..\\')) {
    throw new Error(`Path '${appPath}' contains directory traversal`);
  }

  return resolvedPath;
}
```

#### Input Validation with Zod
- All tool inputs validated with Zod schemas
- Type checking, required fields, format validation
- Custom validators for sensitive inputs
- Validation occurs before any processing

### 6.3 Data Encryption

#### Data in Transit
- **Stdio**: Implicit security via process boundaries
- **HTTP**: HTTPS/TLS encryption required
- **Post-MVP**: OAuth 2.1 with PKCE for secure token exchange

#### Data at Rest
- **MVP**: No data persistence
- **Post-MVP**: Encrypt sensitive data if persisted

### 6.4 Security Controls

#### Main Process Sandbox
- Restrict JavaScript evaluation scope
- Don't expose full Node.js APIs
- Limit access to system resources
- No access to file system, network, process APIs
- Provide controlled access to Electron APIs only

```typescript
function sandboxEvaluate(code: string, app: ElectronApplication): unknown {
  // Create restricted execution context
  const sandbox = {
    app: {
      getVersion: () => app.evaluate('app.getVersion()'),
      getName: () => app.evaluate('app.getName()'),
      getPath: (name: string) => app.evaluate(`app.getPath('${name}')`)
    }
    // Expose only safe APIs
  };

  // Evaluate code in sandbox
  const sandboxedCode = `
    (function() {
      ${code}
    }).call(${JSON.stringify(sandbox)})
  `;

  return app.evaluate(sandboxedCode);
}
```

#### Code Execution Prevention
- Never execute shell commands
- Never use `eval()` or `Function()` on user input
- All code execution happens in controlled sandbox
- Validate all JavaScript before evaluation

#### Data Protection
- Never log sensitive data (passwords, tokens, PII)
- Redact sensitive data from error messages
- No persistence of screenshots containing sensitive data
- Clear session data from memory on cleanup

### 6.5 Compliance Considerations

#### Security Best Practices
- Follow OWASP guidelines
- Implement least privilege principle
- Use secure coding practices
- Regular security audits (post-MVP)

#### Privacy
- No data collection without consent
- Clear data retention policy
- User control over data deletion
- GDPR compliance (post-MVP)

---

## 7. Performance and Scalability

### 7.1 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| App launch time | < 10s (p95) | Time from launch request to session creation |
| Tool execution time | < 500ms (p95) | Time from tool call to response |
| Session overhead | < 100ms (p95) | Time to create session object |
| Screenshot capture | < 500ms (p95) | Time from request to base64 return |
| Concurrent sessions | Up to 10 | Maximum active sessions |

### 7.2 Scaling Strategy

#### Vertical Scaling (MVP)
- Increase CPU cores for parallel processing
- Increase RAM for more concurrent sessions
- SSD storage for faster app loading

#### Horizontal Scaling (Post-MVP)
- HTTP Streamable transport for multiple clients
- Load balancer distributes requests
- Session affinity not required (stateful sessions)
- Multiple server instances behind load balancer

#### Session Pooling (Future)
- Pre-launch frequently used Electron apps
- Maintain pool of warm sessions
- Reduce launch time for common apps
- Configurable pool size

### 7.3 Caching Approach

#### Current Strategy (MVP)
- No caching for simplicity
- Fresh data on each request
- Simpler implementation

#### Future Caching
- Window references (cached per session)
- App metadata (cached per session)
- Validation schemas (compiled at startup)
- Screenshot thumbnails (for visualization)

### 7.4 Load Balancing

#### Current Strategy (MVP)
- Single stdio connection
- No load balancing needed
- One AI tool per server instance

#### Future Strategy (HTTP)
- Round-robin load balancing
- Health check endpoint
- Graceful degradation
- Circuit breaker pattern

### 7.5 Resource Management

#### Resource Limits
- Max concurrent sessions: 10 (configurable)
- Max session duration: 1 hour (configurable)
- Inactivity timeout: 30 minutes (configurable)
- Memory per session: ~100-500MB (Electron app)
- Session overhead: ~50KB

#### Resource Monitoring
- Track memory usage per session
- Track CPU usage per session
- Alert on high resource usage
- Enforce resource limits
- Graceful degradation under load

#### Resource Cleanup
- Automatic session cleanup on timeout
- Manual session cleanup on request
- Force cleanup on server shutdown
- Memory leak detection
- Process termination on cleanup failure

---

## 8. Operational Considerations

### 8.1 Deployment Strategy

#### Development Deployment
- Run MCP server via stdio from AI tool
- Configuration file in workspace: `.trae/mcp-server.config.json`
- Environment variables for sensitive settings
- Hot reload during development

#### Production Deployment (Post-MVP)
- Docker containerization
- Kubernetes orchestration
- Health checks and readiness probes
- Rolling updates
- Blue-green deployments

#### Configuration Management
```json
{
  "server": {
    "logLevel": "info",
    "maxSessions": 10,
    "sessionTimeout": 3600000,
    "inactivityTimeout": 1800000,
    "cleanupInterval": 300000
  },
  "playwright": {
    "headless": false,
    "launchTimeout": 30000,
    "defaultTimeout": 5000,
    "cdpPort": 9222
  },
  "paths": {
    "whitelist": [
      "/Users/*/Projects/**",
      "C:\\Users\\*\\Projects\\**"
    ],
    "blacklist": []
  },
  "logging": {
    "file": "logs/mcp-server.log",
    "maxSize": 10485760,
    "maxFiles": 5
  }
}
```

### 8.2 Monitoring and Logging

#### Structured Logging with Pino
- JSON format for easy parsing
- Log levels: trace, debug, info, warn, error, fatal
- Configurable log level via environment variable
- Log rotation: 10MB per file, max 5 files

#### Log Categories
1. **MCP Protocol Logs**: Connection events, tool discovery, tool invocation
2. **Session Lifecycle Logs**: Session creation, activity, cleanup, timeout
3. **Electron App Logs**: App launch events, status changes, crashes
4. **Tool Execution Logs**: Tool called, execution time, success/failure
5. **Error Logs**: Error code, message, context, stack trace

#### Log Format
```json
{
  "level": "info",
  "timestamp": "2026-02-04T10:30:00.000Z",
  "category": "tool-execution",
  "sessionId": "abc-123",
  "tool": "click_element",
  "parameters": {
    "selector": "[data-testid='submit']"
  },
  "executionTime": 125,
  "success": true
}
```

#### Metrics to Track (Future)
- Tool execution latency (histogram)
- Error rate (counter)
- Active session count (gauge)
- App launch time (histogram)
- Screenshot capture time (histogram)
- Memory usage (gauge)
- CPU usage (gauge)

#### Monitoring Integration (Future)
- Export metrics to Prometheus
- Health check endpoint
- Alert on high error rates
- Alert on resource exhaustion
- Dashboard for visualization

### 8.3 Error Handling and Resilience

#### Error Handling Strategy
- Centralized error handler
- Structured error responses
- Retry logic for transient failures
- Graceful degradation
- Error logging with context

#### Resilience Patterns
- Circuit breaker for failed operations
- Exponential backoff for retries
- Timeout enforcement for all operations
- Graceful shutdown handling
- Session recovery (future)

### 8.4 Backup and Recovery

#### Current Strategy (MVP)
- No data persistence
- No backup required
- Sessions are transient
- Recovery: Restart server

#### Future Strategy (Post-MVP)
- Session persistence for recovery
- Action recording for test generation
- Backup configuration files
- Disaster recovery plan

### 8.5 CI/CD Integration

#### GitHub Actions Example
```yaml
name: Test MCP Server

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node-version: [22.x]

    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install chromium

      - name: Run tests (Linux)
        if: matrix.os == 'ubuntu-latest'
        run: xvfb-run npm test

      - name: Run tests (macOS/Windows)
        if: matrix.os != 'ubuntu-latest'
        run: npm test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

#### Linux Headless Testing
- Use xvfb for virtual display
- Install xvfb in CI environment
- Run tests with `xvfb-run`
- Configure headless mode for Electron

---

## 9. Implementation Guidance

### 9.1 Project Structure

```
electron-mcp/
├── src/
│   ├── index.ts                 # Entry point
│   ├── server.ts                # MCP server initialization
│   ├── config.ts                # Configuration management
│   ├── logger.ts                # Pino logger setup
│   ├── core/
│   │   ├── session-manager.ts   # Session lifecycle
│   │   ├── playwright-adapter.ts # Playwright wrapper
│   │   ├── window-manager.ts    # Window management
│   │   ├── resource-manager.ts  # Cleanup and resources
│   │   └── error-handler.ts     # Error handling
│   ├── tools/
│   │   ├── registry.ts          # Tool registration
│   │   ├── lifecycle-tools.ts    # Launch, close, status
│   │   ├── window-tools.ts      # Window management tools
│   │   ├── interaction-tools.ts  # Click, fill, select, hover
│   │   ├── main-process-tools.ts# Evaluate, get state
│   │   └── visual-tools.ts      # Screenshot, get content
│   ├── validators/
│   │   ├── schemas.ts           # Zod schema definitions
│   │   └── validators.ts        # Custom validators
│   ├── types/
│   │   ├── session.ts           # Session types
│   │   ├── window.ts            # Window types
│   │   ├── tool.ts              # Tool types
│   │   └── error.ts             # Error types
│   └── utils/
│       ├── path.ts              # Path validation
│       ├── retry.ts             # Retry logic
│       └── timeout.ts           # Timeout handling
├── tests/
│   ├── unit/
│   │   ├── session-manager.test.ts
│   │   ├── validators.test.ts
│   │   └── error-handler.test.ts
│   ├── integration/
│   │   ├── mcp-protocol.test.ts
│   │   └── tools.test.ts
│   └── e2e/
│       ├── launch-app.test.ts
│       ├── element-interaction.test.ts
│       └── main-process.test.ts
├── dist/                         # Compiled JavaScript
├── .trae/
│   ├── docs/
│   │   ├── phase-1/
│   │   ├── phase-2/
│   │   └── phase-3/
│   └── mcp-server.config.json
├── package.json
├── tsconfig.json
└── README.md
```

### 9.2 Implementation Phases

#### Phase 1: Core Infrastructure
1. Project setup (TypeScript, dependencies)
2. Configuration management
3. Logger setup (Pino)
4. Error handler
5. MCP server initialization
6. Validation layer (Zod schemas)

#### Phase 2: Session Management
1. Session manager implementation
2. Playwright adapter implementation
3. Resource manager
4. Window manager
5. Session lifecycle tests

#### Phase 3: Tool Implementation
1. Tool registry
2. Lifecycle tools (launch, close, status)
3. Window management tools
4. Element interaction tools
5. Main process access tools
6. Visual testing tools

#### Phase 4: Integration and Testing
1. Integration tests
2. E2E tests
3. AI tool integration (Cursor, Claude Code)
4. Documentation
5. Configuration examples

#### Phase 5: Production Readiness
1. Performance optimization
2. Security audit
3. Error handling review
4. Documentation completion
5. Deployment guides

### 9.3 Code Quality Standards

#### TypeScript Configuration
- Strict mode enabled
- No implicit any
- Strict null checks
- No unused locals
- No unused parameters

#### Linting
- ESLint for code quality
- Prettier for code formatting
- Pre-commit hooks for quality gates
- Automated linting in CI/CD

#### Testing Coverage
- Unit test coverage > 80%
- Integration test coverage > 60%
- Type coverage 100%
- E2E tests for critical paths

#### Documentation
- Inline documentation for all public APIs
- README with getting started guide
- API documentation
- Configuration examples
- Troubleshooting guide

### 9.4 AI Tool Integration

#### Cursor Configuration (mcp.json)
```json
{
  "mcpServers": {
    "electron-test": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/electron-mcp"
    }
  }
}
```

#### Claude Code Configuration (settings.json)
```json
{
  "mcpServers": {
    "electron-test": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/electron-mcp"
    }
  }
}
```

#### Integration Testing
- Test with Cursor and Claude Code
- Verify tool discovery
- Verify tool execution
- Verify error handling
- Verify session management

---

## 10. Conclusion

This technical architecture provides a comprehensive design for the MCP server for Electron app testing using Playwright. The architecture:

- Implements a layered design with clear separation of concerns
- Provides session-based lifecycle management with robust cleanup
- Includes comprehensive error handling with structured responses
- Follows security-first principles with input validation and sandboxing
- Optimizes performance with configurable limits and async operations
- Ensures observability through structured logging and metrics
- Provides clear implementation guidance and project structure

The architecture is production-ready, addresses all Phase 1 requirements, and provides a solid foundation for implementation. The next phase is to proceed with implementation following the defined phases and quality standards.
