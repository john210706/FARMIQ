"use client";

import {
  Bell,
  Bot,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  CreditCard,
  Gauge,
  Headphones,
  IndianRupee,
  Languages,
  LayoutDashboard,
  LocateFixed,
  LogIn,
  MapPin,
  Menu,
  PackageCheck,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tractor,
  Truck,
  UserRound,
  UsersRound,
  Wrench,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type Screen =
  | "dashboard"
  | "machines"
  | "booking"
  | "payments"
  | "tracking"
  | "support"
  | "account";

type Role = "Farmer" | "Machinery owner" | "Delivery person" | "Administrator";

const machines = [
  {
    name: "Mahindra 575 DI Tractor",
    type: "Tractor",
    owner: "Sri Murugan Agro Services",
    distance: "2.4 km",
    price: "₹1,250",
    rating: "4.9",
    available: "Available today",
    accent: "tractor-red",
  },
  {
    name: "John Deere 5310",
    type: "Tractor",
    owner: "Green Field Rentals",
    distance: "4.8 km",
    price: "₹1,500",
    rating: "4.8",
    available: "Available tomorrow",
    accent: "tractor-green",
  },
  {
    name: "Shaktiman Rotavator",
    type: "Tillage",
    owner: "Kaveri Farm Tools",
    distance: "6.1 km",
    price: "₹750",
    rating: "4.7",
    available: "Available today",
    accent: "tractor-gold",
  },
];

const navItems: { id: Screen; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "machines", label: "Find machinery", icon: Tractor },
  { id: "booking", label: "My bookings", icon: CalendarDays },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "tracking", label: "Track delivery", icon: Truck },
  { id: "support", label: "Help & learning", icon: CircleHelp },
];

const roleData: Record<Role, { greeting: string; summary: string; metrics: [string, string][] }> = {
  Farmer: {
    greeting: "Good morning, Ravi",
    summary: "Your next field operation is 3 days away. Book early to avoid peak demand.",
    metrics: [["Active bookings", "2"], ["Hours saved", "18h"], ["Nearby machines", "24"]],
  },
  "Machinery owner": {
    greeting: "Welcome back, Murugan",
    summary: "Two new rental requests are waiting for your confirmation.",
    metrics: [["Listed machines", "6"], ["This month", "₹34.8k"], ["Utilisation", "78%"]],
  },
  "Delivery person": {
    greeting: "Your route is ready, Selvam",
    summary: "You have three scheduled equipment movements today.",
    metrics: [["Today's trips", "3"], ["Completed", "1"], ["Distance left", "42 km"]],
  },
  Administrator: {
    greeting: "FarmIQ operations",
    summary: "Platform activity is healthy. Four verification requests need review.",
    metrics: [["Active users", "1,248"], ["Live rentals", "86"], ["Open issues", "4"]],
  },
};

