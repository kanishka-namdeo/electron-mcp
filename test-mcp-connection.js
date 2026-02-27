import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { readFileSync } from 'fs';
import { join } from 'path';

const requestId = uuidv4();

const serverProcess = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
});

let buffer = '';

serverProcess.stdout.on('data', (data) => {
  buffer += data.toString();
  
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';
  
  for (const line of lines) {
    if (line.trim()) {
      try {
        const parsed = JSON.parse(line);
        console.log('Received:', JSON.stringify(parsed, null, 2));
        
        if (parsed.result && parsed.result.tools) {
          console.log('\n✓ Tools listed successfully');
          
          const validSessionId = uuidv4();
          console.log('\nTesting connect_to_electron_cdp with valid UUID:', validSessionId);
          
          serverProcess.stdin.write(JSON.stringify({
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
          }) + '\n');
        } else if (parsed.result && parsed.result.success) {
          console.log('\n✓ connect_to_electron_cdp succeeded!');
          console.log('Session ID:', parsed.result.sessionId);
          
          setTimeout(() => {
            serverProcess.kill();
            process.exit(0);
          }, 1000);
        } else if (parsed.error) {
          console.log('\n✗ Error:', JSON.stringify(parsed.error, null, 2));
          serverProcess.kill();
          process.exit(1);
        }
      } catch (e) {
        console.error('Failed to parse:', line);
      }
    }
  }
});

setTimeout(() => {
  serverProcess.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: requestId,
    method: 'tools/list',
  }) + '\n');
}, 500);

setTimeout(() => {
  serverProcess.kill();
  console.error('Timeout waiting for response');
  process.exit(1);
}, 10000);

serverProcess.stderr.on('data', (data) => {
  console.error('Server stderr:', data.toString());
});

serverProcess.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});
