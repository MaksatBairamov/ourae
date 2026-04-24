import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("ourae.db");

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mood TEXT,
      energy INTEGER NOT NULL,
      anxiety INTEGER NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL
    );
  `);
}

export function saveCheckIn(data: {
  mood: string | null;
  energy: number;
  anxiety: number;
  note: string;
}) {
  db.runSync(
    `
      INSERT INTO checkins (mood, energy, anxiety, note, created_at)
      VALUES (?, ?, ?, ?, ?)
    `,
    [data.mood, data.energy, data.anxiety, data.note, new Date().toISOString()],
  );
}

export function getRecentCheckIns() {
  return db.getAllSync(`
    SELECT * FROM checkins
    ORDER BY datetime(created_at) DESC
    LIMIT 20
  `);
}
