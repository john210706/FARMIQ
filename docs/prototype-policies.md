# Prototype policy notes — review before public launch

These describe the current implementation. They are not finalized legal agreements or an assertion of regulatory compliance.

## Rental agreement behaviour

The farmer acknowledges agreement version `2026-09-v1` at request time. Owner approval precedes the 50% advance. A reservation expires 30 minutes after acceptance if unpaid. Delivery inspection and the remaining balance precede rental start. Pickup, delivery and return inspections require photographs and condition/safety/accessory checkboxes. Rental completion enables a review.

Farmer cancellations in the supported pre-dispatch states within 24 hours of the start incur a prototype fee of 10% of the total, capped by payments made. Earlier cancellations have no fee. Owner/administrator cancellation has no farmer fee. Sandbox refunds are ledger records only; provider payments require support reconciliation before cancellation. The actual public cancellation, damage and insurance policy needs business/legal approval.

## Data handling

The application stores names, phone numbers, role, password hashes, selected language/preferences, farm addresses, verification documents, booking histories, inspection photos, reviews, support tickets and chat history. Delivery GPS is shared only when a driver enables it on the open delivery page. Unassigned jobs do not expose farm coordinates or customer contacts. Assigned participants and administrators can access permitted booking information and evidence.

Documents are stored privately outside the static frontend. Password hashes and handover-code hashes are never included in booking responses. Session tokens live in browser session storage. Public catalogue data may be cached by the service worker. Booking drafts are stored locally per account; users should clear site data on shared devices. Account closure disables access but does not purge transaction evidence. No automated retention period is yet enforced.

Maps, optional payment checkout, fonts, remote media, weather, messaging and AI providers process the requests necessary for their respective features. Confirm provider contracts, consent notices, data residency and retention before public deployment. Do not collect production identity documents in a demonstration environment.
