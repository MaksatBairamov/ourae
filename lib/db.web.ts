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

const previewCheckIns: StoredCheckIn[] = [];

export async function initDatabase() {
  console.log("SQLite disabled on web preview.");
}

export function saveCheckIn(data: CheckInData) {
  previewCheckIns.unshift({
    ...data,
    id: Date.now(),
    created_at: new Date().toISOString(),
  });

  console.log("Preview save:", data);
}

export function getRecentCheckIns(): StoredCheckIn[] {
  return previewCheckIns;
}
