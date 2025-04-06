// server/routes/auth.js
const express = require('express');
const db = require('../db');
const router = express.Router();

// 註冊
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  try {
    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    stmt.run(username, password);
    res.json({ message: '註冊成功' });
  } catch (err) {
    // 判斷是否是 UNIQUE 失敗（重複 username）
    if (err.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: '使用者已存在' });
    } else {
      console.error('註冊錯誤：', err);
      res.status(500).json({ error: '伺服器錯誤' });
    }
  }
});


// 登入
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const stmt = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?');
  const user = stmt.get(username, password);

  if (!user) {
    res.status(401).json({ error: '帳號或密碼錯誤' });
  } else {
    res.json({ message: '登入成功', username: user.username });
  }
});

module.exports = router;
