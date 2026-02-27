import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

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
          console.log(`\n✓ Total tools registered: ${parsed.result.tools.length}`);
          console.log('\nTools:');
          parsed.result.tools.forEach((tool) => {
            console.log(`  - ${tool.name}`);
          });
          serverProcess.kill();
          process.exit(0);
        }
      } catch (e) {
      }
    }
  }
});

serverProcess.stdin.write(JSON.stringify({
  jsonrpc: '2.0',
  id: requestId,
  method: 'tools/list',
}) + '\n');

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
