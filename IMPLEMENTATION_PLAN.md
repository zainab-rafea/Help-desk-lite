# HelpDesk Lite — Implementation Plan (PRD)

You are an expert full-stack developer.

Your task is to build **HelpDesk Lite**, a lightweight internal support ticketing application. The product helps employees submit structured support requests and helps handlers and managers track ownership, status, and workload—without building an enterprise ITSM platform.

This document describes what to build. **Nothing has been implemented yet**; treat this as the single source of truth for delivery.

---

## 1. Product overview

### Problem

Internal support requests arrive through email, chat, and informal channels. That causes duplicated tickets, unclear ownership, inconsistent updates, and poor visibility for managers.

### Goal (v1)

A practical internal web app where:

- Employees submit requests through one structured channel
- Each ticket has clear ownership and status
- Handlers and managers see what is open, in progress, or resolved
- Managers get a simple workload dashboard

### Out of scope (v1)

- Email/chat ingestion
- Knowledge base / self-service portal
- Auto-assignment rules engine
- External customer portal
- SSO/LDAP (simple email/password auth only)
- Mobile native apps (desktop-first responsive web is enough)

---

## 2. Technology stack (required)

| Layer | Technology |
|-------|------------|
| Backend | **Express.js** (Node.js) |
| Database | **SQLite** |
| Frontend | **HTML, CSS, JavaScript** (no React/Vue required) |
| Auth | **bcrypt** + **express-session** |
| Config | **dotenv** |

### Required npm dependencies

- `express`
- `sqlite3`
- `bcrypt`
- `express-session`
- `dotenv`

---

## 3. Project structure (required)

Create exactly this layout:

```plaintext
/project-root
  /public
    /css
      styles.css
    /js
      api.js
      auth.js
      app.js
      theme.js
      theme-init.js
      i18n.js
      lang-init.js
    /locales
      en.json
      ar.json
    index.html
    login.html
    register.html
  /server
    db.js
    routes.js
    auth.js
    datetime.js
  /database
    any.db              (created automatically on first run)
  server.js
  package.json
  .env
  README.md
  CHANGES.md
```

---

## 4. Functional requirements

### 4.1 Authentication & users

- **Register** — name, email, password, role (`requester` | `handler` | `manager`)
- **Login / logout** — session-based; passwords hashed with bcrypt
- **Protected routes** — unauthenticated users redirect to login
- **Seed data** on first DB init (demo accounts):

| Email | Role | Password |
|-------|------|----------|
| employee@company.com | requester | password123 |
| handler@company.com | handler | password123 |
| manager@company.com | manager | password123 |

### 4.2 Roles & permissions

| Role | Can do |
|------|--------|
| **Requester** | Submit tickets; view own tickets; comment on own tickets; reopen resolved tickets within 7 days |
| **Handler** | View team tickets; assign tickets; change status; comment |
| **Manager** | Everything handler can do + manager dashboard |

### 4.3 Tickets

**Required fields when submitting:**

- Title
- Description
- Category: `IT`, `Facilities`, `HR`, `Other`
- Priority: `Low`, `Normal`, `High`

**Status workflow (enforce on server):**

```text
New → Assigned → In Progress → Resolved → Closed
```

Allowed transitions (examples):

- `New` → `Assigned`, `In Progress`
- `Assigned` → `In Progress`, `New`
- `In Progress` → `Resolved`, `Assigned`
- `Resolved` → `Closed`, `In Progress` (reopen)
- `Closed` → `In Progress`

Rules:

- Only **handlers** and **managers** may assign tickets and change status (except requester reopen from `Resolved`)
- Ticket must have an assignee before moving to `In Progress` (unless business rule allows otherwise—document in code)
- Assignment to a handler/manager auto-moves `New` → `Assigned` when applicable

### 4.4 Ticket list & detail

- **Requester** — sees only their tickets
- **Handler / Manager** — filters: all open, assigned to me, unassigned; filter by status
- **Ticket detail modal** — full description, metadata, comments, actions (assign, status, reopen)
- **Comments** — any authorized user can add comments; list chronological
- **Activity history** — log status changes, assignments, and comments in `ticket_history`

### 4.5 Manager dashboard

- Open ticket count
- Breakdown by status
- Breakdown by assignee (include “Unassigned”)
- Breakdown by category
- **Overdue** list — open tickets older than 5 days (not Resolved/Closed)

---

## 5. UI / UX requirements

### 5.1 Pages

1. **login.html** — sign in + link to register + demo credentials hint
2. **register.html** — create account with role selection
3. **index.html** — main app after login:
   - Sidebar: Tickets, New request, Dashboard (manager only)
   - Ticket table + filters
   - New ticket form
   - Manager dashboard panels
   - Ticket detail modal with comments

### 5.2 Dark & light theme

- Toggle on **all pages** (login, register, main app)
- Smooth CSS transitions (~0.4s) when switching
- Save preference in `localStorage` (`helpdesk-theme`)
- Apply theme before first paint (`theme-init.js`) to avoid flash
- Default to system preference if user has not chosen

