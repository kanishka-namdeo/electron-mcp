# Test Strategy Document

## Overview

This document defines the comprehensive testing strategy for the MCP (Model Context Protocol) server for Electron application testing using Playwright. The strategy covers unit tests (Vitest), integration tests (MCP protocol), and E2E tests (actual Electron apps), ensuring comprehensive coverage of all functional requirements with proper test isolation, cross-platform compatibility, and resource cleanup.

**Testing Vision**: Establish a robust, maintainable test suite that validates the MCP server's functionality, reliability, and performance across Windows, macOS, and Linux platforms while ensuring 80% unit test coverage and 60% integration test coverage as defined in the non-functional requirements.

## Testing Philosophy

### Core Principles

1. **Test-First Approach**: Write tests before or alongside implementation to drive design decisions
2. **Test Isolation**: Each test must be independent and runnable in parallel without side effects
3. **Test Pyramid**: Prioritize unit tests (base) > integration tests (middle) > E2E tests (top)
4. **Page Object Model (POM)**: Encapsulate page interactions in reusable objects for E2E tests
5. **Continuous Validation**: Integrate testing into CI/CD pipeline for immediate feedback
6. **Comprehensive Coverage**: Cover happy paths, edge cases, error conditions, and boundary values

### Quality Goals

- **Unit Test Coverage**: >80% of codebase (NFR5.4)
- **Integration Test Coverage**: >60% of functional requirements (NFR5.5)
- **TypeScript Type Coverage**: 100% (NFR5.1)
- **Test Execution Time**: <5 minutes for full suite (local), <10 minutes (CI)
- **Test Reliability**: <1% flaky test rate
- **Parallel Execution**: All tests designed for parallel execution

## Test Levels and Scope

### Level 1: Unit Tests (Vitest)

**Purpose**: Validate individual functions, classes, and modules in isolation

**Scope**:
- Input validation with Zod schemas
- Error handling logic
- Session management functions
- Utility functions (path resolution, timeout handling)
- MCP protocol message parsing
- Data transformation logic

**Test Runner**: Vitest 2.1.x
**Execution Mode**: In-memory, no external dependencies
**Parallel**: Yes (default Vitest behavior)

### Level 2: Integration Tests (MCP Protocol)

**Purpose**: Validate MCP server interactions without actual Electron apps

**Scope**:
- MCP protocol handshake (ListTools, CallTool)
- Tool registration and discovery
- Request/response handling
- Transport layer (stdio, HTTP Streamable)
- Error response formatting
- Session lifecycle management

**Test Runner**: Vitest 2.1.x
**Execution Mode**: MCP server process spawned per test
**Parallel**: Yes (isolated MCP server instances)

### Level 3: E2E Tests (Playwright + Electron)

**Purpose**: Validate end-to-end workflows with actual Electron applications

**Scope**:
- App lifecycle (launch, close, status)
- Window management (get, list, switch)
- Element interaction (click, fill, select, hover)
- Main process access (evaluate, IPC)
- Visual testing (screenshots, content extraction)
- Cross-platform compatibility
- Resource cleanup verification

**Test Runner**: Playwright 1.48.x
**Execution Mode**: Real Electron apps launched per test
**Parallel**: Yes (isolated Electron instances)

## Test Environment Setup

### Local Development Environment

**Prerequisites**:
```bash
# Node.js and npm
node --version  # >= 18.0.0
npm --version    # >= 9.0.0

# Playwright browsers
npx playwright install chromium

# TypeScript
npm install -D typescript tsx

# Test frameworks
npm install -D vitest @vitest/ui @playwright/test
```

**Environment Variables**:
```bash
# Test configuration
TEST_TIMEOUT=30000          # Default test timeout (ms)
TEST_PARALLEL=true          # Enable parallel test execution
TEST_HEADLESS=true          # Run Electron apps headless
TEST_WORKSPACE=./test-apps   # Directory containing test Electron apps

# Platform-specific (Linux only for xvfb)
TEST_XVFB_RUN=/usr/bin/xvfb-run  # Path to xvfb-run for Linux CI
```

**Test Data Directory Structure**:
```
test-apps/
├── simple-app/              # Minimal Electron app for basic tests
│   ├── package.json
│   ├── main.js
│   └── index.html
├── multi-window-app/        # Multi-window Electron app
│   ├── package.json
│   ├── main.js
│   └── index.html
└── complex-app/             # Complex Electron app with IPC
    ├── package.json
    ├── main.js
    └── index.html
```

### CI/CD Environment (GitHub Actions)

