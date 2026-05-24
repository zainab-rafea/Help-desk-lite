# PRD — HelpDesk Lite

**Product:** HelpDesk Lite — Internal Support Ticketing Workspace  
**Organization:** Digitera / iCareer Project  
**Document type:** Product Requirements Document (PRD)  
**Version:** 1.0  
**Status:** Approved for development  

---

## Document control

| Field | Value |
|-------|--------|
| Purpose | Define what HelpDesk Lite v1 must deliver before implementation begins |
| Audience | Product, engineering, QA, and course evaluators |
| Related documents | Engineering Action Plan (Day 1), Jira Delivery Plan (Day 2), Implementation Plan |

---

# 1. Objective

A company wants to improve how internal support and service requests are handled.

Through **HelpDesk Lite**, the organization will launch a **lightweight internal helpdesk system**—not a giant enterprise platform. HelpDesk Lite is designed to centralize employee support requests and improve visibility, ownership, and resolution tracking across operational teams.

The system replaces fragmented communication channels such as email, chat messages, and informal follow-ups with a structured workflow that allows requests to move clearly from submission to completion.

### Primary objectives

- Centralize all internal support requests into one system
- Improve ticket ownership and accountability
- Provide visibility into ticket progress and workload
- Reduce repetitive support communication
- Standardize support handling workflows
- Improve operational efficiency

### Secondary objectives

- Enable basic reporting through a manager dashboard (v1 foundation for future analytics)
- Prepare the system for future scalability
- Encourage employee adoption through simplicity

---

# 2. Scope (Version 1)

### In scope

- User registration, login, and session-based authentication
- Three roles: **Requester**, **Handler**, **Manager**
- Ticket creation with title, description, category, and priority
- Ticket lifecycle: **New → Assigned → In Progress → Resolved → Closed**
- Manual assignment by handlers and managers
- Ticket list, detail view, comments, and activity history
- Role-based access (requesters see only their tickets)
- Manager dashboard: open count, breakdowns, overdue tickets (> 5 days)
- Responsive web UI (desktop-first)
- **Dark / light theme** with user preference saved locally
- **English and Arabic** UI with RTL support for Arabic
- Accurate local date/time display and header clock

### Out of scope (deferred to v2+)

- Email or push notifications (US-03 tracked via in-app status only in v1)
- Full-text ticket search (FR-10 replaced by status and assignee filters in v1)
- Knowledge base / self-service portal
- Auto-assignment rules engine
- SSO / LDAP / external identity provider
- Email or chat channel ingestion
- Multi-tenant / multi-organization architecture
- Native mobile applications

---

# 3. Technology stack

The v1 implementation shall use the following stack (fixed for this project):

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Backend | Express.js |
| Database | SQLite (`database/any.db`) |
| Frontend | HTML, CSS, JavaScript (vanilla) |
| Authentication | bcrypt + express-session |
| Configuration | dotenv |

### Required dependencies

- `express`
- `sqlite3`
- `bcrypt`
- `express-session`
- `dotenv`

---

# 4. Project structure

The solution shall follow this directory layout:

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
    any.db
  server.js
  package.json
  .env
  README.md
  CHANGES.md
