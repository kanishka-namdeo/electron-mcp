# Product Requirements Document (PRD)

## Product Vision

Create a production-ready MCP (Model Context Protocol) server that enables AI coding tools (Cursor, Claude Code, VS Code Copilot) to test Electron applications using Playwright. The server will provide a standardized protocol interface for Electron app automation, enabling AI agents to launch, control, and test Electron applications with capabilities for both main process and renderer process interaction.

**Vision Statement**: Democratize Electron app testing by making it accessible through AI coding tools via a standardized MCP protocol, reducing the barrier to automated testing and enabling intelligent test generation and execution.

## User Personas

### Persona 1: Electron Application Developer
**Profile**: Full-stack developer building desktop applications with Electron
**Behaviors**:
- Works on Windows, macOS, or Linux development machines
- Uses AI coding tools (Cursor, Claude Code) for accelerated development
- Needs to test Electron apps during development and CI/CD
- Values automation and reducing manual testing effort
- May have multiple Electron apps in development

**Needs**:
- Quick launch and control of Electron apps from AI tools
- Automated test generation from AI interactions
- Main process access for testing IPC and Electron APIs
- Screenshot capture for AI visualization
- Cross-platform compatibility

**Pain Points**:
- Manual testing is time-consuming and error-prone
- Setting up automated tests requires significant boilerplate
- Existing tools (Spectron) are deprecated
- AI tools cannot directly interact with Electron apps
- Writing tests manually interrupts development flow

### Persona 2: QA Engineer
**Profile**: Quality assurance specialist focused on desktop application testing
**Behaviors**:
- Works in cross-functional teams with developers
- Uses AI tools to accelerate test creation
- Responsible for test coverage and bug hunting
- Needs to test across Windows, macOS, and Linux

**Needs**:
- Comprehensive element interaction capabilities
- Screenshot and visual validation
- Test case generation from recorded actions
- Multi-window app testing support
- Integration with CI/CD pipelines

**Pain Points**:
- Test maintenance is expensive
- Cross-platform testing is complex
- Visual regression testing requires separate tools
- Cannot leverage AI for test creation

### Persona 3: DevOps Engineer
**Profile**: Infrastructure and automation specialist
**Behaviors**:
- Manages CI/CD pipelines for Electron apps
- Integrates testing into deployment workflows
- Values automation and reproducibility

**Needs**:
- Headless testing for CI/CD environments
- Session management and cleanup
- Structured logging and error reporting
- Docker deployment support
- Integration with existing MCP ecosystem

**Pain Points**:
- Electron testing in CI/CD is complex
- Resource leaks can cause test failures
- Lack of standardized tooling increases setup time

## User Stories

### Epic 1: App Lifecycle Management

**Story 1.1**: Launch Electron App
**As a** developer,
**I want to** launch an Electron application from my AI coding tool,
**So that** I can begin testing immediately without manual app startup.

**Acceptance Criteria**:
- AI tool can launch Electron app by providing executable path
- Support for both CDP mode (connect to running app) and launch mode (fresh instance)
- Configurable headless mode for CI/CD
- Returns session ID for subsequent operations
- Validates executable path before launch
- Launch timeout configurable (default 30s)

**Story 1.2**: Close Electron App
**As a** developer,
**I want to** close an Electron application and clean up resources,
**So that** I can reset test state and free system resources.

**Acceptance Criteria**:
- AI tool can close app by session ID
- All windows are closed properly
- Electron process is terminated
- Session is removed from memory
- Resources are cleaned up (no memory leaks)
- Graceful shutdown with error handling

**Story 1.3**: Get App Status
**As a** developer,
**I want to** query the status of running Electron apps,
**So that** I can verify app state before testing.

**Acceptance Criteria**:
- Returns active sessions list
- Shows session status (active, inactive, closed)
- Includes window count per session
- Includes last activity timestamp
- Returns error if session not found

### Epic 2: Window Management

**Story 2.1**: Get First Window
**As a** developer,
**I want to** get the first window opened by Electron app,
**So that** I can quickly access the main window for testing.

**Acceptance Criteria**:
- Waits for first window to open
- Returns window ID and page object reference
- Configurable timeout (default 30s)
- Returns error if no window opens
- Auto-focuses window

