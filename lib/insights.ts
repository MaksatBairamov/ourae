import type { StoredCheckIn } from "./db";

export type EmotionStats = {
  total: number;
  avgEnergy: number;
  avgAnxiety: number;
  mostFrequentMood: string;
  trend: string;
  patternCopy: string;
  lastSeven: StoredCheckIn[];
};

export function getTrendLabel(avgEnergy: number, avgAnxiety: number) {
  if (avgAnxiety >= 8 && avgEnergy <= 3) return "High tension";
  if (avgAnxiety >= 7) return "Activated";
  if (avgEnergy <= 3) return "Low energy";
  if (avgEnergy >= 7 && avgAnxiety <= 4) return "Steady";

  return "Mixed";
}

export function getPatternCopy(avgEnergy: number, avgAnxiety: number) {
  if (avgAnxiety >= 8 && avgEnergy <= 3) {
    return "Your recent signals show high tension with low energy. Regulation comes before productivity.";
  }

  if (avgAnxiety >= 7) {
    return "Anxiety has been the loudest signal recently. Give your body a moment before judging the feeling.";
  }

  if (avgEnergy <= 3) {
    return "Energy looks low across recent check-ins. Smaller actions will probably work better than heroic plans.";
  }

  if (avgEnergy >= 7 && avgAnxiety <= 4) {
    return "Your recent rhythm looks relatively steady. Worth noticing what helped you get there.";
  }

  return "Your recent pattern is mixed. That is not failure. It is a snapshot of change.";
}

export function calculateEmotionStats(
  checkIns: StoredCheckIn[],
): EmotionStats | null {
  if (checkIns.length === 0) return null;

  const total = checkIns.length;

  const avgEnergy = Math.round(
    checkIns.reduce((sum, item) => sum + item.energy, 0) / total,
  );

  const avgAnxiety = Math.round(
    checkIns.reduce((sum, item) => sum + item.anxiety, 0) / total,
  );

  const moodCount = checkIns.reduce<Record<string, number>>((acc, item) => {
    const mood = item.mood || "Unknown";
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {});

  const mostFrequentMood =
    Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown";

  return {
    total,
    avgEnergy,
    avgAnxiety,
    mostFrequentMood,
    trend: getTrendLabel(avgEnergy, avgAnxiety),
    patternCopy: getPatternCopy(avgEnergy, avgAnxiety),
    lastSeven: checkIns.slice(0, 7),
  };
}
