import { spawn } from 'child_process';
import { join } from 'path';

const testAppPath = join(process.cwd(), '..', 'test-app');
const electronPath = join(testAppPath, 'node_modules', 'electron', 'cli.js');

console.log('Starting Electron test app with CDP on port 9222...');

const electronProcess = spawn('node', [electronPath, '--remote-debugging-port=9222'], {
  cwd: testAppPath,
  stdio: 'inherit',
  env: {
    ...process.env,
    ELECTRON_ENABLE_LOGGING: '1',
  },
});

electronProcess.on('error', (error) => {
  console.error('Failed to start Electron app:', error);
  process.exit(1);
});

console.log('Electron app started. Waiting for ready signal...');

setTimeout(() => {
  console.log('Electron app ready for CDP connection on port 9222');
}, 3000);

process.on('SIGINT', () => {
  electronProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  electronProcess.kill();
  process.exit(0);
});