export default function Home() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [role, setRole] = useState<Role>("Farmer");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [accountMode, setAccountMode] = useState<"login" | "register">("login");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const title = useMemo(() => navItems.find((item) => item.id === screen)?.label ?? "Account", [screen]);

  const navigate = (next: Screen) => {
    setScreen(next);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark"><Tractor size={24} strokeWidth={2.2} /></div>
          <div><strong>FarmIQ</strong><span>Smart farm access</span></div>
          <button className="icon-button close-menu" onClick={() => setMobileMenu(false)} aria-label="Close menu"><X size={20} /></button>
        </div>

        <p className="side-label">WORKSPACE</p>
        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={screen === item.id ? "active" : ""} onClick={() => navigate(item.id)}>
                <Icon size={19} /><span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="role-card">
          <div className="role-icon"><UsersRound size={19} /></div>
          <div>
            <span>Viewing as</span>
            <select value={role} onChange={(event) => { setRole(event.target.value as Role); setScreen("dashboard"); }} aria-label="Select demo role">
              {Object.keys(roleData).map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
        </div>

        <div className="support-card">
          <Headphones size={22} />
          <strong>Need help booking?</strong>
          <span>Call our Tamil support line</span>
          <a href="tel:18001234567">1800 123 4567</a>
        </div>
      </aside>

      {mobileMenu && <button className="scrim" onClick={() => setMobileMenu(false)} aria-label="Close navigation" />}

      <section className="main-panel">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Menu size={22} /></button>
          <div><span className="eyebrow">FARMIQ PLATFORM</span><h1>{title}</h1></div>
          <div className="top-actions">
            <button className="language-button"><Languages size={18} /><span>English</span><ChevronDown size={15} /></button>
            <button className="icon-button notification" aria-label="Notifications"><Bell size={20} /><i /></button>
            <button className="profile-button" onClick={() => navigate("account")}><span>RV</span><div><strong>Ravi Kumar</strong><small>Farmer ID · FQ1024</small></div><ChevronDown size={15} /></button>
          </div>
        </header>

        <div className="content-wrap">
          {screen === "dashboard" && <Dashboard role={role} navigate={navigate} />}
          {screen === "machines" && <Machines navigate={navigate} />}
          {screen === "booking" && <Booking confirmed={bookingConfirmed} setConfirmed={setBookingConfirmed} navigate={navigate} />}
          {screen === "payments" && <Payments navigate={navigate} />}
          {screen === "tracking" && <Tracking />}
          {screen === "support" && <Support />}
          {screen === "account" && <Account mode={accountMode} setMode={setAccountMode} navigate={navigate} />}
        </div>
      </section>
    </main>
  );
}

function Dashboard({ role, navigate }: { role: Role; navigate: (screen: Screen) => void }) {
  const data = roleData[role];
  return (
    <div className="screen dashboard-screen">
      <section className="welcome-panel">
        <div>
          <span className="status-label"><Sparkles size={15} /> {role} workspace</span>
          <h2>{data.greeting}</h2>
          <p>{data.summary}</p>
          {role === "Farmer" && <button className="primary-button" onClick={() => navigate("machines")}><Search size={18} /> Find a machine</button>}
          {role !== "Farmer" && <button className="primary-button"><Gauge size={18} /> View today&apos;s activity</button>}
        </div>
        <div className="field-visual" aria-hidden="true">
          <div className="sun" />
          <div className="field-line line-one" />
          <div className="field-line line-two" />
          <div className="field-line line-three" />
          <Tractor size={92} strokeWidth={1.35} />
        </div>
      </section>

      <section className="metric-grid">
        {data.metrics.map(([label, value], index) => (
          <article className="metric-card" key={label}>
            <div className={`metric-icon metric-${index}`}>
              {index === 0 ? <CalendarDays size={20} /> : index === 1 ? <Clock3 size={20} /> : <MapPin size={20} />}
            </div>
            <div><strong>{value}</strong><span>{label}</span></div>
            <ChevronRight size={18} />
          </article>
        ))}
      </section>

      {role === "Farmer" ? (
        <div className="dashboard-columns">
          <section>
            <SectionHeading title="Recommended near you" note="Based on your location in Thanjavur" action="View all" onClick={() => navigate("machines")} />
            <div className="machine-list compact-list">
              {machines.slice(0, 2).map((machine) => <MachineCard key={machine.name} machine={machine} onBook={() => navigate("booking")} />)}
            </div>
          </section>
          <section>
            <SectionHeading title="Current booking" note="Arriving today" />
            <article className="booking-status-card">
              <div className="booking-top"><div className="mini-machine"><Tractor size={28} /></div><div><strong>Mahindra 575 DI</strong><span>#FQ-2048 · 6 hours</span></div><span className="live-badge">In transit</span></div>
              <div className="progress-line"><i /><i /><i /><i /></div>
              <div className="progress-labels"><span>Confirmed</span><span>Picked up</span><span>On the way</span><span>Delivered</span></div>
              <div className="arrival-row"><MapPin size={18} /><div><span>Estimated arrival</span><strong>Today, 10:40 AM</strong></div><button onClick={() => navigate("tracking")}>Track live</button></div>
            </article>
          </section>
        </div>
      ) : <RoleWorkspace role={role} />}
    </div>
  );
}

