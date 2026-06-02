import * as SQLite from "expo-sqlite";

export type CheckInData = {
  mood: string | null;
  energy: number;
  anxiety: number;
  note: string;

  visualMood?: string | null;
  visualStress?: number | null;
  visualTiredness?: number | null;
  visualConfidence?: number | null;
};

export type StoredCheckIn = CheckInData & {
  id: number;
  created_at: string;
};

const db = SQLite.openDatabaseSync("ourae.db");

function clampScore(value: unknown, min = 0, max = 100): number | null {
  if (value === null || value === undefined || value === "") return null;

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) return null;

  return Math.min(Math.max(Math.round(numericValue), min), max);
}

function sanitizeCheckIn(data: CheckInData): CheckInData {
  return {
    mood: data.mood ?? null,
    energy: Math.min(Math.max(Math.round(Number(data.energy) || 1), 1), 10),
    anxiety: Math.min(Math.max(Math.round(Number(data.anxiety) || 1), 1), 10),
    note: data.note?.trim().slice(0, 1000) ?? "",

    visualMood: data.visualMood?.trim().slice(0, 80) ?? null,
    visualStress: clampScore(data.visualStress),
    visualTiredness: clampScore(data.visualTiredness),
    visualConfidence: clampScore(data.visualConfidence),
  };
}

function addColumnIfMissing(
  columnName:
    | "visual_mood"
    | "visual_stress"
    | "visual_tiredness"
    | "visual_confidence",
  columnDefinition: "TEXT" | "INTEGER",
): void {
  const columns = db.getAllSync(`PRAGMA table_info(checkins);`) as {
    name: string;
  }[];

  const exists = columns.some((column) => column.name === columnName);

  if (!exists) {
    db.execSync(
      `ALTER TABLE checkins ADD COLUMN ${columnName} ${columnDefinition};`,
    );
  }
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

    addColumnIfMissing("visual_mood", "TEXT");
    addColumnIfMissing("visual_stress", "INTEGER");
    addColumnIfMissing("visual_tiredness", "INTEGER");
    addColumnIfMissing("visual_confidence", "INTEGER");
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
        INSERT INTO checkins (
          mood,
          energy,
          anxiety,
          note,
          visual_mood,
          visual_stress,
          visual_tiredness,
          visual_confidence,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        sanitized.mood,
        sanitized.energy,
        sanitized.anxiety,
        sanitized.note,
        sanitized.visualMood ?? null,
        sanitized.visualStress ?? null,
        sanitized.visualTiredness ?? null,
        sanitized.visualConfidence ?? null,
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
    const rows = db.getAllSync(`
      SELECT
        id,
        mood,
        energy,
        anxiety,
        note,
        visual_mood AS visualMood,
        visual_stress AS visualStress,
        visual_tiredness AS visualTiredness,
        visual_confidence AS visualConfidence,
        created_at
      FROM checkins
      ORDER BY datetime(created_at) DESC
      LIMIT 50
    `) as StoredCheckIn[];

    return rows;
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
