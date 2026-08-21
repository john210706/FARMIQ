# FarmIQ Project Requirements

> Scope note: this document is planning only. Day 1 and Day 2 implement a React UI prototype with sample data. The Node.js/Express API and PostgreSQL database through Supabase will be created in a later phase.

## Planned technical architecture

- **Frontend:** React with Vite.
- **Backend:** Node.js and Express, added after the UI is approved.
- **Database:** PostgreSQL managed through Supabase, added with the backend.
- **Current data:** static sample objects inside the React prototype; no records are stored.

## 1. Problem statement

Small-scale farmers often cannot afford to own modern agricultural machinery. Existing rental options are fragmented, expensive during peak seasons, difficult to discover, and weak in delivery coordination, safe-operation training, and regional-language support. FarmIQ will provide one trusted platform where farmers can find, reserve, pay for, receive, and learn to operate nearby machinery.

## 2. Project objectives

1. Make agricultural machinery affordable through hourly and daily rentals.
2. Match farmers with verified nearby machinery using location and availability.
3. Reduce failed rentals through advance booking, transparent pricing, and status tracking.
4. Coordinate machinery pickup and delivery through a delivery-person workflow.
5. Improve trust through user verification, machine inspection, ratings, agreements, and protected payments.
6. Support low digital literacy with simple screens, regional languages, audio guidance, assisted support, and a future SMS/IVR channel.
7. Improve safe machinery use through tutorials and verified operators.

## 3. Minimum viable product (MVP)

### Included in the first working version

- Mobile-number registration and login.
- Role-based profiles for farmers, machinery owners, delivery people, and administrators.
- Machinery catalogue with location, type, price, rating, and availability filters.
- Machinery details and availability calendar.
- Booking with rental date, time, duration, delivery location, and optional operator.
- Clear quotation and 50% advance-payment flow (sandbox or simulated payment for the academic prototype).
- Booking statuses: requested, confirmed, payment pending, ready for pickup, in transit, delivered, active, completed, and cancelled.
- Owner equipment listing and rental-request management.
- Delivery assignment and milestone updates.
- Ratings and reviews after rental completion.
- Admin verification and issue-management screens.
- English and Tamil interface structure, tutorials, FAQs, and chatbot interface.

### Future scope

- Production payment escrow and damage-coverage partnerships.
- Live GPS from the delivery person's device.
- SMS and IVR booking.
- AI translation, voice chat, and personalized tutorials.
- Dynamic pricing controls, IoT equipment health, demand forecasting, and insurance claims.

## 4. User roles and permissions

### Farmer

- Register and manage farm profile and delivery locations.
- Search, compare, reserve, pay for, and track machinery.
- Add a verified operator, view tutorials, contact support, and review completed rentals.

### Machinery owner

- Complete identity and ownership verification.
- Add machinery, prices, photos, service records, availability, and delivery radius.
- Accept or reject requests, approve dispatch, view earnings, and report damage.

### Delivery person

- View assigned pickups and deliveries.
- Open pickup/drop-off details and contact users.
- Update delivery milestones and submit handover photos/checklists.

### Administrator

- Verify users and machinery, manage categories and service areas.
- Monitor bookings and payments, assign or oversee delivery, resolve complaints, and moderate reviews.
- View platform activity and audit logs.

## 5. Core workflow

1. A user registers with a mobile number and selects a role.
2. The farmer enters a location, date, duration, and machinery requirement.
3. FarmIQ displays verified, available machinery ranked by distance.
4. The farmer chooses equipment, delivery, and an optional operator.
5. The platform calculates the price and creates a booking request.
6. The owner accepts the request; the farmer pays the required advance.
7. An administrator or automated rule assigns a delivery person.
8. Pickup inspection is completed and the booking moves to `in_transit`.
9. The farmer tracks delivery and confirms the handover inspection.
10. After use, pickup and return inspection are completed.
11. The balance is settled and both parties can submit ratings or an issue report.

## 6. Business rules

