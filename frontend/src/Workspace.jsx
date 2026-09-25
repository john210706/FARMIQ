import React, { useEffect, useState } from 'react';
import {
  Tractor,
  LayoutDashboard,
  Search,
  CalendarDays,
  Wrench,
  Users,
  BookOpen,
  ShieldCheck,
  User,
  Bell,
  LogOut,
  Menu,
} from 'lucide-react';
import { api, getSession, saveSession, money, when } from './lib/api';
import { useData, State, Panel, Button, Action, Badge, Empty } from './ui';
import Auth from './pages/Auth';
import Catalog, { MachineDetail } from './pages/Catalog';
import Bookings, { BookingDetail } from './pages/Bookings';
import Fleet, { Admin } from './pages/Manage';
import Account from './pages/Account';
import Community from './pages/Community';
import Learning from './pages/Learning';
import './workspace.css';
import { Localizer } from './i18n';
const labels = {
  en: {
    dashboard: 'Overview',
    catalog: 'Find machinery',
    bookings: 'My bookings',
    fleet: 'My fleet',
    community: 'Field planner',
    learning: 'Learn & get help',
    admin: 'Administration',
    account: 'My account',
    notifications: 'Notifications',
  },
  ta: {
    dashboard: 'முகப்பு',
    catalog: 'இயந்திரங்கள்',
    bookings: 'முன்பதிவுகள்',
    fleet: 'என் இயந்திரங்கள்',
    community: 'வயல் திட்டம்',
    learning: 'பயிற்சி & உதவி',
    admin: 'நிர்வாகம்',
    account: 'என் கணக்கு',
    notifications: 'அறிவிப்புகள்',
  },
  hi: {
    dashboard: 'अवलोकन',
    catalog: 'मशीनें खोजें',
    bookings: 'मेरी बुकिंग',
    fleet: 'मेरी मशीनें',
    community: 'खेत की योजना',
    learning: 'सीखें और सहायता',
    admin: 'प्रशासन',
    account: 'मेरा खाता',
    notifications: 'सूचनाएं',
  },
};
const icons = {
  dashboard: LayoutDashboard,
  catalog: Search,
  bookings: CalendarDays,
  fleet: Wrench,
  community: Users,
  learning: BookOpen,
  admin: ShieldCheck,
  account: User,
  notifications: Bell,
};
const roleNavigation = {
  FARMER: ['dashboard', 'catalog', 'bookings', 'community', 'learning', 'notifications', 'account'],
  OWNER: ['dashboard', 'catalog', 'bookings', 'fleet', 'community', 'learning', 'notifications', 'account'],
  DRIVER: ['dashboard', 'bookings', 'notifications', 'account'],
  ADMIN: ['dashboard', 'catalog', 'bookings', 'community', 'learning', 'admin', 'notifications', 'account'],
};
const roleRoutes = {
  FARMER: [...roleNavigation.FARMER, 'machine', 'booking'],
  OWNER: [...roleNavigation.OWNER, 'machine', 'booking'],
  DRIVER: [...roleNavigation.DRIVER, 'booking'],
  ADMIN: [...roleNavigation.ADMIN, 'machine', 'booking'],
};
const driverBookingLabels = { en: 'My deliveries', ta: 'என் விநியோகங்கள்', hi: 'मेरी डिलीवरी' };
function route() {
  const [screen, id] = location.hash.slice(1).split('/');
  return { screen: screen || 'dashboard', id };
}
export default function Workspace() {
  const [session, setSession] = useState(getSession),
    [page, setPage] = useState(route),
    [language, setLanguage] = useState(
      () => getSession()?.user.language || localStorage.getItem('farmiq-language') || 'en',
    ),
    [menu, setMenu] = useState(false),
    [online, setOnline] = useState(navigator.onLine),
    [checking, setChecking] = useState(!!getSession());
  const t = labels[language] || labels.en;
  const { data: capabilities } = useData('/capabilities');
  const navigate = (screen, id) => {
    location.hash = `${screen}${id ? '/' + id : ''}`;
    setMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const logout = () => {
    saveSession(null);
    setSession(null);
    navigate('account');
  };
  const onUser = (user) => {
    const next = { ...getSession(), user };
    saveSession(next);
    setSession(next);
    setLanguage(user.language);
  };
  useEffect(() => {
    const change = () => setPage(route());
    const expired = () => logout();
    const network = () => setOnline(navigator.onLine);
    window.addEventListener('hashchange', change);
    window.addEventListener('session-expired', expired);
    window.addEventListener('online', network);
    window.addEventListener('offline', network);
    if (getSession())
      api('/auth/me')
        .then(onUser)
        .catch((e) => {
          if (e.status === 401) logout();
        })
        .finally(() => setChecking(false));
    return () => {
      window.removeEventListener('hashchange', change);
      window.removeEventListener('session-expired', expired);
      window.removeEventListener('online', network);
      window.removeEventListener('offline', network);
    };
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem('farmiq-language', language);
  }, [language]);
  const user = session?.user;
  const nav = user ? roleNavigation[user.role] || ['dashboard', 'account'] : ['catalog', 'account'];
  const screen = user && !roleRoutes[user.role]?.includes(page.screen) ? 'dashboard' : page.screen;
  const navLabel = (key) =>
    user?.role === 'DRIVER' && key === 'bookings' ? driverBookingLabels[language] : t[key];
  let content;
  if (checking) content = <p className="notice">Checking your session…</p>;
  else if (!user && !['catalog', 'machine'].includes(screen))
    content = (
      <Auth
        onLogin={(s) => {
          saveSession(s);
          setSession(s);
          setLanguage(s.user.language);
          navigate('dashboard');
        }}
      />
    );
  else if (screen === 'catalog')
    content = <Catalog navigate={navigate} language={language} lowData={user?.preferences?.lowData} />;
  else if (screen === 'machine' && page.id)
    content = <MachineDetail key={page.id} id={page.id} navigate={navigate} />;
  else if (screen === 'bookings') content = <Bookings user={user} navigate={navigate} />;
  else if (screen === 'booking' && page.id)
    content = <BookingDetail key={page.id} id={page.id} user={user} navigate={navigate} />;
  else if (screen === 'fleet' && user.role === 'OWNER') content = <Fleet />;
  else if (screen === 'admin' && user.role === 'ADMIN') content = <Admin />;
  else if (screen === 'community') content = <Community user={user} navigate={navigate} />;
  else if (screen === 'learning') content = <Learning language={language} />;
  else if (screen === 'account')
    content = <Account user={user} onUser={onUser} onLogout={logout} navigate={navigate} />;
  else if (screen === 'notifications') content = <Notifications navigate={navigate} />;
  else content = <Dashboard user={user} navigate={navigate} />;
  return (
    <Localizer language={language}>
      <div className="workspace">
        <a className="skip" href="#main-content">
          Skip to content
        </a>
        <aside className={`side ${menu ? 'open' : ''}`}>
          <a className="brand" href="#dashboard">
            <span>
              <Tractor size={25} />
            </span>
            FarmIQ<small>GROW TOGETHER</small>
          </a>
          <p className="side-label">{user ? `${user.role.toLowerCase()} workspace` : 'Explore FarmIQ'}</p>
          <nav>
            {nav.map((key) => {
              const Icon = icons[key];
              return (
                <button key={key} onClick={() => navigate(key)} className={screen === key ? 'selected' : ''}>
                  <Icon size={19} />
                  {navLabel(key)}
                </button>
              );
            })}
          </nav>
          <div className="side-bottom">
            <span className="leaf">✳</span>
            <p>
              Shared machines.
              <br />
              Stronger communities.
            </p>
            {user && (
              <>
                <strong>{user.fullName}</strong>
                <small>{user.accountId}</small>
                <Action
                  secondary
                  run={async () => {
                    await api('/auth/logout', { method: 'POST' });
                    logout();
                  }}
                >
                  Sign out
                </Action>
              </>
            )}
          </div>
        </aside>
        <div className="workspace-main">
          <header className="header">
            <div className="row">
              <button
                className="mobile-menu"
                aria-label="Toggle navigation"
                aria-expanded={menu}
                onClick={() => setMenu(!menu)}
              >
                <Menu />
              </button>
              <span>{navLabel(screen) || 'Your rental'}</span>
            </div>
            <div className="row">
              <span className={`connection ${online ? '' : 'offline'}`}>{online ? 'Online' : 'Offline'}</span>
              <select aria-label="Language" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="ta">தமிழ்</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>
          </header>
          {user?.role !== 'DRIVER' && capabilities?.payments === 'sandbox' && (
            <div className="sandbox-banner">
              DEMO PAYMENT MODE · No money is transferred. No escrow or insurance coverage is provided.
            </div>
          )}
          {!online && (
            <div className="notice">
              Offline: cached pages and saved drafts remain available. Reconnect to confirm availability or
              submit changes.
            </div>
          )}
          <main id="main-content" className="main" tabIndex="-1">
            {content}
          </main>
          <footer className="footer">
            FarmIQ · Equipment access for farming communities{' '}
            <span>Prototype agreements and policies require review before public launch.</span>
          </footer>
          <nav className="bottom-nav">
            {nav.slice(0, 4).map((key) => {
              const Icon = icons[key];
              return (
                <button
                  key={key}
                  onClick={() => navigate(key)}
                  aria-current={screen === key ? 'page' : undefined}
                >
                  <Icon size={18} />
                  {navLabel(key)}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </Localizer>
  );
}
function Dashboard({ user, navigate }) {
  if (user.role === 'DRIVER') return <DriverDashboard user={user} navigate={navigate} />;
  const { data, error } = useData('/analytics');
  return (
    <>
      <div className="welcome">
        <div>
          <span className="eyebrow">A GOOD DAY TO GET GROWING</span>
          <h1>Hello, {user.fullName.split(' ')[0]}.</h1>
          <p>
            {user.role === 'FARMER'
              ? 'The right equipment makes room for better harvests.'
              : user.role === 'OWNER'
                ? 'Keep your fleet ready and your next season moving.'
                : user.role === 'DRIVER'
                  ? 'Your next delivery connects a farmer to the equipment they need.'
                  : 'Keep the community’s equipment, people and bookings on track.'}
          </p>
          <Button
            onClick={() =>
              navigate(
                user.role === 'FARMER'
                  ? 'catalog'
                  : user.role === 'OWNER'
                    ? 'fleet'
                    : user.role === 'ADMIN'
                      ? 'admin'
                      : 'bookings',
              )
            }
          >
            {user.role === 'FARMER'
              ? 'Find machinery'
              : user.role === 'OWNER'
                ? 'Manage fleet'
                : user.role === 'ADMIN'
                  ? 'Open administration'
                  : 'Find deliveries'}{' '}
            →
          </Button>
        </div>
        <div className="field-art" aria-hidden="true">
          <Tractor size={120} strokeWidth={1} />
          <span>
            LOCAL ROOTS.
            <br />
            SHARED PROGRESS.
          </span>
        </div>
      </div>
      <State data={data} error={error}>
        {data && (
          <>
            <div className="metrics">
              {[
                ['Active bookings', data.active],
                ['Completed rentals', data.completed],
                [
                  user.role === 'OWNER' ? 'Fleet size' : 'Total bookings',
                  user.role === 'OWNER' ? data.fleet : data.bookings,
                ],
                [
                  user.role === 'OWNER' ? 'Calculated earnings' : 'Payments received',
                  money(user.role === 'OWNER' ? data.ownerEarnings : data.received),
                ],
              ].map(([title, value]) => (
                <section className="metric" key={title}>
                  <span>{title}</span>
                  <strong>{value}</strong>
                  <small>From your recorded activity</small>
                </section>
              ))}
            </div>
            <div className="two">
              <Panel title="Your next steps">
                <div className="quick-actions">
                  <Button secondary onClick={() => navigate('bookings')}>
                    Follow your bookings →
                  </Button>
                  <Button secondary onClick={() => navigate('community')}>
                    Plan fieldwork & costs →
                  </Button>
                  <Button secondary onClick={() => navigate('learning')}>
                    Learn & ask for help →
                  </Button>
                </div>
                <p className="muted">{data.note}</p>
              </Panel>
              <Panel title="Demand in your booking history">
                {Object.keys(data.demand).length ? (
                  Object.entries(data.demand).map(([name, count]) => (
                    <div className="demand-row" key={name}>
                      <span>{name}</span>
                      <meter min="0" max={Math.max(...Object.values(data.demand))} value={count} />
                      <strong>{count}</strong>
                    </div>
                  ))
                ) : (
                  <Empty>Your activity will appear here after the first booking.</Empty>
                )}
                <p className="muted">
                  {data.rentedHours} completed rental hours · {money(data.commission)} calculated platform
                  commission
                </p>
              </Panel>
            </div>
          </>
        )}
      </State>
    </>
  );
}
function DriverDashboard({ user, navigate }) {
  const { data, error } = useData('/driver/deliveries');
  const active =
    data?.filter((job) => ['ASSIGNED', 'PICKUP_INSPECTION', 'IN_TRANSIT'].includes(job.status)) || [];
  const completed = data?.filter((job) => ['DELIVERED', 'COMPLETED'].includes(job.status)) || [];
  const next = active[0];
  return (
    <>
      <div className="welcome">
        <div>
          <span className="eyebrow">DRIVER DELIVERY WORKSPACE</span>
          <h1>Hello, {user.fullName.split(' ')[0]}.</h1>
          <p>See assigned deliveries, complete pickup checks, share GPS and confirm handover.</p>
          <Button onClick={() => navigate('bookings')}>Open my deliveries →</Button>
        </div>
        <div className="field-art" aria-hidden="true">
          <Tractor size={120} strokeWidth={1} />
          <span>
            SAFE PICKUP.
            <br />
            VERIFIED HANDOVER.
          </span>
        </div>
      </div>
      <State data={data} error={error}>
        {data && (
          <>
            <div className="metrics">
              {[
                ['Assigned deliveries', active.length],
                ['Completed deliveries', completed.length],
                ['Duty status', user.onDuty ? 'ON DUTY' : 'OFF DUTY'],
                ['Verification', user.verificationStatus],
              ].map(([title, value]) => (
                <section className="metric" key={title}>
                  <span>{title}</span>
                  <strong>{value}</strong>
                  <small>Driver account activity</small>
                </section>
              ))}
            </div>
            <div className="two">
              <Panel title="Next assigned delivery">
                {next ? (
                  <div className="stack">
                    <Badge>{next.status}</Badge>
                    <h3>{next.machinery.name}</h3>
                    <p>
                      {when(next.scheduledAt)} · {next.farmAddress}
                    </p>
                    <Button onClick={() => navigate('booking', next.id)}>Open delivery job →</Button>
                  </div>
                ) : (
                  <Empty>No delivery is currently assigned to you.</Empty>
                )}
              </Panel>
              <Panel title="Driver readiness">
                <p>
                  {user.verificationStatus === 'VERIFIED'
                    ? 'Your driver account is verified.'
                    : 'Your driver verification is still pending.'}
                </p>
                <p>{user.onDuty ? 'You are available for assignment.' : 'You are currently off duty.'}</p>
                <Button secondary onClick={() => navigate('account')}>
                  Update duty status →
                </Button>
              </Panel>
            </div>
          </>
        )}
      </State>
    </>
  );
}
function Notifications({ navigate }) {
  const [v, setV] = useState(0);
  const { data, error } = useData('/notifications', v);
  return (
    <Panel title="Notifications">
      <State data={data} error={error}>
        {data?.length ? (
          data.map((n) => (
            <div className="list-row" key={n.id}>
              <div>
                <p>{n.message}</p>
                <small>{when(n.createdAt)}</small>
              </div>
              {n.bookingId && (
                <Button secondary onClick={() => navigate('booking', n.bookingId)}>
                  View booking
                </Button>
              )}
              {!n.readAt && (
                <Action
                  secondary
                  run={() => api(`/notifications/${n.id}`, { method: 'PATCH' })}
                  done={() => setV((v) => v + 1)}
                >
                  Mark read
                </Action>
              )}
            </div>
          ))
        ) : (
          <Empty>You’re all caught up.</Empty>
        )}
      </State>
    </Panel>
  );
}
