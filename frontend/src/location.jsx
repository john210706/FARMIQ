import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from './ui';
import { api } from './lib/api';

export function currentLocation() {
  if (!navigator.geolocation) return Promise.reject(new Error('Location is not available on this device'));
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      (error) =>
        reject(
          new Error(
            error.code === error.PERMISSION_DENIED
              ? 'Allow location access in your browser to continue'
              : 'Current location could not be detected. Try again outdoors.',
          ),
        ),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    ),
  );
}

export function LocationPicker({
  value,
  onChange,
  onAddress,
  label = 'Use current location',
  automatic = true,
}) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const change = useRef(onChange);
  const addressChange = useRef(onAddress);
  addressChange.current = onAddress;
  const automaticallyLocated = useRef(false);
  change.current = onChange;
  const locate = useCallback(async () => {
    setStatus('Detecting location…');
    setBusy(true);
    try {
      const point = await currentLocation();
      await change.current(point);
      setStatus('Location captured automatically');
      if (addressChange.current) {
        try {
          const result = await api(`/location/address?${new URLSearchParams(point)}`);
          addressChange.current(result.address);
          setStatus('Location and address updated. Check the address and add a landmark if needed.');
        } catch {
          setStatus('Location captured. Address lookup is unavailable; please enter a nearby landmark.');
        }
      }
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }, []);
  useEffect(() => {
    if (automatic && !automaticallyLocated.current) {
      automaticallyLocated.current = true;
      locate();
    }
  }, [automatic, locate]);
  return (
    <div className="stack">
      <Button secondary onClick={locate} disabled={busy}>
        {value ? 'Update current location' : label}
      </Button>
      {onAddress && <small className="muted">Address lookup: © OpenStreetMap contributors</small>}
      {status && (
        <p className={value ? 'muted' : 'notice'} role="status">
          {status}
        </p>
      )}
    </div>
  );
}
