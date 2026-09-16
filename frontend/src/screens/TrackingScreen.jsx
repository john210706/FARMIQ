import React, { useState, useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { Phone, Truck, CheckCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function TrackingScreen({ t }) {
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await fetch(`${API_URL}/api/rides`);
        if (!res.ok) throw new Error("Could not load active rides");
        const rides = await res.json();
        const activeRide = rides.find((r) => r.status === "ASSIGNED") || rides[0];
        setRide(activeRide);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchRide();
    const interval = setInterval(fetchRide, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="screen" style={{ padding: 40, textAlign: "center" }}>{t.loadingSatellite}</div>;
  if (!ride) return <div className="screen" style={{ padding: 40, textAlign: "center" }}>{t.noActiveDispatchFound}</div>;

  const farmPos = [ride.farmLat || 10.7905, ride.farmLng || 79.1378];
  const driverPos = [ride.driver?.latitude || 10.795, ride.driver?.longitude || 79.14];
  const bounds = L.latLngBounds([farmPos, driverPos]);

  return (
    <div className="screen">
      <div className="marketplace-header">
        <span className="topbar-subtitle">{t.telematicsSub}</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, margin: "4px 0 8px" }}>
          {ride.machinery?.name || "Machinery"} {t.dispatchTelematics}
        </h2>
        <p style={{ color: "var(--slate-500)", fontSize: "14px" }}>
          Booking #{ride.id.substring(0, 8).toUpperCase()} · {t.routingGeoSat}
        </p>
      </div>

      <div className="booking-grid">
        {/* LEAFLET MAP */}
        <section style={{ height: "480px", borderRadius: "16px", overflow: "hidden", border: "1px solid var(--slate-200)" }}>
          <MapContainer bounds={bounds} zoom={13} style={{ height: "100%", width: "100%", zIndex: 1 }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={driverPos}>
              <Popup><strong>{ride.driver?.fullName}</strong><br />{t.driverEnRouteMarker}</Popup>
            </Marker>
            <Marker position={farmPos}>
              <Popup><strong>{t.destinationFarmMarker}</strong></Popup>
            </Marker>
            <Polyline positions={[driverPos, farmPos]} color="var(--primary-600)" weight={4} dashArray="8, 8" />
          </MapContainer>
        </section>

        {/* DRIVER & TIMELINE */}
        <aside className="form-panel">
          <div className="driver-profile-card">
            <div className="driver-avatar">{ride.driver?.fullName?.substring(0, 2).toUpperCase() || "DR"}</div>
            <div style={{ flex: 1 }}>
              <span className="topbar-subtitle" style={{ fontSize: "10px" }}>{t.assignedOperatorHeader}</span>
              <strong style={{ fontSize: "14px", display: "block", color: "var(--slate-900)" }}>{ride.driver?.fullName || "Assigning..."}</strong>
              <p style={{ fontSize: "12px", color: "var(--amber-700)" }}>★ 4.9 · {ride.driver?.phone || "Connecting"}</p>
            </div>
            <a href={`tel:${ride.driver?.phone}`} className="btn-primary" style={{ padding: "8px 12px", fontSize: "12px" }}>
              <Phone size={14} />
              {t.callDriver}
            </a>
          </div>

          <h3 className="form-panel-title" style={{ marginTop: "24px" }}>{t.activeHandoverPipeline}</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <CheckCircle size={18} style={{ color: "var(--primary-600)", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ fontSize: "13px", color: "var(--slate-900)", display: "block" }}>{t.paymentEscrowedTitle}</strong>
                <small style={{ color: "var(--slate-500)" }}>₹{ride.advancePaid} locked for {ride.machinery?.name}</small>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <CheckCircle size={18} style={{ color: "var(--primary-600)", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ fontSize: "13px", color: "var(--slate-900)", display: "block" }}>{t.smartDriverAssignedTitle}</strong>
                <small style={{ color: "var(--slate-500)" }}>{t.matchedClosestOperator} {ride.driver?.fullName}</small>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <Truck size={18} style={{ color: "var(--primary-600)", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ fontSize: "13px", color: "var(--primary-800)", display: "block" }}>{t.onTheWayGpsLive}</strong>
                <small style={{ color: "var(--slate-500)" }}>{t.driverPingUpdated}</small>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
