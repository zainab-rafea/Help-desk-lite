# HelpDesk Lite

Lightweight internal support ticketing app built with Express, SQLite, and vanilla HTML/CSS/JS.

<<<<<<< HEAD
=======
HelpDesk Lite is a lightweight internal support ticketing system designed to help companies manage employee service requests in a more organized and efficient way. Instead of handling issues through scattered emails, chat messages, or informal follow-ups, the system centralizes all requests into one structured platform.

The main goal of HelpDesk Lite is to improve request tracking, ownership, communication, and resolution visibility. Employees can submit tickets, support staff can manage and update requests, and managers can monitor workloads and unresolved issues through dashboards and status tracking.

The system focuses on simplicity and usability rather than building a large enterprise solution. Version 1 mainly includes core features such as ticket creation, assignment, status management, comments, notifications, and basic reporting to ensure teams can adopt the system quickly with minimal complexity.

This is an individual project a part of software enjineering and product management. the project is developed by the help of cursor ai tool and applied many concepts like scrum plan and jira usage.

>>>>>>> 0c99c86c531c6a5f89428334c3ae2645a1e76ea4
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
<<<<<<< HEAD
=======





>>>>>>> 0c99c86c531c6a5f89428334c3ae2645a1e76ea4
