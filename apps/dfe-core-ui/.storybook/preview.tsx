import type { Preview } from '@storybook/nextjs-vite';
import '../src/app/globals.css';
import { CompatibleStyleWrapper } from '../src/core/contexts/ClientContext/CompatibleStyleWrapper';
import { ThemeProvider } from '../src/core/contexts/ClientContext/ThemeContext';

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <CompatibleStyleWrapper>
          <Story />
        </CompatibleStyleWrapper>
      </ThemeProvider>
    ),
  ],
};

export default preview;
