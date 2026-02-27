# API Specifications

## Overview

This document provides comprehensive API specifications for all MCP tools in the Electron testing server. Each tool is defined with request/response schemas, error codes, examples, and usage patterns.

## Conventions

### Naming Convention
- Tool names use snake_case with descriptive prefixes (e.g., `launch_electron_app`, `click_element`)
- Input parameters use camelCase
- Error codes use SCREAMING_SNAKE_CASE

### Response Format
All tool responses follow this structure:
```typescript
{
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```

### Session ID
All operations requiring session context include a `sessionId` parameter. Session IDs are UUID v4 strings generated at app launch.

### Window ID
Window operations require a `windowId` parameter. Window IDs are string identifiers for specific Electron windows.

## Tool Categories

### 1. App Lifecycle Tools

#### 1.1 launch_electron_app

**Description**: Launch an Electron application for testing

**Request Schema**:
```typescript
{
  type: "object";
  properties: {
    executablePath: {
      type: "string";
      description: "Absolute path to Electron executable or main entry point";
    };
    args?: {
      type: "array";
      items: { type: "string" };
      description: "Arguments to pass to the Electron app";
      default: [];
    };
    headless?: {
      type: "boolean";
      description: "Run in headless mode (no UI)";
      default: false;
    };
    timeout?: {
      type: "number";
      description: "Launch timeout in milliseconds";
      default: 30000;
      minimum: 1000;
      maximum: 300000;
    };
  };
  required: ["executablePath"];
}
```

**Response Schema (Success)**:
```typescript
{
  success: true;
  data: {
    sessionId: string;
    status: "active" | "inactive" | "closed";
    createdAt: string;
  };
}
```

**Response Schema (Error)**:
```typescript
{
  success: false;
  error: {
    code: "VALIDATION_ERROR" | "PATH_NOT_ALLOWED" | "LAUNCH_FAILED";
    message: string;
    details?: {
      executablePath?: string;
      reason?: string;
    };
  };
}
```

**Error Codes**:
- `VALIDATION_ERROR`: Invalid input parameters
- `PATH_NOT_ALLOWED`: Executable path not in allowed directories
- `LAUNCH_FAILED`: Failed to launch Electron app

**Example Usage**:
```json
{
  "executablePath": "C:\\projects\\my-app\\dist\\main.js",
  "args": ["--remote-debugging-port=9222"],
  "headless": false,
  "timeout": 30000
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "active",
    "createdAt": "2026-02-04T12:00:00.000Z"
  }
}
```

---

#### 1.2 close_electron_app

**Description**: Close an Electron application and clean up resources

**Request Schema**:
```typescript
{
  type: "object";
  properties: {
    sessionId: {
      type: "string";
      description: "Session identifier from launch_electron_app";
      format: "uuid";
    };
    force?: {
      type: "boolean";
      description: "Force close even if windows are open";
      default: false;
    };
  };
  required: ["sessionId"];
}
```

**Response Schema (Success)**:
```typescript
{
  success: true;
  data: {
    sessionId: string;
    status: "closed";
    windowsClosed: number;
  };
}
```

**Response Schema (Error)**:
```typescript
{
  success: false;
  error: {
    code: "SESSION_NOT_FOUND" | "SESSION_CLOSED" | "CLOSE_FAILED";
    message: string;
    details?: {
      sessionId?: string;
    };
  };
}
```

**Error Codes**:
- `SESSION_NOT_FOUND`: Session ID does not exist
- `SESSION_CLOSED`: Session already closed
- `CLOSE_FAILED`: Failed to close app

**Example Usage**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "force": false
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "closed",
    "windowsClosed": 3
  }
}
```

---

#### 1.3 get_app_status

**Description**: Query status of running Electron apps

**Request Schema**:
```typescript
{
  type: "object";
  properties: {
    sessionId?: {
      type: "string";
      description: "Optional session identifier for specific app status";
      format: "uuid";
    };
  };
}
```

**Response Schema (Success)**:
```typescript
{
  success: true;
  data: {
    sessions: Array<{
      sessionId: string;
      status: "active" | "inactive" | "closed";
      windowCount: number;
      createdAt: string;
      lastActivity: string;
      memoryUsage?: {
        heapUsed: number;
        external: number;
      };
    }>;
  };
}
```

**Response Schema (Error)**:
```typescript
{
  success: false;
  error: {
    code: "SESSION_NOT_FOUND";
    message: string;
    details?: {
      sessionId?: string;
    };
  };
}
```

**Error Codes**:
- `SESSION_NOT_FOUND`: Session ID does not exist

**Example Usage (All Sessions)**:
```json
{}
```

**Example Usage (Specific Session)**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "sessionId": "550e8400-e29b-41d4-a716-446655440000",
        "status": "active",
        "windowCount": 2,
        "createdAt": "2026-02-04T12:00:00.000Z",
        "lastActivity": "2026-02-04T12:05:30.000Z",
        "memoryUsage": {
          "heapUsed": 52428800,
          "external": 1048576
        }
      }
    ]
  }
}
```

