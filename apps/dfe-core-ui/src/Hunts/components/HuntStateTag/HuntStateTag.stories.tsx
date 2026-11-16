import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { HuntStateTag } from './index';

const meta: Meta<typeof HuntStateTag> = {
  title: 'Hunts/HuntStateTag',
  component: HuntStateTag,
  tags: ['autodocs'],
  argTypes: {
    enabled: { control: 'boolean' },
    autoDisabledAt: { control: 'number' },
    autoDisabledReason: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof HuntStateTag>;

export const Running: Story = {
  args: { enabled: true },
};

export const Disabled: Story = {
  args: { enabled: false },
};

// An auto-disable leaves the YAML's enabled flag on: it is state, not config.
export const AutoDisabled: Story = {
  args: {
    enabled: true,
    autoDisabledAt: 1_763_300_000,
    autoDisabledReason: 'resource_limit:241',
  },
};
