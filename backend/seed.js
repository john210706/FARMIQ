require("dotenv").config();

const bcrypt = require("bcryptjs");
const { PrismaClient, Role, VerificationStatus, MachineryStatus } = require("@prisma/client");

const prisma = new PrismaClient();

const accounts = [
  { accountId: "FARM-001", password: "FarmIQ@F01", fullName: "Ravi Kumar", phone: "+919876500001", role: Role.FARMER, language: "ta", latitude: 10.7905, longitude: 79.1378 },
  { accountId: "FARM-002", password: "FarmIQ@F02", fullName: "Meena Selvam", phone: "+919876500002", role: Role.FARMER, language: "ta", latitude: 10.7749, longitude: 79.1472 },
  { accountId: "FARM-003", password: "FarmIQ@F03", fullName: "Arun Prakash", phone: "+919876500003", role: Role.FARMER, language: "en", latitude: 10.8078, longitude: 79.1221 },
  { accountId: "FARM-004", password: "FarmIQ@F04", fullName: "Lakshmi Devi", phone: "+919876500004", role: Role.FARMER, language: "ta", latitude: 10.7428, longitude: 79.1645 },
  { accountId: "FARM-005", password: "FarmIQ@F05", fullName: "Karthik Raj", phone: "+919876500005", role: Role.FARMER, language: "en", latitude: 10.8244, longitude: 79.1542 },
  { accountId: "FARM-006", password: "FarmIQ@F06", fullName: "Fathima Banu", phone: "+919876500006", role: Role.FARMER, language: "ta", latitude: 10.7661, longitude: 79.1097 },
  { accountId: "DRVR-001", password: "FarmIQ@D01", fullName: "Suresh Kumar", phone: "+919876510001", role: Role.DRIVER, language: "ta", latitude: 10.7950, longitude: 79.1400 },
  { accountId: "DRVR-002", password: "FarmIQ@D02", fullName: "Manikandan R", phone: "+919876510002", role: Role.DRIVER, language: "ta", latitude: 10.8124, longitude: 79.1285 },
  { accountId: "DRVR-003", password: "FarmIQ@D03", fullName: "Dinesh Babu", phone: "+919876510003", role: Role.DRIVER, language: "en", latitude: 10.7618, longitude: 79.1511 },
  { accountId: "DRVR-004", password: "FarmIQ@D04", fullName: "Rajesh Kannan", phone: "+919876510004", role: Role.DRIVER, language: "ta", latitude: 10.8383, longitude: 79.1188 },
  { accountId: "DRVR-005", password: "FarmIQ@D05", fullName: "Joseph Antony", phone: "+919876510005", role: Role.DRIVER, language: "en", latitude: 10.7289, longitude: 79.1782 },
  { accountId: "DRVR-006", password: "FarmIQ@D06", fullName: "Velmurugan S", phone: "+919876510006", role: Role.DRIVER, language: "ta", latitude: 10.7842, longitude: 79.0956 },
  { accountId: "BUY-001", password: "FarmIQ@B01", fullName: "Murugan Agro Services", phone: "+919876520001", role: Role.OWNER, language: "ta", latitude: 10.8012, longitude: 79.1468 },
  { accountId: "BUY-002", password: "FarmIQ@B02", fullName: "Green Field Rentals", phone: "+919876520002", role: Role.OWNER, language: "en", latitude: 10.8335, longitude: 79.1731 },
  { accountId: "BUY-003", password: "FarmIQ@B03", fullName: "Cauvery Farm Machinery", phone: "+919876520003", role: Role.OWNER, language: "ta", latitude: 10.7492, longitude: 79.1204 },
  { accountId: "BUY-004", password: "FarmIQ@B04", fullName: "Kaveri Farm Implements", phone: "+919876520004", role: Role.OWNER, language: "ta", latitude: 10.7215, longitude: 79.1916 },
  { accountId: "BUY-005", password: "FarmIQ@B05", fullName: "Delta Harvesters", phone: "+919876520005", role: Role.OWNER, language: "en", latitude: 10.8562, longitude: 79.1028 },
  { accountId: "BUY-006", password: "FarmIQ@B06", fullName: "Kisan Seva Tools", phone: "+919876520006", role: Role.OWNER, language: "ta", latitude: 10.7793, longitude: 79.1847 },
];