---

### 2. Window Management Tools

#### 2.1 get_first_window

**Description**: Wait for and return the first window opened by the Electron app

**Request Schema**:
```typescript
{
  type: "object";
  properties: {
    sessionId: {
      type: "string";
      description: "Session identifier";
      format: "uuid";
    };
    timeout?: {
      type: "number";
      description: "Wait timeout in milliseconds";
      default: 30000;
      minimum: 1000;
      maximum: 300000;
    };
  };
  required: ["sessionId"];
}
```

**Response Schema (Success)**:
```typescript
{
  success: true;
  data: {
    windowId: string;
    url: string;
    title: string;
    sessionId: string;
  };
}
```

**Response Schema (Error)**:
```typescript
{
  success: false;
  error: {
    code: "SESSION_NOT_FOUND" | "SESSION_CLOSED" | "WINDOW_TIMEOUT";
    message: string;
    details?: {
      sessionId?: string;
      timeout?: number;
    };
  };
}
```

**Error Codes**:
- `SESSION_NOT_FOUND`: Session ID does not exist
- `SESSION_CLOSED`: Session already closed
- `WINDOW_TIMEOUT`: No window opened within timeout

**Example Usage**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "timeout": 30000
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "windowId": "win-001",
    "url": "app://index.html",
    "title": "My Electron App",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

#### 2.2 list_windows

**Description**: List all windows in an Electron app

**Request Schema**:
```typescript
{
  type: "object";
  properties: {
    sessionId: {
      type: "string";
      description: "Session identifier";
      format: "uuid";
    };
  };
  required: ["sessionId"];
}
```

**Response Schema (Success)**:
```typescript
{
  success: true;
  data: {
    windows: Array<{
      windowId: string;
      url: string;
      title: string;
      sessionId: string;
    }>;
  };
}
```

**Response Schema (Error)**:
```typescript
{
  success: false;
  error: {
    code: "SESSION_NOT_FOUND" | "SESSION_CLOSED";
    message: string;
    details?: {
      sessionId?: string;
    };
  };
}
```

**Error Codes**:
- `SESSION_NOT_FOUND`: Session ID does not exist
- `SESSION_CLOSED`: Session already closed

**Example Usage**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "windows": [
      {
        "windowId": "win-001",
        "url": "app://index.html",
        "title": "Main Window",
        "sessionId": "550e8400-e29b-41d4-a716-446655440000"
      },
      {
        "windowId": "win-002",
        "url": "app://settings.html",
        "title": "Settings",
        "sessionId": "550e8400-e29b-41d4-a716-446655440000"
      }
    ]
  }
}
```

---

#### 2.3 switch_window

**Description**: Switch between windows in a multi-window app

**Request Schema**:
```typescript
{
  type: "object";
  properties: {
    sessionId: {
      type: "string";
      description: "Session identifier";
      format: "uuid";
    };
    windowId: {
      type: "string";
      description: "Window identifier from list_windows";
    };
  };
  required: ["sessionId", "windowId"];
}
```

**Response Schema (Success)**:
```typescript
{
  success: true;
  data: {
    sessionId: string;
    windowId: string;
    url: string;
    title: string;
  };
}
```

**Response Schema (Error)**:
```typescript
{
  success: false;
  error: {
    code: "SESSION_NOT_FOUND" | "SESSION_CLOSED" | "WINDOW_NOT_FOUND";
    message: string;
    details?: {
      sessionId?: string;
      windowId?: string;
    };
  };
}
```

**Error Codes**:
- `SESSION_NOT_FOUND`: Session ID does not exist
- `SESSION_CLOSED`: Session already closed
- `WINDOW_NOT_FOUND`: Window ID does not exist

**Example Usage**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "windowId": "win-002"
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "windowId": "win-002",
    "url": "app://settings.html",
    "title": "Settings"
  }
}
```

