# Demonstrate the complete rental without paid services

Use a development database and sandbox payments. No real SMS, money transfer or account signup is needed. Existing local demo accounts use the password documented in `backend/DEMO_ACCOUNTS.md`; never expose these accounts publicly.

## Prepare

1. Start FarmIQ with `npm run dev`. Keep the backend running.
2. Open farmer, owner and driver sessions in separate browser profiles/private windows. Do not duplicate an already signed-in tab: browsers can copy its session storage.
3. Farmer: `DEMO-FARMER`. Owner: `DEMO-OWNER`. Drivers: `DEMO-DRIVER`, `DEMO-DRIVER-2`, `DEMO-DRIVER-3`.
4. Farmer opens Find machinery and permits location access. The development-only demo refresh positions available demo machinery/drivers nearby. It preserves machinery and drivers already attached to an active rental. If a machine remains elsewhere, finish/cancel its existing rental or choose an available one; refreshing is not a booking reset.
5. Choose a future start within the next 24 hours, check the address, operator choice, quote and agreement. Keep the date, location and duration valid. Reopening an existing draft now preserves its farm rather than automatically replacing it with your device location.

## Observe real application transitions

| Who                | Action                                                     | What to check                                                                           |
| ------------------ | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Farmer             | Send request                                               | Booking says requested; no advance before acceptance                                    |
| Owner              | Open Notifications, then accept                            | Request notification belongs to this owner; payment hold is displayed                   |
| Farmer             | Pay sandbox advance                                        | No money moves; nearest eligible driver is assigned if one qualifies                    |
| Farmer             | Open booking                                               | Assignment evidence shows distance from owner pickup and candidate count                |
| Assigned driver    | Open Notifications/My deliveries                           | Only the assigned driver receives the new job; another driver's empty inbox is expected |
| Driver             | Pickup inspection, photos, start journey                   | Timeline advances; location sharing is visible                                          |
| Farmer and driver  | Farmer creates handover code; driver enters it near farm   | Fresh GPS and correct code required; then farmer records delivery inspection            |
| Farmer             | Pay sandbox balance, start rental                          | Equipment moves to in-use stage                                                         |
| Farmer and driver  | Request return, photograph return inspection, start return | Return journey appears                                                                  |
| Owner and driver   | Owner creates return code; driver enters it near owner     | Fresh nearby GPS and correct code required                                              |
| Owner, then farmer | Complete rental; review                                    | Timeline completes and review becomes available                                         |

Automatic selection requires a verified, on-duty driver with a GPS update within five minutes, within the dispatch radius, and without another active delivery. Demo locations are synthetic initial positions, not proof of real travel. Opening an on-duty driver's dashboard publishes the actual browser position and can change who is nearest. Straight-line distance is not road ETA.

For an honest single-device presentation, use browser developer location emulation to represent each role at the correct pickup/farm point, or physically travel there. Never disable the production handover checks. Photos should be relevant and consented; don't upload personal identity documents just for a demo.

## Recovery and tutorials

- Failed reads offer Try again on catalogue, bookings, notifications, learning and admin views. Reconnecting refreshes active reads, but never automatically sends a booking/payment.
- Offline booking inputs remain account-scoped drafts when device storage is available. A storage failure now displays a warning instead of promising the draft is saved.
- Learn & get help shows an illustrated rental journey and nine localized app guides. First-party guides offer recording scripts and draft WebVTT captions. Suggested 20-second step timing must be aligned to your recording; these files are not a finished video.
- Administration supports search/status filters over loaded records and a non-personal summary export. This is not a full database export; existing list limits still apply.

## Verification

Run `npm run verify` with Docker/Podman and Playwright Chromium available. Tests use a disposable local database and mocked external providers, not your current Supabase database. The suite includes role permissions, full delivery/return lifecycle, nearest-driver notification, active demo-location preservation, offline draft recovery and desktop/mobile layouts.
