import React, { useMemo } from "react";
import {
  Tractor, Truck, CalendarDays, Users, ShieldCheck, CheckCircle2, Clock,
  MapPin, Star, Navigation, Search, SunMedium, Wrench, TrendingUp,
  Gauge, IndianRupee, PhoneCall, Phone, ChevronRight, Check,
} from "lucide-react";
import { machineryData } from "../data/machineryData";
import { MachineCardPro } from "../components/MachineCardPro";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ─── Role-specific content config ────────────────────────────────────────────
function useRoleConfig(role, t) {
  return useMemo(() => {
    switch (role) {
      case "Machinery Owner":
        return {
          greeting: t.ownerGreeting,
          subtitle: t.ownerSubtitle,
          metrics: [
            { label: t.metric_listedEquipment, value: "06 Units", sub: t.metric_listedEquipmentSub, icon: Tractor, type: "emerald", trend: t.metric_listedEquipmentTrend },
            { label: t.metric_monthRevenue, value: "₹34,800", sub: t.metric_monthRevenueSub, icon: IndianRupee, type: "amber", trend: t.metric_monthRevenueTrend },
            { label: t.metric_fleetUtilisation, value: "78.2%", sub: t.metric_fleetUtilisationSub, icon: Gauge, type: "blue", trend: t.metric_fleetUtilisationTrend },
          ],
        };
      case "Delivery Partner":
        return {
          greeting: t.driverGreeting,
          subtitle: t.driverSubtitle,
          metrics: [
            { label: t.metric_assignedTrips, value: "03 Trips", sub: t.metric_assignedTripsSub, icon: Truck, type: "emerald", trend: t.metric_assignedTripsTrend },
            { label: t.metric_completedDeliveries, value: "268", sub: t.metric_completedDeliveriesSub, icon: CheckCircle2, type: "amber", trend: t.metric_completedDeliveriesTrend },
            { label: t.metric_distanceRemaining, value: "42 km", sub: t.metric_distanceRemainingSub, icon: Navigation, type: "blue", trend: t.metric_distanceRemainingTrend },
          ],
        };
      case "Administrator":
        return {
          greeting: t.adminGreeting,
          subtitle: t.adminSubtitle,
          metrics: [
            { label: t.metric_activeFarmers, value: "1,248", sub: t.metric_activeFarmersSub, icon: Users, type: "emerald", trend: t.metric_activeFarmersTrend },
            { label: t.metric_liveRentals, value: "86 Live", sub: t.metric_liveRentalsSub, icon: Tractor, type: "amber", trend: t.metric_liveRentalsTrend },
            { label: t.metric_safetyCompliance, value: "99.4%", sub: t.metric_safetyComplianceSub, icon: ShieldCheck, type: "blue", trend: t.metric_safetyComplianceTrend },
          ],
        };
      case "Farmer":
      default:
        return {
          greeting: t.farmerGreeting,
          subtitle: t.farmerSubtitle,
          metrics: [
            { label: t.metric_activeBookings, value: "02", sub: t.metric_activeBookingsSub, icon: CalendarDays, type: "emerald", trend: t.metric_activeBookingsTrend },
            { label: t.metric_hoursSaved, value: "18.5 hrs", sub: t.metric_hoursSavedSub, icon: Clock, type: "amber", trend: t.metric_hoursSavedTrend },
            { label: t.metric_nearbyEquipment, value: "24 Units", sub: t.metric_nearbyEquipmentSub, icon: MapPin, type: "blue", trend: t.metric_nearbyEquipmentTrend },
          ],
        };
    }
  }, [role, t]);
}

// ─── Delivery Partner live workspace (fetches from backend) ───────────────────
import { useState, useEffect } from "react";

