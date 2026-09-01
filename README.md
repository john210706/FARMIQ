# FarmIQ

FarmIQ is a machinery-rental, logistics, and training platform for small-scale farmers. The project uses a React/Vite frontend and an Express API backed by Supabase PostgreSQL through Prisma.

## Technology

| Layer | Technology |
| --- | --- |
| Frontend | React + Vite, React Leaflet |
| Backend | Node.js + Express |
| Database | Supabase PostgreSQL + Prisma |
| Demo authentication | Account ID/password, bcrypt hashes, JWT sessions |

## Supabase setup

1. Create or open a Supabase project.
2. In the Supabase dashboard, open **Project Settings -> Database -> Connection string**.
3. Copy [backend/.env.example](C:/Users/victo/OneDrive/Desktop/John_Projects/FarmIQ/backend/.env.example) to `backend/.env`.
4. Put the transaction-pooler URL in `DATABASE_URL` and the direct/session URL in `DIRECT_URL`.
5. Replace `JWT_SECRET` with a long random string.
6. From the `backend` directory, run:

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

The API runs at `http://localhost:3000`.

## Frontend setup

From the project root:

```bash
npm install
npm run dev
```

The frontend normally runs at `http://localhost:5173`. It uses `VITE_API_URL` from the root `.env` when provided and otherwise connects to `http://localhost:3000`.

## Demo data

The seed creates:

- 6 farmer accounts
- 6 driver accounts
- 6 machinery-owner/buyer accounts
- 6 machinery listings with displayable image URLs

See [backend/DEMO_ACCOUNTS.md](C:/Users/victo/OneDrive/Desktop/John_Projects/FarmIQ/backend/DEMO_ACCOUNTS.md) for the development login IDs and passwords.

The payment route is a project demonstration: it records a simulated paid advance in PostgreSQL but does not charge real money.
