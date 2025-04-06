// server/db.js
const Database = require('better-sqlite3');
const path = require('path');

// 創建資料庫檔案（如果不存在會自動建立）
const db = new Database(path.resolve(__dirname, 'data.sqlite'));

// 建立 users 表格（如果還沒建立過）
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`).run();

module.exports = db;