**Workflow Configuration**:
```yaml
name: Test MCP Server

on: [push, pull_request]

jobs:
  test:
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install chromium
      - run: npm test
        env:
          TEST_HEADLESS: true
          TEST_PARALLEL: true
```

**Linux CI Setup**:
```yaml
# Install xvfb for headless Electron on Linux
- run: sudo apt-get update && sudo apt-get install -y xvfb
- run: npm test
  env:
    TEST_XVFB_RUN: xvfb-run -a
```

### Docker Environment

**Dockerfile**:
```dockerfile
FROM node:18-slim

# Install Playwright dependencies
RUN npx playwright install-deps chromium

# Install xvfb for Linux
RUN apt-get update && apt-get install -y xvfb

# Copy project
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Run tests
CMD ["npm", "test"]
```

## Test Coverage Requirements

### Coverage Targets by Component

| Component | Unit Test Target | Integration Test Target | E2E Test Target |
|-----------|------------------|------------------------|-----------------|
| MCP Protocol | 90% | 100% | N/A |
| App Lifecycle | 85% | 70% | 80% |
| Window Management | 80% | 60% | 75% |
| Element Interaction | 75% | 50% | 85% |
| Main Process Access | 80% | 60% | 70% |
| Visual Testing | 70% | 40% | 80% |
| Session Management | 90% | 80% | 70% |
| Error Handling | 95% | 90% | 85% |
| **Overall** | **>80%** | **>60%** | **>75%** |

### Coverage by Functional Requirement

| Functional Requirement Category | Test Coverage |
|--------------------------------|----------------|
| FR1: MCP Protocol Compliance | 100% (Integration) |
| FR2: Electron App Lifecycle | 90% (E2E), 70% (Unit) |
| FR3: Window Management | 85% (E2E), 60% (Unit) |
| FR4: Element Interaction | 90% (E2E), 50% (Unit) |
| FR5: Main Process Access | 80% (E2E), 70% (Unit) |
| FR6: Visual Testing | 85% (E2E), 40% (Unit) |
| FR7: Test Generation | 70% (E2E), 30% (Unit) |
| FR8: AI Tool Compatibility | 100% (Integration) |
| FR9: Cross-Platform Support | 100% (E2E - matrix) |
| FR10: Error Handling | 95% (Unit + Integration) |
| FR11: Session Management | 90% (Integration + E2E) |

### Coverage Measurement Tools

**Unit and Integration Tests**:
```bash
# Vitest coverage with c8
npm test -- --coverage

# Generate coverage report
npm test -- --coverage --reporter=html

# Coverage thresholds in vitest.config.ts
coverage: {
  provider: 'v8',
  statements: 80,
  branches: 75,
  functions: 80,
  lines: 80
}
```

**E2E Tests**:
```bash
# Playwright code coverage (requires instrumentation)
npx playwright test --coverage

# Coverage report in coverage/index.html
```

## Test Plan and Test Cases

### Unit Test Plan

#### UT-001: Input Validation

**Objective**: Validate all tool inputs using Zod schemas

**Test Cases**:
- UT-001.1: Valid executable path returns success
- UT-001.2: Invalid executable path (null) throws error
- UT-001.3: Invalid executable path (empty string) throws error
- UT-001.4: Path traversal attack throws error
- UT-001.5: Valid CSS selector passes validation
- UT-001.6: Invalid selector syntax throws error
- UT-001.7: Valid timeout value passes validation
- UT-001.8: Negative timeout value throws error
- UT-001.9: Valid JSON input passes validation
- UT-001.10: Malformed JSON throws error

**Files to Test**:
- `src/validation/schemas.ts`
- `src/validation/path-validator.ts`
- `src/validation/selector-validator.ts`

#### UT-002: Session Management

**Objective**: Validate session lifecycle and cleanup

**Test Cases**:
- UT-002.1: Create unique session ID
- UT-002.2: Retrieve session by ID
- UT-002.3: Delete session by ID
- UT-002.4: Session timeout triggers cleanup
- UT-002.5: Max concurrent sessions enforced
- UT-002.6: Session persistence across operations
- UT-002.7: Session data isolation
- UT-002.8: Session cleanup on error
- UT-002.9: Session ID collision handling
- UT-002.10: Session garbage collection

**Files to Test**:
- `src/session/session-manager.ts`
- `src/session/session-store.ts`

#### UT-003: Error Handling

**Objective**: Validate error response formatting and handling

**Test Cases**:
- UT-003.1: File not found error formatted correctly
- UT-003.2: Timeout error formatted correctly
- UT-003.3: Validation error formatted correctly
- UT-003.4: Generic error formatted correctly
- UT-003.5: Error includes stack trace in debug mode
- UT-003.6: Error excludes sensitive data
- UT-003.7: Retry logic for transient failures
- UT-003.8: Max retry attempts enforced
- UT-003.9: Exponential backoff calculation
- UT-003.10: Error recovery after retry

