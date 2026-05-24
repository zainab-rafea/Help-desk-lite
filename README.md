# HelpDesk Lite

Lightweight internal support ticketing app built with Express, SQLite, and vanilla HTML/CSS/JS.

## Project structure

```plaintext
/project-root
  /public
    /css
    /js
    index.html
    login.html
    register.html
  /server
    db.js
    routes.js
    auth.js
  /database
    any.db          (created on first run)
  server.js
  README.md
  CHANGES.md
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment (optional — defaults work locally):

```bash
# .env
PORT=3000
SESSION_SECRET=your-secret-here
NODE_ENV=development
```

3. Start the server:

```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000)

## Demo accounts

| Email | Role | Password |
|-------|------|----------|
| manager@company.com | Manager | password123 |
| handler@company.com | Handler | password123 |
| employee@company.com | Requester | password123 |

## Features

- **Themes:** Dark / light mode toggle with smooth transitions; preference saved in browser
- **Languages:** English and Arabic (عربي) with RTL support; click **EN | عربي** to switch
- **Auth:** Register, login, session-based access (bcrypt passwords)
- **Roles:** Requester, Handler, Manager
- **Tickets:** Submit (title, description, category, priority)
- **Workflow:** New → Assigned → In Progress → Resolved → Closed
- **Assignment:** Handlers and managers assign tickets
- **Comments:** Thread on each ticket
- **History:** Status and assignment changes logged
- **Dashboard:** Manager view — open count, by status/assignee/category, overdue (>5 days)

## API overview

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Current user |
| GET | `/api/tickets` | List tickets (role-filtered) |
| POST | `/api/tickets` | Create ticket |
| GET | `/api/tickets/:id` | Ticket detail + comments |
| PATCH | `/api/tickets/:id` | Update status / assignee |
| POST | `/api/tickets/:id/comments` | Add comment |
| GET | `/api/dashboard` | Manager metrics |

## Assignment docs

Day 1–2 planning documents remain in `day1/` and `day2/`.
