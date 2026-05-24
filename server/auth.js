const bcrypt = require('bcrypt');
const { get, run, ROLES } = require('./db');

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.role || !roles.includes(req.session.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

async function registerUser({ email, password, name, role }) {
  if (!email || !password || !name) {
    throw new Error('Email, password, and name are required');
  }
  if (!ROLES.includes(role)) {
    throw new Error('Invalid role');
  }
  const existing = await get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
  if (existing) {
    throw new Error('Email already registered');
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await run(
    'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
    [email.toLowerCase(), passwordHash, name.trim(), role]
  );
  return { id: result.lastID, email: email.toLowerCase(), name: name.trim(), role };
}

async function loginUser(email, password) {
  const user = await get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
  if (!user) {
    throw new Error('Invalid email or password');
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new Error('Invalid email or password');
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

function attachUserToSession(req, user) {
  req.session.userId = user.id;
  req.session.role = user.role;
  req.session.userName = user.name;
  req.session.userEmail = user.email;
}

module.exports = {
  requireAuth,
  requireRole,
  registerUser,
  loginUser,
  attachUserToSession,
};
