import { GenericErrorCard } from '@/core/components/GenericError';
import { useTestOidcProvider } from '@/core/hooks/useTestOidcProvider';
import { useVerifyOidcLogin } from '@/core/hooks/useVerifyOidcLogin';
import { IconCircleCheck, IconCircleX } from '@repo/dfe-icons';
import { Card, Spin } from 'antd';
import { Fragment } from 'react/jsx-runtime';

const dataListTermStyle =
  'text-sm font-medium text-gray-500 dark:text-gray-400';

export const TestOidcProviderResponse = ({
  oidcProviderName,
}: {
  oidcProviderName: string;
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
    isLoading: isVerifyOidcLoginLoading,
    error: verifyOidcLoginError,
  } = useVerifyOidcLogin({
    name: oidcProviderName,
  });

  if (isTestOidcProviderLoading || isVerifyOidcLoginLoading) {
    return (
      <>
        <Spin />{' '}
        <span className="sr-only">Loading OIDC provider test response</span>
      </>
    );
  }

  if (testOidcProviderError || verifyOidcLoginError) {
    return (
      <div className="flex flex-col gap-4">
        <GenericErrorCard
          title="Error testing OIDC provider"
          description={testOidcProviderError?.message}
        />
        <GenericErrorCard
          title="Error verifying OIDC login"
          description={verifyOidcLoginError?.message}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-2">
      <Card size="small">
        <dl className="grid grid-cols-[200px_1fr] gap-2">
          <dt className={dataListTermStyle}>Test OIDC Provider Status</dt>
          <dd>
            {testOidcProviderData?.success ? (
              <span className="flex items-center gap-2">
                <IconCircleCheck className="text-green-500 shrink-0" /> Success
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <IconCircleX className="text-red-500 shrink-0" /> Error
              </span>
            )}
          </dd>
          <dt className={dataListTermStyle}>Message</dt>
          <dd>{testOidcProviderData?.message}</dd>
        </dl>
      </Card>

      <Card size="small">
        <dl className="grid grid-cols-[200px_1fr] gap-2">
          <dt className={dataListTermStyle}>Verify OIDC Login Status</dt>
          <dd>
            {verifyOidcLoginData?.ok ? (
              <span className="flex items-center gap-2">
                <IconCircleCheck className="text-green-500 shrink-0" /> Success
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <IconCircleX className="text-red-500 shrink-0" /> Error
              </span>
            )}
          </dd>
          <dt className={dataListTermStyle}>Checks</dt>
          <dd>
            <dl className="list-disc list-inside">
              {verifyOidcLoginData?.checks.map((check) => (
                <Fragment key={check.name}>
                  <dt className={dataListTermStyle}>{check.name}</dt>
                  <dd>
                    {check.ok ? (
                      <span className="flex items-center gap-2">
                        <IconCircleCheck className="text-green-500 shrink-0" />{' '}
                        {check.detail}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <IconCircleX className="text-red-500 shrink-0" />{' '}
                        {check.detail}
                      </span>
                    )}
                  </dd>
                </Fragment>
              ))}
            </dl>
          </dd>
        </dl>
      </Card>
    </div>
  );
};