**Story 2.2**: List All Windows
**As a** developer,
**I want to** list all windows in an Electron app,
**So that** I can test multi-window applications.

**Acceptance Criteria**:
- Returns list of all open windows
- Includes window ID, URL, title for each window
- Handles dynamically opening/closing windows
- Updates in real-time as windows open/close
- Returns empty list if no windows

**Story 2.3**: Switch Window
**As a** QA engineer,
**I want to** switch between windows in a multi-window app,
**So that** I can test all application windows.

**Acceptance Criteria**:
- AI tool can switch active window by window ID
- Subsequent operations use selected window
- Returns error if window ID not found
- Maintains window focus state

### Epic 3: Element Interaction

**Story 3.1**: Click Element
**As a** developer,
**I want to** click an element in the Electron window,
**So that** I can interact with UI components.

**Acceptance Criteria**:
- Supports CSS, text, and role-based selectors
- Waits for element to be visible and clickable
- Configurable timeout (default 5s)
- Returns success/failure status
- Returns error if element not found
- Supports double-click and right-click

**Story 3.2**: Fill Form Field
**As a** developer,
**I want to** fill text input fields,
**So that** I can test form submission workflows.

**Acceptance Criteria**:
- Supports CSS, text, and role-based selectors
- Clears existing field content before filling
- Supports special characters and emojis
- Configurable timeout (default 5s)
- Returns success/failure status
- Returns error if element not found

**Story 3.3**: Select Option
**As a** developer,
**I want to** select options from dropdowns and lists,
**So that** I can test selection workflows.

**Acceptance Criteria**:
- Supports `<select>` elements and custom dropdowns
- Selects by value, label, or index
- Returns selected option after selection
- Returns error if option not found
- Configurable timeout (default 5s)

**Story 3.4**: Hover Element
**As a** QA engineer,
**I want to** hover over elements to test tooltips and hover states,
**So that** I can verify hover interactions.

**Acceptance Criteria**:
- Supports CSS, text, and role-based selectors
- Triggers hover state
- Returns element state after hover
- Configurable timeout (default 2s)
- Returns error if element not found

### Epic 4: Main Process Access

**Story 4.1**: Evaluate Main Process Code
**As a** developer,
**I want to** execute JavaScript in Electron main process,
**So that** I can test IPC handlers and Electron APIs.

**Acceptance Criteria**:
- AI tool can provide JavaScript expression to evaluate
- Returns evaluation result
- Access to Electron app object and modules
- Supports async operations
- Returns error if evaluation fails
- Sandbox isolation for security

**Story 4.2**: Get App State
**As a** developer,
**I want to** query Electron app state,
**So that** I can verify application status.

**Acceptance Criteria**:
- Returns app path, version, and name
- Returns window count
- Returns process IDs
- Returns memory usage
- Returns error if app not running

**Story 4.3**: Test IPC Communication
**As a** developer,
**I want to** send IPC messages and receive responses,
**So that** I can test inter-process communication.

**Acceptance Criteria**:
- AI tool can send IPC message to main process
- Supports synchronous and async IPC
- Returns IPC response
- Returns error if IPC channel not found
- Times out after configurable duration (default 10s)

### Epic 5: Visual Testing

**Story 5.1**: Take Screenshot
**As a** developer,
**I want to** capture screenshots of Electron windows,
**So that** AI tools can visualize the app state.

**Acceptance Criteria**:
- Returns base64-encoded image
- Optional file path for saving
- Supports full-page screenshots
- Supports specific element screenshots
- Returns image metadata (dimensions, format)
- Configurable quality and format (PNG/JPEG)

**Story 5.2**: Get Page Content
**As a** developer,
**I want to** retrieve HTML and text content,
**So that** AI tools can analyze page structure.

**Acceptance Criteria**:
- Returns full HTML content
- Returns plain text extraction
- Returns element structure
- Returns page title and URL
- Returns error if page not loaded

**Story 5.3**: Get Accessibility Tree
**As a** QA engineer,
**I want to** retrieve accessibility information,
**So that** I can verify accessibility compliance.

