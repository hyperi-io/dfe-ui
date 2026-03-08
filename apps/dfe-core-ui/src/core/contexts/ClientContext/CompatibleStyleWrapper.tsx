import React from 'react';

import { ConfigProvider } from 'antd';

// import '@/core/config/AceEditor/init';

import { ThemeProvider, useTheme } from '@/core/contexts/ThemeContext';
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
          algorithm: colorMode === 'light' ? defaultAlgorithm : darkAlgorithm,
          token: {
            fontFamily: typography.fontFamily.base,
            fontFamilyCode: typography.fontFamily.mono,
          },
        }}
      >
        {children}
      </ConfigProvider>
    </StyleProvider>
  );
};

export const CompatibleStyleWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ThemeProvider>
      <CompatibleStyleProviders>{children}</CompatibleStyleProviders>
    </ThemeProvider>
  );
};
