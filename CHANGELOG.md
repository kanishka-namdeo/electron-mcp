# Changelog

All notable changes to the Electron MCP Server project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-02-27

### Added
- Enhanced CDP connection utilities with retry logic and IPv6/IPv4 fallback
- Advanced CDP tools for network emulation, geolocation, and device metrics
- Connection health monitoring with configurable intervals
- Enhanced error handling with categorized error types and automatic classification
- Improved session management with browser type tracking
- Strict input validation with UUID, range, and type validation
- 10 new advanced CDP tools:
  - `get_protocol_info` - Get CDP protocol version and browser info
  - `emulate_network_conditions` - Emulate slow/offline network
  - `reset_network_conditions` - Reset to default network settings
  - `set_geolocation` - Override geolocation
  - `clear_geolocation` - Remove geolocation override
  - `set_device_metrics` - Emulate mobile device
  - `get_console_messages` - Capture console logs
  - `get_performance_metrics` - Get performance metrics
  - `clear_browser_cache` - Clear cache and cookies
  - `get_user_agent` - Get current user agent
- Published package to npm: https://www.npmjs.com/package/@kanishka-namdeo/electron-mcp-server

### Changed
- Updated session manager to use existing pages when connecting via CDP
- Improved CDP connection resilience with exponential backoff retry
- Enhanced error classification with automatic categorization
- Updated documentation with npm installation instructions

### Fixed
- Fixed CDP connection issue in session manager to use existing pages
- Fixed E2E helper response handling to properly parse and return tool results

## [1.0.0] - 2026-02-20

### Added
- Initial release of Electron MCP Server
- MCP server implementation for testing Electron applications using Playwright
- Support for launching and managing Electron applications programmatically
- CDP connection to running Electron apps via Chrome DevTools Protocol
- Element interaction tools: click, fill, select, and interact with UI elements
- Navigation tools for managing page state
- Window management tools for controlling Electron main windows
- Main process access for executing scripts in the Electron main process
- Visual testing with screenshots and baseline comparison
- Accessibility testing with accessibility tree retrieval
- Session management with multiple concurrent test sessions and UUID tracking
- Comprehensive test suite including unit, integration, E2E, and compliance tests
- Test application for validating MCP server functionality
- Full documentation including README, testing guide, and API specifications

### Features
- **App Lifecycle**: Launch and manage Electron applications programmatically
- **CDP Connection**: Connect to running Electron apps via Chrome DevTools Protocol
- **Element Interaction**: Click, fill, select, and interact with UI elements
- **Navigation**: Navigate to URLs and manage page state
- **Window Management**: Control Electron main windows (focus, minimize, maximize)
- **Main Process Access**: Execute scripts in the Electron main process
- **Visual Testing**: Capture screenshots and compare against baselines
- **Accessibility Testing**: Retrieve accessibility tree information
- **Session Management**: Multiple concurrent test sessions with UUID tracking

### Tools (34 Total)
- `launch_electron_app` - Launch an Electron application
- `connect_to_electron_cdp` - Connect to running Electron app via CDP
- `close_session` - Close a test session
- `list_sessions` - List all active sessions
- `navigate` - Navigate to a URL
- `click` - Click on an element
- `fill` - Fill an input field with text
- `select` - Select an option from a dropdown
- `get_text` - Get text content of an element
- `screenshot` / `take_screenshot` - Take screenshot
- `wait_for_selector` - Wait for an element to appear
- `execute` - Execute JavaScript in the renderer process
- `get_page_info` - Get page URL and title
- `execute_main_process_script` - Execute in main process
- `get_main_window_info` - Get window information
- `focus_main_window` - Focus the main window
- `minimize_main_window` - Minimize the main window
- `maximize_main_window` - Maximize the main window
- `capture_element_screenshot` - Screenshot a specific element
- `compare_screenshots` - Compare screenshots
- `get_viewport_size` - Get current viewport dimensions
- `set_viewport_size` - Set viewport dimensions
- `get_accessibility_tree` - Retrieve accessibility tree
- `get_protocol_info` - Get CDP protocol information
- `emulate_network_conditions` - Emulate network conditions
- `reset_network_conditions` - Reset network settings
- `set_geolocation` - Set geolocation override
- `clear_geolocation` - Clear geolocation override
- `set_device_metrics` - Emulate device metrics
- `get_console_messages` - Capture console messages
- `get_performance_metrics` - Get performance metrics
- `clear_browser_cache` - Clear browser cache
- `get_user_agent` - Get user agent string
