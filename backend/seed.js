const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding database with initial data...");

  await prisma.booking.deleteMany();
  await prisma.machinery.deleteMany();
  await prisma.user.deleteMany();

  // Create Farmer
  const farmer = await prisma.user.create({
    data: { fullName: "Ravi Kumar", phone: "+919876543210", role: "FARMER", latitude: 10.7905, longitude: 79.1378 }
  });

  // Create Owner
  const owner = await prisma.user.create({
    data: { fullName: "Sri Murugan Agro", phone: "+918765432109", role: "OWNER" }
  });

  // Create Drivers with geo-locations around Thanjavur (Tamil Nadu)
  const driver1 = await prisma.user.create({
    data: { fullName: "Suresh (Driver)", phone: "9999999991", role: "DRIVER", latitude: 10.7950, longitude: 79.1400 } // Close
  });
  const driver2 = await prisma.user.create({
    data: { fullName: "Ramesh (Driver)", phone: "9999999992", role: "DRIVER", latitude: 10.8200, longitude: 79.1700 } // Further
  });
  const driver3 = await prisma.user.create({
    data: { fullName: "Karthik (Driver)", phone: "9999999993", role: "DRIVER", latitude: 10.8500, longitude: 79.2000 } // Farthest
  });

  // Create Machinery with geo-locations
  await prisma.machinery.create({
    data: {
      name: "Mahindra 575 DI (45 HP)", category: "TRACTOR", pricePerHour: 750, horsepower: 45,
      latitude: 10.7960, longitude: 79.1410, ownerId: owner.id // ~1 km away
    }
  });

  await prisma.machinery.create({
    data: {
      name: "John Deere 5050D", category: "TRACTOR", pricePerHour: 800, horsepower: 50,
      latitude: 10.8150, longitude: 79.1600, ownerId: owner.id // ~3 km away
    }
  });

  await prisma.machinery.create({
    data: {
      name: "Kubota Harvester", category: "HARVESTER", pricePerHour: 1500, horsepower: 70,
      latitude: 10.8400, longitude: 79.1800, ownerId: owner.id // ~6 km away
    }
  });

  console.log("✅ Seed complete! Database is populated with Drivers and Machinery at specific GPS coordinates.");
  await prisma.$disconnect();
}

seed().catch(e => {
  console.error(e);
  prisma.$disconnect();
});
