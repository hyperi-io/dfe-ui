// Font families configuration
export const fontFamily = {
  base: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  display: "'Inter', sans-serif",
  secondary: "'Inter', sans-serif",
  mono: "'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace",
} as const;

export const fontFamilyTw = {
  base: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif',
  ],
  display: ['Inter', 'sans-serif'],
  secondary: ['Inter', 'sans-serif'],
  hyper: [
    'SF Mono',
    'SFMono-Regular',
    'Consolas',
    'Liberation Mono',
    'Menlo, monospace',
  ],
} as const;

// Font size scale (in pixels)
export const fontSize = {
  xs: 12, // Small labels, captions
  sm: 14, // Body small
  base: 16, // Body default
  md: 18, // Subheadings default
  lg: 20, // Subheadings large
  xl: 22, // Headings
  '2xl': 24, // Large headings
  '3xl': 30, // Display small
  '4xl': 36, // Display medium
  '5xl': 48, // Display large
} as const;

// Font weights
export const fontWeight = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  black: 900,
} as const;

// Line heights
export const lineHeight = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

// Letter spacing
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

const fontFaces = ``;

// Ant Design specific typography tokens
const antTokens = {
  fontFamily: fontFamily.base,
  fontFamilyCode: fontFamily.mono,
  fontSize: fontSize.base,
  fontSizeSM: fontSize.sm,
  fontSizeLG: fontSize.lg,
  fontSizeXL: fontSize.xl,
  fontWeightNormal: fontWeight.normal,
  fontWeightMedium: fontWeight.medium,
  fontWeightStrong: fontWeight.semibold,
  lineHeight: lineHeight.normal,
  lineHeightLG: lineHeight.relaxed,
  lineHeightSM: lineHeight.tight,
};

// Export the complete typography object
export const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  fontFaces,
  ant: antTokens,
} as const;

export type Typography = typeof typography;
