import { Platform } from "react-native";

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

let db: any = null;
const previewCheckIns: StoredCheckIn[] = [];

export async function initDatabase() {
  if (Platform.OS === "web") {
    console.log("SQLite disabled on web");
    return;
  }

  const SQLite = await import("expo-sqlite");

  db = SQLite.openDatabaseSync("ourae.db");

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
  if (Platform.OS === "web" || !db) {
    previewCheckIns.unshift({
      ...data,
      id: Date.now(),
      created_at: new Date().toISOString(),
    });
    return;
  }

  db.runSync(
    `
      INSERT INTO checkins (mood, energy, anxiety, note, created_at)
      VALUES (?, ?, ?, ?, ?)
    `,
    [data.mood, data.energy, data.anxiety, data.note, new Date().toISOString()],
  );
}

export function getRecentCheckIns(): StoredCheckIn[] {
  if (Platform.OS === "web" || !db) {
    return previewCheckIns;
  }

  return db.getAllSync(`
    SELECT id, mood, energy, anxiety, note, created_at
    FROM checkins
    ORDER BY datetime(created_at) DESC
    LIMIT 50
  `) as StoredCheckIn[];
}