const machinery = [
  { id: "mach-001", ownerAccountId: "BUY-001", name: "Mahindra 575 DI XP Plus", brand: "Mahindra", category: "TRACTOR", description: "47 HP tractor suited for tillage, haulage and cultivation.", pricePerHour: 1250, pricePerDay: 8500, horsepower: 47, fuelType: "Diesel DI", imageUrl: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=82", operatorAvailable: true, latitude: 10.8021, longitude: 79.1452, location: "Vallam Road, Thanjavur" },
  { id: "mach-002", ownerAccountId: "BUY-002", name: "John Deere 5310 PowerTech", brand: "John Deere", category: "TRACTOR", description: "55 HP high-torque tractor with power steering and 4WD support.", pricePerHour: 1550, pricePerDay: 10500, horsepower: 55, fuelType: "Turbo Diesel", imageUrl: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=82", operatorAvailable: true, latitude: 10.8318, longitude: 79.1704, location: "Kumbakonam Highway" },
  { id: "mach-003", ownerAccountId: "BUY-003", name: "Kubota MU4501 E-CDIS", brand: "Kubota", category: "TRACTOR", description: "Low-vibration 45 HP tractor designed for paddy fields.", pricePerHour: 1400, pricePerDay: 9200, horsepower: 45, fuelType: "E-CDIS Diesel", imageUrl: "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=1000&q=82", operatorAvailable: true, latitude: 10.7514, longitude: 79.1238, location: "Papanasam Road" },
  { id: "mach-004", ownerAccountId: "BUY-004", name: "Shaktiman Semi-Champion Rotavator", brand: "Shaktiman", category: "TILLAGE", description: "Seven-foot gear-drive rotavator for fast soil preparation.", pricePerHour: 750, pricePerDay: 4800, horsepower: 40, fuelType: "Tractor Implement", imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1000&q=82", operatorAvailable: false, latitude: 10.7241, longitude: 79.1883, location: "Orathanadu Bypass" },
  { id: "mach-005", ownerAccountId: "BUY-005", name: "Preet 987 Combine Harvester", brand: "Preet", category: "HARVESTER", description: "101 HP combine harvester for paddy and wheat harvesting.", pricePerHour: 2800, pricePerDay: 19500, horsepower: 101, fuelType: "Heavy Diesel", imageUrl: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=1000&q=82", operatorAvailable: true, latitude: 10.8537, longitude: 79.1064, location: "Budalur Road" },
  { id: "mach-006", ownerAccountId: "BUY-006", name: "Aspee Boom Sprayer 500L", brand: "Aspee", category: "SPRAYER", description: "500 litre tractor boom sprayer with precision pressure control.", pricePerHour: 650, pricePerDay: 4200, horsepower: 35, fuelType: "Tractor Implement", imageUrl: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1000&q=82", operatorAvailable: true, latitude: 10.7817, longitude: 79.1812, location: "Medical College Road" },
];

async function main() {
  if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) throw new Error("DATABASE_URL and DIRECT_URL are required. Add the Supabase connection strings to backend/.env first.");
  console.log("Seeding FarmIQ demo accounts...");
  const owners = new Map();
  for (const account of accounts) {
    const passwordHash = await bcrypt.hash(account.password, 12);
    const user = await prisma.user.upsert({
      where: { accountId: account.accountId },
      update: { phone: account.phone, fullName: account.fullName, passwordHash, role: account.role, language: account.language, verificationStatus: VerificationStatus.VERIFIED, latitude: account.latitude, longitude: account.longitude, active: true },
      create: { accountId: account.accountId, phone: account.phone, fullName: account.fullName, passwordHash, role: account.role, language: account.language, verificationStatus: VerificationStatus.VERIFIED, latitude: account.latitude, longitude: account.longitude },
    });
    if (account.role === Role.OWNER) owners.set(account.accountId, user);
  }
  console.log("Seeding machinery catalogue...");
  for (const machine of machinery) {
    const owner = owners.get(machine.ownerAccountId);
    const data = { name: machine.name, brand: machine.brand, category: machine.category, description: machine.description, pricePerHour: machine.pricePerHour, pricePerDay: machine.pricePerDay, horsepower: machine.horsepower, fuelType: machine.fuelType, imageUrl: machine.imageUrl, operatorAvailable: machine.operatorAvailable, status: MachineryStatus.AVAILABLE, latitude: machine.latitude, longitude: machine.longitude, location: machine.location, ownerId: owner.id };
    await prisma.machinery.upsert({ where: { id: machine.id }, update: data, create: { id: machine.id, ...data } });
  }
  console.log(`Seed complete: ${accounts.length} accounts and ${machinery.length} machinery records.`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
