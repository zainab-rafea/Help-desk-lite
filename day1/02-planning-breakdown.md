# HelpDesk Lite — Planning-Ready Breakdown

## Main work areas

```
Discovery & decisions → Foundation → Core ticketing → Visibility → Pilot & harden
```

### 1. Discovery & product decisions
**Goal:** Remove blockers from Day 1 open questions.

| Layer | Work items | Ready? | Depends on |
|-------|------------|--------|------------|
| Stakeholder alignment | 60-min workflow workshop (states, roles, fields) | Partial | Ops + manager availability |
| Requirements lock | Sign-off on v1 scope doc | Blocked | Workshop output |
| UX direction | Low-fi wireframes (submit, list, detail, dashboard) | Partial | Scope lock |

### 2. Technical foundation
**Goal:** Runnable app skeleton the team can build on.

| Layer | Work items | Ready? | Depends on |
|-------|------------|--------|------------|
| Stack & repo | Choose stack, init repo, CI lint/test | Ready | None |
| Data model | ERD: User, Ticket, Comment, Category | Partial | Workflow states finalized |
| Auth & roles | Requester, Handler, Manager roles | Partial | Role rules from workshop |
| API/contracts | REST or tRPC contracts for tickets | Blocked | Data model |

### 3. Core ticketing (MVP path)
**Goal:** End-to-end ticket lifecycle for one department.

| Layer | Work items | Ready? | Depends on |
|-------|------------|--------|------------|
| Submit ticket | Form + validation + create API | Blocked | Required fields |
| Ticket inbox | List filters (mine, all open, by status) | Blocked | API |
| Ticket detail | View, comments, status change, assign | Blocked | API + workflow |
| Status workflow | Enforce allowed transitions | Blocked | State list sign-off |

### 4. Manager visibility
**Goal:** Managers see workload without exporting spreadsheets.

| Layer | Work items | Ready? | Depends on |
|-------|------------|--------|------------|
| Manager dashboard | Counts by status, assignee, category | Blocked | Ticket data in DB |
| Overdue signal | Simple rule (e.g. open > 5 days) | Partial | Policy agreement |

### 5. Pilot, feedback, hardening
**Goal:** Safe rollout to one team.

| Layer | Work items | Ready? | Depends on |
|-------|------------|--------|------------|
| Pilot plan | Pick department, training, feedback channel | Not yet ready | MVP usable |
| Bug fixes & polish | From pilot feedback | Not yet ready | Pilot |
| v2 backlog | KB, notifications, assignment rules | Not yet ready | v1 learnings |

## What looks ready to move forward

- Repository and project scaffolding
- Workshop scheduling and facilitator guide
- Draft workflow (pending sign-off)
- Epic/story structure in planning tools

## What still depends on unresolved decisions

- Ticket form fields and validation rules
- Final status enum and transition matrix
- Assignee rules and manager permissions
- Notification strategy
- Whether SSO is required for launch

## Suggested first layers of breakdown (engineering)

**Epic A — Align & decide**  
→ Story: Run workflow workshop  
→ Story: Publish v1 scope + workflow one-pager  

**Epic B — Platform**  
→ Story: Init monorepo / app  
→ Story: User auth + RBAC  
→ Story: Ticket schema + migrations  

**Epic C — Requester experience**  
→ Story: Submit ticket UI  
→ Story: My tickets list  

**Epic D — Handler experience**  
→ Story: Team inbox  
→ Story: Ticket detail + comments + assign  

**Epic E — Manager view**  
→ Story: Dashboard v1  

**Epic F — Pilot**  
→ Story: Deploy staging + pilot playbook  