**Files to Test**:
- `src/errors/error-handler.ts`
- `src/errors/retry-logic.ts`
- `src/errors/error-formatter.ts`

#### UT-004: Utility Functions

**Objective**: Validate helper and utility functions

**Test Cases**:
- UT-004.1: Path resolution (absolute paths)
- UT-004.2: Path resolution (relative paths)
- UT-004.3: Path normalization (Windows)
- UT-004.4: Path normalization (Unix)
- UT-004.5: Timeout calculation with default
- UT-004.6: Timeout calculation with override
- UT-004.7: Base64 encoding/decoding
- UT-004.8: JSON serialization
- UT-004.9: UUID generation
- UT-004.10: Timestamp formatting

**Files to Test**:
- `src/utils/path-utils.ts`
- `src/utils/timeout-utils.ts`
- `src/utils/encoding-utils.ts`

### Integration Test Plan

#### IT-001: MCP Protocol Handshake

**Objective**: Validate MCP server initialization and tool discovery

**Test Cases**:
- IT-001.1: Server starts successfully with stdio transport
- IT-001.2: Server responds to initialize request
- IT-001.3: ListTools returns all registered tools
- IT-001.4: Tool descriptions are complete
- IT-001.5: Tool input schemas are valid
- IT-001.6: Server handles protocol version negotiation
- IT-001.7: Server gracefully handles malformed requests
- IT-001.8: Server terminates cleanly on disconnect

**Test File**: `tests/integration/mcp-handshake.test.ts`

#### IT-002: Tool Execution

**Objective**: Validate MCP tool call handling

**Test Cases**:
- IT-002.1: CallTool executes launch_electron_app
- IT-002.2: CallTool executes click_element
- IT-002.3: CallTool executes fill_field
- IT-002.4: CallTool executes take_screenshot
- IT-002.5: Invalid tool name returns error
- IT-002.6: Invalid tool parameters return error
- IT-002.7: Tool execution timeout handling
- IT-002.8: Concurrent tool execution
- IT-002.9: Tool execution returns correct format
- IT-002.10: Tool errors are propagated correctly

**Test File**: `tests/integration/tool-execution.test.ts`

#### IT-003: Transport Layer

**Objective**: Validate stdio and HTTP Streamable transports

**Test Cases**:
- IT-003.1: Stdio transport connects successfully
- IT-003.2: Stdio transport handles concurrent messages
- IT-003.3: HTTP Streamable transport connects successfully
- IT-003.4: HTTP Streamable handles streaming responses
- IT-003.5: Transport error handling
- IT-003.6: Transport connection timeout
- IT-003.7: Transport reconnection logic
- IT-003.8: Transport cleanup on disconnect

**Test File**: `tests/integration/transport.test.ts`

#### IT-004: Session Lifecycle

**Objective**: Validate session management in MCP context

**Test Cases**:
- IT-004.1: Session created on app launch
- IT-004.2: Session referenced in subsequent operations
- IT-004.3: Session closed on app close
- IT-004.4: Session timeout enforced
- IT-004.5: Multiple concurrent sessions
- IT-004.6: Session isolation between sessions
- IT-004.7: Session cleanup on server shutdown
- IT-004.8: Session state persistence

**Test File**: `tests/integration/session-lifecycle.test.ts`

### E2E Test Plan

#### E2E-001: App Lifecycle Management

**Objective**: Validate Electron app launch, close, and status

**Test Cases**:
- E2E-001.1: Launch simple Electron app (CDP mode)
- E2E-001.2: Launch simple Electron app (launch mode)
- E2E-001.3: Launch app with invalid path returns error
- E2E-001.4: Launch app with headless mode
- E2E-001.5: Close app by session ID
- E2E-001.6: Close app verifies process termination
- E2E-001.7: Query app status returns active sessions
- E2E-001.8: Query app status for non-existent session returns error
- E2E-001.9: Launch timeout handling
- E2E-001.10: App crash handling

**Test File**: `tests/e2e/app-lifecycle.spec.ts`

#### E2E-002: Window Management

**Objective**: Validate window operations

**Test Cases**:
- E2E-002.1: Get first window of launched app
- E2E-002.2: Get first window with timeout handling
- E2E-002.3: List all windows of single-window app
- E2E-002.4: List all windows of multi-window app
- E2E-002.5: Switch between two windows
- E2E-002.6: Switch to non-existent window returns error
- E2E-002.7: Handle dynamic window open event
- E2E-002.8: Handle dynamic window close event
- E2E-002.9: Window focus state maintained
- E2E-002.10: Window metadata (URL, title) retrieved

