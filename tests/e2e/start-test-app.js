import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';

const testAppPath = join(process.cwd(), '..', 'test-app');

if (!existsSync(testAppPath)) {
  console.error(`Test app not found at: ${testAppPath}`);
  process.exit(1);
}

const args = ['--remote-debugging-port=9222'];

if (process.argv.includes('--dev')) {
  args.push('--dev');
}

console.log('Starting Electron test app with remote debugging on port 9222...');
console.log(`App path: ${testAppPath}`);

const electronProcess = spawn('npm', ['start'], {
  cwd: testAppPath,
  env: {
    ...process.env,
  },
  stdio: 'inherit',
});

electronProcess.on('error', (error) => {
  console.error('Failed to start Electron app:', error);
  process.exit(1);
});

electronProcess.on('exit', (code, signal) => {
  console.log(`Electron app exited with code ${code}, signal ${signal}`);
  process.exit(code || 0);
});

console.log('Electron app started. Press Ctrl+C to stop.');
