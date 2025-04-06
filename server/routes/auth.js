// server/routes/auth.js
const express = require('express');
const db = require('../db');
const router = express.Router();

// register
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  try {
  
    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    stmt.run(username, password);
    res.json({ message: 'Register success' });
    console.log('Response received:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });
  } catch (err) {

    if (err.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'User already exists' });
    } else {
      console.error('Register error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
});


router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const userStmt = db.prepare('SELECT * FROM users WHERE username = ?');
  const userExists = userStmt.get(username);

 
  if (!userExists) {
    return res.status(404).json({ error: 'User not found' });
  }

  const loginStmt = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?');
  const user = loginStmt.get(username, password);

  if (!user) {
    return res.status(401).json({ error: 'Password incorrect' });
  }

  res.json({ message: 'Login success', username: user.username });
});

module.exports = router;