function RoleWorkspace({ role }: { role: Role }) {
  const items: Record<Exclude<Role, "Farmer">, { title: string; rows: string[]; action: string }> = {
    "Machinery owner": { title: "Rental requests", rows: ["Mahindra 575 DI · 12 Aug", "Rotavator · 14 Aug", "Mini harvester · 18 Aug"], action: "Review requests" },
    "Delivery person": { title: "Today's route", rows: ["Pickup · Kaveri Farm Tools", "Deliver · Ravi Kumar farm", "Return · Green Field Rentals"], action: "Start navigation" },
    Administrator: { title: "Operations queue", rows: ["4 owner verifications", "2 payment disputes", "6 machine inspections due"], action: "Open admin queue" },
  };
  const content = items[role as Exclude<Role, "Farmer">];
  return (
    <section className="role-workspace">
      <SectionHeading title={content.title} note="Updated just now" />
      {content.rows.map((row, index) => <div className="work-row" key={row}><span>0{index + 1}</span><strong>{row}</strong><button>Open <ChevronRight size={16} /></button></div>)}
      <button className="secondary-button">{content.action}</button>
    </section>
  );
}

function Machines({ navigate }: { navigate: (screen: Screen) => void }) {
  const [query, setQuery] = useState("");
  const filtered = machines.filter((machine) => machine.name.toLowerCase().includes(query.toLowerCase()) || machine.type.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="screen">
      <section className="page-intro split-intro">
        <div><span className="eyebrow green">MACHINERY MARKETPLACE</span><h2>Find the right machine nearby</h2><p>Compare verified equipment, clear hourly prices, and real-time availability.</p></div>
        <div className="coverage-stat"><LocateFixed size={25} /><div><strong>24 machines</strong><span>within 10 km of you</span></div></div>
      </section>
      <div className="search-row">
        <label className="search-box"><Search size={20} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tractor, harvester, rotavator…" /></label>
        <button className="filter-button"><SlidersHorizontal size={18} /> Filters <span>2</span></button>
      </div>
      <div className="filter-chips"><button className="selected">All machinery</button><button>Tractors</button><button>Harvesters</button><button>Tillage</button><button>Sprayers</button></div>
      <div className="result-header"><strong>{filtered.length} machines found</strong><label>Sort by <select><option>Nearest first</option><option>Lowest price</option><option>Top rated</option></select></label></div>
      <div className="machine-list marketplace-list">
        {filtered.map((machine) => <MachineCard key={machine.name} machine={machine} onBook={() => navigate("booking")} detailed />)}
      </div>
    </div>
  );
}

function MachineCard({ machine, onBook, detailed = false }: { machine: typeof machines[number]; onBook: () => void; detailed?: boolean }) {
  return (
    <article className={`machine-card ${detailed ? "detailed" : ""}`}>
      <div className={`machine-art ${machine.accent}`}><span>{machine.type}</span><Tractor size={detailed ? 92 : 68} strokeWidth={1.35} /></div>
      <div className="machine-info">
        <div className="machine-heading"><div><span className="availability">● {machine.available}</span><h3>{machine.name}</h3><p>{machine.owner}</p></div><button className="save-button" aria-label="Save machine">♡</button></div>
        <div className="machine-meta"><span><MapPin size={15} /> {machine.distance}</span><span><Star size={15} fill="currentColor" /> {machine.rating}</span><span><ShieldCheck size={15} /> Verified</span></div>
        {detailed && <div className="spec-row"><span><Gauge size={17} /> 45 HP</span><span><Wrench size={17} /> Inspected</span><span><UserRound size={17} /> Operator available</span></div>}
        <div className="price-row"><div><strong>{machine.price}</strong><span>/ hour</span></div><button className="primary-button" onClick={onBook}>View & book <ChevronRight size={17} /></button></div>
      </div>
    </article>
  );
}

