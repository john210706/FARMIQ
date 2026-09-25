import React, { useState, useEffect, lazy, Suspense } from 'react';
import { api, money, when, upload, pay, download, openDocument } from '../lib/api';
import { useData, State, Panel, Button, Action, Form, Field, Badge, Empty } from '../ui';
import { Quote } from './Catalog';
import { tr } from '../i18n';
const Map = lazy(() => import('./Map'));
export default function Bookings({ navigate, user }) {
  const [version, setVersion] = useState(0),
    [filter, setFilter] = useState('');
  const driver = user.role === 'DRIVER';
  const { data, error } = useData(driver ? '/driver/deliveries' : '/bookings', version);
  const statuses = driver
    ? ['ASSIGNED', 'PICKUP_INSPECTION', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED']
    : [
        'REQUESTED',
        'PENDING_PAYMENT',
        'PAID',
        'ASSIGNED',
        'IN_TRANSIT',
        'DELIVERED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
      ];
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">YOUR RENTAL JOURNEY</span>
        <h1>{driver ? 'My assigned deliveries' : 'Bookings'}</h1>
        <p>
          {driver
            ? 'Only delivery jobs assigned to your driver account are shown here.'
            : 'Every decision, inspection and payment in one place.'}
        </p>
      </div>
      <div className="toolbar">
        <Field label="Filter status">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">{driver ? 'All deliveries' : 'All bookings'}</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Button secondary onClick={() => setVersion((v) => v + 1)}>
          Refresh
        </Button>
      </div>
      <State data={data} error={error}>
        {data?.filter((b) => !filter || b.status === filter).length ? (
          <div className="stack">
            {data
              .filter((b) => !filter || b.status === filter)
              .map((b) => (
                <article className="panel booking-row" key={b.id}>
                  <div>
                    <Badge>{b.status}</Badge>
                    <h2>{b.machinery.name}</h2>
                    <p className="muted">
                      {when(b.scheduledAt)} · {b.durationHours || 'Scheduled'} hours
                    </p>
                    <small>#{b.id.slice(0, 8)}</small>
                  </div>
                  <div className="row">
                    {!driver && <strong>{money(b.totalAmount)}</strong>}
                    <Button onClick={() => navigate('booking', b.id)}>
                      {driver ? 'Open delivery' : 'Open booking'}
                    </Button>
                  </div>
                </article>
              ))}
          </div>
        ) : (
          <Empty>
            {driver
              ? 'No delivery is assigned to you in this view.'
              : 'No bookings in this view. New requests and delivery jobs will appear here.'}
          </Empty>
        )}
      </State>
    </>
  );
}
const steps = [
  'REQUESTED',
  'PENDING_PAYMENT',
  'PAID',
  'ASSIGNED',
  'PICKUP_INSPECTION',
  'IN_TRANSIT',
  'DELIVERED',
  'IN_PROGRESS',
  'RETURN_INSPECTION',
  'COMPLETED',
];
const driverSteps = ['ASSIGNED', 'PICKUP_INSPECTION', 'IN_TRANSIT', 'DELIVERED'];
export function BookingDetail({ id, user, navigate }) {
  const [version, setVersion] = useState(0),
    [code, setCode] = useState(''),
    [message, setMessage] = useState(''),
    [gps, setGps] = useState(false),
    [cancelQuote, setCancelQuote] = useState(null);
  const { data: b, error } = useData(`/bookings/${id}`, version);
  const refresh = () => setVersion((v) => v + 1);
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, 30000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!gps) return;
    if (!navigator.geolocation) {
      setMessage('GPS unavailable');
      return;
    }
    const watch = navigator.geolocation.watchPosition(
      (p) => {
        const point = { latitude: p.coords.latitude, longitude: p.coords.longitude };
        sessionStorage.setItem('farmiq-gps', JSON.stringify(point));
        if (navigator.onLine)
          api('/drivers/location', { method: 'PATCH', body: point })
            .then(() => {
              sessionStorage.removeItem('farmiq-gps');
              setMessage('Location shared while this page is open');
            })
            .catch((e) => setMessage(e.message));
        else setMessage('Latest location buffered until reconnection');
      },
      (e) => setMessage(e.message),
      { enableHighAccuracy: true, maximumAge: 30000 },
    );
    const send = () => {
      const p = sessionStorage.getItem('farmiq-gps');
      if (p)
        api('/drivers/location', { method: 'PATCH', body: JSON.parse(p) })
          .then(() => sessionStorage.removeItem('farmiq-gps'))
          .catch((e) => setMessage(e.message));
    };
    window.addEventListener('online', send);
    return () => {
      navigator.geolocation.clearWatch(watch);
      window.removeEventListener('online', send);
    };
  }, [gps]);
  const change = (status) => api(`/bookings/${id}/status`, { method: 'PATCH', body: { status } });
  return (
    <State data={b} error={error}>
      {b && (
        <>
          <div className="row spread">
            <Button secondary onClick={() => navigate('bookings')}>
              {user.role === 'DRIVER' ? '← My deliveries' : '← Bookings'}
            </Button>
            <Button secondary onClick={refresh}>
              Refresh
            </Button>
          </div>
          <div className="page-heading">
            <Badge>{b.status}</Badge>
            <h1>{b.machinery.name}</h1>
            <p>
              {when(b.scheduledAt)} · {b.durationHours} hours · {b.farmAddress}
            </p>
            <small>
              {user.role === 'DRIVER' ? 'Delivery' : 'Booking'} #{b.id}
            </small>
          </div>
          <ol className="stepper">
            {(user.role === 'DRIVER' ? driverSteps : steps).map((s, i, visibleSteps) => (
              <li key={s} className={visibleSteps.indexOf(b.status) >= i ? 'done' : ''}>
                {tr(s).replaceAll('_', ' ')}
              </li>
            ))}
          </ol>
          {message && (
            <p className="notice" role="status">
              {message}
            </p>
          )}
          <div className="detail-grid">
            <section className="stack">
              <Panel title="Next action">
                <div className="row wrap">
                  {user.role === 'OWNER' && b.status === 'REQUESTED' && (
                    <>
                      <Action run={() => change('PENDING_PAYMENT')} done={refresh}>
                        Accept request
                      </Action>
                      <Action secondary run={() => change('REJECTED')} done={refresh}>
                        Decline
                      </Action>
                    </>
                  )}
                  {user.role === 'FARMER' && b.status === 'PENDING_PAYMENT' && (
                    <>
                      <p>Pay before {when(b.holdExpiresAt)}.</p>
                      <Action
                        run={() => pay(id, 'ADVANCE')}
                        done={(v) => {
                          setMessage(v.message || 'Payment updated');
                          refresh();
                        }}
                      >
                        Pay 50% advance
                      </Action>
                    </>
                  )}
                  {user.role === 'DRIVER' && b.status === 'ASSIGNED' && (
                    <Action run={() => change('PICKUP_INSPECTION')} done={refresh}>
                      Begin pickup inspection
                    </Action>
                  )}
                  {user.role === 'DRIVER' && b.status === 'PICKUP_INSPECTION' && (
                    <Action run={() => change('IN_TRANSIT')} done={refresh}>
                      Start delivery
                    </Action>
                  )}
                  {user.role === 'FARMER' && b.status === 'IN_TRANSIT' && (
                    <Action
                      run={() => api(`/bookings/${id}/handover-code`, { method: 'POST' })}
                      done={(v) => setCode(v.code)}
                    >
                      Generate handover code
                    </Action>
                  )}
                  {user.role === 'FARMER' && code && <strong className="code">{code}</strong>}
                  {user.role === 'DRIVER' &&
                    ['ASSIGNED', 'PICKUP_INSPECTION', 'IN_TRANSIT'].includes(b.status) && (
                      <Button secondary onClick={() => setGps(!gps)}>
                        {gps ? 'Stop sharing GPS' : 'Share my GPS'}
                      </Button>
                    )}
                  {user.role === 'DRIVER' && b.status === 'IN_TRANSIT' && (
                    <Form
                      label="Confirm delivery"
                      onSubmit={async (values) => {
                        await api(`/bookings/${id}/status`, {
                          method: 'PATCH',
                          body: { status: 'DELIVERED', code: values.code },
                        });
                        refresh();
                      }}
                    >
                      <Field label="Farmer’s handover code" name="code" pattern="[0-9]{6}" required />
                    </Form>
                  )}
                  {user.role === 'FARMER' && b.status === 'DELIVERED' && (
                    <>
                      <Action
                        run={() => pay(id, 'BALANCE')}
                        done={(v) => {
                          setMessage(v.message || 'Payment updated');
                          refresh();
                        }}
                      >
                        Pay remaining balance
                      </Action>
                      <Action run={() => change('IN_PROGRESS')} done={refresh}>
                        Start rental
                      </Action>
                    </>
                  )}
                  {user.role === 'FARMER' && b.status === 'IN_PROGRESS' && (
                    <Action run={() => change('RETURN_INSPECTION')} done={refresh}>
                      Request return inspection
                    </Action>
                  )}
                  {user.role === 'OWNER' && b.status === 'RETURN_INSPECTION' && (
                    <Action run={() => change('COMPLETED')} done={refresh}>
                      Complete rental
                    </Action>
                  )}
                  {b.status === 'PAID' && <p>Advance received. Awaiting a verified delivery partner.</p>}
                  {b.status === 'REQUESTED' && user.role === 'FARMER' && (
                    <p>Your request is awaiting owner approval.</p>
                  )}
                  {['COMPLETED', 'CANCELLED', 'REJECTED'].includes(b.status) && (
                    <p>This booking is {b.status.toLowerCase()}.</p>
                  )}
                </div>
              </Panel>
              {((user.role === 'DRIVER' && b.status === 'PICKUP_INSPECTION') ||
                (user.role === 'FARMER' && b.status === 'DELIVERED') ||
                (user.role === 'OWNER' && b.status === 'RETURN_INSPECTION')) && (
                <Inspection booking={b} refresh={refresh} />
              )}
              {b.driver && (
                <Panel title={user.role === 'DRIVER' ? 'Route & contacts' : 'Delivery location'}>
                  <Suspense fallback={<p>Loading map…</p>}>
                    <Map booking={b} />
                  </Suspense>
                  <p className="muted">
                    {b.driver.locationUpdatedAt
                      ? `Last GPS update: ${when(b.driver.locationUpdatedAt)}`
                      : 'No live GPS update received.'}{' '}
                    The dotted line indicates distance, not a road route.
                  </p>
                  {user.role === 'DRIVER' ? (
                    <div className="stack">
                      <p>
                        <strong>Pickup:</strong> {b.machinery.location || 'Machinery pickup location'}
                      </p>
                      <p>
                        <strong>Deliver to:</strong> {b.farmAddress}
                      </p>
                      <p>
                        {b.farmer.fullName} · <a href={`tel:${b.farmer.phone}`}>Call farmer</a>
                      </p>
                      {b.machinery.latitude != null && b.machinery.longitude != null && (
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={`https://www.google.com/maps/dir/?api=1&destination=${b.machinery.latitude},${b.machinery.longitude}`}
                        >
                          Directions to pickup
                        </a>
                      )}
                    </div>
                  ) : (
                    <p>
                      {b.driver.fullName} · <a href={`tel:${b.driver.phone}`}>Call delivery partner</a>
                    </p>
                  )}
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${b.farmLat},${b.farmLng}`}
                  >
                    Open road directions
                  </a>
                </Panel>
              )}
              <Panel title="Booking timeline">
                <ol className="timeline">
                  {b.history.map((h) => (
                    <li key={h.id}>
                      <strong>{tr(h.toStatus).replaceAll('_', ' ')}</strong>
                      <p>{tr(h.note)}</p>
                      <small>{when(h.createdAt)}</small>
                    </li>
                  ))}
                </ol>
              </Panel>
              {b.status === 'COMPLETED' &&
                user.role === 'FARMER' &&
                !b.reviews.some((r) => r.reviewerId === user.id) && (
                  <Panel title="Share your experience">
                    <Form
                      label="Publish review"
                      onSubmit={async (v) => {
                        await api(`/bookings/${id}/reviews`, {
                          method: 'POST',
                          body: {
                            ...v,
                            rating: Number(v.rating),
                            condition: Number(v.condition),
                            reliability: Number(v.reliability),
                            handling: Number(v.handling),
                          },
                        });
                        refresh();
                      }}
                    >
                      {[
                        ['rating', 'Overall rating'],
                        ['condition', 'Machine condition'],
                        ['reliability', 'Owner reliability'],
                        ['handling', 'Delivery handling'],
                      ].map(([key, label]) => (
                        <Field key={key} label={label}>
                          <select name={key}>
                            {[5, 4, 3, 2, 1].map((n) => (
                              <option key={n} value={n}>
                                {n}/5
                              </option>
                            ))}
                          </select>
                        </Field>
                      ))}
                      <Field label="Your review" name="comment" required maxLength="1500" />
                    </Form>
                  </Panel>
                )}
              <Panel title="Report an issue">
                <Form
                  label="Create support ticket"
                  onSubmit={async (v, f) => {
                    await api('/tickets', { method: 'POST', body: { ...v, bookingId: id } });
                    setMessage('Support ticket created');
                    f.reset();
                  }}
                >
                  <Field label="Issue category">
                    <select name="category">
                      {['HELP', 'DAMAGE', 'BREAKDOWN', 'PAYMENT', 'EMERGENCY'].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Describe what happened" name="message" required maxLength="3000" />
                  <p className="muted">
                    For immediate danger, contact local emergency services. This form is not a live emergency
                    dispatch service.
                  </p>
                </Form>
              </Panel>
            </section>
            <aside className="stack">
              {user.role !== 'DRIVER' && (
                <Panel title="Agreed quotation">
                  <Quote quote={b.quote} />
                  <p className="muted">
                    Agreement {b.agreementVersion} · Accepted{' '}
                    {b.agreementAcceptedAt ? when(b.agreementAcceptedAt) : 'not recorded'}
                  </p>
                  <Action
                    secondary
                    run={async () => {
                      const r = await api(`/bookings/${id}/receipt`);
                      download(
                        `FarmIQ-${id}.txt`,
                        `FarmIQ PAYMENT RECEIPT\n${r.receiptNumber}\n${r.machine}\n${r.farmer}\n${JSON.stringify(r.quote, null, 2)}\n${JSON.stringify(r.transactions, null, 2)}\n${r.note}`,
                      );
                    }}
                  >
                    Download receipt
                  </Action>
                </Panel>
              )}
              {user.role !== 'DRIVER' && (
                <Panel title="Payment records">
                  {b.transactions.length ? (
                    b.transactions.map((t) => (
                      <div className="list-row" key={t.id}>
                        <span>
                          {t.kind} · {t.provider}
                        </span>
                        <strong>{money(t.amount)}</strong>
                        <Badge>{t.status}</Badge>
                      </div>
                    ))
                  ) : (
                    <p>No payments yet.</p>
                  )}
                </Panel>
              )}
              <Panel title="Inspection evidence">
                {b.inspections.length ? (
                  b.inspections.map((i) => (
                    <div key={i.id}>
                      <h3>{i.stage}</h3>
                      <p>{i.notes}</p>
                      <p className="muted">{when(i.createdAt)}</p>
                      <div className="row wrap">
                        {i.media.map((d, j) => (
                          <Action key={d} secondary run={() => openDocument(d)}>
                            Photo {j + 1}
                          </Action>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No inspections yet.</p>
                )}
              </Panel>
              {user.role === 'FARMER' &&
                ['REQUESTED', 'PENDING_PAYMENT', 'PAID', 'ASSIGNED'].includes(b.status) && (
                  <Panel title="Change your plans">
                    {['REQUESTED', 'PENDING_PAYMENT'].includes(b.status) && (
                      <Form
                        label="Request new schedule"
                        onSubmit={async (v) => {
                          await api(`/bookings/${id}/reschedule`, {
                            method: 'POST',
                            body: { scheduledAt: new Date(v.date).toISOString() },
                          });
                          refresh();
                        }}
                      >
                        <Field label="New start time" name="date" type="datetime-local" required />
                      </Form>
                    )}
                    <Action secondary run={() => api(`/bookings/${id}/cancellation`)} done={setCancelQuote}>
                      Review cancellation cost
                    </Action>
                    {cancelQuote && (
                      <div className="notice">
                        <p>
                          Fee: {money(cancelQuote.fee)} · Refund: {money(cancelQuote.refund)}
                        </p>
                        <Action run={() => change('CANCELLED')} done={refresh}>
                          Confirm cancellation
                        </Action>
                      </div>
                    )}
                  </Panel>
                )}
            </aside>
          </div>
        </>
      )}
    </State>
  );
}
function Inspection({ booking: b, refresh }) {
  const stage = { PICKUP_INSPECTION: 'PICKUP', DELIVERED: 'DELIVERY', RETURN_INSPECTION: 'RETURN' }[b.status];
  if (b.inspections.some((i) => i.stage === stage))
    return <p className="notice">{stage} inspection is recorded.</p>;
  return (
    <Panel title={`${stage} inspection`}>
      <Form
        label="Save inspection evidence"
        onSubmit={async (v, f) => {
          const docs = [];
          for (const file of f.elements.photos.files) docs.push((await upload(file, 'INSPECTION')).id);
          await api(`/bookings/${b.id}/inspections`, {
            method: 'POST',
            body: {
              stage,
              notes: v.notes,
              checklist: { condition: !!v.condition, safety: !!v.safety, accessories: !!v.accessories },
              media: docs,
            },
          });
          refresh();
        }}
      >
        {['condition', 'safety', 'accessories'].map((k) => (
          <label key={k} className="check">
            <input type="checkbox" name={k} required />I checked the equipment’s {k}.
          </label>
        ))}
        <Field label="Condition notes" name="notes" required />
        <Field
          label="Photographs (up to 5, 5 MB each)"
          name="photos"
          type="file"
          accept="image/jpeg,image/png"
          multiple
          required
        />
      </Form>
    </Panel>
  );
}
