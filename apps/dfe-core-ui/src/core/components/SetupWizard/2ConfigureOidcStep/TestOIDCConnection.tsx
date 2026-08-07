import { NotificationCard } from '@/core/components/NotificationCard';
import { useTestOidcProvider } from '@/core/hooks/useTestOidcProvider';
import { useVerifyOidcLogin } from '@/core/hooks/useVerifyOidcLogin';
import { IconCircleCheck, IconCircleX } from '@repo/dfe-icons';
import { Fragment, useEffect } from 'react';

export const TestOIDCConnection = ({
  oidcProviderName,
  setIsOidcTested,
}: {
  oidcProviderName: string;
  setIsOidcTested: (isOidcTested: boolean) => void;
}) => {
  const {
    data: testOidcProviderData,
    isLoading: isTestOidcProviderLoading,
    error: testOidcProviderError,
  } = useTestOidcProvider({
    name: oidcProviderName,
  });

  const {
    data: verifyOidcLoginData,
    isLoading: isVerifyOidcLoginDataLoading,
    error: verifyOidcLoginError,
  } = useVerifyOidcLogin({
    name: oidcProviderName,
  });

  useEffect(() => {
    if (testOidcProviderData?.success && verifyOidcLoginData?.ok) {
      setIsOidcTested(true);
    }
  }, [testOidcProviderData?.success, verifyOidcLoginData?.ok, setIsOidcTested]);

  return (
    <div className="flex flex-col gap-2">
      {testOidcProviderError && (
        <NotificationCard
          title="An unexpected error occurred testing OIDC provider"
          description={testOidcProviderError?.message}
          type="error"
        />
      )}
      <NotificationCard
        title={
          <>
            {isTestOidcProviderLoading ? (
              'Testing OIDC provider...'
            ) : (
              <span className="flex gap-1 items-center font-medium text-sm">
                {testOidcProviderData?.success ? (
                  <>
                    <IconCircleCheck className="ml-1 text-green-500" />
                    Passed
                  </>
                ) : (
                  <>
                    <IconCircleX className="ml-1 text-red-500" />
                    Failed
                  </>
                )}{' '}
                OIDC Provider Test
              </span>
            )}
          </>
        }
        description={testOidcProviderData?.message}
        type={testOidcProviderData?.success ? 'success' : 'default'}
        variant={testOidcProviderData?.success ? 'default' : 'ghost'}
      />

      {verifyOidcLoginError && (
        <NotificationCard
          title="An unexpected error occurred verifying OIDC login"
          description={verifyOidcLoginError?.message}
          type="error"
        />
      )}

      <NotificationCard
        title={
          <>
            {isVerifyOidcLoginDataLoading ? (
              'Testing OIDC login...'
            ) : (
              <span className="flex gap-1 items-center font-medium text-sm">
                {verifyOidcLoginData?.ok ? (
                  <>
                    <IconCircleCheck className="ml-1 text-green-500" />
                    Passed
                  </>
                ) : (
                  <>
                    <IconCircleX className="ml-1 text-red-500" />
                    Failed
                  </>
                )}{' '}
                OIDC Login Test
              </span>
            )}
          </>
        }
        description={
          verifyOidcLoginData?.checks && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 items-center">
              {verifyOidcLoginData.checks.map((check) => (
                <Fragment key={check.name}>
                  <dt className="flex gap-1 items-center">
                    {check.ok ? (
                      <IconCircleCheck className="ml-1 text-green-500" />
                    ) : (
                      <IconCircleX className="ml-1 text-red-500" />
                    )}
                    {check.name}
                  </dt>
                  <dd>{check.detail}</dd>
                </Fragment>
              ))}
            </dl>
          )
        }
        type={verifyOidcLoginData?.ok ? 'success' : 'default'}
        variant={verifyOidcLoginData?.ok ? 'default' : 'ghost'}
      />
    </div>
  );
};
