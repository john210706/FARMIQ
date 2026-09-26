import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
function FitPoints({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) map.fitBounds(positions, { padding: [28, 28], maxZoom: 13 });
    else map.setView(positions[0], 13);
  }, [map, positions]);
  return null;
}
export default function Map({ machines = [], booking }) {
  const returning = ['RETURN_INSPECTION', 'RETURN_IN_TRANSIT', 'RETURNED'].includes(booking?.status);
  const farm = booking && {
    latitude: booking.farmLat,
    longitude: booking.farmLng,
    name: 'Farmer location',
    kind: 'farm',
  };
  const owner = booking?.machinery.latitude != null && {
    latitude: booking.machinery.latitude,
    longitude: booking.machinery.longitude,
    name: 'Owner equipment pickup',
    kind: 'owner',
  };
  const driver = booking?.driver?.latitude != null && {
    ...booking.driver,
    name: 'Driver: ' + booking.driver.fullName,
    kind: 'driver',
  };
  const points = booking
    ? [driver, owner, farm].filter(Boolean)
    : machines.filter((machine) => machine.latitude != null && machine.longitude != null);
  const route = booking ? (returning ? [driver, farm, owner] : [driver, owner, farm]).filter(Boolean) : [];
  const positions = points.map((point) => [point.latitude, point.longitude]);
  if (!points.length) return <p className="notice">No recorded locations yet.</p>;
  return (
    <MapContainer center={[points[0].latitude, points[0].longitude]} zoom={12} className="map">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <FitPoints positions={positions} />
      {points.map((p, i) => (
        <CircleMarker
          key={p.id || p.kind || i}
          center={[p.latitude, p.longitude]}
          radius={p.kind === 'driver' ? 11 : 9}
          pathOptions={{
            color: p.kind === 'driver' ? '#d36b2c' : p.kind === 'owner' ? '#294f3a' : '#718f43',
            className: p.kind === 'driver' ? 'live-driver' : '',
          }}
        >
          <Popup>{p.name}</Popup>
        </CircleMarker>
      ))}
      {route.slice(1).map((point, index) => (
        <Polyline
          key={`${route[index].kind}-${point.kind}`}
          positions={[
            [route[index].latitude, route[index].longitude],
            [point.latitude, point.longitude],
          ]}
          pathOptions={{ color: returning ? '#b56532' : '#648446', dashArray: '8 10', weight: 4 }}
        />
      ))}
    </MapContainer>
  );
}
