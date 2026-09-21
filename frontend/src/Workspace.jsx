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
  const nav = user
    ? [
        'dashboard',
        'catalog',
        'bookings',
        ...(user.role === 'OWNER' ? ['fleet'] : []),
        'community',
        'learning',
        ...(user.role === 'ADMIN' ? ['admin'] : []),
        'notifications',
        'account',
      ]
    : ['catalog', 'account'];
  let content;
  if (checking) content = <p className="notice">Checking your session…</p>;
  else if (!user && !['catalog', 'machine'].includes(page.screen))
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
  else if (page.screen === 'catalog')
    content = <Catalog navigate={navigate} language={language} lowData={user?.preferences?.lowData} />;
  else if (page.screen === 'machine' && page.id)
    content = <MachineDetail key={page.id} id={page.id} navigate={navigate} />;
  else if (page.screen === 'bookings') content = <Bookings user={user} navigate={navigate} />;
  else if (page.screen === 'booking' && page.id)
    content = <BookingDetail key={page.id} id={page.id} user={user} navigate={navigate} />;
  else if (page.screen === 'fleet' && user.role === 'OWNER') content = <Fleet />;
  else if (page.screen === 'admin' && user.role === 'ADMIN') content = <Admin />;
  else if (page.screen === 'community') content = <Community user={user} navigate={navigate} />;
  else if (page.screen === 'learning') content = <Learning language={language} />;
  else if (page.screen === 'account')
    content = <Account user={user} onUser={onUser} onLogout={logout} navigate={navigate} />;
  else if (page.screen === 'notifications') content = <Notifications navigate={navigate} />;
  else content = <Dashboard user={user} navigate={navigate} />;
  return (
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
              <button
                key={key}
                onClick={() => navigate(key)}
                className={page.screen === key ? 'selected' : ''}
              >
                <Icon size={19} />
                {t[key]}
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
            <span>{t[page.screen] || 'Your rental'}</span>
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
        {capabilities?.payments === 'sandbox' && (
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
                aria-current={page.screen === key ? 'page' : undefined}
              >
                <Icon size={18} />
                {t[key]}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
function Dashboard({ user, navigate }) {
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
