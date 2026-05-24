# Day 2 — Jira Entry Filter (from Day 1 work areas)

Filter applied **before** ticket creation. Status definitions:

- **Ready** — Clear acceptance criteria; no blocking decisions.
- **Partial** — Can be refined or spiked; needs one decision or artifact.
- **Blocked** — Cannot execute until another item completes.
- **Not Yet Ready** — Logically later phase or depends on MVP existing.

| Day 1 item | Jira readiness | Reason | Next action |
|------------|----------------|--------|-------------|
| Workflow workshop | **Partial** | Needs scheduling and attendee list | PM books 60-min session with Ops + Manager |
| v1 scope sign-off | **Blocked** | Depends on workshop output | Draft scope doc pre-workshop; sign after workshop |
| Wireframes (submit, list, detail) | **Partial** | Can draft from assumptions; must align post-workshop | Designer creates low-fi; review in workshop |
| Initialize repo + CI | **Ready** | Stack choice independent of workflow details | Create repo, lint, test pipeline, README |
| Dev/staging environments | **Ready** | Infrastructure pattern standard | Provision staging; document deploy steps |
| Data model / ERD | **Blocked** | States and fields not signed | Spike draft ERD after workshop; finalize in Sprint 1 |
| Auth + RBAC (3 roles) | **Partial** | Role names known; edge permissions TBD | Implement base roles; flag open permission questions |
| API contracts for tickets | **Blocked** | Needs ERD + workflow | Write OpenAPI stub after ERD lock |
| Submit ticket UI + API | **Blocked** | Required fields unset | Start after scope + ERD |
| Handler inbox | **Blocked** | Depends on ticket API | Backlog after submit path |
| Ticket detail + comments + assign | **Blocked** | Depends on inbox + workflow rules | Backlog |
| Status workflow enforcement | **Blocked** | Transition matrix unsigned | Document matrix in workshop |
| Manager dashboard | **Blocked** | Metrics list tentative | Confirm metrics in workshop |
| Overdue signal | **Partial** | Rule needs policy (e.g. 5 days) | Default 5 days open; confirm with manager |
| Pilot plan | **Not Yet Ready** | Needs working MVP | Draft template now; execute post-Sprint 2 |
| v2 backlog (KB, notifications) | **Not Yet Ready** | Explicitly out of v1 | Keep in product backlog, no sprint |

## Summary counts

| Status | Count (items above) |
|--------|---------------------|
| Ready | 2 |
| Partial | 4 |
| Blocked | 7 |
| Not Yet Ready | 2 |

**Rule:** Only **Ready** items enter Sprint 1. **Partial** may enter as timeboxed spikes with explicit decision tasks. **Blocked** and **Not Yet Ready** stay on backlog with links to blockers.
