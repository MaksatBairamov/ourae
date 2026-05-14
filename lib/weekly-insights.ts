import type { StoredCheckIn } from "./db";

export type WeeklyReflection = {
  summary: string;
  dominantMood: string;
  averageEnergy: number;
  averageAnxiety: number;
  difficultDay?: string;
  stableDay?: string;
};

function formatWeekday(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleDateString(undefined, {
    weekday: "long",
  });
}

export function generateWeeklyReflection(
  checkIns: StoredCheckIn[],
): WeeklyReflection | null {
  if (checkIns.length === 0) {
    return null;
  }

  const total = checkIns.length;

  const averageEnergy = Math.round(
    checkIns.reduce((sum, item) => sum + item.energy, 0) / total,
  );

  const averageAnxiety = Math.round(
    checkIns.reduce((sum, item) => sum + item.anxiety, 0) / total,
  );

  const moodCount: Record<string, number> = {};

  checkIns.forEach((item) => {
    const mood = item.mood || "Unknown";

    moodCount[mood] = (moodCount[mood] || 0) + 1;
  });

  const dominantMood =
    Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown";

  const highestAnxiety = [...checkIns].sort((a, b) => b.anxiety - a.anxiety)[0];

  const mostStable = [...checkIns].sort((a, b) => {
    const scoreA = a.energy - a.anxiety;
    const scoreB = b.energy - b.anxiety;

    return scoreB - scoreA;
  })[0];

  let summary = "Your emotional signals looked relatively mixed this week.";

  if (averageAnxiety >= 8 && averageEnergy <= 3) {
    summary =
      "Your recent check-ins suggest prolonged stress combined with emotional exhaustion. Your system may need more recovery than pressure.";
  } else if (averageAnxiety >= 7) {
    summary =
      "Anxiety appeared consistently elevated this week. Your nervous system may have been carrying more than usual.";
  } else if (averageEnergy <= 3) {
    summary =
      "Your recent entries suggest lower energy and emotional fatigue across the week.";
  } else if (averageEnergy >= 7 && averageAnxiety <= 4) {
    summary =
      "Your emotional rhythm appeared relatively stable this week. Worth noticing what supported that balance.";
  }

  return {
    summary,
    dominantMood,
    averageEnergy,
    averageAnxiety,
    difficultDay: highestAnxiety
      ? formatWeekday(highestAnxiety.created_at)
      : undefined,
    stableDay: mostStable ? formatWeekday(mostStable.created_at) : undefined,
  };
}
