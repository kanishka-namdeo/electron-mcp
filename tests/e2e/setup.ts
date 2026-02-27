import { mkdir, writeFile, access } from 'fs/promises';
import { join } from 'path';

export async function setupE2ETestEnvironment() {
  const screenshotsDir = join(process.cwd(), 'tests', 'e2e', 'screenshots');
  const tempDir = join(process.cwd(), 'tests', 'e2e', '.temp');

  try {
    await access(screenshotsDir);
  } catch {
    await mkdir(screenshotsDir, { recursive: true });
    console.log(`Created screenshots directory: ${screenshotsDir}`);
  }

  try {
    await access(tempDir);
  } catch {
    await mkdir(tempDir, { recursive: true });
    console.log(`Created temp directory: ${tempDir}`);
  }

  const envFile = join(process.cwd(), 'tests', 'e2e', '.env.test');
  const envContent = `
TEST_MODE=e2e
LOG_LEVEL=info
NODE_ENV=test
CDP_PORT=9222
CDP_PORT_BACKUP=9223
CDP_PORT_BACKUP_2=9224
SCREENSHOT_DIR=${screenshotsDir.replace(/\\/g, '\\\\')}
`;

  await writeFile(envFile, envContent.trim());
  console.log(`Created test environment file: ${envFile}`);
}

export async function cleanupE2ETestEnvironment() {
  const { unlink, rmdir } = await import('fs/promises');
  const screenshotsDir = join(process.cwd(), 'tests', 'e2e', 'screenshots');
  const tempDir = join(process.cwd(), 'tests', 'e2e', '.temp');

  try {
    await unlink(join(process.cwd(), 'tests', 'e2e', '.env.test'));
    console.log('Removed test environment file');
  } catch {
  }

  console.log('E2E test environment cleanup completed');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  if (command === 'setup') {
    setupE2ETestEnvironment().catch(console.error);
  } else if (command === 'cleanup') {
    cleanupE2ETestEnvironment().catch(console.error);
  } else {
    console.log('Usage: node setup.ts [setup|cleanup]');
  }
}
