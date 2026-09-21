import React, { useState } from 'react';
import { api } from '../lib/api';
import { Form, Field, Button } from '../ui';
export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login'),
    [challenge, setChallenge] = useState(null),
    [purpose, setPurpose] = useState('LOGIN');
  return (
    <div className="auth-layout">
      <section className="auth-story">
        <span className="eyebrow">FARMIQ / COMMUNITY MACHINERY</span>
        <h1>
          Good equipment.
          <br />
          Within reach.
        </h1>
        <p>Find the right machine, coordinate its journey and get back to growing.</p>
        <div className="auth-points">
          <span>01 &nbsp; Local equipment, clear prices</span>
          <span>02 &nbsp; Approval before payment</span>
          <span>03 &nbsp; Inspected at every handover</span>
        </div>
        <p className="muted">Academic sandbox available. No escrow or insurance guarantee.</p>
      </section>
      <section className="panel auth-card">
        <div className="tabs">
          <Button secondary={mode !== 'login'} onClick={() => setMode('login')}>
            Sign in
          </Button>
          <Button secondary={mode !== 'register'} onClick={() => setMode('register')}>
            Create account
          </Button>
          <Button secondary={mode !== 'otp'} onClick={() => setMode('otp')}>
            SMS / reset
          </Button>
        </div>
        <h2>
          {mode === 'register'
            ? 'Join your farming community'
            : mode === 'otp'
              ? 'Verify your mobile'
              : 'Welcome back'}
        </h2>
        {mode === 'login' && (
          <Form
            label="Sign in"
            onSubmit={async (data) => onLogin(await api('/auth/login', { method: 'POST', body: data }))}
          >
            <Field label="Mobile number or account ID" name="accountId" autoComplete="username" required />
            <Field
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </Form>
        )}
        {mode === 'register' && (
          <Form
            label="Create account"
            onSubmit={async (data) => onLogin(await api('/auth/register', { method: 'POST', body: data }))}
          >
            <Field label="Full name" name="fullName" autoComplete="name" required />
            <Field
              label="Mobile number with country code"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+919876543210"
              required
            />
            <Field
              label="Password (at least 10 characters)"
              name="password"
              type="password"
              minLength="10"
              autoComplete="new-password"
              required
            />
            <Field label="Your role">
              <select name="role">
                <option value="FARMER">Farmer</option>
                <option value="OWNER">Machinery owner</option>
                <option value="DRIVER">Delivery partner</option>
              </select>
            </Field>
            <Field label="Preferred language">
              <select name="language">
                <option value="en">English</option>
                <option value="ta">தமிழ்</option>
                <option value="hi">हिन्दी</option>
              </select>
            </Field>
            <p className="muted">Owners and drivers need administrator verification before accepting work.</p>
          </Form>
        )}
        {mode === 'otp' &&
          (!challenge ? (
            <Form
              label="Send verification code"
              onSubmit={async (data) => {
                setPurpose(data.purpose);
                setChallenge((await api('/auth/challenge', { method: 'POST', body: data })).challengeId);
              }}
            >
              <Field label="Mobile number" name="phone" type="tel" required />
              <Field label="Purpose">
                <select name="purpose">
                  <option value="LOGIN">Sign in with SMS</option>
                  <option value="RESET">Reset password</option>
                </select>
              </Field>
              <p className="muted">SMS requires a configured provider.</p>
            </Form>
          ) : (
            <Form
              label="Verify code"
              onSubmit={async (data) =>
                onLogin(
                  await api('/auth/challenge/verify', {
                    method: 'POST',
                    body: { ...data, challengeId: challenge },
                  }),
                )
              }
            >
              <Field label="Six-digit code" name="code" inputMode="numeric" pattern="[0-9]{6}" required />
              {purpose === 'RESET' && (
                <Field label="New password" name="password" type="password" minLength="10" required />
              )}
            </Form>
          ))}
      </section>
    </div>
  );
}
