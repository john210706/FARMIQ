# FarmIQ

Day 1 and Day 2 deliverables for the FarmIQ college project.

## Current scope

- Project requirements and MVP planning.
- User roles and application workflow.
- Responsive React UI/UX prototype.
- Dashboard, machinery search, booking, payment, tracking, support, login, and registration screens.
- Sample data only. Nothing is saved permanently.

## Planned technology stack

| Layer | Technology | Status |
| --- | --- | --- |
| Frontend | React + Vite | Implemented for Day 2 |
| Backend | Node.js + Express | Later phase |
| Database | PostgreSQL through Supabase | Later phase |
| Authentication | Supabase Auth or Express-based OTP | Later decision |

Express, PostgreSQL, Supabase, authentication, payment processing, and APIs are intentionally not installed or implemented yet.

## Run in VS Code

```bash
npm install
npm run dev
```

Open the local address displayed by Vite, normally `http://localhost:5173`.

## Project files

```text
FarmIQ/
├── docs/
│   ├── project-requirements.md
│   └── ui-ux-specification.md
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
└── README.md
```
