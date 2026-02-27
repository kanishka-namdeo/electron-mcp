# Infrastructure and Deployment Documentation

## Overview

This document provides comprehensive infrastructure and deployment strategy for the MCP server for Electron app testing. It covers local development setup, CI/CD integration, Docker deployment, cloud deployment options, monitoring and logging strategy, and operational procedures.

**Deployment Models**:
- **Local Development**: Direct execution for AI tool integration
- **CI/CD**: Automated testing and deployment
- **Docker**: Containerized deployment for consistency
- **Cloud**: Remote deployment for team access

## Local Development Setup

### Prerequisites

#### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **OS**: Windows 10+, macOS 12+, or Linux (Ubuntu 20.04+)
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Disk**: Minimum 2GB free space
- **Playwright Browsers**: Chromium installed (via `npx playwright install chromium`)

### Installation Steps

#### 1. Clone Repository
```bash
git clone https://github.com/your-org/electron-mcp-server.git
cd electron-mcp-server
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Install Playwright Browsers
```bash
npx playwright install chromium
```

#### 4. Build Project
```bash
npm run build
```

#### 5. Run Server
```bash
npm start
```

### Configuration

#### Environment Variables

Create `.env` file in project root:

```env
# Logging
LOG_LEVEL=info

# Transport
TRANSPORT=stdio

# Session Management
MAX_SESSIONS=10
MAX_SESSION_DURATION=3600000
MAX_INACTIVITY=1800000

# Path Whitelisting (comma-separated)
ALLOWED_DIRECTORIES=/Users/username/projects,/Users/username/electron-apps

# Playwright
PLAYWRIGHT_BROWSERS_PATH=/path/to/playwright-browsers
```

#### TypeScript Configuration

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### AI Tool Integration

#### Cursor Configuration

Create or update `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "electron-test": {
      "command": "node",
      "args": ["/absolute/path/to/electron-mcp-server/dist/index.js"],
      "env": {
        "LOG_LEVEL": "info",
        "ALLOWED_DIRECTORIES": "/Users/username/projects"
      }
    }
  }
}
```

#### Claude Code Configuration

Create or update `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "electron-test": {
      "command": "node",
      "args": ["/absolute/path/to/electron-mcp-server/dist/index.js"],
      "disabled": false
    }
  }
}
```

#### VS Code Copilot Configuration

Create or update `.vscode/settings.json`:

```json
{
  "github.copilot.mcpServers": {
    "electron-test": {
      "url": "http://localhost:3000/mcp",
      "transport": "http-streamable",
      "headers": {
        "Authorization": "Bearer ${MCP_API_KEY}"
      }
    }
  }
}
```

### Development Workflow

#### Typical Development Cycle

1. **Make Code Changes**
   ```bash
   # Edit source files
   code src/tools/launch-electron-app.ts
   ```

2. **Run Linting**
   ```bash
   npm run lint
   ```

3. **Run Type Checking**
   ```bash
   npm run typecheck
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

5. **Build Project**
   ```bash
   npm run build
   ```

6. **Test with AI Tool**
   - Restart AI tool (Cursor, Claude Code)
   - Verify MCP server connection
   - Test tool invocation

#### Debugging

**Enable Debug Logging**:
```env
LOG_LEVEL=debug
```

**Attach Debugger**:
```bash
node --inspect-brk dist/index.js
```

**View Logs**:
```bash
# View in real-time
tail -f ~/playwright-electron-mcp-server.log

# View last 100 lines
tail -n 100 ~/playwright-electron-mcp-server.log
```

## CI/CD Integration

### GitHub Actions

#### Workflow Configuration

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
        node-version: [18, 20]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
        if: matrix.os == 'ubuntu-latest'

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run typecheck

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration
        if: matrix.node-version == '20'

      - name: Run E2E tests
        run: npm run test:e2e
        if: matrix.os == 'ubuntu-latest' && matrix.node-version == '20'

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
```

#### Release Workflow

`.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Run tests
        run: npm test

      - name: Publish to npm
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Create GitHub Release
        uses: actions/create-release@v1
        with:
          tag_name: ${{ github.ref_name }}
          release_name: ${{ github.ref_name }}
          body: |
            ## Changes in this Release
            - See CHANGELOG.md for details
          draft: false
          prerelease: false
