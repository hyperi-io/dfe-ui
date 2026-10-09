import { useFetchSetupStatus } from '@/core/hooks/useFetchSetupStatus';
import { cn } from '@/core/utils/style';
import { Spin, Tabs } from 'antd';
import { LocalLoginForm } from './LocalLoginForm';
import { LoginWithOidcForm } from './LoginWithOidcForm';

export const LoginLocalOidcSwitch = ({
  callbackUrl,
  className,
}: {
  callbackUrl: string;
  className?: string;
}) => {
  const { data: { oidc_providers = [] } = {}, isLoading } =
    useFetchSetupStatus();
  if (isLoading) {
    // Keep the form slot's min-height so the card (and logo above it) do not
    // jump when setup finishes and the real form mounts.
    return (
      <div
        className={cn(
          'w-full flex flex-col items-center justify-center',
          className,
        )}
      >
        <Spin />
        <span className="sr-only">Loading setup</span>
      </div>
    );
  }

  return oidc_providers.length > 0 ? (
    <Tabs
      className={cn('w-full', className)}
      items={[
        {
          label: 'Login with OIDC',
          key: 'oidc',
          children: (
            <LoginWithOidcForm
              oidc_providers={oidc_providers}
              callbackUrl={callbackUrl}
            />
          ),
        },
        {
          label: 'Login with Local',
          key: 'local',
          children: <LocalLoginForm callbackUrl={callbackUrl} />,
        },
      ]}
    />
  ) : (
    <LocalLoginForm callbackUrl={callbackUrl} className={className} />
  );
};