function Booking({ confirmed, setConfirmed, navigate }: { confirmed: boolean; setConfirmed: (value: boolean) => void; navigate: (screen: Screen) => void }) {
  if (confirmed) {
    return (
      <div className="screen confirmation-screen">
        <div className="success-icon"><PackageCheck size={38} /></div>
        <span className="eyebrow green">BOOKING REQUESTED</span>
        <h2>Your machine is reserved</h2>
        <p>Booking #FQ-2051 has been sent to Sri Murugan Agro Services.</p>
        <article className="confirmation-ticket"><span>Mahindra 575 DI Tractor</span><strong>12 August · 8:00 AM</strong><small>6 hours · Delivery included</small></article>
        <div className="button-pair"><button className="primary-button" onClick={() => navigate("payments")}>Pay 50% advance</button><button className="secondary-button" onClick={() => setConfirmed(false)}>Edit booking</button></div>
      </div>
    );
  }
  return (
    <div className="screen">
      <section className="page-intro"><span className="eyebrow green">BOOKING DETAILS</span><h2>Reserve your machinery</h2><p>Confirm the schedule and delivery information before requesting the machine.</p></section>
      <div className="booking-layout">
        <section className="booking-form-card">
          <div className="selected-machine"><div className="mini-machine large"><Tractor size={38} /></div><div><span>Selected machine</span><strong>Mahindra 575 DI Tractor</strong><small>Sri Murugan Agro Services · 2.4 km</small></div><button onClick={() => navigate("machines")}>Change</button></div>
          <hr />
          <h3>Choose date and duration</h3>
          <div className="form-grid"><label>Rental date<div className="input-shell"><CalendarDays size={18} /><input type="date" defaultValue="2026-08-12" /></div></label><label>Start time<div className="input-shell"><Clock3 size={18} /><input type="time" defaultValue="08:00" /></div></label></div>
          <label className="range-label">Rental duration <strong>6 hours</strong><input type="range" min="2" max="12" defaultValue="6" /><span><small>2 hours</small><small>12 hours</small></span></label>
          <h3>Delivery location</h3>
          <div className="location-choice"><MapPin size={20} /><div><strong>Ravi Kumar&apos;s farm</strong><span>Vallam Road, Thanjavur, Tamil Nadu 613403</span></div><button>Edit</button></div>
          <label className="checkbox-row"><input type="checkbox" defaultChecked /><span><strong>Add a verified operator</strong><small>Recommended for safe machine operation · +₹180/hour</small></span></label>
        </section>
        <aside className="order-summary">
          <span className="eyebrow green">PRICE SUMMARY</span><h3>Transparent pricing</h3>
          <div className="summary-row"><span>Machine rental</span><strong>₹7,500</strong></div><div className="summary-row"><span>Delivery & pickup</span><strong>₹600</strong></div><div className="summary-row"><span>Verified operator</span><strong>₹1,080</strong></div><div className="summary-row discount"><span>FarmIQ first booking</span><strong>−₹500</strong></div>
          <hr /><div className="summary-total"><span>Total</span><strong>₹8,680</strong></div><p><ShieldCheck size={16} /> Only 50% advance is charged now. The balance is released after delivery.</p>
          <button className="primary-button full-button" onClick={() => setConfirmed(true)}>Request booking <ChevronRight size={18} /></button>
        </aside>
      </div>
    </div>
  );
}