**Test File**: `tests/e2e/window-management.spec.ts`

#### E2E-003: Element Interaction

**Objective**: Validate UI element interactions

**Test Cases**:
- E2E-003.1: Click button via CSS selector
- E2E-003.2: Click button via data-testid selector
- E2E-003.3: Click button via role-based selector
- E2E-003.4: Click element with wait for visibility
- E2E-003.5: Click non-existent element returns error
- E2E-003.6: Double-click element
- E2E-003.7: Right-click element
- E2E-003.8: Fill text input field
- E2E-003.9: Fill field clears existing content
- E2E-003.10: Fill field with special characters
- E2E-003.11: Select dropdown option by value
- E2E-003.12: Select dropdown option by label
- E2E-003.13: Hover over element
- E2E-003.14: Element state after hover verified
- E2E-003.15: Click after page load

**Test File**: `tests/e2e/element-interaction.spec.ts`

#### E2E-004: Main Process Access

**Objective**: Validate main process evaluation and IPC

**Test Cases**:
- E2E-004.1: Evaluate simple JavaScript in main process
- E2E-004.2: Evaluate async JavaScript in main process
- E2E-004.3: Access Electron app object
- E2E-004.4: Get app path and version
- E2E-004.5: Get window count
- E2E-004.6: Send IPC message and receive response
- E2E-004.7: IPC message timeout handling
- E2E-004.8: IPC channel not found returns error
- E2E-004.9: Sandbox isolation verified
- E2E-004.10: Unauthorized code execution blocked

**Test File**: `tests/e2e/main-process.spec.ts`

#### E2E-005: Visual Testing

**Objective**: Validate screenshot and content extraction

**Test Cases**:
- E2E-005.1: Take screenshot of window
- E2E-005.2: Take full-page screenshot
- E2E-005.3: Take screenshot of specific element
- E2E-005.4: Screenshot returns base64 data
- E2E-005.5: Screenshot returns metadata (dimensions, format)
- E2E-005.6: Save screenshot to file
- E2E-005.7: Get HTML content of page
- E2E-005.8: Get text content of page
- E2E-005.9: Get page title and URL
- E2E-005.10: Screenshot quality configuration (PNG/JPEG)

**Test File**: `tests/e2e/visual-testing.spec.ts`

#### E2E-006: Cross-Platform Compatibility

**Objective**: Validate functionality across platforms

**Test Cases**:
- E2E-006.1: Launch app on Windows 10+
- E2E-006.2: Launch app on macOS 12+
- E2E-006.3: Launch app on Ubuntu 20.04+
- E2E-006.4: Platform-specific path handling
- E2E-006.5: Headless mode on Linux with xvfb
- E2E-006.6: Window management across platforms
- E2E-007.7: Element interaction across platforms
- E2E-007.8: Screenshot capture across platforms

**Test File**: `tests/e2e/cross-platform.spec.ts`

#### E2E-007: Error Handling and Resource Cleanup

**Objective**: Validate error scenarios and cleanup

**Test Cases**:
- E2E-007.1: Invalid executable path error
- E2E-007.2: Element not found error
- E2E-007.3: Timeout error on app launch
- E2E-007.4: Timeout error on element wait
- E2E-007.5: IPC message timeout error
- E2E-007.6: Graceful app crash handling
- E2E-007.7: Resource cleanup after test
- E2E-007.8: Memory leak detection (100 test cycles)
- E2E-007.9: Session cleanup on server disconnect
- E2E-007.10: Force cleanup on server shutdown

**Test File**: `tests/e2e/error-handling.spec.ts`

## Test Data and Fixtures

### Test Electron Apps

#### Simple App

**Purpose**: Minimal Electron app for basic lifecycle and interaction tests

**Files**:
```
test-apps/simple-app/
├── package.json
├── main.js
└── preload.js
```

**Features**:
- Single window
- Basic HTML with buttons and inputs
- data-testid attributes for stable selectors

#### Multi-Window App

**Purpose**: Test multi-window management

**Files**:
```
test-apps/multi-window-app/
├── package.json
├── main.js
└── preload.js
```

**Features**:
- Opens two windows on startup
- Button to open additional windows
- Button to close windows
- data-testid attributes for each window

#### Complex App

**Purpose**: Test IPC communication and advanced features

**Files**:
```
test-apps/complex-app/
├── package.json
├── main.js
├── preload.js
└── renderer/
    ├── index.html
    ├── styles.css
    └── renderer.js
```

