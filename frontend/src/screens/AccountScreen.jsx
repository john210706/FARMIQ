import React, { useState } from "react";
import { Tractor, ArrowRight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function AccountScreen({ navigateTo, onLogin, t }) {
  const [isRegister, setIsRegister] = useState(false);
  const [accountId, setAccountId] = useState("FARM-001");
  const [password, setPassword] = useState("FarmIQ@F01");
  const [fullName, setFullName] = useState("Ravi Kumar");
  const [authError, setAuthError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const submitAccount = async (event) => {
    event.preventDefault();
    setAuthError("");
    if (isRegister) {
      setAuthError("Registration will be added after the demo-account review. Use one of the seeded account IDs for now.");
      return;
    }
    setIsSigningIn(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Sign in failed");
      onLogin(data);
      navigateTo("dashboard");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="screen">
      <div className="auth-split-wrapper">
        {/* BRAND HERO */}
        <section className="auth-hero-panel">
          <div>
            <div className="brand-icon-box" style={{ marginBottom: "24px" }}><Tractor size={28} /></div>
            <span className="hero-tag">{t.heroTagEnterprise}</span>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "36px", fontWeight: 700, margin: "12px 0 16px", lineHeight: "1.2" }}>
              {t.heroHeadingPromise}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px", lineHeight: "1.6" }}>{t.heroPromiseDescription}</p>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px" }}>
            <div style={{ display: "flex", gap: "24px" }}>
              <div>
                <strong style={{ fontSize: "18px", color: "var(--primary-400)", display: "block" }}>1,240+</strong>
                <small style={{ color: "rgba(255,255,255,0.6)" }}>{t.verifiedFarmersStat}</small>
              </div>
              <div>
                <strong style={{ fontSize: "18px", color: "var(--primary-400)", display: "block" }}>100%</strong>
                <small style={{ color: "rgba(255,255,255,0.6)" }}>{t.escrowProtectionStat}</small>
              </div>
            </div>
          </div>
        </section>

        {/* AUTH FORM */}
        <form className="auth-form-panel" onSubmit={submitAccount}>
          <div className="auth-tabs">
            <button type="button" className={`auth-tab-btn ${!isRegister ? "active" : ""}`} onClick={() => setIsRegister(false)}>
              {t.signInTab}
            </button>
            <button type="button" className={`auth-tab-btn ${isRegister ? "active" : ""}`} onClick={() => setIsRegister(true)}>
              {t.newRegistrationTab}
            </button>
          </div>

          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 700, marginBottom: "6px" }}>
            {isRegister ? t.registerHeading : t.signInHeading}
          </h2>
          <p style={{ color: "var(--slate-500)", fontSize: "13px", marginBottom: "20px" }}>
            {isRegister ? t.registerSubText : t.signInSubText}
          </p>

          {isRegister && (
            <div className="form-group">
              <label>{t.selectUserRole}</label>
              <select className="form-control">
                <option>{t.roleOptionFarmer}</option>
                <option>{t.roleOptionOwner}</option>
                <option>{t.roleOptionDriver}</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label>{isRegister ? t.mobileNumberLabel : t.accountIdLabel}</label>
            <input type="text" className="form-control" placeholder={isRegister ? "e.g. 98765 43210" : "e.g. FARM-001"} value={accountId} onChange={(e) => setAccountId(e.target.value)} />
          </div>

          <div className="form-group">
            <label>{isRegister ? t.fullNameLabel : t.passwordLabel}</label>
            <input type={isRegister ? "text" : "password"} className="form-control" placeholder={isRegister ? "Ravi Kumar" : "••••••"} value={isRegister ? fullName : password} onChange={(e) => (isRegister ? setFullName(e.target.value) : setPassword(e.target.value))} />
          </div>

          <button className="btn-primary btn-full btn-lg" style={{ marginTop: "12px" }} disabled={isSigningIn}>
            <span>{isSigningIn ? "..." : t.continueToWorkspaceBtn}</span>
            <ArrowRight size={16} />
          </button>

          {authError && <p style={{ color: "#b42318", fontSize: "12px", marginTop: "12px" }}>{authError}</p>}
          <p style={{ textAlign: "center", fontSize: "11px", color: "var(--slate-400)", marginTop: "16px" }}>{t.termsNoticeText}</p>
        </form>
      </div>
    </div>
  );
}