function Payments({ navigate }: { navigate: (screen: Screen) => void }) {
  const [method, setMethod] = useState("upi");
  return (
    <div className="screen">
      <section className="page-intro"><span className="eyebrow green">SECURE CHECKOUT</span><h2>Pay booking advance</h2><p>Your payment is protected and released according to the rental agreement.</p></section>
      <div className="payment-layout">
        <section className="payment-card">
          <div className="secure-heading"><ShieldCheck size={24} /><div><strong>50% advance payment</strong><span>Booking #FQ-2051 · Mahindra 575 DI</span></div></div>
          <h3>Select a payment method</h3>
          <button className={`method-row ${method === "upi" ? "method-selected" : ""}`} onClick={() => setMethod("upi")}><span className="radio" /><div><strong>UPI</strong><small>Google Pay, PhonePe, Paytm or any UPI app</small></div><span className="upi-mark">UPI</span></button>
          <button className={`method-row ${method === "card" ? "method-selected" : ""}`} onClick={() => setMethod("card")}><span className="radio" /><div><strong>Debit or credit card</strong><small>Visa, Mastercard and RuPay</small></div><CreditCard size={25} /></button>
          <button className={`method-row ${method === "cash" ? "method-selected" : ""}`} onClick={() => setMethod("cash")}><span className="radio" /><div><strong>Assisted cash payment</strong><small>Pay at an authorised FarmIQ service point</small></div><IndianRupee size={25} /></button>
          {method === "upi" && <label className="upi-input">UPI ID<div className="input-shell"><input placeholder="mobile-number@upi" /><button>Verify</button></div></label>}
          <button className="primary-button full-button" onClick={() => navigate("tracking")}>Pay ₹4,340 securely</button>
        </section>
        <aside className="trust-panel"><span className="eyebrow">FARMIQ PROTECTION</span><h3>Built for trusted rentals</h3><ul><li><ShieldCheck size={19} /><span><strong>Protected payment</strong>Your advance is held securely until dispatch.</span></li><li><Wrench size={19} /><span><strong>Quality checked</strong>Machine inspection status is recorded.</span></li><li><Headphones size={19} /><span><strong>Human support</strong>Regional-language help throughout the rental.</span></li></ul></aside>
      </div>
    </div>
  );
}

function Tracking() {
  return (
    <div className="screen">
      <section className="page-intro split-intro"><div><span className="eyebrow green">LIVE DELIVERY</span><h2>Your tractor is on the way</h2><p>Booking #FQ-2048 · Estimated arrival in 28 minutes</p></div><span className="live-badge large-badge">● Live tracking</span></section>
      <div className="tracking-layout">
        <section className="map-card" aria-label="Illustrated delivery route map">
          <div className="map-road road-one" /><div className="map-road road-two" /><div className="map-road road-three" />
          <div className="map-field field-a" /><div className="map-field field-b" /><div className="map-field field-c" />
          <div className="route-line" />
          <div className="map-pin pickup"><Tractor size={19} /><span>Pickup</span></div>
          <div className="map-pin vehicle"><Truck size={22} /><span>28 min</span></div>
          <div className="map-pin destination"><MapPin size={21} /><span>Your farm</span></div>
          <button className="recenter"><LocateFixed size={19} /> Recenter</button>
        </section>
        <aside className="tracking-card">
          <div className="driver-row"><div className="driver-avatar">SK</div><div><span>Delivery partner</span><strong>Suresh Kumar</strong><small>★ 4.9 · 268 deliveries</small></div><button aria-label="Call delivery partner">☎</button></div>
          <div className="delivery-timeline"><div className="done"><i><PackageCheck size={16} /></i><span><strong>Booking confirmed</strong><small>8:05 AM</small></span></div><div className="done"><i><Tractor size={16} /></i><span><strong>Machine picked up</strong><small>9:42 AM</small></span></div><div className="current"><i><Truck size={16} /></i><span><strong>On the way to your farm</strong><small>Expected 10:40 AM</small></span></div><div><i><MapPin size={16} /></i><span><strong>Delivery & inspection</strong><small>Complete handover checklist</small></span></div></div>
          <button className="secondary-button full-button">Contact support</button>
        </aside>
      </div>
    </div>
  );
}

