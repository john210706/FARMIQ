import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const container = `farmiq-test-${randomUUID()}`;
const runtime = process.env.CONTAINER_RUNTIME || 'docker';
let ownsContainer = false;
let api;
let uploads;
let cleaning;
async function run(command, args, env = process.env, capture = false) {
  const child = spawn(command, args, {
    cwd: root,
    env,
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
  });
  let output = '';
  if (capture) child.stdout.on('data', (data) => (output += data));
  const [code] = await once(child, 'exit');
  if (code !== 0) throw new Error(`${command} ${args[0]} failed (${code})`);
  return output.trim();
}
async function freePort() {
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}
async function cleanup() {
  if (cleaning) return cleaning;
  cleaning = (async () => {
    if (api && api.exitCode === null) {
      const stopped = once(api, 'exit');
      api.kill('SIGTERM');
      await stopped;
    }
    if (ownsContainer) await run(runtime, ['stop', '-t', '2', container]).catch(() => {});
    if (uploads) await rm(uploads, { recursive: true, force: true });
  })();
  return cleaning;
}
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, async () => {
    await cleanup();
    process.exit(130);
  });

try {
  let database = process.env.TEST_DATABASE_URL;
  if (!database) {
    const password = randomUUID();
    ownsContainer = true;
    await run(runtime, [
      'run',
      '--rm',
      '-d',
      '--name',
      container,
      '-p',
      '127.0.0.1::5432',
      '-e',
      `POSTGRES_PASSWORD=${password}`,
      '-e',
      'POSTGRES_DB=farmiq_test',
      'postgres:16-alpine',
    ]);
    const binding = await run(runtime, ['port', container, '5432/tcp'], process.env, true);
    database = `postgresql://postgres:${password}@127.0.0.1:${binding.split(':').at(-1)}/farmiq_test`;
    let ready = false;
    for (let i = 0; i < 30; i++) {
      try {
        await run(runtime, ['exec', container, 'pg_isready', '-U', 'postgres'], process.env, true);
        ready = true;
        break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    if (!ready) throw new Error('Temporary PostgreSQL did not become ready');
  }
  const url = new URL(database);
  if (!['localhost', '127.0.0.1'].includes(url.hostname) || !url.pathname.includes('test'))
    throw new Error('Verification requires an isolated localhost database with test in its name');
  uploads = await mkdtemp(join(tmpdir(), 'farmiq-test-uploads-'));
  const apiPort = await freePort();
  const webPort = await freePort();
  const env = {
    ...process.env,
    DATABASE_URL: database,
    DIRECT_URL: database,
    TEST_DATABASE_URL: database,
    NODE_ENV: 'test',
    JWT_SECRET: randomUUID(),
    PAYMENT_MODE: 'sandbox',
    ALLOW_DEMO_SEED: 'true',
    UPLOAD_DIR: uploads,
    PORT: String(apiPort),
    FRONTEND_URL: `http://127.0.0.1:${webPort}`,
    E2E_PORT: String(webPort),
    E2E_BASE_URL: `http://127.0.0.1:${webPort}`,
    E2E_WITH_API: 'true',
    API_PROXY_TARGET: `http://127.0.0.1:${apiPort}`,
    VITE_API_URL: '',
    SMS_OUTBOX_ENABLED: 'false',
    TWILIO_ACCOUNT_SID: '',
    TWILIO_AUTH_TOKEN: '',
    TWILIO_FROM: '',
    STORAGE_DRIVER: 'local',
    SUPABASE_SERVICE_ROLE_KEY: '',
    CLAMAV_HOST: '',
    CLAMAV_REQUIRED: 'false',
    PUBLIC_WEBHOOK_ORIGIN: '',
    TWILIO_VERIFY_SERVICE_SID: '',
    GEMINI_API_KEY: '',
    GEMINI_MODEL: '',
    RAZORPAY_KEY_ID: '',
    RAZORPAY_KEY_SECRET: '',
    RAZORPAY_WEBHOOK_SECRET: '',
  };
  await run('npm', ['run', 'db:generate'], env);
  await run('npm', ['run', 'db:migrate', '-w', 'farmiq-backend'], env);
  await run('npm', ['run', 'build'], { ...env, NODE_ENV: 'production' });
  await run('npm', ['test'], env);
  await run('npm', ['run', 'db:seed', '-w', 'farmiq-backend'], env);
  await run('npm', ['run', 'learning:seed', '-w', 'farmiq-backend'], { ...env, ALLOW_LEARNING_SEED: 'true' });
  api = spawn(process.execPath, ['server.js'], { cwd: join(root, 'backend'), env, stdio: 'inherit' });
  let ready = false;
  for (let i = 0; i < 30; i++) {
    if (api.exitCode !== null) throw new Error('Test API exited before becoming ready');
    try {
      if ((await fetch(`http://127.0.0.1:${apiPort}/api/health`)).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error('Test API did not become ready');
  await run('npm', ['run', 'test:e2e'], env);
  console.log('Full verification passed. Temporary database and uploaded test files are being removed.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await cleanup();
}
