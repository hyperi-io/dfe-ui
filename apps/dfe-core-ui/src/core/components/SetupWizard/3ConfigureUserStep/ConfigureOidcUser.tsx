import { NotificationCard } from '@/core/components/NotificationCard';
import { Button } from 'antd';

export const ConfigureOidcUser = ({
  setActiveKey,
}: {
  setActiveKey: (key: 'configure-local-user') => void;
}) => {
  return (
    <div className="flex flex-col gap-4">
      <NotificationCard
        title="You have configured the system to use an OIDC provider."
        description={
          <div className="flex flex-col gap-2">
            <p>
              Please login with your user and configure your user account. You
              can configure additional users in the app later.
            </p>
            <p>
              If you&apos;d prefer to create a local user instead, you can do so
              over
              <Button
                type="text"
                className="px-1 text-medium hover:underline"
                onClick={() => setActiveKey('configure-local-user')}
              >
                here
              </Button>
            </p>
          </div>
        }
      />
    </div>
  );
};
