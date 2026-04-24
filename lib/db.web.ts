type CheckInData = {
  mood: string | null;
  energy: number;
  anxiety: number;
  note: string;
};

const previewCheckIns: CheckInData[] = [];

export async function initDatabase() {
  console.log("SQLite disabled on web preview.");
}

export function saveCheckIn(data: CheckInData) {
  previewCheckIns.unshift(data);
  console.log("Preview save:", data);
}

export function getRecentCheckIns() {
  return previewCheckIns;
}
