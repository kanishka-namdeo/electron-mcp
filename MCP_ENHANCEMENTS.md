# Electron MCP Enhancements - Edge Cases & Best Practices

## Summary

The Electron MCP server has been significantly enhanced based on online research of edge cases and best practices for CDP connections, MCP implementations, and Electron testing.

## Enhancements Implemented

### 1. CDP Connection Resilience ([`cdp-utils.ts`](src/core/cdp-utils.ts))

#### IPv6/IPv4 Fallback
- **Problem**: Different systems may bind to `localhost`, `127.0.0.1`, or `::1` (IPv6)
- **Solution**: Implemented automatic fallback across multiple host variants
  ```typescript
  const hosts = [host, '127.0.0.1', '::1'];
  ```

#### Exponential Backoff Retry
- **Problem**: Network connections can fail transiently
- **Solution**: Implements exponential backoff with max delay cap
  - Default: 3 retries with 1s, 2s, 4s delays
  - Maximum delay capped at 5 seconds
  - Configurable via `retries` and `retryDelay` parameters

#### Connection Error Detection
- **Problem**: Not all errors should trigger retries
- **Solution**: Smart error classification for connection errors
  - Detects: `ECONNREFUSED`, `ETIMEDOUT`, `ENOTFOUND`, `EHOSTUNREACH`
  - Only retries on transient connection errors
  - Fails fast on non-retryable errors

### 2. Error Handling System ([`errors-enhanced.ts`](src/core/errors-enhanced.ts))

#### Categorized Error Types
```typescript
enum ErrorCategory {
  CONNECTION_ERROR,    // CDP connection issues
  VALIDATION_ERROR,     // Invalid input
  SESSION_ERROR,        // Session management issues
  PROTOCOL_ERROR,       // CDP protocol issues
  TIMEOUT_ERROR,        // Timeout scenarios
  RESOURCE_ERROR,       // Resource access issues
  AUTH_ERROR,          // Authentication issues
}
```

#### Automatic Error Classification
- Detects and categorizes errors automatically
- Provides actionable suggestions
- Includes retry timing recommendations

```typescript
// Example: Connection refused error
{
  category: 'CONNECTION_ERROR',
  code: 'ECONNREFUSED',
  message: 'Connection to CDP server refused',
  suggestion: 'Ensure Electron app is running with --remote-debugging-port flag',
  retryAfter: 2000
}
```

### 3. Advanced CDP Tools ([`cdp-advanced.ts`](src/tools/handlers/cdp-advanced.ts))

#### New MCP Tools Added:

| Tool | Purpose | Key Parameters |
|-------|---------|----------------|
| `get_protocol_info` | Get CDP protocol version and browser info | `sessionId` |
| `emulate_network_conditions` | Emulate slow/offline network | `offline`, `downloadThroughput`, `uploadThroughput`, `latency` |
| `reset_network_conditions` | Reset to default network settings | `sessionId` |
| `set_geolocation` | Override geolocation | `latitude`, `longitude`, `accuracy` |
| `clear_geolocation` | Remove geolocation override | `sessionId` |
| `set_device_metrics` | Emulate mobile device | `width`, `height`, `deviceScaleFactor`, `mobile` |
| `get_console_messages` | Capture console logs | `sessionId` |
| `get_performance_metrics` | Get performance metrics | `sessionId` |
| `clear_browser_cache` | Clear cache and cookies | `sessionId` |
| `get_user_agent` | Get current user agent | `sessionId` |
| `get_navigation_history` | Get navigation history entries via CDP `Page.getNavigationHistory` | `sessionId` |
| `restore_navigation_history` | Restore a navigation history entry via CDP `Page.navigateToHistoryEntry` | `sessionId`, `index?` |

### 4. Connection Health Monitoring ([`connection-health.ts`](src/core/connection-health.ts))

#### Features:
- **Automatic health checks** with configurable intervals (default: 5s)
- **Latency tracking** for performance monitoring
- **Health change callbacks** for reactive handling
- **Timeout detection** with configurable limits
- **Multi-connection support** - monitor multiple connections

```typescript
const monitor = new ConnectionHealthMonitor({
  checkInterval: 5000,
  maxRetries: 3,
  timeout: 3000,
  onHealthChange: (isHealthy) => {
    console.log(`Connection health: ${isHealthy}`);
  }
});

await monitor.startMonitoring('session-123', async () => {
  // Health check function
  return await session.page.evaluate(() => document.readyState === 'complete');
});
```

### 5. Session Management Improvements ([`session-manager.ts`](src/session/session-manager.ts))

#### Browser Type Tracking
- Added `browserType: 'chromium' | 'electron'` to Session interface
- Prevents incompatibilities (e.g., protocol info not available for Electron sessions)
- Enables conditional tool availability

#### Enhanced CDP Connection
```typescript
const chromiumBrowser = await CDPUtils.connectWithRetry({
  host: options.host || 'localhost',
  port: options.port,
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
});
```

### 6. Enhanced Validation & New Schemas ([`validation-enhanced.ts`](src/tools/validation-enhanced.ts))

#### Strict Input Validation
- UUID validation for session IDs
- Range validation for coordinates (-90 to 90 for latitude, -180 to 180 for longitude)
- Positive number validation for throughput and latency
- Type validation for all parameters
- New schemas for:
  - `get_accessibility_snapshot`, `find_accessible_node`, `interact_accessible_node`
  - `start_recording`, `stop_recording`, `export_recording_as_test`
  - `get_navigation_history`, `restore_navigation_history`

## Testing

### New Test Suite ([`test-new-capabilities.js`](test-new-capabilities.js))

Comprehensive test covering all 10 new tools:

