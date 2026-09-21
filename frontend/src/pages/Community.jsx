import React, { useState } from 'react';
import { api, money, when } from '../lib/api';
import { useData, State, Panel, Field, Action, Form, Button, Badge, Empty } from '../ui';
export default function Community({ user, navigate }) {
  const [recommendations, setRecommendations] = useState(null),
    [weather, setWeather] = useState(null),
    [v, setV] = useState(0);
  const { data: groups, error } = useData('/groups', v);
  const refresh = () => setV((v) => v + 1);
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">PLAN BETTER, FARM TOGETHER</span>
        <h1>Your fieldwork planner</h1>
        <p>Estimate the work, check the weather and coordinate with neighbours.</p>
        <a href="https://www.agrimachinery.nic.in/" target="_blank" rel="noreferrer">
          Government machinery assistance & Custom Hiring Centres ↗
        </a>
      </div>
      <div className="two">
        <Panel title="Find equipment for your task">
          <Form
            label="Find suitable machines"
            onSubmit={async (v) =>
              setRecommendations(await api('/recommendations?' + new URLSearchParams(v)))
            }
          >
            <Field label="Field activity">
              <select name="task">
                {['ploughing', 'sowing', 'spraying', 'harvesting', 'levelling'].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Crop" name="crop" placeholder="Paddy, wheat…" />
            <Field
              label="Area (acres)"
              name="acres"
              type="number"
              min="0.1"
              step="0.1"
              defaultValue="4"
              required
            />
            <Field label="Soil condition">
              <select name="soil">
                <option>dry</option>
                <option>wet</option>
                <option>heavy</option>
              </select>
            </Field>
            <Field
              label="Your local fuel price / litre"
              name="fuelPrice"
              type="number"
              min="0"
              max="300"
              step="any"
              defaultValue="95"
            />
          </Form>
        </Panel>
        <Panel title="Seven-day field forecast">
          <Form
            label="Check forecast"
            onSubmit={async (v) => setWeather(await api('/weather?' + new URLSearchParams(v)))}
          >
            <div className="two">
              <Field
                label="Farm latitude"
                name="lat"
                type="number"
                step="any"
                min="-90"
                max="90"
                defaultValue="10.7905"
                required
              />
              <Field
                label="Farm longitude"
                name="lng"
                type="number"
                step="any"
                min="-180"
                max="180"
                defaultValue="79.1378"
                required
              />
            </div>
          </Form>
          {weather && (
            <>
              <div className="forecast">
                {weather.days.map((d) => (
                  <div key={d.date} className={d.caution ? 'weather-day caution' : 'weather-day'}>
                    <strong>
                      {new Date(d.date + 'T12:00:00').toLocaleDateString(undefined, {
                        weekday: 'short',
                        day: 'numeric',
                      })}
                    </strong>
                    <span>{d.temperature}°C</span>
                    <small>Rain {d.rainChance}%</small>
                    <small>Wind {d.windKmh} km/h</small>
                    {d.caution && <Badge>Check conditions</Badge>}
                  </div>
                ))}
              </div>
              <p className="muted">
                {weather.note}{' '}
                <a href={weather.sourceUrl} target="_blank" rel="noreferrer">
                  {weather.source}
                </a>
              </p>
            </>
          )}
        </Panel>
      </div>
      {recommendations && (
        <Panel title="Suggested equipment & operating estimates">
          {recommendations.length ? (
            recommendations.map((r) => (
              <div className="list-row" key={r.machine.id}>
                <div>
                  <h3>{r.machine.name}</h3>
                  <p>{r.reason}</p>
                  <p>
                    About {r.hours} h · rental {money(r.estimatedRental)} · fuel {money(r.estimatedFuel)}
                  </p>
                  <small>Delivery and operator costs are calculated in your booking quotation.</small>
                </div>
                <Button onClick={() => navigate('machine', r.machine.id)}>View equipment</Button>
              </div>
            ))
          ) : (
            <Empty>No verified equipment matches this task.</Empty>
          )}
        </Panel>
      )}
      <Panel title="Village group requests">
        <p>
          Coordinate acreage and preferred dates before arranging a shared machine. These are expressions of
          interest; joining does not reserve equipment or collect payment.
        </p>
        <State data={groups} error={error}>
          {groups?.map((g) => (
            <div className="panel" key={g.id}>
              <div className="row spread">
                <h3>{g.title}</h3>
                <Badge>{g.status}</Badge>
              </div>
              <p>
                {g.village} · {g.category} · {when(g.scheduledAt)}
              </p>
              <p>
                {g.memberCount} farmers · {g.totalAcres} acres · indicative delivery share{' '}
                {money(600 / Math.max(1, g.memberCount))} per member
              </p>
              {user.role === 'FARMER' && (
                <Form
                  label={g.joined ? 'Update my acreage' : 'Join request'}
                  onSubmit={async (v) => {
                    await api(`/groups/${g.id}/join`, { method: 'PUT', body: { acres: Number(v.acres) } });
                    refresh();
                  }}
                >
                  <Field
                    label="My acreage"
                    name="acres"
                    type="number"
                    min="0.1"
                    step="0.1"
                    defaultValue={g.myAcres || 1}
                    required
                  />
                </Form>
              )}
              {g.joined && (
                <Action
                  secondary
                  run={() => api(`/groups/${g.id}/join`, { method: 'DELETE' })}
                  done={refresh}
                >
                  Leave group
                </Action>
              )}
            </div>
          ))}
        </State>
        {user.role === 'FARMER' && (
          <Form
            label="Start village request"
            onSubmit={async (v, f) => {
              await api('/groups', {
                method: 'POST',
                body: { ...v, scheduledAt: new Date(v.scheduledAt).toISOString(), acres: Number(v.acres) },
              });
              f.reset();
              refresh();
            }}
          >
            <div className="two">
              <Field label="Request title" name="title" placeholder="Shared paddy harvest" required />
              <Field label="Village" name="village" required />
              <Field label="Equipment category">
                <select name="category">
                  {['TRACTOR', 'HARVESTER', 'TILLAGE', 'SPRAYER'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Preferred start" name="scheduledAt" type="datetime-local" required />
              <Field label="Your acreage" name="acres" type="number" min="0.1" step="0.1" required />
            </div>
          </Form>
        )}
      </Panel>
    </>
  );
}
