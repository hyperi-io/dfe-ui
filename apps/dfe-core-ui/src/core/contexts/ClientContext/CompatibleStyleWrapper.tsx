'use client';

import React from 'react';

import { App as AntdApp, ConfigProvider } from 'antd';

import { useTheme } from '@/core/contexts/ClientContext/ThemeContext';
import { colors } from '@/core/utils/theme';
import {
  darkAlgorithm,
  defaultAlgorithm,
} from '@/core/utils/theme/themeTokens';
import { typography } from '@/core/utils/theme/tokens/typography';
import { StyleProvider } from '@ant-design/cssinjs';

/* CompatibleStyleWrapper is a wrapper component that ensures the correct order of the layers
  This prevents tailwind 4 styles from being overridden by the antd styles
  *most of the time*
  https://ant.design/docs/react/compatible-style#layer
  https://tailwindcss.com/docs/preflight#overview
*/

const CompatibleStyleProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { colorMode } = useTheme();
  return (
    <StyleProvider layer>
      <ConfigProvider
        theme={{
          algorithm: [colorMode === 'light' ? defaultAlgorithm : darkAlgorithm],
          token: {
            fontFamily: typography.fontFamily.base,
            fontFamilyCode: typography.fontFamily.mono,
            colorPrimary: colors.brand.tertiary,
          },
          components: {
            Typography: {
              fontSizeHeading1: typography.fontSize['xl'],
              fontSizeHeading2: typography.fontSize['lg'],
              fontSizeHeading3: typography.fontSize['md'],
              fontSizeHeading4: typography.fontSize['base'],
              fontSizeHeading5: typography.fontSize['sm'],
            },
          },
        }}
      >
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </StyleProvider>
  );
};

export const CompatibleStyleWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <CompatibleStyleProviders>{children}</CompatibleStyleProviders>;
};
