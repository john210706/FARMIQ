const { prisma, PORT, FRONTEND_URL } = require("./config");
const app = require('./app');

// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
  if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
    console.error(
      "Missing DATABASE_URL or DIRECT_URL. Copy .env.example to .env and add the Supabase PostgreSQL connection strings."
    );
    process.exit(1);
  }
  await prisma.$connect();
  require('./services/worker').start();
  app.listen(PORT, () => console.log(`FarmIQ API running at http://localhost:${PORT}`));
}

start().catch(async (error) => {
  console.error("FarmIQ API failed to start:", error.message);
  await prisma.$disconnect();
  process.exit(1);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
