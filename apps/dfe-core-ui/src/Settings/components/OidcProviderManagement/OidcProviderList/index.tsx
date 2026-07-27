import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { OidcProviderCard } from '@/Settings/components/OidcProviderManagement/OidcProviderCard';
import { useFetchInfiniteFilteredOidcProviders } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Spin } from 'antd';

export const OidcProviderList = () => {
  const {
    data: { items: oidcProviders },
    isFetchingNextPage,
    loadMoreRef,
    isLoading,
    error,
  } = useFetchInfiniteFilteredOidcProviders();
  return (
    <div>
      {isLoading && (
        <>
          <Spin /> <p className="sr-only">Loading OIDC providers</p>
        </>
      )}
      {error && (
        <>
          <GenericErrorCard
            title="Error fetching OIDC providers"
            description={error.message}
          />
        </>
      )}
      {!isLoading && !error && oidcProviders?.length === 0 && (
        <NotificationCard
          className="w-full"
          description="No OIDC providers found"
          icon={<IconInfoCircle />}
        />
      )}
      {oidcProviders && oidcProviders?.length > 0 && (
        <div className="h-[calc(100vh-295px)] overflow-y-auto css-custom-scrollbar">
          <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {oidcProviders?.map((oidcProvider) => (
              <li key={oidcProvider.name}>
                <OidcProviderCard
                  key={oidcProvider.name}
                  oidcProvider={oidcProvider}
                />
              </li>
            ))}
            <div ref={loadMoreRef} className="h-4 flex justify-center">
              {isFetchingNextPage && <Spin size="small" />}
            </div>
          </ul>
        </div>
      )}
    </div>
  );
};
