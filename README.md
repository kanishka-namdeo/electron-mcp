# Electron MCP Server

A Model Context Protocol (MCP) server for testing Electron applications using Playwright. This server enables AI coding tools like Cursor and Claude Code to interact with Electron applications for automated testing and development.

## Features

- **Electron App Lifecycle**: Launch and manage Electron applications programmatically
- **CDP Connection**: Connect to running Electron apps via Chrome DevTools Protocol with retry logic and IPv6/IPv4 fallback
- **Element Interaction**: Click, fill, select, and interact with UI elements
- **Navigation**: Navigate to URLs and manage page state, with CDP-backed navigation history tools
- **Window Management**: Control Electron main windows (focus, minimize, maximize)
- **Main Process Access**: Execute scripts in the Electron main process
- **Visual Testing**: Capture screenshots and compare against baselines
- **Accessibility Testing**: Retrieve accessibility tree information, structured accessibility snapshots, and role-based interactions
- **Session Management**: Multiple concurrent test sessions with UUID tracking
- **Advanced CDP Features**: Network emulation, geolocation override, device metrics, performance monitoring, navigation history
- **Code Generation**: Record user flows and export Playwright tests
- **Robust Error Handling**: Categorized errors with automatic classification and retry recommendations

## Installation

### Using npm (Recommended)

```bash
npm install -g @kanishka-namdeo/electron-mcp-server
```

### From Source

```bash
git clone <repository-url>
cd electron-mcp-server
npm install
npm run build
```

## Usage

### Running the Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run start

# Build TypeScript
npm run build
```

### AI Tool Integration

#### Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "electron-mcp-server": {
      "command": "npx",
      "args": [
        "-y",
        "@kanishka-namdeo/electron-mcp-server"
      ],
      "env": {
        "LOG_LEVEL": "info",
        "NODE_ENV": "production"
      }
    }
  }
}
```

Or using a global installation:

```json
{
  "mcpServers": {
    "electron-mcp-server": {
      "command": "electron-mcp-server",
      "env": {
        "LOG_LEVEL": "info",
        "NODE_ENV": "production"
      }
    }
  }
}
```

#### Cursor

