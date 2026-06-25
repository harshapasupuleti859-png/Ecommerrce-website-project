const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../data/db');

const ADMIN_FILE = 'admin.json';

// Initialize default admin if not exists
function initAdmin() {
  let admins = db.read(ADMIN_FILE);
  if (admins.length === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.insertOne(ADMIN_FILE, {
      id: 'admin-001',
      username: 'admin',
      password: hash
    });
  }
}

initAdmin();

// POST login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  const admins = db.read(ADMIN_FILE);
  const admin = admins.find(a => a.username === username);
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = bcrypt.compareSync(password, admin.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
  res.json({ token, username: admin.username });
});

module.exports = router;
