# Toyxona — frontend

Next.js App Router, React, TypeScript and Tailwind CSS frontend for finding and booking wedding halls and bars. The existing **Toyxona Luxe** cream, espresso and gold design includes light/dark themes and self-hosted Manrope/Playfair fonts.

## Run locally

Use Node.js 20.9+ (Node.js 22 recommended).

```bash
npm ci
cp .env.example .env.local
npm run dev -- --hostname 0.0.0.0
```

Open `http://localhost:3000`.

### Backend connection

Set the **server-side** backend URL, including `/api/v1`, in `.env.local`:

```dotenv
API_URL=http://127.0.0.1:8000/api/v1
```

- Browser requests always use same-origin `/api/v1/...`; Next.js proxies them to the backend. A remote visitor's browser must not call the backend on `localhost`.
- `/media/...` is proxied to the backend origin so uploaded images work in remote previews as well.
- `NEXT_PUBLIC_API_URL` is accepted as a legacy fallback. Prefer `API_URL` for new deployments.
- Restart the dev server after changing this setting. Rebuild before deploying production URL changes: rewrites are generated from the build configuration.
- Run Django/the real API separately. Without it, the frontend displays loading errors and retry controls; it does not substitute sample data.
- Development supports localhost and `*.e2b.app` preview origins. Production can run with `npm run build && npm run start -- --hostname 0.0.0.0`.

## Main routes

| Area | Routes |
| --- | --- |
| Public | `/`, `/login`, `/register`, `/venues/halls/[id]`, `/venues/bars/[id]` |
| Venue owner | `/dashboard/venues`, `/dashboard/add`, `/dashboard/venues/halls/[id]`, `/dashboard/venues/bars/[id]`, `/dashboard/bookings`, `/dashboard/calendar` |
| Administrator | `/admin/dashboard`, `/admin/users`, `/admin/venues`, `/admin/settings/telegram` |

`/dashboard` and `/admin` redirect to their corresponding dashboards. Role checks and ownership checks improve frontend navigation; **the backend must enforce authorization independently**.

## Frontend behavior

- Search filters and booking dates survive URL navigation. Catalog and owner lists use API pagination; complete collections follow pagination without forwarding bearer tokens to a `next` link's host.
- Login normalizes Uzbek phone numbers. Token refresh is shared across concurrent requests; logout clears credentials/private query caches. Late responses cannot restore a logged-out session or retry a previous account's request under a new account.
- Owner add/edit forms share validation, preserve loaded region/district selections and unsaved drafts, and use multipart requests for images. JPEG, PNG, WebP and GIF files are limited to 5 MB each, with at most five gallery images.
- Hall booking uses the selected package's **total price**, plus optional decoration. Bar booking uses the hourly price and selected time interval. Past dates, unavailable shifts, overlapping time ranges and capacity violations are blocked in the UI. The backend remains authoritative for pricing, permissions and double-booking prevention.
- Calendar failures mean **unknown availability**, not a free slot. Hall and bar calendar selections stay connected to their booking forms.
- Saved venues are device-local (`toyxona:saved-venues`), not server-synced favorites. Gallery dialogs support Escape and restore keyboard focus.
- Admin pages use API data and report failed operations instead of simulated success. Telegram settings never resubmit a masked token.

### API contracts to verify against your backend

Types and requests are defined in `src/types/index.ts` and `src/services/`. In particular:

- Hall calendar: `GET /api/v1/bookings/calendar/hall/:id/?year=YYYY&month=M`, returning `busy_shifts`.
- Bar calendar: `GET /api/v1/bookings/calendar/bar/:id/?year=YYYY&month=M`, returning `busy_slots`.
- Owner-scoped hall/bar lists use `my_venues=true`.
- Multipart edits use `cover_image`, repeated `gallery_images`, JSON `amenities`, `delete_cover_image=true`, and JSON `deleted_gallery_ids`. Empty optional map/video links are submitted to clear them.
- Admin venue approval uses the existing boolean `is_approved` contract; it is not a separate multi-state moderation workflow.
- Telegram connection validation and webhook registration are performed by the backend.

The included browser tests use controlled API fixtures. They do **not** verify a deployed Django API, Telegram connectivity, real file storage or concurrent server-side booking conflicts.

## Verification

```bash
npm run typecheck
npm run lint
npm run build
npm audit

# First-time browser setup on a supported workstation/CI runner:
npx playwright install --with-deps chromium
npm run test:e2e
```

The Playwright suite includes:

- All 18 route entries, including redirects and 404: desktop light, desktop dark and mobile light.
- Runtime/hydration errors, page readiness, horizontal page overflow, and automated Axe WCAG A/AA checks.
- Auth/roles/refresh/logout, filters and pagination, hall/bar bookings, add/edit/uploads, calendar blocking, admin actions and error/empty states.
- Utility regressions for date/time boundaries, validation, safe redirects, media URLs and pagination.

Mobile tests emulate an iPhone-sized viewport in **Chromium**, not WebKit/Safari. Automated accessibility checks do not replace a full manual accessibility audit.

Optional settings:

```bash
# Test an already-running frontend instead of starting the dev server:
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npm run test:e2e

# Supply an existing compatible Chromium executable when browser downloads are restricted:
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chromium npm run test:e2e

# Capture successful page screenshots for a visual review:
PLAYWRIGHT_CAPTURE_PAGES=1 npm run test:e2e -- tests/pages.spec.ts
```

Failures save screenshots and traces in the ignored `test-results/` directory; the HTML report is in `playwright-report/`. Test fixtures live only in `tests/`, never in the application runtime.

## Structure

```text
src/
├── app/                  # Public, owner and admin routes; route fallbacks
├── components/
│   ├── common/           # Calendar, booking, dialogs, media and feedback
│   ├── forms/            # Auth, shared venue form and hall setup
│   ├── cards/            # Catalog cards
│   └── layout/           # Public header/footer and dashboard shell
├── hooks/                # User-scoped owner queries and mutations
├── lib/                  # Form schemas and amenity definitions
├── services/             # API/auth, pagination, venues, bookings and admin
├── store/                # Authentication context
├── types/                # Backend-facing model types
└── utils/                # Dates, validation errors, navigation and storage
```

`package-lock.json` and `bun.lock` are kept in sync. npm is the documented installation path; do not add the npm CLI itself as a runtime application dependency.