```

### GitLab CI

`.gitlab-ci.yml`:

```yaml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "20"

test:
  stage: test
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npx playwright install --with-deps chromium
    - npm run lint
    - npm run typecheck
    - npm run test:unit
    - npm run test:integration
  coverage: '/Statements\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        path: coverage/lcov.info
        type: coverage

build:
  stage: build
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
  only:
    - main
    - develop

deploy:
  stage: deploy
  image: node:${NODE_VERSION}
  script:
    - npm publish
  only:
    - tags
```

### Jenkins Pipeline

`Jenkinsfile`:

```groovy
pipeline {
  agent any

  tools {
    nodejs 'Node 20'
  }

  stages {
    stage('Test') {
      parallel {
        stage('Windows') {
          agent { label 'windows' }
          steps {
            bat 'npm ci'
            bat 'npm run lint'
            bat 'npm run typecheck'
            bat 'npm run test:unit'
          }
        }
        stage('macOS') {
          agent { label 'macos' }
          steps {
            sh 'npm ci'
            sh 'npm run lint'
            sh 'npm run typecheck'
            sh 'npm run test:unit'
          }
        }
        stage('Linux') {
          agent { label 'linux' }
          steps {
            sh 'npm ci'
            sh 'npm run lint'
            sh 'npm run typecheck'
            sh 'npm run test:unit'
          }
        }
      }
    }
    stage('Build') {
      agent { label 'linux' }
      steps {
        sh 'npm ci'
        sh 'npm run build'
        archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
      }
    }
    stage('Deploy') {
      agent { label 'linux' }
      when {
        tag '*'
      }
      steps {
        sh 'npm publish'
      }
    }
  }
}
```

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY package-lock.json ./

RUN npm ci --only=production

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

ENV LOG_LEVEL=info
ENV MAX_SESSIONS=10
ENV MAX_SESSION_DURATION=3600000
ENV MAX_INACTIVITY=1800000

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### Docker Compose

`docker-compose.yml`:

```yaml
version: '3.8'

services:
  electron-mcp:
    build: .
    container_name: electron-mcp-server
    ports:
      - "3000:3000"
    environment:
      - LOG_LEVEL=info
      - MAX_SESSIONS=10
      - MAX_SESSION_DURATION=3600000
      - MAX_INACTIVITY=1800000
      - ALLOWED_DIRECTORIES=/workspace
    volumes:
      - ./workspace:/workspace:ro
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').createServer((req, res) => res.writeHead(200).end()).listen(3000).close()"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Build and Run

#### Build Image
```bash
docker build -t electron-mcp-server:latest .
```

#### Run Container
```bash
docker run -d \
  --name electron-mcp \
  -p 3000:3000 \
  -e LOG_LEVEL=info \
  -e MAX_SESSIONS=10 \
  -v /path/to/projects:/workspace:ro \
  electron-mcp-server:latest
```

#### Run with Docker Compose
```bash
docker-compose up -d
```

#### View Logs
```bash
docker logs -f electron-mcp

# Or with Docker Compose
docker-compose logs -f
```

#### Stop Container
```bash
docker stop electron-mcp
docker rm electron-mcp
```

## Cloud Deployment

### Deployment Options

#### Option 1: Self-Hosted (Recommended)

**Platform**: VPS (DigitalOcean, AWS EC2, Linode, etc.)
**Pros**:
- Full control over environment
- No recurring costs (beyond VPS)
- Data privacy (no third-party access)
- Custom configuration

**Cons**:
- Requires system administration
- Manual scaling and updates
- Responsible for backups

**Requirements**:
- 2 vCPU, 4GB RAM minimum
- 40GB SSD storage minimum
- Ubuntu 20.04+ or Debian 11+
- Node.js 18+
- Docker (optional but recommended)

