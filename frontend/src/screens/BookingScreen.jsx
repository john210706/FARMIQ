import React, { useState } from "react";
import { MapPin, CheckCircle, ShieldCheck, ArrowRight, CreditCard, ChevronRight } from "lucide-react";
import { machineryData } from "../data/machineryData";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function BookingScreen({ selectedMachine, navigateTo, setBookingDraft, t }) {
  const machine = selectedMachine || machineryData[0];
  const [rentalDate, setRentalDate] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("08:00");
  const [durationHours, setDurationHours] = useState(6);
  const [includeOperator, setIncludeOperator] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState("Ravi Kumar's Farm, Survey No 142/3, Vallam Road, Thanjavur");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const baseRental = machine.pricePerHour * durationHours;
  const operatorFee = includeOperator ? 180 * durationHours : 0;
  const deliveryLogistics = 600;
  const seasonalDiscount = 500;
  const grandTotal = baseRental + operatorFee + deliveryLogistics - seasonalDiscount;
  const advanceAmount = Math.round(grandTotal * 0.5);
  const balanceOnDelivery = grandTotal - advanceAmount;

  if (isSubmitted) {
    return (
      <div className="screen" style={{ maxWidth: "640px", margin: "40px auto", textAlign: "center" }}>
        <div style={{ width: "72px", height: "72px", background: "var(--primary-50)", color: "var(--primary-600)", borderRadius: "var(--radius-full)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
          <CheckCircle size={40} />
        </div>
        <span className="topbar-subtitle">RESERVATION CONFIRMED</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "32px", fontWeight: 700, margin: "8px 0" }}>Booking Request #FQ-2051 Created</h2>
        <p style={{ color: "var(--slate-600)", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>
          Your request has been dispatched to <strong>{machine.owner}</strong>. Complete the 50% advance payment to lock delivery schedule.
        </p>
        <div style={{ background: "var(--white)", border: "1px solid var(--slate-200)", borderRadius: "var(--radius-lg)", padding: "20px", textAlign: "left", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", borderBottom: "1px solid var(--slate-100)", paddingBottom: "12px" }}>
            <div>
              <strong style={{ fontSize: "16px", color: "var(--slate-900)" }}>{machine.name}</strong>
              <p style={{ fontSize: "12px", color: "var(--slate-500)" }}>{rentalDate} · {startTime} ({durationHours} {t.hours})</p>
            </div>
            <span className="machine-status-pill">{t.advanceTokenRequired}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
            <div>
              <span style={{ color: "var(--slate-500)", display: "block" }}>{t.advanceTokenRequired}</span>
              <strong style={{ fontSize: "18px", color: "var(--primary-700)" }}>₹{advanceAmount.toLocaleString("en-IN")}</strong>
            </div>
            <div>
              <span style={{ color: "var(--slate-500)", display: "block" }}>{t.remainingPayable}</span>
              <strong style={{ fontSize: "18px", color: "var(--slate-900)" }}>₹{balanceOnDelivery.toLocaleString("en-IN")}</strong>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button className="btn-primary btn-lg" onClick={() => navigateTo("payments")}>
            <CreditCard size={18} />
            <span>{t.paySecurelyBtn}</span>
          </button>
          <button className="btn-secondary" onClick={() => setIsSubmitted(false)}>{t.changeMachine}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="marketplace-header">
        <span className="topbar-subtitle">{t.bookingSub}</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, margin: "4px 0 8px" }}>{t.bookingHeading}</h2>
        <p style={{ color: "var(--slate-500)", fontSize: "14px" }}>{t.bookingDescription}</p>
      </div>

      <div className="booking-grid">
        {/* FORM PANEL */}
        <section className="form-panel">
          <div className="selected-machine-banner">
            <div className="selected-machine-meta">
              <img src={machine.image} alt={machine.name} className="selected-thumb" />
              <div>
                <span className="topbar-subtitle" style={{ fontSize: "10px" }}>{t.marketplaceSub}</span>
                <strong style={{ fontSize: "15px", display: "block", color: "var(--slate-900)" }}>{machine.name}</strong>
                <p style={{ fontSize: "12px", color: "var(--slate-500)" }}>{machine.owner} · {machine.distance}</p>
              </div>
            </div>
            <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => navigateTo("machines")}>
              {t.changeMachine}
            </button>
          </div>

          <h3 className="form-panel-title">{t.bookingDetailsHeader}</h3>
          <div className="form-row-2">
            <div className="form-group">
              <label>{t.selectWorkDate}</label>
              <input type="date" className="form-control" value={rentalDate} onChange={(e) => setRentalDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>{t.startTime}</label>
              <input type="time" className="form-control" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
          </div>

          <div className="range-slider-wrapper">
            <div className="range-slider-header">
              <span>{t.rentalDurationHours}</span>
              <strong style={{ color: "var(--primary-700)" }}>{durationHours} {t.hours} (Est. {Math.round(durationHours * 1.2)} Acres)</strong>
            </div>
            <input type="range" min="2" max="16" step="1" className="range-input" value={durationHours} onChange={(e) => setDurationHours(Number(e.target.value))} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--slate-400)", marginTop: "6px" }}>
              <span>2 {t.hours}</span><span>8 {t.hours}</span><span>16 {t.hours}</span>
            </div>
          </div>

          <h3 className="form-panel-title" style={{ marginTop: "24px" }}>2. Destination</h3>
          <div className="form-group">
            <label>Farm Address</label>
            <div style={{ position: "relative" }}>
              <input type="text" className="form-control" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} style={{ paddingLeft: "36px" }} />
              <MapPin size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--primary-600)" }} />
            </div>
          </div>

          <label className="checkbox-card">
            <input type="checkbox" checked={includeOperator} onChange={(e) => setIncludeOperator(e.target.checked)} />
            <div className="checkbox-text">
              <strong>{t.addOperatorOption}</strong>
              <small>{t.addOperatorSub}</small>
            </div>
          </label>
        </section>

        {/* SUMMARY SIDEBAR */}
        <aside className="summary-panel">
          <span className="summary-eyebrow">{t.transparentPricing}</span>
          <h3 className="summary-title">{t.costBreakdown}</h3>

          <div className="summary-row">
            <span>{t.machineryRentalFee} ({durationHours} {t.hours} × ₹{machine.pricePerHour})</span>
            <strong>₹{baseRental.toLocaleString("en-IN")}</strong>
          </div>
          <div className="summary-row">
            <span>{t.deliveryLogisticsFee}</span>
            <strong>₹{deliveryLogistics.toLocaleString("en-IN")}</strong>
          </div>
          {includeOperator && (
            <div className="summary-row">
              <span>{t.certifiedOperatorFee} ({durationHours} {t.hours} × ₹180)</span>
              <strong>₹{operatorFee.toLocaleString("en-IN")}</strong>
            </div>
          )}
          <div className="summary-row discount">
            <span>{t.promoDiscount}</span>
            <strong>−₹{seasonalDiscount.toLocaleString("en-IN")}</strong>
          </div>
          <hr className="summary-divider" />
          <div className="summary-total">
            <span>{t.estimatedTotal}</span>
            <strong>₹{grandTotal.toLocaleString("en-IN")}</strong>
          </div>

          <div style={{ background: "var(--primary-50)", border: "1px solid var(--primary-200)", borderRadius: "var(--radius-md)", padding: "12px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 700, color: "var(--primary-900)" }}>
              <span>{t.advanceTokenRequired}</span>
              <span>₹{advanceAmount.toLocaleString("en-IN")}</span>
            </div>
            <p style={{ fontSize: "11px", color: "var(--primary-800)", marginTop: "4px" }}>{t.remainingPayable}</p>
          </div>

          <div className="security-note">
            <ShieldCheck size={18} style={{ color: "var(--primary-600)", flexShrink: 0 }} />
            <span>{t.escrowGuaranteeText}</span>
          </div>

          <button className="btn-primary btn-full btn-lg" onClick={() => {
            setBookingDraft({ rentalDate, startTime, durationHours, includeOperator, deliveryAddress, farmLat: 10.7905, farmLng: 79.1378 });
            setIsSubmitted(true);
          }}>
            <span>{t.confirmRequestBtn}</span>
            <ArrowRight size={16} />
          </button>
        </aside>
      </div>
    </div>
  );
}
