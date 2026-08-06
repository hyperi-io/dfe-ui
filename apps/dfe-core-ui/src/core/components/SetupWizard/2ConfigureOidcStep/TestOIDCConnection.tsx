import { NotificationCard } from '@/core/components/NotificationCard';
import { useTestOidcProvider } from '@/core/hooks/useTestOidcProvider';
import { useEffect } from 'react';

export const TestOIDCConnection = ({
  oidcProviderName,
  setIsOidcTested,
}: {
  oidcProviderName: string;
  setIsOidcTested: (isOidcTested: boolean) => void;
}) => {
  const {
    data: { success, message } = {},
    isLoading,
    error,
  } = useTestOidcProvider({
    name: oidcProviderName,
  });

  useEffect(() => {
    if (success) {
      setIsOidcTested(true);
    }
  }, [success, setIsOidcTested]);

  return (
    <>
      <NotificationCard
        title={
          isLoading
            ? 'Testing OIDC Connection...'
            : success
              ? 'OIDC Connection Successful'
              : 'OIDC Connection Failed'
        }
        description={error?.message || message}
        type={success ? 'success' : 'error'}
      />
    </>
  );
};
