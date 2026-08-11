import { NotificationCard } from '@/core/components/NotificationCard';
import { IconArrowLeft, IconArrowRight } from '@repo/dfe-icons';
import { Button, Card, Tabs } from 'antd';
import { useState } from 'react';
import { ConfigureLocalUser } from './ConfigureLocalUser';
import { ConfigureOidcUser } from './ConfigureOidcUser';

type ActiveKey = 'configure-oidc-user' | 'configure-local-user';
export const ConfigureUserStep = ({
  oidcProviderName,
  userCreated,
  goNext,
  goPrevious,
}: {
  oidcProviderName: string | null | undefined;
  userCreated: boolean;
  goNext: () => void;
  goPrevious: () => void;
}) => {
  const [activeKey, setActiveKey] = useState<ActiveKey>(
    !!oidcProviderName ? 'configure-oidc-user' : 'configure-local-user',
  );

  return (
    <Card
      classNames={{
        root: 'w-2/3',
        body: 'flex flex-col gap-2',
      }}
    >
      <h1 className="text-2xl font-light">Configure User</h1>

      {userCreated ? (
        <NotificationCard
          title="Account Created"
          description="Your account has been created successfully."
          type="success"
        />
      ) : (
        <Tabs
          activeKey={activeKey}
          onChange={(key: string) => setActiveKey(key as ActiveKey)}
          items={[
            ...(!!oidcProviderName
              ? [
                  {
                    key: 'configure-oidc-user',
                    label: 'Configure OIDC User',
                    children: (
                      <ConfigureOidcUser
                        setActiveKey={setActiveKey}
                        oidcProviderName={oidcProviderName}
                      />
                    ),
                  },
                ]
              : []),
            {
              key: 'configure-local-user',
              label: 'Configure Local User',
              children: <ConfigureLocalUser goNext={goNext} />,
            },
          ]}
        />
      )}

      <div className="flex flex-row justify-between mt-2">
        <Button
          type="text"
          className="text-light p-0 pr-2"
          onClick={goPrevious}
        >
          <IconArrowLeft /> Back
        </Button>

        <div className="flex flex-row gap-6">
          {userCreated && (
            <Button
              type="text"
              className="text-light p-0 pl-2"
              onClick={goNext}
            >
              Next <IconArrowRight />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
