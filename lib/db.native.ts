import * as SQLite from "expo-sqlite";

export type CheckInData = {
  mood: string | null;
  energy: number;
  anxiety: number;
  note: string;
};

export type StoredCheckIn = CheckInData & {
  id: number;
  created_at: string;
};

const db = SQLite.openDatabaseSync("ourae.db");

export async function initDatabase() {
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

export function saveCheckIn(data: CheckInData) {
  db.runSync(
    `
      INSERT INTO checkins (mood, energy, anxiety, note, created_at)
      VALUES (?, ?, ?, ?, ?)
    `,
    [data.mood, data.energy, data.anxiety, data.note, new Date().toISOString()],
  );
}

export function getRecentCheckIns(): StoredCheckIn[] {
  return db.getAllSync(`
    SELECT id, mood, energy, anxiety, note, created_at
    FROM checkins
    ORDER BY datetime(created_at) DESC
    LIMIT 50
  `) as StoredCheckIn[];
}
