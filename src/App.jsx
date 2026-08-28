import React, { useMemo, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  LayoutDashboard,
  Tractor,
  Truck,
  CalendarDays,
  CreditCard,
  HelpCircle,
  User,
  Users,
  Bell,
  Globe,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  Wrench,
  Gauge,
  Zap,
  Sparkles,
  PhoneCall,
  Send,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  Menu,
  LogOut,
  FileText,
  AlertCircle,
  TrendingUp,
  SunMedium,
  Droplets,
  Navigation,
  Compass,
  FileCheck,
  IndianRupee,
  Eye,
  RefreshCw,
  Award,
  Filter,
  CheckCircle,
  Phone,
  MessageSquare,
  Bot,
  PlayCircle,
  BadgeCheck,
  ShieldAlert,
  Fuel
} from "lucide-react";

// ============================================================================
// DATA & ASSETS
// ============================================================================

const machineryData = [
  {
    id: "m-1",
    name: "Mahindra 575 DI XP Plus",
    brand: "Mahindra Tractors",
    type: "Heavy Tractor",
    category: "tractors",
    hp: 47,
    owner: "Sri Murugan Agro Services",
    ownerRating: 4.9,
    reviewsCount: 124,
    distance: "2.4 km away",
    distanceKm: 2.4,
    pricePerHour: 1250,
    pricePerDay: 8500,
    location: "Vallam Road, Thanjavur",
    image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80",
    verified: true,
    fuelType: "Diesel DI",
    operatorAvailable: true,
    availabilityStatus: "Available Today",
    tag: "Most Popular",
    specs: ["47 HP Engine", "Dual Clutch", "High Fuel Economy", "2WD / 4WD Ready"]
  },
  {
    id: "m-2",
    name: "John Deere 5310 PowerTech",
    brand: "John Deere",
    type: "Heavy Tractor",
    category: "tractors",
    hp: 55,
    owner: "Green Field Agri Rentals",
    ownerRating: 4.8,
    reviewsCount: 89,
    distance: "4.8 km away",
    distanceKm: 4.8,
    pricePerHour: 1550,
    pricePerDay: 10500,
    location: "Kumbakonam Highway",
    image: "https://images.unsplash.com/photo-1589874837836-e8a34d7159f8?auto=format&fit=crop&w=800&q=80",
    verified: true,
    fuelType: "Turbo Diesel",
    operatorAvailable: true,
    availabilityStatus: "Available Today",
    tag: "High Torque",
    specs: ["55 HP 4WD", "Power Steering", "2000kg Lift Capacity", "Reverse PTO"]
  },
  {
    id: "m-3",
    name: "Kubota MU4501 E-CDIS",
    brand: "Kubota",
    type: "Utility Tractor",
    category: "tractors",
    hp: 45,
    owner: "Cauvery Farm Machinery",
    ownerRating: 4.9,
    reviewsCount: 76,
    distance: "5.2 km away",
    distanceKm: 5.2,
    pricePerHour: 1400,
    pricePerDay: 9200,
    location: "Papanasam Road",
    image: "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=800&q=80",
    verified: true,
    fuelType: "E-CDIS Engine",
    operatorAvailable: true,
    availabilityStatus: "Available Today",
    tag: "Low Vibration",
    specs: ["45 HP Japanese Engine", "4WD", "Ultra Smooth Clutch", "Paddy Field Special"]
  },
  {
    id: "m-4",
    name: "Shaktiman Semi-Champion Rotavator",
    brand: "Shaktiman",
    type: "Tillage Equipment",
    category: "tillage",
    hp: 40,
    owner: "Kaveri Farm Implements",
    ownerRating: 4.7,
    reviewsCount: 62,
    distance: "6.1 km away",
    distanceKm: 6.1,
    pricePerHour: 750,
    pricePerDay: 4800,
    location: "Orathanadu Bypass",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
    verified: true,
    fuelType: "Implement",
    operatorAvailable: false,
    availabilityStatus: "Available Tomorrow",
    tag: "Best for Soil Prep",
    specs: ["7 Feet Width", "48 Boron Blades", "8-inch Working Depth", "Gear Drive"]
  },
  {
    id: "m-5",
    name: "Preet 987 Combine Harvester",
    brand: "Preet Agro",
    type: "Combine Harvester",
    category: "harvesters",
    hp: 101,
    owner: "Thanjavur Delta Harvesters",
    ownerRating: 4.9,
    reviewsCount: 145,
    distance: "8.5 km away",
    distanceKm: 8.5,
    pricePerHour: 2800,
    pricePerDay: 19500,
    location: "Budalur Road",
    image: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=800&q=80",
    verified: true,
    fuelType: "Heavy Diesel",
    operatorAvailable: true,
    availabilityStatus: "Available Today",
    tag: "Harvest Special",
    specs: ["101 HP Engine", "14ft Cutter Bar", "2400L Grain Tank", "Paddy & Wheat"]
  },
  {
    id: "m-6",
    name: "Aspee Tractor Boom Sprayer 500L",
    brand: "Aspee",
    type: "Crop Sprayer",
    category: "sprayers",
    hp: 35,
    owner: "Kisan Seva Tools",
    ownerRating: 4.6,
    reviewsCount: 38,
    distance: "3.7 km away",
    distanceKm: 3.7,
    pricePerHour: 650,
    pricePerDay: 4200,
    location: "Medical College Road",
    image: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80",
    verified: true,
    fuelType: "Implement",
    operatorAvailable: true,
    availabilityStatus: "Available Today",
    tag: "Precise Spray",
    specs: ["500L Poly Tank", "12m Boom Width", "Triple Nozzle System", "Auto Pressure Control"]
  }
];

const navigationItems = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "machines", label: "Find Machinery", icon: Tractor, badge: "6 Active" },
  { id: "booking", label: "Bookings", icon: CalendarDays, badge: "1 Active" },
  { id: "payments", label: "Payments & Escrow", icon: CreditCard },
  { id: "tracking", label: "Live Telematics", icon: Truck, badge: "Live" },
  { id: "support", label: "Help & Kisan AI", icon: HelpCircle },
];

