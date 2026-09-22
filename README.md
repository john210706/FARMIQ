# FarmIQ

A React/Vite and Express/PostgreSQL machinery-rental application with farmer, owner, delivery-partner and administrator workflows. The active frontend lives in `frontend/`; the root is an npm workspace. See [implementation status](docs/implementation-status.md) for the exact implemented and outstanding scope.

## Local setup

Use Node.js 22+ and PostgreSQL 16+. From the repository root:

```sh
npm install
npm run db:generate
```

Create `backend/.env` using `backend/.env.example`. Set `DATABASE_URL`, `DIRECT_URL`, a random `JWT_SECRET`, and the frontend origin. Use a **separate development database** for demos and tests. No database credentials belong in frontend environment variables.

For a new, empty database:

```sh
npm run db:migrate -w farmiq-backend
```

For an existing database created with the old schema, follow [deployment and migration instructions](docs/deployment.md) before applying migrations. Do not reset it or accept data loss.

Optional demonstration data:

```sh
ALLOW_DEMO_SEED=true npm run db:seed -w farmiq-backend
```

The seed preserves existing records and refuses to run in production. Demo account IDs: `DEMO-FARMER`, `DEMO-OWNER`, `DEMO-DRIVER`, `DEMO-ADMIN`. Shared development password: `FarmIQ-demo-2026`. Never use these accounts in a public deployment.

```sh
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`. `/api` is proxied to port 3000. The frontend uses `frontend/.env` if a separate API origin is needed. Root `.env` is not a frontend configuration file.

## Working rental flow

1. Farmer selects a verified machine, date, duration, address and optional verified operator, reviews the server quote, and accepts the rental agreement.
2. Owner accepts the request. The payment reservation lasts 30 minutes.
3. Farmer pays the 50% advance. Sandbox mode records a simulated transaction without moving money.
4. A verified on-duty driver accepts the available job; only then are farm and contact details disclosed.
5. Driver uploads pickup inspection photos, starts delivery and shares GPS while the delivery page is open.
6. Farmer generates a handover code. Driver must provide it with a recent GPS fix within 500 metres of the farm.
7. Farmer records the delivery inspection, pays the balance and starts the rental.
8. Farmer requests return inspection; the owner records the return and completes the rental.
9. Farmer reviews the completed rental. All participants can see the timeline, receipts and permitted evidence.

## Other implemented features

- optional fresh-GPS nearest-driver allocation and an administrator dispatch console
- durable opted-in SMS notification outbox with signed delivery-status handling
- settlement ledger, CSV export and clearly labelled sandbox payout simulation

- Account registration, password login, session revocation, profiles, farm addresses and private document upload.
- Server-enforced authorization, validated inputs, rate limiting, security headers and action auditing.
- Search, date availability, distance filtering, map view, favourites, comparison and machine details.
- Owner listing management, blackout periods and service records; administrator verification and suspension.
- Tickets, review moderation, in-app notifications, operator records, tutorial publishing and progress.
- Server-calculated daily/hourly quotations, commission estimates, sandbox cancellation/refund ledger and downloadable receipts.
- Field-task recommendations, acreage/fuel estimates, weather planning, village group expressions of interest and government-resource link.
- Installable app shell, public catalogue caching, private booking drafts, low-data preference, and a complete English/Tamil/Hindi interface with localized validation, dates, INR currency, browser voice input/read-aloud, SMS/IVR prompts and tutorial captions.
- Optional Razorpay order/webhook integration, Twilio OTP and signed SMS/voice endpoints, and configurable Gemini assistance. These need credentials and provider validation before activation.

## Verification

```sh
npm run build
npm test
TEST_DATABASE_URL=postgresql://USER:PASSWORD@127.0.0.1:5432/farmiq_test npm test
npx playwright install chromium
npm run test:e2e
```

Integration tests only accept a localhost database whose name includes `test`. Apply migrations to it first. They create uniquely named fixtures and never delete existing data. Browser tests with `E2E_WITH_API=true` additionally use the demo accounts against a running local API. The CI workflow runs migrations, compilation, unit/integration checks and browser smoke tests.

## Important boundaries

Sandbox money is simulated. No bank escrow, insurance, guaranteed replacement, certified AI-generated training or real payout is represented as active. Payment settlement and tax treatment require business and provider review. Phone GPS only runs while the page is open. Reviewed tutorial media and native-speaker review of agricultural terminology must be supplied by administrators. Advanced group settlement and several production integrations remain outstanding; consult the implementation-status document.
