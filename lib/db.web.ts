import AsyncStorage from "@react-native-async-storage/async-storage";

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

const STORAGE_KEY = "ourae_checkins";

export async function initDatabase() {
  // нічого не треба
}

export async function saveCheckIn(data: CheckInData) {
  const existing = await getRecentCheckIns();

  const newItem: StoredCheckIn = {
    ...data,
    id: Date.now(),
    created_at: new Date().toISOString(),
  };

  const updated = [newItem, ...existing].slice(0, 50);

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function getRecentCheckIns(): Promise<StoredCheckIn[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);

    if (!raw) return [];

    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function clearAllCheckIns() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
