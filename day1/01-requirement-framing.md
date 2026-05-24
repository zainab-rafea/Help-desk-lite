# HelpDesk Lite — Requirement Framing

## Core problem

Internal support requests arrive through email, chat, and informal channels. That fragmentation causes duplicated tickets, unclear ownership, inconsistent updates, and repeated clarification before work starts. Managers lack a reliable view of open, delayed, and completed work.

## Intended outcome (v1)

A lightweight internal ticketing workspace where:

- Employees submit requests through one structured channel
- Each request has clear ownership and status
- Handlers and managers can see what is open, in progress, blocked, or resolved
- Basic handling is consistent without heavy process overhead

Success for v1 is **clarity and adoption**, not feature parity with enterprise helpdesk products.

## Scope boundaries (in v1)

| In scope | Out of scope (v1) |
|----------|-------------------|
| Ticket submission with required fields | Full email/chat ingestion |
| Ticket list and detail views | Advanced SLA automation |
| Assignment to a handler (manual) | Auto-routing / assignment rules engine |
| Status workflow (defined states) | Knowledge base / self-service portal |
| Role-based access (requester, handler, manager) | External customer portal |
| Manager dashboard (open count, by status, by assignee) | Reporting exports, BI integrations |
| Comments/updates on tickets | Multi-department workflow designer |
| Basic priority (e.g. Low / Normal / High) | Custom fields builder |

## Non-goals

- Replacing all communication channels on day one
- Building an enterprise ITSM platform
- Implementing AI, chatbots, or predictive routing
- Deep integrations (LDAP, SSO, payroll) unless explicitly decided later
- Perfect workflow automation before teams validate the basic flow

## Unresolved questions (must clarify before build)

| # | Question | Why it matters | Proposed default for planning |
|---|----------|----------------|-------------------------------|
| 1 | Required fields at submission? | Drives form schema and validation | Title, description, category, priority |
| 2 | Who can assign tickets? | Permissions model | Handlers + managers only |
| 3 | Exact status list? | Board columns, transitions | New → Assigned → In Progress → Resolved → Closed |
| 4 | Can requesters reopen? | Post-resolution flow | Yes, within 7 days → reopens as In Progress |
| 5 | Manager metrics? | Dashboard scope | Open count, overdue (no SLA), by assignee |
| 6 | Categories list? | Dropdown data | IT, Facilities, HR, Other (admin-maintained) |
| 7 | Notifications? | Email/in-app scope | In-app only for v1 |
| 8 | Self-service / KB in v1? | Scope creep risk | Defer to v2 |

## Major risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Workflow undefined | Rework on states and permissions | Workshop with ops + 1 sprint spike on workflow doc |
| Low adoption | System unused; email persists | Pilot with one department; keep submission < 2 minutes |
| Over-scoping v1 | Delays launch | Strict MoSCoW; defer KB and automations |
| Unclear ownership | Same problem as today | Mandatory assignee before "In Progress" |
| Manager expectations | Dashboard insufficient | Agree metric list before UI build |
| Weak audit trail | Disputes on who changed what | Log status, assignee, and comment history |

## Assumptions (explicit)

- Internal web app for desktop-first use
- Single organization (no multi-tenant)
- English UI for v1
- Authentication exists or will use simple email/password or company SSO (TBD)
