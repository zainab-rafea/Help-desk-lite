require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const { initDb } = require('./server/db');
const routes = require('./server/routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
    },
  })
);

app.use(routes);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  if (req.session.userId) {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  res.redirect('/login.html');
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`HelpDesk Lite running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
