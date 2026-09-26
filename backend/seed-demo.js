// Explicit, non-destructive demo data. Never runs automatically at startup.
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { demoMachines, demoDrivers, demoOperators, machineData } = require('./src/demo-data');
const prisma = new PrismaClient();
async function main() {
  if (process.env.NODE_ENV === 'production' || process.env.ALLOW_DEMO_SEED !== 'true')
    throw new Error('Demo seed requires ALLOW_DEMO_SEED=true outside production');
  const passwordHash = await bcrypt.hash('FarmIQ-demo-2026', 12);
  const accounts = [
    ['DEMO-FARMER', 'FARMER', 'Ravi Kumar', '+919000000001'],
    ['DEMO-OWNER', 'OWNER', 'Murugan Equipment', '+919000000002'],
    ...demoDrivers.map(([accountId, fullName, phone]) => [accountId, 'DRIVER', fullName, phone]),
    ['DEMO-ADMIN', 'ADMIN', 'FarmIQ Administrator', '+919000000004'],
  ];
  const users = {};
  for (const [accountId, role, fullName, phone] of accounts)
    users[role] = await prisma.user.upsert({
      where: { accountId },
      update:
        role === 'DRIVER'
          ? { onDuty: true, latitude: 10.79, longitude: 79.13, locationUpdatedAt: new Date() }
          : {},
      create: {
        accountId,
        role,
        fullName,
        phone,
        passwordHash,
        verificationStatus: 'VERIFIED',
        onDuty: role === 'DRIVER',
        latitude: 10.79,
        longitude: 79.13,
        locationUpdatedAt: role === 'DRIVER' ? new Date() : null,
      },
    });
  await prisma.setting.upsert({
    where: { key: 'dispatch' },
    update: { value: { enabled: true, radiusKm: 30, horizonHours: 24 } },
    create: { key: 'dispatch', value: { enabled: true, radiusKm: 30, horizonHours: 24 } },
  });
  for (const operator of demoOperators) {
    const data = { ...operator, active: true, verificationStatus: 'VERIFIED' };
    await prisma.operator.upsert({ where: { id: operator.id }, create: data, update: data });
  }
  for (const machine of demoMachines) {
    const data = machineData(machine, users.OWNER.id, 10.79, 79.13);
    await prisma.machinery.upsert({
      where: { id: machine.id },
      update: data,
      create: { id: machine.id, ...data },
    });
  }
  console.log(
    'Demo data ready. Farmer, owner, admin and three driver accounts use password FarmIQ-demo-2026. Existing records were preserved.',
  );
}
main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
