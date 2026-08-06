import { useSetParams } from '@/core/components/SetupWizard/helpers';
import { SkipForNow } from '@/core/components/SetupWizard/SkipForNow';
import { useCreateOidcProvider } from '@/core/hooks/useCreateOidcProvider';
import { CreateUpdateOidcProviderFormData } from '@/core/validationSchemas/oidcProviders.schema';
import { IconArrowRight } from '@repo/dfe-icons';
import { Button, Card, Form } from 'antd';
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
    isPending,
    error,
  } = useCreateOidcProvider({
    onSuccess: ({ name }) => {
      setParams({ oidc_provider_name: name });
    },
  });

  const handleFinish = (values: CreateUpdateOidcProviderFormData) => {
    createOidcProvider(values);
  };
  return (
    <Card
      classNames={{
        root: 'w-2/5',
        body: 'flex flex-col gap-2',
      }}
    >
      <h1 className="text-2xl font-light">Configure OIDC</h1>

      <ConfigureOIDCForm error={error} form={form} onFinish={handleFinish} />

      {oidc_provider_name && (
        <TestOIDCConnection
          oidcProviderName={oidc_provider_name}
          setIsOidcTested={setIsOidcTested}
        />
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
            <Button
              loading={isPending}
              type="text"
              className="text-light p-0"
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
