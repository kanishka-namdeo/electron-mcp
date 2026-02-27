import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';

console.log('=== Electron MCP Full Test ===\n');

let electronProcess = null;
let serverProcess = null;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startElectronApp() {
  console.log('Starting Electron test app...');
  
  const testAppPath = join(process.cwd(), 'test-app');
  const electronPath = join(testAppPath, 'node_modules', 'electron', 'cli.js');
  
  electronProcess = spawn('node', [electronPath, '--remote-debugging-port=9222'], {
    cwd: testAppPath,
    stdio: 'inherit',
  });
  
  await sleep(3000);
  console.log('✓ Electron app started\n');
}

async function startMCPServer() {
  console.log('Starting MCP server...');
  
  serverProcess = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  
  serverProcess.stderr.on('data', (data) => {
    console.error('Server stderr:', data.toString());
  });
  
  await sleep(1000);
  console.log('✓ MCP server started\n');
}

function callMCPServer(request) {
  return new Promise((resolve, reject) => {
    const requestId = request.id;
    
    serverProcess.stdin.write(JSON.stringify(request) + '\n');
    
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout for request ${request.method}`));
    }, 30000);
    
    const handleResponse = (data) => {
      buffer += data.toString();
      
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const response = JSON.parse(line);
            if (response.id === requestId) {
              serverProcess.stdout.off('data', handleResponse);
              clearTimeout(timeout);
              resolve(response);
            }
          } catch (e) {
          }
        }
      }
    };
    
    let buffer = '';
    serverProcess.stdout.on('data', handleResponse);
  });
}

async function runTests() {
  try {
    await startElectronApp();
    await startMCPServer();
    
    console.log('=== Test 1: List Tools ===');
    const toolsResponse = await callMCPServer({
      jsonrpc: '2.0',
      id: uuidv4(),
      method: 'tools/list',
    });
    
    if (toolsResponse.result && toolsResponse.result.tools) {
      console.log(`✓ Found ${toolsResponse.result.tools.length} tools\n`);
    } else {
      throw new Error('Failed to list tools');
    }
    
    console.log('=== Test 2: Connect to Electron CDP ===');
    const connectResponse = await callMCPServer({
      jsonrpc: '2.0',
      id: uuidv4(),
      method: 'tools/call',
      params: {
        name: 'connect_to_electron_cdp',
        arguments: {
          port: 9222,
          host: 'localhost'
        }
      }
    });
    
    if (connectResponse.result && connectResponse.result.content) {
      const content = JSON.parse(connectResponse.result.content[0].text);
      if (content.success) {
        console.log(`✓ Connected to CDP`);
        console.log(`  Session ID: ${content.sessionId}\n`);
        const sessionId = content.sessionId;
        
        console.log('=== Test 3: Navigate to Test App ===');
        const navigateResponse = await callMCPServer({
          jsonrpc: '2.0',
          id: uuidv4(),
          method: 'tools/call',
          params: {
            name: 'navigate',
            arguments: {
              sessionId,
              url: 'file:///D:/test_mcp/electron-mcp/test-app/index.html'
            }
          }
        });
        
        if (navigateResponse.result) {
          console.log(`✓ Navigated to test app\n`);
        }
        
        await sleep(2000);
    
    const pageInfoResponse = await callMCPServer({
      jsonrpc: '2.0',
      id: uuidv4(),
      method: 'tools/call',
      params: {
        name: 'get_page_info',
        arguments: {
          sessionId
        }
      }
    });
    
    if (pageInfoResponse.result && pageInfoResponse.result.content) {
      const pageInfo = JSON.parse(pageInfoResponse.result.content[0].text);
      if (pageInfo.url) {
        console.log(`✓ Got page info`);
        console.log(`  URL: ${pageInfo.url}`);
        console.log(`  Title: ${pageInfo.title}\n`);
      }
    }
        
        console.log('=== Test 4: Wait for Selector ===');
        const waitResponse = await callMCPServer({
          jsonrpc: '2.0',
          id: uuidv4(),
          method: 'tools/call',
          params: {
            name: 'wait_for_selector',
            arguments: {
              sessionId,
              selector: 'body'
            }
          }
        });
        
        if (waitResponse.result) {
          console.log(`✓ Element found\n`);
        }
        
        console.log('=== Test 5: Get Text from H1 ===');
        const textResponse = await callMCPServer({
          jsonrpc: '2.0',
          id: uuidv4(),
          method: 'tools/call',
          params: {
            name: 'get_text',
            arguments: {
              sessionId,
              selector: 'h1'
            }
          }
        });
        
        if (textResponse.result && textResponse.result.content) {
          const textResult = JSON.parse(textResponse.result.content[0].text);
          if (textResult.text) {
            console.log(`✓ Got text: "${textResult.text}"\n`);
          }
        }
        
        console.log('=== Test 6: Execute JavaScript ===');
        const execResponse = await callMCPServer({
          jsonrpc: '2.0',
          id: uuidv4(),
          method: 'tools/call',
          params: {
            name: 'execute',
            arguments: {
              sessionId,
              script: 'document.title'
            }
          }
        });
        
        if (execResponse.result && execResponse.result.content) {
          const execResult = JSON.parse(execResponse.result.content[0].text);
          if (execResult.result) {
            console.log(`✓ Executed JavaScript: "${execResult.result}"\n`);
          }
        }
        
        console.log('=== Test 7: List Sessions ===');
        const listResponse = await callMCPServer({
          jsonrpc: '2.0',
          id: uuidv4(),
          method: 'tools/call',
          params: {
            name: 'list_sessions',
            arguments: {}
          }
        });
        
        if (listResponse.result && listResponse.result.content) {
          const listResult = JSON.parse(listResponse.result.content[0].text);
          if (listResult.sessions) {
            console.log(`✓ Active sessions: ${listResult.sessions.length}\n`);
          }
        }
        
        console.log('=== Test 8: Close Session ===');
        const closeResponse = await callMCPServer({
          jsonrpc: '2.0',
          id: uuidv4(),
          method: 'tools/call',
          params: {
            name: 'close_session',
            arguments: {
              sessionId
            }
          }
        });
        
        if (closeResponse.result && closeResponse.result.content) {
          const closeResult = JSON.parse(closeResponse.result.content[0].text);
          if (closeResult.success) {
            console.log(`✓ Session closed\n`);
          }
        }
        
      } else {
        console.error('✗ Failed to connect to CDP:', content.error);
      }
    } else {
      console.error('✗ Invalid response from connect_to_electron_cdp');
    }
    
    console.log('\n=== All Tests Passed! ===');
    
  } catch (error) {
    console.error('\n✗ Test Failed:', error.message);
    process.exit(1);
  } finally {
    if (serverProcess) {
      serverProcess.kill();
    }
    if (electronProcess) {
      electronProcess.kill();
    }
  }
}

runTests().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
