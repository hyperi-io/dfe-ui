import type { ThemeConfig } from 'antd';
import { colors } from './tokens/colors';
import { spacing } from './tokens/spacing';
import { typography } from './tokens/typography';

// Theme interface
export interface Theme {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  utils: {
    pxToRem: (px: number) => string;
  };
}

// Create our custom theme
export const theme: Theme = {
  colors,
  typography,
  spacing,
  utils: {
    pxToRem: (px: number) => `${px / 16}rem`,
  },
};

// Configure theme for Ant Design
// https://ant.design/theme-editor#component-size
export const antConfig: ThemeConfig = {
  token: {
    ...colors.ant,
    ...typography.ant,
    ...spacing.ant,
    colorBgContainer: colors.neutral[0],
    colorBgElevated: colors.neutral[0],
    colorBgLayout: colors.neutral[50],
    boxShadowSecondary: `0 4px 12px ${colors.alpha.black[10]}`,
    fontSize: 14,
    fontFamily: typography.fontFamily.base,
  },
  components: {
    Tabs: {
      // itemSelectedColor: 'red',
      // itemHoverColor: 'green',
      // itemActiveColor: colors.semantic.success,
      // itemColor: colors.semantic.success,
      // borderRadius: 24,
      // fontFamily: typography.fontFamily.base,
      // fontSize: 14,
    },
    Input: {
      // activeBorderColor: "rgb(255,255,255)",
      // hoverBorderColor: "rgb(255,255,255)",
      // colorBorder: "rgb(255,255,255)"
    },
    Button: {
      // contentFontSize: 14,
      // contentFontSizeSM: 12,
      // paddingInline: 24,
      // paddingInlineSM: 16,
      // controlHeight:49,
      // defaultBg: colors.neutral[0],
      // defaultBorderColor: colors.brand.primary,
      // borderRadius: 200,
      // fontFamily: typography.fontFamily.base,
      // controlHeightLG: 40,
      // controlHeightSM: 24,
      // paddingContentHorizontal: spacing.space.md,
    },
    Card: {
      // borderRadius: 8,
      // fontFamily: typography.fontFamily.base,
      // headerFontSize: 14,
    },
    Table: {
      // borderRadius: 8,
      // fontFamily: typography.fontFamily.base,
      // headerBg: colors.neutral[50],
      // headerColor: colors.neutral[900],
      // headerSortActiveBg: colors.neutral[100],
      // headerSortHoverBg: colors.neutral[100],
      // rowHoverBg: colors.neutral[50],
      // headerSplitColor: colors.neutral[200],
      // borderColor: colors.neutral[200],
      // fontSize: 14,
    },
    Layout: {
      // headerBg: colors.neutral[0],
      // headerHeight: 64,
      // headerPadding: `0 ${spacing.space.lg}px`,
      // siderBg: colors.neutral[0],
      // triggerBg: colors.neutral[100],
    },
    Menu: {
      // itemBg: 'transparent',
      // itemSelectedBg: colors.neutral[50],
      // itemHoverBg: colors.neutral[50],
      // itemSelectedColor: colors.brand.primary,
      // itemColor: colors.neutral[700],
      // subMenuItemBg: 'transparent',
      // horizontalItemSelectedBg: 'transparent',
      // horizontalItemHoverBg: 'transparent',
      // activeBarBorderWidth: 0,
      // itemHeight: 40,
      // itemMarginInline: 0,
      // padding: spacing.space.sm,
      // margin: 0,
      // borderRadius: 6,
      // fontFamily: typography.fontFamily.base,
      // fontSize: 14,
    },
    Typography: {
      // fontFamilyCode: typography.fontFamily.mono,
      // fontFamily: typography.fontFamily.base,
      // titleMarginTop: 0,
      // titleMarginBottom: spacing.space.sm,
      // fontSize: 14,
    },
  },
};

// Export tokens
export * from './tokens/colors';
export * from './tokens/spacing';
export * from './tokens/typography';

// Export types
export * from './types';
