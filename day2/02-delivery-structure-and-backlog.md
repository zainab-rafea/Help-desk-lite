# Day 2 — Delivery Structure, Backlog Order, Workflow, Sprint 1

## Epic hierarchy

| Epic | Type | Summary |
|------|------|---------|
| HDL-1 Align & Decide | Epic | Discovery and scope lock |
| HDL-2 Platform Foundation | Epic | Repo, envs, auth, schema |
| HDL-3 Requester Flow | Epic | Submit and my tickets |
| HDL-4 Handler Flow | Epic | Inbox, detail, workflow |
| HDL-5 Manager Visibility | Epic | Dashboard and overdue |
| HDL-6 Pilot & Learn | Epic | Rollout and v2 input |

### Stories and tasks (hierarchy example)

```
Epic HDL-1 Align & Decide
  Story HDL-101 Run workflow workshop
    Task: Prepare agenda and draft state diagram
    Task: Facilitate session and capture decisions
    Task: Publish workflow one-pager
  Story HDL-102 Sign off v1 scope document
    Task: Merge workshop output into scope doc
    Task: Stakeholder sign-off (email/comment)

Epic HDL-2 Platform Foundation
  Story HDL-201 Initialize repository and CI
    Task: Create repo, branch protection, lint/test
    Task: Add README and contribution notes
  Story HDL-202 Provision dev and staging
    Task: Staging deploy pipeline
    Task: Environment variables doc
  Story HDL-203 Authentication and RBAC
    Task: Login flow
    Task: Roles: Requester, Handler, Manager
  Story HDL-204 Ticket data model
    Task: ERD from signed workflow
    Task: Migrations + seed categories

Epic HDL-3 Requester Flow [Blocked → Sprint 2]
  Story HDL-301 Submit ticket ...
Epic HDL-4 Handler Flow [Blocked → Sprint 2]
Epic HDL-5 Manager Visibility [Blocked → Sprint 3]
Epic HDL-6 Pilot [Not Yet Ready]
```

---

## Ordered backlog (first 8 items — top = highest priority)

| Rank | Key | Title | Epic | Why first |
|------|-----|-------|------|-----------|
| 1 | HDL-101 | Run workflow workshop | HDL-1 | Unblocks 7+ blocked items; highest leverage |
| 2 | HDL-102 | Sign off v1 scope | HDL-1 | Prevents build on wrong assumptions |
| 3 | HDL-201 | Initialize repo and CI | HDL-2 | Ready now; enables parallel dev |
| 4 | HDL-202 | Provision staging | HDL-2 | Ready; needed for integration testing |
| 5 | HDL-203 | Auth and RBAC | HDL-2 | Partial; foundation for all screens |
| 6 | HDL-204 | Ticket data model | HDL-2 | Blocked until #1–2 done |
| 7 | HDL-301 | Submit ticket | HDL-3 | First user-visible value after foundation |
| 8 | HDL-302 | My tickets (requester) | HDL-3 | Completes requester loop |

Items 6–8 are **ordered** but **not Sprint 1** until HDL-101/102 complete (see below).

---

## Workflow design (Jira statuses)

Operational rules — not decorative labels.

| Status | Meaning | Entry criteria | Exit / who moves |
|--------|---------|----------------|------------------|
| **Backlog** | Valid work not committed to a sprint | Filtered Ready/Partial/Blocked | PM pulls to Sprint Planning |
| **Ready for Dev** | In sprint; AC clear; no blockers | Sprint commitment + dependencies met | Dev pulls to In Progress |
| **In Progress** | Active development | Dev self-assigns | PR opened → In Review |
| **In Review** | Code/design review | PR or doc review requested | Approved → Done; changes → In Progress |
| **Blocked** | Cannot proceed; reason required | Dev/PM sets with comment + link | Blocker resolved → previous status |
| **Done** | Meets AC; merged/deployed to staging | Review + AC check | — |

**Board columns (simplified):** Backlog | Ready for Dev | In Progress | In Review | Blocked | Done

**Movement rules:**

- Into **Blocked**: must add comment (reason + owner + expected resolution).
- Out of **Blocked**: only after linked blocker ticket is Done or comment documents decision.
- **Done** requires link to PR or artifact; no empty Done.