---

### 3. Element Interaction Tools

#### 3.1 click_element

**Description**: Click an element in the Electron window

**Request Schema**:
```typescript
{
  type: "object";
  properties: {
    sessionId: {
      type: "string";
      description: "Session identifier";
      format: "uuid";
    };
    windowId: {
      type: "string";
      description: "Window identifier";
    };
    selector: {
      type: "string";
      description: "CSS, text, or role-based selector";
    };
    clickType?: {
      type: "string";
      enum: ["single", "double", "right"];
      description: "Type of click to perform";
      default: "single";
    };
    timeout?: {
      type: "number";
      description: "Element wait timeout in milliseconds";
      default: 5000;
      minimum: 1000;
      maximum: 60000;
    };
  };
  required: ["sessionId", "windowId", "selector"];
}
```

**Response Schema (Success)**:
```typescript
{
  success: true;
  data: {
    sessionId: string;
    windowId: string;
    selector: string;
    clicked: true;
    elementInfo?: {
      tagName: string;
      text: string;
      visible: boolean;
    };
  };
}
```

**Response Schema (Error)**:
```typescript
{
  success: false;
  error: {
    code: "VALIDATION_ERROR" | "SESSION_NOT_FOUND" | "WINDOW_NOT_FOUND" | "ELEMENT_NOT_FOUND" | "ELEMENT_NOT_CLICKABLE";
    message: string;
    details?: {
      sessionId?: string;
      windowId?: string;
      selector?: string;
      timeout?: number;
    };
  };
}
```

**Error Codes**:
- `VALIDATION_ERROR`: Invalid input parameters
- `SESSION_NOT_FOUND`: Session ID does not exist
- `WINDOW_NOT_FOUND`: Window ID does not exist
- `ELEMENT_NOT_FOUND`: Element not found
- `ELEMENT_NOT_CLICKABLE`: Element found but not clickable

**Example Usage (CSS Selector)**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "windowId": "win-001",
  "selector": ".submit-btn",
  "clickType": "single",
  "timeout": 5000
}
```

**Example Usage (Data-TestID Selector)**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "windowId": "win-001",
  "selector": "[data-testid=\"submit-button\"]",
  "clickType": "single"
}
```

**Example Usage (Role-Based Selector)**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "windowId": "win-001",
  "selector": "button[name='Submit']",
  "clickType": "single"
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "windowId": "win-001",
    "selector": "[data-testid=\"submit-button\"]",
    "clicked": true,
    "elementInfo": {
      "tagName": "BUTTON",
      "text": "Submit",
      "visible": true
    }
  }
}
```

---

#### 3.2 fill_element

**Description**: Fill text input fields

**Request Schema**:
```typescript
{
  type: "object";
  properties: {
    sessionId: {
      type: "string";
      description: "Session identifier";
      format: "uuid";
    };
    windowId: {
      type: "string";
      description: "Window identifier";
    };
    selector: {
      type: "string";
      description: "CSS, text, or role-based selector";
    };
    value: {
      type: "string";
      description: "Value to fill in the field";
    };
    clear?: {
      type: "boolean";
      description: "Clear existing field content before filling";
      default: true;
    };
    timeout?: {
      type: "number";
      description: "Element wait timeout in milliseconds";
      default: 5000;
      minimum: 1000;
      maximum: 60000;
    };
  };
  required: ["sessionId", "windowId", "selector", "value"];
}
```

**Response Schema (Success)**:
```typescript
{
  success: true;
  data: {
    sessionId: string;
    windowId: string;
    selector: string;
    filled: true;
    elementInfo?: {
      tagName: string;
      type: string;
      value: string;
    };
  };
}
```

**Response Schema (Error)**:
```typescript
{
  success: false;
  error: {
    code: "VALIDATION_ERROR" | "SESSION_NOT_FOUND" | "WINDOW_NOT_FOUND" | "ELEMENT_NOT_FOUND" | "ELEMENT_NOT_FILLABLE";
    message: string;
    details?: {
      sessionId?: string;
      windowId?: string;
      selector?: string;
      timeout?: number;
    };
  };
}
```

**Error Codes**:
- `VALIDATION_ERROR`: Invalid input parameters
- `SESSION_NOT_FOUND`: Session ID does not exist
- `WINDOW_NOT_FOUND`: Window ID does not exist
- `ELEMENT_NOT_FOUND`: Element not found
- `ELEMENT_NOT_FILLABLE`: Element found but not fillable

**Example Usage**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "windowId": "win-001",
  "selector": "[data-testid=\"username-input\"]",
  "value": "test@example.com",
  "clear": true,
  "timeout": 5000
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "windowId": "win-001",
    "selector": "[data-testid=\"username-input\"]",
    "filled": true,
    "elementInfo": {
      "tagName": "INPUT",
      "type": "text",
      "value": "test@example.com"
    }
  }
}
```