**Steps**:
1. Provision VPS with Ubuntu 20.04+
2. SSH into server
3. Install Docker: `curl -fsSL https://get.docker.com | sh`
4. Clone repository: `git clone https://github.com/your-org/electron-mcp-server.git`
5. Create `.env` file with configuration
6. Run with Docker: `docker-compose up -d`
7. Configure reverse proxy (Nginx) for HTTPS
8. Set up SSL certificate (Let's Encrypt)

#### Option 2: Managed Service (Post-MVP)

**Platform**: Render, Railway, Fly.io, etc.
**Pros**:
- Zero configuration
- Automatic scaling
- Managed updates and security
- Built-in monitoring

**Cons**:
- Recurring costs
- Less control over environment
- Vendor lock-in

**Recommended Platforms**:
- **Render**: Good for HTTP transport
- **Railway**: Simple deployment, good for stdio via tunnel
- **Fly.io**: Global deployment, good for multi-region access

#### Option 3: Kubernetes (Enterprise)

**Platform**: AKS, EKS, GKE
**Pros**:
- Auto-scaling
- High availability
- Multi-region deployment

**Cons**:
- Complex setup
- Higher cost
- Requires Kubernetes expertise

**Requirements**:
- Kubernetes cluster (AKS/EKS/GKE)
- Container registry (ACR/ECR/GCR)
- Ingress controller
- Load balancer

### Reverse Proxy Configuration

#### Nginx Configuration

```nginx
server {
  listen 80;
  server_name your-domain.com;

  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 86400;
  }
}

server {
  listen 443 ssl http2;
  server_name your-domain.com;

  ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;

  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 86400;
  }
}
```

## Monitoring and Logging

### Logging Strategy

#### Log Levels

| Level | Description | Use Case |
|-------|-------------|-----------|
| **debug** | Detailed information for debugging | Development |
| **info** | General informational messages | Production |
| **warn** | Warning messages for potential issues | Production |
| **error** | Error messages with stack traces | Production |

#### Log Structure

```typescript
interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  tool?: string;
  sessionId?: string;
  windowId?: string;
  error?: string;
  stack?: string;
  context?: Record<string, unknown>;
  memoryUsage?: {
    heapUsed: number;
    external: number;
    rss: number;
  };
  duration?: number;
}
```

#### Pino Configuration

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    }
  },
  redact: {
    paths: ['input.value', 'input.password', 'input.token'],
    remove: true
  },
  serializers: {
    error: pino.stdSerializers.err
  },
  timestamp: pino.stdTimeFunctions.isoTime
});
```

### Metrics Collection

#### Key Metrics

| Metric | Type | Description | Threshold |
|--------|------|-------------|------------|
| **Active Sessions** | Gauge | Number of active sessions | < 10 |
| **Tool Execution Time** | Histogram | Tool execution latency | < 1s (p95) |
| **Error Rate** | Counter | Number of errors per minute | < 1/min |
| **Memory Usage** | Gauge | Process memory usage | < 2GB |
| **CPU Usage** | Gauge | Process CPU usage | < 80% |

#### Prometheus Integration

```typescript
import { Registry, collectDefaultMetrics } from 'prom-client';

const register = new Registry();

const activeSessions = new Gauge({
  name: 'electron_mcp_active_sessions',
  help: 'Number of active sessions',
  registers: [register]
});

const toolExecutionTime = new Histogram({
  name: 'electron_mcp_tool_execution_time_seconds',
  help: 'Tool execution time in seconds',
  labelNames: ['tool_name'],
  buckets: [0.1, 0.5, 1, 5, 10],
  registers: [register]
});

const errorCount = new Counter({
  name: 'electron_mcp_errors_total',
  help: 'Total number of errors',
  labelNames: ['error_code', 'tool_name'],
  registers: [register]
});

