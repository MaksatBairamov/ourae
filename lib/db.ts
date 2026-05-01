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

export {
  clearAllCheckIns, getRecentCheckIns, initDatabase,
  saveCheckIn
} from "./db.native";