---

#### 3.3 select_option

**Description**: Select options from dropdowns and lists

**Request Schema**:
```typescript
{
  type: "object";
  properties: {
    sessionId: {
      type: "string";
      description: "Session identifier";
      format: "uuid";
    };
    windowId: {
      type: "string";
      description: "Window identifier";
    };
    selector: {
      type: "string";
      description: "CSS, text, or role-based selector for select element";
    };
    value?: {
      type: "string";
      description: "Option value to select";
    };
    label?: {
      type: "string";
      description: "Option label to select";
    };
    index?: {
      type: "number";
      description: "Option index to select";
      minimum: 0;
    };
    timeout?: {
      type: "number";
      description: "Element wait timeout in milliseconds";
      default: 5000;
      minimum: 1000;
      maximum: 60000;
    };
  };
  required: ["sessionId", "windowId", "selector"];
}
```

**Response Schema (Success)**:
```typescript
{
  success: true;
  data: {
    sessionId: string;
    windowId: string;
    selector: string;
    selected: true;
    selectedOption?: {
      value: string;
      label: string;
      index: number;
    };
  };
}
```

**Response Schema (Error)**:
```typescript
{
  success: false;
  error: {
    code: "VALIDATION_ERROR" | "SESSION_NOT_FOUND" | "WINDOW_NOT_FOUND" | "ELEMENT_NOT_FOUND" | "OPTION_NOT_FOUND";
    message: string;
    details?: {
      sessionId?: string;
      windowId?: string;
      selector?: string;
      value?: string;
      label?: string;
      index?: number;
    };
  };
}
```

**Error Codes**:
- `VALIDATION_ERROR`: Invalid input parameters
- `SESSION_NOT_FOUND`: Session ID does not exist
- `WINDOW_NOT_FOUND`: Window ID does not exist
- `ELEMENT_NOT_FOUND`: Select element not found
- `OPTION_NOT_FOUND`: Option not found

**Example Usage (Select by Value)**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "windowId": "win-001",
  "selector": "[data-testid=\"country-select\"]",
  "value": "us",
  "timeout": 5000
}
```

**Example Usage (Select by Label)**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "windowId": "win-001",
  "selector": "[data-testid=\"country-select\"]",
  "label": "United States"
}
```

**Example Usage (Select by Index)**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "windowId": "win-001",
  "selector": "[data-testid=\"country-select\"]",
  "index": 0
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "windowId": "win-001",
    "selector": "[data-testid=\"country-select\"]",
    "selected": true,
    "selectedOption": {
      "value": "us",
      "label": "United States",
      "index": 0
    }
  }
}
```

---

#### 3.4 hover_element

**Description**: Hover over elements to test tooltips and hover states

**Request Schema**:
```typescript
{
  type: "object";
  properties: {
    sessionId: {
      type: "string";
      description: "Session identifier";
      format: "uuid";
    };
    windowId: {
      type: "string";
      description: "Window identifier";
    };
    selector: {
      type: "string";
      description: "CSS, text, or role-based selector";
    };
    timeout?: {
      type: "number";
      description: "Element wait timeout in milliseconds";
      default: 2000;
      minimum: 1000;
      maximum: 60000;
    };
  };
  required: ["sessionId", "windowId", "selector"];
}
```

**Response Schema (Success)**:
```typescript
{
  success: true;
  data: {
    sessionId: string;
    windowId: string;
    selector: string;
    hovered: true;
    elementInfo?: {
      tagName: string;
      text: string;
      visible: boolean;
    };
  };
}
```

**Response Schema (Error)**:
```typescript
{
  success: false;
  error: {
    code: "VALIDATION_ERROR" | "SESSION_NOT_FOUND" | "WINDOW_NOT_FOUND" | "ELEMENT_NOT_FOUND";
    message: string;
    details?: {
      sessionId?: string;
      windowId?: string;
      selector?: string;
      timeout?: number;
    };
  };
}
```

**Error Codes**:
- `VALIDATION_ERROR`: Invalid input parameters
- `SESSION_NOT_FOUND`: Session ID does not exist
- `WINDOW_NOT_FOUND`: Window ID does not exist
- `ELEMENT_NOT_FOUND`: Element not found

**Example Usage**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "windowId": "win-001",
  "selector": "[data-testid=\"tooltip-trigger\"]",
  "timeout": 2000
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "windowId": "win-001",
    "selector": "[data-testid=\"tooltip-trigger\"]",
    "hovered": true,
    "elementInfo": {
      "tagName": "BUTTON",
      "text": "Hover me",
      "visible": true
    }
  }
}
```

