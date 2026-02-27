# Testing the Electron MCP

## Quick Start with npm

If you have the package installed globally:

```bash
# Test the installed package
electron-mcp-server

# Or via npx
npx -y @kanishka-namdeo/electron-mcp-server
```

## MCP Server Test

The basic MCP server test verifies that the server starts and lists all tools:

```bash
npm run build
node test-server.js
```

## Full Integration Test

This test starts the Electron test app, connects to it via CDP, and runs multiple tests:

```bash
npm run build
node test-mcp-full.js
```

This test covers:
- Listing all MCP tools
- Connecting to Electron CDP
- Navigating to test app
- Getting page info
- Waiting for selectors
- Getting element text
- Executing JavaScript
- Listing sessions
- Closing sessions

## E2E Tests

E2E tests require a running Electron app with CDP enabled.

### Starting the Electron Test App

Option 1: Manual start
```bash
cd test-app
node node_modules/electron/cli.js --remote-debugging-port=9222
```

Option 2: Using the provided script
```bash
node tests/e2e/start-electron-for-tests.js
```

### Running E2E Tests

After starting the Electron app:

```bash
npm run test:e2e
```

Or run specific test file:
```bash
npx vitest run tests/e2e/mcp-server.e2e.test.ts
```

## Unit Tests

Run unit tests without E2E dependencies:

```bash
npm run test
```

## Issues Fixed

1. **CDP Connection Issue**: Fixed `session-manager.ts` to use existing pages instead of creating new pages when connecting via CDP
2. **E2E Helper**: Fixed response handling in `e2e-helper.ts` to properly parse and return tool results
3. **Test Setup**: Created helper scripts for starting Electron app with CDP enabled

## MCP Tools Available

- `launch_electron_app` - Launch an Electron application
- `connect_to_electron_cdp` - Connect to running Electron app via CDP
- `close_session` - Close a testing session
- `list_sessions` - List active sessions
- `navigate` - Navigate to a URL
- `click` - Click on an element
- `fill` - Fill an input field
- `select` - Select from dropdown
- `get_text` - Get text from element
- `screenshot` / `take_screenshot` - Take screenshot
- `wait_for_selector` - Wait for element
- `execute` - Execute JavaScript
- `get_page_info` - Get page information
- `execute_main_process_script` - Execute in main process
- `get_main_window_info` - Get window info
- `focus_main_window` - Focus window
- `minimize_main_window` - Minimize window
- `maximize_main_window` - Maximize window
- `capture_element_screenshot` - Screenshot element
- `compare_screenshots` - Compare screenshots
- `get_viewport_size` - Get viewport size
- `set_viewport_size` - Set viewport size
- `get_accessibility_tree` - Get accessibility tree
