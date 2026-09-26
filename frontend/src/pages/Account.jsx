import React, { useState } from 'react';
import { api, upload, openDocument, money, when } from '../lib/api';
import { useData, State, Panel, Field, Action, Form, Badge, Button } from '../ui';
import { currentLocation, LocationPicker } from '../location';
export default function Account({ user, onUser, onLogout, navigate }) {
  const [v, setV] = useState(0),
    [notice, setNotice] = useState(''),
    [addressText, setAddressText] = useState(''),
    [addressLocation, setAddressLocation] = useState(null);
  const refresh = () => setV((v) => v + 1);
  const isDriver = user.role === 'DRIVER';
  const { data: addresses } = useData(isDriver ? null : '/addresses', v);
  const { data: documents } = useData('/documents', v);
  const { data: favourites } = useData(isDriver ? null : '/favourites', v);
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">YOUR FARMIQ ACCOUNT</span>
        <h1>{user.fullName}</h1>
        <p>
          {user.accountId} · {user.role} · {user.phone}
        </p>
        <Badge>{user.verificationStatus}</Badge>
      </div>
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      <div className="two">
        <Panel title="Profile & preferences">
          <Form
            onSubmit={async (v) => {
              const onDuty = isDriver && v.onDuty === 'on';
              const driverLocation = onDuty ? await currentLocation() : null;
              onUser(
                await api('/auth/me', {
                  method: 'PATCH',
                  body: {
                    fullName: v.fullName,
                    language: v.language,
                    preferences: {
                      sms: v.sms === 'on',
                      ...(!isDriver ? { lowData: v.lowData === 'on' } : {}),
                    },
                    ...(isDriver ? { onDuty } : {}),
                  },
                }),
              );
              if (driverLocation) await api('/drivers/location', { method: 'PATCH', body: driverLocation });
              setNotice(onDuty ? 'Profile saved and current driver location shared' : 'Profile saved');
            }}
          >
            <Field label="Full name" name="fullName" defaultValue={user.fullName} required />
            <Field label="Language">
              <select name="language" defaultValue={user.language}>
                <option value="en">English</option>
                <option value="ta">தமிழ்</option>
                <option value="hi">हिन्दी</option>
              </select>
            </Field>
            {!isDriver && (
              <label className="check">
                <input name="lowData" type="checkbox" defaultChecked={user.preferences?.lowData} />
                Low-data mode (hide catalogue photos)
              </label>
            )}
            <label className="check">
              <input name="sms" type="checkbox" defaultChecked={user.preferences?.sms} />
              SMS notifications when configured
            </label>
            {user.role === 'DRIVER' && (
              <label className="check">
                <input name="onDuty" type="checkbox" defaultChecked={user.onDuty} />
                On duty and available for deliveries
              </label>
            )}
          </Form>
        </Panel>
        <Panel title="Verification documents">
          <Form
            label="Upload securely"
            onSubmit={async (v, f) => {
              await upload(f.elements.file.files[0], v.kind);
              f.reset();
              refresh();
            }}
          >
            <Field label="Document type">
              <select name="kind">
                <option>IDENTITY</option>
                <option>LICENCE</option>
                {!isDriver && <option>OWNERSHIP</option>}
              </select>
            </Field>
            <Field
              label="JPEG, PNG or PDF (max 5 MB)"
              name="file"
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              required
            />
          </Form>
          {documents
            ?.filter((d) => d.kind !== 'INSPECTION')
            .map((d) => (
              <div className="list-row" key={d.id}>
                <span>{d.filename}</span>
                <Badge>{d.status}</Badge>
                <Action secondary run={() => openDocument(d.id)}>
                  Download
                </Action>
              </div>
            ))}
        </Panel>
      </div>
      {!isDriver && (
        <Panel title="Saved farm addresses">
          <Form
            label="Save address"
            onSubmit={async (v, f) => {
              if (!addressLocation) throw new Error('Capture the farm location before saving this address');
              await api('/addresses', {
                method: 'POST',
                body: { ...v, ...addressLocation },
              });
              f.reset();
              setAddressLocation(null);
              setAddressText('');
              refresh();
            }}
          >
            <div className="two">
              <Field label="Label" name="label" required />
              <Field
                label="Full address"
                name="address"
                value={addressText}
                onChange={(event) => setAddressText(event.target.value)}
                required
              />
            </div>
            <LocationPicker
              value={addressLocation}
              onChange={setAddressLocation}
              onAddress={setAddressText}
              label="Capture farm location"
            />
          </Form>
          {addresses?.map((a) => (
            <div className="list-row" key={a.id}>
              <strong>{a.label}</strong>
              <span>{a.address}</span>
              <Action secondary run={() => api(`/addresses/${a.id}`, { method: 'DELETE' })} done={refresh}>
                Remove
              </Action>
            </div>
          ))}
        </Panel>
      )}
      {!isDriver && (
        <Panel title="Saved machinery">
          {favourites?.length ? (
            favourites.map((f) => (
              <div className="list-row" key={f.machineryId}>
                <strong>{f.machinery.name}</strong>
                <span>{money(f.machinery.pricePerHour)}/h</span>
                <Button secondary onClick={() => navigate('machine', f.machineryId)}>
                  View
                </Button>
                <Action
                  secondary
                  run={() => api(`/favourites/${f.machineryId}`, { method: 'DELETE' })}
                  done={refresh}
                >
                  Unsave
                </Action>
              </div>
            ))
          ) : (
            <p>No saved machinery yet.</p>
          )}
        </Panel>
      )}
      <Panel title="Account closure">
        <p>
          Closing your account disables access. Active bookings must be resolved first; transaction history is
          retained for disputes.
        </p>
        <Form
          label="Close my account"
          onSubmit={async (v) => {
            if (v.confirm !== 'CLOSE') throw new Error('Type CLOSE to confirm');
            await api('/auth/me', { method: 'DELETE' });
            onLogout();
          }}
        >
          <Field label="Type CLOSE to confirm" name="confirm" required />
        </Form>
      </Panel>
    </>
  );
}