---

## Sprint 1 (bounded — executable only)

**Sprint goal:** Establish delivery foundation and complete discovery gate so Sprint 2 can build ticketing.

| Item | In Sprint 1? | Rationale |
|------|--------------|-----------|
| HDL-101 Workshop | Yes | Partial but timeboxed; must finish Sprint 1 |
| HDL-102 Scope sign-off | Yes | Depends on workshop; end of sprint target |
| HDL-201 Repo + CI | Yes | Ready; no blockers |
| HDL-202 Staging | Yes | Ready; parallel with repo |
| HDL-203 Auth + RBAC | Yes | Partial; implement base, document open questions |
| HDL-204 Data model | Yes (spike → implement) | Starts blocked; complete ERD by mid-sprint after workshop |
| HDL-301 Submit ticket | **No** | Blocked on ERD and scope |
| HDL-302 My tickets | **No** | Blocked on API |
| Manager dashboard | **No** | Sprint 3 |
| Pilot plan | **No** | Not Yet Ready |
| KB / notifications | **No** | v2 / Not Yet Ready |

**Sprint 1 capacity assumption:** 2 devs, 1 PM, 0.5 design — focus ~60% foundation, ~40% discovery.

---

## Items kept outside Sprint 1

| Item | Why outside | What must happen first |
|------|-------------|------------------------|
| Submit ticket (HDL-301) | Blocked | Workshop + ERD + API contract |
| Handler inbox / detail | Blocked | Submit path + workflow matrix |
| Manager dashboard | Blocked + later phase | Ticket data exists |
| Pilot execution | Not Yet Ready | MVP on staging |
| Knowledge base | Not Yet Ready / non-goal | v2 prioritization |
| Email integration | Not Yet Ready | Channel strategy decision |
| Auto-assignment | Not Yet Ready | Pilot volume data |

---

## Visibility controls

| Concern | How it stays visible |
|---------|----------------------|
| **Blocked work** | Dedicated **Blocked** status; red flag on board; filter `status = Blocked`; blocker link in description |
| **Review handoffs** | **In Review** column; assign reviewer as ticket owner; SLA comment if > 2 days |
| **Owner changes** | Jira assignee = DRI; subtasks for multi-role (e.g. design vs dev) |
| **Priority** | Priority field: P0 (pilot blocker), P1 (sprint), P2 (backlog); P0 only with PM approval |
| **Partial readiness** | Label `readiness-partial`; AC includes "decision: …" |
| **Discovery decisions** | Confluence/page linked in Epic HDL-1; workshop output attached to HDL-101 |

---

## Minimum operating layer

### Dashboard view: **HelpDesk Lite — Sprint Health**

Widgets:

1. **Sprint burndown** (story points or ticket count)
2. **Blocked tickets** (count + list with assignee and days blocked)
3. **In Review &gt; 2 days** (stale review)
4. **Ready for Dev not started** (pull signal)

**Audience:** PM + tech lead daily standup.

### Automation rule (one)

**Name:** Flag stale Blocked and In Review

**Trigger:** Scheduled daily 9:00 AM

**Conditions:**

- Status = Blocked for &gt; 2 business days, OR
- Status = In Review for &gt; 2 business days

**Action:**

- Add comment: `@assignee` Stale item — please update blocker or review status.
- Optional: set label `needs-attention`

**Why:** Keeps blocker and review truth visible without manual PM sweeps.

---

## Walkthrough talking points (2–3 min — you record)

1. **Problem:** Fragmented internal support → need lightweight HelpDesk Lite.
2. **Day 1 carry-forward:** Same scope, non-goals, and open questions; Jira does not reinvent the plan.
3. **Filter:** Only 2 items were Ready; workshop is Partial but Sprint 1 because it unblocks everything.
4. **Backlog order:** Decide → foundation → requester path.
5. **Sprint 1:** Repo, staging, auth, workshop, scope, ERD — not feature-complete ticketing.
6. **Held out:** Submit/inbox/dashboard until decisions and schema land.
7. **Board:** Statuses are operational rules; Blocked and In Review stay visible via column + automation.