const roleWorkspaces = {
  Farmer: {
    greeting: "Good morning, Ravi Kumar",
    subtitle: "Ideal sowing conditions today in Thanjavur. Check verified equipment available for immediate dispatch.",
    metrics: [
      { label: "Active Bookings", value: "02", sub: "1 In-Transit arriving 10:40 AM", icon: CalendarDays, type: "emerald", trend: "+1 this week" },
      { label: "Hours Saved", value: "18.5 hrs", sub: "Compared to manual harvesting", icon: Clock, type: "amber", trend: "High efficiency" },
      { label: "Nearby Equipment", value: "24 Units", sub: "Within 10 km radius", icon: MapPin, type: "blue", trend: "100% verified" }
    ]
  },
  "Machinery Owner": {
    greeting: "Welcome back, Murugan",
    subtitle: "2 new rental requests require your confirmation for Mahindra 575 DI.",
    metrics: [
      { label: "Listed Equipment", value: "06 Units", sub: "4 currently on field", icon: Tractor, type: "emerald", trend: "66% active" },
      { label: "This Month Revenue", value: "₹34,800", sub: "Next payout in 2 days", icon: IndianRupee, type: "amber", trend: "+18.4% vs last mo" },
      { label: "Fleet Utilisation", value: "78.2%", sub: "Above district average", icon: Gauge, type: "blue", trend: "+5.1% efficiency" }
    ]
  },
  "Delivery Partner": {
    greeting: "Route Ready, Suresh Kumar",
    subtitle: "3 equipment movements scheduled today. Mahindra 575 DI is in transit to Ravi's farm.",
    metrics: [
      { label: "Assigned Trips", value: "03 Trips", sub: "1 in transit, 2 scheduled", icon: Truck, type: "emerald", trend: "On schedule" },
      { label: "Completed Deliveries", value: "268", sub: "4.9 ★ verified rating", icon: CheckCircle2, type: "amber", trend: "Top partner" },
      { label: "Distance Remaining", value: "42 km", sub: "Estimated fuel 4.8 L", icon: Navigation, type: "blue", trend: "Optimized route" }
    ]
  },
  Administrator: {
    greeting: "FarmIQ Operations Control",
    subtitle: "4 equipment owner verifications and 2 safety inspection audits awaiting review.",
    metrics: [
      { label: "Active Farmers", value: "1,248", sub: "84 new this week", icon: Users, type: "emerald", trend: "+12.3% MoM" },
      { label: "Live Rentals", value: "86 Live", sub: "Across 4 Delta districts", icon: Tractor, type: "amber", trend: "Zero disputes" },
      { label: "Safety Compliance", value: "99.4%", sub: "All machinery inspected", icon: ShieldCheck, type: "blue", trend: "Certified" }
    ]
  }
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const [role, setRole] = useState("Farmer");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(machineryData[0]);
  const [language, setLanguage] = useState("en"); // 'en' | 'ta' | 'hi'

  const activeNav = useMemo(
    () => navigationItems.find((item) => item.id === screen) || { label: "My Profile" },
    [screen]
  );

  const navigateTo = (screenId, machine = null) => {
    if (machine) setSelectedMachine(machine);
    setScreen(screenId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-shell">
      {/* SIDEBAR NAVIGATION */}
      <aside className={`sidebar ${mobileMenuOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-icon-box">
            <Tractor size={24} strokeWidth={2.2} />
          </div>
          <div>
            <strong>FarmIQ</strong>
            <small>Smart Farm Machinery & Telematics</small>
          </div>
          <button
            className="mobile-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <p className="nav-label">Agri-Workspace</p>
        <nav>
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = screen === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => navigateTo(item.id)}
              >
                <span className="nav-item-content">
                  <IconComponent size={18} />
                  <span>{item.label}</span>
                </span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        {/* ROLE SWITCHER */}
        <div className="role-switch-container">
          <div className="role-switch-header">
            <Users size={14} />
            <span>Switch Workspace View</span>
          </div>
          <select
            className="role-select"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              navigateTo("dashboard");
            }}
          >
            {Object.keys(roleWorkspaces).map((roleName) => (
              <option key={roleName} value={roleName}>
                {roleName} Workspace
              </option>
            ))}
          </select>
        </div>

        {/* REGIONAL SUPPORT BANNER */}
        <div className="support-banner">
          <div className="support-banner-header">
            <PhoneCall size={14} />
            <span>Kisan Helpline 24/7</span>
          </div>
          <p>Assisted booking in Tamil, Hindi & English</p>
          <a href="tel:18001234567">
            <Phone size={13} />
            1800 123 4567 (Toll Free)
          </a>
        </div>
      </aside>

      {/* MOBILE SCRIM / BACKDROP */}
      {mobileMenuOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* MAIN VIEWPORT */}
      <main>
        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="menu-mobile-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <span className="topbar-subtitle">FARMIQ ENTERPRISE PLATFORM</span>
              <h1 className="topbar-title">{activeNav.label}</h1>
            </div>
          </div>

          <div className="header-actions">
            {/* LANGUAGE SELECTOR */}
            <button
              className="header-pill-btn"
              onClick={() => setLanguage((l) => (l === "en" ? "ta" : l === "ta" ? "hi" : "en"))}
              title="Change Language"
            >
              <Globe size={15} />
              <span>{language === "en" ? "English" : language === "ta" ? "தமிழ் (Tamil)" : "हिंदी (Hindi)"}</span>
            </button>

            {/* NOTIFICATION ICON */}
            <button className="icon-badge-btn" aria-label="View notifications">
              <Bell size={17} />
              <span className="icon-badge-dot" />
            </button>

            {/* USER PROFILE PILL */}
            <button className="profile-pill" onClick={() => navigateTo("account")}>
              <div className="profile-avatar">RK</div>
              <div className="profile-text">
                <span className="profile-name">Ravi Kumar</span>
                <span className="profile-role">Farmer · Thanjavur (FQ1024)</span>
              </div>
            </button>
          </div>
        </header>

        {/* ACTIVE SCREEN CONTENT */}
        <div className="content-container">
          {screen === "dashboard" && (
            <DashboardScreen role={role} navigateTo={navigateTo} />
          )}
          {screen === "machines" && (
            <MachinesScreen navigateTo={navigateTo} />
          )}
          {screen === "booking" && (
            <BookingScreen
              selectedMachine={selectedMachine}
              navigateTo={navigateTo}
            />
          )}
          {screen === "payments" && (
            <PaymentsScreen navigateTo={navigateTo} />
          )}
          {screen === "tracking" && (
            <TrackingScreen navigateTo={navigateTo} />
          )}
          {screen === "support" && (
            <SupportScreen language={language} />
          )}
          {screen === "account" && (
            <AccountScreen navigateTo={navigateTo} />
          )}
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// 1. DASHBOARD SCREEN
// ============================================================================

function DashboardScreen({ role, navigateTo }) {
  const currentRoleConfig = roleWorkspaces[role] || roleWorkspaces.Farmer;

  return (
    <div className="screen">
      {/* ENTERPRISE HERO BANNER */}
      <section className="hero-banner">
        <div>
          <div className="hero-tag">
            <Sparkles size={13} />
            <span>{role} Portal · Delta Agri-Zone</span>
          </div>
          <h2>{currentRoleConfig.greeting}</h2>
          <p>{currentRoleConfig.subtitle}</p>
          <div className="hero-actions">
            <button
              className="btn-primary btn-lg"
              onClick={() =>
                navigateTo(role === "Farmer" ? "machines" : "booking")
              }
            >
              <Search size={16} />
              {role === "Farmer" ? "Find Verified Machinery" : "Manage Active Operations"}
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigateTo("tracking")}
            >
              <Truck size={16} />
              View Live Telematics
            </button>
          </div>
        </div>

        {/* WEATHER & TELEMETRY WIDGET */}
        <div className="hero-telemetry-box">
          <div className="weather-badge">
            <div className="weather-info">
              <SunMedium size={28} style={{ color: "var(--amber-500)" }} />
              <div>
                <span className="weather-temp">31°C</span>
                <span className="weather-desc"> · Sunny & Clear</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "12px", color: "var(--primary-400)", fontWeight: 600, display: "block" }}>Ideal Field Work</span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>Thanjavur, TN</span>
            </div>
          </div>

          <div className="telemetry-row">
            <div className="telemetry-item">
              <small>Soil Moisture</small>
              <strong>64% Optimal</strong>
            </div>
            <div className="telemetry-item">
              <small>Wind Speed</small>
              <strong>11 km/h ENE</strong>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS / KPI GRID */}
      <section className="metrics-grid">
        {currentRoleConfig.metrics.map((metric) => {
          const IconComp = metric.icon;
          return (
            <article key={metric.label} className="metric-card">
              <div className={`metric-icon-box ${metric.type}`}>
                <IconComp size={22} />
              </div>
              <div className="metric-data">
                <div className="metric-value">{metric.value}</div>
                <div className="metric-label">{metric.label}</div>
                <div className="metric-trend">
                  <TrendingUp size={12} />
                  <span>{metric.trend}</span>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* CONDITIONAL ROLE CONTENT */}
      {role === "Farmer" && (
        <div className="two-col-grid">
          {/* RECOMMENDED EQUIPMENT */}
          <section>
            <div className="section-header">
              <div className="section-title-group">
                <h3>Recommended Machinery Near You</h3>
                <p>Verified, certified operators available in Thanjavur & Papanasam</p>
              </div>
              <button
                className="section-link-btn"
                onClick={() => navigateTo("machines")}
              >
                View all ({machineryData.length}) <ChevronRight size={14} />
              </button>
            </div>

            <div className="machine-list">
              {machineryData.slice(0, 2).map((machine) => (
                <MachineCardPro
                  key={machine.id}
                  machine={machine}
                  onBook={() => navigateTo("booking", machine)}
                />
              ))}
            </div>
          </section>

          {/* ACTIVE DISPATCH TRACKER */}
          <section>
            <div className="section-header">
              <div className="section-title-group">
                <h3>Active Booking Status</h3>
                <p>Telemetry dispatch tracking · Order #FQ-2048</p>
              </div>
              <button
                className="section-link-btn"
                onClick={() => navigateTo("tracking")}
              >
                Full GPS Screen <ChevronRight size={14} />
              </button>
            </div>

            <article className="status-card-pro">
              <div className="status-card-header">
                <div className="status-machine-info">
                  <div className="status-icon-box">
                    <Tractor size={22} />
                  </div>
                  <div>
                    <span className="status-machine-title">Mahindra 575 DI XP Plus</span>
                    <span className="status-sub">Assigned Operator: Suresh Kumar · 6 hrs rental</span>
                  </div>
                </div>
                <span className="badge-in-transit">
                  <span className="live-pulse" /> In Transit
                </span>
              </div>

              {/* TIMELINE STEPPER */}
              <div className="stepper-pro">
                <div className="stepper-track" />
                <div className="stepper-progress" />
                <div className="step-node completed">
                  <div className="step-dot">
                    <Check size={14} />
                  </div>
                  <span className="step-title">Confirmed</span>
                </div>
                <div className="step-node completed">
                  <div className="step-dot">
                    <Check size={14} />
                  </div>
                  <span className="step-title">Inspected</span>
                </div>
                <div className="step-node current">
                  <div className="step-dot">
                    <Truck size={14} />
                  </div>
                  <span className="step-title">On The Way</span>
                </div>
                <div className="step-node">
                  <div className="step-dot">4</div>
                  <span className="step-title">Handover</span>
                </div>
              </div>

              {/* ESTIMATED ARRIVAL BAR */}
              <div className="eta-banner">
                <div className="eta-left">
                  <MapPin size={18} style={{ color: "var(--primary-600)" }} />
                  <div className="eta-text">
                    <small>Estimated Arrival at Ravi's Farm</small>
                    <strong>Today, 10:40 AM (28 mins remaining)</strong>
                  </div>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => navigateTo("tracking")}
                >
                  Track Live GPS
                </button>
              </div>
            </article>
          </section>
        </div>
      )}

      {role !== "Farmer" && (
        <RoleWorkspaceDetail role={role} navigateTo={navigateTo} />
      )}
    </div>
  );
}

function RoleWorkspaceDetail({ role, navigateTo }) {
  if (role === "Machinery Owner") {
    return (
      <div className="two-col-grid">
        <section className="owner-pipeline-card">
          <div className="section-title-group" style={{ marginBottom: "16px" }}>
            <h3>Pending Rental Requests</h3>
            <p>Review & confirm bookings to lock schedules</p>
          </div>
          <div className="pipeline-item">
            <div className="pipeline-left">
              <div className="status-icon-box">
                <Tractor size={20} />
              </div>
              <div>
                <strong>Mahindra 575 DI XP Plus</strong>
                <p style={{ fontSize: "12px", color: "var(--slate-500)" }}>Ravi Kumar · 12 Aug (6 hrs) · Vallam Road</p>
              </div>
            </div>
            <div className="pipeline-actions">
              <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>
                Decline
              </button>
              <button className="btn-primary" style={{ padding: "6px 14px", fontSize: "12px" }}>
                Accept (₹7,500)
              </button>
            </div>
          </div>
          <div className="pipeline-item">
            <div className="pipeline-left">
              <div className="status-icon-box">
                <Wrench size={20} />
              </div>
              <div>
                <strong>Shaktiman Rotavator 7ft</strong>
                <p style={{ fontSize: "12px", color: "var(--slate-500)" }}>Kavitha Farm · 14 Aug (8 hrs) · Papanasam</p>
              </div>
            </div>
            <div className="pipeline-actions">
              <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>
                Decline
              </button>
              <button className="btn-primary" style={{ padding: "6px 14px", fontSize: "12px" }}>
                Accept (₹6,000)
              </button>
            </div>
          </div>
        </section>

        <section className="owner-pipeline-card">
          <div className="section-title-group" style={{ marginBottom: "16px" }}>
            <h3>Fleet Health & Telematics</h3>
            <p>Real-time equipment status and scheduled maintenance</p>
          </div>
          <div className="pipeline-item">
            <div>
              <strong>Mahindra 575 DI (TN-49-AB-1024)</strong>
              <p style={{ fontSize: "12px", color: "var(--slate-500)" }}>Next Service in 45 engine hours · Battery 96%</p>
            </div>
            <span className="machine-status-pill">Active on Field</span>
          </div>
          <div className="pipeline-item">
            <div>
              <strong>John Deere 5310 (TN-49-CD-3890)</strong>
              <p style={{ fontSize: "12px", color: "var(--slate-500)" }}>Maintenance check cleared yesterday</p>
            </div>
            <span className="machine-status-pill" style={{ background: "#F1F5F9", color: "#475569", borderColor: "#CBD5E1" }}>
              Idle at Depot
            </span>
          </div>
        </section>
      </div>
    );
  }

  if (role === "Delivery Partner") {
    return (
      <section className="owner-pipeline-card">
        <div className="section-title-group" style={{ marginBottom: "16px" }}>
          <h3>Today's Movement Manifest</h3>
          <p>Pickup, inspection checklist, and delivery handover protocol</p>
        </div>
        <div className="pipeline-item">
          <div className="pipeline-left">
            <span style={{ fontSize: "18px", fontWeight: "bold", color: "var(--primary-700)" }}>01</span>
            <div>
              <strong>Dispatch Mahindra 575 DI to Ravi Kumar Farm</strong>
              <p style={{ fontSize: "12px", color: "var(--slate-500)" }}>Pickup: Sri Murugan Agro · Drop: Vallam Road · 28 mins left</p>
            </div>
          </div>
          <button className="btn-primary" onClick={() => navigateTo("tracking")}>
            Open Live Nav
          </button>
        </div>
        <div className="pipeline-item">
          <div className="pipeline-left">
            <span style={{ fontSize: "18px", fontWeight: "bold", color: "var(--slate-400)" }}>02</span>
            <div>
              <strong>Return Shaktiman Rotavator from Kaveri Farms</strong>
              <p style={{ fontSize: "12px", color: "var(--slate-500)" }}>Scheduled 2:30 PM · Drop: Depot 2</p>
            </div>
          </div>
          <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>
            Checklist
          </button>
        </div>
      </section>
    );
  }

  // Administrator
  return (
    <section className="owner-pipeline-card">
      <div className="section-title-group" style={{ marginBottom: "16px" }}>
        <h3>Platform Compliance & Safety Audits</h3>
        <p>Verification queue for new equipment listings and dispute resolutions</p>
      </div>
      <div className="pipeline-item">
        <div>
          <strong>Preet 987 Harvester - Document Verification</strong>
          <p style={{ fontSize: "12px", color: "var(--slate-500)" }}>Owner: Thanjavur Delta Harvesters · RC Book & Insurance submitted</p>
        </div>
        <button className="btn-primary" style={{ padding: "6px 14px", fontSize: "12px" }}>
          Approve Listing
        </button>
      </div>
      <div className="pipeline-item">
        <div>
          <strong>Operator Certification Audit - 4 Applicants</strong>
          <p style={{ fontSize: "12px", color: "var(--slate-500)" }}>Tamil Nadu Agriculture University Certification Review</p>
        </div>
        <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: "12px" }}>
          Review Badges
        </button>
      </div>
    </section>
  );
}

// ============================================================================
// 2. MACHINERY MARKETPLACE SCREEN
// ============================================================================

function MachinesScreen({ navigateTo }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");

  const categories = [
    { id: "all", label: "All Equipment" },
    { id: "tractors", label: "Heavy Tractors" },
    { id: "harvesters", label: "Harvesters" },
    { id: "tillage", label: "Tillage & Rotavators" },
    { id: "sprayers", label: "Crop Sprayers" }
  ];

  const [apiMachineryData, setApiMachineryData] = useState([]);
  const [lat, setLat] = useState("10.7905");
  const [lng, setLng] = useState("79.1378");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch from the backend when component mounts or lat/lng changes
  const fetchNearbyMachinery = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/machinery/nearby?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      setApiMachineryData(data);
    } catch (err) {
      console.error("Error fetching machinery:", err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNearbyMachinery();
  }, []); // Initial load

  const filteredMachines = useMemo(() => {
    // Map backend data to match the UI's expected format
    const formattedData = apiMachineryData.map(m => ({
      id: m.id,
      name: m.name,
      brand: m.name.split(" ")[0], // Simple mock
      type: m.category,
      category: m.category.toLowerCase() + "s", 
      pricePerHour: m.pricePerHour,
      horsepower: m.horsepower,
      distanceKm: m.distance || 0,
      distance: m.distance ? `${m.distance} km` : "Nearby",
      owner: m.owner?.fullName || "Verified Owner",
      ownerRating: 4.8,
      image: "https://images.unsplash.com/photo-1592982537447-6f233c70f089?auto=format&fit=crop&q=80&w=800",
      implements: ["Rotavator", "Cultivator"],
      fuelType: "Diesel",
      badges: m.distance <= 2 ? ["Fast Dispatch", "Top Rated"] : ["Verified"]
    }));

    return formattedData
      .filter((item) => {
        const matchesCategory = activeCategory === "all" || item.category === activeCategory;
        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.owner.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "priceAsc") return a.pricePerHour - b.pricePerHour;
        if (sortBy === "priceDesc") return b.pricePerHour - a.pricePerHour;
        if (sortBy === "distance") return a.distanceKm - b.distanceKm;
        if (sortBy === "rating") return b.ownerRating - a.ownerRating;
        return 0;
      });
  }, [searchQuery, activeCategory, sortBy, apiMachineryData]);

  return (
    <div className="screen">
      <div className="marketplace-header">
        <span className="topbar-subtitle">EQUIPMENT MARKETPLACE</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, margin: "4px 0 8px" }}>
          Verified Agricultural Machinery
        </h2>
        <p style={{ color: "var(--slate-500)", fontSize: "14px" }}>
          Instant booking with GPS delivery tracking, inspected implements, and optional certified operators.
        </p>

        {/* GEO-LOCATION SEARCH WIDGET */}
        <div style={{ marginTop: "16px", display: "flex", gap: "12px", alignItems: "center", background: "var(--primary-50)", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--primary-200)" }}>
          <MapPin size={20} style={{ color: "var(--primary-700)" }} />
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "bold", color: "var(--primary-900)" }}>My Farm GPS:</span>
            <input 
              type="text" 
              value={lat} 
              onChange={e => setLat(e.target.value)} 
              placeholder="Lat (e.g. 10.79)" 
              style={{ width: "90px", padding: "4px 8px", border: "1px solid var(--slate-300)", borderRadius: "4px", fontSize: "12px" }}
            />
            <input 
              type="text" 
              value={lng} 
              onChange={e => setLng(e.target.value)} 
              placeholder="Lng (e.g. 79.13)" 
              style={{ width: "90px", padding: "4px 8px", border: "1px solid var(--slate-300)", borderRadius: "4px", fontSize: "12px" }}
            />
            <button 
              onClick={fetchNearbyMachinery}
              style={{ background: "var(--primary-600)", color: "white", border: "none", padding: "6px 16px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
            >
              {isLoading ? "Scanning..." : "Find Nearest"}
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTER CONTROLS */}
      <div className="search-filter-card">
        <div className="search-input-row">
          <div className="search-field-box">
            <Search size={18} style={{ color: "var(--slate-400)" }} />
            <input
              type="text"
              placeholder="Search tractors, combine harvesters, rotavators, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={{ color: "var(--slate-400)" }}>
                <X size={16} />
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <select
              className="form-control"
              style={{ minHeight: "44px", width: "170px" }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="distance">Nearest Distance</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* CATEGORY PILLS */}
        <div className="filter-pills-row">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`filter-pill ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* DISCOVERY MAP WIDGET */}
      <div style={{ height: "300px", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--slate-200)", marginBottom: "20px" }}>
        <MapContainer center={[parseFloat(lat), parseFloat(lng)]} zoom={12} style={{ height: "100%", width: "100%", zIndex: 1 }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          {/* Farm Pin */}
          <Marker position={[parseFloat(lat), parseFloat(lng)]}>
            <Popup><strong>My Farm</strong></Popup>
          </Marker>

          {/* Machinery Pins */}
          {apiMachineryData.map(m => {
            if (m.latitude && m.longitude) {
              return (
                <Marker key={m.id} position={[m.latitude, m.longitude]}>
                  <Popup>
                    <strong>{m.name}</strong><br/>
                    {m.distance} km away<br/>
                    ₹{m.pricePerHour}/hr
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
        </MapContainer>
      </div>

      {/* RESULTS COUNT & META */}
      <div className="results-meta-bar">
        <span className="results-count">
          Showing <strong>{filteredMachines.length} verified machines</strong> near Thanjavur (10 km radius)
        </span>
        <span style={{ fontSize: "12px", color: "var(--slate-500)" }}>
          <ShieldCheck size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px", color: "var(--primary-600)" }} />
          100% Quality Inspected
        </span>
      </div>

      {/* MACHINERY LIST */}
      <div className="machine-list">
        {filteredMachines.map((machine) => (
          <MachineCardPro
            key={machine.id}
            machine={machine}
            detailed
            onBook={() => navigateTo("booking", machine)}
          />
        ))}

        {filteredMachines.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 24px", background: "var(--white)", borderRadius: "var(--radius-lg)" }}>
            <AlertCircle size={36} style={{ color: "var(--slate-400)", margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: "16px", fontWeight: 700 }}>No machinery matched your filters</h3>
            <p style={{ color: "var(--slate-500)", fontSize: "13px", marginTop: "4px" }}>
              Try broadening your search query or reset the category filters.
            </p>
            <button
              className="btn-secondary"
              style={{ marginTop: "16px" }}
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MachineCardPro({ machine, onBook, detailed = false }) {
  return (
    <article className="machine-card-pro">
      <div className="machine-img-wrapper">
        <img src={machine.image} alt={machine.name} className="machine-img" />
        <span className="machine-type-chip">{machine.type}</span>
        {machine.verified && (
          <span className="machine-verified-badge">
            <ShieldCheck size={12} />
            <span>Verified</span>
          </span>
        )}
      </div>

      <div className="machine-body">
        <div>
          <div className="machine-top">
            <div>
              <h3 className="machine-name">{machine.name}</h3>
              <p className="machine-owner">{machine.owner} · {machine.location}</p>
            </div>
            <span className="machine-status-pill">
              <span className="live-pulse" />
              {machine.availabilityStatus}
            </span>
          </div>

          <div className="machine-specs-grid">
            <div className="spec-item">
              <Gauge size={14} />
              <span>{machine.hp} Horsepower</span>
            </div>
            <div className="spec-item">
              <MapPin size={14} />
              <span>{machine.distance}</span>
            </div>
            <div className="spec-item">
              <Star size={14} style={{ color: "var(--amber-500)", fill: "var(--amber-500)" }} />
              <span><strong>{machine.ownerRating}</strong> ({machine.reviewsCount} reviews)</span>
            </div>
            <div className="spec-item">
              <Fuel size={14} />
              <span>{machine.fuelType}</span>
            </div>
          </div>

          {detailed && machine.specs && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", margin: "6px 0 12px" }}>
              {machine.specs.map((spec) => (
                <span
                  key={spec}
                  style={{
                    background: "var(--slate-100)",
                    color: "var(--slate-700)",
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: "var(--radius-xs)"
                  }}
                >
                  {spec}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="machine-footer">
          <div className="price-box">
            <span className="price-amount">₹{machine.pricePerHour.toLocaleString("en-IN")}</span>
            <span className="price-unit">/ hour</span>
          </div>

          <button className="btn-primary" onClick={onBook}>
            <span>Reserve Machinery</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}

// ============================================================================
// 3. BOOKING ENGINE WITH LIVE QUOTE
// ============================================================================

function BookingScreen({ selectedMachine, navigateTo }) {
  const machine = selectedMachine || machineryData[0];
  const [rentalDate, setRentalDate] = useState("2026-08-25");
  const [startTime, setStartTime] = useState("08:00");
  const [durationHours, setDurationHours] = useState(6);
  const [includeOperator, setIncludeOperator] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState("Ravi Kumar's Farm, Survey No 142/3, Vallam Road, Thanjavur");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Dynamic Quote Calculation
  const baseRental = machine.pricePerHour * durationHours;
  const operatorFee = includeOperator ? 180 * durationHours : 0;
  const deliveryLogistics = 600;
  const seasonalDiscount = 500;
  const grandTotal = baseRental + operatorFee + deliveryLogistics - seasonalDiscount;
  const advanceAmount = Math.round(grandTotal * 0.5);
  const balanceOnDelivery = grandTotal - advanceAmount;

  if (isSubmitted) {
    return (
      <div className="screen" style={{ maxWidth: "640px", margin: "40px auto", textAlign: "center" }}>
        <div
          style={{
            width: "72px",
            height: "72px",
            background: "var(--primary-50)",
            color: "var(--primary-600)",
            borderRadius: "var(--radius-full)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 20px"
          }}
        >
          <CheckCircle size={40} />
        </div>

        <span className="topbar-subtitle">RESERVATION CONFIRMED</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "32px", fontWeight: 700, margin: "8px 0" }}>
          Booking Request #FQ-2051 Created
        </h2>
        <p style={{ color: "var(--slate-600)", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>
          Your request has been dispatched to <strong>{machine.owner}</strong>. Complete the 50% advance payment to lock delivery schedule.
        </p>

        <div style={{ background: "var(--white)", border: "1px solid var(--slate-200)", borderRadius: "var(--radius-lg)", padding: "20px", textAlign: "left", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", borderBottom: "1px solid var(--slate-100)", paddingBottom: "12px" }}>
            <div>
              <strong style={{ fontSize: "16px", color: "var(--slate-900)" }}>{machine.name}</strong>
              <p style={{ fontSize: "12px", color: "var(--slate-500)" }}>{rentalDate} · {startTime} ({durationHours} hours duration)</p>
            </div>
            <span className="machine-status-pill">Pending Advance</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
            <div>
              <span style={{ color: "var(--slate-500)", display: "block" }}>50% Advance Token:</span>
              <strong style={{ fontSize: "18px", color: "var(--primary-700)" }}>₹{advanceAmount.toLocaleString("en-IN")}</strong>
            </div>
            <div>
              <span style={{ color: "var(--slate-500)", display: "block" }}>Balance upon Handover:</span>
              <strong style={{ fontSize: "18px", color: "var(--slate-900)" }}>₹{balanceOnDelivery.toLocaleString("en-IN")}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button className="btn-primary btn-lg" onClick={() => navigateTo("payments")}>
            <CreditCard size={18} />
            <span>Proceed to 50% Advance Payment</span>
          </button>
          <button className="btn-secondary" onClick={() => setIsSubmitted(false)}>
            Edit Schedule
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="marketplace-header">
        <span className="topbar-subtitle">BOOKING & SCHEDULE</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, margin: "4px 0 8px" }}>
          Reserve Agricultural Machinery
        </h2>
        <p style={{ color: "var(--slate-500)", fontSize: "14px" }}>
          Set your farm location, rental duration, and optional certified operator.
        </p>
      </div>

      <div className="booking-grid">
        {/* FORM PANEL */}
        <section className="form-panel">
          {/* SELECTED MACHINE BANNER */}
          <div className="selected-machine-banner">
            <div className="selected-machine-meta">
              <img src={machine.image} alt={machine.name} className="selected-thumb" />
              <div>
                <span className="topbar-subtitle" style={{ fontSize: "10px" }}>SELECTED EQUIPMENT</span>
                <strong style={{ fontSize: "15px", display: "block", color: "var(--slate-900)" }}>{machine.name}</strong>
                <p style={{ fontSize: "12px", color: "var(--slate-500)" }}>{machine.owner} · {machine.distance}</p>
              </div>
            </div>
            <button
              className="btn-secondary"
              style={{ padding: "6px 12px", fontSize: "12px" }}
              onClick={() => navigateTo("machines")}
            >
              Change Machine
            </button>
          </div>

          <h3 className="form-panel-title">1. Schedule & Duration</h3>
          <div className="form-row-2">
            <div className="form-group">
              <label>Rental Date</label>
              <input
                type="date"
                className="form-control"
                value={rentalDate}
                onChange={(e) => setRentalDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                className="form-control"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>

          {/* DURATION RANGE SLIDER */}
          <div className="range-slider-wrapper">
            <div className="range-slider-header">
              <span>Rental Duration</span>
              <strong style={{ color: "var(--primary-700)" }}>
                {durationHours} Hours (Est. {Math.round(durationHours * 1.2)} Acres Coverage)
              </strong>
            </div>
            <input
              type="range"
              min="2"
              max="16"
              step="1"
              className="range-input"
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--slate-400)", marginTop: "6px" }}>
              <span>2 hrs (Min)</span>
              <span>8 hrs (Full Day)</span>
              <span>16 hrs (2 Shifts)</span>
            </div>
          </div>

          <h3 className="form-panel-title" style={{ marginTop: "24px" }}>2. Delivery Destination</h3>
          <div className="form-group">
            <label>Farm Address & Coordinates</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="form-control"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                style={{ paddingLeft: "36px" }}
              />
              <MapPin size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--primary-600)" }} />
            </div>
          </div>

          {/* OPERATOR TOGGLE */}
          <label className="checkbox-card">
            <input
              type="checkbox"
              checked={includeOperator}
              onChange={(e) => setIncludeOperator(e.target.checked)}
            />
            <div className="checkbox-text">
              <strong>Add Certified Equipment Operator (+₹180/hr)</strong>
              <small>TNAU certified operator trained in precision tillage and safety protocols.</small>
            </div>
          </label>
        </section>

        {/* PRICE SUMMARY SIDEBAR */}
        <aside className="summary-panel">
          <span className="summary-eyebrow">TRANSPARENT PRICING</span>
          <h3 className="summary-title">Cost Breakdown</h3>

          <div className="summary-row">
            <span>Machinery Rental ({durationHours} hrs × ₹{machine.pricePerHour})</span>
            <strong>₹{baseRental.toLocaleString("en-IN")}</strong>
          </div>

          <div className="summary-row">
            <span>Delivery & Depot Return (Flat)</span>
            <strong>₹{deliveryLogistics.toLocaleString("en-IN")}</strong>
          </div>

          {includeOperator && (
            <div className="summary-row">
              <span>Certified Operator ({durationHours} hrs × ₹180)</span>
              <strong>₹{operatorFee.toLocaleString("en-IN")}</strong>
            </div>
          )}

          <div className="summary-row discount">
            <span>First Booking Promo Discount</span>
            <strong>−₹{seasonalDiscount.toLocaleString("en-IN")}</strong>
          </div>

          <hr className="summary-divider" />

          <div className="summary-total">
            <span>Estimated Total</span>
            <strong>₹{grandTotal.toLocaleString("en-IN")}</strong>
          </div>

          {/* ADVANCE NOTE */}
          <div style={{ background: "var(--primary-50)", border: "1px solid var(--primary-200)", borderRadius: "var(--radius-md)", padding: "12px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 700, color: "var(--primary-900)" }}>
              <span>50% Advance Token Required:</span>
              <span>₹{advanceAmount.toLocaleString("en-IN")}</span>
            </div>
            <p style={{ fontSize: "11px", color: "var(--primary-800)", marginTop: "4px" }}>
              Remaining ₹{balanceOnDelivery.toLocaleString("en-IN")} payable after inspection upon delivery.
            </p>
          </div>

          <div className="security-note">
            <ShieldCheck size={18} style={{ color: "var(--primary-600)", flexShrink: 0 }} />
            <span>FarmIQ 100% Escrow Guarantee: Full refund if machinery is delayed or fails inspection.</span>
          </div>

          <button className="btn-primary btn-full btn-lg" onClick={() => setIsSubmitted(true)}>
            <span>Confirm & Request Booking</span>
            <ArrowRight size={16} />
          </button>
        </aside>
      </div>
    </div>
  );
}

// ============================================================================
// 4. PAYMENTS & ESCROW SCREEN
// ============================================================================

function PaymentsScreen({ navigateTo }) {
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const paymentMethods = [
    {
      id: "upi",
      name: "UPI Instant Payment",
      note: "Google Pay, PhonePe, Paytm, BHIM or any UPI App",
      icon: IndianRupee,
      badge: "Fastest & Recommended"
    },
    {
      id: "card",
      name: "Debit / Credit / Kisan Card",
      note: "RuPay, Visa, MasterCard, State Bank Kisan Credit Card",
      icon: CreditCard
    },
    {
      id: "cash",
      name: "Assisted Cash at Kisan Seva Kendra",
      note: "Pay cash at authorized village CSC point with receipt",
      icon: User
    }
  ];

  const handlePay = async () => {
    setIsProcessing(true);
    
    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    try {
      // Create actual booking on the backend
      const res = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmLat: 10.7905, 
          farmLng: 79.1378, 
          machineryId: "123", // Ideally passed from props, using mock
          durationHours: 6,
          totalAmount: 4340,
          advancePaid: 2170
        })
      });
      await res.json();
      
      setIsProcessing(false);
      setIsSuccess(true);
    } catch (err) {
      console.error("Payment API Error", err);
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="screen" style={{ maxWidth: "600px", margin: "40px auto", textAlign: "center" }}>
        <div
          style={{
            width: "72px",
            height: "72px",
            background: "var(--primary-50)",
            color: "var(--primary-600)",
            borderRadius: "var(--radius-full)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 20px"
          }}
        >
          <CheckCircle2 size={40} />
        </div>
        <span className="topbar-subtitle">PAYMENT SUCCESSFUL</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "30px", fontWeight: 700, margin: "8px 0" }}>
          Advance Protected in Escrow
        </h2>
        <p style={{ color: "var(--slate-600)", fontSize: "14px", marginBottom: "24px" }}>
          Transaction Reference: <strong>TXN_FQ98472901</strong>. Escrow locked and nearest driver assigned!
        </p>

        <button className="btn-primary btn-lg" onClick={() => navigateTo("tracking")}>
          <Truck size={18} />
          <span>Track Live Delivery GPS</span>
        </button>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="marketplace-header">
        <span className="topbar-subtitle">FINTECH & ESCROW GATEWAY</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, margin: "4px 0 8px" }}>
          50% Advance Payment
        </h2>
        <p style={{ color: "var(--slate-500)", fontSize: "14px" }}>
          Booking #FQ-2051 · Funds remain locked in FarmIQ Escrow until machine delivery inspection is approved.
        </p>
      </div>

      <div className="booking-grid">
        <section className="form-panel">
          <div style={{ background: "var(--primary-50)", border: "1px solid var(--primary-200)", padding: "16px", borderRadius: "var(--radius-md)", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="topbar-subtitle" style={{ fontSize: "10px" }}>AMOUNT PAYABLE NOW</span>
              <strong style={{ fontSize: "24px", color: "var(--primary-900)", display: "block" }}>₹4,340.00</strong>
              <small style={{ color: "var(--primary-700)" }}>50% Advance token for Mahindra 575 DI (6 hrs)</small>
            </div>
            <ShieldCheck size={32} style={{ color: "var(--primary-700)" }} />
          </div>

          <h3 className="form-panel-title">Choose Payment Method</h3>
          {paymentMethods.map((pm) => {
            const IconComponent = pm.icon;
            const isSelected = selectedMethod === pm.id;
            return (
              <button
                key={pm.id}
                className={`payment-method-card ${isSelected ? "selected" : ""}`}
                onClick={() => setSelectedMethod(pm.id)}
              >
                <div className="payment-method-left">
                  <span className="payment-radio-indicator" />
                  <div>
                    <strong style={{ fontSize: "14px", color: "var(--slate-900)", display: "block" }}>
                      {pm.name}
                    </strong>
                    <small style={{ fontSize: "12px", color: "var(--slate-500)" }}>{pm.note}</small>
                  </div>
                </div>
                <IconComponent size={20} style={{ color: "var(--slate-400)" }} />
              </button>
            );
          })}

          <button
            className="btn-primary btn-full btn-lg"
            style={{ marginTop: "16px" }}
            onClick={handlePay}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span>Securing Transaction...</span>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Pay ₹4,340 Securely</span>
              </>
            )}
          </button>
        </section>

        {/* TRUST & PROTECTION SIDEBAR */}
        <aside className="trust-hero-card">
          <span className="summary-eyebrow" style={{ color: "var(--primary-400)" }}>FARMIQ PROTECTION</span>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, margin: "6px 0 16px" }}>
            Guaranteed Trust in Every Rental
          </h3>

          <div className="trust-item">
            <ShieldCheck size={24} />
            <div>
              <strong>Escrow Protection</strong>
              <p>The machinery owner receives payment only after you confirm handover and inspection.</p>
            </div>
          </div>

          <div className="trust-item">
            <Wrench size={24} />
            <div>
              <strong>On-Field Replacement</strong>
              <p>If machinery malfunctions during operation, an emergency replacement is dispatched immediately.</p>
            </div>
          </div>

          <div className="trust-item">
            <PhoneCall size={24} />
            <div>
              <strong>Live Tele-Support</strong>
              <p>Regional language support advisors are on standby throughout your entire rental window.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ============================================================================
// 5. TELEMETRY & LIVE GPS TRACKING SCREEN
// ============================================================================

function TrackingScreen() {
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Automatically fetch the latest assigned ride and driver
    const fetchRide = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/rides');
        const rides = await res.json();
        const activeRide = rides.find(r => r.status === 'ASSIGNED') || rides[0];
        setRide(activeRide);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchRide();
    const interval = setInterval(fetchRide, 5000); // Live update every 5s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="screen" style={{ padding: 40, textAlign: "center" }}>Loading Live Satellite Feed...</div>;
  if (!ride) return <div className="screen" style={{ padding: 40, textAlign: "center" }}>No active dispatch found.</div>;

  const farmPos = [ride.farmLat || 10.7905, ride.farmLng || 79.1378];
  const driverPos = [ride.driver?.latitude || 10.7950, ride.driver?.longitude || 79.1400];
  const bounds = L.latLngBounds([farmPos, driverPos]);

  return (
    <div className="screen">
      <div className="marketplace-header">
        <span className="topbar-subtitle">LIVE TELEMATICS & GPS TRACKER</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, margin: "4px 0 8px" }}>
          {ride.machinery?.name || 'Machinery'} Dispatch
        </h2>
        <p style={{ color: "var(--slate-500)", fontSize: "14px" }}>
          Booking #{ride.id.substring(0,8).toUpperCase()} · Routing via Geo-Sat Array
        </p>
      </div>

      <div className="booking-grid">
        {/* LEAFLET MAP */}
        <section style={{ height: "480px", borderRadius: "16px", overflow: "hidden", border: "1px solid var(--slate-200)" }}>
          <MapContainer bounds={bounds} zoom={13} style={{ height: "100%", width: "100%", zIndex: 1 }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {/* Driver Marker */}
            <Marker position={driverPos}>
              <Popup><strong>{ride.driver?.fullName}</strong><br/>En route with equipment.</Popup>
            </Marker>
            
            {/* Farm Marker */}
            <Marker position={farmPos}>
              <Popup><strong>Destination (Your Farm)</strong></Popup>
            </Marker>
            
            {/* Route Line */}
            <Polyline positions={[driverPos, farmPos]} color="var(--primary-600)" weight={4} dashArray="8, 8" />
          </MapContainer>
        </section>

        {/* DRIVER & MILESTONE TIMELINE */}
        <aside className="form-panel">
          <div className="driver-profile-card">
            <div className="driver-avatar">{ride.driver?.fullName.substring(0, 2).toUpperCase() || 'DR'}</div>
            <div style={{ flex: 1 }}>
              <span className="topbar-subtitle" style={{ fontSize: "10px" }}>ASSIGNED OPERATOR</span>
              <strong style={{ fontSize: "14px", display: "block", color: "var(--slate-900)" }}>{ride.driver?.fullName || 'Assigning...'}</strong>
              <p style={{ fontSize: "12px", color: "var(--amber-700)" }}>★ 4.9 · {ride.driver?.phone || 'Connecting'}</p>
            </div>
            <a
              href={`tel:${ride.driver?.phone}`}
              className="btn-primary"
              style={{ padding: "8px 12px", fontSize: "12px" }}
            >
              <Phone size={14} />
              Call
            </a>
          </div>

          <h3 className="form-panel-title" style={{ marginTop: "24px" }}>Active Handover Pipeline</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <CheckCircle size={18} style={{ color: "var(--primary-600)", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ fontSize: "13px", color: "var(--slate-900)", display: "block" }}>Payment Escrowed</strong>
                <small style={{ color: "var(--slate-500)" }}>₹{ride.advancePaid} locked for {ride.machinery?.name}</small>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <CheckCircle size={18} style={{ color: "var(--primary-600)", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ fontSize: "13px", color: "var(--slate-900)", display: "block" }}>Smart Driver Assigned</strong>
                <small style={{ color: "var(--slate-500)" }}>Matched with closest operator: {ride.driver?.fullName}</small>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <Truck size={18} style={{ color: "var(--primary-600)", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ fontSize: "13px", color: "var(--primary-800)", display: "block" }}>On The Way (GPS Live)</strong>
                <small style={{ color: "var(--slate-500)" }}>Driver tracking ping updated 2s ago</small>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ============================================================================
// 6. SUPPORT & AI KISAN ASSISTANT SCREEN
// ============================================================================

function SupportScreen({ language }) {
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "bot",
      text: language === "ta"
        ? "வணக்கம் ரவி! நான் FarmIQ விவசாய உதவியாளர். டிராக்டர் முன்பதிவு, 50% அட்வான்ஸ் அல்லது உபகரண வழிகாட்டுதலில் நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?"
        : language === "hi"
        ? "नमस्ते रवि! मैं FarmIQ किसान सहायक हूँ। कृषि मशीनरी बुकिंग, अग्रिम भुगतान या संचालन ट्यूटोरियल में मैं आपकी क्या मदद कर सकता हूँ?"
        : "Hello Ravi! I am your FarmIQ Agri-Assistant. How can I assist you with equipment reservations, 50% advance escrow, or machinery tutorials today?"
    }
  ]);
  const [inputVal, setInputVal] = useState("");

  const quickPrompts = [
    "How does 50% advance escrow work?",
    "Recommend tractor for 4 acres paddy land",
    "What implements are available for rotavator?",
    "How to verify equipment inspection?"
  ];

  const handleSend = (textToSend) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const userMsg = { id: Date.now().toString(), sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");

    setTimeout(() => {
      let reply = "Our support line is ready to assist you. ";
      if (text.toLowerCase().includes("escrow") || text.toLowerCase().includes("advance")) {
        reply = "With FarmIQ Escrow, your 50% advance is held securely in a bank-guaranteed account. The machinery owner only receives payment after the delivery person arrives at your farm and you approve the inspection checklist.";
      } else if (text.toLowerCase().includes("paddy") || text.toLowerCase().includes("tractor")) {
        reply = "For 4 acres of wet paddy field in Thanjavur, we recommend the Kubota MU4501 4WD (45 HP) or Mahindra 575 DI. Both offer high torque in muddy soil with minimal fuel consumption.";
      } else {
        reply = "I've logged your query. You can also connect directly with our regional agricultural specialist at toll-free 1800 123 4567.";
      }

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: "bot", text: reply }
      ]);
    }, 600);
  };

  return (
    <div className="screen">
      <div className="marketplace-header">
        <span className="topbar-subtitle">HELP, EDUCATION & AI KISAN ASSISTANT</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, margin: "4px 0 8px" }}>
          Agricultural Guidance in Your Language
        </h2>
        <p style={{ color: "var(--slate-500)", fontSize: "14px" }}>
          Get instant answers on machinery operation, escrow security, or connect with agronomists.
        </p>
      </div>

      {/* THREE HELP CHANNELS */}
      <div className="help-grid-pro">
        <div className="help-card-pro">
          <div className="help-card-icon">
            <Bot size={22} />
          </div>
          <h4>FarmIQ AI Agri-Bot</h4>
          <p>Instant answers on machinery specs, soil suitability, and booking calculations.</p>
          <span style={{ fontSize: "12px", fontWeight: "bold", color: "var(--primary-700)" }}>Available 24/7 in 3 Languages</span>
        </div>

        <div className="help-card-pro">
          <div className="help-card-icon">
            <PhoneCall size={22} />
          </div>
          <h4>Regional Phone Helpline</h4>
          <p>Talk to local agronomists in Tamil, Hindi, or English for phone-assisted bookings.</p>
          <a href="tel:18001234567" style={{ fontSize: "12px", fontWeight: "bold", color: "var(--primary-700)" }}>
            Call 1800 123 4567 →
          </a>
        </div>

        <div className="help-card-pro">
          <div className="help-card-icon">
            <PlayCircle size={22} />
          </div>
          <h4>Machinery Video Tutorials</h4>
          <p>Step-by-step video lessons on operating rotavators, harvesters, and boom sprayers safely.</p>
          <span style={{ fontSize: "12px", fontWeight: "bold", color: "var(--primary-700)" }}>12 Verified Modules</span>
        </div>
      </div>

      {/* INTERACTIVE CHAT CONTAINER */}
      <div className="chat-container-pro">
        <div className="chat-header-pro">
          <Bot size={20} />
          <div>
            <strong style={{ fontSize: "14px", display: "block" }}>FarmIQ AI Assistant</strong>
            <small style={{ fontSize: "11px", color: "var(--primary-400)" }}>Active · Instant Response</small>
          </div>
        </div>

        <div className="chat-body-pro">
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                maxWidth: "80%"
              }}
            >
              <div
                style={{
                  background: msg.sender === "user" ? "var(--primary-700)" : "var(--white)",
                  color: msg.sender === "user" ? "var(--white)" : "var(--slate-800)",
                  border: msg.sender === "user" ? "none" : "1px solid var(--slate-200)",
                  padding: "12px 16px",
                  borderRadius: msg.sender === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  boxShadow: "var(--shadow-xs)"
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* QUICK PROMPT CHIPS */}
          <div className="quick-prompts-row">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                className="quick-prompt-btn"
                onClick={() => handleSend(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="chat-footer-pro">
          <input
            type="text"
            placeholder="Ask anything about farm machinery, advance payment, or soil prep..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button className="btn-primary" onClick={() => handleSend()}>
            <Send size={15} />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 7. ACCOUNT & AUTHENTICATION PORTAL
// ============================================================================

function AccountScreen({ navigateTo }) {
  const [isRegister, setIsRegister] = useState(false);
  const [mobileNum, setMobileNum] = useState("98765 43210");
  const [fullName, setFullName] = useState("Ravi Kumar");

  return (
    <div className="screen">
      <div className="auth-split-wrapper">
        {/* BRAND PROMISE HERO */}
        <section className="auth-hero-panel">
          <div>
            <div className="brand-icon-box" style={{ marginBottom: "24px" }}>
              <Tractor size={28} />
            </div>
            <span className="hero-tag">ENTERPRISE AGRI-TECH</span>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "36px", fontWeight: 700, margin: "12px 0 16px", lineHeight: "1.2" }}>
              Modern Agricultural Machinery Within Every Farmer's Reach.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px", lineHeight: "1.6" }}>
              Book trusted equipment, coordinate GPS delivery, and safeguard transactions with advance escrow.
            </p>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px" }}>
            <div style={{ display: "flex", gap: "24px" }}>
              <div>
                <strong style={{ fontSize: "18px", color: "var(--primary-400)", display: "block" }}>1,240+</strong>
                <small style={{ color: "rgba(255,255,255,0.6)" }}>Verified Farmers</small>
              </div>
              <div>
                <strong style={{ fontSize: "18px", color: "var(--primary-400)", display: "block" }}>100%</strong>
                <small style={{ color: "rgba(255,255,255,0.6)" }}>Escrow Protection</small>
              </div>
            </div>
          </div>
        </section>

        {/* AUTH FORM */}
        <form
          className="auth-form-panel"
          onSubmit={(e) => {
            e.preventDefault();
            navigateTo("dashboard");
          }}
        >
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${!isRegister ? "active" : ""}`}
              onClick={() => setIsRegister(false)}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${isRegister ? "active" : ""}`}
              onClick={() => setIsRegister(true)}
            >
              New Registration
            </button>
          </div>

          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 700, marginBottom: "6px" }}>
            {isRegister ? "Create Your FarmIQ Profile" : "Sign In to FarmIQ"}
          </h2>
          <p style={{ color: "var(--slate-500)", fontSize: "13px", marginBottom: "20px" }}>
            {isRegister ? "Select your workspace role to begin" : "Enter your mobile number to receive OTP"}
          </p>

          {isRegister && (
            <div className="form-group">
              <label>Select User Role</label>
              <select className="form-control">
                <option>Farmer (Rent & Track Equipment)</option>
                <option>Machinery Owner (List & Earn)</option>
                <option>Delivery Partner (Logistics & Handover)</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Mobile Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 98765 43210"
              value={mobileNum}
              onChange={(e) => setMobileNum(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>{isRegister ? "Full Name" : "OTP / Password"}</label>
            <input
              type={isRegister ? "text" : "password"}
              className="form-control"
              placeholder={isRegister ? "Ravi Kumar" : "••••••"}
              value={isRegister ? fullName : "123456"}
              onChange={(e) => isRegister && setFullName(e.target.value)}
            />
          </div>

          <button className="btn-primary btn-full btn-lg" style={{ marginTop: "12px" }}>
            <span>Continue to Workspace</span>
            <ArrowRight size={16} />
          </button>

          <p style={{ textAlign: "center", fontSize: "11px", color: "var(--slate-400)", marginTop: "16px" }}>
            By continuing, you agree to FarmIQ Terms of Service & Safety Escrow Rules.
          </p>
        </form>
      </div>
    </div>
  );
}
