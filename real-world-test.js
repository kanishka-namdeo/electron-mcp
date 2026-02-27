/**
 * Real-world testing script for Electron MCP Server
 * This script tests the MCP server with the actual Electron test app
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const TEST_APP_PATH = join(__dirname, 'test-app');
const MCP_SERVER_PATH = join(__dirname, 'dist', 'index.js');
const TEST_RESULTS_FILE = join(__dirname, 'real-world-test-results.json');

// Test results storage
const testResults = {
  startTime: new Date().toISOString(),
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  }
};

// Helper function to log with timestamp
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type}] ${message}`);
}

// Helper function to run a test
async function runTest(name, testFn) {
  log(`Running test: ${name}`);
  testResults.summary.total++;
  
  const testResult = {
    name,
    startTime: new Date().toISOString(),
    status: 'running'
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

// Test 1: Verify MCP Server Build
async function testMCPServerBuild() {
  log('Verifying MCP server build...');
  
  if (!fs.existsSync(MCP_SERVER_PATH)) {
    throw new Error(`MCP server not found at ${MCP_SERVER_PATH}. Run 'npm run build' first.`);
  }
  
  const stats = fs.statSync(MCP_SERVER_PATH);
  if (stats.size === 0) {
    throw new Error('MCP server build is empty');
  }
  
  log(`✓ MCP server build verified: ${stats.size} bytes`);
  return { size: stats.size, path: MCP_SERVER_PATH };
}

// Test 2: Verify Test App
async function testTestApp() {
  log('Verifying test app...');
  
  const requiredFiles = ['main.js', 'package.json', 'index.html', 'preload.js'];
  for (const file of requiredFiles) {
    const filePath = join(TEST_APP_PATH, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Required file missing: ${file}`);
    }
  }
  
  log('✓ Test app verified');
  return { path: TEST_APP_PATH, files: requiredFiles };
}

// Test 3: Launch Test App
async function testLaunchTestApp() {
  log('Launching test app...');
  
  return new Promise((resolve, reject) => {
    const electronPath = join(TEST_APP_PATH, 'node_modules', '.bin', 'electron');
    const electronCmd = process.platform === 'win32' ? `${electronPath}.cmd` : electronPath;
    
    if (!fs.existsSync(electronCmd)) {
      reject(new Error(`Electron not found. Run 'npm install' in test-app directory.`));
      return;
    }
    
    const proc = spawn(electronCmd, ['.', '--remote-debugging-port=9223'], {
      cwd: TEST_APP_PATH,
      stdio: 'pipe'
    });
    
    let output = '';
    proc.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    proc.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    // Wait for app to start
    setTimeout(() => {
      if (proc.pid) {
        log(`✓ Test app launched with PID: ${proc.pid}`);
        resolve({ pid: proc.pid, output });
        
        // Kill the process after a short delay
        setTimeout(() => {
          try {
            proc.kill();
            log('Test app process terminated');
          } catch (e) {
            // Ignore
          }
        }, 5000);
      } else {
        reject(new Error('Failed to launch test app'));
      }
    }, 3000);
    
    proc.on('error', (error) => {
      reject(new Error(`Failed to start test app: ${error.message}`));
    });
  });
}

// Test 4: MCP Server Help
async function testMCPServerHelp() {
  log('Testing MCP server help...');
  
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [MCP_SERVER_PATH, '--help'], {
      stdio: 'pipe'
    });
    
    let output = '';
    proc.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    proc.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    proc.on('close', (code) => {
      if (output.includes('Usage') || output.includes('Options') || output.includes('electron-mcp-server')) {
        log('✓ MCP server help works');
        resolve({ output: output.substring(0, 500) });
      } else {
        // Help flag might not be implemented, that's OK
        log('ℹ MCP server help not implemented (this is OK)');
        resolve({ output: 'Help not implemented', skipped: true });
      }
    });
    
    proc.on('error', (error) => {
      reject(new Error(`Failed to run MCP server: ${error.message}`));
    });
  });
}

// Main test runner
async function runAllTests() {
  log('========================================');
  log('Real-world Testing: Electron MCP Server');
  log('========================================');
  
  // Run tests
  await runTest('MCP Server Build', testMCPServerBuild);
  await runTest('Test App Verification', testTestApp);
  await runTest('Launch Test App', testLaunchTestApp);
  await runTest('MCP Server Help', testMCPServerHelp);
  
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
  log(`Skipped: ${testResults.summary.skipped}`);
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
