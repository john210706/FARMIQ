import React, { useMemo, useState } from "react";

const symbol = (character) => function SymbolIcon() {
  return <span className="glyph" aria-hidden="true">{character}</span>;
};

const Bell = symbol("●");
const Bot = symbol("✦");
const CalendarDays = symbol("▣");
const ChevronRight = symbol("›");
const CircleHelp = symbol("?");
const Clock3 = symbol("◷");
const CreditCard = symbol("▤");
const Gauge = symbol("◉");
const Headphones = symbol("☏");
const IndianRupee = symbol("₹");
const Languages = symbol("文");
const LayoutDashboard = symbol("▦");
const LocateFixed = symbol("⌾");
const LogIn = symbol("↪");
const MapPin = symbol("⌖");
const Menu = symbol("☰");
const PackageCheck = symbol("✓");
const Search = symbol("⌕");
const ShieldCheck = symbol("◆");
const Star = symbol("★");
const Tractor = symbol("🚜");
const Truck = symbol("🚚");
const UserRound = symbol("○");
const UsersRound = symbol("◎");
const Wrench = symbol("⚒");
const X = symbol("×");

const navigation = [
  ["dashboard", "Overview", LayoutDashboard],
  ["machines", "Find machinery", Tractor],
  ["booking", "My bookings", CalendarDays],
  ["payments", "Payments", CreditCard],
  ["tracking", "Track delivery", Truck],
  ["support", "Help & learning", CircleHelp],
];

const machinery = [
  { name: "Mahindra 575 DI", type: "Tractor", owner: "Sri Murugan Agro Services", distance: "2.4 km", price: "₹1,250", rating: "4.9", tone: "red" },
  { name: "John Deere 5310", type: "Tractor", owner: "Green Field Rentals", distance: "4.8 km", price: "₹1,500", rating: "4.8", tone: "green" },
  { name: "Shaktiman Rotavator", type: "Tillage", owner: "Kaveri Farm Tools", distance: "6.1 km", price: "₹750", rating: "4.7", tone: "gold" },
];

const roleContent = {
  Farmer: ["Good morning, Ravi", "Book machinery early and avoid peak-season shortages.", ["2 active bookings", "18 hours saved", "24 nearby machines"]],
  "Machinery owner": ["Welcome back, Murugan", "Two rental requests are waiting for confirmation.", ["6 listed machines", "₹34.8k this month", "78% utilisation"]],
  "Delivery person": ["Your route is ready", "Three equipment movements are scheduled today.", ["3 trips today", "1 completed", "42 km remaining"]],
  Administrator: ["FarmIQ operations", "Four verification requests need review.", ["1,248 active users", "86 live rentals", "4 open issues"]],
};

export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const [role, setRole] = useState("Farmer");
  const [menuOpen, setMenuOpen] = useState(false);
  const title = useMemo(() => navigation.find(([id]) => id === screen)?.[1] || "Account", [screen]);

  const openScreen = (next) => {
    setScreen(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand"><span><Tractor /></span><div><strong>FarmIQ</strong><small>Smart farm access</small></div><button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></button></div>
        <p className="nav-label">WORKSPACE</p>
        <nav>
          {navigation.map(([id, label, Icon]) => (
            <button key={id} className={screen === id ? "active" : ""} onClick={() => openScreen(id)}><Icon />{label}</button>
          ))}
        </nav>
        <div className="role-switch"><UsersRound /><label>Viewing as<select value={role} onChange={(event) => { setRole(event.target.value); openScreen("dashboard"); }}>{Object.keys(roleContent).map((name) => <option key={name}>{name}</option>)}</select></label></div>
        <div className="phone-help"><Headphones /><strong>Need help booking?</strong><small>Tamil support line</small><a href="tel:18001234567">1800 123 4567</a></div>
      </aside>
      {menuOpen && <button className="scrim" onClick={() => setMenuOpen(false)} aria-label="Close menu" />}

      <main>
        <header className="topbar">
          <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu /></button>
          <div><small>FARMIQ PLATFORM</small><h1>{title}</h1></div>
          <div className="header-actions"><button><Languages /> English</button><button aria-label="Notifications"><Bell /></button><button className="profile" onClick={() => openScreen("account")}><span>RV</span><div><strong>Ravi Kumar</strong><small>Farmer · FQ1024</small></div></button></div>
        </header>
        <div className="content">
          {screen === "dashboard" && <Dashboard role={role} openScreen={openScreen} />}
          {screen === "machines" && <Machines openScreen={openScreen} />}
          {screen === "booking" && <Booking openScreen={openScreen} />}
          {screen === "payments" && <Payments openScreen={openScreen} />}
          {screen === "tracking" && <Tracking />}
          {screen === "support" && <Support />}
          {screen === "account" && <Account openScreen={openScreen} />}
        </div>
      </main>
    </div>
  );
}