```

---

# 5. User stories

## 5.1 Employee (Requester) stories

### US-01 — Submit a support ticket

**As an** employee, **I want to** submit a support ticket **so that** I can report issues easily.

**Acceptance criteria (v1):**

- Requester can open “New request” and submit title, description, category, and priority
- Required categories: IT, Facilities, HR, Other
- Required priorities: Low, Normal, High
- Ticket is created with status **New** and appears in “My tickets”

---

### US-02 — Track ticket status

**As an** employee, **I want to** track my ticket status **so that** I know progress updates.

**Acceptance criteria (v1):**

- Requester sees a list of only their tickets with current status and last updated time
- Requester can open ticket detail and read comments from support staff
- Status labels are visible in English or Arabic per user language setting

---

### US-03 — Know when status changes

**As an** employee, **I want to** know when my ticket changes status **so that** I am informed of progress.

**Acceptance criteria (v1 — in-app only):**

- Requester sees updated status and timestamps when opening the ticket list or detail
- **Note:** Automated email/push notifications are **out of scope for v1** and planned for v2

---

## 5.2 Support staff (Handler) stories

### US-04 — View assigned tickets

**As a** support agent, **I want to** view tickets assigned to me **so that** I can manage my workload.

**Acceptance criteria (v1):**

- Handler can filter tickets: all open, assigned to me, unassigned
- Handler can filter by status (New, Assigned, In Progress, Resolved, Closed)

---

### US-05 — Update ticket status

**As a** support agent, **I want to** update ticket statuses **so that** progress is visible.

**Acceptance criteria (v1):**

- Handler can change status only along allowed workflow transitions (enforced by server)
- Invalid transitions return an error message
- Ticket must be assigned before moving to **In Progress** where applicable

---

### US-06 — Add comments

**As a** support agent, **I want to** add comments to tickets **so that** communication remains centralized.

**Acceptance criteria (v1):**

- Handler and manager can post comments on tickets they can access
- Comments show author name and timestamp in local time

---

## 5.3 Manager stories

### US-07 — Team workload dashboard

**As a** manager, **I want to** view a team workload dashboard **so that** I can monitor performance.

**Acceptance criteria (v1):**

- Manager sees open ticket count
- Breakdown by status, assignee, and category
- Dashboard is available only to the manager role

---

### US-08 — Identify overdue tickets

**As a** manager, **I want to** identify overdue tickets **so that** bottlenecks can be resolved.

**Acceptance criteria (v1):**

- System lists open tickets older than **5 days** (not Resolved or Closed)
- Manager can open overdue tickets from the dashboard

---

# 6. Functional requirements

| ID | Requirement | v1 notes |
|----|-------------|----------|
| **FR-1** | Users shall be able to create tickets | Implemented via authenticated submit form |
| **FR-2** | Tickets shall contain title, description, category, and priority | All fields required at submission |
| **FR-3** | Support staff shall assign tickets | Handlers and managers assign to handler/manager users |
| **FR-4** | Tickets shall support statuses | New, Assigned, In Progress, Resolved, Closed with server-side rules |
| **FR-5** | Users shall be informed of ticket updates | **v1:** in-app status and timestamps; **v2:** notifications |
| **FR-6** | Managers shall view dashboards | Open count, by status, assignee, category, overdue |
| **FR-7** | Users shall add comments to tickets | Thread on ticket detail |
| **FR-8** | System shall maintain ticket history | `ticket_history` logs status, assignment, and comment events |
| **FR-9** | System shall support role-based access | requester, handler, manager |
| **FR-10** | Users shall find tickets efficiently | **v1:** filter by status, assignee, and queue; **v2:** full search |
| **FR-11** | Users shall register and log in securely | bcrypt passwords, express-session |
| **FR-12** | UI shall support English and Arabic | Locale files + RTL when Arabic is selected |
| **FR-13** | UI shall support dark and light themes | Toggle on all pages; preference in localStorage |
| **FR-14** | System shall display correct local date/time | UTC storage; local display; header clock |

---

# 7. Non-functional requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Pages should load within 2 seconds on a typical internal network |
| **Availability** | Suitable for internal pilot deployment (99% uptime target for production) |
| **Security** | Role-based access control; passwords hashed with bcrypt; session secret in environment |
| **Scalability** | Modular backend (`db`, `routes`, `auth`, `datetime`) to support future expansion |
| **Reliability** | Ticket data persisted in SQLite; no data loss on normal restart |
| **Usability** | Simple interface for non-technical users; bilingual EN/AR |
| **Maintainability** | Clear separation: `server/` backend, `public/` frontend, locale JSON files |
| **Compatibility** | Responsive web support; modern desktop browsers |
| **Accessibility** | Theme and language toggles with visible focus states; reduced-motion respected |
| **Internationalization** | Arabic RTL layout; dates formatted with `ar-EG` or English locale |

---

# 8. UI / UX design

### 8.1 Pages

| Page | Purpose |
|------|---------|
| `login.html` | Sign in; link to register; demo account hint |
| `register.html` | Create account with role selection |
| `index.html` | Main application: tickets, new request, manager dashboard |

### 8.2 Layout (main app)

- **Header:** app name, language toggle (EN \| عربي), theme toggle (dark/light), live clock, user name and role, logout
- **Sidebar:** Tickets, New request, Dashboard (manager only)
- **Content:** ticket table with filters, forms, dashboard widgets
- **Modal:** ticket detail with metadata, actions, comments

### 8.3 Visual design principles

- Clean internal-tool aesthetic
- Dark theme as primary design direction; light theme optional
- Status badges color-coded (New, Assigned, In Progress, Resolved, Closed)
- Smooth transitions when switching theme (~0.4s)

### 8.4 UX reference

A UI/UX mockup or wireframe may be attached separately (e.g. dashboard and ticket views). The implemented v1 UI shall follow the same information architecture: centralized ticket list, clear status, and manager visibility panel.

*(Reference: original PRD UI/UX design section — attach mockup image in Word submission if required by course.)*

---

# 9. Data model (SQLite)

### users

`id`, `email` (unique), `password_hash`, `name`, `role`, `created_at`

### tickets

`id`, `title`, `description`, `category`, `priority`, `status`, `requester_id`, `assignee_id`, `created_at`, `updated_at`, `resolved_at`

### comments

`id`, `ticket_id`, `user_id`, `body`, `created_at`

### ticket_history

`id`, `ticket_id`, `user_id`, `action`, `old_value`, `new_value`, `created_at`

### Seed users (demo)

| Email | Role | Password |
|-------|------|----------|
| employee@company.com | requester | password123 |
| handler@company.com | handler | password123 |
| manager@company.com | manager | password123 |

---

# 10. API overview (REST)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meta` | Statuses, priorities, categories, workflow rules |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current session user |
| GET | `/api/users/handlers` | List assignable staff |
| GET | `/api/tickets` | List tickets (role-filtered) |
| POST | `/api/tickets` | Create ticket |
| GET | `/api/tickets/:id` | Ticket + comments + history |
| PATCH | `/api/tickets/:id` | Update status or assignee |
| POST | `/api/tickets/:id/comments` | Add comment |
| GET | `/api/dashboard` | Manager metrics |

