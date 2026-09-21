import React, { useState } from 'react';
import { api, money, when, download } from '../lib/api';
import { useData, State, Panel, Form, Field, Action, Button, Badge, Empty } from '../ui';
export function Finance({ admin = false }) {
  const [version, setVersion] = useState(0);
  const { data, error } = useData('/operations/finance', version);
  const refresh = () => setVersion((v) => v + 1);
  return (
    <Panel title="Rental settlement ledger">
      <p>
        Completed rentals and frozen commission amounts. Payout actions are sandbox simulations: no money is
        transferred. Up to 500 most recent completed rentals are shown.
      </p>
      <Button
        secondary
        disabled={!data?.length}
        onClick={() => {
          const cell = (value) =>
            '"' +
            String(value ?? '')
              .replace(/^[=+\-@\t\r]/, "'$&")
              .replaceAll('"', '""') +
            '"';
          const rows = [
            [
              'Booking',
              'Machine',
              'Total INR',
              'Commission INR',
              'Owner INR',
              'Captured INR',
              'Refunded INR',
              'Payout',
            ],
            ...data.map((b) => [
              b.bookingId,
              b.machine,
              b.total,
              b.commission,
              b.ownerEarnings,
              b.captured,
              b.refunded,
              b.payout?.status || 'Not requested',
            ]),
          ];
          download(
            'farmiq-settlements.csv',
            rows.map((row) => row.map(cell).join(',')).join('\r\n'),
            'text/csv',
          );
        }}
      >
        Export CSV
      </Button>
      <State data={data} error={error}>
        {!data?.length && <Empty>No completed rentals yet.</Empty>}
        {data?.map((b) => (
          <div className="list-row wrap" key={b.bookingId}>
            <div>
              <strong>{b.machine}</strong>
              <p>{b.bookingId}</p>
              <p>
                Collected {money(b.captured)} · Refunded {money(b.refunded)}
              </p>
              <p>
                Commission {money(b.commission)} · Owner share {money(b.ownerEarnings)}
              </p>
            </div>
            {b.payout ? (
              <div>
                <Badge>{b.payout.status}</Badge>
                <p>{b.payout.note}</p>
                {admin && b.payout.status === 'REQUESTED' && (
                  <Action
                    run={() =>
                      api(`/operations/payouts/${b.payout.id}/approve`, { method: 'POST', body: {} })
                    }
                    done={refresh}
                  >
                    Simulate payout approval
                  </Action>
                )}
              </div>
            ) : (
              <Action
                secondary
                run={() => api(`/operations/payouts/${b.bookingId}`, { method: 'POST', body: {} })}
                done={refresh}
              >
                Request sandbox payout
              </Action>
            )}
          </div>
        ))}
      </State>
    </Panel>
  );
}
export default function Operations() {
  const [version, setVersion] = useState(0),
    [notice, setNotice] = useState('');
  const config = useData('/operations/dispatch', version);
  const messages = useData('/operations/messages', version);
  return (
    <div className="stack">
      <Panel title="Automatic dispatch">
        <p>
          Assigns the nearest verified, on-duty driver with GPS updated within five minutes and no active
          delivery. Distances are straight-line estimates, not road travel times. Checks run every 30 seconds
          while the API is running.
        </p>
        <State data={config.data} error={config.error}>
          {config.data && (
            <Form
              key={JSON.stringify(config.data)}
              label="Save dispatch settings"
              onSubmit={async (v) => {
                await api('/operations/dispatch', {
                  method: 'PUT',
                  body: {
                    enabled: v.enabled === 'on',
                    radiusKm: Number(v.radiusKm),
                    horizonHours: Number(v.horizonHours),
                  },
                });
                setNotice('Dispatch settings saved');
                setVersion((v) => v + 1);
              }}
            >
              <label className="check">
                <input name="enabled" type="checkbox" defaultChecked={config.data.enabled} />
                Enable automatic allocation
              </label>
              <Field
                label="Maximum driver distance from pickup (km)"
                name="radiusKm"
                type="number"
                min="1"
                max="200"
                defaultValue={config.data.radiusKm}
                required
              />
              <Field
                label="Allocate bookings starting within (hours)"
                name="horizonHours"
                type="number"
                min="1"
                max="48"
                defaultValue={config.data.horizonHours}
                required
              />
            </Form>
          )}
        </State>
        <Action
          secondary
          run={async () => {
            const r = await api('/operations/dispatch/run', { method: 'POST', body: {} });
            setNotice(
              r.enabled ? `${r.assigned.length} booking(s) allocated` : 'Enable automatic allocation first',
            );
          }}
        >
          Run allocation now
        </Action>
        {notice && <p role="status">{notice}</p>}
      </Panel>
      <Finance admin />
      <Panel title="SMS delivery outbox">
        <p>
          Opted-in booking notifications only. Sending requires server configuration. UNKNOWN means the
          provider outcome needs review; it is never automatically resent.
        </p>
        <Button secondary onClick={() => setVersion((v) => v + 1)}>
          Refresh delivery status
        </Button>
        <State data={messages.data} error={messages.error}>
          {!messages.data?.length && <Empty>No queued notifications.</Empty>}
          {messages.data?.map((m) => (
            <div className="list-row" key={m.id}>
              <div>
                <p>{m.body}</p>
                <small>
                  {when(m.createdAt)} · Attempts: {m.attempts}
                </small>
                {m.error && <p>{m.error}</p>}
              </div>
              <Badge>{m.status}</Badge>
            </div>
          ))}
        </State>
      </Panel>
    </div>
  );
}
