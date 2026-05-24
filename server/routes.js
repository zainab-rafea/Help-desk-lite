const express = require('express');
const {
  get,
  all,
  run,
  logHistory,
  canTransition,
  STATUSES,
  PRIORITIES,
  CATEGORIES,
  ROLES,
  ALLOWED_TRANSITIONS,
} = require('./db');
const {
  requireAuth,
  requireRole,
  registerUser,
  loginUser,
  attachUserToSession,
} = require('./auth');
const {
  nowIso,
  parseTimestamp,
  mapTicketTimestamps,
  mapCommentTimestamps,
} = require('./datetime');

const router = express.Router();

const REOPEN_DAYS = 7;

function ticketSelect() {
  return `
    SELECT t.*,
      r.name AS requester_name, r.email AS requester_email,
      a.name AS assignee_name, a.email AS assignee_email
    FROM tickets t
    JOIN users r ON t.requester_id = r.id
    LEFT JOIN users a ON t.assignee_id = a.id
  `;
}

router.get('/api/meta', (req, res) => {
  res.json({
    statuses: STATUSES,
    priorities: PRIORITIES,
    categories: CATEGORIES,
    roles: ROLES,
    transitions: ALLOWED_TRANSITIONS,
  });
});

router.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const user = await registerUser({ email, password, name, role: role || 'requester' });
    attachUserToSession(req, user);
    res.status(201).json({ user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await loginUser(email, password);
    attachUserToSession(req, user);
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

router.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get('/api/auth/me', requireAuth, async (req, res) => {
  const user = await get('SELECT id, email, name, role FROM users WHERE id = ?', [
    req.session.userId,
  ]);
  res.json({ user });
});

router.get('/api/users/handlers', requireAuth, requireRole('handler', 'manager'), async (req, res) => {
  const handlers = await all(
    `SELECT id, name, email, role FROM users WHERE role IN ('handler', 'manager') ORDER BY name`
  );
  res.json({ handlers });
});

router.get('/api/tickets', requireAuth, async (req, res) => {
  const { filter } = req.query;
  let sql = `${ticketSelect()} WHERE 1=1`;
  const params = [];

  if (req.session.role === 'requester') {
    sql += ' AND t.requester_id = ?';
    params.push(req.session.userId);
  } else if (filter === 'mine') {
    sql += ' AND t.assignee_id = ?';
    params.push(req.session.userId);
  } else if (filter === 'unassigned') {
    sql += ' AND t.assignee_id IS NULL AND t.status NOT IN (\'Closed\')';
  }

  if (req.query.status) {
    sql += ' AND t.status = ?';
    params.push(req.query.status);
  }

  sql += ' ORDER BY t.updated_at DESC';
  const tickets = await all(sql, params);
  res.json({ tickets: tickets.map(mapTicketTimestamps) });
});

router.post('/api/tickets', requireAuth, async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    if (!title?.trim() || !description?.trim() || !category) {
      return res.status(400).json({ error: 'Title, description, and category are required' });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    const pri = priority || 'Normal';
    if (!PRIORITIES.includes(pri)) {
      return res.status(400).json({ error: 'Invalid priority' });
    }

    const now = nowIso();
    const result = await run(
      `INSERT INTO tickets (title, description, category, priority, requester_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title.trim(), description.trim(), category, pri, req.session.userId, now, now]
    );
    await logHistory(result.lastID, req.session.userId, 'created', null, 'New');
    const ticket = mapTicketTimestamps(
      await get(`${ticketSelect()} WHERE t.id = ?`, [result.lastID])
    );
    res.status(201).json({ ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/tickets/:id', requireAuth, async (req, res) => {
  const ticket = await get(`${ticketSelect()} WHERE t.id = ?`, [req.params.id]);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  if (req.session.role === 'requester' && ticket.requester_id !== req.session.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const comments = await all(
    `SELECT c.*, u.name AS author_name
     FROM comments c JOIN users u ON c.user_id = u.id
     WHERE c.ticket_id = ? ORDER BY c.created_at ASC`,
    [req.params.id]
  );
  const history = await all(
    `SELECT h.*, u.name AS user_name
     FROM ticket_history h LEFT JOIN users u ON h.user_id = u.id
     WHERE h.ticket_id = ? ORDER BY h.created_at ASC`,
    [req.params.id]
  );
  res.json({
    ticket: mapTicketTimestamps(ticket),
    comments: comments.map(mapCommentTimestamps),
    history,
  });
});

router.patch('/api/tickets/:id', requireAuth, async (req, res) => {
  const ticket = await get('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  if (req.session.role === 'requester' && ticket.requester_id !== req.session.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { status, assignee_id } = req.body;
  const isStaff = ['handler', 'manager'].includes(req.session.role);

  if (assignee_id !== undefined) {
    if (!isStaff) {
      return res.status(403).json({ error: 'Only handlers and managers can assign tickets' });
    }
    if (assignee_id !== null) {
      const assignee = await get(
        `SELECT id FROM users WHERE id = ? AND role IN ('handler', 'manager')`,
        [assignee_id]
      );
      if (!assignee) {
        return res.status(400).json({ error: 'Invalid assignee' });
      }
    }
    const oldAssignee = ticket.assignee_id;
    await run('UPDATE tickets SET assignee_id = ?, updated_at = ? WHERE id = ?', [
      assignee_id,
      nowIso(),
      ticket.id,
    ]);
    await logHistory(ticket.id, req.session.userId, 'assignee', String(oldAssignee), String(assignee_id));

    let newStatus = ticket.status;
    if (assignee_id && ticket.status === 'New') {
      newStatus = 'Assigned';
      await run('UPDATE tickets SET status = ? WHERE id = ?', [newStatus, ticket.id]);
      await logHistory(ticket.id, req.session.userId, 'status', 'New', 'Assigned');
    }
  }

  if (status) {
    const current = await get('SELECT * FROM tickets WHERE id = ?', [ticket.id]);
    const fromStatus = current.status;

    if (!canTransition(fromStatus, status)) {
      return res.status(400).json({
        error: `Cannot move from "${fromStatus}" to "${status}"`,
        allowed: ALLOWED_TRANSITIONS[fromStatus],
      });
    }

    if (status === 'In Progress' && !current.assignee_id && isStaff) {
      return res.status(400).json({ error: 'Assign a handler before moving to In Progress' });
    }
    if (status === 'In Progress' && !current.assignee_id) {
      return res.status(400).json({ error: 'Ticket must be assigned before In Progress' });
    }

    if (status === 'In Progress' && fromStatus === 'Resolved') {
      const isOwner = current.requester_id === req.session.userId;
      if (!isStaff && !isOwner) {
        return res.status(403).json({ error: 'Cannot reopen this ticket' });
      }
      if (!isStaff && current.resolved_at) {
        const resolved = parseTimestamp(current.resolved_at);
        const days = (Date.now() - resolved.getTime()) / (1000 * 60 * 60 * 24);
        if (days > REOPEN_DAYS) {
          return res.status(400).json({ error: `Reopen window is ${REOPEN_DAYS} days` });
        }
      }
    }

    if (['Assigned', 'In Progress', 'Resolved', 'Closed'].includes(status) && !isStaff) {
      if (!(status === 'In Progress' && fromStatus === 'Resolved' && current.requester_id === req.session.userId)) {
        return res.status(403).json({ error: 'Only handlers and managers can change status' });
      }
    }

    const resolvedAt = status === 'Resolved' ? nowIso() : current.resolved_at;
    await run(
      `UPDATE tickets SET status = ?, updated_at = ?, resolved_at = ? WHERE id = ?`,
      [status, nowIso(), status === 'Resolved' ? resolvedAt : current.resolved_at, ticket.id]
    );
    await logHistory(ticket.id, req.session.userId, 'status', fromStatus, status);
  }

  const updated = mapTicketTimestamps(await get(`${ticketSelect()} WHERE t.id = ?`, [ticket.id]));
  res.json({ ticket: updated });
});

router.post('/api/tickets/:id/comments', requireAuth, async (req, res) => {
  const ticket = await get('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  if (req.session.role === 'requester' && ticket.requester_id !== req.session.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { body } = req.body;
  if (!body?.trim()) {
    return res.status(400).json({ error: 'Comment body is required' });
  }

  const now = nowIso();
  const result = await run(
    'INSERT INTO comments (ticket_id, user_id, body, created_at) VALUES (?, ?, ?, ?)',
    [ticket.id, req.session.userId, body.trim(), now]
  );
  await run('UPDATE tickets SET updated_at = ? WHERE id = ?', [now, ticket.id]);
  await logHistory(ticket.id, req.session.userId, 'comment', null, body.trim().slice(0, 80));

  const comment = await get(
    `SELECT c.*, u.name AS author_name FROM comments c
     JOIN users u ON c.user_id = u.id WHERE c.id = ?`,
    [result.lastID]
  );
  res.status(201).json({ comment: mapCommentTimestamps(comment) });
});

router.get('/api/dashboard', requireAuth, requireRole('manager'), async (req, res) => {
  const byStatus = await all(
    `SELECT status, COUNT(*) AS count FROM tickets
     WHERE status != 'Closed' GROUP BY status`
  );
  const byAssignee = await all(
    `SELECT COALESCE(a.name, 'Unassigned') AS assignee, COUNT(*) AS count
     FROM tickets t LEFT JOIN users a ON t.assignee_id = a.id
     WHERE t.status NOT IN ('Closed') GROUP BY t.assignee_id`
  );
  const byCategory = await all(
    `SELECT category, COUNT(*) AS count FROM tickets
     WHERE status != 'Closed' GROUP BY category`
  );
  const overdueCandidates = await all(
    `SELECT t.id, t.title, t.status, t.created_at,
      r.name AS requester_name, a.name AS assignee_name
     FROM tickets t
     JOIN users r ON t.requester_id = r.id
     LEFT JOIN users a ON t.assignee_id = a.id
     WHERE t.status NOT IN ('Closed', 'Resolved')
     ORDER BY t.created_at ASC`
  );
  const overdueCutoff = Date.now() - 5 * 24 * 60 * 60 * 1000;
  const overdue = overdueCandidates
    .filter((t) => parseTimestamp(t.created_at).getTime() < overdueCutoff)
    .map(mapTicketTimestamps);
  const openCount = await get(
    `SELECT COUNT(*) AS count FROM tickets WHERE status NOT IN ('Closed')`
  );

  res.json({
    openCount: openCount.count,
    byStatus,
    byAssignee,
    byCategory,
    overdue,
  });
});

module.exports = router;
