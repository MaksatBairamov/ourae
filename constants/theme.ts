export const colors = {
  bg: "#F7F2EA",
  bgSoft: "#EFE7DC",

  surface: "rgba(255,255,255,0.62)",
  surfaceSoft: "rgba(255,255,255,0.42)",
  surfaceElevated: "rgba(255,255,255,0.78)",

  text: "#171321",
  textSoft: "#40384F",
  textMuted: "#736A82",
  textFaint: "rgba(23,19,33,0.48)",

  border: "rgba(23,19,33,0.08)",
  borderStrong: "rgba(23,19,33,0.14)",

  violet: "#8B7CFF",
  violetHot: "#A78BFA",
  cyan: "#42C7D9",
  pink: "#F4A7C8",
  green: "#65CFA8",
  amber: "#F4B85A",
  blue: "#7EA7F7",
  danger: "#E86F83",

  warm: "#FFD6A5",
  peach: "#FFC7A8",
  cream: "#FFF8EE",
  mint: "#BDEFD7",
  lavender: "#D8CCFF",

  shadowViolet: "rgba(139,124,255,0.24)",
  shadowCyan: "rgba(66,199,217,0.18)",

  dangerSoft: "rgba(232,111,131,0.12)",
  successSoft: "rgba(101,207,168,0.14)",
  violetSoft: "rgba(139,124,255,0.14)",
  cyanSoft: "rgba(66,199,217,0.12)",
  warmSoft: "rgba(255,214,165,0.22)",
  peachSoft: "rgba(255,199,168,0.18)",
};

export const moodColors = {
  Calm: colors.cyan,
  Okay: colors.blue,
  Tired: colors.lavender,
  Anxious: colors.danger,
  Sad: "#8BA6D9",
  Overwhelmed: colors.pink,
  Motivated: colors.green,
  Happy: colors.amber,
} as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  pill: 999,
};

export const shadows = {
  violet: {
    shadowColor: colors.violet,
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  soft: {
    shadowColor: "#7A6F8E",
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
};
