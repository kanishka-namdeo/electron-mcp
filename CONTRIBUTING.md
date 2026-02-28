# Contributing to Electron MCP Server

Thank you for your interest in contributing to Electron MCP Server!

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/kanishka-namdeo/electron-mcp-server.git
   cd electron-mcp-server
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

## Running Tests

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## Code Style

This project uses ESLint for code linting:

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

## Type Checking

Ensure TypeScript types are correct:

```bash
npm run typecheck
```

## Project Structure

```
src/
├── core/                 # Core utilities (errors, logging, CDP)
├── session/              # Session management
├── tools/
│   ├── handlers/          # Tool handler implementations
│   └── tools.ts         # Tool definitions and schemas
└── index.ts              # Main entry point

tests/
├── core/                # Core unit tests
├── session/             # Session management tests
├── tools/               # Tool handler tests
├── integration/          # Integration tests
├── e2e/                # End-to-end tests
└── compliance/           # MCP protocol compliance tests
```

## Adding a New Tool

1. **Define Input Schema** in `src/tools/validation-enhanced.ts`:
   ```typescript
   export const NewToolSchema = z.object({
     sessionId: z.string().uuid('Invalid session ID'),
     param1: z.string(),
     param2: z.number().optional(),
   });
   ```

2. **Implement Handler** in appropriate handler file:
   ```typescript
   async newToolMethod(params: z.infer<typeof NewToolSchema>) {
     // Implementation
     return { success: true, data };
   }
   ```

3. **Register Tool** in `src/index.ts`:
   ```typescript
   case 'new_tool':
     return {
       content: [{
         type: 'text',
         text: JSON.stringify(await handler.newToolMethod(args), null, 2)
       }]
     };
   ```

4. **Add Tool Definition** in `src/tools/tools.ts`:
   ```typescript
   {
     name: 'new_tool',
     description: 'Tool description',
     inputSchema: zodToJsonSchema(NewToolSchema),
   }
   ```

5. **Write Tests** in appropriate test file

6. **Update Documentation** in README.md

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat(accessibility): add accessibility snapshot tool
fix(session): resolve session cleanup race condition
docs(readme): update installation instructions
```

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write tests for new functionality
   - Ensure all tests pass
   - Run linting and type checking

3. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Submit a Pull Request** on GitHub with:
   - Clear description of changes
   - Reference any related issues
   - Screenshots for UI changes (if applicable)

## Testing Guidelines

- **Unit Tests**: Test individual functions in isolation
- **Integration Tests**: Test handler integration with session manager
- **E2E Tests**: Test full workflows
- **Coverage**: Aim for >80% coverage

## Release Process

Releases are handled by maintainers. See CHANGELOG.md for version history.

## Getting Help

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Provide reproduction steps for bugs

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
