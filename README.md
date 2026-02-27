# Electron MCP Server

A Model Context Protocol (MCP) server for testing Electron applications using Playwright. This server enables AI coding tools like Cursor and Claude Code to interact with Electron applications for automated testing and development.

## Features

- **Electron App Lifecycle**: Launch and manage Electron applications programmatically
- **CDP Connection**: Connect to running Electron apps via Chrome DevTools Protocol
- **Element Interaction**: Click, fill, select, and interact with UI elements
- **Navigation**: Navigate to URLs and manage page state
- **Window Management**: Control Electron main windows (focus, minimize, maximize)
- **Main Process Access**: Execute scripts in the Electron main process
- **Visual Testing**: Capture screenshots and compare against baselines
- **Accessibility Testing**: Retrieve accessibility tree information
- **Session Management**: Multiple concurrent test sessions with UUID tracking

## Installation

```bash
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
      "command": "node",
      "args": [
        "d:\\test_mcp\\electron-mcp\\dist\\index.js"
      ],
      "env": {
        "LOG_LEVEL": "info",
        "NODE_ENV": "production"
      }
    }
  }
}
```

#### Cursor

Add to your Cursor settings:

```json
{
  "mcpServers": {
    "electron-mcp-server": {
      "command": "node",
      "args": [
        "d:\\test_mcp\\electron-mcp\\dist\\index.js"
      ]
    }
  }
}
```

## Available Tools

### App Lifecycle

- `launch_electron_app`: Launch an Electron application
- `connect_to_electron_cdp`: Connect to a running Electron app via CDP
- `close_session`: Close a test session
- `list_sessions`: List all active sessions

### Element Interaction

- `navigate`: Navigate to a URL
- `click`: Click on an element
- `fill`: Fill an input field with text
- `select`: Select an option from a dropdown
- `get_text`: Get text content of an element
- `wait_for_selector`: Wait for an element to appear

### Main Process

- `execute_main_process_script`: Execute JavaScript in the main process
- `get_main_window_info`: Get window information
- `focus_main_window`: Focus the main window
- `minimize_main_window`: Minimize the main window
- `maximize_main_window`: Maximize the main window

### Visual Testing

- `take_screenshot`: Capture a screenshot
- `capture_element_screenshot`: Screenshot a specific element
- `compare_screenshots`: Compare against a baseline
- `get_viewport_size`: Get current viewport dimensions
- `set_viewport_size`: Set viewport dimensions
- `get_accessibility_tree`: Retrieve accessibility tree

### Utility

- `execute`: Execute JavaScript in the renderer process
- `get_page_info`: Get page URL and title

## Development

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration
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

## Project Structure

```
electron-mcp-server/
├── src/
│   ├── core/
│   │   ├── errors.ts       # Custom error classes
│   │   ├── logger.ts      # Pino logging setup
│   │   └── types.ts       # TypeScript type definitions
│   ├── session/
│   │   ├── session-manager.ts  # Session lifecycle management
│   │   └── index.ts
│   ├── tools/
│   │   ├── handlers/
│   │   │   ├── app-lifecycle.ts
│   │   │   ├── element-interaction.ts
│   │   │   ├── main-process.ts
│   │   │   └── visual-testing.ts
│   │   ├── tools.ts       # Tool definitions
│   │   ├── validation.ts   # Zod schemas
│   │   └── index.ts
│   └── index.ts           # Main MCP server
├── tests/
│   ├── core/
│   ├── session/
│   └── tools/
├── .trae/
│   └── docs/              # Phase 1 & 2 documentation
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Environment Variables

- `LOG_LEVEL`: Logging level (default: `info`)
- `NODE_ENV`: Environment (default: `production`)

## License

MIT