---

### 4. Main Process Access Tools

#### 4.1 evaluate_main_process

**Description**: Evaluate JavaScript in Electron main process

**Request Schema**:
```typescript
{
  type: "object";
  properties: {
    sessionId: {
      type: "string";
      description: "Session identifier";
      format: "uuid";
    };
    expression: {
      type: "string";
      description: "JavaScript expression to evaluate";
    };
    timeout?: {
      type: "number";
      description: "Evaluation timeout in milliseconds";
      default: 10000;
      minimum: 1000;
      maximum: 60000;
    };
  };
  required: ["sessionId", "expression"];
}
```

**Response Schema (Success)**:
```typescript
{
  success: true;
  data: {
    sessionId: string;
    result: unknown;
    type: string;
  };
}
```

**Response Schema (Error)**:
```typescript
{
  success: false;
  error: {
    code: "VALIDATION_ERROR" | "SESSION_NOT_FOUND" | "EVALUATION_FAILED" | "SANDBOX_VIOLATION";
    message: string;
    details?: {
      sessionId?: string;
      expression?: string;
      error?: string;
    };
  };
}
```

**Error Codes**:
- `VALIDATION_ERROR`: Invalid input parameters
- `SESSION_NOT_FOUND`: Session ID does not exist
- `EVALUATION_FAILED`: JavaScript evaluation failed
- `SANDBOX_VIOLATION`: Expression violates sandbox restrictions

**Example Usage (Get App Version)**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "expression": "app.getVersion()",
  "timeout": 10000
}
```

**Example Usage (Get App Path)**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "expression": "app.getAppPath()",
  "timeout": 10000
}
```

**Example Usage (Async Operation)**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "expression": "await new Promise(resolve => setTimeout(() => resolve('async result'), 1000))",
  "timeout": 10000
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "result": "1.0.0",
    "type": "string"
  }
}
```

---

#### 4.2 get_app_state

**Description**: Query Electron app state

**Request Schema**:
```typescript
{
  type: "object";
  properties: {
    sessionId: {
      type: "string";
      description: "Session identifier";
      format: "uuid";
    };
  };
  required: ["sessionId"];
}
```

**Response Schema (Success)**:
```typescript
{
  success: true;
  data: {
    sessionId: string;
    appPath: string;
    version: string;
    name: string;
    windowCount: number;
    processIds: number[];
    memoryUsage?: {
      heapUsed: number;
      external: number;
      rss: number;
    };
    platform: string;
    arch: string;
  };
}
```

**Response Schema (Error)**:
```typescript
{
  success: false;
  error: {
    code: "SESSION_NOT_FOUND" | "SESSION_CLOSED";
    message: string;
    details?: {
      sessionId?: string;
    };
  };
}
```

**Error Codes**:
- `SESSION_NOT_FOUND`: Session ID does not exist
- `SESSION_CLOSED`: Session already closed

**Example Usage**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "appPath": "C:\\projects\\my-app\\dist",
    "version": "1.0.0",
    "name": "My Electron App",
    "windowCount": 2,
    "processIds": [12345, 12346],
    "memoryUsage": {
      "heapUsed": 52428800,
      "external": 1048576,
      "rss": 104857600
    },
    "platform": "win32",
    "arch": "x64"
  }
}
```

---

### 5. Visual Testing Tools

#### 5.1 take_screenshot

**Description**: Capture screenshot of Electron window

