# Deployment and existing-data migration

## Database migration

Back up the target database and verify restore access before changing an existing deployment. Rehearse on a copy. The implementation was tested using isolated PostgreSQL 16 databases; no Supabase account was modified.

For an empty database, `npm run db:migrate -w farmiq-backend` applies the initial schema, the separately committed booking-state enum changes, and the expanded marketplace schema.

For an existing database created by the former `prisma db push` process:

1. Compare the actual schema with `20260920000000_baseline/migration.sql`. Resolve drift before continuing.
2. After confirming that the database exactly represents the baseline, mark that migration as already applied with `npx prisma migrate resolve --applied 20260920000000_baseline` from `backend/`.
3. Run `npm run db:migrate -w farmiq-backend`.
4. Run `npm run db:generate` from the root.
5. Review existing machinery verification, legacy bookings and legacy `payments` data. Old payment rows were simulated and are intentionally not promoted into the new transaction ledger. Existing machinery defaults to pending verification. Existing booking end times are backfilled, but old quotes and agreements require explicit reconciliation.

Do not baseline an unknown schema. Do not use `migrate reset` or `db push --accept-data-loss` against real data.

## Application configuration

- `DATABASE_URL`: runtime PostgreSQL connection; for Supabase use the appropriate connection/pooler parameters.
- `DIRECT_URL`: migration-capable PostgreSQL connection.
- `JWT_SECRET`: unique random secret, at least 32 characters in production.
- `FRONTEND_URL`: exact browser origin permitted by CORS.
- `PAYMENT_MODE`: `sandbox` in development, `razorpay` for provider testing/production after validation, or `disabled`. Sandbox payment actions are rejected in production.
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`: required together for Razorpay mode. Configure captured/failed events at `/api/payments/webhook`. The raw-body HMAC, amount, currency and saved order must match. A checkout callback does not confirm payment.
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`: optional OTP service. Registered phone numbers must match the provider’s canonical format.
- `PUBLIC_WEBHOOK_ORIGIN`: exact HTTPS public origin, without a trailing slash, used to verify Twilio request signatures. Configure SMS at `/api/channels/sms` and voice at `/api/channels/voice` using POST. Forward original paths unchanged through the proxy.
- `GEMINI_API_KEY`, `GEMINI_MODEL`: optional model access. Without both, the assistant explicitly uses guided help.

Razorpay live refunds/payouts are not automated. Provider captures after expiry or duplicate installment captures create reconciliation tickets rather than silently granting a conflicting reservation. A failed payment event makes a new attempt possible. Review uncertain provider-order creation outcomes before retries in production.

Provider documentation consulted: [Razorpay order creation](https://razorpay.com/docs/api/orders/create/), [Razorpay webhook validation](https://razorpay.com/docs/webhooks/validate-test/), [Twilio request validation](https://www.twilio.com/docs/usage/security), [Twilio messages](https://www.twilio.com/docs/messaging/api/message-resource), [Open-Meteo forecasts](https://open-meteo.com/en/docs).

## Hosting

### Background operations

- Keep one or more API processes running continuously. Database compare-and-update claims make dispatch and SMS work safe when multiple instances poll.
- Automatic dispatch is disabled by default. Enable it in Administration only after verified drivers have opted into duty and location updates.
- Set `SMS_OUTBOX_ENABLED=true` only after configuring the Twilio values and an HTTPS `PUBLIC_WEBHOOK_ORIGIN`. A timeout is recorded as `UNKNOWN` and is deliberately not retried until staff reconcile it with the provider.
- Settlement “payouts” in this repository are sandbox simulations. Production mode rejects those actions; integrate a compliant payout/refund provider before handling real funds.

The supplied Dockerfile builds the frontend and API. Production Express serves `frontend/dist` on the same origin, including the service worker and manifest. Set secrets through the hosting platform, terminate HTTPS, and persist `backend/uploads` on private storage. The container build has not been deployed to a public host.

Database migrations run as a separate release step, never automatically during server startup. Start one staging instance, verify health and the rental scenario, then promote. Provide database backups, restore drills and upload backups. Logs include request IDs; add your monitoring destination, alert routing and retention settings before public use.

The in-memory rate limiter is suitable for one API instance. Multiple instances need a shared limiter store. Uploads currently use a private filesystem and signature/type checks, not managed object storage or malware scanning. Replace with a private storage service and scanning pipeline before broad public uploads. Availability is protected by serializable application transactions; direct database writers must use equivalent safeguards.

## SMS and phone demonstration

- `STATUS` returns the registered account’s latest booking status.
- `HELP <question>` records a support request, deduplicated by provider message ID.
- `BOOK machine-id YYYY-MM-DD hours latitude longitude farm-address AGREE` requests a rental starting at 08:00 India time. The user must acknowledge the displayed rental terms. The regular booking validation and owner approval apply; no money moves through SMS.
- Voice menu 1 reads latest booking status; menu 2 records an assisted-booking callback request. Voice is currently English and does not autonomously collect every booking field. Callback staffing is a business dependency.

No SMS or calls were sent during development verification.
