export const palette = {
  violet: "#735CFF",
  violetHot: "#9B7CFF",
  cyan: "#0E9CAF",
  pink: "#D94F8C",
  green: "#249E72",
  amber: "#C77A13",
  blue: "#4477D9",
  danger: "#C9435A",

  warm: "#FFD8A6",
  peach: "#FFBFA8",
  cream: "#FFF8EE",
  mint: "#BDEFD7",
  lavender: "#D8CCFF",

  dark: "#171321",
  ink: "#241B35",
  plum: "#332449",
  white: "#FFFFFF",
};

export const colors = {
  bg: "#F9F1E7",
  bgSoft: "#EFE4D8",

  surface: "rgba(255,255,255,0.78)",
  surfaceSoft: "rgba(255,255,255,0.56)",
  surfaceElevated: "rgba(255,255,255,0.94)",
  surfaceGlass: "rgba(255,255,255,0.34)",

  text: palette.dark,
  textSoft: "#40364F",
  textMuted: "#746A82",
  textFaint: "rgba(23,19,33,0.46)",
  textInverse: palette.white,

  border: "rgba(23,19,33,0.085)",
  borderStrong: "rgba(23,19,33,0.16)",

  primary: palette.violet,
  accent: palette.cyan,

  violet: palette.violet,
  violetHot: palette.violetHot,
  cyan: palette.cyan,
  pink: palette.pink,
  green: palette.green,
  amber: palette.amber,
  blue: palette.blue,
  danger: palette.danger,

  warm: palette.warm,
  peach: palette.peach,
  cream: palette.cream,
  mint: palette.mint,
  lavender: palette.lavender,

  shadowViolet: "rgba(115,92,255,0.26)",
  shadowCyan: "rgba(14,156,175,0.18)",
  shadowWarm: "rgba(199,122,19,0.13)",
  shadowDanger: "rgba(201,67,90,0.16)",
  shadowGreen: "rgba(36,158,114,0.15)",

  dangerSoft: "rgba(201,67,90,0.12)",
  successSoft: "rgba(36,158,114,0.13)",
  violetSoft: "rgba(115,92,255,0.14)",
  cyanSoft: "rgba(14,156,175,0.12)",
  warmSoft: "rgba(255,216,166,0.28)",
  peachSoft: "rgba(255,191,168,0.22)",
};

export const moodColors = {
  Calm: palette.cyan,
  Okay: palette.blue,
  Tired: "#7665B8",
  Anxious: palette.danger,
  Sad: "#5778B8",
  Overwhelmed: palette.pink,
  Motivated: palette.green,
  Happy: palette.amber,
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
    shadowColor: palette.violet,
    shadowOpacity: 0.22,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 },
    elevation: 7,
  },
  cyan: {
    shadowColor: palette.cyan,
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  soft: {
    shadowColor: "#786B8F",
    shadowOpacity: 0.13,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
};
