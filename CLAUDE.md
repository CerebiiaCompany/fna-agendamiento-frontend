# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:3000
npm run build     # Production build
npm start         # Run production build
npm run lint      # ESLint check
```

No test framework is configured.

## Environment Variables

Create a `.env.local` file with:

```bash
NEXT_PUBLIC_API_URL=              # Backend API base URL
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=   # Google reCAPTCHA v3 site key
NEXT_PUBLIC_ENABLE_RECAPTCHA=true # Toggle reCAPTCHA on/off
```

## Architecture

**Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Radix UI), Zustand, React Hook Form + Zod, Axios, Recharts.

### Route Layout

The app uses Next.js App Router route groups:
- `app/(auth)/` — public routes (login, register)
- `app/(dashboard)/` — protected routes (dashboard, scheduling, reschedule, audit, admin)
- `middleware.ts` — protects all routes except `/login`; reads `fna_access_token` from cookies

### API Layer (`lib/`)

- `lib/api.ts` — central Axios instance with Bearer token injection and automatic token refresh on 401. Implements a request queue so concurrent requests wait during a refresh cycle rather than triggering multiple refresh calls. All typed API call functions live here.
- `lib/auth-api.ts` — login/register/logout endpoints (called before the Axios instance is set up)

**Token storage:** access token in `localStorage` + cookie (`fna_access_token`, 30-min expiry); refresh token in `localStorage` (`fna_refresh_token`); user JSON in `localStorage` (`fna_user`).

### State Management (`store/`)

Three Zustand stores:
- `authStore.ts` — current user and access token; includes a `hydrated` flag to avoid SSR mismatch
- `appointmentStore.ts` — multi-step appointment booking form state (`pasoActual` tracks the active step)
- `rescheduleStore.ts` — reschedule workflow state

Stores are hydrated client-side from `localStorage`. Always check `hydrated` before reading auth state in components.

### Key Directories

| Path | Purpose |
|------|---------|
| `app/` | Next.js pages (App Router) |
| `components/ui/` | shadcn/ui base components |
| `components/layout/` | App shell (AppHeader, ConditionalHeader, PageWrapper) |
| `components/auth/` | LoginForm, RegisterForm, ProtectedRoute |
| `components/dashboard/` | Charts, stats cards, tables |
| `hooks/` | Custom hooks for data fetching (useAuth, useCitas, useAuditorias, etc.) |
| `store/` | Zustand global state |
| `lib/` | API client, auth helpers, reCAPTCHA utils |

### Form Pattern

Multi-step forms store all state in Zustand (`pasoActual` = current step index). Each step is a separate component that reads/writes the store directly. Validation uses Zod schemas with React Hook Form.

### Roles

Two user roles exist: `ADMIN` and `ADVISOR`. Role-gated UI is checked via the auth store's user object. Admin routes live under `app/admin/`.
