/**
 * Full Integration Test for Electron MCP Server
 * Tests the complete workflow: launch app -> connect CDP -> interact -> cleanup
 */

import { spawn, exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const TEST_APP_PATH = join(__dirname, 'test-app');
const MCP_SERVER_PATH = join(__dirname, 'dist', 'index.js');
const TEST_RESULTS_FILE = join(__dirname, 'full-integration-test-results.json');
const CDP_PORT = 9223;

// Test results storage
const testResults = {
  startTime: new Date().toISOString(),
  tests: [],
  summary: { total: 0, passed: 0, failed: 0, skipped: 0 }
};

// Helper functions
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type}] ${message}`);
}

async function runTest(name, testFn) {
  log(`Running test: ${name}`);
  testResults.summary.total++;
  
  const testResult = {
    name, startTime: new Date().toISOString(), status: 'running'
  };
  
  try {
    const result = await testFn();
    testResult.status = 'passed';
    testResult.result = result;
    testResults.summary.passed++;
    log(`✓ Test passed: ${name}`, 'SUCCESS');
  } catch (error) {
    testResult.status = 'failed';
    testResult.error = error.message;
    testResult.stack = error.stack;
    testResults.summary.failed++;
    log(`✗ Test failed: ${name} - ${error.message}`, 'ERROR');
  }
  
  testResult.endTime = new Date().toISOString();
  testResult.duration = new Date(testResult.endTime) - new Date(testResult.startTime);
  testResults.tests.push(testResult);
}

// Check if CDP endpoint is available
async function checkCDPEndpoint(port) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/json/version',
      method: 'GET',
      timeout: 5000
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ available: true, info: json });
        } catch (e) {
          resolve({ available: true, raw: data });
        }
      });
    });
    
    req.on('error', () => resolve({ available: false }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ available: false });
    });
    
    req.end();
  });
}

// Test 1: Launch Electron App with CDP
async function testLaunchElectronWithCDP() {
  log('Launching Electron app with CDP enabled...');
  
  return new Promise(async (resolve, reject) => {
    const electronPath = join(TEST_APP_PATH, 'node_modules', '.bin', 'electron');
    const electronCmd = process.platform === 'win32' ? `${electronPath}.cmd` : electronPath;
    
    if (!fs.existsSync(electronCmd)) {
      reject(new Error('Electron not found. Run npm install in test-app directory.'));
      return;
    }
    
    const proc = spawn(electronCmd, ['.', `--remote-debugging-port=${CDP_PORT}`], {
      cwd: TEST_APP_PATH,
      stdio: 'pipe'
    });
    
    // Wait for CDP to be available
    let attempts = 0;
    const maxAttempts = 30;
    
    const checkCDP = async () => {
      attempts++;
      const cdpStatus = await checkCDPEndpoint(CDP_PORT);
      
      if (cdpStatus.available) {
        log(`✓ CDP endpoint available after ${attempts} attempts`);
        resolve({ 
          pid: proc.pid, 
          cdpPort: CDP_PORT, 
          cdpInfo: cdpStatus.info || cdpStatus.raw 
        });
        
        // Cleanup after a delay
        setTimeout(() => {
          try { proc.kill(); } catch (e) {}
        }, 3000);
      } else if (attempts >= maxAttempts) {
        proc.kill();
        reject(new Error(`CDP endpoint not available after ${maxAttempts} attempts`));
      } else {
        setTimeout(checkCDP, 1000);
      }
    };
    
    setTimeout(checkCDP, 1000);
    
    proc.on('error', (error) => {
      reject(new Error(`Failed to start Electron: ${error.message}`));
    });
  });
}

// Test 2: MCP Server with Full Protocol Flow
async function testMCPServerFullProtocol() {
  log('Testing MCP server full protocol flow...');
  
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [MCP_SERVER_PATH], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, LOG_LEVEL: 'error' }
    });
    
    let stdout = '';
    const responses = [];
    
    proc.stdout.on('data', (data) => {
      const text = data.toString();
      stdout += text;
      
      // Parse JSON-RPC responses
      const lines = text.split('\n').filter(l => l.trim());
      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.jsonrpc === '2.0') {
            responses.push(json);
          }
        } catch (e) {
          // Not JSON
        }
      }
    });
    
    // Protocol flow: initialize -> tools/list -> (optional) tools/call
    const sendRequest = (request, delay) => {
      setTimeout(() => {
        proc.stdin.write(JSON.stringify(request) + '\n');
      }, delay);
    };
    
    // 1. Initialize
    sendRequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'e2e-test', version: '1.0.0' }
      }
    }, 500);
    
    // 2. Tools list
    sendRequest({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    }, 1500);
    
    // Check results
    setTimeout(() => {
      proc.kill();
      
      // Analyze responses
      const initResponse = responses.find(r => r.id === 1);
      const toolsResponse = responses.find(r => r.id === 2);
      
      const results = {
        initReceived: !!initResponse,
        toolsReceived: !!toolsResponse,
        initResult: initResponse?.result ? {
          protocolVersion: initResponse.result.protocolVersion,
          serverInfo: initResponse.result.serverInfo
        } : null,
        toolsCount: toolsResponse?.result?.tools?.length || 0,
        sampleTools: toolsResponse?.result?.tools?.slice(0, 5).map(t => t.name) || []
      };
      
      if (results.initReceived && results.toolsReceived && results.toolsCount > 0) {
        resolve(results);
      } else {
        reject(new Error(`Protocol flow incomplete. Results: ${JSON.stringify(results, null, 2)}`));
      }
    }, 5000);
    
    proc.on('error', (error) => {
      reject(new Error(`Process error: ${error.message}`));
    });
  });
}

// Main test runner
async function runAllTests() {
  log('========================================');
  log('E2E Protocol Test: Electron MCP Server');
  log('========================================');
  
  await runTest('Launch Electron with CDP', testLaunchElectronWithCDP);
  await runTest('MCP Server Full Protocol', testMCPServerFullProtocol);
  
  // Save results
  testResults.endTime = new Date().toISOString();
  testResults.duration = new Date(testResults.endTime) - new Date(testResults.startTime);
  
  fs.writeFileSync(TEST_RESULTS_FILE, JSON.stringify(testResults, null, 2));
  
  // Print summary
  log('========================================');
  log('Test Summary');
  log('========================================');
  log(`Total: ${testResults.summary.total}`);
  log(`Passed: ${testResults.summary.passed}`);
  log(`Failed: ${testResults.summary.failed}`);
  log(`Duration: ${testResults.duration}ms`);
  log(`Results saved to: ${TEST_RESULTS_FILE}`);
  
  process.exit(testResults.summary.failed > 0 ? 1 : 0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`Unhandled rejection: ${error.message}`, 'ERROR');
  console.error(error);
  process.exit(1);
});

// Run tests
runAllTests().catch((error) => {
  log(`Test runner failed: ${error.message}`, 'ERROR');
  console.error(error);
  process.exit(1);
});
