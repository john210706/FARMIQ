const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

// Haversine formula to calculate distance between two lat/long points in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; // Distance in km
}

async function createDriver() {
  console.log("\n--- Add a New Driver ---");
  const name = await ask("Driver Name: ");
  const phone = await ask("Phone Number: ");
  const lat = parseFloat(await ask("Current Latitude (e.g., 10.7905): "));
  const lng = parseFloat(await ask("Current Longitude (e.g., 79.1378): "));

  const driver = await prisma.user.create({
    data: { fullName: name, phone, role: "DRIVER", latitude: lat, longitude: lng }
  });
  console.log(`✅ Driver ${driver.fullName} added successfully at [${lat}, ${lng}]!`);
}

async function createMachinery() {
  console.log("\n--- Add New Machinery ---");
  const name = await ask("Machinery Name (e.g., Mahindra Tractor): ");
  
  // Find or create an owner
  let owner = await prisma.user.findFirst({ where: { role: "OWNER" } });
  if (!owner) {
    owner = await prisma.user.create({ data: { fullName: "Default Owner", phone: "0000000000", role: "OWNER" }});
  }

  const lat = parseFloat(await ask("Parking Latitude (e.g., 10.7950): "));
  const lng = parseFloat(await ask("Parking Longitude (e.g., 79.1400): "));

  const machine = await prisma.machinery.create({
    data: {
      name, category: "TRACTOR", pricePerHour: 800, horsepower: 45,
      latitude: lat, longitude: lng, ownerId: owner.id
    }
  });
  console.log(`✅ Machinery ${machine.name} added at [${lat}, ${lng}]!`);
}

async function createBooking() {
  console.log("\n--- Request a Ride/Booking (Farmer) ---");
  let farmer = await prisma.user.findFirst({ where: { role: "FARMER" } });
  if (!farmer) {
    farmer = await prisma.user.create({ data: { fullName: "Test Farmer", phone: "1111111111", role: "FARMER" }});
  }
  
  // Just use the first available machinery temporarily for the booking creation
  const machine = await prisma.machinery.findFirst();
  if(!machine) {
      console.log("❌ Please add machinery first!");
      return;
  }

  const lat = parseFloat(await ask("Farm Latitude (e.g., 10.8000): "));
  const lng = parseFloat(await ask("Farm Longitude (e.g., 79.1500): "));

  const booking = await prisma.booking.create({
    data: {
      durationHours: 4, totalAmount: 3200, status: "PENDING",
      farmLat: lat, farmLng: lng,
      farmerId: farmer.id, machineryId: machine.id,
      bookingDate: new Date()
    }
  });
  console.log(`✅ Ride/Booking requested at Farm Location [${lat}, ${lng}]!`);
}

async function listAndAssign() {
  console.log("\n--- Pending Rides & Smart Assignment ---");
  const pendingBookings = await prisma.booking.findMany({ where: { status: "PENDING" } });

  if (pendingBookings.length === 0) {
    console.log("No pending rides.");
    return;
  }

  for (const booking of pendingBookings) {
    console.log(`\n📌 Booking ID: ${booking.id} | Farm Location: [${booking.farmLat}, ${booking.farmLng}]`);
    
    // Find closest available driver
    const drivers = await prisma.user.findMany({ where: { role: "DRIVER" } });
    if (drivers.length === 0) {
      console.log("❌ No drivers available to assign.");
      continue;
    }

    let closestDriver = null;
    let minDistance = Infinity;

    for (const driver of drivers) {
      if (driver.latitude && driver.longitude && booking.farmLat && booking.farmLng) {
        const dist = calculateDistance(booking.farmLat, booking.farmLng, driver.latitude, driver.longitude);
        console.log(`   - Driver ${driver.fullName} is ${dist.toFixed(2)} km away.`);
        if (dist < minDistance) {
          minDistance = dist;
          closestDriver = driver;
        }
      }
    }

    if (closestDriver) {
      const assign = await ask(`❓ Assign closest driver (${closestDriver.fullName}, ${minDistance.toFixed(2)} km away)? (y/n): `);
      if (assign.toLowerCase() === 'y') {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { driverId: closestDriver.id, status: "ASSIGNED" }
        });
        console.log(`✅ Successfully assigned ${closestDriver.fullName} to the ride!`);
      } else {
        console.log("Assignment skipped.");
      }
    }
  }
}

async function mainMenu() {
  while (true) {
    console.log("\n==================================");
    console.log("🚜 FarmIQ Geo-Location Control Center");
    console.log("==================================");
    console.log("1. Add Driver (with Geo-Location)");
    console.log("2. Add Machinery (with Geo-Location)");
    console.log("3. Request Ride (Specify Farm Geo-Location)");
    console.log("4. List Pending Rides & Auto-Assign");
    console.log("5. Exit");
    
    const choice = await ask("\nSelect an option (1-5): ");

    try {
      if (choice === '1') await createDriver();
      else if (choice === '2') await createMachinery();
      else if (choice === '3') await createBooking();
      else if (choice === '4') await listAndAssign();
      else if (choice === '5') {
        console.log("Exiting...");
        break;
      }
    } catch (e) {
      console.error("Error:", e.message);
    }
  }
  await prisma.$disconnect();
  rl.close();
}

// Clear DB on start for clean testing
prisma.booking.deleteMany().then(() => 
  prisma.machinery.deleteMany()
).then(() => 
  prisma.user.deleteMany()
).then(() => {
  mainMenu();
});
