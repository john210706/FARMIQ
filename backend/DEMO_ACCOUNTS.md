# Local demonstration accounts

Only created by explicitly running `ALLOW_DEMO_SEED=true npm run db:seed -w farmiq-backend` against a development database.

| Account ID | Workspace |
| --- | --- |
| DEMO-FARMER | Farmer |
| DEMO-OWNER | Machinery owner |
| DEMO-DRIVER | Delivery partner, verified and on duty |
| DEMO-ADMIN | Administrator |

Development-only password for all four: `FarmIQ-demo-2026`.

The seed does not overwrite existing accounts or machinery. The application never automatically signs in with these credentials. Use separate browser profiles or private windows to demonstrate multiple roles; each session is held in session storage.