- A machine cannot have overlapping confirmed bookings.
- Only verified, active machines are visible in public search.
- Price must be calculated on the server and stored as a booking snapshot.
- Booking status transitions must be validated and recorded in an audit trail.
- The MVP requires 50% advance after owner confirmation.
- Cancellation fees depend on status and time remaining before the rental.
- Delivery proof and machine condition must be captured at pickup and handover.
- Only completed rentals can be reviewed.
- Administrators can suspend users or machines without deleting historical records.

## 7. Non-functional requirements

- Mobile-first, responsive, and usable with large touch targets.
- Important tasks should require no more than four main steps.
- Plain language, icons with labels, high contrast, and regional-language readiness.
- Secure password/OTP handling, role authorization, encrypted transport, and limited personal-data exposure.
- Core pages should remain useful on slow networks; images must be compressed and retryable actions idempotent.
- Store timestamps in UTC and display them in the user's local timezone.
- Log important payment, verification, and booking actions.

## 8. Future database requirements (planning only)

| Table | Purpose | Essential fields |
| --- | --- | --- |
| `users` | Shared identity for all roles | id, mobile, password_hash/otp_status, role, full_name, language, verification_status, active, created_at |
| `farmer_profiles` | Farmer-specific details | user_id, farm_name, acreage, crop_types, primary_address_id |
| `owner_profiles` | Owner and business details | user_id, business_name, tax_or_id_number, payout_account_status |
| `delivery_profiles` | Delivery eligibility | user_id, vehicle_number, licence_number, availability_status, rating |
| `addresses` | Farm, owner, and service locations | id, user_id, label, address, village, district, state, postal_code, latitude, longitude |
| `machine_categories` | Controlled machinery types | id, name, description, active |
| `machines` | Equipment catalogue | id, owner_id, category_id, name, model, horsepower, hourly_rate, daily_rate, deposit, operator_available, status, latitude, longitude |
| `machine_media` | Machine photos/documents | id, machine_id, file_url, media_type, sort_order |
| `machine_availability` | Available or blocked time ranges | id, machine_id, starts_at, ends_at, availability_type, reason |
| `bookings` | Rental transaction | id, farmer_id, machine_id, starts_at, ends_at, duration_hours, status, delivery_address_id, operator_required, price_snapshot, advance_amount, created_at |
| `booking_status_history` | Auditable state changes | id, booking_id, old_status, new_status, changed_by, note, changed_at |
| `delivery_jobs` | Pickup and drop-off work | id, booking_id, delivery_person_id, pickup_address_id, drop_address_id, status, estimated_arrival, actual_arrival |
| `delivery_events` | Tracking milestones | id, delivery_job_id, event_type, latitude, longitude, note, created_at |
| `payments` | Payment records | id, booking_id, payer_id, payment_type, provider_reference, amount, status, paid_at |
| `operators` | Verified equipment operators | id, user_id, skills, certification_status, hourly_rate, active |
| `booking_operators` | Operator assigned to a booking | booking_id, operator_id, hours, amount, status |
| `inspections` | Condition and handover evidence | id, booking_id, stage, inspector_id, condition_notes, media_url, confirmed_at |
| `reviews` | Post-rental trust signal | id, booking_id, reviewer_id, reviewee_id, rating, comment, created_at |
| `tutorials` | Training catalogue | id, category_id, title, language, format, content_url, offline_enabled |
| `support_tickets` | Complaints and help requests | id, raised_by, booking_id, category, priority, status, assigned_admin_id, resolution |
| `notifications` | In-app/SMS updates | id, user_id, channel, template, payload, delivery_status, created_at |

## 9. Key relationships

- One `user` has one role-specific profile and many addresses.
- One owner has many machines; one machine has many availability entries and bookings.
- One farmer has many bookings; each booking belongs to one machine.
- A booking has many status-history entries and payments, and at most one active delivery job.
- A delivery job has many tracking events.
- A completed booking can create reviews, inspections, a support ticket, and an operator assignment.

## 10. MVP acceptance criteria

- A farmer can register, find available machinery, receive a clear total, and create a booking.
- An owner can list a machine and accept or reject a non-overlapping request.
- A delivery person can view an assignment and update its milestones.
- An administrator can verify a listing and view open issues.
- The same booking status is shown consistently to all relevant roles.
- The interface remains usable on phone and desktop widths.
