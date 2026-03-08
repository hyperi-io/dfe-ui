import type { Meta, StoryObj } from '@storybook/react';
import { IconWrapper } from './index';
import { IconUser, IconSettings } from '@hyperi/icons';

const meta: Meta<typeof IconWrapper> = {
  title: 'Core/IconWrapper',
  component: IconWrapper,
  tags: ['autodocs'],
  argTypes: {
    size: { control: { type: 'number', min: 8, max: 64 } },
    spin: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof IconWrapper>;

export const Default: Story = {
  args: {
    icon: <IconUser />,
    size: 16,
  },
};

export const Large: Story = {
  args: {
    icon: <IconSettings />,
    size: 24,
  },
};

export const Spinning: Story = {
  args: {
    icon: <IconSettings />,
    size: 20,
    spin: true,
  },
};
