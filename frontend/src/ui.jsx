import React, { useEffect, useState } from 'react';
import { api } from './lib/api';
import { tr } from './i18n';
export class PageBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="notice error" role="alert">
        <p>{tr('This page could not load. Reconnect and reload the page.')}</p>
        <Button secondary onClick={() => window.location.reload()}>
          {tr('Try again')}
        </Button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export function useData(path, version = 0, retainPrevious = false) {
  const [data, setData] = useState(null),
    [error, setError] = useState(''),
    [attempt, setAttempt] = useState(0);
  const reload = () => setAttempt((value) => value + 1);
  useEffect(() => {
    window.addEventListener('online', reload);
    return () => window.removeEventListener('online', reload);
  }, []);
  useEffect(() => {
    let live = true;
    const controller = new AbortController();
    if (!retainPrevious) setData(null);
    setError('');
    if (!path) return;
    api(path, { signal: controller.signal })
      .then((v) => live && setData(v))
      .catch((e) => live && e.name !== 'AbortError' && setError(e.message));
    return () => {
      live = false;
      controller.abort();
    };
  }, [path, version, retainPrevious, attempt]);
  return { data, error, setData, reload };
}
export function State({ data, error, children, retry }) {
  if (error)
    return (
      <div className="notice error" role="alert">
        {tr(error)}
        {retry && (
          <Button secondary onClick={retry}>
            {tr('Try again')}
          </Button>
        )}
      </div>
    );
  if (data === null)
    return (
      <div className="skeleton" aria-label="Loading" role="status">
        {tr('Loading…')}
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
  return <span className="pill">{tr(String(children)).replaceAll('_', ' ')}</span>;
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
        {busy ? tr('Working…') : children}
      </Button>
      {error && (
        <span className="inline-error" role="alert">
          {tr(error)}
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
      onInvalid={(e) => {
        const validity = e.target.validity;
        const message = validity.valueMissing
          ? 'Please complete this field.'
          : validity.patternMismatch
            ? 'Please match the requested format.'
            : validity.tooShort
              ? 'The value is too short.'
              : validity.rangeOverflow || validity.rangeUnderflow
                ? 'The value is outside the allowed range.'
                : 'Please enter a valid value.';
        e.target.setCustomValidity(tr(message));
      }}
      onInput={(e) => e.target.setCustomValidity?.('')}
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
          {tr(error)}
        </p>
      )}
      <Button type="submit" disabled={busy} secondary={secondary}>
        {busy ? tr('Saving…') : label}
      </Button>
    </form>
  );
}