**Request Schema**:
```typescript
{
  type: "object";
  properties: {
    sessionId: {
      type: "string";
      description: "Session identifier";
      format: "uuid";
    };
    windowId: {
      type: "string";
      description: "Window identifier";
    };
    selector?: {
      type: "string";
      description: "Optional selector for element-specific screenshot";
    };
    fullPage?: {
      type: "boolean";
      description: "Capture full scrollable page";
      default: false;
    };
    format?: {
      type: "string";
      enum: ["png", "jpeg"];
      description: "Image format";
      default: "png";
    };
    quality?: {
      type: "number";
      description: "JPEG quality (0-100, only for JPEG format)";
      default: 90;
      minimum: 0;
      maximum: 100;
    };
    path?: {
      type: "string";
      description: "Optional save path (returns base64 if omitted)";
    };
  };
  required: ["sessionId", "windowId"];
}
```

**Response Schema (Success)**:
```typescript
{
  success: true;
  data: {
    sessionId: string;
    windowId: string;
    image: string;
    format: string;
    dimensions: {
      width: number;
      height: number;
    };
    size: number;
    savedTo?: string;
  };
}
```

**Response Schema (Error)**:
```typescript
{
  success: false;
  error: {
    code: "VALIDATION_ERROR" | "SESSION_NOT_FOUND" | "WINDOW_NOT_FOUND" | "ELEMENT_NOT_FOUND" | "SCREENSHOT_FAILED";
    message: string;
    details?: {
      sessionId?: string;
      windowId?: string;
      selector?: string;
      path?: string;
    };
  };
}
```

**Error Codes**:
- `VALIDATION_ERROR`: Invalid input parameters
- `SESSION_NOT_FOUND`: Session ID does not exist
- `WINDOW_NOT_FOUND`: Window ID does not exist
- `ELEMENT_NOT_FOUND`: Element selector provided but element not found
- `SCREENSHOT_FAILED`: Failed to capture screenshot

**Example Usage (Base64 Response)**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "windowId": "win-001",
  "fullPage": true,
  "format": "png"
}
```

**Example Usage (Save to File)**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "windowId": "win-001",
  "selector": "[data-testid=\"card\"]",
  "format": "png",
  "path": "C:\\screenshots\\card.png"
}
```

**Example Response (Base64)**:
```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "windowId": "win-001",
    "image": "iVBORw0KGgoAAAANSUhEUgAAA...",
    "format": "png",
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "size": 524288
  }
}
```

**Example Response (Saved to File)**:
```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "windowId": "win-001",
    "image": "iVBORw0KGgoAAAANSUhEUgAAA...",
    "format": "png",
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "size": 524288,
    "savedTo": "C:\\screenshots\\card.png"
  }
}
```

---

#### 5.2 get_page_content

**Description**: Retrieve HTML and text content

**Request Schema**:
```typescript
{
  type: "object";
  properties: {
    sessionId: {
      type: "string";
      description: "Session identifier";
      format: "uuid";
    };
    windowId: {
      type: "string";
      description: "Window identifier";
    };
    contentType?: {
      type: "string";
      enum: ["html", "text", "both"];
      description: "Type of content to retrieve";
      default: "both";
    };
  };
  required: ["sessionId", "windowId"];
}
```

**Response Schema (Success)**:
```typescript
{
  success: true;
  data: {
    sessionId: string;
    windowId: string;
    url: string;
    title: string;
    html?: string;
    text?: string;
  };
}
```

**Response Schema (Error)**:
```typescript
{
  success: false;
  error: {
    code: "VALIDATION_ERROR" | "SESSION_NOT_FOUND" | "WINDOW_NOT_FOUND";
    message: string;
    details?: {
      sessionId?: string;
      windowId?: string;
    };
  };
}
```

**Error Codes**:
- `VALIDATION_ERROR`: Invalid input parameters
- `SESSION_NOT_FOUND`: Session ID does not exist
- `WINDOW_NOT_FOUND`: Window ID does not exist

**Example Usage (Both HTML and Text)**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "windowId": "win-001",
  "contentType": "both"
}
```

**Example Usage (HTML Only)**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "windowId": "win-001",
  "contentType": "html"
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "windowId": "win-001",
    "url": "app://index.html",
    "title": "My Electron App",
    "html": "<!DOCTYPE html><html><head>...</head><body>...</body></html>",
    "text": "My Electron App\n\nHome\nSettings\nAbout"
  }
}
```

