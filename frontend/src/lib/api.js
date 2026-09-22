export const API = import.meta.env.VITE_API_URL || '';
import { getLanguage, localeFor, tr, trError } from '../i18n';
export function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem('farmiqSession') || 'null');
  } catch {
    return null;
  }
}
export function saveSession(value) {
  if (value) sessionStorage.setItem('farmiqSession', JSON.stringify(value));
  else sessionStorage.removeItem('farmiqSession');
  localStorage.removeItem('farmiqSession');
}
export async function api(path, options = {}) {
  const token = getSession()?.token;
  const form = options.body instanceof FormData;
  const response = await fetch(`${API}/api${path}`, {
    ...options,
    headers: {
      ...(form ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Accept-Language': getLanguage(),
      ...options.headers,
    },
    body: options.body === undefined ? undefined : form ? options.body : JSON.stringify(options.body),
  });
  const data = await response.json().catch(() => ({ error: 'Unexpected server response' }));
  if (response.status === 401) {
    saveSession(null);
    window.dispatchEvent(new Event('session-expired'));
  }
  if (!response.ok)
    throw Object.assign(new Error(trError(data.error || 'Request failed')), { status: response.status });
  return data;
}
export const money = (value) =>
  new Intl.NumberFormat(localeFor(), { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(
    Number(value || 0),
  );
export const when = (value) =>
  new Date(value).toLocaleString(localeFor(), { dateStyle: 'medium', timeStyle: 'short' });
export function download(name, text, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function openDocument(id) {
  const r = await fetch(`${API}/api/documents/${id}`, {
    headers: { Authorization: `Bearer ${getSession()?.token}` },
  });
  if (!r.ok) throw new Error(tr('File unavailable'));
  const url = URL.createObjectURL(await r.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = 'FarmIQ-document';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function upload(file, kind) {
  const body = new FormData();
  body.append('file', file);
  body.append('kind', kind);
  return api('/documents', { method: 'POST', body });
}
export async function pay(bookingId, kind) {
  const data = await api(`/bookings/${bookingId}/payments`, {
    method: 'POST',
    body: { kind, idempotencyKey: crypto.randomUUID() },
  });
  if (data.mode !== 'razorpay' || data.transaction.status === 'PAID') return data;
  if (!window.Razorpay)
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = resolve;
      s.onerror = () => reject(new Error(tr('Payment checkout could not load')));
      document.head.append(s);
    });
  return new Promise((resolve, reject) =>
    new window.Razorpay({
      key: data.key,
      order_id: data.orderId,
      amount: data.amount,
      currency: 'INR',
      name: 'FarmIQ',
      description: kind === 'ADVANCE' ? tr('50% booking advance') : tr('Booking balance'),
      handler: () =>
        resolve({ message: tr('Payment submitted. Confirmation appears after the provider webhook.') }),
      modal: { ondismiss: () => reject(new Error(tr('Payment window closed; you can retry'))) },
    }).open(),
  );
}
