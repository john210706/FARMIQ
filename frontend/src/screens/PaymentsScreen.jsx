import React, { useState, useMemo } from "react";
import { ShieldCheck, CheckCircle2, Truck, CreditCard, IndianRupee, User, Wrench, PhoneCall } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function PaymentsScreen({ navigateTo, selectedMachine, bookingDraft, session, t }) {
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const paymentMethods = useMemo(() => [
    { id: "upi",  name: t.methodUpiTitle,  note: t.methodUpiNote,  icon: IndianRupee, badge: t.methodUpiBadge },
    { id: "card", name: t.methodCardTitle, note: t.methodCardNote, icon: CreditCard },
    { id: "cash", name: t.methodCashTitle, note: t.methodCashNote, icon: User },
  ], [t]);

  const handlePay = async () => {
    setIsProcessing(true);
    setPaymentError("");
    try {
      let token = session?.token;

      // Auto-authenticate demo farmer if token missing
      if (!token) {
        try {
          const authRes = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accountId: "FARM-001", password: "FarmIQ@F01" }),
          });
          if (authRes.ok) {
            const authData = await authRes.json();
            token = authData.token;
            localStorage.setItem("farmiqSession", JSON.stringify(authData));
          }
        } catch (authErr) {
          console.warn("Auto-login failed:", authErr);
        }
      }

      const draft = bookingDraft || {
        rentalDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        startTime: "08:00",
        durationHours: 6,
        includeOperator: true,
        deliveryAddress: "Vallam Road, Thanjavur",
        farmLat: 10.7905,
        farmLng: 79.1378,
      };

      const res = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          farmLat: draft.farmLat,
          farmLng: draft.farmLng,
          farmAddress: draft.deliveryAddress,
          machineryId: selectedMachine?.id || "mach-001",
          scheduledAt: `${draft.rentalDate}T${draft.startTime}:00+05:30`,
          durationHours: draft.durationHours,
          includeOperator: draft.includeOperator,
          paymentMethod: selectedMethod,
        }),
      });

      // If expired, re-auth once
      if (res.status === 401) {
        const reAuthRes = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId: "FARM-001", password: "FarmIQ@F01" }),
        });
        if (reAuthRes.ok) {
          const reAuthData = await reAuthRes.json();
          token = reAuthData.token;
          localStorage.setItem("farmiqSession", JSON.stringify(reAuthData));
          const retryRes = await fetch(`${API_URL}/api/bookings`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              farmLat: draft.farmLat, farmLng: draft.farmLng, farmAddress: draft.deliveryAddress,
              machineryId: selectedMachine?.id || "mach-001",
              scheduledAt: `${draft.rentalDate}T${draft.startTime}:00+05:30`,
              durationHours: draft.durationHours, includeOperator: draft.includeOperator, paymentMethod: selectedMethod,
            }),
          });
          const retryData = await retryRes.json();
          if (!retryRes.ok) throw new Error(retryData.error || "Booking could not be created");
          setIsProcessing(false);
          setIsSuccess(true);
          return;
        }
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking could not be created");
      setIsProcessing(false);
      setIsSuccess(true);
    } catch (err) {
      console.error("Payment API Error", err);
      setPaymentError(err.message);
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="screen" style={{ maxWidth: "600px", margin: "40px auto", textAlign: "center" }}>
        <div style={{ width: "72px", height: "72px", background: "var(--primary-50)", color: "var(--primary-600)", borderRadius: "var(--radius-full)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
          <CheckCircle2 size={40} />
        </div>
        <span className="topbar-subtitle">{t.paymentSuccessful}</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "30px", fontWeight: 700, margin: "8px 0" }}>{t.advanceProtectedEscrow}</h2>
        <p style={{ color: "var(--slate-600)", fontSize: "14px", marginBottom: "24px" }}>
          {t.transactionRef} <strong>TXN_FQ98472901</strong>. {t.escrowLockedNotice}
        </p>
        <button className="btn-primary btn-lg" onClick={() => navigateTo("tracking")}>
          <Truck size={18} />
          <span>{t.trackLiveGpsBtn}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="marketplace-header">
        <span className="topbar-subtitle">{t.paymentsSub}</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, margin: "4px 0 8px" }}>{t.paymentsHeading}</h2>
        <p style={{ color: "var(--slate-500)", fontSize: "14px" }}>{t.paymentsDescription}</p>
      </div>

      <div className="booking-grid">
        <section className="form-panel">
          <div style={{ background: "var(--primary-50)", border: "1px solid var(--primary-200)", padding: "16px", borderRadius: "var(--radius-md)", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="topbar-subtitle" style={{ fontSize: "10px" }}>{t.amountPayableNow}</span>
              <strong style={{ fontSize: "24px", color: "var(--primary-900)", display: "block" }}>₹4,340.00</strong>
              <small style={{ color: "var(--primary-700)" }}>{t.advanceTokenFor} Mahindra 575 DI (6 {t.hours})</small>
            </div>
            <ShieldCheck size={32} style={{ color: "var(--primary-700)" }} />
          </div>

          <h3 className="form-panel-title">{t.selectPaymentMethod}</h3>
          {paymentMethods.map((pm) => {
            const IconComponent = pm.icon;
            const isSelected = selectedMethod === pm.id;
            return (
              <button key={pm.id} className={`payment-method-card ${isSelected ? "selected" : ""}`} onClick={() => setSelectedMethod(pm.id)}>
                <div className="payment-method-left">
                  <span className="payment-radio-indicator" />
                  <div>
                    <strong style={{ fontSize: "14px", color: "var(--slate-900)", display: "block" }}>{pm.name}</strong>
                    <small style={{ fontSize: "12px", color: "var(--slate-500)" }}>{pm.note}</small>
                  </div>
                </div>
                <IconComponent size={20} style={{ color: "var(--slate-400)" }} />
              </button>
            );
          })}

          <button className="btn-primary btn-full btn-lg" style={{ marginTop: "16px" }} onClick={handlePay} disabled={isProcessing}>
            {isProcessing ? (
              <span>{t.processingPayment}</span>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>{t.paySecurelyBtn}</span>
              </>
            )}
          </button>
          {paymentError && <p style={{ color: "#b42318", fontSize: "12px", marginTop: "10px" }}>{paymentError}</p>}
        </section>

        {/* TRUST SIDEBAR */}
        <aside className="trust-hero-card">
          <span className="summary-eyebrow" style={{ color: "var(--primary-400)" }}>FARMIQ PROTECTION</span>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, margin: "6px 0 16px" }}>{t.guaranteedTrustTitle}</h3>
          <div className="trust-item"><ShieldCheck size={24} /><div><strong>{t.escrowProtectionTitle}</strong><p>{t.escrowProtectionDesc}</p></div></div>
          <div className="trust-item"><Wrench size={24} /><div><strong>{t.onFieldReplacementTitle}</strong><p>{t.onFieldReplacementDesc}</p></div></div>
          <div className="trust-item"><PhoneCall size={24} /><div><strong>{t.liveTeleSupportTitle}</strong><p>{t.liveTeleSupportDesc}</p></div></div>
        </aside>
      </div>
    </div>
  );
}