**Acceptance Criteria**:
- Returns accessibility tree structure
- Includes ARIA roles and labels
- Includes keyboard focusable elements
- Returns accessibility violations (WCAG 2.1 AA)
- Returns screen reader text

### Epic 6: Test Generation

**Story 6.1**: Record Actions
**As a** developer,
**I want to** record my interactions during testing,
**So that** I can generate test code automatically.

**Acceptance Criteria**:
- Records all MCP tool calls with parameters
- Stores actions with timestamps
- Records window IDs and selectors
- Maintains recording per session
- Returns recording ID

**Story 6.2**: Generate Test Code
**As a** developer,
**I want to** generate Playwright test code from recorded actions,
**So that** I can create reusable tests.

**Acceptance Criteria**:
- Supports TypeScript, JavaScript, Python, Java, C#
- Generates valid Playwright test code
- Includes setup and teardown
- Includes assertions based on actions
- Returns test code as string
- Returns error if no actions recorded

## Functional Requirements

### FR1: MCP Protocol Compliance
- FR1.1: Implement MCP protocol v1.x specification
- FR1.2: Support tools endpoint (ListTools, CallTool)
- FR1.3: Support resources endpoint (ListResources, ReadResource)
- FR1.4: Support stdio transport
- FR1.5: Support HTTP Streamable transport (secondary)

### FR2: Electron App Lifecycle
- FR2.1: Launch Electron app via Playwright `_electron.launch()`
- FR2.2: Support CDP mode connection to running apps
- FR2.3: Support launch mode for fresh instances
- FR2.4: Close Electron app and cleanup resources
- FR2.5: Query app status and session information

### FR3: Window Management
- FR3.1: Get first window with timeout handling
- FR3.2: List all open windows
- FR3.3: Switch between windows
- FR3.4: Handle dynamic window open/close events

### FR4: Element Interaction
- FR4.1: Click elements with CSS/text/role selectors
- FR4.2: Fill form fields with validation
- FR4.3: Select dropdown options
- FR4.4: Hover over elements
- FR4.5: Wait for element visibility and clickability

### FR5: Main Process Access
- FR5.1: Evaluate JavaScript in main process
- FR5.2: Get Electron app state
- FR5.3: Send IPC messages and receive responses
- FR5.4: Sandbox main process evaluation for security

### FR6: Visual Testing
- FR6.1: Take screenshots (base64 and file)
- FR6.2: Support full-page and element screenshots
- FR6.3: Get page HTML and text content
- FR6.4: Retrieve accessibility tree
- FR6.5: Validate WCAG 2.1 AA compliance

