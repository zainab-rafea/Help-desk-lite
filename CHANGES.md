# Changelog

## v1.2.1 — Date & time fix

### Fixed

- SQLite UTC timestamps no longer shown as wrong local time (parse as UTC, display in browser timezone)
- New tickets/comments store ISO-8601 UTC from the server
- API normalizes legacy `YYYY-MM-DD HH:MM:SS` values with a `Z` suffix
- Overdue ticket calculation uses correct UTC comparison
- Header live clock shows correct local time (updates every second, respects EN/AR locale)

## v1.2.0 — Arabic translation (i18n)

### Added

- English and Arabic UI via `public/locales/en.json` and `ar.json`
- `public/js/i18n.js` — language switcher, `localStorage` preference (`helpdesk-lang`)
- `public/js/lang-init.js` — early RTL/LTR without flash
- Language toggle (EN | عربي) on all pages next to theme toggle
- RTL layout support when Arabic is selected
- Translated statuses, priorities, categories, and roles in dynamic views

## v1.1.0 — Theme switching

### Added

- Dark and light mode with smooth CSS transitions (0.4s)
- Theme toggle on login, register, and main app (header)
- Preference saved in `localStorage` (`helpdesk-theme`)
- Respects system `prefers-color-scheme` when no saved preference
- `theme-init.js` prevents flash of wrong theme on page load

## v1.0.0 — Initial implementation

### Added

- Node.js project with Express, SQLite3, bcrypt, express-session, dotenv
- SQLite database (`database/any.db`) with users, tickets, comments, ticket_history
- Seed users for manager, handler, and requester roles
- Session-based authentication (register, login, logout)
- Role-based access control (requester, handler, manager)
- Ticket CRUD: create, list, detail, status transitions, assignment
- Workflow enforcement: allowed status transitions server-side
- Comments on tickets with activity history
- Manager dashboard: open counts, breakdowns, overdue tickets (>5 days)
- Frontend: login, register, main app (tickets, new request, dashboard)
- Dark-themed responsive UI

### Technical notes

- Database file is created automatically on first `npm start`
- Default session secret in `.env` should be changed for production
- Requesters see only their tickets; staff see team queues with filters
