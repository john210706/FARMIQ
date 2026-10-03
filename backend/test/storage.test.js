const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { once } = require('node:events');
const net = require('node:net');
const storage = require('../src/services/storage');
const { scan } = require('../src/services/scan');

test('private storage preserves bytes, rejects unsafe keys and refuses public cloud buckets', async () => {
  const previous = { ...process.env };
  const originalFetch = global.fetch;
  const directory = await fs.mkdtemp(join(tmpdir(), 'farmiq-storage-test-'));
  try {
    process.env.UPLOAD_DIR = directory;
    process.env.STORAGE_DRIVER = 'local';
    const bytes = Buffer.from('test upload');
    const localKey = await storage.save(bytes, 'png');
    assert.deepEqual(await fs.readFile(join(directory, localKey)), bytes);
    await assert.rejects(storage.remove('../outside.pdf'), /Invalid file reference/);
    await storage.remove(localKey);
    assert.deepEqual(await fs.readdir(directory), []);
    Object.assign(process.env, {
      STORAGE_DRIVER: 'supabase',
      SUPABASE_URL: 'https://storage.example',
      SUPABASE_STORAGE_BUCKET: 'farmiq-private',
      SUPABASE_SERVICE_ROLE_KEY: 'test-only-key',
    });
    let isPublic = true;
    const objects = new Map();
    global.fetch = async (address, options) => {
      const u = new URL(address);
      assert.equal(u.origin, 'https://storage.example');
      assert.equal(options.headers.Authorization, 'Bearer test-only-key');
      if (u.pathname.includes('/bucket/')) return Response.json({ public: isPublic });
      if (options.method === 'POST') {
        assert.equal(options.headers['x-upsert'], 'false');
        objects.set(u.pathname.split('/').at(-1), options.body);
        return Response.json({});
      }
      if (options.method === 'DELETE') {
        const [key] = JSON.parse(options.body).prefixes;
        objects.delete(key);
        return Response.json({});
      }
      throw new Error('Unexpected storage request');
    };
    await assert.rejects(storage.save(bytes, 'png'), /private bucket/);
    assert.equal(objects.size, 0);
    isPublic = false;
    const key = await storage.save(bytes, 'png');
    assert.ok(key.startsWith('supabase:farmiq-private/'));
    assert.deepEqual([...objects.values()][0], bytes);
    await storage.remove(key);
    assert.equal(objects.size, 0);
  } finally {
    global.fetch = originalFetch;
    for (const key of [
      'UPLOAD_DIR',
      'STORAGE_DRIVER',
      'SUPABASE_URL',
      'SUPABASE_STORAGE_BUCKET',
      'SUPABASE_SERVICE_ROLE_KEY',
    ])
      previous[key] === undefined ? delete process.env[key] : (process.env[key] = previous[key]);
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('malware scanner accepts clean streams and blocks detections and missing required scanner', async () => {
  const previous = { ...process.env };
  const server = net.createServer((socket) => {
    let data = Buffer.alloc(0);
    socket.on('data', (chunk) => {
      data = Buffer.concat([data, chunk]);
      if (data.length < 13) return;
      assert.equal(data.subarray(0, 10).toString(), 'zINSTREAM\0');
      const size = data.readUInt32BE(10);
      if (data.length < 18 + size) return;
      assert.equal(data.readUInt32BE(14 + size), 0);
      const content = data.subarray(14, 14 + size).toString();
      socket.end(content === 'clean' ? 'stream: OK\0' : 'stream: Test-Signature FOUND\0');
    });
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    Object.assign(process.env, {
      CLAMAV_HOST: '127.0.0.1',
      CLAMAV_PORT: String(server.address().port),
      CLAMAV_REQUIRED: 'true',
    });
    await scan(Buffer.from('clean'));
    await assert.rejects(scan(Buffer.from('simulated-detection')), /failed the security scan/);
    delete process.env.CLAMAV_HOST;
    await assert.rejects(scan(Buffer.from('clean')), /not configured/);
  } finally {
    for (const key of ['CLAMAV_HOST', 'CLAMAV_PORT', 'CLAMAV_REQUIRED'])
      previous[key] === undefined ? delete process.env[key] : (process.env[key] = previous[key]);
    await new Promise((resolve) => server.close(resolve));
  }
});
