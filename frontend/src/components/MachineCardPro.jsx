import React from "react";
import { ShieldCheck, Gauge, MapPin, Star, Fuel, ChevronRight } from "lucide-react";

/**
 * Shared machinery listing card used in DashboardScreen and MachinesScreen.
 * @param {object} machine - Machinery data object
 * @param {function} onBook - Callback when Reserve button is clicked
 * @param {boolean} detailed - Show extended specs tags
 * @param {object} t - Translation strings
 */
export function MachineCardPro({ machine, onBook, detailed = false, t }) {
  return (
    <article className="machine-card-pro">
      <div className="machine-img-wrapper">
        <img src={machine.image} alt={machine.name} className="machine-img" />
        <span className="machine-type-chip">{machine.type}</span>
        {machine.verified && (
          <span className="machine-verified-badge">
            <ShieldCheck size={12} />
            <span>{t.badges_verified}</span>
          </span>
        )}
      </div>

      <div className="machine-body">
        <div>
          <div className="machine-top">
            <div>
              <h3 className="machine-name">{machine.name}</h3>
              <p className="machine-owner">{machine.owner} · {machine.location}</p>
            </div>
            <span className="machine-status-pill">
              <span className="live-pulse" />
              {machine.availabilityStatus}
            </span>
          </div>

          <div className="machine-specs-grid">
            <div className="spec-item">
              <Gauge size={14} />
              <span>{machine.hp} {t.hp}</span>
            </div>
            <div className="spec-item">
              <MapPin size={14} />
              <span>{machine.distance}</span>
            </div>
            <div className="spec-item">
              <Star size={14} style={{ color: "var(--amber-500)", fill: "var(--amber-500)" }} />
              <span><strong>{machine.ownerRating}</strong> ({machine.reviewsCount} {t.reviews})</span>
            </div>
            <div className="spec-item">
              <Fuel size={14} />
              <span>{machine.fuelType}</span>
            </div>
          </div>

          {detailed && machine.specs && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", margin: "6px 0 12px" }}>
              {machine.specs.map((spec) => (
                <span
                  key={spec}
                  style={{
                    background: "var(--slate-100)",
                    color: "var(--slate-700)",
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: "var(--radius-xs)",
                  }}
                >
                  {spec}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="machine-footer">
          <div className="price-box">
            <span className="price-amount">₹{machine.pricePerHour.toLocaleString("en-IN")}</span>
            <span className="price-unit">{t.perHour}</span>
          </div>
          <button className="btn-primary" onClick={onBook}>
            <span>{t.reserveMachineryBtn}</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default MachineCardPro;
