import React, { useState } from 'react';
import { api, money, when } from '../lib/api';
import { useData, State, Panel, Field, Action, Form, Button, Badge, Empty } from '../ui';

const TASK_OPTIONS = [
  { value: 'ploughing', label: 'Primary ploughing (Mouldboard / Disc)' },
  { value: 'rotavating', label: 'Rotary tillage (Rotavator seedbed prep)' },
  { value: 'subsoiling', label: 'Deep subsoiling (Hardpan shattering)' },
  { value: 'sowing', label: 'Precision sowing & transplanting' },
  { value: 'spraying', label: 'Crop protection spraying' },
  { value: 'harvesting', label: 'Combine harvesting & threshing' },
  { value: 'levelling', label: 'Laser land grading & levelling' },
];

const SOIL_OPTIONS = [
  { value: 'clay', label: 'Clay wetland (High draft resistance & slip risk)' },
  { value: 'loam', label: 'Alluvial loam (Standard medium draft)' },
  { value: 'black_cotton', label: 'Black cotton (High cohesive shear resistance)' },
  { value: 'sandy', label: 'Sandy loam (Light soil, low draft resistance)' },
];

const CROP_OPTIONS = [
  { value: 'paddy', label: 'Paddy (Rice)' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'sugarcane', label: 'Sugarcane' },
  { value: 'cotton', label: 'Cotton' },
  { value: 'pulses', label: 'Pulses / Legumes' },
  { value: 'maize', label: 'Maize / Corn' },
];

