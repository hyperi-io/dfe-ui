import type { AliasToken } from 'antd/es/theme/internal';

// Base spacing unit (4px)
const BASE = 4;

// Space scale
export const space = {
  xs: BASE, // 4px
  sm: BASE * 2, // 8px
  md: BASE * 4, // 16px
  lg: BASE * 6, // 24px
  xl: BASE * 8, // 32px
  '2xl': BASE * 12, // 48px
  '3xl': BASE * 16, // 64px
} as const;

// Layout specific spacing
export const layout = {
  maxWidth: 1200,
  containerPadding: space.md,
  sidebarWidth: 256,
  headerHeight: 64,
  footerHeight: 48,
  pageMargin: space.xl,
  sectionGap: space['2xl'],
} as const;

// Component specific spacing
export const component = {
  borderRadius: {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
  },
  padding: {
    sm: space.sm,
    md: space.md,
    lg: space.lg,
  },
  margin: {
    sm: space.sm,
    md: space.md,
    lg: space.lg,
  },
} as const;

// Z-index scale
const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
} as const;

// Ant Design specific spacing tokens
const antTokens: Partial<AliasToken> = {
  // Padding
  padding: space.md,
  paddingXS: space.xs,
  paddingSM: space.sm,
  paddingLG: space.lg,
  paddingXL: space.xl,

  // Margin
  margin: space.md,
  marginXS: space.xs,
  marginSM: space.sm,
  marginLG: space.lg,
  marginXL: space.xl,

  // Control sizing
  controlHeight: 32,
  controlHeightSM: 24,
  controlHeightLG: 40,
};

// Export the complete spacing object
export const spacingSystem = {
  ...antTokens,
  space,
  layout,
  component,
  zIndex,
  ant: antTokens,
} as const;

export const spacing = {
  space,
  layout,
  component,
  zIndex,
  ant: antTokens,
} as const;

export type Spacing = typeof spacing;