collectDefaultMetrics();
```

### Monitoring Tools

#### Option 1: Grafana + Prometheus
**Setup**:
1. Install Prometheus: `docker run -p 9090:9090 prom/prometheus`
2. Install Grafana: `docker run -p 3000:3000 grafana/grafana`
3. Configure Prometheus to scrape metrics
4. Create Grafana dashboards

#### Option 2: Datadog
**Setup**:
1. Install Datadog Agent
2. Configure custom metrics
3. Set up alerts and dashboards

#### Option 3: CloudWatch (AWS)
**Setup**:
1. Install CloudWatch Agent
2. Configure custom metrics
3. Set up alarms and dashboards

### Alerting

#### Alert Rules

| Alert | Condition | Severity | Action |
|-------|-------------|-----------|----------|
| **High Error Rate** | Errors > 10/min for 5 minutes | Critical | Notify team, investigate |
| **Session Limit** | Active sessions = 10 | Warning | Monitor resource usage |
| **High Memory** | Memory > 2GB for 5 minutes | Warning | Check for memory leaks |
| **High CPU** | CPU > 90% for 5 minutes | Warning | Check for infinite loops |
| **Service Down** | No metrics for 1 minute | Critical | Restart service |

#### Alert Channels

- **Slack**: Webhook to Slack channel
- **Email**: SMTP alerts to team
- **PagerDuty**: Critical alerts escalate to on-call
- **SMS**: Critical alerts to on-call engineer

## Operational Procedures

### Startup Procedure

1. **Verify Prerequisites**
   - Check Node.js version: `node --version` (should be >= 18)
   - Check disk space: `df -h` (should have >= 2GB free)
   - Check memory: `free -h` (should have >= 4GB available)

2. **Start Service**
   - Local: `npm start`
   - Docker: `docker-compose up -d`
   - Cloud: Use service panel or `systemctl start electron-mcp`

3. **Verify Startup**
   - Check logs: `tail -f ~/playwright-electron-mcp-server.log`
   - Verify health endpoint: `curl http://localhost:3000/health`
   - Check metrics: Verify metrics are being collected

4. **Test Integration**
   - Restart AI tool (Cursor, Claude Code)
   - Verify MCP server connection
   - Test tool invocation

### Shutdown Procedure

1. **Graceful Shutdown**
   - Allow active sessions to complete (timeout: 30s)
   - Close all sessions: Send close signal to session manager
   - Stop accepting new requests

2. **Cleanup**
   - Close all Electron apps
   - Release all resources
   - Flush logs

3. **Stop Service**
   - Local: Ctrl+C or send SIGTERM
   - Docker: `docker-compose down`
   - Cloud: Use service panel or `systemctl stop electron-mcp`

4. **Verify Shutdown**
   - Check process is stopped: `ps aux | grep node`
   - Verify ports are released: `netstat -tuln | grep 3000`

### Backup Procedure

1. **Configuration Backup**
   - Backup `.env` file
   - Backup configuration files

2. **Log Backup**
   - Archive log files
   - Compress and store in backup location

3. **Session Data**
   - N/A (no session persistence in MVP)

### Recovery Procedure

1. **Service Recovery**
   - Check logs for error
   - Restart service if crash detected
   - Verify startup logs for errors

2. **Configuration Recovery**
   - Restore `.env` file from backup
   - Verify configuration is correct

3. **Data Recovery**
   - N/A (no data persistence in MVP)

### Update Procedure

1. **Prepare Update**
   - Backup current version
   - Review changelog
   - Test update in staging

2. **Deploy Update**
   - Stop service gracefully
   - Deploy new version
   - Verify startup logs

3. **Post-Update Verification**
   - Run smoke tests
   - Verify all tools working
   - Monitor metrics for anomalies

### Scaling Strategy

#### Horizontal Scaling

**HTTP Transport (Post-MVP)**:
- Deploy multiple instances behind load balancer
- Use sticky sessions for session affinity
- Auto-scale based on active session count

**Load Balancer Configuration** (Nginx):

```nginx
upstream electron_mcp_servers {
  least_conn;
  server 10.0.0.1:3000;
  server 10.0.0.2:3000;
  server 10.0.0.3:3000;
}

server {
  listen 443 ssl http2;

  location / {
    proxy_pass http://electron_mcp_servers;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

#### Vertical Scaling

- Increase CPU/RAM resources on single instance
- Increase session limits in configuration
- Monitor resource usage for bottlenecks

## Maintenance Procedures

### Daily Tasks

- [ ] Review error logs for critical issues
- [ ] Check disk space usage
- [ ] Verify metrics collection

### Weekly Tasks

- [ ] Review and rotate log files
- [ ] Check for security updates (npm audit)
- [ ] Review session usage patterns

### Monthly Tasks

- [ ] Review and update dependencies
- [ ] Run security vulnerability scan
- [ ] Review and update documentation
- [ ] Review backup procedures

### Quarterly Tasks

- [ ] Performance audit and optimization
- [ ] Disaster recovery drill
- [ ] Security audit and penetration testing
- [ ] Architecture review and improvements

## Configuration Management

### Environment-Specific Configuration

#### Development
```env
LOG_LEVEL=debug
MAX_SESSIONS=5
ALLOWED_DIRECTORIES=/Users/username/projects
```

#### Staging
```env
LOG_LEVEL=info
MAX_SESSIONS=10
ALLOWED_DIRECTORIES=/staging/projects
```

#### Production
```env
LOG_LEVEL=info
MAX_SESSIONS=10
ALLOWED_DIRECTORIES=/production/projects
```

### Configuration Validation

```typescript
import { z } from 'zod';

