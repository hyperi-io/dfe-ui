import { useSetParams } from '@/core/components/SetupWizard/helpers';
import { IconArrowLeft, IconArrowRight } from '@repo/dfe-icons';
import { Button, Card, Tabs } from 'antd';
import { useState } from 'react';
import { ConfigureLocalUser } from './ConfigureLocalUser';
import { ConfigureOidcUser } from './ConfigureOidcUser';

type ActiveKey = 'configure-oidc-user' | 'configure-local-user';
export const ConfigureUserStep = ({
  goNext,
  goPrevious,
}: {
  goNext: () => void;
  goPrevious: () => void;
}) => {
  const {
    params: { oidc_provider_name },
  } = useSetParams();

  const [activeKey, setActiveKey] = useState<ActiveKey>(
    !!oidc_provider_name ? 'configure-oidc-user' : 'configure-local-user',
  );

  return (
    <Card
      classNames={{
        root: 'w-2/3',
        body: 'flex flex-col gap-2',
      }}
    >
      <h1 className="text-2xl font-light">Configure User</h1>

      <Tabs
        activeKey={activeKey}
        onChange={(key: string) => setActiveKey(key as ActiveKey)}
        items={[
          ...(!!oidc_provider_name
            ? [
                {
                  key: 'configure-oidc-user',
                  label: 'Configure OIDC User',
                  children: <ConfigureOidcUser setActiveKey={setActiveKey} />,
                },
              ]
            : []),
          {
            key: 'configure-local-user',
            label: 'Configure Local User',
            children: <ConfigureLocalUser />,
          },
        ]}
      />

      <div className="flex flex-row justify-between mt-10">
        <Button type="text" className="text-light p-0" onClick={goPrevious}>
          <IconArrowLeft /> Back
        </Button>
        <div className="flex flex-row gap-6">
          <Button type="text" className="text-light p-0" onClick={goNext}>
            Next <IconArrowRight />
          </Button>
        </div>
      </div>
    </Card>
  );
};
