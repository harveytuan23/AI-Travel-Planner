// server/db.js
const Database = require('better-sqlite3');
const path = require('path');

// create the database file (if it doesn't exist, it will be created automatically)
const db = new Database(path.resolve(__dirname, 'data.sqlite'));

// create the users table (if it doesn't exist, it will be created automatically)
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`).run();

module.exports = db;
