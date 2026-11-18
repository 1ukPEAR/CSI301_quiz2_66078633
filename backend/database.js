
const Database = require("better-sqlite3");

// สร้างฐานข้อมูล
const db = new Database("freelance.db");

// สร้างตารางธุรกรรม
db.prepare(`
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jobId TEXT NOT NULL,
        hash TEXT NOT NULL UNIQUE,
        action TEXT NOT NULL,
        wallet TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

module.exports = db;