### FR7: Test Generation
- FR7.1: Record MCP tool actions
- FR7.2: Generate Playwright test code
- FR7.3: Support multiple languages (TS, JS, Python, Java, C#)
- FR7.4: Include assertions in generated tests

### FR8: AI Tool Compatibility
- FR8.1: Support Cursor configuration (mcp.json)
- FR8.2: Support Claude Code configuration (settings.json)
- FR8.3: Support VS Code Copilot configuration (settings.json)
- FR8.4: Support GitHub Copilot configuration
- FR8.5: Provide clear tool descriptions for AI discovery

### FR9: Cross-Platform Support
- FR9.1: Support Windows, macOS, Linux
- FR9.2: Handle platform-specific paths
- FR9.3: Support platform-specific Electron behaviors
- FR9.4: Headless mode for Linux CI (xvfb support)

### FR10: Error Handling
- FR10.1: Validate all inputs with Zod schemas
- FR10.2: Return structured error responses
- FR10.3: Implement retry logic for transient failures
- FR10.4: Log all errors with context
- FR10.5: Provide actionable error messages

### FR11: Session Management
- FR11.1: Create unique session IDs
- FR11.2: Track active sessions in memory
- FR11.3: Clean up inactive sessions
- FR11.4: Support session timeout configuration
- FR11.5: Graceful shutdown on disconnect

## Business Rules

### BR1: Resource Management
- BR1.1: Maximum concurrent sessions: 10 (configurable)
- BR1.2: Maximum session duration: 1 hour (configurable)
- BR1.3: Automatic cleanup of sessions inactive for 30 minutes
- BR1.4: Force cleanup on server shutdown

### BR2: Security
- BR2.1: Only allow launching Electron apps from configured workspace
- BR2.2: Validate all file paths (prevent directory traversal)
- BR2.3: Never log sensitive data (passwords, tokens, PII)
- BR2.4: Sandbox main process evaluation
- BR2.5: Require authentication for HTTP transport

### BR3: Tool Execution
- BR3.1: Default timeout for element operations: 5 seconds
- BR3.2: Default timeout for app launch: 30 seconds
- BR3.3: Default timeout for IPC: 10 seconds
- BR3.4: Retry transient failures up to 3 times
- BR3.5: Fail fast for invalid inputs

### BR4: Selector Priority
- BR4.1: Use data-testid selectors when available
- BR4.2: Fall back to role-based selectors
- BR4.3: Use CSS selectors as last resort
- BR4.4: Document selector best practices

### BR5: Logging
- BR5.1: Log all MCP tool calls
- BR5.2: Log errors with stack traces
- BR5.3: Log session lifecycle events
- BR5.4: Structured JSON logging
- BR5.5: Log rotation (max 10MB, 5 files)

## Non-Functional Requirements

### NFR1: Performance
- NFR1.1: App launch time < 10 seconds (typical < 5 seconds)
- NFR1.2: Tool execution time < 100ms (simple operations)
- NFR1.3: Screenshot capture < 500ms
- NFR1.4: Session overhead < 50ms
- NFR1.5: Support up to 10 concurrent sessions

### NFR2: Reliability
- NFR2.1: 99% uptime for server process
- NFR2.2: Graceful handling of Electron app crashes
- NFR2.3: Automatic retry for transient failures
- NFR2.4: No memory leaks after 100 test cycles
- NFR2.5: Clean resource cleanup on all paths

### NFR3: Scalability
- NFR3.1: Support multiple AI tool connections
- NFR3.2: Horizontal scaling via HTTP transport
- NFR3.3: Configurable resource limits
- NFR3.4: Session pooling for frequently tested apps

### NFR4: Security
- NFR4.1: Input validation for all tool parameters
- NFR4.2: Path validation and whitelisting
- NFR4.3: No code execution from untrusted sources
- NFR4.4: HTTPS/TLS for HTTP transport
- NFR4.5: OAuth 2.1 authentication support

### NFR5: Maintainability
- NFR5.1: TypeScript codebase with full type coverage
- NFR5.2: Clear code organization and separation of concerns
- NFR5.3: Comprehensive inline documentation
- NFR5.4: Unit test coverage > 80%
- NFR5.5: Integration test coverage > 60%

### NFR6: Usability
- NFR6.1: Clear tool descriptions for AI discovery
- NFR6.2: Actionable error messages
- NFR6.3: Consistent API naming
- NFR6.4: Intuitive parameter naming
- NFR6.5: Comprehensive examples in documentation

### NFR7: Compatibility
- NFR7.1: Support Electron 28+
- NFR7.2: Support Node.js 18+
- NFR7.3: Support Windows 10+, macOS 12+, Linux (Ubuntu 20.04+)
- NFR7.4: Compatible with Cursor, Claude Code, VS Code Copilot, GitHub Copilot

### NFR8: Observability
- NFR8.1: Structured logging with Pino
- NFR8.2: Metrics for tool execution latency
- NFR8.3: Error rate tracking
- NFR8.4: Session lifecycle events
- NFR8.5: Configurable log levels

## MVP Definition

### MVP Scope (Phase 1)

**In Scope**:
- MCP protocol v1.x implementation with stdio transport
- Electron app lifecycle: launch, close, status query
- Window management: get first window, list all windows
- Element interaction: click, fill, select, hover
- Screenshot capture (base64)
- Main process evaluation
- Session management with basic cleanup
- Error handling and logging
- Compatibility with Cursor and Claude Code

**Out of Scope (MVP)**:
- HTTP Streamable transport
- Test code generation
- IPC message testing
- Accessibility tree retrieval
- OAuth authentication
- Multi-window switching
- Advanced window management
- Docker deployment

**Success Criteria**:
- AI tools can launch and control Electron apps
- Basic element interactions work reliably
- Screenshots return correctly
- Session cleanup works without resource leaks
- Integration with Cursor and Claude Code verified

### Future Enhancements (Post-MVP)

- HTTP Streamable transport for remote scenarios
- Test code generation from recorded actions
- IPC communication testing
- Accessibility tree and WCAG validation
- OAuth 2.1 authentication
- Multi-window app testing
- Action recording and playback
- Visual regression testing
- Docker deployment support
- Session persistence and recovery

## Success Criteria

### KPI1: Integration Success
- AI tools (Cursor, Claude Code) can successfully connect to MCP server
- Tool discovery returns all available tools
- Tool execution completes without errors
- **Target**: 100% tool discovery and execution success

### KPI2: Functional Completeness
- All MVP features implemented and tested
- Element interaction success rate > 95%
- App launch success rate > 90%
- Screenshot capture success rate > 95%
- **Target**: All MVP requirements met with >90% success rates

### KPI3: Performance
- App launch time < 10 seconds (p95)
- Tool execution time < 500ms (p95)
- Session overhead < 100ms (p95)
- **Target**: Meet all performance targets

### KPI4: Reliability
- Server uptime > 99%
- Graceful handling of Electron app crashes
- No memory leaks after 50 test cycles
- **Target**: <1% failure rate, no memory leaks

### KPI5: User Adoption
- Documentation clear and actionable
- Examples work out-of-the-box
- Configuration files provided for Cursor and Claude Code
- **Target**: Users can set up and use server in <30 minutes

### KPI6: Code Quality
- TypeScript type coverage 100%
- Unit test coverage > 80%
- Integration test coverage > 60%
- No critical linting issues
- **Target**: All code quality gates passed

## Assumptions and Constraints

### Assumptions
- A1: Users have Node.js 18+ installed
- A2: Users have Playwright browsers installed
- A3: Electron apps are accessible via file system
- A4: AI tools support MCP protocol v1.x
- A5: Users understand basic Electron app development

### Constraints
- C1: MCP protocol limits response size to 10MB
- C2: Electron apps must be built for development or production
- C3: Headless mode requires Electron 28+
- C4: Linux CI requires xvfb for headless testing
- C5: Single stdio connection per server instance

### Dependencies
- D1: Playwright Electron API stability
- D2: MCP SDK v1.x availability
- D3: AI tool MCP client implementations
- D4: Electron app accessibility for testing

## Risks and Mitigations

### Risk 1: Electron App Path Resolution
**Impact**: Medium | **Probability**: High
Users may have Electron apps in various locations, paths vary by OS.

**Mitigation**:
- Support multiple path resolution strategies
- Provide configuration for workspace paths
- Add helper tool for auto-discovery
- Document path configuration clearly

### Risk 2: Session Resource Leaks
**Impact**: High | **Probability**: Medium
Unclean session cleanup could cause memory leaks and resource exhaustion.

**Mitigation**:
- Implement robust cleanup logic
- Add session timeout enforcement
- Monitor resource usage
- Add automated cleanup tests

### Risk 3: Selector Fragility
**Impact**: Medium | **Probability**: High
CSS selectors may break when UI changes, causing test failures.

**Mitigation**:
- Recommend data-testid attributes
- Use role-based selectors where possible
- Document selector best practices
- Provide selector debugging tools

### Risk 4: Cross-Platform Compatibility
**Impact**: Medium | **Probability**: Medium
Electron apps behave differently on Windows, macOS, Linux.

**Mitigation**:
- Test on all three platforms
- Document platform-specific behaviors
- Use Playwright's cross-platform abstractions
- Allow platform-specific configurations

### Risk 5: MCP Protocol Changes
**Impact**: High | **Probability**: Low
MCP protocol v2 (Q1 2026) may introduce breaking changes.

**Mitigation**:
- Design for protocol flexibility
- Monitor MCP roadmap and changelogs
- Plan migration path for v2
- Document version compatibility

### Risk 6: AI Tool Integration Issues
**Impact**: Medium | **Probability**: Medium
Different AI tools may have MCP client implementation differences.

**Mitigation**:
- Test with multiple AI tools
- Follow MCP specification strictly
- Provide configuration examples for each tool
- Document known issues and workarounds