**Features**:
- IPC handlers for main process communication
- Form with multiple input types
- Dropdown menus
- Hover effects
- Accessibility attributes

### Test Fixtures

**Vitest Fixtures** (`tests/fixtures/vitest-fixtures.ts`):
```typescript
import { describe, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

export function withTestWorkspace(fixture: (workspace: string) => void) {
  const workspace = './test-apps';

  beforeAll(() => {
    // Setup test workspace
  });

  afterAll(() => {
    // Cleanup test workspace
  });

  beforeEach(() => {
    // Reset workspace state
  });

  afterEach(() => {
    // Cleanup individual test artifacts
  });
}
```

**Playwright Fixtures** (`tests/fixtures/playwright-fixtures.ts`):
```typescript
import { test as base, _electron as electron } from '@playwright/test';

type ElectronTestFixtures = {
  electronApp: Awaited<ReturnType<typeof electron.launch>>;
  window: any;
  page: any;
};

export const test = base.extend<ElectronTestFixtures>({
  electronApp: async ({}, use) => {
    const app = await electron.launch({
      executablePath: './test-apps/simple-app/dist/electron.exe',
    });
    await use(app);
    await app.close();
  },
  window: async ({ electronApp }, use) => {
    const window = await electronApp.firstWindow();
    await use(window);
  },
  page: async ({ window }, use) => {
    await use(window);
  },
});

export const expect = test.expect;
```

### Mock Data

**MCP Request Mocks** (`tests/mocks/mcp-requests.ts`):
```typescript
export const mockInitializeRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0',
    },
  },
};

export const mockListToolsRequest = {
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/list',
};

export const mockCallToolRequest = (toolName: string, args: any) => ({
  jsonrpc: '2.0',
  id: 3,
  method: 'tools/call',
  params: {
    name: toolName,
    arguments: args,
  },
});
```

**Electron App Mocks** (`tests/mocks/electron-mocks.ts`):
```typescript
export const mockAppInfo = {
  name: 'Test App',
  version: '1.0.0',
  path: '/path/to/app',
  processId: 12345,
};

export const mockWindowInfo = {
  id: 'window-1',
  url: 'file:///index.html',
  title: 'Test Window',
};
```

## Cross-Platform Testing Strategy

### Platform Matrix

| Platform | Version | Headless Support | CI/CD | Priority |
|----------|---------|------------------|--------|----------|
| Windows | 10, 11 | Yes (Electron 28+) | GitHub Actions | High |
| macOS | 12+, 13+, 14+ | Yes (Electron 28+) | GitHub Actions | High |
| Linux | Ubuntu 20.04+, 22.04+ | Yes (xvfb required) | GitHub Actions | High |

### Platform-Specific Considerations

**Windows**:
- Path separators: `\`
- Executable extensions: `.exe`
- No special setup required for headless mode
- Environment variables: `TEST_PLATFORM=windows`

**macOS**:
- Path separators: `/`
- No executable extensions
- No special setup required for headless mode
- Environment variables: `TEST_PLATFORM=macos`
- Note: macOS 12+ required for Electron 28+

**Linux**:
- Path separators: `/`
- No executable extensions
- **Requires xvfb for headless mode**: `xvfb-run -a npm test`
- Environment variables: `TEST_PLATFORM=linux`
- GitHub Actions setup:
  ```yaml
  - run: sudo apt-get update && sudo apt-get install -y xvfb
  - run: npm test
    env:
      TEST_XVFB_RUN: xvfb-run -a
  ```

### Cross-Platform Test Execution

**Local Testing**:
```bash
# Detect platform automatically
npm test

# Force platform testing
TEST_PLATFORM=windows npm test
TEST_PLATFORM=macos npm test
TEST_PLATFORM=linux npm test
```

**CI/CD Testing**:
```yaml
# Run tests on all platforms in parallel
strategy:
  matrix:
    os: [windows-latest, macos-latest, ubuntu-latest]
```

### Platform-Specific Test Data

**Path Resolution Tests**:
```typescript
// Windows paths
'C:\\Users\\Test\\App\\electron.exe'

