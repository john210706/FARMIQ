const demoMachines = [
  // --- TRACTORS (Low, Mid, High, Heavy, and 4WD) ---
  {
    id: 'demo-tractor-oja',
    name: 'Mahindra OJA 2127 (24 HP 4WD)',
    brand: 'Mahindra',
    category: 'TRACTOR',
    pricePerHour: 650,
    horsepower: 24,
    imageUrl: '/machinery/demo-tractor.webp',
    latOffset: 0.002,
    lngOffset: 0.001,
  },
  {
    id: 'demo-tractor-massey',
    name: 'Massey Ferguson 1035 DI (36 HP 2WD)',
    brand: 'Massey Ferguson',
    category: 'TRACTOR',
    pricePerHour: 850,
    horsepower: 36,
    imageUrl: '/machinery/demo-tractor.webp',
    latOffset: -0.003,
    lngOffset: 0.002,
  },
  {
    id: 'demo-tractor',
    name: 'Mahindra 575 DI XP Plus (47 HP 2WD)',
    brand: 'Mahindra',
    category: 'TRACTOR',
    pricePerHour: 1100,
    horsepower: 47,
    imageUrl: '/machinery/demo-tractor.webp',
    latOffset: 0.003,
    lngOffset: 0.002,
  },
  {
    id: 'demo-tractor-jd',
    name: 'John Deere 5050D GearPro (50 HP 2WD)',
    brand: 'John Deere',
    category: 'TRACTOR',
    pricePerHour: 1350,
    horsepower: 50,
    imageUrl: '/machinery/demo-tractor.webp',
    latOffset: -0.002,
    lngOffset: 0.004,
  },
  {
    id: 'demo-tractor-kubota',
    name: 'Kubota MU4501 E-CDIS (45 HP 4WD Wetland)',
    brand: 'Kubota',
    category: 'TRACTOR',
    pricePerHour: 1400,
    horsepower: 45,
    imageUrl: '/machinery/demo-tractor.webp',
    latOffset: 0.001,
    lngOffset: -0.003,
  },
  {
    id: 'demo-tractor-swaraj',
    name: 'Swaraj 855 FE (52 HP 4WD Heavy Duty)',
    brand: 'Swaraj',
    category: 'TRACTOR',
    pricePerHour: 1450,
    horsepower: 52,
    imageUrl: '/machinery/demo-tractor.webp',
    latOffset: 0.006,
    lngOffset: -0.002,
  },
  {
    id: 'demo-tractor-nh',
    name: 'New Holland 3630-TX Super (55 HP 4WD)',
    brand: 'New Holland',
    category: 'TRACTOR',
    pricePerHour: 1550,
    horsepower: 55,
    imageUrl: '/machinery/demo-tractor.webp',
    latOffset: -0.005,
    lngOffset: 0.003,
  },
  {
    id: 'demo-tractor-sonalika',
    name: 'Sonalika Tiger DI 75 CRDS (75 HP 4WD)',
    brand: 'Sonalika',
    category: 'TRACTOR',
    pricePerHour: 1950,
    horsepower: 75,
    imageUrl: '/machinery/demo-tractor.webp',
    latOffset: 0.004,
    lngOffset: 0.006,
  },
  {
    id: 'demo-tractor-preet',
    name: 'Preet 9049 4WD Heavy Contractor (90 HP)',
    brand: 'Preet',
    category: 'TRACTOR',
    pricePerHour: 2200,
    horsepower: 90,
    imageUrl: '/machinery/demo-tractor.webp',
    latOffset: -0.006,
    lngOffset: -0.004,
  },

  // --- TILLAGE & LEVELLING IMPLEMENTS ---
  {
    id: 'demo-rotavator',
    name: 'Shaktiman Semi-Champion Rotavator (7ft)',
    brand: 'Shaktiman',
    category: 'TILLAGE',
    pricePerHour: 750,
    horsepower: 45,
    imageUrl: '/machinery/demo-rotavator.webp',
    latOffset: 0.005,
    lngOffset: -0.003,
  },
  {
    id: 'demo-rotavator-maschio',
    name: 'Maschio Gaspardo Rotary Tiller (6ft)',
    brand: 'Maschio',
    category: 'TILLAGE',
    pricePerHour: 680,
    horsepower: 38,
    imageUrl: '/machinery/demo-rotavator.webp',
    latOffset: 0.007,
    lngOffset: 0.005,
  },
  {
    id: 'demo-rotavator-fieldking',
    name: 'Fieldking Multi-Speed Rotavator (5ft)',
    brand: 'Fieldking',
    category: 'TILLAGE',
    pricePerHour: 550,
    horsepower: 30,
    imageUrl: '/machinery/demo-rotavator.webp',
    latOffset: -0.003,
    lngOffset: -0.006,
  },
  {
    id: 'demo-mouldboard',
    name: 'Lemken Opal 3-Bottom Reversible MB Plough',
    brand: 'Lemken',
    category: 'TILLAGE',
    pricePerHour: 850,
    horsepower: 55,
    imageUrl: '/machinery/demo-rotavator.webp',
    latOffset: 0.004,
    lngOffset: -0.005,
  },
  {
    id: 'demo-leveller-laser',
    name: 'Laser Land Leveller with Dual Mast Transmitter',
    brand: 'Shaktiman',
    category: 'TILLAGE',
    pricePerHour: 950,
    horsepower: 50,
    imageUrl: '/machinery/demo-rotavator.webp',
    latOffset: -0.004,
    lngOffset: 0.001,
  },

  // --- SOWING & TRANSPLANTERS ---
  {
    id: 'demo-transplanter-kubota',
    name: 'Kubota NSP-8W 8-Row Ride-On Paddy Transplanter',
    brand: 'Kubota',
    category: 'TRANSPLANTER',
    pricePerHour: 1800,
    horsepower: 22,
    imageUrl: '/machinery/demo-rotavator.webp',
    latOffset: 0.002,
    lngOffset: 0.003,
  },
  {
    id: 'demo-transplanter-yanmar',
    name: 'Yanmar AP4 4-Row Walk-Behind Rice Transplanter',
    brand: 'Yanmar',
    category: 'TRANSPLANTER',
    pricePerHour: 1200,
    horsepower: 16,
    imageUrl: '/machinery/demo-rotavator.webp',
    latOffset: -0.002,
    lngOffset: -0.002,
  },

  // --- CROP PROTECTION & SPRAYERS ---
  {
    id: 'demo-drone-sprayer',
    name: 'Garuda Kisan Agri-Drone 16L Precision Sprayer',
    brand: 'Garuda Aerospace',
    category: 'SPRAYER',
    pricePerHour: 1650,
    horsepower: 15,
    imageUrl: '/machinery/demo-rotavator.webp',
    latOffset: 0.001,
    lngOffset: -0.001,
  },
  {
    id: 'demo-sprayer-boom',
    name: 'Aspee Tractor-Mounted 500L Boom Sprayer (12m)',
    brand: 'Aspee',
    category: 'SPRAYER',
    pricePerHour: 600,
    horsepower: 40,
    imageUrl: '/machinery/demo-rotavator.webp',
    latOffset: -0.005,
    lngOffset: 0.002,
  },

  // --- HARVESTERS, THRESHERS & BALERS ---
  {
    id: 'demo-harvester',
    name: 'Preet 987 Self-Propelled Multi-Crop Harvester',
    brand: 'Preet',
    category: 'HARVESTER',
    pricePerHour: 2800,
    horsepower: 101,
    imageUrl: '/machinery/demo-harvester.webp',
    latOffset: -0.004,
    lngOffset: 0.004,
  },
  {
    id: 'demo-harvester-kubota',
    name: 'Kubota DC-68G Rubber-Crawler Paddy Harvester',
    brand: 'Kubota',
    category: 'HARVESTER',
    pricePerHour: 2600,
    horsepower: 68,
    imageUrl: '/machinery/demo-harvester.webp',
    latOffset: 0.002,
    lngOffset: -0.006,
  },
  {
    id: 'demo-harvester-dasmesh',
    name: 'Dasmesh 912 Straw-Management Paddy Harvester',
    brand: 'Dasmesh',
    category: 'HARVESTER',
    pricePerHour: 2450,
    horsepower: 76,
    imageUrl: '/machinery/demo-harvester.webp',
    latOffset: -0.007,
    lngOffset: -0.003,
  },
  {
    id: 'demo-thresher',
    name: 'Fieldking Multi-Crop High-Yield Thresher',
    brand: 'Fieldking',
    category: 'THRESHER',
    pricePerHour: 750,
    horsepower: 35,
    imageUrl: '/machinery/demo-harvester.webp',
    latOffset: 0.006,
    lngOffset: 0.001,
  },
  {
    id: 'demo-baler',
    name: 'Claas Markant 65 High-Density Square Baler',
    brand: 'Claas',
    category: 'BALER',
    pricePerHour: 1400,
    horsepower: 55,
    imageUrl: '/machinery/demo-rotavator.webp',
    latOffset: -0.003,
    lngOffset: 0.005,
  },
];

