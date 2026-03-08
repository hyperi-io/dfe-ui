import type { Preview } from '@storybook/react';
import React from 'react';
import '../src/app/globals.css';
import { CompatibleStyleWrapper } from '../src/core/components/CompatibleStyleWrapper';

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <CompatibleStyleWrapper>
        <Story />
      </CompatibleStyleWrapper>
    ),
  ],
};

export default preview;
