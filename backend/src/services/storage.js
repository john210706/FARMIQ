const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { Readable } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const { fail } = require('../domain');
const namePattern = /^[a-f0-9-]{36}\.(png|jpg|pdf)$/i;
const bucketPattern = /^[a-zA-Z0-9_-]{1,100}$/;
const directory = () => process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads');

function settings() {
  const driver = process.env.STORAGE_DRIVER || 'local';
  if (!['local', 'supabase'].includes(driver)) throw new Error('STORAGE_DRIVER must be local or supabase');
  if (driver === 'local') return { driver };
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  const base = new URL(process.env.SUPABASE_URL || 'invalid');
  if (
    base.protocol !== 'https:' ||
    base.username ||
    base.password ||
    base.pathname !== '/' ||
    base.search ||
    base.hash ||
    !bucketPattern.test(bucket || '') ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  )
    throw new Error(
      'Configure HTTPS SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and a private SUPABASE_STORAGE_BUCKET',
    );
  return { driver, bucket, origin: base.origin };
}
async function remote(route, options = {}) {
  const config = settings();
  if (config.driver !== 'supabase') fail(503, 'Cloud file storage is not configured');
  let response;
  try {
    response = await fetch(`${config.origin}/storage/v1${route}`, {
      ...options,
      signal: AbortSignal.timeout(15000),
      redirect: 'error',
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        ...options.headers,
      },
    });
  } catch {
    fail(503, 'File storage is temporarily unavailable');
  }
  if (!response.ok)
    fail(
      response.status === 404 ? 404 : 503,
      response.status === 404
        ? 'File or storage bucket not found'
        : 'File storage is temporarily unavailable',
    );
  return response;
}
async function privateBucket(bucket) {
  const response = await remote(`/bucket/${encodeURIComponent(bucket)}`);
  const data = await response.json();
  if (data.public !== false) fail(503, 'Document storage must use a private bucket');
}
function parse(key) {
  if (key.startsWith('supabase:')) {
    const [bucket, name, extra] = key.slice(9).split('/');
    if (extra || !bucketPattern.test(bucket || '') || !namePattern.test(name || ''))
      fail(400, 'Invalid file reference');
    return { bucket, name };
  }
  if (!namePattern.test(key)) fail(400, 'Invalid file reference');
  return { name: key };
}
async function check() {
  const config = settings();
  if (config.driver === 'supabase') await privateBucket(config.bucket);
  else await fs.mkdir(directory(), { recursive: true });
}
async function save(bytes, extension) {
  if (!['png', 'jpg', 'pdf'].includes(extension)) fail(400, 'Unsupported file type');
  const name = `${crypto.randomUUID()}.${extension}`;
  const config = settings();
  if (config.driver === 'local') {
    await fs.mkdir(directory(), { recursive: true });
    await fs.writeFile(path.join(directory(), name), bytes, { flag: 'wx', mode: 0o600 });
    return name;
  }
  await privateBucket(config.bucket);
  await remote(`/object/${config.bucket}/${name}`, {
    method: 'POST',
    body: bytes,
    headers: {
      'Content-Type': { png: 'image/png', jpg: 'image/jpeg', pdf: 'application/pdf' }[extension],
      'x-upsert': 'false',
    },
  });
  return `supabase:${config.bucket}/${name}`;
}
async function remove(key) {
  const { bucket, name } = parse(key);
  if (!bucket) return fs.unlink(path.join(directory(), name));
  await remote(`/object/${bucket}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefixes: [name] }),
  });
}
async function download(document, res) {
  const { bucket, name } = parse(document.storageKey);
  if (!bucket) return res.download(path.join(directory(), name), document.filename);
  await privateBucket(bucket);
  const response = await remote(`/object/authenticated/${bucket}/${name}`);
  res.attachment(document.filename);
  res.set(
    'Content-Type',
    { png: 'image/png', jpg: 'image/jpeg', pdf: 'application/pdf' }[name.split('.').at(-1)],
  );
  await pipeline(Readable.fromWeb(response.body), res);
}
module.exports = { save, remove, download, check, settings };
