# FarmIQ UI/UX Specification

## Design direction

FarmIQ should feel dependable, practical, and rooted in agriculture without looking old-fashioned. The interface uses deep forest green for trust, leaf green for actions and progress, warm cream for a low-glare background, and a small amount of harvest gold for attention states.

## Design system

| Element | Decision |
| --- | --- |
| Primary colour | Forest `#153F2E` |
| Action colour | Leaf `#3F7B4F` |
| Light surface | Cream `#F7F6EF` and paper `#FFFEFA` |
| Accent | Harvest gold `#D99D3E` |
| Main text | Ink `#18231D` |
| Body font | Arial/Helvetica for clear cross-device reading |
| Display font | Georgia for welcoming page headlines |
| Icons | Lucide line icons, always paired with labels for important actions |
| Shape | Mostly 7-13px corners; larger radius reserved for the main welcome panel |
| Spacing | 8px base rhythm with 32-36px desktop page margins |

## Information architecture

The primary navigation contains Overview, Find machinery, My bookings, Payments, Track delivery, and Help & learning. Account access and language selection stay in the header. A role selector is available in the prototype to demonstrate all four workspaces.

## Screen wireframes

### 1. Login and registration

```
+-----------------------+-----------------------+
| Brand promise         | Sign in / Register    |
| Trust benefits        | Role choice           |
| Regional access       | Mobile number         |
|                       | Password / Full name  |
|                       | Primary action        |
+-----------------------+-----------------------+
```

### 2. Farmer dashboard

```
+----------+------------------------------------+
| Sidebar  | Header: language, alerts, account  |
|          +------------------------------------+
| Overview | Welcome + main "Find" action      |
| Machines +------------------------------------+
| Bookings | Three key metrics                  |
| Payments +-------------------+----------------+
| Tracking | Nearby machines   | Live booking   |
| Help     |                   | status         |
+----------+-------------------+----------------+
```

### 3. Machinery marketplace

```
+------------------------------------------------+
| Search                                  Filters |
| Category filters                               |
| Machine image | Name, owner, distance, rating  |
|               | Specs, price, View & book      |
| Repeat results                                 |
+------------------------------------------------+
```

### 4. Booking

```
+--------------------------------+---------------+
| Selected machine               | Price summary |
| Date / time / duration         | Advance note  |
| Delivery location              | Request CTA   |
| Optional verified operator     |               |
+--------------------------------+---------------+
```

### 5. Payment

```
+--------------------------------+---------------+
| Advance amount and booking     | Trust panel   |
| UPI / Card / Assisted cash     | Protection    |
| Payment details                | Inspection    |
| Pay CTA                        | Support       |
+--------------------------------+---------------+
```

### 6. Delivery tracking

```
+--------------------------------+---------------+
| Map and live route             | Driver        |
| Pickup -> vehicle -> farm      | Milestones    |
|                                | Support CTA   |
+--------------------------------+---------------+
```

### 7. Help and learning

```
+------------------------------------------------+
| Regional-language support promise              |
| AI assistant | Phone help | Machine tutorials  |
| Chat assistant with quick questions            |
+------------------------------------------------+
```

## Main task flow

`Login -> Dashboard -> Search -> Machine details -> Booking -> Owner confirmation -> Advance payment -> Delivery tracking -> Handover -> Rental completion -> Review`

## Usability rules

- Keep primary task language direct: “Find a machine”, “Request booking”, and “Pay advance”.
- Never rely on colour alone; pair status colours with labels and icons.
- Show prices before confirmation and explain the advance/balance clearly.
- Preserve user-entered booking details when navigating backward.
- Use mobile-number login and provide assisted support for users who cannot complete a digital flow.
- Localise labels, dates, currency, audio, and support—not only long-form content.
- Keep touch controls at least 40px high and avoid dense multi-column layouts on phones.

## Prototype coverage

The current lightweight React prototype implements the seven wireframes above, responsive layouts, role switching for all four user types, machinery search, booking confirmation, payment-method selection, live-tracking visualization, and support-chat interactions. It intentionally uses sample data only. Node.js, Express, PostgreSQL, and Supabase belong to a later development phase and are not installed yet.
