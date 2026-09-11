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
import { getTranslation } from "./translations";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ============================================================================
// DATA & ASSETS
// ============================================================================

const machineryData = [
  {
    id: "mach-001",
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
    id: "mach-002",
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
    image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80",
    verified: true,
    fuelType: "Turbo Diesel",
    operatorAvailable: true,
    availabilityStatus: "Available Today",
    tag: "High Torque",
    specs: ["55 HP 4WD", "Power Steering", "2000kg Lift Capacity", "Reverse PTO"]
  },
  {
    id: "mach-003",
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
    id: "mach-004",
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
    availabilityStatus: "Available Today",
    tag: "Fast Tillage",
    specs: ["7-Foot Working Width", "Multi-Speed Gearbox", "Boron Steel Blades", "Paddy & Dry Land"]
  },
  {
    id: "mach-005",
    name: "Preet 987 Combine Harvester",
    brand: "Preet",
    type: "Combine Harvester",
    category: "harvesters",
    hp: 101,
    owner: "Delta Harvester Fleet",
    ownerRating: 4.9,
    reviewsCount: 110,
    distance: "8.4 km away",
    distanceKm: 8.4,
    pricePerHour: 2800,
    pricePerDay: 19500,
    location: "Budalur Road",
    image: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=800&q=80",
    verified: true,
    fuelType: "Heavy Diesel",
    operatorAvailable: true,
    availabilityStatus: "Available Today",
    tag: "High Output",
    specs: ["101 HP Turbo", "14-Foot Cutter Bar", "Straw Walker System", "Grain Tank 2.4 m³"]
  },
  {
    id: "mach-006",
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

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const [role, setRole] = useState("Farmer");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(machineryData[0]);
  const [language, setLanguage] = useState("en"); // 'en' | 'ta' | 'hi'
  const [bookingDraft, setBookingDraft] = useState(null);
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem("farmiqSession")) || null; } catch { return null; }
  });

  const t = useMemo(() => getTranslation(language), [language]);

  const saveSession = (nextSession) => {
    setSession(nextSession);
    localStorage.setItem("farmiqSession", JSON.stringify(nextSession));
    const roleMap = { FARMER: "Farmer", OWNER: "Machinery Owner", DRIVER: "Delivery Partner", ADMIN: "Administrator" };
    if (nextSession?.user?.role) setRole(roleMap[nextSession.user.role] || "Farmer");
  };

  useEffect(() => {
    const roleMap = { FARMER: "Farmer", OWNER: "Machinery Owner", DRIVER: "Delivery Partner", ADMIN: "Administrator" };
    if (session?.user?.role) setRole(roleMap[session.user.role] || "Farmer");
  }, [session]);

  const profileName = session?.user?.fullName || "Ravi Kumar";
  const profileInitials = profileName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const profileAccountId = session?.user?.accountId || "FARM-001";

  const navigationItems = useMemo(() => [
    { id: "dashboard", label: t.nav_dashboard, icon: LayoutDashboard },
    { id: "machines", label: t.nav_machines, icon: Tractor, badge: `6 ${t.badge_active}` },
    { id: "booking", label: t.nav_booking, icon: CalendarDays, badge: `1 ${t.badge_active}` },
    { id: "payments", label: t.nav_payments, icon: CreditCard },
    { id: "tracking", label: t.nav_tracking, icon: Truck, badge: t.badge_live },
    { id: "support", label: t.nav_support, icon: HelpCircle },
  ], [t]);

  const activeNav = useMemo(
    () => navigationItems.find((item) => item.id === screen) || { label: t.myProfile },
    [screen, navigationItems, t]
  );

  const navigateTo = (screenId, machine = null) => {
    if (machine) setSelectedMachine(machine);
    setScreen(screenId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const roleLabels = {
    Farmer: t.role_Farmer,
    "Machinery Owner": t.role_MachineryOwner,
    "Delivery Partner": t.role_DeliveryPartner,
    Administrator: t.role_Administrator
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
            <strong>{t.brandTitle}</strong>
            <small>{t.brandSubtitle}</small>
          </div>
          <button
            className="mobile-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <p className="nav-label">{t.agriWorkspace}</p>
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
            <span>{t.switchWorkspace}</span>
          </div>
          <select
            className="role-select"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              navigateTo("dashboard");
            }}
          >
            <option value="Farmer">{t.role_Farmer_workspace}</option>
            <option value="Machinery Owner">{t.role_MachineryOwner_workspace}</option>
            <option value="Delivery Partner">{t.role_DeliveryPartner_workspace}</option>
            <option value="Administrator">{t.role_Administrator_workspace}</option>
          </select>
        </div>

        {/* REGIONAL SUPPORT BANNER */}
        <div className="support-banner">
          <div className="support-banner-header">
            <PhoneCall size={14} />
            <span>{t.kisanHelpline}</span>
          </div>
          <p>{t.assistedBooking}</p>
          <a href="tel:18001234567">
            <Phone size={13} />
            {t.tollFree}
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
              <span className="topbar-subtitle">{t.enterprisePlatform}</span>
              <h1 className="topbar-title">{activeNav.label}</h1>
            </div>
          </div>

          <div className="header-actions">
            {/* LANGUAGE SELECTOR */}
            <button
              className="header-pill-btn"
              onClick={() => setLanguage((l) => (l === "en" ? "ta" : l === "ta" ? "hi" : "en"))}
              title={t.changeLanguage}
            >
              <Globe size={15} />
              <span>{t.languageName}</span>
            </button>

            {/* NOTIFICATION ICON */}
            <button className="icon-badge-btn" aria-label={t.notifications}>
              <Bell size={17} />
              <span className="icon-badge-dot" />
            </button>

            {/* USER PROFILE PILL */}
            <button className="profile-pill" onClick={() => navigateTo("account")}>
              <div className="profile-avatar">{profileInitials}</div>
              <div className="profile-text">
                <span className="profile-name">{profileName}</span>
                <span className="profile-role">{roleLabels[role] || role} · {profileAccountId}</span>
              </div>
            </button>
          </div>
        </header>

        {/* ACTIVE SCREEN CONTENT */}
        <div className="content-container">
          {screen === "dashboard" && (
            <DashboardScreen role={role} navigateTo={navigateTo} t={t} />
          )}
          {screen === "machines" && (
            <MachinesScreen navigateTo={navigateTo} t={t} />
          )}
          {screen === "booking" && (
            <BookingScreen
              selectedMachine={selectedMachine}
              navigateTo={navigateTo}
              setBookingDraft={setBookingDraft}
              t={t}
            />
          )}
          {screen === "payments" && (
            <PaymentsScreen
              navigateTo={navigateTo}
              selectedMachine={selectedMachine}
              bookingDraft={bookingDraft}
              session={session}
              t={t}
            />
          )}
          {screen === "tracking" && (
            <TrackingScreen navigateTo={navigateTo} t={t} />
          )}
          {screen === "support" && (
            <SupportScreen language={language} t={t} />
          )}
          {screen === "account" && (
            <AccountScreen navigateTo={navigateTo} onLogin={saveSession} t={t} />
          )}
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// 1. DASHBOARD SCREEN
// ============================================================================

function DashboardScreen({ role, navigateTo, t }) {
  const roleConfig = useMemo(() => {
    switch (role) {
      case "Machinery Owner":
        return {
          greeting: t.ownerGreeting,
          subtitle: t.ownerSubtitle,
          metrics: [
            { label: t.metric_listedEquipment, value: "06 Units", sub: t.metric_listedEquipmentSub, icon: Tractor, type: "emerald", trend: t.metric_listedEquipmentTrend },
            { label: t.metric_monthRevenue, value: "₹34,800", sub: t.metric_monthRevenueSub, icon: IndianRupee, type: "amber", trend: t.metric_monthRevenueTrend },
            { label: t.metric_fleetUtilisation, value: "78.2%", sub: t.metric_fleetUtilisationSub, icon: Gauge, type: "blue", trend: t.metric_fleetUtilisationTrend }
          ]
        };
      case "Delivery Partner":
        return {
          greeting: t.driverGreeting,
          subtitle: t.driverSubtitle,
          metrics: [
            { label: t.metric_assignedTrips, value: "03 Trips", sub: t.metric_assignedTripsSub, icon: Truck, type: "emerald", trend: t.metric_assignedTripsTrend },
            { label: t.metric_completedDeliveries, value: "268", sub: t.metric_completedDeliveriesSub, icon: CheckCircle2, type: "amber", trend: t.metric_completedDeliveriesTrend },
            { label: t.metric_distanceRemaining, value: "42 km", sub: t.metric_distanceRemainingSub, icon: Navigation, type: "blue", trend: t.metric_distanceRemainingTrend }
          ]
        };
      case "Administrator":
        return {
          greeting: t.adminGreeting,
          subtitle: t.adminSubtitle,
          metrics: [
            { label: t.metric_activeFarmers, value: "1,248", sub: t.metric_activeFarmersSub, icon: Users, type: "emerald", trend: t.metric_activeFarmersTrend },
            { label: t.metric_liveRentals, value: "86 Live", sub: t.metric_liveRentalsSub, icon: Tractor, type: "amber", trend: t.metric_liveRentalsTrend },
            { label: t.metric_safetyCompliance, value: "99.4%", sub: t.metric_safetyComplianceSub, icon: ShieldCheck, type: "blue", trend: t.metric_safetyComplianceTrend }
          ]
        };
      case "Farmer":
      default:
        return {
          greeting: t.farmerGreeting,
          subtitle: t.farmerSubtitle,
          metrics: [
            { label: t.metric_activeBookings, value: "02", sub: t.metric_activeBookingsSub, icon: CalendarDays, type: "emerald", trend: t.metric_activeBookingsTrend },
            { label: t.metric_hoursSaved, value: "18.5 hrs", sub: t.metric_hoursSavedSub, icon: Clock, type: "amber", trend: t.metric_hoursSavedTrend },
            { label: t.metric_nearbyEquipment, value: "24 Units", sub: t.metric_nearbyEquipmentSub, icon: MapPin, type: "blue", trend: t.metric_nearbyEquipmentTrend }
          ]
        };
    }
  }, [role, t]);

  const roleNameDisplay = {
    Farmer: t.role_Farmer,
    "Machinery Owner": t.role_MachineryOwner,
    "Delivery Partner": t.role_DeliveryPartner,
    Administrator: t.role_Administrator
  }[role] || role;

  return (
    <div className="screen">
      {/* ENTERPRISE HERO BANNER */}
      <section className="hero-banner">
        <div>
          <div className="hero-tag">
            <Sparkles size={13} />
            <span>{roleNameDisplay} {t.portalDeltaTag}</span>
          </div>
          <h2>{roleConfig.greeting}</h2>
          <p>{roleConfig.subtitle}</p>
          <div className="hero-actions">
            <button
              className="btn-primary btn-lg"
              onClick={() =>
                navigateTo(role === "Farmer" ? "machines" : "booking")
              }
            >
              <Search size={16} />
              {role === "Farmer" ? t.findVerifiedMachinery : t.manageActiveOperations}
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigateTo("tracking")}
            >
              <Truck size={16} />
              {t.viewLiveTelematics}
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
                <span className="weather-desc"> · {t.weatherSunny}</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "12px", color: "var(--primary-400)", fontWeight: 600, display: "block" }}>{t.idealFieldWork}</span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>{t.weatherLocation}</span>
            </div>
          </div>

          <div className="telemetry-row">
            <div className="telemetry-item">
              <small>{t.soilMoisture}</small>
              <strong>{t.soilMoistureVal}</strong>
            </div>
            <div className="telemetry-item">
              <small>{t.windSpeed}</small>
              <strong>{t.windSpeedVal}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS / KPI GRID */}
      <section className="metrics-grid">
        {roleConfig.metrics.map((metric) => {
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
                <h3>{t.recommendedMachinery}</h3>
                <p>{t.recommendedSubtitle}</p>
              </div>
              <button
                className="section-link-btn"
                onClick={() => navigateTo("machines")}
              >
                {t.viewAll} ({machineryData.length}) <ChevronRight size={14} />
              </button>
            </div>

            <div className="machine-list">
              {machineryData.slice(0, 2).map((machine) => (
                <MachineCardPro
                  key={machine.id}
                  machine={machine}
                  onBook={() => navigateTo("booking", machine)}
                  t={t}
                />
              ))}
            </div>
          </section>

          {/* ACTIVE DISPATCH TRACKER */}
          <section>
            <div className="section-header">
              <div className="section-title-group">
                <h3>{t.activeBookingStatus}</h3>
                <p>{t.activeBookingSubtitle}</p>
              </div>
              <button
                className="section-link-btn"
                onClick={() => navigateTo("tracking")}
              >
                {t.fullGpsScreen} <ChevronRight size={14} />
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
                    <span className="status-sub">{t.assignedDeliveryPartner}: Suresh Kumar · 6 {t.hours}</span>
                  </div>
                </div>
                <span className="badge-in-transit">
                  <span className="live-pulse" /> {t.inTransit}
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
                  <span className="step-title">{t.orderConfirmed}</span>
                </div>
                <div className="step-node completed">
                  <div className="step-dot">
                    <Check size={14} />
                  </div>
                  <span className="step-title">{t.depotInspection}</span>
                </div>
                <div className="step-node current">
                  <div className="step-dot">
                    <Truck size={14} />
                  </div>
                  <span className="step-title">{t.inTransit}</span>
                </div>
                <div className="step-node">
                  <div className="step-dot">4</div>
                  <span className="step-title">{t.farmHandover}</span>
                </div>
              </div>

              {/* ESTIMATED ARRIVAL BAR */}
              <div className="eta-banner">
                <div className="eta-left">
                  <MapPin size={18} style={{ color: "var(--primary-600)" }} />
                  <div className="eta-text">
                    <small>{t.farmHandover}</small>
                    <strong>{t.farmHandoverSub} (28 mins remaining)</strong>
                  </div>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => navigateTo("tracking")}
                >
                  {t.fullGpsScreen}
                </button>
              </div>
            </article>
          </section>
        </div>
      )}

      {role !== "Farmer" && (
        <RoleWorkspaceDetail role={role} navigateTo={navigateTo} t={t} />
      )}
    </div>
  );
}

