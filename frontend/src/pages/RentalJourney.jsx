import React from 'react';
import { ClipboardList, ShieldCheck, CreditCard, Truck, KeyRound, Tractor, Camera, Home } from 'lucide-react';
import { tr } from '../i18n';

export default function RentalJourney() {
  return (
    <section className="panel" aria-label={tr('Rental journey')}>
      <h2>Rental journey</h2>
      <ol className="rental-guide">
        {[
          [ClipboardList, 'Request'],
          [ShieldCheck, 'Owner approval'],
          [CreditCard, 'Advance payment'],
          [Truck, 'Driver pickup'],
          [KeyRound, 'Farmer handover'],
          [Tractor, 'Rental use'],
          [Camera, 'Return inspection'],
          [Home, 'Owner handover'],
        ].map(([Icon, label]) => (
          <li key={label}>
            <Icon aria-hidden="true" size={26} />
            <span>{tr(label)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
