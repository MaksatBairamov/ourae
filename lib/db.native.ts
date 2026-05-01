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

function sanitizeCheckIn(data: CheckInData): CheckInData {
  return {
    mood: data.mood ?? null,
    energy: Math.min(Math.max(Math.round(Number(data.energy) || 1), 1), 10),
    anxiety: Math.min(Math.max(Math.round(Number(data.anxiety) || 1), 1), 10),
    note: data.note?.trim().slice(0, 1000) ?? "",
  };
}

export async function initDatabase(): Promise<void> {
  try {
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
  } catch (error) {
    console.error("Failed to initialize SQLite database:", error);
    throw error;
  }
}

export async function saveCheckIn(data: CheckInData): Promise<void> {
  const sanitized = sanitizeCheckIn(data);

  try {
    db.runSync(
      `
        INSERT INTO checkins (mood, energy, anxiety, note, created_at)
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        sanitized.mood,
        sanitized.energy,
        sanitized.anxiety,
        sanitized.note,
        new Date().toISOString(),
      ],
    );
  } catch (error) {
    console.error("Failed to save check-in:", error);
    throw error;
  }
}

export async function getRecentCheckIns(): Promise<StoredCheckIn[]> {
  try {
    return db.getAllSync(`
      SELECT id, mood, energy, anxiety, note, created_at
      FROM checkins
      ORDER BY datetime(created_at) DESC
      LIMIT 50
    `) as StoredCheckIn[];
  } catch (error) {
    console.error("Failed to fetch check-ins:", error);
    return [];
  }
}

export async function clearAllCheckIns(): Promise<void> {
  try {
    db.execSync(`DELETE FROM checkins;`);
  } catch (error) {
    console.error("Failed to clear check-ins:", error);
    throw error;
  }
}
