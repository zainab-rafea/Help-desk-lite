const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const DB_PATH = path.join(__dirname, '..', 'database', 'any.db');

const db = new sqlite3.Database(DB_PATH);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

const STATUSES = ['New', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
const PRIORITIES = ['Low', 'Normal', 'High'];
const CATEGORIES = ['IT', 'Facilities', 'HR', 'Other'];
const ROLES = ['requester', 'handler', 'manager'];

const ALLOWED_TRANSITIONS = {
  New: ['Assigned', 'In Progress'],
  Assigned: ['In Progress', 'New'],
  'In Progress': ['Resolved', 'Assigned'],
  Resolved: ['Closed', 'In Progress'],
  Closed: ['In Progress'],
};

async function initDb() {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('requester', 'handler', 'manager')),
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'Normal',
      status TEXT NOT NULL DEFAULT 'New',
      requester_id INTEGER NOT NULL,
      assignee_id INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      resolved_at TEXT,
      FOREIGN KEY (requester_id) REFERENCES users(id),
      FOREIGN KEY (assignee_id) REFERENCES users(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (ticket_id) REFERENCES tickets(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS ticket_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      user_id INTEGER,
      action TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (ticket_id) REFERENCES tickets(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  const userCount = await get('SELECT COUNT(*) AS count FROM users');
  if (userCount.count === 0) {
    const hash = await bcrypt.hash('password123', 10);
    await run(
      `INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)`,
      ['manager@company.com', hash, 'Alex Manager', 'manager']
    );
    await run(
      `INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)`,
      ['handler@company.com', hash, 'Sam Handler', 'handler']
    );
    await run(
      `INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)`,
      ['employee@company.com', hash, 'Jordan Employee', 'requester']
    );
  }
}

async function logHistory(ticketId, userId, action, oldValue, newValue) {
  await run(
    `INSERT INTO ticket_history (ticket_id, user_id, action, old_value, new_value) VALUES (?, ?, ?, ?, ?)`,
    [ticketId, userId, action, oldValue ?? null, newValue ?? null]
  );
}

function canTransition(from, to) {
  const allowed = ALLOWED_TRANSITIONS[from] || [];
  return allowed.includes(to);
}

module.exports = {
  db,
  run,
  get,
  all,
  initDb,
  logHistory,
  canTransition,
  STATUSES,
  PRIORITIES,
  CATEGORIES,
  ROLES,
  ALLOWED_TRANSITIONS,
};
