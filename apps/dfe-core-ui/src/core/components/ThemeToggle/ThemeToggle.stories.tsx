import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from './index';

const meta: Meta<typeof ThemeToggle> = {
  title: 'Core/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
  argTypes: {
    collapsed: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof ThemeToggle>;

export const Expanded: Story = {
  args: {
    collapsed: false,
  },
};

export const Collapsed: Story = {
  args: {
    collapsed: true,
  },
};
