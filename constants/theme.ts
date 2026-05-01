export const palette = {
  violet: "#7667F2",
  violetHot: "#927BFF",
  cyan: "#1596A8",
  pink: "#D65F93",
  green: "#2F9F79",
  amber: "#C98518",
  blue: "#4F7FD9",
  danger: "#C84C63",

  warm: "#FFD9A8",
  peach: "#FFC7AE",
  cream: "#FFF8EE",
  mint: "#C9F0DC",
  lavender: "#DDD4FF",

  dark: "#171321",
  ink: "#211A2E",
};

export const colors = {
  bg: "#F8F2EA",
  bgSoft: "#EFE7DC",

  surface: "rgba(255,255,255,0.72)",
  surfaceSoft: "rgba(255,255,255,0.5)",
  surfaceElevated: "rgba(255,255,255,0.88)",

  text: palette.dark,
  textSoft: "#41384F",
  textMuted: "#70677D",
  textFaint: "rgba(23,19,33,0.46)",

  border: "rgba(23,19,33,0.09)",
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

  shadowViolet: "rgba(118,103,242,0.22)",
  shadowCyan: "rgba(21,150,168,0.16)",

  dangerSoft: "rgba(200,76,99,0.12)",
  successSoft: "rgba(47,159,121,0.13)",
  violetSoft: "rgba(118,103,242,0.13)",
  cyanSoft: "rgba(21,150,168,0.11)",
  warmSoft: "rgba(255,217,168,0.26)",
  peachSoft: "rgba(255,199,174,0.2)",
};

export const moodColors = {
  Calm: palette.cyan,
  Okay: palette.blue,
  Tired: "#7D6FB8",
  Anxious: palette.danger,
  Sad: "#5F7FB8",
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
    shadowOpacity: 0.2,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 },
    elevation: 7,
  },
  soft: {
    shadowColor: "#7A6F8E",
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
};
