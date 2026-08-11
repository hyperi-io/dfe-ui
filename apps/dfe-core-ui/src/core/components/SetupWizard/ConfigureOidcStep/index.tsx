import { SkipForNow } from '@/core/components/SetupWizard/SkipForNow';
import { useCreateOidcProvider } from '@/core/hooks/useCreateOidcProvider';
import { TOidcProvider } from '@/core/hooks/useFetchSetupStatus/types';
import { useUpdateOidcProvider } from '@/core/hooks/useUpdateOidcProvider';
import { CreateUpdateOidcProviderFormData } from '@/core/validationSchemas/oidcProviders.schema';
import { IconArrowRight } from '@repo/dfe-icons';
import { Button, Card, Form } from 'antd';
import { useState } from 'react';
import { ConfigureOIDCForm } from './ConfigureOIDCForm';
import { TestOIDCConnection } from './TestOIDCConnection';

export const ConfigureOidcStep = ({
  goNext,
  oidcProvider,
}: {
  goNext: () => void;
  oidcProvider: TOidcProvider;
}) => {
  const [isOidcTested, setIsOidcTested] = useState(false);
  const [form] = Form.useForm();
  const {
    mutate: createOidcProvider,
    isPending: isCreateOidcProviderPending,
    error: createOidcProviderError,
  } = useCreateOidcProvider();

  const {
    mutate: updateOidcProvider,
    isPending: isUpdateOidcProviderPending,
    error: updateOidcProviderError,
  } = useUpdateOidcProvider({
    name: oidcProvider?.name ?? '',
  });

  const handleFinish = (values: CreateUpdateOidcProviderFormData) => {
    if (oidcProvider?.name) {
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
      <h1 className="text-2xl font-light">Configure OIDC Provider</h1>

      <>
        <ConfigureOIDCForm
          error={createOidcProviderError || updateOidcProviderError}
          isSubmitting={
            isCreateOidcProviderPending || isUpdateOidcProviderPending
          }
          form={form}
          onFinish={handleFinish}
          initialValues={{
            ...oidcProvider,
          }}
          submitButtonLabel={
            oidcProvider?.name ? 'Update OIDC Provider' : 'Add OIDC Provider'
          }
          hasReset={!!oidcProvider?.name}
          disabledFields={{
            name: !!oidcProvider?.name,
          }}
        />

        {oidcProvider?.name && (
          <TestOIDCConnection
            oidcProviderName={oidcProvider?.name}
            setIsOidcTested={setIsOidcTested}
          />
        )}
      </>

      <div className="flex flex-row justify-between mt-2">
        <div className="flex flex-row gap-4 ml-auto">
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
            <Button
              type="text"
              className="text-light p-0 pl-2"
              onClick={goNext}
            >
              Next <IconArrowRight />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