Add to your Cursor MCP settings (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "electron-mcp-server": {
      "command": "npx",
      "args": [
        "-y",
        "@kanishka-namdeo/electron-mcp-server"
      ]
    }
  }
}
```

Or for global installation:

```json
{
  "mcpServers": {
    "electron-mcp-server": {
      "command": "electron-mcp-server"
    }
  }
}
```

## Available Tools

The Electron MCP Server provides **44 tools** across 6 categories:

### App Lifecycle (4 tools)

| Tool | Description |
|------|-------------|
| `launch_electron_app` | Launch an Electron application |
| `connect_to_electron_cdp` | Connect to a running Electron app via CDP |
| `close_session` | Close a test session |
| `list_sessions` | List all active sessions |

### Element Interaction (10 tools)

| Tool | Description |
|------|-------------|
| `navigate` | Navigate to a URL |
| `click` | Click on an element |
| `fill` | Fill an input field with text |
| `select` | Select an option from a dropdown |
| `get_text` | Get text content of an element |
| `screenshot` | Take a screenshot of the page or element |
| `wait_for_selector` | Wait for an element to appear |
| `execute` | Execute JavaScript in the renderer process |
| `get_page_info` | Get page URL and title |

### Main Process & Window Control (8 tools)

| Tool | Description |
|------|-------------|
| `execute_main_process_script` | Execute JavaScript in the main process |
| `get_main_window_info` | Get window information |
| `focus_main_window` | Focus the main window |
| `minimize_main_window` | Minimize the main window |
| `maximize_main_window` | Maximize the main window |
| `get_unresponsive_callstack` | Report capability info for unresponsive renderer callstack capture in Electron 34+ apps |
| `get_shared_dictionary_info` | Report capability info for HTTP shared dictionary compression in Electron 34+ apps |
| `clear_shared_dictionary_cache` | Report capability info for clearing shared dictionary cache in Electron 34+ apps |

### Visual Testing & Accessibility (11 tools)

| Tool | Description |
|------|-------------|
| `take_screenshot` | Capture a screenshot |
| `capture_element_screenshot` | Screenshot a specific element |
| `compare_screenshots` | Compare against a baseline |
| `get_viewport_size` | Get current viewport dimensions |
| `set_viewport_size` | Set viewport dimensions |
| `get_accessibility_tree` | Retrieve accessibility tree |
| `get_accessibility_snapshot` | Get Playwright accessibility snapshot for the current page |
| `find_accessible_node` | Find nodes by accessibility role/name with optional fuzzy matching |
| `interact_accessible_node` | Click or fill accessible nodes by role/name |

### Advanced CDP Features (12 tools)

| Tool | Description |
|------|-------------|
| `get_protocol_info` | Get CDP protocol version and browser info |
| `emulate_network_conditions` | Emulate slow/offline network |
| `reset_network_conditions` | Reset to default network settings |
| `set_geolocation` | Override geolocation |
| `clear_geolocation` | Remove geolocation override |
| `set_device_metrics` | Emulate mobile device |
| `get_console_messages` | Capture console logs |
| `get_performance_metrics` | Get performance metrics |
| `clear_browser_cache` | Clear cache and cookies |
| `get_user_agent` | Get current user agent |
| `get_navigation_history` | Get navigation history entries via CDP |
| `restore_navigation_history` | Restore a history entry via CDP |

### Codegen & Recording

| Tool | Description |
|------|-------------|
| `start_recording` | Start recording a flow for a session |
| `stop_recording` | Stop recording and return structured steps |
| `export_recording_as_test` | Export recorded steps as a Playwright test snippet |

## Links

- **npm**: https://www.npmjs.com/package/@kanishka-namdeo/electron-mcp-server
- **Repository**: https://github.com/kanishka-namdeo/electron-mcp-server
- **Issues**: https://github.com/kanishka-namdeo/electron-mcp-server/issues

## Development

### Testing

The project has a comprehensive test suite with multiple categories:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run E2E tests only (requires running Electron app)
npm run test:e2e

# Run compliance tests only
npm run test:compliance

# Run tests in watch mode
npm run test:watch
```

### Linting

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

### Type Checking

```bash
npm run typecheck
```

### Building

```bash
# Build TypeScript
npm run build

# Development mode with hot reload
npm run dev

# Production mode
npm start
```

## Project Structure

```
electron-mcp-server/
├── src/
│   ├── core/
│   │   ├── errors.ts              # Custom error classes
│   │   ├── errors-enhanced.ts     # Enhanced error handling with classification
│   │   ├── cdp-utils.ts           # CDP connection utilities with retry logic
│   │   ├── connection-health.ts   # Connection health monitoring
│   │   ├── logger.ts              # Pino logging setup
│   │   └── types.ts               # TypeScript type definitions
│   ├── session/
│   │   ├── session-manager.ts   # Session lifecycle management
│   │   └── index.ts
│   ├── tools/
│   │   ├── handlers/
│   │   │   ├── app-lifecycle.ts       # App launch and CDP connection
│   │   │   ├── element-interaction.ts # Click, fill, select, navigate
│   │   │   ├── main-process.ts        # Window control and main process scripts
│   │   │   ├── visual-testing.ts      # Screenshots, viewport, accessibility
│   │   │   └── cdp-advanced.ts        # Network, geolocation, device metrics
│   │   ├── tools.ts                   # Tool definitions
│   │   ├── validation.ts              # Zod schemas
│   │   ├── validation-enhanced.ts     # Enhanced validation schemas
│   │   └── index.ts
│   └── index.ts                       # Main MCP server
├── tests/
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   ├── e2e/               # End-to-end tests
│   ├── compliance/        # MCP protocol compliance tests
│   ├── utils/             # Test utilities
│   └── fixtures/          # Test fixtures
├── test-app/              # Electron test application
├── .trae/
│   └── docs/              # Phase 1 & 2 documentation
├── CHANGELOG.md           # Version history
├── LICENSE                # MIT License
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Environment Variables

- `LOG_LEVEL`: Logging level (default: `info`)
- `NODE_ENV`: Environment (default: `production`)

## License

MIT
