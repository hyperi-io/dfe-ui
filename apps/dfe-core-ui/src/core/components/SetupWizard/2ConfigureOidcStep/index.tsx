import { NotificationCard } from '@/core/components/NotificationCard';
import { useSetParams } from '@/core/components/SetupWizard/helpers';
import { SkipForNow } from '@/core/components/SetupWizard/SkipForNow';
import { useCreateOidcProvider } from '@/core/hooks/useCreateOidcProvider';
import { useFetchOidcProviderDetail } from '@/core/hooks/useFetchOidcProviderDetail';
import { useUpdateOidcProvider } from '@/core/hooks/useUpdateOidcProvider';
import { CreateUpdateOidcProviderFormData } from '@/core/validationSchemas/oidcProviders.schema';
import { IconArrowRight } from '@repo/dfe-icons';
import { Button, Card, Form, Spin } from 'antd';
import { useState } from 'react';
import { ConfigureOIDCForm } from './ConfigureOIDCForm';
import { TestOIDCConnection } from './TestOIDCConnection';

export const ConfigureOidcStep = ({ goNext }: { goNext: () => void }) => {
  const {
    params: { oidc_provider_name },
    setParams,
  } = useSetParams();
  const [isOidcTested, setIsOidcTested] = useState(false);
  const [form] = Form.useForm();
  const {
    mutate: createOidcProvider,
    isPending: isCreateOidcProviderPending,
    error: createOidcProviderError,
  } = useCreateOidcProvider({
    onSuccess: ({ name }) => {
      setParams({ oidc_provider_name: name });
    },
  });

  const {
    mutate: updateOidcProvider,
    isPending: isUpdateOidcProviderPending,
    error: updateOidcProviderError,
  } = useUpdateOidcProvider({
    name: oidc_provider_name,
  });

  const {
    data: oidcProvider,
    isLoading: isOidcProviderLoading,
    error: oidcProviderError,
  } = useFetchOidcProviderDetail({
    name: oidc_provider_name,
    onError: (error) => {
      if (error.status === 404) {
        setIsOidcTested(false);
        setParams({ oidc_provider_name: null });
      }
    },
    retry: false,
  });

  const handleFinish = (values: CreateUpdateOidcProviderFormData) => {
    if (oidc_provider_name) {
      updateOidcProvider(values);
    }

    createOidcProvider(values);
  };
  return (
    <Card
      classNames={{
        root: 'w-2/3',
        body: 'flex flex-col gap-2',
      }}
    >
      <h1 className="text-2xl font-light">Configure OIDC</h1>
      {oidcProviderError && (
        <NotificationCard
          title="An unexpected error occurred fetching OIDC provider"
          description={oidcProviderError?.message}
          type="error"
        />
      )}

      {isOidcProviderLoading && (
        <>
          <Spin /> <span className="sr-only">Loading OIDC provider...</span>
        </>
      )}
      {!isOidcProviderLoading && (
        <>
          <ConfigureOIDCForm
            error={createOidcProviderError || updateOidcProviderError}
            isSubmitting={
              isCreateOidcProviderPending || isUpdateOidcProviderPending
            }
            form={form}
            onFinish={handleFinish}
            initialValues={oidcProvider}
            submitButtonLabel={
              oidc_provider_name ? 'Update OIDC Provider' : 'Add OIDC Provider'
            }
            hasReset={!!oidc_provider_name}
            disabledFields={{
              name: !!oidc_provider_name,
            }}
          />

          {oidc_provider_name && (
            <TestOIDCConnection
              oidcProviderName={oidc_provider_name}
              setIsOidcTested={setIsOidcTested}
            />
          )}
        </>
      )}
      <div className="flex flex-row justify-between mt-2">
        <div className="flex flex-row gap-6 ml-auto">
          <SkipForNow
            goNext={goNext}
            title={
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">
                  Skipping this step will enable local mode.
                </p>
                <p className="text-xs">
                  You will need to manually add users to the system.
                </p>
                <p className="text-xs">
                  You can always configure this later in the app.
                </p>
              </div>
            }
          />

          {isOidcTested && (
            <Button type="text" className="text-light p-0" onClick={goNext}>
              Next <IconArrowRight />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
