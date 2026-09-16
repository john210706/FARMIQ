import React, { useState, useEffect } from "react";
import {
  Tractor, LayoutDashboard, Search, CalendarDays, CreditCard, Navigation, Bot, User,
  Globe, ShieldCheck, ChevronRight, Menu, X, Check,
} from "lucide-react";
import { getTranslation } from "./translations";
import DashboardScreen from "./screens/DashboardScreen";
import MachinesScreen from "./screens/MachinesScreen";
import BookingScreen from "./screens/BookingScreen";
import PaymentsScreen from "./screens/PaymentsScreen";
import TrackingScreen from "./screens/TrackingScreen";
import SupportScreen from "./screens/SupportScreen";
import AccountScreen from "./screens/AccountScreen";

export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const [role, setRole] = useState("Farmer");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [language, setLanguage] = useState("en");
  const [bookingDraft, setBookingDraft] = useState(null);

  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem("farmiqSession");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const t = getTranslation(language);

  const handleLogin = (sessionData) => {
    setSession(sessionData);
    if (sessionData?.user?.role) {
      const roleMap = { FARMER: "Farmer", OWNER: "Machinery Owner", DRIVER: "Delivery Partner", ADMIN: "Administrator" };
      setRole(roleMap[sessionData.user.role] || "Farmer");
    }
    localStorage.setItem("farmiqSession", JSON.stringify(sessionData));
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem("farmiqSession");
    setScreen("dashboard");
  };

  const navigateTo = (nextScreen, machine = null) => {
    if (machine) setSelectedMachine(machine);
    setScreen(nextScreen);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navItems = [
    { id: "dashboard", label: t.navDashboard, icon: LayoutDashboard },
    { id: "machines", label: t.navMachinery, icon: Search },
    { id: "booking", label: t.navBookings, icon: CalendarDays },
    { id: "payments", label: t.navEscrow, icon: CreditCard },
    { id: "tracking", label: t.navLiveGps, icon: Navigation },
    { id: "support", label: t.navAiKisan, icon: Bot },
    { id: "account", label: session ? t.navAccount : t.signInTab, icon: User },
  ];

  return (
    <div className="app-shell">
      {/* SIDEBAR NAVIGATION */}
      <aside className={`sidebar ${mobileMenuOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-logo"><Tractor size={22} /></div>
          <div>
            <h1 className="brand-title">FarmIQ</h1>
            <span className="brand-subtitle">{t.brandSub}</span>
          </div>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = screen === item.id;
            return (
              <button key={item.id} className={`nav-link ${isActive ? "active" : ""}`} onClick={() => navigateTo(item.id)}>
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ROLE SWITCHER */}
        <div className="role-switcher-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span className="role-card-label">{t.switchPortalMode}</span>
            <ShieldCheck size={14} style={{ color: "var(--primary-600)" }} />
          </div>
          <select className="role-select-dropdown" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Farmer">{t.role_Farmer}</option>
            <option value="Machinery Owner">{t.role_MachineryOwner}</option>
            <option value="Delivery Partner">{t.role_DeliveryPartner}</option>
            <option value="Administrator">{t.role_Administrator}</option>
          </select>
        </div>

        {/* USER PROFILE CARD */}
        {session && (
          <div className="user-profile-box">
            <div className="user-avatar">{session.user.fullName.substring(0, 2).toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong className="user-name">{session.user.fullName}</strong>
              <small className="user-role">{session.user.accountId} · {session.user.role}</small>
            </div>
            <button onClick={handleLogout} className="logout-btn" title="Sign Out">✕</button>
          </div>
        )}
      </aside>

      {/* MAIN LAYOUT */}
      <div className="main-content">
        {/* TOPBAR */}
        <header className="topbar">
          <button className="mobile-toggle-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="topbar-left">
            <span className="topbar-subtitle">FARMIQ PLATFORM</span>
            <h2 className="topbar-title">
              {navItems.find((n) => n.id === screen)?.label || "Workspace"}
            </h2>
          </div>
          <div className="topbar-right">
            {/* LANGUAGE SELECTOR */}
            <div className="language-selector">
              <Globe size={16} style={{ color: "var(--slate-500)" }} />
              <select className="lang-dropdown" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="en">English (US)</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
            </div>
          </div>
        </header>

        {/* SCREEN ROUTER */}
        <main className="content-area">
          {screen === "dashboard" && <DashboardScreen role={role} navigateTo={navigateTo} t={t} />}
          {screen === "machines" && <MachinesScreen navigateTo={navigateTo} t={t} />}
          {screen === "booking" && <BookingScreen selectedMachine={selectedMachine} navigateTo={navigateTo} setBookingDraft={setBookingDraft} t={t} />}
          {screen === "payments" && <PaymentsScreen navigateTo={navigateTo} selectedMachine={selectedMachine} bookingDraft={bookingDraft} session={session} t={t} />}
          {screen === "tracking" && <TrackingScreen t={t} />}
          {screen === "support" && <SupportScreen language={language} navigateTo={navigateTo} t={t} />}
          {screen === "account" && <AccountScreen navigateTo={navigateTo} onLogin={handleLogin} t={t} />}
        </main>
      </div>
    </div>
  );
}
