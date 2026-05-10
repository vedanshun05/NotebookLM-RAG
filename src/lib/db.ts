import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'app.db');

// Ensure the data directory exists
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new Database(dbPath);

// Enable WAL mode for better concurrency
// WAL mode allows simultaneous reads and writes, which is perfect for our Next.js app
// because API requests might run concurrently
let walModeEnabled = false;
try {
  db.exec('PRAGMA journal_mode = WAL;');
  walModeEnabled = true;
} catch (e) {
  console.warn('Could not enable WAL mode:', e);
}

export default db;
