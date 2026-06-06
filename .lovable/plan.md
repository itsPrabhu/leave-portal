
# SmartLeave AI — Build Plan

A production-ready TanStack Start (React 19) frontend for student leave management. No Lovable Cloud. Wires to a future Express + MySQL backend via a centralized REST API layer (`VITE_API_BASE_URL`). Ships with a mock API + seed data so every screen works end-to-end out of the box. Exportable to GitHub and runnable in VS Code.

## Tech & Conventions
- TanStack Start (React 19) + Vite, TypeScript strict
- Tailwind v4 + shadcn/ui (already installed)
- TanStack Query for data; TanStack Router file-based routes
- i18n: lightweight context-based EN/TA dictionary (no extra dep)
- Auth: JWT stored in `localStorage`, attached via `Authorization: Bearer` in API client; role-based route guards
- Charts: recharts
- Speech-to-text: Web Speech API (browser-native)
- Dark mode: class-based, toggle in settings/header

## Folder Architecture
```
src/
  routes/                 # file-based routes (see below)
  components/
    layout/               # AppSidebar, AppHeader, RoleShell
    dashboard/            # StatCard, LeaveTable, Charts
    leave/                # LeaveForm, VoiceInput, DocumentUpload, StatusBadge
    common/               # LanguageSwitcher, ThemeToggle, EmptyState
    ui/                   # shadcn (existing)
  lib/
    api/
      client.ts           # fetch wrapper, JWT, error handling, base URL
      auth.ts             # login/register/forgot/reset
      leaves.ts           # CRUD + approve/reject
      users.ts, notifications.ts, analytics.ts, documents.ts
      mock/               # in-memory mock backend + seed data
    auth/
      context.tsx         # AuthProvider, useAuth, role helpers
      guards.tsx          # requireAuth / requireRole helpers
    i18n/
      context.tsx, en.ts, ta.ts
    utils.ts, date.ts, constants.ts
  types/
    user.ts, leave.ts, notification.ts, analytics.ts
  styles.css
.env.example              # VITE_API_BASE_URL, VITE_USE_MOCK_API
README.md                 # setup, scripts, deployment, backend contract
```

## Routes (file-based)
Public:
- `/` Landing
- `/login`, `/register`, `/forgot-password`, `/reset-password`

Authenticated layout `_authenticated/`:
- `/dashboard` (role-router → student/faculty/parent/admin view)
- `/leaves` list, `/leaves/new` apply (with voice), `/leaves/$id` detail
- `/notifications`
- `/profile`, `/settings`
- `/analytics` (faculty/admin)
- `/reports` (admin)
- `/admin/users`, `/admin/departments` (admin)
- `/faculty/requests` (faculty)
- `/parent/overview` (parent)

Route guards via pathless `_authenticated` layout reading `AuthContext`; role layouts gate admin/faculty/parent sections.

## API Layer
- `client.ts` exposes `api.get/post/put/del<T>(path, opts)`, reads `import.meta.env.VITE_API_BASE_URL`, attaches `Bearer <token>`, normalizes errors, returns typed JSON.
- `VITE_USE_MOCK_API=true` (default) routes calls through `lib/api/mock/` which simulates latency and persists to `localStorage`. Flip to `false` to hit a real Express backend with identical endpoint contract.
- Documented backend contract in README:
  - `POST /auth/login|register|forgot|reset`, `GET /auth/me`
  - `GET/POST /leaves`, `GET/PATCH /leaves/:id`, `POST /leaves/:id/approve|reject`
  - `GET /notifications`, `POST /documents`, `GET /analytics/summary`
  - `GET/POST/PATCH/DELETE /admin/users|departments`

## Features Mapped
- Student: apply leave (with `VoiceInput` using Web Speech API), upload docs (file input + preview), emergency toggle, history table, status tracking, academic recovery planner (mock missed classes/assignments view).
- Faculty: pending requests table, approve/reject with remarks dialog, student history drill-down, notifications.
- Parent: child's leave list, attendance summary card, notifications.
- Admin: CRUD tables for users/departments, system stats, reports export (CSV), analytics (recharts: monthly, dept-wise, category pie, approval trend).
- Notifications: bell in header + `/notifications` page; mock generated on leave events.
- Event leave: category selector (Medical / Sports / Hackathon / Workshop / Seminar / Personal / Emergency).
- i18n: `useT()` hook, language switcher in header, EN + TA dictionaries covering nav + key UI strings.
- Dark mode: theme toggle persisting to `localStorage`, `.dark` class on `<html>`.

## Auth Flow
- `AuthProvider` reads token from localStorage on mount, calls `GET /auth/me` (mock returns seeded user), exposes `login/register/logout/hasRole`.
- `_authenticated/route.tsx`: `beforeLoad` redirects to `/login?redirect=...` if no token.
- Role layouts (`_authenticated/admin/route.tsx`, etc.) check `hasRole`.

## Seed Data
4 demo accounts (one per role) with shared password `demo1234` shown on the login page for easy testing. ~20 sample leaves, departments, notifications, analytics aggregates.

## Deployment / Export
- `.env.example` + README sections: local dev (`bun install && bun dev`), VS Code setup, switching mock→real backend, deploying frontend to Vercel/Netlify, expected Express+MySQL endpoints and JWT shape.
- `.gitignore` already fine; project is GitHub-ready.

## Out of Scope (frontend-only project)
- Express server code, MySQL schema/migrations, SMS/Email sending, real OAuth — documented in README as the backend team's responsibility, with the exact REST contract the frontend expects.

## Build Order
1. Design tokens (styles.css), theme + i18n + auth contexts, API client + mock backend, types.
2. Layout shell (sidebar, header, language/theme toggles), route guards.
3. Public pages (landing, auth pages).
4. Student flows (dashboard, leaves list, apply with voice + upload, detail).
5. Faculty flows (requests, approve/reject).
6. Parent flows.
7. Admin (users, departments, reports).
8. Analytics + notifications + profile + settings.
9. README, `.env.example`, polish, dark mode QA.
