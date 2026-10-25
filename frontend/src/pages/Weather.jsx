import React, { useState } from 'react';
import { api } from '../lib/api';
import { Panel, Form, Badge } from '../ui';
import { localeFor } from '../i18n';
import { LocationPicker } from '../location';

export default function Weather() {
  const [weather, setWeather] = useState(null);
  const [weatherLocation, setWeatherLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="weather-page" style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div className="page-heading">
        <span className="eyebrow">FIELD METEOROLOGY & PLANNING</span>
        <h1>Agricultural Weather Forecast</h1>
        <p>Seven-day operational forecasts tailored for spraying, harvesting, and field mechanization safety.</p>
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          Data provided by Open-Meteo Weather API ↗
        </a>
      </div>

      <Panel title="Select Farm Coordinates">
        <Form
          label={loading ? 'Fetching satellite forecast...' : 'Fetch 7-Day Forecast'}
          onSubmit={async () => {
            if (!weatherLocation) throw new Error('Capture or select your farm location before checking the forecast');
            setLoading(true);
            try {
              const res = await api(
                '/weather?' +
                  new URLSearchParams({ lat: weatherLocation.latitude, lng: weatherLocation.longitude }),
              );
              setWeather(res);
            } finally {
              setLoading(false);
            }
          }}
        >
          <LocationPicker value={weatherLocation} onChange={setWeatherLocation} label="Farm GPS coordinates" />
        </Form>

        {weather && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '1.1rem', color: '#1e293b' }}>
              7-Day Operational Field Outlook
            </h3>
            <div className="forecast">
              {weather.days.map((d) => (
                <div key={d.date} className={d.caution ? 'weather-day caution' : 'weather-day'}>
                  <strong>
                    {new Date(d.date + 'T12:00:00').toLocaleDateString(localeFor(), {
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
            <p className="muted" style={{ marginTop: '16px', fontSize: '0.82rem' }}>
              {weather.note}{' '}
              <a href={weather.sourceUrl} target="_blank" rel="noreferrer">
                {weather.source}
              </a>
            </p>
          </div>
        )}
      </Panel>
    </div>
  );
}
