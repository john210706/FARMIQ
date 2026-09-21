import React, { useState, useEffect, lazy, Suspense } from 'react';
import { api, money, when, getSession } from '../lib/api';
import { useData, State, Field, Button, Panel, Badge, Empty, Action, Form } from '../ui';
const Map = lazy(() => import('./Map'));
export default function Catalog({ navigate, language, lowData }) {
  const [query, setQuery] = useState(''),
    [category, setCategory] = useState(''),
    [coords, setCoords] = useState(null),
    [geoError, setGeoError] = useState(''),
    [map, setMap] = useState(false),
    [compare, setCompare] = useState([]),
    [sort, setSort] = useState('distance'),
    [date, setDate] = useState(''),
    [hours, setHours] = useState(6);
  const path =
    '/machinery/nearby?' +
    new URLSearchParams({
      search: query,
      ...(category ? { category } : {}),
      ...(coords ? { lat: coords.latitude, lng: coords.longitude } : {}),
      ...(date ? { startsAt: new Date(date).toISOString(), hours } : {}),
    });
  const { data, error } = useData(path);
  const machines = data
    ? [...data].sort((a, b) =>
        sort === 'price'
          ? Number(a.pricePerHour) - Number(b.pricePerHour)
          : (a.distance ?? Infinity) - (b.distance ?? Infinity),
      )
    : [];
  const names = {
    en: ['Find your next machine', 'Local machinery. A clear price. A plan for your field.'],
    ta: ['உங்கள் இயந்திரத்தைத் தேடுங்கள்', 'அருகிலுள்ள இயந்திரங்கள் மற்றும் தெளிவான விலை.'],
    hi: ['अपनी अगली मशीन खोजें', 'पास की मशीनें और स्पष्ट कीमतें।'],
  }[language];
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">THE EQUIPMENT MARKETPLACE</span>
        <h1>{names[0]}</h1>
        <p>{names[1]}</p>
      </div>
      <div className="toolbar">
        <Field
          label="Search equipment"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tractors, harvesters, brands…"
        />
        <Field label="Category">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All equipment</option>
            {['TRACTOR', 'HARVESTER', 'TILLAGE', 'SPRAYER', 'TRANSPLANTER', 'THRESHER', 'BALER'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field
          label="Rental starts"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Field
          label="Hours"
          type="number"
          min="1"
          max="48"
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
        />
        <Field label="Sort">
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="distance">Nearest</option>
            <option value="price">Lowest hourly price</option>
          </select>
        </Field>
      </div>
      <div className="row spread">
        <p className="muted">
          {data?.length ?? '…'} available listings {coords ? 'within 30 km' : ''}
        </p>
        <div className="row">
          <Button
            secondary
            onClick={() => {
              if (!navigator.geolocation) {
                setGeoError('Location is not available');
                return;
              }
              navigator.geolocation.getCurrentPosition(
                (p) => {
                  setCoords(p.coords);
                  setGeoError('');
                },
                () => setGeoError('Location permission denied. You can still browse all listings.'),
              );
            }}
          >
            Use my location
          </Button>
          <Button secondary onClick={() => setMap(!map)}>
            {map ? 'Hide map' : 'Show map'}
          </Button>
        </div>
      </div>
      {geoError && (
        <p role="status" className="notice">
          {geoError}
        </p>
      )}
      {compare.length > 0 && (
        <Panel title={`Compare equipment (${compare.length}/3)`}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Machine</th>
                  <th>Power</th>
                  <th>Hourly</th>
                  <th>Daily</th>
                  <th>Operator option</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {compare.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.horsepower ?? '—'} HP</td>
                    <td>{money(m.pricePerHour)}</td>
                    <td>{m.pricePerDay ? money(m.pricePerDay) : '—'}</td>
                    <td>{m.operatorAvailable ? 'Yes' : 'No'}</td>
                    <td>
                      <Button secondary onClick={() => setCompare(compare.filter((c) => c.id !== m.id))}>
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
      <State data={data} error={error}>
        {map && (
          <Suspense fallback={<p>Loading map…</p>}>
            <Map machines={machines} />
          </Suspense>
        )}
        {!machines.length ? (
          <Empty>No equipment matches. Try another date, category or location.</Empty>
        ) : (
          <div className="machine-grid">
            {machines.map((m) => (
              <article className="machine-card" key={m.id}>
                {!lowData && <img src={m.imageUrl} alt={m.name} loading="lazy" width="500" height="300" />}
                <div className="machine-body">
                  <div className="row spread">
                    <Badge>{m.category}</Badge>
                    <span className="verified">✓ Verified</span>
                  </div>
                  <h2>{m.name}</h2>
                  <p className="muted">
                    {m.location}
                    {m.distance != null ? ` · ${m.distance.toFixed(1)} km` : ''}
                  </p>
                  <p>
                    {m.horsepower ? `${m.horsepower} HP · ` : ''}
                    {m.fuelType}
                  </p>
                  <p className="price">
                    {money(m.pricePerHour)} <small>/ hour</small>
                  </p>
                  <div className="row">
                    <Button onClick={() => navigate('machine', m.id)}>View & request</Button>
                    <Button
                      secondary
                      disabled={compare.length >= 3 || compare.some((c) => c.id === m.id)}
                      onClick={() => setCompare([...compare, m])}
                    >
                      Compare
                    </Button>
                    {getSession() && (
                      <Action secondary run={() => api(`/favourites/${m.id}`, { method: 'PUT' })}>
                        Save
                      </Action>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </State>
    </>
  );
}
export function MachineDetail({ id, navigate }) {
  const { data: m, error } = useData(`/machinery/${id}`);
  const { data: operators } = useData('/operators');
  const { data: addresses } = useData(getSession() ? '/addresses' : null);
  const key = `farmiq-draft-${getSession()?.user.id || 'guest'}-${id}`;
  const [draft, setDraft] = useState(() => {
      try {
        return JSON.parse(localStorage.getItem(key)) || {};
      } catch {
        return {};
      }
    }),
    [pricing, setPricing] = useState(null),
    [saved, setSaved] = useState(false);
  const update = (name, value) => setDraft((prev) => ({ ...prev, [name]: value }));
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(draft));
  }, [draft, key]);
  useEffect(() => {
    setPricing(null);
  }, [draft.durationHours, draft.operatorId]);
  return (
    <State data={m} error={error}>
      {m && (
        <>
          <Button secondary onClick={() => navigate('catalog')}>
            ← All equipment
          </Button>
          <div className="detail-grid">
            <section>
              <img className="detail-photo" src={m.imageUrl} alt={m.name} />
              <div className="gallery">
                {(m.media || []).map((u) => (
                  <img key={u} src={u} alt={`${m.name} additional view`} loading="lazy" />
                ))}
              </div>
              <h1>{m.name}</h1>
              <p>{m.description}</p>
              <p className="muted">
                {m.owner.fullName} · {m.location} · Delivery up to {m.deliveryRadiusKm} km
              </p>
              <div className="row">
                <Badge>{m.horsepower || '—'} HP</Badge>
                <Badge>{m.fuelType || 'Equipment'}</Badge>
                <Badge>Verified listing</Badge>
              </div>
              <Panel title="Availability">
                <p>Time slots are checked again when you submit.</p>
                {!m.reserved.length && !m.availability.length ? (
                  <p className="muted">No reserved or blocked periods.</p>
                ) : (
                  <ul>
                    {m.reserved.map((r, i) => (
                      <li key={i}>
                        {when(r.scheduledAt)} → {when(r.endsAt)}
                      </li>
                    ))}
                    {m.availability.map((r) => (
                      <li key={r.id}>
                        {when(r.startsAt)} → {when(r.endsAt)} · Unavailable
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
              <Panel title="Community reviews">
                {m.reviews?.length ? (
                  m.reviews.map((r) => (
                    <div className="list-row" key={r.id}>
                      <Badge>{r.rating}/5</Badge>
                      <p>{r.comment}</p>
                    </div>
                  ))
                ) : (
                  <Empty>No completed-rental reviews yet.</Empty>
                )}
              </Panel>
              <Panel title="Maintenance history">
                {m.serviceRecords.length ? (
                  m.serviceRecords.map((s) => (
                    <p key={s.id}>
                      {when(s.performedAt)} — {s.notes}
                    </p>
                  ))
                ) : (
                  <p>No maintenance records published.</p>
                )}
              </Panel>
            </section>
            <Panel title="Plan your rental">
              <p className="price">
                {money(m.pricePerHour)} <small>/ hour</small>
              </p>
              <p>{m.pricePerDay ? `${money(m.pricePerDay)} / 8-hour day` : ''}</p>
              {!getSession() ? (
                <Button onClick={() => navigate('account')}>Sign in to request</Button>
              ) : getSession().user.role !== 'FARMER' ? (
                <p>Sign in with a farmer account to request this machine.</p>
              ) : (
                <Form
                  label="Send request to owner"
                  onSubmit={async (_, form) => {
                    if (!navigator.onLine) {
                      setSaved(true);
                      return;
                    }
                    const input = {
                      machineryId: id,
                      scheduledAt: new Date(draft.scheduledAt).toISOString(),
                      durationHours: Number(draft.durationHours || 6),
                      farmAddress: draft.farmAddress || '',
                      farmLat: Number(draft.farmLat),
                      farmLng: Number(draft.farmLng),
                      ...(draft.operatorId ? { operatorId: draft.operatorId } : {}),
                      agreementAccepted: form.elements.agreement.checked,
                      requestKey: draft.requestKey || crypto.randomUUID(),
                    };
                    update('requestKey', input.requestKey);
                    const b = await api('/bookings', { method: 'POST', body: input });
                    localStorage.removeItem(key);
                    navigate('booking', b.id);
                  }}
                >
                  <Field
                    label="Date and start time"
                    type="datetime-local"
                    required
                    value={draft.scheduledAt || ''}
                    onChange={(e) => update('scheduledAt', e.target.value)}
                  />
                  <Field
                    label="Rental hours"
                    type="number"
                    min="1"
                    max="48"
                    required
                    value={draft.durationHours || 6}
                    onChange={(e) => update('durationHours', e.target.value)}
                  />
                  {addresses?.length > 0 && (
                    <Field label="Saved farm">
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          const a = addresses.find((a) => a.id === e.target.value);
                          if (a)
                            setDraft((d) => ({
                              ...d,
                              farmAddress: a.address,
                              farmLat: a.latitude,
                              farmLng: a.longitude,
                            }));
                        }}
                      >
                        <option value="">Choose an address</option>
                        {addresses.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}
                  <Field
                    label="Farm address"
                    required
                    value={draft.farmAddress || ''}
                    onChange={(e) => update('farmAddress', e.target.value)}
                  />
                  <div className="two">
                    <Field
                      label="Latitude"
                      type="number"
                      step="any"
                      min="-90"
                      max="90"
                      required
                      value={draft.farmLat ?? ''}
                      onChange={(e) => update('farmLat', e.target.value)}
                    />
                    <Field
                      label="Longitude"
                      type="number"
                      step="any"
                      min="-180"
                      max="180"
                      required
                      value={draft.farmLng ?? ''}
                      onChange={(e) => update('farmLng', e.target.value)}
                    />
                  </div>
                  <Field label="Verified operator">
                    <select
                      value={draft.operatorId || ''}
                      onChange={(e) => update('operatorId', e.target.value)}
                    >
                      <option value="">No operator</option>
                      {m.operatorAvailable &&
                        operators
                          ?.filter((o) => o.skills.includes(m.category))
                          .map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.name} · {money(o.hourlyRate)}/h
                            </option>
                          ))}
                    </select>
                  </Field>
                  <Action
                    secondary
                    run={() =>
                      api('/bookings/quote', {
                        method: 'POST',
                        body: {
                          machineryId: id,
                          durationHours: Number(draft.durationHours || 6),
                          ...(draft.operatorId ? { operatorId: draft.operatorId } : {}),
                        },
                      })
                    }
                    done={setPricing}
                  >
                    Calculate exact quote
                  </Action>
                  {pricing && <Quote quote={pricing} />}
                  <p className="notice">
                    Owner approval comes first. The accepted slot is held for 30 minutes for the 50% advance.
                    Sandbox payments do not transfer money.
                  </p>
                  <label className="check">
                    <input name="agreement" type="checkbox" required />I accept the rental agreement: inspect
                    equipment at handover, return it on time, and report damage. Farmer cancellation within 24
                    hours may cost 10% of the rental total, capped at payments made.
                  </label>
                  <p className="muted">
                    Draft saved on this device. Offline requests remain drafts until you reconnect and submit.
                  </p>
                  {saved && (
                    <p role="status" className="notice">
                      You are offline. Draft saved; reconnect to submit.
                    </p>
                  )}
                </Form>
              )}
            </Panel>
          </div>
        </>
      )}
    </State>
  );
}
export function Quote({ quote: q }) {
  return (
    <dl className="quote">
      {[
        ['Machine rental', q.rental],
        ['Operator', q.operator],
        ['Delivery and return', q.delivery],
        ['Total', q.total],
        ['50% advance', q.advance],
        ['Balance after inspection', q.balance],
      ].map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{money(value)}</dd>
        </div>
      ))}
    </dl>
  );
}
