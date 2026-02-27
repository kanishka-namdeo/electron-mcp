# Electron MCP Test Application

This is a comprehensive test application for testing all functionalities of the Electron MCP server.

## Features

### UI Elements for Testing
- **Text Input** - Standard text input field
- **Number Input** - Number input with min/max constraints
- **Textarea** - Multi-line text input
- **Select Dropdown** - Standard dropdown menu
- **Checkbox Group** - Multiple checkboxes
- **Radio Group** - Radio buttons with same name
- **Buttons** - Various button styles (primary, secondary, success, warning, danger)

### Dynamic Content
- **Counter** - Increment/decrement counter with display
- **Dynamic Text Area** - Updates based on user actions
- **Hidden/Visible Elements** - Toggle hidden elements for testing visibility states

### Visual Testing
- **Color Boxes** - Colorful elements for screenshot testing
- **Viewport Info** - Display current viewport dimensions
- **Screenshot Capture** - Built-in screenshot functionality

### Accessibility
- **Accessibility Button** - Button with aria-label
- **Status Indicator** - Visual feedback for accessibility testing

### Main Process Communication
- **Get Window Info** - Retrieve window properties (title, bounds, state)
- **Window Controls** - Focus, minimize, maximize, restore operations

### Page Navigation & Info
- **Navigation** - Navigate to URLs
- **Get Page Info** - Retrieve current URL and title

### Script Execution
- **Execute JavaScript** - Run custom scripts in renderer context

## IPC Handlers

The application exposes the following IPC handlers for MCP server testing:

| Handler | Description |
|---------|-------------|
| `get-app-info` | Get application metadata (name, version, platform) |
| `test-message` | Test message echo functionality |
| `get-window-info` | Get window bounds and state information |
| `focus-window` | Focus the main window |
| `minimize-window` | Minimize the window |
| `maximize-window` | Maximize the window |
| `restore-window` | Restore from minimized/maximized state |
| `navigate` | Navigate to a URL |
| `get-page-info` | Get current page URL and title |
| `execute-script` | Execute JavaScript in renderer context |
| `take-screenshot` | Capture page screenshot |
| `get-viewport-size` | Get viewport dimensions |
| `set-viewport-size` | Set viewport dimensions |
| `get-accessibility-tree` | Get accessibility tree of the page |
| `wait-for-selector` | Wait for element to appear |
| `get-text` | Get text content of an element |
| `fill` | Fill input field with text |
| `click` | Click on an element |
| `select` | Select option from dropdown |

## Usage

### Running the Application

```bash
npm start
```

### Running with DevTools

```bash
npm run dev
```

## MCP Server Testing

This application is designed to work with the Electron MCP server. The MCP server can:

1. **Launch the app** - Using `launch_electron_app` tool
2. **Connect via CDP** - Using `connect_to_electron_cdp` tool
3. **Interact with elements** - Using click, fill, select, get_text tools
4. **Take screenshots** - Using screenshot, take_screenshot tools
5. **Execute scripts** - Using execute tool
6. **Control window** - Using focus, minimize, maximize window tools
7. **Test accessibility** - Using get_accessibility_tree tool

## Test Scenarios

### Element Interaction
```javascript
// Click a button
await mcp.call('click', { sessionId, selector: '#primaryBtn' });

// Fill an input
await mcp.call('fill', { sessionId, selector: '#textInput', value: 'Test text' });

// Select from dropdown
await mcp.call('select', { sessionId, selector: '#selectDropdown', value: 'option1' });
```

### Dynamic Content Testing
```javascript
// Wait for element
await mcp.call('wait_for_selector', { sessionId, selector: '#counter', state: 'visible' });

// Get text content
await mcp.call('get_text', { sessionId, selector: '#dynamicText' });
```

### Visual Testing
```javascript
// Take screenshot
await mcp.call('take_screenshot', { sessionId, path: 'screenshot.png' });

// Get viewport size
await mcp.call('get_viewport_size', { sessionId });
```

### Window Control
```javascript
// Get window info
await mcp.call('get_main_window_info', { sessionId });

// Minimize window
await mcp.call('minimize_main_window', { sessionId });
```

## File Structure

```
test-app/
├── package.json      # Project configuration
├── main.js          # Electron main process with IPC handlers
├── preload.js       # Preload script exposing API to renderer
├── renderer.js      # Renderer process JavaScript
└── index.html       # Main HTML file with test UI
```

## Development

The application uses Electron's recommended security practices:
- Context isolation enabled
- Node integration disabled
- Preload script for secure IPC communication
