# 🏛️ Toyxona va Bar Booking - Frontend Client

This is the Next.js (App Router, TypeScript, Tailwind CSS) frontend application for the **Toyxona va Bar bron qilish tizimi** (SaaS/Marketplace).

## 🚀 Getting Started

### 1. Environment Configuration
Create a `.env.local` file in the root of the `frontend` directory:
```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

### 2. Install Required Libraries
Run the following command to install the requested packages:
```bash
npm install lucide-react axios @tanstack/react-query clsx tailwind-merge date-fns
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📁 Folder Structure

We use a modular architecture matching modern Next.js App Router guidelines:

```text
src/
├── app/                  # App Router pages and layouts
├── components/           # UI Component catalog
│   ├── common/           # Generic buttons, inputs, etc.
│   ├── navbar/           # Main and dashboard navigations
│   ├── footer/           # footer layout
│   ├── cards/            # WeddingHall & Bar cards
│   └── modals/           # Booking & Auth popups
├── services/             # API connection clients
│   ├── api.ts            # Axios configuration with JWT refresh token rotation
│   ├── auth.ts           # Authentication fetch requests (register/login)
│   ├── venues.ts         # Venue listings fetch requests
│   └── bookings.ts       # Bookings management fetch requests
├── store/                # Auth & user state context provider
└── types/                # TypeScript model interfaces (mirroring backend schemas)
```

---

## 🎨 Design System — "Toyxona Luxe"

The entire frontend was redesigned around a **premium cream & champagne-gold** identity:

- **Palette tokens** (`src/app/globals.css`): warm paper (`--paper`, `--surface`), espresso ink (`--ink`, `--espresso`), champagne gold accents (`--gold`, `--gold-strong`, `--gold-tint`) + semantic colors (`--success`, `--wine`, `--danger`). Full dark theme included.
- **Typography**: Playfair Display (display serif) + Manrope (sans) — self-hosted via `@fontsource-variable` (no network dependency at build time).
- **Textures**: `.texture-grain` (film grain overlay), `.pattern-star` (Uzbek islimiy 8-point star lattice), `.pattern-weave` (fine fabric weave).
- **Ornaments**: `.gold-text` (shimmering gold gradient text), `.hairline-b/t` (gold hairlines), `.frame-mat` (gallery double-mat frame), `.eyebrow` (small-caps labels), diamond-shaped ornaments.
- **Components**: `.btn-gold / .btn-ink / .btn-outline / .btn-quiet` (with shine sweep), `.card-lux` (warm-shadow cards), `.input-lux / .select-lux / .field-label`, `.table-lux`, `.badge-gold / .badge-outline`, `.skeleton` shimmer, `.modal-pop` motion.
- **Assets**: `public/images/hero-hall.jpg` (home hero), `public/images/auth-side.jpg` (login/register split screen).
- **Theme toggle**: dark mode via `.dark` class with no-flash inline script in the root layout.

---

## 🔑 Core Features & Setup

### Axios JWT Token Rotation Client (`src/services/api.ts`)
The custom Axios instance dynamically manages access and refresh tokens.
- **Request Interceptor**: Extracts `access_token` from `localStorage` and appends `Authorization: Bearer <token>` to headers.
- **Response Interceptor**: Catches `401 Unauthorized` responses. If an access token expires, it temporarily pauses other requests, hits `/auth/jwt/refresh/` using the `refresh_token`, updates `localStorage`, and retries the original failed request seamlessly.

### Type Definitions (`src/types/index.ts`)
Fully typed interfaces for:
- `User` (and `UserRole`)
- `WeddingHall`, `Bar`
- `Shift`, `Package`, `Decoration`
- `Booking` (combining `HallBooking` and `BarBooking` schemas)
- Calendar view API responses (`busy_shifts` / `busy_slots`)
