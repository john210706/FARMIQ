const { prisma } = require('../config');
function start() {
  let running = false;
  const timer = setInterval(async () => {
    if (running) return;
    running = true;
    try {
      const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN', active: true },
        orderBy: { id: 'asc' },
      });
      if (admin) await require('./dispatch').run(admin);
      await require('./outbox').run();
    } catch (error) {
      console.error('Operations worker failed:', error.code || error.name);
    } finally {
      running = false;
    }
  }, 30000);
  timer.unref();
  return () => clearInterval(timer);
}
module.exports = { start };