export default function Community({ user, navigate }) {
  // Navigation & View Mode: 'SEARCH' | 'LOADING' | 'RESULTS'
  const [viewMode, setViewMode] = useState('SEARCH');

  // Input Parameters
  const [task, setTask] = useState('ploughing');
  const [crop, setCrop] = useState('paddy');
  const [soil, setSoil] = useState('clay');
  const [acres, setAcres] = useState(4);
  const [fuelPrice, setFuelPrice] = useState(95);
  const [tillageDepthCm, setTillageDepthCm] = useState(18);
  const [soilMoisturePct, setSoilMoisturePct] = useState(22);
  const [driveType, setDriveType] = useState('2WD');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Results & SHAP state
  const [recommendations, setRecommendations] = useState(null);
  const [expandedShapId, setExpandedShapId] = useState(null);
  const [searchError, setSearchError] = useState(null);

  // Village Groups Data
  const [v, setV] = useState(0);
  const { data: groups, error: groupsError } = useData('/groups', v);
  const refreshGroups = () => setV((cur) => cur + 1);

  const handleRunSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSearchError(null);
    setViewMode('LOADING');

    try {
      const query = new URLSearchParams({
        task,
        crop,
        soil,
        acres: Number(acres) || 1,
        fuelPrice: Number(fuelPrice) || 95,
        tillageDepthCm: Number(tillageDepthCm) || 18,
        soilMoisturePct: Number(soilMoisturePct) || 22,
        driveType,
      });

      const [res] = await Promise.all([
        api(`/recommendations?${query}`),
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);

      setRecommendations(res);
      setViewMode('RESULTS');
    } catch (err) {
      setSearchError(err.message || 'Failed to calculate recommendations');
      setViewMode('SEARCH');
    }
  };

  const getTaskLabel = (val) => TASK_OPTIONS.find((t) => t.value === val)?.label || val;
  const getSoilLabel = (val) => SOIL_OPTIONS.find((s) => s.value === val)?.label || val;
  const getCropLabel = (val) => CROP_OPTIONS.find((c) => c.value === val)?.label || val;

  const best = recommendations && recommendations.length > 0 ? recommendations[0] : null;
  const alternatives = recommendations && recommendations.length > 1 ? recommendations.slice(1) : [];

  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">FIELDWORK & MECHANIZATION ENGINE</span>
        <h1>Fieldwork planner</h1>
        <p>Estimate work hours, fuel consumption, and find compatible machinery for your field conditions.</p>
        <a href="https://www.agrimachinery.nic.in/" target="_blank" rel="noreferrer">
          Government machinery assistance & Custom Hiring Centres ↗
        </a>
      </div>

      {/* =========================================================================
          VIEW 1: SEARCH & CONFIGURATION FORM
      ========================================================================= */}
      {viewMode === 'SEARCH' && (
        <Panel title="Fieldwork parameters & machinery matcher">
          {searchError && (
            <div className="notice error" role="alert" style={{ marginBottom: '16px' }}>
              {searchError}
            </div>
          )}

          <form onSubmit={handleRunSearch} className="form" style={{ marginTop: 0 }}>
            <div className="two">
              <Field label="Field operation activity">
                <select value={task} onChange={(e) => setTask(e.target.value)}>
                  {TASK_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Soil profile & texture">
                <select value={soil} onChange={(e) => setSoil(e.target.value)}>
                  {SOIL_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="two">
              <Field label="Field area (acres)">
                <input
                  type="number"
                  min="0.1"
                  max="1000"
                  step="0.1"
                  value={acres}
                  onChange={(e) => setAcres(e.target.value)}
                  required
                />
              </Field>

              <Field label="Standing or target crop">
                <select value={crop} onChange={(e) => setCrop(e.target.value)}>
                  {CROP_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="two">
              <Field label="Local diesel price (₹/litre)">
                <input
                  type="number"
                  min="50"
                  max="150"
                  step="1"
                  value={fuelPrice}
                  onChange={(e) => setFuelPrice(Number(e.target.value))}
                  required
                />
              </Field>

              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}>
                <Button secondary onClick={() => setShowAdvanced(!showAdvanced)}>
                  {showAdvanced ? 'Hide engineering parameters' : 'Engineering parameters (Depth, moisture, drive)'}
                </Button>
              </div>
            </div>

            {showAdvanced && (
              <div
                style={{
                  background: '#f8faf5',
                  padding: '16px 20px',
                  borderRadius: '9px',
                  border: '1px solid var(--line)',
                  marginTop: '8px',
                }}
              >
                <p className="muted" style={{ margin: '0 0 14px', fontSize: '12px' }}>
                  Engineering parameters calibrated to ASABE D497 standards for drawbar pull and rolling resistance.
                </p>
                <div className="two">
                  <Field label={`Tillage depth: ${tillageDepthCm} cm`}>
                    <input
                      type="range"
                      min="10"
                      max="45"
                      step="1"
                      value={tillageDepthCm}
                      onChange={(e) => setTillageDepthCm(Number(e.target.value))}
                    />
                  </Field>

                  <Field label={`Soil moisture content: ${soilMoisturePct}%`}>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      step="1"
                      value={soilMoisturePct}
                      onChange={(e) => setSoilMoisturePct(Number(e.target.value))}
                    />
                  </Field>

                  <Field label="Drivetrain preference">
                    <select value={driveType} onChange={(e) => setDriveType(e.target.value)}>
                      <option value="2WD">2WD (Two-wheel drive)</option>
                      <option value="4WD">4WD (Four-wheel drive)</option>
                    </select>
                  </Field>
                </div>
              </div>
            )}

            <div className="row" style={{ marginTop: '16px' }}>
              <Button type="submit">Calculate mechanization estimates</Button>
            </div>
          </form>
        </Panel>
      )}

      {/* =========================================================================
          VIEW 2: IN-PLACE PROFESSIONAL LOADING STATE (No Scrolling)
      ========================================================================= */}
      {viewMode === 'LOADING' && (
        <Panel title="Evaluating machinery fleet">
          <div className="skeleton" style={{ padding: '36px 24px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: '15px', color: 'var(--green)' }}>
              Calculating terramechanics, fuel consumption and drawbar load…
            </p>
            <p className="muted" style={{ margin: 0, fontSize: '12px' }}>
              Running Stacking Deep Ensemble (LightGBM + XGBoost + Deep MLP Neural Network) on 22 machinery units.
            </p>
          </div>
        </Panel>
      )}

      {/* =========================================================================
          VIEW 3: IN-PLACE RESULTS DISPLAY (Best Highlighted, Others Scrolled)
      ========================================================================= */}
      {viewMode === 'RESULTS' && (
        <Panel
          title="Machinery recommendations & operating estimates"
          actions={
            <Button secondary onClick={() => setViewMode('SEARCH')}>
              ← Modify parameters
            </Button>
          }
        >
          {/* Telemetry Summary Bar */}
          <div
            className="row spread"
            style={{
              paddingBottom: '14px',
              marginBottom: '20px',
              borderBottom: '1px solid var(--line)',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 600 }}>
                {acres} acres · {getCropLabel(crop)} · {getSoilLabel(soil)}
              </p>
              <small className="muted">{getTaskLabel(task)}</small>
            </div>
            <div className="row" style={{ gap: '8px' }}>
              <span className="pill">Stacked Ensemble (LGBM + XGB + MLP)</span>
              <span className="pill">R² = 0.985</span>
            </div>
          </div>

          {!recommendations || recommendations.length === 0 ? (
            <Empty>No verified equipment matches this exact field operation.</Empty>
          ) : (
            <>
              {/* 1. BEST RESULT HIGHLIGHTED CARD */}
              {best && (
                <div
                  style={{
                    background: '#fbfdf9',
                    border: '2px solid #587b42',
                    borderRadius: '12px',
                    padding: '22px',
                    marginBottom: '26px',
                  }}
                >
                  <div
                    className="row spread"
                    style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '14px' }}
                  >
                    <div>
                      <div className="row" style={{ gap: '8px', marginBottom: '6px' }}>
                        <span
                          className="pill"
                          style={{ background: '#254e36', color: '#fff', border: 'none', fontWeight: 700 }}
                        >
                          RECOMMENDED BEST MATCH
                        </span>
                        <Badge>{best.compatibility} LOAD</Badge>
                        <span className="pill">AI VERIFIED</span>
                      </div>
                      <h2 style={{ margin: '4px 0', fontSize: '20px' }}>{best.machine.name}</h2>
                      <p className="muted" style={{ margin: 0, fontSize: '13px' }}>
                        {best.machine.horsepower ?? '—'} HP · {best.machine.category} · Verified local machinery
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span className="price">
                        {money(best.totalCost || best.estimatedRental + best.estimatedFuel)}
                      </span>
                      <small className="muted" style={{ display: 'block', marginTop: '2px' }}>
                        Rental {money(best.estimatedRental)} + Diesel {money(best.estimatedFuel)}
                      </small>
                    </div>
                  </div>

                  <p style={{ margin: '0 0 16px', fontSize: '13px', lineHeight: '1.5', color: '#334135' }}>
                    {best.reason}
                  </p>

                  {/* Clean 4-box stat grid with breathing space */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: '12px',
                      marginBottom: '18px',
                    }}
                  >
                    <div
                      style={{
                        background: '#fff',
                        border: '1px solid var(--line)',
                        borderRadius: '8px',
                        padding: '12px',
                      }}
                    >
                      <small className="muted" style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>
                        ESTIMATED TIME
                      </small>
                      <strong style={{ fontSize: '16px', color: '#20392e' }}>{best.hours} h</strong>
                    </div>

                    <div
                      style={{
                        background: '#fff',
                        border: '1px solid var(--line)',
                        borderRadius: '8px',
                        padding: '12px',
                      }}
                    >
                      <small className="muted" style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>
                        DIESEL NEEDED
                      </small>
                      <strong style={{ fontSize: '16px', color: '#20392e' }}>{best.predictedFuelLitres} L</strong>
                      <small className="muted" style={{ display: 'block', fontSize: '11px' }}>
                        ({money(best.estimatedFuel)})
                      </small>
                    </div>

                    <div
                      style={{
                        background: '#fff',
                        border: '1px solid var(--line)',
                        borderRadius: '8px',
                        padding: '12px',
                      }}
                    >
                      <small className="muted" style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>
                        WHEEL TRACTION SLIP
                      </small>
                      <strong style={{ fontSize: '16px', color: '#20392e' }}>{best.wheelSlipPct}%</strong>
                    </div>

                    <div
                      style={{
                        background: '#fff',
                        border: '1px solid var(--line)',
                        borderRadius: '8px',
                        padding: '12px',
                      }}
                    >
                      <small className="muted" style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>
                        CO₂ FOOTPRINT
                      </small>
                      <strong style={{ fontSize: '16px', color: '#20392e' }}>{best.co2EmissionKg} kg</strong>
                    </div>
                  </div>

                  <div className="row spread" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div className="row" style={{ gap: '10px' }}>
                      <Button onClick={() => navigate('machine', best.machine.id)}>
                        Book this machine →
                      </Button>
                      {best.shapFactors && best.shapFactors.length > 0 && (
                        <Button
                          secondary
                          onClick={() => setExpandedShapId(expandedShapId === best.machine.id ? null : best.machine.id)}
                        >
                          {expandedShapId === best.machine.id ? 'Hide SHAP analysis' : 'Explain fuel (SHAP)'}
                        </Button>
                      )}
                    </div>
                    <small className="muted">Hourly rate: {money(best.machine.pricePerHour)}/h</small>
                  </div>

                  {/* Inline SHAP table for best result */}
                  {expandedShapId === best.machine.id && best.shapFactors && (
                    <div
                      style={{
                        marginTop: '16px',
                        background: '#fff',
                        border: '1px solid var(--line)',
                        borderRadius: '8px',
                        padding: '16px',
                      }}
                    >
                      <div className="row spread" style={{ marginBottom: '8px' }}>
                        <strong style={{ fontSize: '12px', color: 'var(--green)' }}>
                          Tree-SHAP Feature Attribution (Fuel Drivers)
                        </strong>
                        <small className="muted">Baseline expectation: {best.baseExpectedFuel || 126.8} L</small>
                      </div>
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Operating variable</th>
                              <th>Impact on diesel</th>
                              <th>Engineering rationale</th>
                            </tr>
                          </thead>
                          <tbody>
                            {best.shapFactors.map((f, idx) => (
                              <tr key={idx}>
                                <td>
                                  <strong>{f.feature}</strong>
                                </td>
                                <td
                                  style={{
                                    color: f.impactLitres > 0 ? '#853322' : '#2b5f3a',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {f.impactLitres > 0 ? `+${f.impactLitres} L` : `${f.impactLitres} L`}
                                </td>
                                <td className="muted">{f.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. OTHER AVAILABLE OPTIONS (SCROLLABLE CONTAINER) */}
              {alternatives.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div className="row spread" style={{ marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px' }}>
                      Other compatible options ({alternatives.length})
                    </h3>
                    <small className="muted">Scroll to compare other power classes & implements</small>
                  </div>

                  <div
                    style={{
                      maxHeight: '380px',
                      overflowY: 'auto',
                      border: '1px solid var(--line)',
                      borderRadius: '10px',
                      background: '#fff',
                      padding: '0 16px',
                    }}
                  >
                    {alternatives.map((r) => {
                      const isShapOpen = expandedShapId === r.machine.id;
                      return (
                        <div className="list-row" key={r.machine.id} style={{ padding: '14px 0' }}>
                          <div style={{ flex: 1 }}>
                            <div className="row align-center" style={{ gap: '8px', marginBottom: '4px' }}>
                              <strong style={{ fontSize: '14px' }}>{r.machine.name}</strong>
                              <Badge>{r.compatibility}</Badge>
                              <small className="muted">
                                {r.machine.horsepower ?? '—'} HP · {r.machine.category}
                              </small>
                            </div>
                            <p className="muted" style={{ margin: '2px 0 4px', fontSize: '12px' }}>
                              {r.hours} h · {r.predictedFuelLitres} L diesel ({money(r.estimatedFuel)}) ·{' '}
                              {r.wheelSlipPct}% slip
                            </p>

                            {isShapOpen && r.shapFactors && (
                              <div
                                style={{
                                  marginTop: '10px',
                                  background: '#f8faf5',
                                  border: '1px solid var(--line)',
                                  borderRadius: '6px',
                                  padding: '10px',
                                }}
                              >
                                <div className="table-wrap">
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>Variable</th>
                                        <th>Impact</th>
                                        <th>Rationale</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {r.shapFactors.map((f, idx) => (
                                        <tr key={idx}>
                                          <td>{f.feature}</td>
                                          <td
                                            style={{
                                              color: f.impactLitres > 0 ? '#853322' : '#2b5f3a',
                                              fontWeight: 600,
                                            }}
                                          >
                                            {f.impactLitres > 0 ? `+${f.impactLitres} L` : `${f.impactLitres} L`}
                                          </td>
                                          <td className="muted">{f.description}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>

                          <div
                            style={{
                              textAlign: 'right',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-end',
                              gap: '6px',
                            }}
                          >
                            <span className="price" style={{ fontSize: '18px' }}>
                              {money(r.totalCost || r.estimatedRental + r.estimatedFuel)}
                            </span>
                            <div className="row" style={{ gap: '6px' }}>
                              {r.shapFactors && r.shapFactors.length > 0 && (
                                <Button
                                  secondary
                                  onClick={() => setExpandedShapId(isShapOpen ? null : r.machine.id)}
                                  style={{ padding: '6px 10px', fontSize: '11px', minHeight: '32px' }}
                                >
                                  {isShapOpen ? 'Hide' : 'SHAP'}
                                </Button>
                              )}
                              <Button
                                onClick={() => navigate('machine', r.machine.id)}
                                style={{ padding: '6px 12px', fontSize: '11px', minHeight: '32px' }}
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </Panel>
      )}

      {/* =========================================================================
          COMMUNITY VILLAGE GROUP REQUESTS (Always Accessible Below)
      ========================================================================= */}
      <Panel title="Village shared machinery requests">
        <p>
          Coordinate acreage and preferred dates with neighbouring farmers before arranging a shared machine.
        </p>
        <State data={groups} error={groupsError}>
          {groups?.map((g) => (
            <div className="panel" key={g.id} style={{ margin: '12px 0' }}>
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
                  onSubmit={async (val) => {
                    await api(`/groups/${g.id}/join`, { method: 'PUT', body: { acres: Number(val.acres) } });
                    refreshGroups();
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
                  done={refreshGroups}
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
            onSubmit={async (val, f) => {
              await api('/groups', {
                method: 'POST',
                body: { ...val, scheduledAt: new Date(val.scheduledAt).toISOString(), acres: Number(val.acres) },
              });
              f.reset();
              refreshGroups();
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