function DeliveryPartnerLiveWorkspace({ navigateTo, t }) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchDeliveries = async () => {
    try {
      const res = await fetch(`${API_URL}/api/driver/deliveries`);
      if (res.ok) setDeliveries(await res.json());
    } catch (err) {
      console.error("Error fetching driver deliveries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    const interval = setInterval(fetchDeliveries, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptDelivery = async (bookingId) => {
    setActionLoadingId(bookingId);
    try {
      const res = await fetch(`${API_URL}/api/driver/deliveries/${bookingId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) await fetchDeliveries();
    } catch (err) {
      console.error("Failed to accept delivery:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateStatus = async (bookingId, nextStatus) => {
    setActionLoadingId(bookingId);
    try {
      const res = await fetch(`${API_URL}/api/driver/deliveries/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        await fetchDeliveries();
        if (nextStatus === "IN_TRANSIT") navigateTo("tracking");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="two-col-grid">
      <section className="owner-pipeline-card">
        <div className="section-title-group" style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3>Live Movement Manifest</h3>
            <p>Real-time booking requests ready for logistics pickup &amp; handover</p>
          </div>
          <span className="badge-in-transit" style={{ background: "var(--primary-50)", color: "var(--primary-700)", borderColor: "var(--primary-200)" }}>
            <span className="live-pulse" /> {deliveries.length} Active Dispatch
          </span>
        </div>

        {loading && <p style={{ color: "var(--slate-500)", fontSize: "13px" }}>Loading delivery queue from database...</p>}
        {!loading && deliveries.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 16px", background: "var(--slate-50)", borderRadius: "var(--radius-md)" }}>
            <Truck size={32} style={{ color: "var(--slate-400)", margin: "0 auto 8px" }} />
            <p style={{ fontWeight: 600, color: "var(--slate-700)" }}>No delivery requests currently</p>
            <small style={{ color: "var(--slate-500)" }}>When a farmer books machinery, it will instantly appear here for you to accept.</small>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {deliveries.map((item, index) => {
            const isAssigned = item.status === "ASSIGNED";
            const isInTransit = item.status === "IN_TRANSIT";
            const isDelivered = item.status === "DELIVERED";
            return (
              <div key={item.id} className="pipeline-item" style={{ flexDirection: "column", alignItems: "stretch", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div className="pipeline-left">
                    <span style={{ fontSize: "16px", fontWeight: "bold", color: "var(--primary-700)" }}>0{index + 1}</span>
                    <div>
                      <strong style={{ fontSize: "14px", display: "block" }}>{item.machinery?.name || "Machinery"}</strong>
                      <p style={{ fontSize: "12px", color: "var(--slate-500)", marginTop: "2px" }}>
                        Farmer: <strong>{item.farmer?.fullName || "Ravi Kumar"}</strong> ({item.farmer?.phone || "Phone"})
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--slate-600)" }}>
                        Drop Location: {item.farmAddress || `${item.farmLat}, ${item.farmLng}`}
                      </p>
                    </div>
                  </div>
                  <span className="machine-status-pill" style={{ background: isInTransit ? "var(--primary-50)" : isDelivered ? "#F3E8FF" : "var(--slate-100)", color: isInTransit ? "var(--primary-700)" : isDelivered ? "#7E22CE" : "var(--slate-700)", borderColor: isInTransit ? "var(--primary-300)" : isDelivered ? "#D8B4FE" : "var(--slate-300)" }}>
                    {item.status.replace("_", " ")}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", borderTop: "1px solid var(--slate-100)", paddingTop: "10px" }}>
                  <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => navigateTo("tracking")}>
                    <Navigation size={13} /> {t.fullGpsScreen}
                  </button>
                  {!item.driverId && (
                    <button className="btn-primary" style={{ padding: "6px 14px", fontSize: "12px" }} disabled={actionLoadingId === item.id} onClick={() => handleAcceptDelivery(item.id)}>
                      {actionLoadingId === item.id ? "Accepting..." : "Accept Delivery (+₹600)"}
                    </button>
                  )}
                  {isAssigned && (
                    <button className="btn-primary" style={{ padding: "6px 14px", fontSize: "12px", background: "var(--primary-700)" }} disabled={actionLoadingId === item.id} onClick={() => handleUpdateStatus(item.id, "IN_TRANSIT")}>
                      {actionLoadingId === item.id ? "Starting..." : "Start GPS Transit"}
                    </button>
                  )}
                  {isInTransit && (
                    <button className="btn-primary" style={{ padding: "6px 14px", fontSize: "12px", background: "#059669" }} disabled={actionLoadingId === item.id} onClick={() => handleUpdateStatus(item.id, "DELIVERED")}>
                      {actionLoadingId === item.id ? "Updating..." : "Mark Delivered & Handover"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="owner-pipeline-card">
        <div className="section-title-group" style={{ marginBottom: "16px" }}>
          <h3>Driver Performance &amp; Quick Actions</h3>
          <p>Verified driver payout rates and protocol checklists</p>
        </div>
        <div style={{ background: "var(--primary-50)", border: "1px solid var(--primary-200)", padding: "16px", borderRadius: "var(--radius-md)", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--primary-800)", textTransform: "uppercase" }}>Fixed Logistics Rate</span>
              <strong style={{ fontSize: "20px", display: "block", color: "var(--primary-900)" }}>₹600 / Delivery</strong>
            </div>
            <ShieldCheck size={28} style={{ color: "var(--primary-600)" }} />
          </div>
          <small style={{ color: "var(--primary-700)", display: "block", marginTop: "4px" }}>Direct payment credited to your bank upon farmer digital handover signoff.</small>
        </div>
        <div className="pipeline-item">
          <div className="pipeline-left">
            <CheckCircle2 size={18} style={{ color: "var(--primary-600)" }} />
            <div>
              <strong>Pre-Transit Depot Checklist</strong>
              <p style={{ fontSize: "12px", color: "var(--slate-500)" }}>Tire pressure, hydraulic oil, implement pin lock</p>
            </div>
          </div>
        </div>
        <div className="pipeline-item">
          <div className="pipeline-left">
            <CheckCircle2 size={18} style={{ color: "var(--primary-600)" }} />
            <div>
              <strong>Safety Escrow Handover Protocol</strong>
              <p style={{ fontSize: "12px", color: "var(--slate-500)" }}>Confirm delivery coordinates with farmer on field</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Role workspace detail ────────────────────────────────────────────────────
function RoleWorkspaceDetail({ role, navigateTo, t }) {
  if (role === "Machinery Owner") {
    return (
      <div className="two-col-grid">
        <section className="owner-pipeline-card">
          <div className="section-title-group" style={{ marginBottom: "16px" }}>
            <h3>Pending Rental Requests</h3>
            <p>Review &amp; confirm bookings to lock schedules</p>
          </div>
          {[
            { machine: "Mahindra 575 DI XP Plus", detail: "Ravi Kumar · 12 Aug (6 hrs) · Vallam Road", amount: "₹7,500" },
            { machine: "Shaktiman Rotavator 7ft", detail: "Kavitha Farm · 14 Aug (8 hrs) · Papanasam", amount: "₹6,000" },
          ].map(({ machine, detail, amount }) => (
            <div key={machine} className="pipeline-item">
              <div className="pipeline-left">
                <div className="status-icon-box"><Tractor size={20} /></div>
                <div>
                  <strong>{machine}</strong>
                  <p style={{ fontSize: "12px", color: "var(--slate-500)" }}>{detail}</p>
                </div>
              </div>
              <div className="pipeline-actions">
                <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>Decline</button>
                <button className="btn-primary" style={{ padding: "6px 14px", fontSize: "12px" }}>Accept ({amount})</button>
              </div>
            </div>
          ))}
        </section>
        <section className="owner-pipeline-card">
          <div className="section-title-group" style={{ marginBottom: "16px" }}>
            <h3>Fleet Health &amp; Telematics</h3>
            <p>Real-time equipment status and scheduled maintenance</p>
          </div>
          {[
            { machine: "Mahindra 575 DI (TN-49-AB-1024)", detail: "Next Service in 45 engine hours · Battery 96%", status: t.badges_verified, highlight: true },
            { machine: "John Deere 5310 (TN-49-CD-3890)", detail: "Maintenance check cleared yesterday", status: "Idle at Depot", highlight: false },
          ].map(({ machine, detail, status, highlight }) => (
            <div key={machine} className="pipeline-item">
              <div>
                <strong>{machine}</strong>
                <p style={{ fontSize: "12px", color: "var(--slate-500)" }}>{detail}</p>
              </div>
              <span className="machine-status-pill" style={highlight ? {} : { background: "#F1F5F9", color: "#475569", borderColor: "#CBD5E1" }}>{status}</span>
            </div>
          ))}
        </section>
      </div>
    );
  }

  if (role === "Delivery Partner") {
    return <DeliveryPartnerLiveWorkspace navigateTo={navigateTo} t={t} />;
  }

  // Administrator
  return (
    <section className="owner-pipeline-card">
      <div className="section-title-group" style={{ marginBottom: "16px" }}>
        <h3>Platform Compliance &amp; Safety Audits</h3>
        <p>Verification queue for new equipment listings and dispute resolutions</p>
      </div>
      <div className="pipeline-item">
        <div>
          <strong>Preet 987 Harvester - Document Verification</strong>
          <p style={{ fontSize: "12px", color: "var(--slate-500)" }}>Owner: Thanjavur Delta Harvesters · RC Book &amp; Insurance submitted</p>
        </div>
        <button className="btn-primary" style={{ padding: "6px 14px", fontSize: "12px" }}>Approve Listing</button>
      </div>
      <div className="pipeline-item">
        <div>
          <strong>Operator Certification Audit - 4 Applicants</strong>
          <p style={{ fontSize: "12px", color: "var(--slate-500)" }}>Tamil Nadu Agriculture University Certification Review</p>
        </div>
        <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: "12px" }}>Review Badges</button>
      </div>
    </section>
  );
}

// ─── Main DashboardScreen ─────────────────────────────────────────────────────
export default function DashboardScreen({ role, navigateTo, t }) {
  const roleConfig = useRoleConfig(role, t);

  const roleNameDisplay = {
    Farmer: t.role_Farmer,
    "Machinery Owner": t.role_MachineryOwner,
    "Delivery Partner": t.role_DeliveryPartner,
    Administrator: t.role_Administrator,
  }[role] || role;

  return (
    <div className="screen">
      {/* ENTERPRISE HERO BANNER */}
      <section className="hero-banner">
        <div>
          <div className="hero-tag">
            <span>✨</span>
            <span>{roleNameDisplay} {t.portalDeltaTag}</span>
          </div>
          <h2>{roleConfig.greeting}</h2>
          <p>{roleConfig.subtitle}</p>
          <div className="hero-actions">
            <button className="btn-primary btn-lg" onClick={() => navigateTo(role === "Farmer" ? "machines" : "booking")}>
              <Search size={16} />
              {role === "Farmer" ? t.findVerifiedMachinery : t.manageActiveOperations}
            </button>
            <button className="btn-secondary" onClick={() => navigateTo("tracking")}>
              <Truck size={16} />
              {t.viewLiveTelematics}
            </button>
          </div>
        </div>

        {/* WEATHER & TELEMETRY WIDGET */}
        <div className="hero-telemetry-box">
          <div className="weather-badge">
            <div className="weather-info">
              <SunMedium size={28} style={{ color: "var(--amber-500)" }} />
              <div>
                <span className="weather-temp">31°C</span>
                <span className="weather-desc"> · {t.weatherSunny}</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "12px", color: "var(--primary-400)", fontWeight: 600, display: "block" }}>{t.idealFieldWork}</span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>{t.weatherLocation}</span>
            </div>
          </div>
          <div className="telemetry-row">
            <div className="telemetry-item"><small>{t.soilMoisture}</small><strong>{t.soilMoistureVal}</strong></div>
            <div className="telemetry-item"><small>{t.windSpeed}</small><strong>{t.windSpeedVal}</strong></div>
          </div>
        </div>
      </section>

      {/* METRICS / KPI GRID */}
      <section className="metrics-grid">
        {roleConfig.metrics.map((metric) => {
          const IconComp = metric.icon;
          return (
            <article key={metric.label} className="metric-card">
              <div className={`metric-icon-box ${metric.type}`}><IconComp size={22} /></div>
              <div className="metric-data">
                <div className="metric-value">{metric.value}</div>
                <div className="metric-label">{metric.label}</div>
                <div className="metric-trend"><TrendingUp size={12} /><span>{metric.trend}</span></div>
              </div>
            </article>
          );
        })}
      </section>

      {/* FARMER: recommended equipment + active dispatch tracker */}
      {role === "Farmer" && (
        <div className="two-col-grid">
          <section>
            <div className="section-header">
              <div className="section-title-group">
                <h3>{t.recommendedMachinery}</h3>
                <p>{t.recommendedSubtitle}</p>
              </div>
              <button className="section-link-btn" onClick={() => navigateTo("machines")}>
                {t.viewAll} ({machineryData.length}) <ChevronRight size={14} />
              </button>
            </div>
            <div className="machine-list">
              {machineryData.slice(0, 2).map((machine) => (
                <MachineCardPro key={machine.id} machine={machine} onBook={() => navigateTo("booking", machine)} t={t} />
              ))}
            </div>
          </section>

          <section>
            <div className="section-header">
              <div className="section-title-group">
                <h3>{t.activeBookingStatus}</h3>
                <p>{t.activeBookingSubtitle}</p>
              </div>
              <button className="section-link-btn" onClick={() => navigateTo("tracking")}>
                {t.fullGpsScreen} <ChevronRight size={14} />
              </button>
            </div>

            <article className="status-card-pro">
              <div className="status-card-header">
                <div className="status-machine-info">
                  <div className="status-icon-box"><Tractor size={22} /></div>
                  <div>
                    <span className="status-machine-title">Mahindra 575 DI XP Plus</span>
                    <span className="status-sub">{t.assignedDeliveryPartner}: Suresh Kumar · 6 {t.hours}</span>
                  </div>
                </div>
                <span className="badge-in-transit">
                  <span className="live-pulse" /> {t.inTransit}
                </span>
              </div>

              {/* TIMELINE STEPPER */}
              <div className="stepper-pro">
                <div className="stepper-track" />
                <div className="stepper-progress" />
                {[
                  { label: t.orderConfirmed, done: true },
                  { label: t.depotInspection, done: true },
                  { label: t.inTransit, current: true, icon: <Truck size={14} /> },
                  { label: t.farmHandover, num: "4" },
                ].map((step, i) => (
                  <div key={i} className={`step-node ${step.done ? "completed" : step.current ? "current" : ""}`}>
                    <div className="step-dot">
                      {step.done ? <Check size={14} /> : step.icon || step.num || i + 1}
                    </div>
                    <span className="step-title">{step.label}</span>
                  </div>
                ))}
              </div>

              {/* ETA */}
              <div className="eta-banner">
                <div className="eta-left">
                  <MapPin size={18} style={{ color: "var(--primary-600)" }} />
                  <div className="eta-text">
                    <small>{t.farmHandover}</small>
                    <strong>{t.farmHandoverSub} (28 mins remaining)</strong>
                  </div>
                </div>
                <button className="btn-primary" onClick={() => navigateTo("tracking")}>{t.fullGpsScreen}</button>
              </div>
            </article>
          </section>
        </div>
      )}

      {role !== "Farmer" && <RoleWorkspaceDetail role={role} navigateTo={navigateTo} t={t} />}
    </div>
  );
}