function Dashboard({ role, openScreen }) {
  const [heading, description, metrics] = roleContent[role];
  return <div className="screen">
    <section className="hero"><div><span>{role} workspace</span><h2>{heading}</h2><p>{description}</p><button className="primary" onClick={() => openScreen(role === "Farmer" ? "machines" : "booking")}><Search />{role === "Farmer" ? "Find a machine" : "View activity"}</button></div><div className="tractor-art"><i /><Tractor /></div></section>
    <section className="metrics">{metrics.map((item, index) => <article key={item}><span>{index === 0 ? <CalendarDays /> : index === 1 ? <Clock3 /> : <MapPin />}</span><strong>{item.split(" ")[0]}</strong><small>{item.substring(item.indexOf(" ") + 1)}</small></article>)}</section>
    {role === "Farmer" ? <div className="two-columns"><section><SectionTitle title="Recommended near you" subtitle="Verified machines around Thanjavur" /><div className="machine-list">{machinery.slice(0, 2).map((item) => <MachineCard key={item.name} machine={item} onBook={() => openScreen("booking")} />)}</div></section><section><SectionTitle title="Current booking" subtitle="Arriving today" /><article className="status-card"><div className="status-heading"><span><Tractor /></span><div><strong>Mahindra 575 DI</strong><small>#FQ-2048 · 6 hours</small></div><b>In transit</b></div><div className="steps"><i /><i /><i /><i /></div><div className="step-labels"><span>Confirmed</span><span>Picked up</span><span>On the way</span><span>Delivered</span></div><div className="arrival"><MapPin /><div><small>Estimated arrival</small><strong>Today, 10:40 AM</strong></div><button onClick={() => openScreen("tracking")}>Track live</button></div></article></section></div> : <RolePreview role={role} />}
  </div>;
}

function RolePreview({ role }) {
  const rows = role === "Machinery owner" ? ["Review two rental requests", "Update machine availability", "View this month's earnings"] : role === "Delivery person" ? ["Pickup from Kaveri Farm Tools", "Deliver to Ravi Kumar farm", "Complete handover checklist"] : ["Review owner verifications", "Resolve payment complaints", "Check machine inspections"];
  return <section className="role-preview"><SectionTitle title={`${role} tasks`} subtitle="Day 2 interface preview" />{rows.map((row, index) => <div key={row}><span>0{index + 1}</span><strong>{row}</strong><ChevronRight /></div>)}</section>;
}

function Machines({ openScreen }) {
  const [query, setQuery] = useState("");
  const results = machinery.filter((item) => `${item.name} ${item.type}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="screen"><PageTitle label="MACHINERY MARKETPLACE" title="Find the right machine nearby" text="Compare verified equipment, hourly prices and availability." /><div className="search-bar"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tractors, harvesters, tillage…" /><button><LocateFixed /> Within 10 km</button></div><div className="filter-row"><button className="selected">All machinery</button><button>Tractors</button><button>Harvesters</button><button>Tillage</button><button>Sprayers</button></div><p className="result-count">{results.length} machines found</p><div className="machine-list marketplace">{results.map((item) => <MachineCard key={item.name} machine={item} onBook={() => openScreen("booking")} detailed />)}</div></div>;
}

function MachineCard({ machine, onBook, detailed }) {
  return <article className={`machine-card ${detailed ? "detailed" : ""}`}><div className={`machine-picture ${machine.tone}`}><small>{machine.type}</small><Tractor /></div><div className="machine-info"><span className="available">● Available today</span><h3>{machine.name}</h3><p>{machine.owner}</p><div className="machine-meta"><span><MapPin />{machine.distance}</span><span><Star />{machine.rating}</span><span><ShieldCheck />Verified</span></div>{detailed && <div className="specs"><span><Gauge />45 HP</span><span><Wrench />Inspected</span><span><UserRound />Operator available</span></div>}<footer><div><strong>{machine.price}</strong><small>/ hour</small></div><button className="primary" onClick={onBook}>View & book <ChevronRight /></button></footer></div></article>;
}

function Booking({ openScreen }) {
  const [requested, setRequested] = useState(false);
  if (requested) return <div className="success screen"><span><PackageCheck /></span><small>BOOKING REQUESTED</small><h2>Machine reserved</h2><p>Your request #FQ-2051 was sent to the owner.</p><article><strong>Mahindra 575 DI</strong><span>12 August · 8:00 AM · 6 hours</span></article><button className="primary" onClick={() => openScreen("payments")}>Continue to payment</button></div>;
  return <div className="screen"><PageTitle label="BOOKING DETAILS" title="Reserve your machinery" text="Confirm the schedule and delivery details." /><div className="booking-layout"><section className="form-card"><div className="selected-machine"><span><Tractor /></span><div><small>Selected machine</small><strong>Mahindra 575 DI</strong><p>Sri Murugan Agro Services · 2.4 km</p></div><button onClick={() => openScreen("machines")}>Change</button></div><h3>Date and duration</h3><div className="form-grid"><label>Rental date<input type="date" defaultValue="2026-08-12" /></label><label>Start time<input type="time" defaultValue="08:00" /></label></div><label>Rental duration — 6 hours<input type="range" min="2" max="12" defaultValue="6" /></label><h3>Delivery location</h3><div className="location"><MapPin /><div><strong>Ravi Kumar's farm</strong><small>Vallam Road, Thanjavur, Tamil Nadu</small></div></div><label className="check"><input type="checkbox" defaultChecked /><span><strong>Add a verified operator</strong><small>+₹180 per hour</small></span></label></section><aside className="summary"><small>PRICE SUMMARY</small><h3>Transparent pricing</h3><p><span>Machine rental</span><strong>₹7,500</strong></p><p><span>Delivery & pickup</span><strong>₹600</strong></p><p><span>Verified operator</span><strong>₹1,080</strong></p><p className="discount"><span>First booking offer</span><strong>−₹500</strong></p><hr /><div><span>Total</span><strong>₹8,680</strong></div><em><ShieldCheck />UI demonstration only. No real payment or database is connected.</em><button className="primary full" onClick={() => setRequested(true)}>Request booking</button></aside></div></div>;
}

function Payments({ openScreen }) {
  const [method, setMethod] = useState("upi");
  const methods = [["upi", "UPI", "Google Pay, PhonePe or any UPI app", IndianRupee], ["card", "Debit or credit card", "Visa, Mastercard and RuPay", CreditCard], ["cash", "Assisted cash payment", "Pay at a FarmIQ service point", UserRound]];
  return <div className="screen"><PageTitle label="PAYMENT WIREFRAME" title="Advance-payment interface" text="This is a visual prototype. No payment gateway is connected." /><div className="payment-layout"><section className="form-card"><div className="secure-box"><ShieldCheck /><div><strong>50% advance · ₹4,340</strong><small>Booking #FQ-2051</small></div></div><h3>Select payment method</h3>{methods.map(([id, name, note, Icon]) => <button className={`payment-method ${method === id ? "selected" : ""}`} onClick={() => setMethod(id)} key={id}><i /><div><strong>{name}</strong><small>{note}</small></div><Icon /></button>)}<button className="primary full" onClick={() => openScreen("tracking")}>Continue prototype</button></section><aside className="trust"><small>FARMIQ PROTECTION</small><h3>Designed for trusted rentals</h3><p><ShieldCheck /><span><strong>Protected advance</strong>Planned for the Express and Supabase phase.</span></p><p><Wrench /><span><strong>Quality checked</strong>Machine inspection details remain visible.</span></p><p><Headphones /><span><strong>Human support</strong>Help remains available throughout the rental.</span></p></aside></div></div>;
}

function Tracking() {
  return <div className="screen"><PageTitle label="TRACKING WIREFRAME" title="Your tractor is on the way" text="Booking #FQ-2048 · Expected in 28 minutes" /><div className="tracking-layout"><section className="map"><div className="road one" /><div className="road two" /><div className="route" /><span className="pin start"><Tractor />Pickup</span><span className="pin moving"><Truck />28 min</span><span className="pin end"><MapPin />Your farm</span></section><aside className="timeline"><div className="driver"><span>SK</span><div><small>Delivery partner</small><strong>Suresh Kumar</strong><p>★ 4.9 · 268 deliveries</p></div></div>{[[PackageCheck, "Booking confirmed", "8:05 AM"], [Tractor, "Machine picked up", "9:42 AM"], [Truck, "On the way", "Expected 10:40 AM"], [MapPin, "Delivery and inspection", "Pending"]].map(([Icon, title, time], index) => <div className={`timeline-item ${index < 3 ? "done" : ""}`} key={title}><i><Icon /></i><span><strong>{title}</strong><small>{time}</small></span></div>)}</aside></div></div>;
}

function Support() {
  return <div className="screen"><section className="support-hero"><div><small>HELP & LEARNING</small><h2>Support in the language you trust</h2><p>Booking help, machinery guidance and safety lessons through chat, audio or phone.</p></div><Languages /></section><div className="help-grid"><HelpCard icon={Bot} title="FarmIQ assistant" text="Answers for common booking and payment questions." /><HelpCard icon={Headphones} title="Regional support" text="Phone support in Tamil, Hindi and English." /><HelpCard icon={Wrench} title="Machine tutorials" text="Step-by-step operation and safety lessons." /></div><section className="chat"><header><Bot /><div><strong>FarmIQ Assistant</strong><small>UI demonstration</small></div></header><div><p>Vanakkam Ravi! How can I help with farm machinery today?</p><span><button>How do I book?</button><button>Explain advance payment</button><button>Safety tutorial</button></span></div><footer><input placeholder="Type your question…" /><button>Send</button></footer></section></div>;
}

function Account({ openScreen }) {
  const [register, setRegister] = useState(false);
  return <div className="account screen"><section><Tractor /><small>WELCOME TO FARMIQ</small><h2>Modern machinery within every farmer's reach.</h2><p>Book trusted equipment, arrange delivery and receive help in your language.</p></section><form onSubmit={(event) => { event.preventDefault(); openScreen("dashboard"); }}><div className="tabs"><button type="button" className={!register ? "active" : ""} onClick={() => setRegister(false)}>Sign in</button><button type="button" className={register ? "active" : ""} onClick={() => setRegister(true)}>Register</button></div><h2>{register ? "Create your account" : "Sign in to FarmIQ"}</h2>{register && <label>Role<select><option>Farmer</option><option>Machinery owner</option><option>Delivery person</option></select></label>}<label>Mobile number<input placeholder="98765 43210" /></label><label>{register ? "Full name" : "Password"}<input type={register ? "text" : "password"} placeholder={register ? "Ravi Kumar" : "Enter password"} /></label><button className="primary full"><LogIn />Continue</button><small>Day 2 UI only — authentication is not connected yet.</small></form></div>;
}

function HelpCard({ icon: Icon, title, text }) { return <article className="help-card"><span><Icon /></span><h3>{title}</h3><p>{text}</p><button>Open <ChevronRight /></button></article>; }
function PageTitle({ label, title, text }) { return <header className="page-title"><small>{label}</small><h2>{title}</h2><p>{text}</p></header>; }
function SectionTitle({ title, subtitle }) { return <header className="section-title"><h3>{title}</h3><small>{subtitle}</small></header>; }
