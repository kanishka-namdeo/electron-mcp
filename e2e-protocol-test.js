/**
 * End-to-End Protocol Test for Electron MCP Server
 * Tests the actual MCP protocol communication
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const MCP_SERVER_PATH = join(__dirname, 'dist', 'index.js');
const TEST_RESULTS_FILE = join(__dirname, 'e2e-protocol-test-results.json');

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
    testResults.summary.failed++;
    log(`✗ Test failed: ${name} - ${error.message}`, 'ERROR');
  }
  
  testResult.endTime = new Date().toISOString();
  testResult.duration = new Date(testResult.endTime) - new Date(testResult.startTime);
  testResults.tests.push(testResult);
}

// Test 1: Initialize MCP Server Process
async function testInitializeMCPServer() {
  log('Initializing MCP server process...');
  
  return new Promise((resolve, reject) => {
    // Start the MCP server
    const proc = spawn('node', [MCP_SERVER_PATH], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, LOG_LEVEL: 'debug', NODE_ENV: 'test' }
    });
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    // Send MCP initialize request
    setTimeout(() => {
      const initRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'e2e-test', version: '1.0.0' }
        }
      };
      
      proc.stdin.write(JSON.stringify(initRequest) + '\n');
    }, 1000);
    
    // Wait for response
    setTimeout(() => {
      try {
        proc.kill();
        
        // Check for valid JSON-RPC response
        const lines = stdout.split('\n').filter(l => l.trim());
        let foundResponse = false;
        
        for (const line of lines) {
          try {
            const response = JSON.parse(line);
            if (response.jsonrpc === '2.0' && response.id === 1) {
              foundResponse = true;
              break;
            }
          } catch (e) {
            // Not JSON, skip
          }
        }
        
        if (foundResponse) {
          resolve({ stdout: stdout.substring(0, 500), stderr: stderr.substring(0, 500) });
        } else {
          reject(new Error(`No valid JSON-RPC response found. stdout: ${stdout.substring(0, 500)}, stderr: ${stderr.substring(0, 500)}`));
        }
      } catch (error) {
        proc.kill();
        reject(error);
      }
    }, 5000);
    
    proc.on('error', (error) => {
      reject(new Error(`Failed to start MCP server: ${error.message}`));
    });
  });
}

// Test 2: Tools List Request
async function testToolsList() {
  log('Testing tools/list request...');
  
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [MCP_SERVER_PATH], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, LOG_LEVEL: 'error' }
    });
    
    let stdout = '';
    
    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    // Send initialize first
    setTimeout(() => {
      const initRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'e2e-test', version: '1.0.0' }
        }
      };
      proc.stdin.write(JSON.stringify(initRequest) + '\n');
    }, 500);
    
    // Send tools/list request
    setTimeout(() => {
      const toolsRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      };
      proc.stdin.write(JSON.stringify(toolsRequest) + '\n');
    }, 1500);
    
    // Check response
    setTimeout(() => {
      proc.kill();
      
      const lines = stdout.split('\n').filter(l => l.trim());
      let toolsResponse = null;
      
      for (const line of lines) {
        try {
          const response = JSON.parse(line);
          if (response.jsonrpc === '2.0' && response.id === 2 && response.result) {
            toolsResponse = response.result;
            break;
          }
        } catch (e) {
          // Not JSON
        }
      }
      
      if (toolsResponse && toolsResponse.tools && Array.isArray(toolsResponse.tools)) {
        const toolCount = toolsResponse.tools.length;
        const toolNames = toolsResponse.tools.map(t => t.name).slice(0, 10);
        
        if (toolCount > 0) {
          resolve({ 
            toolCount, 
            sampleTools: toolNames,
            allTools: toolsResponse.tools.map(t => ({ name: t.name, description: t.description?.substring(0, 50) }))
          });
        } else {
          reject(new Error('Tools list is empty'));
        }
      } else {
        reject(new Error(`Invalid tools response. stdout: ${stdout.substring(0, 1000)}`));
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
  
  await runTest('Initialize MCP Server', testInitializeMCPServer);
  await runTest('Tools List Request', testToolsList);
  
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