const demoDrivers = [
  ['DEMO-DRIVER', 'Suresh Kumar', '+919000000003', 0.001, 0.001],
  ['DEMO-DRIVER-2', 'Arun Delivery', '+919000000005', 0.012, 0.009],
  ['DEMO-DRIVER-3', 'Karthik Transport', '+919000000006', -0.016, 0.011],
];

const demoOperators = [
  {
    id: 'demo-operator-tractor',
    name: 'Demo · Tractor and tillage operator',
    phone: '+919000000007',
    skills: ['TRACTOR', 'TILLAGE', 'TRANSPLANTER'],
    certification: 'Demonstration qualification — not a real credential',
    hourlyRate: 180,
  },
  {
    id: 'demo-operator-harvester',
    name: 'Demo · Harvester operator',
    phone: '+919000000008',
    skills: ['HARVESTER', 'THRESHER', 'BALER'],
    certification: 'Demonstration qualification — not a real credential',
    hourlyRate: 250,
  },
  {
    id: 'demo-operator-drone',
    name: 'Demo · Certified Drone Pilot',
    phone: '+919000000009',
    skills: ['SPRAYER'],
    certification: 'DGCA Certified Agricultural Drone Operator',
    hourlyRate: 300,
  },
];

const machineData = (machine, ownerId, latitude, longitude) => {
  const isHarvester = machine.category === 'HARVESTER';
  const isDrone = machine.id.includes('drone');
  const isMini = machine.horsepower <= 30;

  let fuelRate = 4.2;
  if (isHarvester) fuelRate = 12.5;
  else if (isDrone) fuelRate = 0.5;
  else if (machine.horsepower >= 75) fuelRate = 8.5;
  else if (machine.horsepower >= 55) fuelRate = 6.2;
  else if (isMini) fuelRate = 2.4;

  let fieldCapacity = 1.0;
  if (isHarvester) fieldCapacity = 2.8;
  else if (isDrone) fieldCapacity = 6.0;
  else if (machine.horsepower >= 75) fieldCapacity = 2.0;
  else if (machine.horsepower >= 55) fieldCapacity = 1.5;
  else if (isMini) fieldCapacity = 0.65;

  return {
    name: machine.name,
    brand: machine.brand,
    category: machine.category,
    pricePerHour: machine.pricePerHour,
    pricePerDay: machine.pricePerHour * 6.5,
    horsepower: machine.horsepower,
    fuelType: isDrone ? 'Battery Electric' : 'Diesel',
    imageUrl: machine.imageUrl,
    description: `Verified agricultural mechanization unit: ${machine.horsepower} HP, calibrated for regional crop and soil conditions.`,
    location: 'Verified pickup hub near your farm cluster',
    latitude: latitude + machine.latOffset,
    longitude: longitude + machine.lngOffset,
    ownerId,
    deliveryRadiusKm: 50,
    verificationStatus: 'VERIFIED',
    status: 'AVAILABLE',
    operatorAvailable: true,
    fuelLitresPerHour: fuelRate,
    acresPerHour: fieldCapacity,
  };
};

module.exports = { demoMachines, demoDrivers, demoOperators, machineData };
