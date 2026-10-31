import { Drawer } from '@/core/components/Drawer';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ViewActionDetail } from './ViewActionDetail';

const meta: Meta<typeof ViewActionDetail> = {
  title: 'Platform/Governance/ViewActionDetail',
  component: ViewActionDetail,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story, { args }) => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { staleTime: Infinity } },
      });
      queryClient.setQueryData(
        QUERY_KEYS.governance.action({ name: args.name }),
        {
          name: args.name,
          description: 'Route normal traffic through the receiver',
          required_action: 'action:invoke:receiver-normal',
          changes: [
            {
              cls: 'infra',
              name: 'receiver',
              path: 'receiver.cpu_limit',
              value: { $unset: true },
            },
            {
              cls: 'infra',
              name: 'receiver',
              path: 'receiver.mode',
              value: 'normal',
            },
          ],
        },
      );
      return (
        <QueryClientProvider client={queryClient}>
          <Drawer title="View Action" open>
            <Story />
          </Drawer>
        </QueryClientProvider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof ViewActionDetail>;

export const ObjectAndStringValues: Story = {
  args: { name: 'receiver-normal' },
};