---

## Error Codes Reference

| Error Code | Category | Description | HTTP Status |
|------------|-----------|-------------|--------------|
| `VALIDATION_ERROR` | Validation | Invalid input parameters | 400 |
| `PATH_NOT_ALLOWED` | Security | Path not in allowed directories | 403 |
| `LAUNCH_FAILED` | App Lifecycle | Failed to launch Electron app | 500 |
| `SESSION_NOT_FOUND` | Session Management | Session ID does not exist | 404 |
| `SESSION_CLOSED` | Session Management | Session already closed | 410 |
| `WINDOW_TIMEOUT` | Window Management | No window opened within timeout | 408 |
| `WINDOW_NOT_FOUND` | Window Management | Window ID does not exist | 404 |
| `ELEMENT_NOT_FOUND` | Element Interaction | Element not found | 404 |
| `ELEMENT_NOT_CLICKABLE` | Element Interaction | Element not clickable | 409 |
| `ELEMENT_NOT_FILLABLE` | Element Interaction | Element not fillable | 409 |
| `OPTION_NOT_FOUND` | Element Interaction | Option not found in select | 404 |
| `EVALUATION_FAILED` | Main Process | JavaScript evaluation failed | 500 |
| `SANDBOX_VIOLATION` | Security | Expression violates sandbox | 403 |
| `SCREENSHOT_FAILED` | Visual Testing | Failed to capture screenshot | 500 |

## Selector Strategy

### Priority Order
1. **data-testid**: Most stable, explicitly for testing
2. **role-based**: Semantic, accessibility-friendly
3. **text-based**: User-visible text
4. **CSS selectors**: Last resort, may be fragile

### Selector Examples

**Data-TestID (Recommended)**:
```css
[data-testid="submit-button"]
```

**Role-Based (Acceptable)**:
```css
button[name='Submit']
input[role='textbox'][name='username']
```

**Text-Based**:
```css
text='Submit'
text='Username'
```

**CSS (Use as Last Resort)**:
```css
.submit-btn.primary-button
#username-input
.form-group > input[type='text']
```

## Usage Patterns

### Typical Workflow

1. **Launch App**:
   ```json
   {
     "tool": "launch_electron_app",
     "input": {
       "executablePath": "/path/to/app/main.js",
       "headless": false
     }
   }
   ```

2. **Get First Window**:
   ```json
   {
     "tool": "get_first_window",
     "input": {
       "sessionId": "...",
       "timeout": 30000
     }
   }
   ```

3. **Interact with Elements**:
   ```json
   {
     "tool": "fill_element",
     "input": {
       "sessionId": "...",
       "windowId": "win-001",
       "selector": "[data-testid=\"username\"]",
       "value": "test@example.com"
     }
   }
   ```

4. **Click Submit**:
   ```json
   {
     "tool": "click_element",
     "input": {
       "sessionId": "...",
       "windowId": "win-001",
       "selector": "[data-testid=\"submit-button\"]"
     }
   }
   ```

5. **Take Screenshot**:
   ```json
   {
     "tool": "take_screenshot",
     "input": {
       "sessionId": "...",
       "windowId": "win-001",
       "fullPage": true
     }
   }
   }
   ```

6. **Close App**:
   ```json
   {
     "tool": "close_electron_app",
     "input": {
       "sessionId": "..."
     }
   }
   ```

### Multi-Window Workflow

1. **Launch App**
2. **List Windows** to get all window IDs
3. **Switch Window** to target specific window
4. **Interact with elements** in selected window
5. **Switch back** to main window if needed

### Main Process Access Workflow

1. **Launch App**
2. **Evaluate Main Process** to get app state or trigger actions
3. **Verify** by checking window state or taking screenshot

### Debugging Workflow

1. **Get Page Content** to inspect DOM
2. **Take Screenshot** to visualize current state
3. **Evaluate Main Process** to check app state
4. **List Windows** to verify window structure

## Versioning

**Current Version**: 1.0.0

**Versioning Strategy**:
- MAJOR: Breaking changes to tool schemas or response formats
- MINOR: New tools, backward-compatible changes
- PATCH: Bug fixes, documentation updates

**Compatibility**:
- MCP Protocol: v1.x
- TypeScript: 5.7.x
- Playwright: 1.48.x
- Zod: 4.x
