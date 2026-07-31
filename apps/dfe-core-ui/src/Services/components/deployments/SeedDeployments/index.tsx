'use client';

import { RbacProtected } from '@/core/components/RbacProtected';
import { useSeedDeployments } from '@/Services/hooks/deployments/useSeedDeployments';
import { IconRefresh } from '@repo/dfe-icons';
import { App, Button } from 'antd';

export const SeedDeployments = () => {
  const { notification } = App.useApp();

  const { mutate: seedDeployments, isPending } = useSeedDeployments({
    onSuccess: (response) => {
      notification.success({
        title: 'Deployments seeded successfully',
        description: `Seeded ${response.seeded} deployments`,
        placement: 'bottomLeft',
      });
    },
    onError: (error) => {
      notification.error({
        title: 'Error seeding deployments',
        description: error.message,
        placement: 'bottomLeft',
      });
    },
  });

  const handleSeedDeployments = () => {
    seedDeployments();
  };

  return (
    <RbacProtected action={RbacProtected.rbacActions.deployment_write}>
      <RbacProtected.Unrestricted>
        <Button
          type="default"
          className="border border-tertiary text-tertiary"
          icon={<IconRefresh className="text-tertiary" />}
          onClick={handleSeedDeployments}
          loading={isPending}
        >
          Seed Deployments
        </Button>
      </RbacProtected.Unrestricted>
      <RbacProtected.Restricted>
        <Button
          type="default"
          className="border border-tertiary text-tertiary"
          icon={<IconRefresh className="text-tertiary" />}
          disabled
        >
          Seed Deployments
        </Button>
      </RbacProtected.Restricted>
    </RbacProtected>
  );
};
