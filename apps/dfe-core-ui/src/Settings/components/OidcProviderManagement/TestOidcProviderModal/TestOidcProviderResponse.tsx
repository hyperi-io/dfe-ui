import { GenericErrorCard } from '@/core/components/GenericError';
import { useTestOidcProvider } from '@/core/hooks/useTestOidcProvider';
import { IconCircleCheck, IconCircleX } from '@repo/dfe-icons';
import { Spin } from 'antd';

const dataListTermStyle =
  'text-sm font-medium text-gray-500 dark:text-gray-400';

export const TestOidcProviderResponse = ({
  oidcProviderName,
}: {
  oidcProviderName: string;
}) => {
  const { data, isLoading, error } = useTestOidcProvider({
    name: oidcProviderName,
  });

  if (isLoading) {
    return (
      <>
        <Spin />{' '}
        <span className="sr-only">Loading OIDC provider test response</span>
      </>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <GenericErrorCard
          title="Error testing OIDC provider"
          description={error.message}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-2 gap-2">
        <dt className={dataListTermStyle}>Status</dt>
        <dd>
          {data?.success ? (
            <span className="flex items-center gap-2">
              <IconCircleCheck className="text-green-500" /> Success
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <IconCircleX className="text-red-500" /> Error
            </span>
          )}
        </dd>
        <dt className={dataListTermStyle}>Message</dt>
        <dd>{data?.message}</dd>
      </dl>
    </div>
  );
};