1. ✅ Tool listing verification
2. ✅ CDP connection with retry
3. ✅ Protocol info retrieval
4. ✅ Geolocation spoofing
5. ✅ Network condition emulation
6. ✅ Network condition reset
7. ✅ Device metrics (mobile viewport)
8. ✅ Console message capture
9. ✅ Performance metrics
10. ✅ User agent retrieval
11. ✅ Browser cache clearing
12. ✅ Geolocation clearing
13. ✅ Session cleanup

Run tests:
```bash
npm run build
node test-new-capabilities.js
```

## Usage Examples

### Retry-Resilient CDP Connection
```json
{
  "name": "connect_to_electron_cdp",
  "arguments": {
    "port": 9222,
    "host": "localhost"
  }
}
```
Now automatically retries with exponential backoff and IPv6/IPv4 fallback.

### Emulate Slow Network (3G)
```json
{
  "name": "emulate_network_conditions",
  "arguments": {
    "sessionId": "<session-id>",
    "offline": false,
    "downloadThroughput": 1500000,
    "uploadThroughput": 500000,
    "latency": 100
  }
}
```

### Test with San Francisco Location
```json
{
  "name": "set_geolocation",
  "arguments": {
    "sessionId": "<session-id>",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "accuracy": 10
  }
}
```

### Emulate iPhone 14 Pro Viewport
```json
{
  "name": "set_device_metrics",
  "arguments": {
    "sessionId": "<session-id>",
    "width": 393,
    "height": 852,
    "deviceScaleFactor": 3,
    "mobile": true
  }
}
```

### Capture Console Messages
### Get Navigation History
```json
{
  "name": "get_navigation_history",
  "arguments": {
    "sessionId": "<session-id>"
  }
}
```

### Restore Navigation History Entry
```json
{
  "name": "restore_navigation_history",
  "arguments": {
    "sessionId": "<session-id>",
    "index": 0
  }
}
```

### Accessibility Snapshot
```json
{
  "name": "get_accessibility_snapshot",
  "arguments": {
    "sessionId": "<session-id>",
    "includeHidden": false
  }
}
```

### Find Accessible Node
```json
{
  "name": "find_accessible_node",
  "arguments": {
    "sessionId": "<session-id>",
    "role": "button",
    "name": "Click to perform accessibility action",
    "exact": true,
    "limit": 1
  }
}
```

### Interact with Accessible Node
```json
{
  "name": "interact_accessible_node",
  "arguments": {
    "sessionId": "<session-id>",
    "role": "button",
    "name": "Click to perform accessibility action",
    "action": "click"
  }
}
```

### Start Recording a Flow
```json
{
  "name": "start_recording",
  "arguments": {
    "sessionId": "<session-id>"
  }
}
```

### Stop Recording and Export as Test
```json
{
  "name": "stop_recording",
  "arguments": {
    "sessionId": "<session-id>"
  }
}
```

```json
{
  "name": "export_recording_as_test",
  "arguments": {
    "sessionId": "<session-id>",
    "testName": "recorded example.com flow"
  }
}
```
```json
{
  "name": "get_console_messages",
  "arguments": {
    "sessionId": "<session-id>"
  }
}
```

## Tool Count

- **Core Tools**: 24 tools (app lifecycle, element interaction, navigation, visual testing, window control)
- **Advanced CDP Tools**: 12 additional tools
- **Accessibility & Visual Tools**: 11 tools
- **Codegen & Recording**: 3 tools
- **Total**: 50+ tools

### Categories

1. **App Lifecycle** (4): launch, connect, close, list sessions
2. **Element Interaction** (9): navigate, click, fill, select, get_text, screenshot, wait, execute, get_page_info
3. **Main Process** (8): execute_main_process_script, get_main_window_info, focus/minimize/maximize_main_window, unresponsive callstack & shared dictionary capability tools
4. **Visual Testing & Accessibility** (11): take_screenshot, capture_element_screenshot, compare_screenshots, get/set_viewport_size, get_accessibility_tree, accessibility snapshot and role-based tools
5. **Advanced CDP** (12): protocol_info, network emulation, geolocation, device metrics, console/performance metrics, cache, user_agent, navigation history tools
6. **Codegen & Recording** (3): start_recording, stop_recording, export_recording_as_test

## Edge Cases Handled

| Edge Case | Solution |
|-----------|----------|
| Connection timeout | Exponential backoff retry |
| IPv6/IPv4 binding | Multi-host fallback |
| Session closed during operation | Error classification with cleanup |
| Network fluctuations | Health monitoring with callbacks |
| Mobile viewport testing | Device metrics emulation |
| Geolocation restrictions | Geolocation override |
| Offline testing | Network condition emulation |
| Performance analysis | Performance metrics tool |
| Debugging issues | Console message capture |
| Cache contamination | Browser cache clearing |

## Best Practices Applied

1. **Idempotency**: Tools like `reset_network_conditions` and `clear_geolocation` can be safely called multiple times
2. **Resource cleanup**: All sessions properly closed, even on errors
3. **Type safety**: Full TypeScript coverage with strict validation
4. **Logging**: Comprehensive logging at appropriate levels
5. **Error recovery**: Automatic retry for transient failures
6. **Backward compatibility**: All existing tools remain functional
7. **Extensibility**: Easy to add new tools and capabilities

## Performance Considerations

- **Health checks**: Configurable intervals to balance accuracy vs. overhead
- **Retry delays**: Exponential backoff prevents thundering herd
- **Connection pooling**: Sessions reused efficiently
- **Lazy loading**: Tools imported dynamically

## Future Enhancements

Potential areas for further improvement:
1. WebSocket-based communication for real-time updates
2. Screenshot diff regression detection
3. Automated visual regression testing
4. CI/CD integration patterns
5. Session persistence across restarts