function RoleWorkspaceDetail({ role, navigateTo, t }) {
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
            <span className="machine-status-pill">{t.badges_verified}</span>
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
    return <DeliveryPartnerLiveWorkspace navigateTo={navigateTo} t={t} />;
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

function DeliveryPartnerLiveWorkspace({ navigateTo, t }) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchDeliveries = async () => {
    try {
      const res = await fetch(`${API_URL}/api/driver/deliveries`);
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data);
      }
    } catch (err) {
      console.error("Error fetching driver deliveries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    const interval = setInterval(fetchDeliveries, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptDelivery = async (bookingId) => {
    setActionLoadingId(bookingId);
    try {
      const res = await fetch(`${API_URL}/api/driver/deliveries/${bookingId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        await fetchDeliveries();
      }
    } catch (err) {
      console.error("Failed to accept delivery:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateStatus = async (bookingId, nextStatus) => {
    setActionLoadingId(bookingId);
    try {
      const res = await fetch(`${API_URL}/api/driver/deliveries/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        await fetchDeliveries();
        if (nextStatus === "IN_TRANSIT") {
          navigateTo("tracking");
        }
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="two-col-grid">
      <section className="owner-pipeline-card">
        <div className="section-title-group" style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3>Live Movement Manifest</h3>
            <p>Real-time booking requests ready for logistics pickup & handover</p>
          </div>
          <span className="badge-in-transit" style={{ background: "var(--primary-50)", color: "var(--primary-700)", borderColor: "var(--primary-200)" }}>
            <span className="live-pulse" /> {deliveries.length} Active Dispatch
          </span>
        </div>

        {loading && <p style={{ color: "var(--slate-500)", fontSize: "13px" }}>Loading delivery queue from database...</p>}

        {!loading && deliveries.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 16px", background: "var(--slate-50)", borderRadius: "var(--radius-md)" }}>
            <Truck size={32} style={{ color: "var(--slate-400)", margin: "0 auto 8px" }} />
            <p style={{ fontWeight: 600, color: "var(--slate-700)" }}>No delivery requests currently</p>
            <small style={{ color: "var(--slate-500)" }}>When a farmer books machinery, it will instantly appear here for you to accept.</small>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {deliveries.map((item, index) => {
            const isAssigned = item.status === "ASSIGNED";
            const isInTransit = item.status === "IN_TRANSIT";
            const isDelivered = item.status === "DELIVERED";

            return (
              <div key={item.id} className="pipeline-item" style={{ flexDirection: "column", alignItems: "stretch", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div className="pipeline-left">
                    <span style={{ fontSize: "16px", fontWeight: "bold", color: "var(--primary-700)" }}>
                      0{index + 1}
                    </span>
                    <div>
                      <strong style={{ fontSize: "14px", display: "block" }}>
                        {item.machinery?.name || "Machinery"}
                      </strong>
                      <p style={{ fontSize: "12px", color: "var(--slate-500)", marginTop: "2px" }}>
                        Farmer: <strong>{item.farmer?.fullName || "Ravi Kumar"}</strong> ({item.farmer?.phone || "Phone"})
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--slate-600)" }}>
                        Drop Location: {item.farmAddress || `${item.farmLat}, ${item.farmLng}`}
                      </p>
                    </div>
                  </div>

                  <span
                    className="machine-status-pill"
                    style={{
                      background: isInTransit ? "var(--primary-50)" : isDelivered ? "#F3E8FF" : "var(--slate-100)",
                      color: isInTransit ? "var(--primary-700)" : isDelivered ? "#7E22CE" : "var(--slate-700)",
                      borderColor: isInTransit ? "var(--primary-300)" : isDelivered ? "#D8B4FE" : "var(--slate-300)"
                    }}
                  >
                    {item.status.replace("_", " ")}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", borderTop: "1px solid var(--slate-100)", paddingTop: "10px" }}>
                  <button
                    className="btn-secondary"
                    style={{ padding: "6px 12px", fontSize: "12px" }}
                    onClick={() => navigateTo("tracking")}
                  >
                    <Navigation size={13} />
                    {t.fullGpsScreen}
                  </button>

                  {!item.driverId && (
                    <button
                      className="btn-primary"
                      style={{ padding: "6px 14px", fontSize: "12px" }}
                      disabled={actionLoadingId === item.id}
                      onClick={() => handleAcceptDelivery(item.id)}
                    >
                      {actionLoadingId === item.id ? "Accepting..." : "Accept Delivery (+₹600)"}
                    </button>
                  )}

                  {isAssigned && (
                    <button
                      className="btn-primary"
                      style={{ padding: "6px 14px", fontSize: "12px", background: "var(--primary-700)" }}
                      disabled={actionLoadingId === item.id}
                      onClick={() => handleUpdateStatus(item.id, "IN_TRANSIT")}
                    >
                      {actionLoadingId === item.id ? "Starting..." : "Start GPS Transit"}
                    </button>
                  )}

                  {isInTransit && (
                    <button
                      className="btn-primary"
                      style={{ padding: "6px 14px", fontSize: "12px", background: "#059669" }}
                      disabled={actionLoadingId === item.id}
                      onClick={() => handleUpdateStatus(item.id, "DELIVERED")}
                    >
                      {actionLoadingId === item.id ? "Updating..." : "Mark Delivered & Handover"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* DRIVER STATS & EARNINGS PANEL */}
      <section className="owner-pipeline-card">
        <div className="section-title-group" style={{ marginBottom: "16px" }}>
          <h3>Driver Performance & Quick Actions</h3>
          <p>Verified driver payout rates and protocol checklists</p>
        </div>

        <div style={{ background: "var(--primary-50)", border: "1px solid var(--primary-200)", padding: "16px", borderRadius: "var(--radius-md)", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--primary-800)", textTransform: "uppercase" }}>Fixed Logistics Rate</span>
              <strong style={{ fontSize: "20px", display: "block", color: "var(--primary-900)" }}>₹600 / Delivery</strong>
            </div>
            <ShieldCheck size={28} style={{ color: "var(--primary-600)" }} />
          </div>
          <small style={{ color: "var(--primary-700)", display: "block", marginTop: "4px" }}>
            Direct payment credited to your bank upon farmer digital handover signoff.
          </small>
        </div>

        <div className="pipeline-item">
          <div className="pipeline-left">
            <CheckCircle2 size={18} style={{ color: "var(--primary-600)" }} />
            <div>
              <strong>Pre-Transit Depot Checklist</strong>
              <p style={{ fontSize: "12px", color: "var(--slate-500)" }}>Tire pressure, hydraulic oil, implement pin lock</p>
            </div>
          </div>
        </div>

        <div className="pipeline-item">
          <div className="pipeline-left">
            <CheckCircle2 size={18} style={{ color: "var(--primary-600)" }} />
            <div>
              <strong>Safety Escrow Handover Protocol</strong>
              <p style={{ fontSize: "12px", color: "var(--slate-500)" }}>Confirm delivery coordinates with farmer on field</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// 2. MACHINERY MARKETPLACE SCREEN
// ============================================================================

function MachinesScreen({ navigateTo, t }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");

  const categories = useMemo(() => [
    { id: "all", label: t.catAll },
    { id: "tractors", label: t.catTractors },
    { id: "harvesters", label: t.catHarvesters },
    { id: "tillage", label: t.catTillage },
    { id: "sprayers", label: t.catSprayers }
  ], [t]);

  const [apiMachineryData, setApiMachineryData] = useState(machineryData);
  const [lat, setLat] = useState("10.7905");
  const [lng, setLng] = useState("79.1378");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch from the backend when component mounts or lat/lng changes
  const fetchNearbyMachinery = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/machinery/nearby?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error("Could not load machinery");
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
      brand: m.name.split(" ")[0],
      type: m.category,
      category: ({ TRACTOR: "tractors", HARVESTER: "harvesters", TILLAGE: "tillage", SPRAYER: "sprayers" })[m.category] || m.category,
      pricePerHour: m.pricePerHour,
      hp: m.horsepower ?? m.hp,
      distanceKm: m.distance || 0,
      distance: m.distance ? `${m.distance} km` : "Nearby",
      owner: m.owner?.fullName || m.owner || "Verified Owner",
      ownerRating: 4.8,
      image: m.imageUrl || m.image,
      implements: ["Rotavator", "Cultivator"],
      fuelType: m.fuelType || "Diesel",
      badges: m.distance <= 2 ? [t.badges_fastDispatch, t.badges_topRated] : [t.badges_verified]
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
  }, [searchQuery, activeCategory, sortBy, apiMachineryData, t]);

  return (
    <div className="screen">
      <div className="marketplace-header">
        <span className="topbar-subtitle">{t.marketplaceSub}</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, margin: "4px 0 8px" }}>
          {t.marketplaceHeading}
        </h2>
        <p style={{ color: "var(--slate-500)", fontSize: "14px" }}>
          {t.marketplaceDescription}
        </p>

        {/* GEO-LOCATION SEARCH WIDGET */}
        <div style={{ marginTop: "16px", display: "flex", gap: "12px", alignItems: "center", background: "var(--primary-50)", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--primary-200)" }}>
          <MapPin size={20} style={{ color: "var(--primary-700)" }} />
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "bold", color: "var(--primary-900)" }}>{t.myFarmGps}</span>
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
              {isLoading ? t.scanningBtn : t.findNearestBtn}
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
              placeholder={t.searchMachineryPlaceholder}
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
              style={{ minHeight: "44px", width: "180px" }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recommended">{t.sortRecommended}</option>
              <option value="distance">{t.sortDistance}</option>
              <option value="priceAsc">{t.sortPriceLow}</option>
              <option value="priceDesc">{t.sortPriceHigh}</option>
              <option value="rating">{t.sortRating}</option>
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
        <MapContainer center={[parseFloat(lat) || 10.7905, parseFloat(lng) || 79.1378]} zoom={12} style={{ height: "100%", width: "100%", zIndex: 1 }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {/* Farm Pin */}
          <Marker position={[parseFloat(lat) || 10.7905, parseFloat(lng) || 79.1378]}>
            <Popup><strong>{t.destinationFarmMarker}</strong></Popup>
          </Marker>

          {/* Machinery Pins */}
          {apiMachineryData.map(m => {
            if (m.latitude && m.longitude) {
              return (
                <Marker key={m.id} position={[m.latitude, m.longitude]}>
                  <Popup>
                    <strong>{m.name}</strong><br/>
                    {m.distance} km<br/>
                    ₹{m.pricePerHour}{t.perHour}
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
          {t.showing} <strong>{filteredMachines.length} {t.verifiedMachinesRadius}</strong>
        </span>
        <span style={{ fontSize: "12px", color: "var(--slate-500)" }}>
          <ShieldCheck size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px", color: "var(--primary-600)" }} />
          {t.qualityInspected100}
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
            t={t}
          />
        ))}

        {filteredMachines.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 24px", background: "var(--white)", borderRadius: "var(--radius-lg)" }}>
            <AlertCircle size={36} style={{ color: "var(--slate-400)", margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: "16px", fontWeight: 700 }}>{t.noMachineryFound}</h3>
            <button
              className="btn-secondary"
              style={{ marginTop: "16px" }}
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
            >
              {t.resetFilters}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MachineCardPro({ machine, onBook, detailed = false, t }) {
  return (
    <article className="machine-card-pro">
      <div className="machine-img-wrapper">
        <img src={machine.image} alt={machine.name} className="machine-img" />
        <span className="machine-type-chip">{machine.type}</span>
        {machine.verified && (
          <span className="machine-verified-badge">
            <ShieldCheck size={12} />
            <span>{t.badges_verified}</span>
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
              <span>{machine.hp} {t.hp}</span>
            </div>
            <div className="spec-item">
              <MapPin size={14} />
              <span>{machine.distance}</span>
            </div>
            <div className="spec-item">
              <Star size={14} style={{ color: "var(--amber-500)", fill: "var(--amber-500)" }} />
              <span><strong>{machine.ownerRating}</strong> ({machine.reviewsCount} {t.reviews})</span>
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
            <span className="price-unit">{t.perHour}</span>
          </div>

          <button className="btn-primary" onClick={onBook}>
            <span>{t.reserveMachineryBtn}</span>
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

function BookingScreen({ selectedMachine, navigateTo, setBookingDraft, t }) {
  const machine = selectedMachine || machineryData[0];
  const [rentalDate, setRentalDate] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
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
              <p style={{ fontSize: "12px", color: "var(--slate-500)" }}>{rentalDate} · {startTime} ({durationHours} {t.hours})</p>
            </div>
            <span className="machine-status-pill">{t.advanceTokenRequired}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
            <div>
              <span style={{ color: "var(--slate-500)", display: "block" }}>{t.advanceTokenRequired}</span>
              <strong style={{ fontSize: "18px", color: "var(--primary-700)" }}>₹{advanceAmount.toLocaleString("en-IN")}</strong>
            </div>
            <div>
              <span style={{ color: "var(--slate-500)", display: "block" }}>{t.remainingPayable}</span>
              <strong style={{ fontSize: "18px", color: "var(--slate-900)" }}>₹{balanceOnDelivery.toLocaleString("en-IN")}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button className="btn-primary btn-lg" onClick={() => navigateTo("payments")}>
            <CreditCard size={18} />
            <span>{t.paySecurelyBtn}</span>
          </button>
          <button className="btn-secondary" onClick={() => setIsSubmitted(false)}>
            {t.changeMachine}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="marketplace-header">
        <span className="topbar-subtitle">{t.bookingSub}</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, margin: "4px 0 8px" }}>
          {t.bookingHeading}
        </h2>
        <p style={{ color: "var(--slate-500)", fontSize: "14px" }}>
          {t.bookingDescription}
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
                <span className="topbar-subtitle" style={{ fontSize: "10px" }}>{t.marketplaceSub}</span>
                <strong style={{ fontSize: "15px", display: "block", color: "var(--slate-900)" }}>{machine.name}</strong>
                <p style={{ fontSize: "12px", color: "var(--slate-500)" }}>{machine.owner} · {machine.distance}</p>
              </div>
            </div>
            <button
              className="btn-secondary"
              style={{ padding: "6px 12px", fontSize: "12px" }}
              onClick={() => navigateTo("machines")}
            >
              {t.changeMachine}
            </button>
          </div>

          <h3 className="form-panel-title">{t.bookingDetailsHeader}</h3>
          <div className="form-row-2">
            <div className="form-group">
              <label>{t.selectWorkDate}</label>
              <input
                type="date"
                className="form-control"
                value={rentalDate}
                onChange={(e) => setRentalDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>{t.startTime}</label>
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
              <span>{t.rentalDurationHours}</span>
              <strong style={{ color: "var(--primary-700)" }}>
                {durationHours} {t.hours} (Est. {Math.round(durationHours * 1.2)} Acres)
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
              <span>2 {t.hours}</span>
              <span>8 {t.hours}</span>
              <span>16 {t.hours}</span>
            </div>
          </div>

          <h3 className="form-panel-title" style={{ marginTop: "24px" }}>2. Destination</h3>
          <div className="form-group">
            <label>Farm Address</label>
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
              <strong>{t.addOperatorOption}</strong>
              <small>{t.addOperatorSub}</small>
            </div>
          </label>
        </section>

        {/* PRICE SUMMARY SIDEBAR */}
        <aside className="summary-panel">
          <span className="summary-eyebrow">{t.transparentPricing}</span>
          <h3 className="summary-title">{t.costBreakdown}</h3>

          <div className="summary-row">
            <span>{t.machineryRentalFee} ({durationHours} {t.hours} × ₹{machine.pricePerHour})</span>
            <strong>₹{baseRental.toLocaleString("en-IN")}</strong>
          </div>

          <div className="summary-row">
            <span>{t.deliveryLogisticsFee}</span>
            <strong>₹{deliveryLogistics.toLocaleString("en-IN")}</strong>
          </div>

          {includeOperator && (
            <div className="summary-row">
              <span>{t.certifiedOperatorFee} ({durationHours} {t.hours} × ₹180)</span>
              <strong>₹{operatorFee.toLocaleString("en-IN")}</strong>
            </div>
          )}

          <div className="summary-row discount">
            <span>{t.promoDiscount}</span>
            <strong>−₹{seasonalDiscount.toLocaleString("en-IN")}</strong>
          </div>

          <hr className="summary-divider" />

          <div className="summary-total">
            <span>{t.estimatedTotal}</span>
            <strong>₹{grandTotal.toLocaleString("en-IN")}</strong>
          </div>

          {/* ADVANCE NOTE */}
          <div style={{ background: "var(--primary-50)", border: "1px solid var(--primary-200)", borderRadius: "var(--radius-md)", padding: "12px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 700, color: "var(--primary-900)" }}>
              <span>{t.advanceTokenRequired}</span>
              <span>₹{advanceAmount.toLocaleString("en-IN")}</span>
            </div>
            <p style={{ fontSize: "11px", color: "var(--primary-800)", marginTop: "4px" }}>
              {t.remainingPayable}
            </p>
          </div>

          <div className="security-note">
            <ShieldCheck size={18} style={{ color: "var(--primary-600)", flexShrink: 0 }} />
            <span>{t.escrowGuaranteeText}</span>
          </div>

          <button className="btn-primary btn-full btn-lg" onClick={() => {
            setBookingDraft({ rentalDate, startTime, durationHours, includeOperator, deliveryAddress, farmLat: 10.7905, farmLng: 79.1378 });
            setIsSubmitted(true);
          }}>
            <span>{t.confirmRequestBtn}</span>
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

function PaymentsScreen({ navigateTo, selectedMachine, bookingDraft, session, t }) {
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const paymentMethods = useMemo(() => [
    {
      id: "upi",
      name: t.methodUpiTitle,
      note: t.methodUpiNote,
      icon: IndianRupee,
      badge: t.methodUpiBadge
    },
    {
      id: "card",
      name: t.methodCardTitle,
      note: t.methodCardNote,
      icon: CreditCard
    },
    {
      id: "cash",
      name: t.methodCashTitle,
      note: t.methodCashNote,
      icon: User
    }
  ], [t]);

  const handlePay = async () => {
    setIsProcessing(true);
    setPaymentError("");

    try {
      let token = session?.token;

      // Auto-authenticate with demo farmer if token is missing or expired
      if (!token) {
        try {
          const authRes = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accountId: "FARM-001", password: "FarmIQ@F01" }),
          });
          if (authRes.ok) {
            const authData = await authRes.json();
            token = authData.token;
            localStorage.setItem("farmiqSession", JSON.stringify(authData));
          }
        } catch (authErr) {
          console.warn("Auto-login failed:", authErr);
        }
      }

      // Create actual booking on the backend
      const draft = bookingDraft || {
        rentalDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        startTime: "08:00",
        durationHours: 6,
        includeOperator: true,
        deliveryAddress: "Vallam Road, Thanjavur",
        farmLat: 10.7905,
        farmLng: 79.1378
      };

      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          farmLat: draft.farmLat,
          farmLng: draft.farmLng,
          farmAddress: draft.deliveryAddress,
          machineryId: selectedMachine?.id || "mach-001",
          scheduledAt: `${draft.rentalDate}T${draft.startTime}:00+05:30`,
          durationHours: draft.durationHours,
          includeOperator: draft.includeOperator,
          paymentMethod: selectedMethod
        })
      });

      // If token was expired (401), re-login once and retry
      if (res.status === 401) {
        const reAuthRes = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId: "FARM-001", password: "FarmIQ@F01" }),
        });
        if (reAuthRes.ok) {
          const reAuthData = await reAuthRes.json();
          token = reAuthData.token;
          localStorage.setItem("farmiqSession", JSON.stringify(reAuthData));

          const retryRes = await fetch(`${API_URL}/api/bookings`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              farmLat: draft.farmLat,
              farmLng: draft.farmLng,
              farmAddress: draft.deliveryAddress,
              machineryId: selectedMachine?.id || "mach-001",
              scheduledAt: `${draft.rentalDate}T${draft.startTime}:00+05:30`,
              durationHours: draft.durationHours,
              includeOperator: draft.includeOperator,
              paymentMethod: selectedMethod
            })
          });
          const retryData = await retryRes.json();
          if (!retryRes.ok) throw new Error(retryData.error || "Booking could not be created");
          setIsProcessing(false);
          setIsSuccess(true);
          return;
        }
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking could not be created");
      setIsProcessing(false);
      setIsSuccess(true);
    } catch (err) {
      console.error("Payment API Error", err);
      setPaymentError(err.message);
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
        <span className="topbar-subtitle">{t.paymentSuccessful}</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "30px", fontWeight: 700, margin: "8px 0" }}>
          {t.advanceProtectedEscrow}
        </h2>
        <p style={{ color: "var(--slate-600)", fontSize: "14px", marginBottom: "24px" }}>
          {t.transactionRef} <strong>TXN_FQ98472901</strong>. {t.escrowLockedNotice}
        </p>

        <button className="btn-primary btn-lg" onClick={() => navigateTo("tracking")}>
          <Truck size={18} />
          <span>{t.trackLiveGpsBtn}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="marketplace-header">
        <span className="topbar-subtitle">{t.paymentsSub}</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, margin: "4px 0 8px" }}>
          {t.paymentsHeading}
        </h2>
        <p style={{ color: "var(--slate-500)", fontSize: "14px" }}>
          {t.paymentsDescription}
        </p>
      </div>

      <div className="booking-grid">
        <section className="form-panel">
          <div style={{ background: "var(--primary-50)", border: "1px solid var(--primary-200)", padding: "16px", borderRadius: "var(--radius-md)", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="topbar-subtitle" style={{ fontSize: "10px" }}>{t.amountPayableNow}</span>
              <strong style={{ fontSize: "24px", color: "var(--primary-900)", display: "block" }}>₹4,340.00</strong>
              <small style={{ color: "var(--primary-700)" }}>{t.advanceTokenFor} Mahindra 575 DI (6 {t.hours})</small>
            </div>
            <ShieldCheck size={32} style={{ color: "var(--primary-700)" }} />
          </div>

          <h3 className="form-panel-title">{t.selectPaymentMethod}</h3>
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
              <span>{t.processingPayment}</span>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>{t.paySecurelyBtn}</span>
              </>
            )}
          </button>
          {paymentError && <p style={{ color: "#b42318", fontSize: "12px", marginTop: "10px" }}>{paymentError}</p>}
        </section>

        {/* TRUST & PROTECTION SIDEBAR */}
        <aside className="trust-hero-card">
          <span className="summary-eyebrow" style={{ color: "var(--primary-400)" }}>FARMIQ PROTECTION</span>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, margin: "6px 0 16px" }}>
            {t.guaranteedTrustTitle}
          </h3>

          <div className="trust-item">
            <ShieldCheck size={24} />
            <div>
              <strong>{t.escrowProtectionTitle}</strong>
              <p>{t.escrowProtectionDesc}</p>
            </div>
          </div>

          <div className="trust-item">
            <Wrench size={24} />
            <div>
              <strong>{t.onFieldReplacementTitle}</strong>
              <p>{t.onFieldReplacementDesc}</p>
            </div>
          </div>

          <div className="trust-item">
            <PhoneCall size={24} />
            <div>
              <strong>{t.liveTeleSupportTitle}</strong>
              <p>{t.liveTeleSupportDesc}</p>
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

function TrackingScreen({ t }) {
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Automatically fetch the latest assigned ride and driver
    const fetchRide = async () => {
      try {
        const res = await fetch(`${API_URL}/api/rides`);
        if (!res.ok) throw new Error("Could not load active rides");
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

  if (loading) return <div className="screen" style={{ padding: 40, textAlign: "center" }}>{t.loadingSatellite}</div>;
  if (!ride) return <div className="screen" style={{ padding: 40, textAlign: "center" }}>{t.noActiveDispatchFound}</div>;

  const farmPos = [ride.farmLat || 10.7905, ride.farmLng || 79.1378];
  const driverPos = [ride.driver?.latitude || 10.7950, ride.driver?.longitude || 79.1400];
  const bounds = L.latLngBounds([farmPos, driverPos]);

  return (
    <div className="screen">
      <div className="marketplace-header">
        <span className="topbar-subtitle">{t.telematicsSub}</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, margin: "4px 0 8px" }}>
          {ride.machinery?.name || 'Machinery'} {t.dispatchTelematics}
        </h2>
        <p style={{ color: "var(--slate-500)", fontSize: "14px" }}>
          Booking #{ride.id.substring(0,8).toUpperCase()} · {t.routingGeoSat}
        </p>
      </div>

      <div className="booking-grid">
        {/* LEAFLET MAP */}
        <section style={{ height: "480px", borderRadius: "16px", overflow: "hidden", border: "1px solid var(--slate-200)" }}>
          <MapContainer bounds={bounds} zoom={13} style={{ height: "100%", width: "100%", zIndex: 1 }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {/* Driver Marker */}
            <Marker position={driverPos}>
              <Popup><strong>{ride.driver?.fullName}</strong><br/>{t.driverEnRouteMarker}</Popup>
            </Marker>
            
            {/* Farm Marker */}
            <Marker position={farmPos}>
              <Popup><strong>{t.destinationFarmMarker}</strong></Popup>
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
              <span className="topbar-subtitle" style={{ fontSize: "10px" }}>{t.assignedOperatorHeader}</span>
              <strong style={{ fontSize: "14px", display: "block", color: "var(--slate-900)" }}>{ride.driver?.fullName || 'Assigning...'}</strong>
              <p style={{ fontSize: "12px", color: "var(--amber-700)" }}>★ 4.9 · {ride.driver?.phone || 'Connecting'}</p>
            </div>
            <a
              href={`tel:${ride.driver?.phone}`}
              className="btn-primary"
              style={{ padding: "8px 12px", fontSize: "12px" }}
            >
              <Phone size={14} />
              {t.callDriver}
            </a>
          </div>

          <h3 className="form-panel-title" style={{ marginTop: "24px" }}>{t.activeHandoverPipeline}</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <CheckCircle size={18} style={{ color: "var(--primary-600)", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ fontSize: "13px", color: "var(--slate-900)", display: "block" }}>{t.paymentEscrowedTitle}</strong>
                <small style={{ color: "var(--slate-500)" }}>₹{ride.advancePaid} locked for {ride.machinery?.name}</small>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <CheckCircle size={18} style={{ color: "var(--primary-600)", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ fontSize: "13px", color: "var(--slate-900)", display: "block" }}>{t.smartDriverAssignedTitle}</strong>
                <small style={{ color: "var(--slate-500)" }}>{t.matchedClosestOperator} {ride.driver?.fullName}</small>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <Truck size={18} style={{ color: "var(--primary-600)", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ fontSize: "13px", color: "var(--primary-800)", display: "block" }}>{t.onTheWayGpsLive}</strong>
                <small style={{ color: "var(--slate-500)" }}>{t.driverPingUpdated}</small>
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

function SupportScreen({ language, t }) {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState("");

  useEffect(() => {
    setMessages([
      {
        id: "init",
        sender: "bot",
        text: t.botGreeting
      }
    ]);
  }, [language, t]);

  const quickPrompts = useMemo(() => [
    t.quickPrompt1,
    t.quickPrompt2,
    t.quickPrompt3,
    t.quickPrompt4
  ], [t]);

  const handleSend = (textToSend) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const userMsg = { id: Date.now().toString(), sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");

    setTimeout(() => {
      let reply = t.botReplyDefault;
      const lower = text.toLowerCase();
      if (lower.includes("escrow") || lower.includes("advance") || lower.includes("எஸ்க்ரோ") || lower.includes("அட்வான்ஸ்") || lower.includes("एस्क्रो") || lower.includes("अग्रिम")) {
        reply = t.botReplyEscrow;
      } else if (lower.includes("paddy") || lower.includes("tractor") || lower.includes("நெல்") || lower.includes("டிராக்டர்") || lower.includes("धान") || lower.includes("ट्रैक्टर")) {
        reply = t.botReplyPaddy;
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
        <span className="topbar-subtitle">{t.supportSub}</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, margin: "4px 0 8px" }}>
          {t.supportHeading}
        </h2>
        <p style={{ color: "var(--slate-500)", fontSize: "14px" }}>
          {t.supportDescription}
        </p>
      </div>

      {/* THREE HELP CHANNELS */}
      <div className="help-grid-pro">
        <div className="help-card-pro">
          <div className="help-card-icon">
            <Bot size={22} />
          </div>
          <h4>{t.aiBotChannelTitle}</h4>
          <p>{t.aiBotChannelDesc}</p>
          <span style={{ fontSize: "12px", fontWeight: "bold", color: "var(--primary-700)" }}>{t.aiBotChannelBadge}</span>
        </div>

        <div className="help-card-pro">
          <div className="help-card-icon">
            <PhoneCall size={22} />
          </div>
          <h4>{t.helplineChannelTitle}</h4>
          <p>{t.helplineChannelDesc}</p>
          <a href="tel:18001234567" style={{ fontSize: "12px", fontWeight: "bold", color: "var(--primary-700)" }}>
            {t.helplineChannelLink}
          </a>
        </div>

        <div className="help-card-pro">
          <div className="help-card-icon">
            <PlayCircle size={22} />
          </div>
          <h4>{t.tutorialsChannelTitle}</h4>
          <p>{t.tutorialsChannelDesc}</p>
          <span style={{ fontSize: "12px", fontWeight: "bold", color: "var(--primary-700)" }}>{t.tutorialsChannelBadge}</span>
        </div>
      </div>

      {/* INTERACTIVE CHAT CONTAINER */}
      <div className="chat-container-pro">
        <div className="chat-header-pro">
          <Bot size={20} />
          <div>
            <strong style={{ fontSize: "14px", display: "block" }}>{t.aiAssistantTitle}</strong>
            <small style={{ fontSize: "11px", color: "var(--primary-400)" }}>{t.aiAssistantStatus}</small>
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
            placeholder={t.askAssistantPlaceholder}
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

function AccountScreen({ navigateTo, onLogin, t }) {
  const [isRegister, setIsRegister] = useState(false);
  const [accountId, setAccountId] = useState("FARM-001");
  const [password, setPassword] = useState("FarmIQ@F01");
  const [fullName, setFullName] = useState("Ravi Kumar");
  const [authError, setAuthError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const submitAccount = async (event) => {
    event.preventDefault();
    setAuthError("");
    if (isRegister) {
      setAuthError("Registration will be added after the demo-account review. Use one of the seeded account IDs for now.");
      return;
    }
    setIsSigningIn(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Sign in failed");
      onLogin(data);
      navigateTo("dashboard");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="screen">
      <div className="auth-split-wrapper">
        {/* BRAND PROMISE HERO */}
        <section className="auth-hero-panel">
          <div>
            <div className="brand-icon-box" style={{ marginBottom: "24px" }}>
              <Tractor size={28} />
            </div>
            <span className="hero-tag">{t.heroTagEnterprise}</span>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "36px", fontWeight: 700, margin: "12px 0 16px", lineHeight: "1.2" }}>
              {t.heroHeadingPromise}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px", lineHeight: "1.6" }}>
              {t.heroPromiseDescription}
            </p>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px" }}>
            <div style={{ display: "flex", gap: "24px" }}>
              <div>
                <strong style={{ fontSize: "18px", color: "var(--primary-400)", display: "block" }}>1,240+</strong>
                <small style={{ color: "rgba(255,255,255,0.6)" }}>{t.verifiedFarmersStat}</small>
              </div>
              <div>
                <strong style={{ fontSize: "18px", color: "var(--primary-400)", display: "block" }}>100%</strong>
                <small style={{ color: "rgba(255,255,255,0.6)" }}>{t.escrowProtectionStat}</small>
              </div>
            </div>
          </div>
        </section>

        {/* AUTH FORM */}
        <form
          className="auth-form-panel"
          onSubmit={submitAccount}
        >
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${!isRegister ? "active" : ""}`}
              onClick={() => setIsRegister(false)}
            >
              {t.signInTab}
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${isRegister ? "active" : ""}`}
              onClick={() => setIsRegister(true)}
            >
              {t.newRegistrationTab}
            </button>
          </div>

          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 700, marginBottom: "6px" }}>
            {isRegister ? t.registerHeading : t.signInHeading}
          </h2>
          <p style={{ color: "var(--slate-500)", fontSize: "13px", marginBottom: "20px" }}>
            {isRegister ? t.registerSubText : t.signInSubText}
          </p>

          {isRegister && (
            <div className="form-group">
              <label>{t.selectUserRole}</label>
              <select className="form-control">
                <option>{t.roleOptionFarmer}</option>
                <option>{t.roleOptionOwner}</option>
                <option>{t.roleOptionDriver}</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label>{isRegister ? t.mobileNumberLabel : t.accountIdLabel}</label>
            <input
              type="text"
              className="form-control"
              placeholder={isRegister ? "e.g. 98765 43210" : "e.g. FARM-001"}
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>{isRegister ? t.fullNameLabel : t.passwordLabel}</label>
            <input
              type={isRegister ? "text" : "password"}
              className="form-control"
              placeholder={isRegister ? "Ravi Kumar" : "••••••"}
              value={isRegister ? fullName : password}
              onChange={(e) => isRegister ? setFullName(e.target.value) : setPassword(e.target.value)}
            />
          </div>

          <button className="btn-primary btn-full btn-lg" style={{ marginTop: "12px" }} disabled={isSigningIn}>
            <span>{isSigningIn ? "..." : t.continueToWorkspaceBtn}</span>
            <ArrowRight size={16} />
          </button>

          {authError && <p style={{ color: "#b42318", fontSize: "12px", marginTop: "12px" }}>{authError}</p>}

          <p style={{ textAlign: "center", fontSize: "11px", color: "var(--slate-400)", marginTop: "16px" }}>
            {t.termsNoticeText}
          </p>
        </form>
      </div>
    </div>
  );
}