function Support() {
  const [message, setMessage] = useState("");
  return (
    <div className="screen">
      <section className="support-hero"><div><span className="eyebrow">HELP & LEARNING</span><h2>Support in the language you trust</h2><p>Get booking help, machine guidance, and safety lessons through chat, audio, or a phone call.</p></div><Languages size={90} strokeWidth={1.1} /></section>
      <div className="support-grid">
        <article className="help-option"><div><Bot size={24} /></div><h3>Ask FarmIQ assistant</h3><p>Instant answers about booking, payments and machine use.</p><button>Start a conversation <ChevronRight size={16} /></button></article>
        <article className="help-option"><div><Headphones size={24} /></div><h3>Call regional support</h3><p>Speak to a support expert in Tamil, Hindi or English.</p><button>Call 1800 123 4567 <ChevronRight size={16} /></button></article>
        <article className="help-option"><div><Wrench size={24} /></div><h3>Machine tutorials</h3><p>Watch and listen to step-by-step safety lessons offline.</p><button>Browse learning centre <ChevronRight size={16} /></button></article>
      </div>
      <section className="chat-card"><div className="chat-head"><span><Bot size={20} /></span><div><strong>FarmIQ Assistant</strong><small>Online · replies in your language</small></div></div><div className="chat-body"><div className="assistant-bubble">Vanakkam Ravi! How can I help with your farm machinery today?</div><div className="quick-prompts"><button>How do I book a tractor?</button><button>Explain advance payment</button><button>Safety tutorial</button></div></div><div className="chat-input"><input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your question…" /><button onClick={() => setMessage("")} aria-label="Send message">➤</button></div></section>
    </div>
  );
}

function Account({ mode, setMode, navigate }: { mode: "login" | "register"; setMode: (mode: "login" | "register") => void; navigate: (screen: Screen) => void }) {
  return (
    <div className="account-screen">
      <section className="account-message"><div className="brand-mark light"><Tractor size={28} /></div><span className="eyebrow">WELCOME TO FARMIQ</span><h2>Modern machinery.<br />Within every farmer&apos;s reach.</h2><p>Book trusted equipment, arrange delivery, learn safe operation, and get help in your language.</p><div className="account-proof"><span><ShieldCheck size={18} /> Verified owners</span><span><Languages size={18} /> Regional languages</span><span><Headphones size={18} /> Human support</span></div></section>
      <section className="account-form-wrap">
        <div className="mode-tabs"><button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Sign in</button><button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Create account</button></div>
        <span className="eyebrow green">{mode === "login" ? "WELCOME BACK" : "JOIN THE NETWORK"}</span><h2>{mode === "login" ? "Sign in to FarmIQ" : "Create your FarmIQ account"}</h2><p>{mode === "login" ? "Use your mobile number to continue." : "Choose your role and verify your mobile number."}</p>
        {mode === "register" && <div className="role-options"><button className="selected"><Tractor size={19} />Farmer</button><button><Wrench size={19} />Machine owner</button><button><Truck size={19} />Delivery</button></div>}
        <label>Mobile number<div className="phone-input"><span>+91</span><input placeholder="98765 43210" /></div></label>
        {mode === "login" && <label>Password<div className="input-shell"><input type="password" placeholder="Enter your password" /></div></label>}
        {mode === "register" && <label>Full name<div className="input-shell"><input placeholder="Enter your name" /></div></label>}
        <button className="primary-button full-button" onClick={() => navigate("dashboard")}><LogIn size={18} /> {mode === "login" ? "Continue" : "Create account"}</button>
        <small className="terms">By continuing, you agree to FarmIQ&apos;s Terms and Privacy Policy.</small>
      </section>
    </div>
  );
}

function SectionHeading({ title, note, action, onClick }: { title: string; note: string; action?: string; onClick?: () => void }) {
  return <div className="section-heading"><div><h3>{title}</h3><span>{note}</span></div>{action && <button onClick={onClick}>{action} <ChevronRight size={16} /></button>}</div>;
}
