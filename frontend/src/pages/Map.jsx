import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
export default function Map({ machines = [], booking }) {
  const points = booking
    ? [
        { latitude: booking.farmLat, longitude: booking.farmLng, name: 'Your farm' },
        ...(booking.driver?.latitude != null
          ? [{ ...booking.driver, name: 'Driver: ' + booking.driver.fullName }]
          : []),
      ]
    : machines.filter((m) => m.latitude != null && m.longitude != null);
  if (!points.length) return <p className="notice">No recorded locations yet.</p>;
  return (
    <MapContainer
      key={points.map((p) => `${p.latitude},${p.longitude}`).join('|')}
      center={[points[0].latitude, points[0].longitude]}
      zoom={12}
      className="map"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {points.map((p, i) => (
        <CircleMarker key={p.id || i} center={[p.latitude, p.longitude]} radius={9}>
          <Popup>{p.name}</Popup>
        </CircleMarker>
      ))}
      {booking && points.length === 2 && (
        <Polyline
          positions={points.map((p) => [p.latitude, p.longitude])}
          pathOptions={{ dashArray: '6 8' }}
        />
      )}
    </MapContainer>
  );
}
