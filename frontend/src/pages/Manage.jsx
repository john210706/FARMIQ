import React, { useState } from 'react';
import Operations, { Finance } from './Operations';
import { api, money, when, openDocument } from '../lib/api';
import { useData, State, Panel, Field, Button, Action, Form, Badge, Empty } from '../ui';
export default function Fleet() {
  const [version, setVersion] = useState(0),
    [edit, setEdit] = useState(null),
    [adding, setAdding] = useState(false);
  const { data, error } = useData('/owner/machinery', version);
  const refresh = () => setVersion((v) => v + 1);
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">YOUR EQUIPMENT, WORKING HARDER</span>
        <h1>Fleet & availability</h1>
        <p>Add listings, manage maintenance and protect your calendar.</p>
      </div>
      <Finance />
      <Button
        onClick={() => {
          setAdding(!adding);
          setEdit(null);
        }}
      >
        Add machinery
      </Button>
      {(adding || edit) && (
        <Panel title={edit ? 'Edit machinery' : 'New machinery'}>
          <Form
            key={edit?.id || 'new'}
            label="Save for verification"
            onSubmit={async (v) => {
              const body = {
                ...v,
                pricePerHour: Number(v.pricePerHour),
                pricePerDay: v.pricePerDay ? Number(v.pricePerDay) : null,
                horsepower: Number(v.horsepower),
                latitude: Number(v.latitude),
                longitude: Number(v.longitude),
                deliveryRadiusKm: Number(v.deliveryRadiusKm),
                deposit: 0,
                fuelLitresPerHour: Number(v.fuelLitresPerHour),
                acresPerHour: Number(v.acresPerHour),
                operatorAvailable: v.operatorAvailable === 'on',
                media: v.media
                  ? v.media
                      .split('\n')
                      .map((s) => s.trim())
                      .filter(Boolean)
                  : [],
              };
              await api('/owner/machinery' + (edit ? `/${edit.id}` : ''), {
                method: edit ? 'PATCH' : 'POST',
                body,
              });
              setAdding(false);
              setEdit(null);
              refresh();
            }}
          >
            <div className="two">
              {[
                ['name', 'Machine name'],
                ['brand', 'Brand'],
                ['location', 'Pickup address'],
                ['fuelType', 'Fuel type'],
                ['imageUrl', 'Main photo HTTPS URL'],
              ].map(([name, label]) => (
                <Field key={name} label={label} name={name} defaultValue={edit?.[name] || ''} required />
              ))}
              <Field label="Category">
                <select name="category" defaultValue={edit?.category || 'TRACTOR'}>
                  {['TRACTOR', 'HARVESTER', 'TILLAGE', 'SPRAYER', 'TRANSPLANTER', 'THRESHER', 'BALER'].map(
                    (c) => (
                      <option key={c}>{c}</option>
                    ),
                  )}
                </select>
              </Field>
              {[
                ['pricePerHour', 'Hourly price', 1000],
                ['pricePerDay', '8-hour price', 7000],
                ['horsepower', 'Horsepower', 45],
                ['latitude', 'Pickup latitude', 10.79],
                ['longitude', 'Pickup longitude', 79.13],
                ['deliveryRadiusKm', 'Delivery radius (km)', 30],
                ['fuelLitresPerHour', 'Estimated litres/hour', 4],
                ['acresPerHour', 'Estimated acres/hour', 1],
              ].map(([name, label, value]) => (
                <Field
                  key={name}
                  label={label}
                  name={name}
                  type="number"
                  step="any"
                  defaultValue={edit?.[name] ?? value}
                  required
                />
              ))}
            </div>
            <Field label="Description">
              <textarea name="description" defaultValue={edit?.description || ''} required />
            </Field>
            <Field label="Additional photo URLs (one HTTPS URL per line)">
              <textarea name="media" defaultValue={(edit?.media || []).join('\n')} />
            </Field>
            <label className="check">
              <input type="checkbox" name="operatorAvailable" defaultChecked={edit?.operatorAvailable} />
              Allows a certified operator
            </label>
          </Form>
        </Panel>
      )}
      <State data={data} error={error}>
        {data?.length ? (
          <div className="stack">
            {data.map((m) => (
              <Panel
                key={m.id}
                title={m.name}
                actions={
                  <Button
                    secondary
                    onClick={() => {
                      setEdit(m);
                      setAdding(false);
                    }}
                  >
                    Edit
                  </Button>
                }
              >
                <div className="row">
                  <Badge>{m.verificationStatus}</Badge>
                  <Badge>{m.status}</Badge>
                  <strong>{money(m.pricePerHour)}/h</strong>
                </div>
                <div className="row wrap">
                  {['AVAILABLE', 'MAINTENANCE', 'INACTIVE'].map((status) => (
                    <Action
                      key={status}
                      secondary
                      disabled={m.status === status}
                      run={() => api(`/owner/machinery/${m.id}`, { method: 'PATCH', body: { status } })}
                      done={refresh}
                    >
                      {status.replaceAll('_', ' ')}
                    </Action>
                  ))}
                </div>
                <p className="muted">Changes are submitted for administrator review.</p>
                <div className="two">
                  <div>
                    <h3>Block a time slot</h3>
                    <Form
                      label="Block availability"
                      onSubmit={async (v) => {
                        await api(`/owner/machinery/${m.id}/availability`, {
                          method: 'POST',
                          body: {
                            startsAt: new Date(v.startsAt).toISOString(),
                            endsAt: new Date(v.endsAt).toISOString(),
                            reason: v.reason,
                          },
                        });
                        refresh();
                      }}
                    >
                      <Field label="From" name="startsAt" type="datetime-local" required />
                      <Field label="Until" name="endsAt" type="datetime-local" required />
                      <Field label="Reason" name="reason" required />
                    </Form>
                    {m.availability.map((a) => (
                      <div className="list-row" key={a.id}>
                        <span>
                          {when(a.startsAt)} — {when(a.endsAt)} · {a.reason}
                        </span>
                        <Action
                          secondary
                          run={() =>
                            api(`/owner/machinery/${m.id}/availability/${a.id}`, { method: 'DELETE' })
                          }
                          done={refresh}
                        >
                          Unblock
                        </Action>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h3>Record servicing</h3>
                    <Form
                      label="Save service record"
                      onSubmit={async (v, f) => {
                        await api(`/owner/machinery/${m.id}/service`, {
                          method: 'POST',
                          body: {
                            notes: v.notes,
                            performedAt: new Date(v.performedAt).toISOString(),
                            ...(v.nextServiceAt
                              ? { nextServiceAt: new Date(v.nextServiceAt).toISOString() }
                              : {}),
                          },
                        });
                        f.reset();
                        refresh();
                      }}
                    >
                      <Field label="Performed on" name="performedAt" type="datetime-local" required />
                      <Field label="Work performed" name="notes" required />
                      <Field label="Next service" name="nextServiceAt" type="datetime-local" />
                      {m.serviceRecords.map((s) => (
                        <p key={s.id}>
                          {when(s.performedAt)} · {s.notes}
                        </p>
                      ))}
                    </Form>
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        ) : (
          <Empty>Add your first machine to start receiving requests.</Empty>
        )}
      </State>
    </>
  );
}
export function Admin() {
  const [tab, setTab] = useState('users'),
    [version, setVersion] = useState(0),
    [notice, setNotice] = useState('');
  const refresh = () => setVersion((v) => v + 1);
  const paths = {
    users: '/admin/users',
    machinery: '/owner/machinery',
    documents: '/documents',
    tickets: '/tickets',
    audit: '/admin/audit',
    reviews: '/admin/reviews',
    tutorials: '/admin/tutorials',
    operations: '/bookings',
  };
  const { data, error } = useData(paths[tab], version);
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">PLATFORM OPERATIONS</span>
        <h1>Review, resolve, improve.</h1>
        <p>Every approval and sensitive action is recorded.</p>
      </div>
      <div className="tabs">
        <Button secondary={tab !== 'dispatch'} onClick={() => setTab('dispatch')}>
          Dispatch & finance
        </Button>
        {Object.keys(paths).map((t) => (
          <Button key={t} secondary={tab !== t} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </Button>
        ))}
      </div>
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      {tab === 'dispatch' && <Operations />}
      {tab !== 'dispatch' && (
        <State data={data} error={error}>
          <div className="stack">
            {data?.length === 0 && <Empty>Nothing to review.</Empty>}
            {data?.map((item) => (
              <Panel
                key={item.id}
                title={
                  item.fullName ||
                  item.name ||
                  item.filename ||
                  item.title ||
                  item.category ||
                  item.action ||
                  item.machinery?.name ||
                  'Review'
                }
              >
                <div className="row wrap">
                  {tab === 'users' && (
                    <>
                      <p>
                        {item.accountId} · {item.role}
                      </p>
                      <Badge>{item.verificationStatus}</Badge>
                      {['VERIFIED', 'REJECTED'].map((s) => (
                        <Action
                          key={s}
                          secondary
                          run={() =>
                            api(`/admin/users/${item.id}`, {
                              method: 'PATCH',
                              body: { verificationStatus: s },
                            })
                          }
                          done={refresh}
                        >
                          {s === 'VERIFIED' ? 'Verify' : 'Reject'}
                        </Action>
                      ))}
                      <Action
                        secondary
                        run={() =>
                          api(`/admin/users/${item.id}`, { method: 'PATCH', body: { active: !item.active } })
                        }
                        done={refresh}
                      >
                        {item.active ? 'Suspend' : 'Reactivate'}
                      </Action>
                    </>
                  )}
                  {tab === 'machinery' && (
                    <>
                      <Badge>{item.verificationStatus}</Badge>
                      <p>{item.description}</p>
                      {['VERIFIED', 'REJECTED'].map((s) => (
                        <Action
                          key={s}
                          run={() =>
                            api(`/admin/machinery/${item.id}`, {
                              method: 'PATCH',
                              body: { verificationStatus: s },
                            })
                          }
                          done={refresh}
                        >
                          {s === 'VERIFIED' ? 'Approve listing' : 'Reject listing'}
                        </Action>
                      ))}
                    </>
                  )}
                  {tab === 'documents' && (
                    <>
                      <Badge>{item.kind}</Badge>
                      <Badge>{item.status}</Badge>
                      <Action secondary run={() => openDocument(item.id)}>
                        Download to review
                      </Action>
                      {['VERIFIED', 'REJECTED'].map((status) => (
                        <Action
                          key={status}
                          run={() =>
                            api(`/admin/documents/${item.id}`, { method: 'PATCH', body: { status } })
                          }
                          done={refresh}
                        >
                          {status}
                        </Action>
                      ))}
                    </>
                  )}
                  {tab === 'tickets' && (
                    <>
                      <Badge>{item.status}</Badge>
                      <p>{item.message}</p>
                      <Form
                        label="Save resolution"
                        onSubmit={async (v) => {
                          await api(`/admin/tickets/${item.id}`, { method: 'PATCH', body: v });
                          refresh();
                        }}
                      >
                        <Field label="Status">
                          <select name="status" defaultValue={item.status}>
                            <option>IN_REVIEW</option>
                            <option>RESOLVED</option>
                            <option>OPEN</option>
                          </select>
                        </Field>
                        <Field
                          label="Resolution / response"
                          name="resolution"
                          defaultValue={item.resolution || ''}
                          required
                        />
                      </Form>
                    </>
                  )}
                  {tab === 'audit' && (
                    <>
                      <p>
                        {when(item.createdAt)} · {item.targetId}
                      </p>
                      <p>{JSON.stringify(item.detail)}</p>
                    </>
                  )}
                  {tab === 'reviews' && (
                    <>
                      <p>
                        {item.rating}/5 · {item.comment}
                      </p>
                      <Action
                        secondary
                        run={() =>
                          api(`/admin/reviews/${item.id}`, {
                            method: 'PATCH',
                            body: { hidden: !item.hidden },
                          })
                        }
                        done={refresh}
                      >
                        {item.hidden ? 'Publish' : 'Hide review'}
                      </Action>
                    </>
                  )}
                  {tab === 'tutorials' && (
                    <>
                      <Badge>{item.language}</Badge>
                      <p>{item.summary}</p>
                      <Action
                        secondary
                        run={() =>
                          api(`/admin/tutorials/${item.id}`, {
                            method: 'PATCH',
                            body: { published: !item.published },
                          })
                        }
                        done={refresh}
                      >
                        {item.published ? 'Unpublish' : 'Publish'}
                      </Action>
                    </>
                  )}
                  {tab === 'operations' && (
                    <>
                      <Badge>{item.status}</Badge>
                      <p>
                        {when(item.scheduledAt)} · {item.farmer.fullName}
                      </p>
                      {['PAID', 'ASSIGNED'].includes(item.status) && (
                        <Form
                          label="Assign driver"
                          onSubmit={async (v) => {
                            await api(`/admin/bookings/${item.id}/assign`, { method: 'POST', body: v });
                            refresh();
                          }}
                        >
                          <Field label="Verified on-duty driver ID" name="driverId" required />
                          <Field label="Reason" name="note" required />
                        </Form>
                      )}
                      {[
                        'PAID',
                        'ASSIGNED',
                        'PICKUP_INSPECTION',
                        'IN_TRANSIT',
                        'DELIVERED',
                        'IN_PROGRESS',
                      ].includes(item.status) && (
                        <Form
                          label="Dispatch replacement"
                          onSubmit={async (v) => {
                            await api(`/admin/bookings/${item.id}/replace`, { method: 'POST', body: v });
                            refresh();
                          }}
                        >
                          <Field label="Same-owner replacement machine ID" name="machineryId" required />
                          <Field label="Breakdown / replacement reason" name="note" required />
                        </Form>
                      )}
                    </>
                  )}
                </div>
              </Panel>
            ))}
          </div>
        </State>
      )}
      <div className="two">
        <Panel title="Commission settings">
          <Form
            label="Save commission"
            onSubmit={async (v) => {
              await api('/admin/settings', {
                method: 'PUT',
                body: { commission: Number(v.commission) / 100 },
              });
              setNotice('Commission updated for future quotations');
            }}
          >
            <Field
              label="Platform commission (%)"
              name="commission"
              type="number"
              min="0"
              max="30"
              defaultValue="12"
              required
            />
          </Form>
        </Panel>
        <Panel title="Add a verified operator">
          <Form
            label="Save operator"
            onSubmit={async (v, f) => {
              await api('/admin/operators', {
                method: 'POST',
                body: {
                  ...v,
                  skills: v.skills.split(',').map((s) => s.trim().toUpperCase()),
                  hourlyRate: Number(v.hourlyRate),
                },
              });
              setNotice('Operator saved');
              f.reset();
            }}
          >
            {[
              ['name', 'Name'],
              ['phone', 'Phone'],
              ['skills', 'Qualified categories, comma-separated'],
              ['certification', 'Certification reference'],
            ].map(([name, label]) => (
              <Field key={name} label={label} name={name} required />
            ))}
            <Field label="Hourly rate" name="hourlyRate" type="number" min="1" required />
            <Field label="Verification">
              <select name="verificationStatus">
                <option>PENDING</option>
                <option>VERIFIED</option>
              </select>
            </Field>
          </Form>
        </Panel>
      </div>
      {tab === 'tutorials' && (
        <Panel title="Publish reviewed learning content">
          <Form
            label="Create tutorial"
            onSubmit={async (v, f) => {
              await api('/admin/tutorials', {
                method: 'POST',
                body: {
                  ...v,
                  steps: v.steps.split('\n').filter(Boolean),
                  published: v.published === 'on',
                  videoUrl: v.videoUrl || null,
                  audioUrl: v.audioUrl || null,
                  captionsUrl: v.captionsUrl || null,
                },
              });
              f.reset();
              refresh();
            }}
          >
            {[
              ['title', 'Title'],
              ['category', 'Category'],
              ['summary', 'Summary'],
              ['sourceUrl', 'Manufacturer / reviewed source HTTPS URL'],
              ['videoUrl', 'Video HTTPS URL (optional)'],
              ['audioUrl', 'Audio HTTPS URL (optional)'],
              ['captionsUrl', 'WebVTT captions HTTPS URL (required with video)'],
            ].map(([name, label]) => (
              <Field
                key={name}
                label={label}
                name={name}
                required={['title', 'category', 'summary', 'sourceUrl'].includes(name)}
              />
            ))}
            <Field label="Language">
              <select name="language">
                <option value="en">English</option>
                <option value="ta">Tamil</option>
                <option value="hi">Hindi</option>
              </select>
            </Field>
            <Field label="Reviewed steps, one per line">
              <textarea name="steps" required />
            </Field>
            <label className="check">
              <input type="checkbox" name="published" />
              Publish now
            </label>
          </Form>
        </Panel>
      )}
      <Panel title="Assisted farmer booking">
        <p>
          Record consent before submitting a request on a farmer’s behalf. This uses the same pricing and
          availability checks.
        </p>
        <Form
          label="Create assisted request"
          onSubmit={async (v, f) => {
            await api('/bookings', {
              method: 'POST',
              body: {
                farmerId: v.farmerId,
                machineryId: v.machineryId,
                scheduledAt: new Date(v.scheduledAt).toISOString(),
                durationHours: Number(v.durationHours),
                farmAddress: v.farmAddress,
                farmLat: Number(v.farmLat),
                farmLng: Number(v.farmLng),
                agreementAccepted: v.consent === 'on',
                assistedConsent: v.consent === 'on',
                requestKey: crypto.randomUUID(),
              },
            });
            setNotice('Assisted request created');
            f.reset();
            refresh();
          }}
        >
          <div className="two">
            {[
              ['farmerId', 'Farmer ID'],
              ['machineryId', 'Machine ID'],
              ['farmAddress', 'Farm address'],
            ].map(([name, label]) => (
              <Field key={name} label={label} name={name} required />
            ))}
            <Field label="Start" name="scheduledAt" type="datetime-local" required />
            {[
              ['durationHours', 'Hours'],
              ['farmLat', 'Latitude'],
              ['farmLng', 'Longitude'],
            ].map(([name, label]) => (
              <Field key={name} label={label} name={name} type="number" step="any" required />
            ))}
          </div>
          <label className="check">
            <input type="checkbox" name="consent" required />
            The farmer has explicitly consented to the request and rental agreement.
          </label>
        </Form>
      </Panel>
    </>
  );
}
