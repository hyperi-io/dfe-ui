'use client';

import { RbacProtected } from '@/core/components/RbacProtected';
import { useSeedServiceConfigs } from '@/Services/hooks/serviceConfigs/useSeedServiceConfigs';
import { IconRefresh } from '@repo/dfe-icons';
import { App, Button } from 'antd';

export const SeedServiceConfigs = () => {
  const { notification } = App.useApp();

  const { mutate: seedServiceConfigs, isPending } = useSeedServiceConfigs({
    onSuccess: (response) => {
      notification.success({
        title: 'Service configs seeded successfully',
        description: `Seeded ${response.seeded} service configs`,
        placement: 'bottomLeft',
      });
    },
    onError: (error) => {
      notification.error({
        title: 'Error seeding service configs',
        description: error.message,
        placement: 'bottomLeft',
      });
    },
  });

  const handleSeedServiceConfigs = () => {
    seedServiceConfigs();
  };

  return (
    <RbacProtected action={RbacProtected.rbacActions.service_write}>
      <RbacProtected.Unrestricted>
        <Button
          type="default"
          className="border border-tertiary text-tertiary"
          icon={<IconRefresh className="text-tertiary" />}
          onClick={handleSeedServiceConfigs}
          loading={isPending}
        >
          Seed Service Configs
        </Button>
      </RbacProtected.Unrestricted>
      <RbacProtected.Restricted>
        <Button
          type="default"
          className="border border-tertiary text-tertiary"
          icon={<IconRefresh className="text-tertiary" />}
          disabled
        >
          Seed Service Configs
        </Button>
      </RbacProtected.Restricted>
    </RbacProtected>
  );
};
