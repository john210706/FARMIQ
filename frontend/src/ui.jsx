import React, { useEffect, useState } from 'react';
import { api } from './lib/api';
export function useData(path, version = 0) {
  const [data, setData] = useState(null),
    [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    setData(null);
    setError('');
    if (!path) return;
    api(path)
      .then((v) => live && setData(v))
      .catch((e) => live && setError(e.message));
    return () => {
      live = false;
    };
  }, [path, version]);
  return { data, error, setData };
}
export function State({ data, error, children }) {
  if (error)
    return (
      <p className="notice error" role="alert">
        {error}
      </p>
    );
  if (data === null)
    return (
      <div className="skeleton" aria-label="Loading" role="status">
        Loading…
      </div>
    );
  return children;
}
export function Field({ label, children, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children || <input {...props} />}
    </label>
  );
}
export function Button({ children, secondary = false, ...props }) {
  return (
    <button type="button" className={secondary ? 'button secondary' : 'button'} {...props}>
      {children}
    </button>
  );
}
export function Panel({ title, children, actions }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}
export function Badge({ children }) {
  return <span className="pill">{String(children).replaceAll('_', ' ')}</span>;
}
export function Empty({ children }) {
  return <div className="empty">{children}</div>;
}
export function Action({ run, children, done, secondary = false, disabled = false }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  return (
    <>
      <Button
        secondary={secondary}
        disabled={busy || disabled}
        onClick={async () => {
          setBusy(true);
          setError('');
          try {
            const value = await run();
            done?.(value);
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? 'Working…' : children}
      </Button>
      {error && (
        <span className="inline-error" role="alert">
          {error}
        </span>
      )}
    </>
  );
}
export function Form({ onSubmit, children, label = 'Save', secondary = false }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        setError('');
        setBusy(true);
        try {
          await onSubmit(Object.fromEntries(new FormData(form)), form);
        } catch (err) {
          setError(err.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      {children}
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy} secondary={secondary}>
        {busy ? 'Saving…' : label}
      </Button>
    </form>
  );
}
