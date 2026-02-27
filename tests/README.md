# Electron MCP Server - Test Suite

This directory contains comprehensive test infrastructure for the Electron MCP server.

## Test Structure

```
tests/
├── e2e/                          # End-to-end tests
│   ├── e2e-helper.ts             # E2E test utilities
│   ├── setup.ts                   # Test environment setup
│   ├── mcp-server.e2e.test.ts   # MCP server E2E tests
│   └── test-app.integration.test.ts # Test app integration tests
├── integration/                    # Integration tests
│   └── handlers/                 # Handler-specific integration tests
│       ├── app-lifecycle.integration.test.ts
│       └── element-interaction.integration.test.ts
├── compliance/                    # MCP protocol compliance tests
│   └── mcp-protocol.compliance.test.ts
├── unit/                          # Unit tests (existing)
│   ├── core/
│   ├── session/
│   └── tools/
├── utils/                         # Test utilities and helpers
│   └── test-helpers.ts
└── fixtures/                      # Test fixtures and data
    ├── basic.html
    ├── form.html
    ├── dynamic.html
    └── accessibility.html
```

## Test Categories

### 1. Unit Tests
Test individual components in isolation without external dependencies.

**Location:** `tests/unit/`

**Running:**
```bash
npm run test:unit
```

**Coverage:**
- Error handling classes
- Session management
- Validation schemas

### 2. Integration Tests
Test interaction between multiple components with mocked dependencies.

**Location:** `tests/integration/`

**Running:**
```bash
npm run test:integration
```

**Coverage:**
- App lifecycle handler
- Element interaction handler
- Main process handler
- Visual testing handler

### 3. E2E Tests
Test the complete MCP server with real Electron application.

**Location:** `tests/e2e/`

**Prerequisites:**
1. Built MCP server: `npm run build`
2. Test app available: `test-app/` directory

**Running:**
```bash
npm run test:e2e
```

**Coverage:**
- MCP server initialization
- Tool registration and discovery
- Real Electron app interaction
- Session management
- Visual testing workflows
- Error handling and recovery

### 4. Protocol Compliance Tests
Verify MCP specification compliance.

**Location:** `tests/compliance/`

**Running:**
```bash
npm run test:compliance
```

**Coverage:**
- JSON-RPC 2.0 specification
- MCP server capabilities
- Tool definition standards
- Error response formats
- Security considerations

## Test Fixtures

Test fixtures provide reusable HTML pages for testing various scenarios:

- **basic.html**: Basic UI elements (buttons, inputs, selects)
- **form.html**: Complex form with validation
- **dynamic.html**: Dynamic content and state changes
- **accessibility.html**: ARIA-compliant accessible elements

## Test Utilities

### E2E Test Helper

The `E2ETestHelper` class provides utilities for E2E testing:

```typescript
import { E2ETestHelper } from './e2e/e2e-helper.js';

const helper = new E2ETestHelper({
  serverPath: join(process.cwd(), 'dist', 'index.js'),
  env: { LOG_LEVEL: 'info', NODE_ENV: 'test' },
});

await helper.setup();
const sessionId = await helper.connectToCDP(9222);
await helper.callTool('navigate', { sessionId, url: 'https://example.com' });
await helper.teardown();
```

### Test Helpers

The `TestHelpers` class provides common utilities:

```typescript
import { TestHelpers } from './utils/test-helpers.js';

const sessionId = TestHelpers.generateSessionId();
const mockSession = await TestHelpers.createMockSession();
const mockPage = TestHelpers.createMockPage();
```

## Test Scripts

All available test scripts:

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

# Setup test environment
npm run test:setup

# Cleanup test environment
npm run test:cleanup
```

## E2E Test Requirements

### Prerequisites

1. **Node.js**: >= 18.0.0
2. **Built MCP server**: Run `npm run build` first
3. **Test app**: Available in `test-app/` directory

### Setup

```bash
# Install dependencies
npm install

# Build the MCP server
npm run build

# Setup test environment
npm run test:setup
```

### Cleanup

```bash
# Cleanup test environment
npm run test:cleanup
```

## Running E2E Tests

### Manual Execution

```bash
# Start test app in separate terminal
cd test-app
npm start

# In another terminal, run E2E tests
cd ..
npm run test:e2e
```

### Automated Execution

The E2E tests will automatically:
1. Start the MCP server
2. Connect to the running Electron app via CDP
3. Execute test scenarios
4. Capture screenshots for debugging
5. Clean up resources

### Debugging E2E Tests

Enable debug logging:

```bash
LOG_LEVEL=debug npm run test:e2e
```

Screenshots are saved to `tests/e2e/screenshots/` for inspection.

## Test Data

Test data and fixtures are managed in `tests/fixtures/`:

```typescript
import { TestHelpers } from './utils/test-helpers.js';

// Setup test fixtures
await TestHelpers.setupTestFixtures();

// Cleanup test fixtures
await TestHelpers.cleanupTestFixtures();
```

## Coverage Reports

Generate coverage reports:

```bash
npm run test:coverage
```

Coverage reports are generated in:
- Terminal output (text format)
- `coverage/` directory (HTML and JSON formats)

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test
      - run: npm run test:coverage
```

## Best Practices

### Writing Tests

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **Use Descriptive Names**: Test names should describe what is being tested
3. **Test One Thing**: Each test should verify a single behavior
4. **Use Test Helpers**: Leverage existing utilities to avoid duplication
5. **Clean Up**: Always clean up resources in `afterEach` hooks

### E2E Testing

1. **Test Real Workflows**: Test complete user flows, not individual actions
2. **Handle Timing**: Use proper wait strategies for dynamic content
3. **Isolate Tests**: Each test should be independent
4. **Debug with Screenshots**: Capture screenshots on failures
5. **Clean Sessions**: Always close sessions after tests

### Integration Testing

1. **Mock External Dependencies**: Use mocks for network calls, file system
2. **Test Error Paths**: Verify error handling and edge cases
3. **Test Concurrent Operations**: Verify thread-safety and race conditions
4. **Use Realistic Data**: Use production-like data in tests

## Troubleshooting

### Common Issues

**E2E Tests Timeout**
- Ensure Electron app is running with remote debugging enabled
- Check CDP port (default: 9222) is available
- Increase timeout values in test configuration

**Tests Fail on CI**
- Ensure build step runs before tests
- Check environment variables are set correctly
- Verify test fixtures are created

**Coverage is Low**
- Add tests for uncovered code paths
- Check if code is reachable in current test scenarios
- Consider adding integration tests for complex scenarios

### Debug Mode

Enable verbose logging:

```bash
LOG_LEVEL=trace npm test
```

## Contributing

When adding new tests:

1. Place tests in appropriate directory (unit/integration/e2e/compliance)
2. Use existing test utilities and helpers
3. Follow naming conventions: `*.test.ts`
4. Add test fixtures if needed
5. Update this README with new test categories

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [MCP Specification](https://modelcontextprotocol.io/specification)
- [Electron Testing Guide](https://www.electronjs.org/docs/latest/tutorial/testing)
- [Playwright Documentation](https://playwright.dev/)
