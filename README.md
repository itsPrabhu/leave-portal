# SmartLeave AI — Intelligent Student Absence Management System

Production-ready frontend (TanStack Start + React 19 + TypeScript + Tailwind v4) for managing student leave across **Student**, **Faculty**, **Parent**, and **Admin** roles. Ships with a complete in-browser mock backend so every screen works out of the box — flip a single env var to point at your real **Express + MySQL** API.

## Highlights

- Role-based dashboards (Student / Faculty / Parent / Admin)
- JWT auth flow: login, register, forgot/reset password, protected routes
- Voice-assisted leave application (Web Speech API, EN + Tamil)
- Document upload with preview
- Emergency leave + multi-category (Medical, Personal, Sports, Hackathon, Workshop, Seminar)
- Notifications (in-app, unread badge, mark-read)
- Analytics dashboard (recharts: bar, pie, line, stacked)
- Reports with CSV export
- Admin user & department management
- Dark mode + EN/Tamil i18n
- Fully responsive (mobile / tablet / desktop), sidebar navigation

## Quick start (VS Code / local)

```bash
# 1. Clone & install
git clone <your-repo-url>
cd smartleave-ai
bun install        # or: npm install / pnpm install

# 2. Configure env
cp .env.example .env

# 3. Run dev server
bun dev            # or: npm run dev
# → http://localhost:5173
```

**Demo accounts (mock mode, password `demo1234`):**

| Role    | Email              |
| ------- | ------------------ |
| Student | student@demo.com   |
| Faculty | faculty@demo.com   |
| Parent  | parent@demo.com    |
| Admin   | admin@demo.com     |

## Environment variables (`.env`)

```bash
VITE_API_BASE_URL=http://localhost:4000/api
VITE_USE_MOCK_API=true   # set to "false" to hit your real backend
```

The mock backend persists data to `localStorage` — clear it via DevTools to reset seed data.

## Connecting your Express + MySQL backend

Set `VITE_USE_MOCK_API=false` and `VITE_API_BASE_URL` to your API. The frontend expects:

### Auth
- `POST /auth/login` → `{ token, user }`
- `POST /auth/register` → `{ token, user }`
- `GET  /auth/me` → `{ user }`  (requires `Authorization: Bearer <token>`)
- `POST /auth/forgot` → `{ ok: true }`
- `POST /auth/reset`  → `{ ok: true }`

### Leaves
- `GET  /leaves` → `{ leaves: Leave[] }` (scoped by role)
- `POST /leaves` → `{ leave }`
- `GET  /leaves/:id` → `{ leave }`
- `POST /leaves/:id/approve` body `{ remarks }` → `{ leave }`
- `POST /leaves/:id/reject`  body `{ remarks }` → `{ leave }`

### Notifications
- `GET  /notifications` → `{ notifications: Notification[] }`
- `POST /notifications/:id/read` → `{ ok: true }`

### Analytics / Admin
- `GET  /analytics/summary` → `{ summary }`
- `GET/DELETE /admin/users[/:id]`
- `GET/POST   /admin/departments`
- `PATCH /profile`

Type shapes live in [`src/types/index.ts`](src/types/index.ts). The mock implementation in [`src/lib/api/mock/server.ts`](src/lib/api/mock/server.ts) is the executable spec for your Express handlers.

## Folder structure

```
src/
  routes/                    # File-based TanStack Router routes
    __root.tsx               # Root layout (providers, head)
    index.tsx                # Public landing
    login | register | forgot-password | reset-password
    _authenticated.tsx       # Protected layout (redirects to /login)
    _authenticated.dashboard.tsx       # Role-routed dashboard
    _authenticated.leaves.*            # List / new / detail
    _authenticated.faculty.requests
    _authenticated.parent.overview
    _authenticated.admin.users | .departments
    _authenticated.{notifications, profile, settings, analytics, reports}
  components/
    layout/                  # AppSidebar, AppHeader
    dashboard/               # Student/Faculty/Parent/Admin dashboards, StatCard
    leave/                   # VoiceInput, DocumentUpload, StatusBadge
    common/                  # LanguageSwitcher, ThemeToggle
    ui/                      # shadcn/ui primitives
  lib/
    api/
      client.ts              # fetch wrapper, JWT, base URL
      mock/                  # In-browser mock backend + seed
    auth/context.tsx         # AuthProvider, useAuth
    i18n/                    # EN + Tamil dictionaries + provider
    theme/context.tsx        # Light/dark theme
  types/index.ts             # User, LeaveRequest, Notification, AnalyticsSummary…
  styles.css                 # Tailwind v4 tokens (OKLCH, light + dark)
```

## Deployment

The app is a TanStack Start project deployable as a Node server or to any platform that supports it (Vercel, Netlify, Cloudflare, Render).

```bash
bun run build      # production build
bun run preview    # preview locally
```

Set the same `VITE_API_BASE_URL` and `VITE_USE_MOCK_API` env vars in your hosting dashboard.

## Tech stack

- **Framework:** TanStack Start (React 19, file-based routing, SSR-capable) + Vite 7
- **Styling:** Tailwind CSS v4 + shadcn/ui (OKLCH design tokens)
- **State / data:** TanStack Query
- **Charts:** Recharts
- **Voice:** Web Speech API (browser-native)
- **i18n:** Custom lightweight provider (EN + Tamil)
- **Auth:** JWT in `localStorage`, attached as `Authorization: Bearer`

## License

MIT — use it freely for your college / hackathon project.
