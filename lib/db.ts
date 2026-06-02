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

export {
  clearAllCheckIns,
  getRecentCheckIns,
  initDatabase,
  saveCheckIn
} from "./db.native";