// Unix paths (macOS/Linux)
'/Users/Test/App/electron'
'/home/test/app/electron'
```

## Error Handling and Edge Cases

### Error Scenarios to Test

**File System Errors**:
- Executable file not found
- Executable not executable (permission denied)
- Directory path instead of file path
- Path traversal attacks (`../../../etc/passwd`)
- Symlink loops
- File system permissions

**Network/IPC Errors**:
- IPC channel not found
- IPC message timeout
- IPC handler throws error
- Network connection lost
- Invalid IPC message format

**Element Interaction Errors**:
- Element not found
- Element not visible
- Element not clickable (covered by another element)
- Element detached from DOM
- Stale element reference

**Timeout Errors**:
- App launch timeout
- Window open timeout
- Element wait timeout
- IPC response timeout
- Screenshot capture timeout

**Resource Errors**:
- Out of memory
- Too many open files
- Process limit reached
- Session limit exceeded
- Concurrent operation limit exceeded

### Edge Cases to Test

**Boundary Values**:
- Minimum timeout (0ms)
- Maximum timeout (1 hour)
- Maximum concurrent sessions (10)
- Maximum window count (theoretical limit)
- Maximum screenshot size (10MB MCP limit)

**Invalid Inputs**:
- Null values
- Undefined values
- Empty strings
- Negative numbers
- Non-numeric strings where numbers expected
- Malformed JSON
- Invalid CSS selectors
- Invalid session IDs

**Race Conditions**:
- Rapid concurrent requests
- Session cleanup during operation
- Window close during interaction
- App crash during operation
- Server shutdown during operation

**State Transitions**:
- Launching app while another is launching
- Closing app while operations in progress
- Switching windows while one is closing
- Taking screenshot during navigation

## Resource Cleanup and Leak Prevention

### Cleanup Strategy

**Session Cleanup**:
```typescript
// Automatic cleanup on session timeout
const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour

setInterval(() => {
  cleanupInactiveSessions(SESSION_TIMEOUT);
}, 60 * 1000); // Check every minute
```

**Process Cleanup**:
```typescript
// Ensure Electron processes are terminated
afterEach(async () => {
  const sessions = getActiveSessions();
  for (const session of sessions) {
    await session.close();
  }
});
```

**File Cleanup**:
```typescript
// Remove temporary files
afterAll(async () => {
  const tempDir = './test-temp';
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }
});
```

### Memory Leak Detection

**Test Approach**:
```typescript
test('no memory leaks after 100 test cycles', async () => {
  const initialMemory = process.memoryUsage().heapUsed;

  for (let i = 0; i < 100; i++) {
    const app = await launchElectronApp('./test-apps/simple-app');
    const window = await app.firstWindow();
    await window.click('[data-testid="button"]');
    await app.close();
  }

  // Force garbage collection (if available)
  if (global.gc) {
    global.gc();
  }

  const finalMemory = process.memoryUsage().heapUsed;
  const memoryIncrease = finalMemory - initialMemory;

  // Memory increase should be minimal (< 10MB)
  expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
});
```

### Resource Monitoring

**Test Metrics to Track**:
- Process count before and after tests
- Memory usage before and after tests
- File descriptors before and after tests
- Open network connections before and after tests

**Cleanup Verification Tests**:
```typescript
test('all resources cleaned up after test', async () => {
  const beforeProcesses = getRunningProcesses();
  const beforeMemory = process.memoryUsage();

  // Run test operations
  const app = await launchElectronApp('./test-apps/simple-app');
  await app.close();

  const afterProcesses = getRunningProcesses();
  const afterMemory = process.memoryUsage();

  // Verify cleanup
  expect(afterProcesses.length).toBe(beforeProcesses.length);
  expect(afterMemory.heapUsed).toBeLessThan(beforeMemory.heapUsed + 5 * 1024 * 1024);
});
```

## Test Automation and CI/CD Integration

### Local Test Execution

**Run All Tests**:
```bash
npm test
```

**Run Unit Tests Only**:
```bash
npm run test:unit
```

**Run Integration Tests Only**:
```bash
npm run test:integration
```

**Run E2E Tests Only**:
```bash
npm run test:e2e
```

**Run Tests in Watch Mode**:
```bash
npm run test:watch
```

**Run Tests with Coverage**:
```bash
npm run test:coverage
```

**Run Tests in Parallel**:
```bash
npm run test:parallel
```

### CI/CD Pipeline Integration

**GitHub Actions Workflow**:
```yaml
name: Test MCP Server

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
        node-version: [18.x, 20.x]
      fail-fast: false

    runs-on: ${{ matrix.os }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install chromium

      - name: Install xvfb (Linux only)
        if: matrix.os == 'ubuntu-latest'
        run: sudo apt-get update && sudo apt-get install -y xvfb

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Run integration tests
        run: npm run test:integration

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          TEST_HEADLESS: true
          TEST_PARALLEL: true

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: ${{ matrix.os }}-node${{ matrix.node-version }}
          name: Coverage Report

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results-${{ matrix.os }}-node${{ matrix.node-version }}
          path: |
            test-results/
            playwright-report/
```

### Quality Gates

**Pre-Merge Requirements**:
- All tests pass
- Unit test coverage >= 80%
- Integration test coverage >= 60%
- No linting errors
- No TypeScript errors

**Pre-Release Requirements**:
- All tests pass on all platforms
- Coverage targets met
- No flaky tests detected
- Performance benchmarks met
- Security scan passes

## Test Documentation and Maintenance

### Test Documentation Standards

**Test File Header**:
```typescript
/**
 * @file App Lifecycle E2E Tests
 * @description Tests for Electron app launch, close, and status operations
 * @see {@link FR2} Functional Requirements: App Lifecycle
 * @see {@link E2E-001} Test Plan: App Lifecycle Management
 * @author QA Team
 * @since 1.0.0
 */
```

**Test Case Documentation**:
```typescript
test.describe('E2E-001: App Lifecycle Management', () => {
  test('E2E-001.1: Launch simple Electron app (CDP mode)', async ({ electronApp }) => {
    // Arrange
    const appPath = './test-apps/simple-app/dist/electron.exe';

    // Act
    const session = await launchElectronApp(appPath, { mode: 'cdp' });

    // Assert
    expect(session).toBeDefined();
    expect(session.id).toBeDefined();
    expect(session.status).toBe('active');

    // Cleanup
    await session.close();
  });
});
```

### Test Maintenance Guidelines

**Regular Maintenance Tasks**:
- Update test data when app structure changes
- Review and update flaky tests
- Add tests for new features
- Remove tests for deprecated features
- Update documentation

**Flaky Test Handling**:
1. Identify flaky test (fails intermittently)
2. Add `test.skip()` with comment explaining flakiness
3. Create issue tracking flaky test
4. Investigate root cause
5. Fix and re-enable test

**Test Deprecation Process**:
1. Mark test as `@deprecated` with JSDoc comment
2. Add reason for deprecation
3. Add reference to replacement test
4. Remove after 2 sprints

## Test Metrics and Reporting

### Key Metrics

**Coverage Metrics**:
- Statement coverage
- Branch coverage
- Function coverage
- Line coverage

**Quality Metrics**:
- Test pass rate
- Flaky test rate
- Test execution time
- Test failure rate by category

**Performance Metrics**:
- Average test execution time
- P95 test execution time
- Memory usage during tests
- CPU usage during tests

### Test Reports

**HTML Coverage Report**:
```bash
npm run test:coverage
open coverage/index.html
```

**Playwright Test Report**:
```bash
npm run test:e2e -- --reporter=html
npx playwright show-report
```

**CI/CD Test Results**:
- GitHub Actions test results tab
- Artifact downloads for detailed reports
- Coverage trend charts (Codecov)

## Test Tools and Configuration

### Vitest Configuration

**vitest.config.ts**:
```typescript
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'test-apps/',
        'tests/',
        '*.config.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 10000,
  },
  plugins: [tsconfigPaths()],
});
```

### Playwright Configuration

**playwright.config.ts**:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

## Test Implementation Schedule

### Phase 1: Unit Tests (Week 1-2)

**Priority**: High
**Duration**: 2 weeks
**Owner**: QA Engineer

**Tasks**:
- Set up Vitest configuration
- Implement input validation tests (UT-001)
- Implement session management tests (UT-002)
- Implement error handling tests (UT-003)
- Implement utility function tests (UT-004)
- Achieve 80% unit test coverage

### Phase 2: Integration Tests (Week 2-3)

**Priority**: High
**Duration**: 1 week
**Owner**: QA Engineer

**Tasks**:
- Set up MCP server test environment
- Implement MCP protocol handshake tests (IT-001)
- Implement tool execution tests (IT-002)
- Implement transport layer tests (IT-003)
- Implement session lifecycle tests (IT-004)
- Achieve 60% integration test coverage

### Phase 3: E2E Tests (Week 3-4)

**Priority**: High
**Duration**: 2 weeks
**Owner**: QA Engineer

**Tasks**:
- Create test Electron apps
- Implement Page Object Model fixtures
- Implement app lifecycle tests (E2E-001)
- Implement window management tests (E2E-002)
- Implement element interaction tests (E2E-003)
- Implement main process tests (E2E-004)
- Implement visual testing tests (E2E-005)
- Implement cross-platform tests (E2E-006)
- Implement error handling tests (E2E-007)

### Phase 4: CI/CD Integration (Week 4)

**Priority**: Medium
**Duration**: 1 week
**Owner**: DevOps Engineer + QA Engineer

**Tasks**:
- Set up GitHub Actions workflow
- Configure multi-platform testing matrix
- Add coverage reporting (Codecov)
- Configure test result artifacts
- Implement quality gates
- Document test execution procedures

### Phase 5: Test Maintenance and Refinement (Ongoing)

**Priority**: Medium
**Duration**: Ongoing
**Owner**: QA Engineer

**Tasks**:
- Monitor test execution metrics
- Fix flaky tests
- Update tests for new features
- Optimize test execution time
- Improve test documentation

## Success Criteria

### Quantitative Metrics

- **Unit Test Coverage**: >80% (NFR5.4)
- **Integration Test Coverage**: >60% (NFR5.5)
- **E2E Test Coverage**: >75%
- **TypeScript Type Coverage**: 100% (NFR5.1)
- **Test Execution Time**: <5 minutes (local), <10 minutes (CI)
- **Flaky Test Rate**: <1%
- **Test Pass Rate**: >95% on CI/CD

### Qualitative Metrics

- All functional requirements have corresponding tests
- All test cases documented with acceptance criteria
- Test data and fixtures are reusable
- Tests are isolated and runnable in parallel
- Cross-platform compatibility verified
- Error conditions and edge cases covered
- Resource cleanup verified (no memory leaks)

### Validation Checklist

- [ ] Unit tests achieve 80% coverage
- [ ] Integration tests achieve 60% coverage
- [ ] E2E tests cover all MVP features
- [ ] Cross-platform tests pass on Windows, macOS, Linux
- [ ] Error handling tests cover all error scenarios
- [ ] Resource cleanup verified with leak detection tests
- [ ] CI/CD pipeline configured with quality gates
- [ ] Test documentation complete
- [ ] Test execution time within targets
- [ ] Flaky test rate <1%

## Risks and Mitigations

### Test Strategy Risks

**Risk 1: Flaky Tests**
- **Impact**: Medium
- **Likelihood**: High
- **Mitigation**:
  - Implement proper test isolation
  - Use stable selectors (data-testid)
  - Add appropriate wait conditions
  - Monitor and fix flaky tests promptly
  - Use retry mechanism in CI/CD

**Risk 2: Slow Test Execution**
- **Impact**: Medium
- **Likelihood**: Medium
- **Mitigation**:
  - Optimize test data setup
  - Use parallel execution
  - Run unit tests separately from E2E tests
  - Cache dependencies
  - Use headless mode for E2E tests

**Risk 3: Cross-Platform Test Failures**
- **Impact**: Medium
- **Likelihood**: Medium
- **Mitigation**:
  - Test on all target platforms
  - Use platform-agnostic paths
  - Document platform-specific behaviors
  - Allow platform-specific test variations
  - Use GitHub Actions matrix for CI/CD

**Risk 4: Insufficient Test Data**
- **Impact**: Medium
- **Likelihood**: Low
- **Mitigation**:
  - Create comprehensive test Electron apps
  - Include various UI patterns
  - Test with multiple app configurations
  - Mock external dependencies
  - Use data generation utilities

**Risk 5: Resource Leaks in Tests**
- **Impact**: High
- **Likelihood**: Medium
- **Mitigation**:
  - Implement robust cleanup in afterEach/afterAll
  - Monitor resource usage during tests
  - Add leak detection tests
  - Use process isolation
  - Limit concurrent test execution

## References

### Phase 1 Documents

- [Technology Research Document](../phase-1/01-technology-research.md)
- [Product Requirements Document](../phase-1/02-prd.md)
- [Research Findings Document](../phase-1/03-research-findings.md)
- [Requirements Traceability Matrix](../phase-1/04-requirements-traceability-matrix.md)

### External Documentation

- [MCP Protocol Specification](https://modelcontextprotocol.io/specification/2025-11-25)
- [Playwright Electron API](https://playwright.dev/docs/api/class-electron)
- [Vitest Documentation](https://vitest.dev)
- [Zod Documentation](https://zod.dev)

### Best Practices

- [MCP Server Development Best Practices](../phase-1/03-research-findings.md#best-practices)
- [Playwright Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Best Practices](../phase-1/03-research-findings.md#testing-best-practices)

## Approval

**Document Owner**: QA Engineer
**Reviewers**: Development Team, Product Manager
**Approval Date**: TBD
**Status**: Draft

**Approval Checklist**:
- [ ] Test strategy reviewed by QA team
- [ ] Test strategy reviewed by development team
- [ ] Test strategy approved by product manager
- [ ] Test schedule confirmed
- [ ] Resource allocation confirmed

---

**Document Version**: 1.0
**Last Updated**: February 4, 2026
**Next Review**: March 4, 2026
