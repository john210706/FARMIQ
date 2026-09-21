// Explicit, non-destructive demo data. Never runs automatically at startup.
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  if (process.env.NODE_ENV === 'production' || process.env.ALLOW_DEMO_SEED !== 'true')
    throw new Error('Demo seed requires ALLOW_DEMO_SEED=true outside production');
  const passwordHash = await bcrypt.hash('FarmIQ-demo-2026', 12);
  const accounts = [
    ['DEMO-FARMER', 'FARMER', 'Ravi Kumar', '+919000000001'],
    ['DEMO-OWNER', 'OWNER', 'Murugan Equipment', '+919000000002'],
    ['DEMO-DRIVER', 'DRIVER', 'Suresh Kumar', '+919000000003'],
    ['DEMO-ADMIN', 'ADMIN', 'FarmIQ Administrator', '+919000000004'],
  ];
  const users = {};
  for (const [accountId, role, fullName, phone] of accounts)
    users[role] = await prisma.user.upsert({
      where: { accountId },
      update: {},
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
      },
    });
  const machines = [
    [
      'demo-tractor',
      'Mahindra 575 DI',
      'Mahindra',
      'TRACTOR',
      1250,
      47,
      'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=900&q=75',
    ],
    [
      'demo-harvester',
      'Preet Combine Harvester',
      'Preet',
      'HARVESTER',
      2800,
      101,
      'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=900&q=75',
    ],
    [
      'demo-rotavator',
      'Shaktiman Rotavator',
      'Shaktiman',
      'TILLAGE',
      750,
      40,
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=75',
    ],
  ];
  for (const [id, name, brand, category, pricePerHour, horsepower, imageUrl] of machines)
    await prisma.machinery.upsert({
      where: { id },
      update: {},
      create: {
        id,
        name,
        brand,
        category,
        pricePerHour,
        pricePerDay: pricePerHour * 6.5,
        horsepower,
        imageUrl,
        description:
          'Demonstration listing. Verify the exact model, implements and field suitability with the owner.',
        location: 'Thanjavur demonstration depot',
        latitude: 10.79,
        longitude: 79.13,
        ownerId: users.OWNER.id,
        verificationStatus: 'VERIFIED',
        status: 'AVAILABLE',
        operatorAvailable: false,
        fuelLitresPerHour: 4,
        acresPerHour: 1,
      },
    });
  console.log(
    'Demo data ready. Accounts: DEMO-FARMER, DEMO-OWNER, DEMO-DRIVER, DEMO-ADMIN. Password: FarmIQ-demo-2026. Existing records were preserved.',
  );
}
main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