const ConfigSchema = z.object({
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  maxSessions: z.number().int().min(1).max(100).default(10),
  maxSessionDuration: z.number().int().min(60000).max(86400000).default(3600000),
  maxInactivityDuration: z.number().int().min(30000).max(86400000).default(1800000),
  allowedDirectories: z.array(z.string()).min(1).default([]),
  transport: z.enum(['stdio', 'http']).default('stdio')
});

function validateConfig(env: Record<string, string | undefined>) {
  const config = ConfigSchema.parse({
    logLevel: env.LOG_LEVEL,
    maxSessions: parseInt(env.MAX_SESSIONS || '10'),
    maxSessionDuration: parseInt(env.MAX_SESSION_DURATION || '3600000'),
    maxInactivityDuration: parseInt(env.MAX_INACTIVITY || '1800000'),
    allowedDirectories: env.ALLOWED_DIRECTORIES?.split(',') || [],
    transport: env.TRANSPORT
  });

  return config;
}
```

## Troubleshooting

### Common Issues

#### Issue 1: MCP Server Not Connecting
**Symptoms**: AI tool cannot connect to MCP server
**Diagnosis**:
1. Check if server is running: `ps aux | grep node`
2. Check logs for errors
3. Verify AI tool configuration

**Resolution**:
- Restart MCP server
- Verify AI tool configuration file
- Check firewall rules

#### Issue 2: Electron App Not Launching
**Symptoms**: `launch_electron_app` tool fails
**Diagnosis**:
1. Check executable path is correct
2. Check path is in allowed directories
3. Check Electron app is built

**Resolution**:
- Verify path in `ALLOWED_DIRECTORIES`
- Build Electron app if needed
- Check Electron app logs

#### Issue 3: Session Timeout
**Symptoms**: Session closes unexpectedly
**Diagnosis**:
1. Check session timeout configuration
2. Check for inactivity timeout
3. Check app crash logs

**Resolution**:
- Increase timeout in configuration
- Add activity tracking for long operations
- Fix app crash

#### Issue 4: High Memory Usage
**Symptoms**: Process memory grows unbounded
**Diagnosis**:
1. Check metrics for memory growth
2. Check for session cleanup
3. Check for memory leaks in code

**Resolution**:
- Verify session cleanup is working
- Reduce session limit
- Profile code for memory leaks

### Debug Commands

```bash
# Check process status
ps aux | grep "node.*dist/index.js"

# Check port usage
netstat -tuln | grep 3000

# Check disk space
df -h

# Check memory usage
free -h

# View recent errors
grep -i "error" ~/playwright-electron-mcp-server.log | tail -20

# View session activity
grep "session" ~/playwright-electron-mcp-server.log | tail -20
```

## Conclusion

The infrastructure and deployment strategy provides multiple deployment options from local development to cloud deployment. Key recommendations:

1. **Local Development**: Use stdio transport for Cursor/Claude Code integration
2. **CI/CD**: Implement GitHub Actions for automated testing and deployment
3. **Docker**: Use Docker for consistent deployment across environments
4. **Cloud**: Self-hosted VPS recommended for production (post-MVP)
5. **Monitoring**: Implement Prometheus + Grafana for comprehensive observability
6. **Alerting**: Set up alerts for error rate, resource usage, and service availability

**Next Steps**:
1. Implement CI/CD pipeline with GitHub Actions
2. Create Dockerfile for containerized deployment
3. Set up monitoring and alerting
4. Document deployment procedures for production
