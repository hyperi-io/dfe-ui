import type { AliasToken } from 'antd/es/theme/internal';

// Base color palette
export const brand = {
  primary: '#000647', // Deep Navy Blue
  secondary: '#10398f', // Medium Blue
  tertiary: '#2ea4f6', // Light Blue
  success: '#2ded88', // Brand Green
} as const;

// Gradients
export const gradient = {
  primary: `linear-gradient(90deg, ${brand.tertiary} 0%, ${brand.success} 100%)`,
  diagonal: `linear-gradient(135deg, ${brand.tertiary} 0%, ${brand.success} 100%)`,
} as const;

// Semantic Colors
export const semantic = {
  success: brand.success,
  warning: '#faad14',
  error: '#ff4d4f',
  info: brand.tertiary,
} as const;

// Neutral Colors
export const neutral = {
  0: '#ffffff', // Pure white
  50: '#fafafa', // Background alt
  100: '#f5f5f5', // Background
  200: '#e8e8e8', // Border light
  300: '#d9d9d9', // Border
  400: '#bfbfbf', // Disabled
  500: '#8c8c8c', // Text secondary
  600: '#595959', // Text primary
  700: '#262626', // Text intense
  800: '#141414', // Surface dark
  900: '#000000', // Pure black
} as const;

// from Figma
export const figmaColors = {
  light_grey: '#F1F2F2', // Light Grey
  dark_blue: '#000647', // Dark Blue
} as const;

// Functional Colors
export const functional = {
  link: brand.tertiary,
  linkHover: brand.secondary,
  selection: '#e6f4ff',
  disabled: 'rgba(0, 0, 0, 0.25)',
} as const;

// Alpha colors for overlays and shadows
export const alpha = {
  black: {
    5: 'rgba(0, 0, 0, 0.05)',
    10: 'rgba(0, 0, 0, 0.1)',
    20: 'rgba(0, 0, 0, 0.2)',
    40: 'rgba(0, 0, 0, 0.4)',
    60: 'rgba(0, 0, 0, 0.6)',
    80: 'rgba(0, 0, 0, 0.8)',
  },
  white: {
    5: 'rgba(255, 255, 255, 0.05)',
    10: 'rgba(255, 255, 255, 0.1)',
    20: 'rgba(255, 255, 255, 0.2)',
    40: 'rgba(255, 255, 255, 0.4)',
    60: 'rgba(255, 255, 255, 0.6)',
    80: 'rgba(255, 255, 255, 0.8)',
  },
} as const;

// Ant Design specific color tokens
const antTokens: Partial<AliasToken> = {
  // Brand colors
  colorPrimary: brand.primary,
  colorPrimaryBg: neutral[50],
  colorPrimaryBgHover: neutral[100],
  colorPrimaryBorder: brand.primary,
  colorPrimaryHover: brand.secondary,
  colorPrimaryActive: brand.tertiary,
  colorPrimaryTextHover: brand.secondary,
  colorPrimaryText: brand.primary,
  colorPrimaryTextActive: brand.tertiary,

  // Text colors
  colorText: neutral[600],
  colorTextSecondary: neutral[500],
  colorTextTertiary: neutral[400],
  colorTextQuaternary: neutral[300],

  // Border colors
  colorBorder: neutral[300],
  colorBorderSecondary: neutral[200],

  // Background colors
  colorBgContainer: neutral[0],
  colorBgElevated: neutral[0],
  colorBgLayout: neutral[50],
  colorBgSpotlight: neutral[100],
  colorBgMask: alpha.black[40],

  // Status colors
  colorSuccess: semantic.success,
  colorWarning: semantic.warning,
  colorError: semantic.error,
  colorInfo: semantic.info,

  // Link colors
  colorLink: functional.link,
  colorLinkHover: functional.linkHover,
  colorLinkActive: brand.tertiary,

  // Other
  colorTextDisabled: neutral[400],
  colorBgContainerDisabled: neutral[200],
  colorWhite: neutral[0],
  colorTextBase: neutral[600],
  colorBgBase: neutral[0],
};

// Export the complete colors object
export const colors = {
  brand,
  gradient,
  semantic,
  neutral,
  functional,
  alpha,
  ant: antTokens,
} as const;

export type Colors = typeof colors;
