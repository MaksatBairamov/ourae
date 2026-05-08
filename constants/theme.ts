export const palette = {
  black: "#050510",
  night: "#090A14",
  deep: "#0F1021",
  ink: "#15162B",
  plum: "#211B36",

  violet: "#7C5CFF",
  violetHot: "#A78BFA",
  violetDeep: "#4C35B8",

  cyan: "#22D3EE",
  cyanDeep: "#0891B2",

  pink: "#F472B6",
  pinkDeep: "#BE185D",

  green: "#34D399",
  greenDeep: "#059669",

  amber: "#FBBF24",
  amberDeep: "#D97706",

  blue: "#60A5FA",
  blueDeep: "#2563EB",

  danger: "#FB7185",
  dangerDeep: "#E11D48",

  warm: "#FFD8A6",
  peach: "#FFBFA8",
  cream: "#FFF8EE",
  mint: "#BDEFD7",
  lavender: "#D8CCFF",

  white: "#FFFFFF",
  offWhite: "#F8FAFC",
  silver: "#CBD5E1",
  slate: "#94A3B8",
  muted: "#64748B",
} as const;

export const colors = {
  bg: palette.black,
  bgSoft: palette.night,
  bgElevated: palette.deep,
  bgCard: palette.ink,

  surface: "rgba(255,255,255,0.075)",
  surfaceSoft: "rgba(255,255,255,0.052)",
  surfaceElevated: "rgba(255,255,255,0.105)",
  surfaceGlass: "rgba(255,255,255,0.065)",
  surfaceStrong: "rgba(255,255,255,0.14)",
  surfaceMuted: "rgba(255,255,255,0.035)",

  text: palette.offWhite,
  textSoft: "rgba(248,250,252,0.78)",
  textMuted: "rgba(203,213,225,0.62)",
  textFaint: "rgba(203,213,225,0.38)",
  textInverse: palette.black,

  border: "rgba(255,255,255,0.085)",
  borderStrong: "rgba(255,255,255,0.15)",
  borderGlow: "rgba(124,92,255,0.32)",

  primary: palette.violet,
  primaryHot: palette.violetHot,
  accent: palette.cyan,

  black: palette.black,
  white: palette.white,
  offWhite: palette.offWhite,

  violet: palette.violet,
  violetHot: palette.violetHot,
  violetDeep: palette.violetDeep,
  cyan: palette.cyan,
  cyanDeep: palette.cyanDeep,
  pink: palette.pink,
  pinkDeep: palette.pinkDeep,
  green: palette.green,
  greenDeep: palette.greenDeep,
  amber: palette.amber,
  amberDeep: palette.amberDeep,
  blue: palette.blue,
  blueDeep: palette.blueDeep,
  danger: palette.danger,
  dangerDeep: palette.dangerDeep,

  warm: palette.warm,
  peach: palette.peach,
  cream: palette.cream,
  mint: palette.mint,
  lavender: palette.lavender,

  shadowViolet: "rgba(124,92,255,0.34)",
  shadowCyan: "rgba(34,211,238,0.24)",
  shadowPink: "rgba(244,114,182,0.24)",
  shadowWarm: "rgba(251,191,36,0.18)",
  shadowDanger: "rgba(251,113,133,0.22)",
  shadowGreen: "rgba(52,211,153,0.2)",
  shadowDark: "rgba(0,0,0,0.42)",

  dangerSoft: "rgba(251,113,133,0.13)",
  successSoft: "rgba(52,211,153,0.13)",
  violetSoft: "rgba(124,92,255,0.16)",
  cyanSoft: "rgba(34,211,238,0.13)",
  pinkSoft: "rgba(244,114,182,0.13)",
  warmSoft: "rgba(251,191,36,0.13)",
  peachSoft: "rgba(255,191,168,0.14)",
  blueSoft: "rgba(96,165,250,0.13)",

  gradientStart: palette.black,
  gradientMiddle: palette.deep,
  gradientEnd: "#070712",
} as const;

export const moodColors = {
  Calm: palette.cyan,
  Okay: palette.blue,
  Tired: palette.violetHot,
  Anxious: palette.danger,
  Sad: "#7BA7FF",
  Overwhelmed: palette.pink,
  Motivated: palette.green,
  Happy: palette.amber,
} as const;

export const moodGradients = {
  Calm: [palette.cyan, palette.cyanDeep],
  Okay: [palette.blue, palette.blueDeep],
  Tired: [palette.violetHot, palette.violetDeep],
  Anxious: [palette.danger, palette.dangerDeep],
  Sad: ["#7BA7FF", palette.blueDeep],
  Overwhelmed: [palette.pink, palette.pinkDeep],
  Motivated: [palette.green, palette.greenDeep],
  Happy: [palette.amber, palette.amberDeep],
} as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  xxl: 36,
  pill: 999,
} as const;

export const shadows = {
  violet: {
    shadowColor: palette.violet,
    shadowOpacity: 0.28,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 9,
  },
  cyan: {
    shadowColor: palette.cyan,
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  pink: {
    shadowColor: palette.pink,
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  danger: {
    shadowColor: palette.danger,
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  green: {
    shadowColor: palette.green,
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  soft: {
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 7,
  },
  glass: {
    shadowColor: "#000000",
    shadowOpacity: 0.34,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
  },
  none: {
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
} as const;
