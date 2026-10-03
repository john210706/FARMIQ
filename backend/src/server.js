const { prisma, PORT, FRONTEND_URL } = require('./config');
const app = require('./app');
let server;
let stopWorker;

// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
  if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
    console.error(
      'Missing DATABASE_URL or DIRECT_URL. Copy .env.example to .env and add the Supabase PostgreSQL connection strings.',
    );
    process.exit(1);
  }
  await prisma.$connect();
  await require('./services/storage').check();
  stopWorker = require('./services/worker').start();
  server = app.listen(PORT, () => console.log(`FarmIQ API running at http://localhost:${PORT}`));
}

start().catch(async (error) => {
  console.error('FarmIQ API failed to start:', error.message);
  await prisma.$disconnect();
  process.exit(1);
});

let shuttingDown = false;
async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  stopWorker?.();
  const deadline = setTimeout(() => process.exit(1), 10000);
  deadline.unref();
  if (server) await new Promise((resolve) => server.close(resolve));
  await prisma.$disconnect();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
