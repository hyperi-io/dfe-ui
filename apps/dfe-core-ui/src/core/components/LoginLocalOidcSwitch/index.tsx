import { useFetchSetupStatus } from '@/core/hooks/useFetchSetupStatus';
import { Spin, Tabs } from 'antd';
import { LocalLoginForm } from './LocalLoginForm';
import { LoginWithOidcForm } from './LoginWithOidcForm';

export const LoginLocalOidcSwitch = ({
  callbackUrl,
}: {
  callbackUrl: string;
}) => {
  const { data: { oidc_providers = [] } = {}, isLoading } =
    useFetchSetupStatus();
  if (isLoading) {
    return (
      <>
        <Spin /> <span className="sr-only">Loading setup</span>
      </>
    );
  }

  return oidc_providers.length > 0 ? (
    <Tabs
      className="w-full"
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
    <LocalLoginForm callbackUrl={callbackUrl} />
  );
};
