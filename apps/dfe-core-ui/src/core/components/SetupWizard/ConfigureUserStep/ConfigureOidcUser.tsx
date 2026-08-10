import { NotificationCard } from '@/core/components/NotificationCard';
import { Button } from 'antd';
import { useState } from 'react';
import { OidcLoginPopup } from './OidcLoginPopup';

export const ConfigureOidcUser = ({
  setActiveKey,
}: {
  setActiveKey: (key: 'configure-local-user') => void;
}) => {
  const [showOidcLoginPopup, setShowOidcLoginPopup] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <NotificationCard
        title="You have configured the system to use an OIDC provider."
        classNames={{
          container: 'w-full',
        }}
        action={
          <Button
            className="ml-auto"
            onClick={() => setShowOidcLoginPopup(true)}
            type="primary"
          >
            Login with OIDC
          </Button>
        }
        description={
          <div className="flex flex-col gap-2 w-full">
            <p>
              Please login with your user and configure your user account. You
              can configure additional user accounts in the app later.
            </p>
            <p>
              If you&apos;d prefer to create a local user instead, you can do so
              <Button
                type="text"
                className="px-1 text-medium hover:underline"
                onClick={() => setActiveKey('configure-local-user')}
              >
                here
              </Button>
            </p>

            {showOidcLoginPopup && (
              <OidcLoginPopup closePopup={() => setShowOidcLoginPopup(false)} />
            )}
          </div>
        }
      />
    </div>
  );
};