### 5.3 English & Arabic (i18n)

- Language files: `public/locales/en.json`, `public/locales/ar.json`
- Toggle: **EN | عربي** on all pages (next to theme toggle)
- Save preference in `localStorage` (`helpdesk-lang`)
- Apply language/direction before first paint (`lang-init.js`)
- **RTL layout** when Arabic is active (`dir="rtl"` on `<html>`)
- Translate static UI and dynamic labels (statuses, priorities, categories, roles)
- Use `ar-EG` locale for dates when Arabic is selected

### 5.4 Date & time

- Store all timestamps in **UTC ISO-8601** on the server (e.g. `2026-05-21T14:30:00.000Z`)
- Normalize legacy SQLite `YYYY-MM-DD HH:MM:SS` values to UTC in API responses
- Display times in the **user’s local timezone** with correct locale formatting
- Show a **live header clock** on the main app (updates every second)

### 5.5 Design

- Clean, modern, internal-tool aesthetic
- Responsive (sidebar stacks on mobile)
- Accessible focus states on toggles and buttons
- Respect `prefers-reduced-motion` for theme transitions

---

## 6. API specification

Base URL: same origin. JSON body. Session cookie for auth.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/meta` | — | Statuses, priorities, categories, roles, transitions |
| POST | `/api/auth/register` | — | Create user + session |
| POST | `/api/auth/login` | — | Login + session |
| POST | `/api/auth/logout` | session | Destroy session |
| GET | `/api/auth/me` | session | Current user |
| GET | `/api/users/handlers` | handler, manager | List assignable users |
| GET | `/api/tickets` | session | List tickets (role-filtered; query: `filter`, `status`) |
| POST | `/api/tickets` | session | Create ticket |
| GET | `/api/tickets/:id` | session | Ticket + comments + history |
| PATCH | `/api/tickets/:id` | session | Update `status`, `assignee_id` |
| POST | `/api/tickets/:id/comments` | session | Add comment |
| GET | `/api/dashboard` | manager | Dashboard metrics |

Return appropriate `400` / `401` / `403` / `404` with `{ "error": "message" }`.

---

## 7. Database schema (SQLite)

### `users`

- `id`, `email` (unique), `password_hash`, `name`, `role`, `created_at`

### `tickets`

- `id`, `title`, `description`, `category`, `priority`, `status`
- `requester_id`, `assignee_id` (nullable)
- `created_at`, `updated_at`, `resolved_at` (nullable)

### `comments`

- `id`, `ticket_id`, `user_id`, `body`, `created_at`

### `ticket_history`

- `id`, `ticket_id`, `user_id`, `action`, `old_value`, `new_value`, `created_at`

Initialize schema and seed users in `server/db.js` on startup.

---

## 8. Server setup

### `server.js`

- Load `dotenv`
- Express JSON + session middleware
- Mount `server/routes.js`
- Serve `public/` as static files
- Redirect `/` to login if no session, else `index.html`
- Listen on `PORT` (default `3000`)
- Call `initDb()` before accepting connections

### `.env` (example)

```env
PORT=3000
SESSION_SECRET=change-me-in-production
NODE_ENV=development
```

---

## 9. Implementation order (suggested)

1. Initialize Node project + dependencies + folder structure  
2. Database schema + seed users  
3. Auth (register, login, logout, middleware)  
4. Ticket CRUD + workflow validation  
5. Comments + history  
6. Manager dashboard API  
7. Frontend: login, register, main app shell  
8. Wire API in `app.js` (lists, modal, forms)  
9. Dark/light theme  
10. English/Arabic i18n + RTL  
11. Date/time utilities + header clock  
12. README + CHANGES documentation  

---

## 10. Acceptance criteria

Before considering v1 complete, verify:

- [ ] `npm install` and `npm start` run without errors  
- [ ] Database file `database/any.db` is created on first start  
- [ ] All three demo roles can log in and perform allowed actions  
- [ ] Requester cannot see other users’ tickets  
- [ ] Invalid status transitions are rejected by the API  
- [ ] Manager dashboard shows counts and overdue tickets  
- [ ] Theme persists across page reloads  
- [ ] Arabic switches UI to RTL and translates labels  
- [ ] Ticket times match the user’s local clock (header clock and ticket timestamps agree)  
- [ ] Project matches the folder structure in Section 3  

---

## 11. Documentation deliverables

- **README.md** — setup, demo accounts, features, API summary  
- **CHANGES.md** — version changelog as features are added  

---

## 12. Notes for the implementer

- Keep v1 simple; avoid over-engineering  
- Match existing naming in this plan unless you have a strong reason to change it  
- Do not commit `.env` secrets or `database/any.db` to version control (use `.gitignore`)  
- This app supports the **HelpDesk Lite** case study (internal ticketing workspace); align behavior with lightweight v1 scope above  

---

*End of implementation plan.*
