const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))); 
}

// Search Machinery by Location
app.get('/api/machinery/nearby', async (req, res) => {
  const { lat, lng } = req.query;
  try {
    const machineries = await prisma.machinery.findMany({
      where: { isAvailable: true },
      include: { owner: true }
    });

    if (!lat || !lng) return res.json(machineries);

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    // Calculate distance and sort
    const withDistance = machineries.map(m => {
      const distance = m.latitude && m.longitude 
        ? calculateDistance(userLat, userLng, m.latitude, m.longitude) 
        : Infinity;
      return { ...m, distance: parseFloat(distance.toFixed(2)) };
    }).sort((a, b) => a.distance - b.distance);

    res.json(withDistance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a Booking and Auto-Assign Closest Driver
app.post('/api/bookings', async (req, res) => {
  const { farmLat, farmLng, machineryId, durationHours, totalAmount, advancePaid } = req.body;
  
  console.log('\n=============================================');
  console.log('🚨 NEW BOOKING REQUEST RECEIVED 🚨');
  console.log(`📍 Farm Location: [${farmLat}, ${farmLng}]`);
  console.log(`🚜 Machinery ID requested: ${machineryId}`);
  console.log('=============================================');
  
  try {
    const farmer = await prisma.user.findFirst({ where: { role: 'FARMER' } });
    
    // 2. Find closest driver
    const drivers = await prisma.user.findMany({ where: { role: 'DRIVER' } });
    let closestDriver = null;
    let minDistance = Infinity;

    console.log('\n🔍 Scanning for available drivers...');
    drivers.forEach(driver => {
      if (driver.latitude && driver.longitude) {
        const dist = calculateDistance(farmLat, farmLng, driver.latitude, driver.longitude);
        console.log(`   ➔ Found ${driver.fullName} at [${driver.latitude}, ${driver.longitude}] | Distance: ${dist.toFixed(2)} km`);
        if (dist < minDistance) {
          minDistance = dist;
          closestDriver = driver;
        }
      }
    });

    if (closestDriver) {
      console.log(`\n✅ SMART ASSIGNMENT SUCCESS!`);
      console.log(`   Assigned Driver: ** ${closestDriver.fullName} **`);
      console.log(`   Because they are the closest at just ${minDistance.toFixed(2)} km away.`);
    } else {
      console.log(`\n❌ WARNING: No drivers found with GPS data.`);
    }
    console.log('=============================================\n');

    // 3. Create the Booking and assign the driver
    const booking = await prisma.booking.create({
      data: {
        farmLat, farmLng, 
        durationHours, totalAmount, advancePaid,
        status: 'ASSIGNED',
        farmerId: farmer.id,
        machineryId: machineryId,
        driverId: closestDriver ? closestDriver.id : null,
        bookingDate: new Date()
      },
      include: {
        driver: true,
        machinery: true
      }
    });

    res.json(booking);
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 FarmIQ Backend API running at http://localhost:${PORT}`);
});