---

# 11. Success metrics (KPIs)

| Metric | Target |
|--------|--------|
| Average ticket response time | Reduce by 30% (measured after pilot) |
| Duplicate requests | Reduce by 40% |
| Ticket assignment delay | Less than 1 business day in v1 pilot |
| Ticket resolution visibility | 100% trackable in system |
| Open overdue tickets | Visible on dashboard; reduce by 25% over pilot |
| User adoption rate | 80% of pilot department using HelpDesk Lite |
| Employee satisfaction | > 4/5 internal rating after pilot |

---

# 12. Assumptions

| Assumption | Description |
|------------|-------------|
| Internal usage only | System is only for company employees |
| Limited user base | Initial usage is within a small-to-medium organization |
| Web-based access | Users primarily access through desktop browsers |
| Basic workflow | Ticket flow remains simple in v1 (five statuses, manual assign) |
| Single organization | No multi-tenant architecture needed in v1 |
| Internal authentication | v1 uses built-in email/password registration and login (SSO optional in v2) |
| Bilingual workforce | English and Arabic UI support required for adoption |
| Local timezone | Users expect dates and header clock in their local timezone |

---

# 13. Timeline (indicative)

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Planning | Week 1 | PRD, Engineering Action Plan, Jira workspace |
| Foundation | Week 2 | Auth, database, project scaffold |
| Core ticketing | Weeks 3–4 | Submit, list, assign, status, comments |
| Dashboard & UX | Week 5 | Manager dashboard, theme, i18n, date/time |
| Pilot & review | Week 6 | Demo, feedback, documentation (README, CHANGES) |

---

# 14. Approval

This PRD defines the intended behavior of HelpDesk Lite v1 **before** implementation. Development, testing, and submission artifacts shall trace back to the requirements, user stories, and acceptance criteria in this document.

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product owner | | | |
| Engineering lead | | | |
| Stakeholder | | | |

---

*End of document*
