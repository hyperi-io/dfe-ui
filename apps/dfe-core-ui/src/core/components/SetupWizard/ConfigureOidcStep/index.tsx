import { Form } from '@/core/components/Form';
import { SkipForNow } from '@/core/components/SetupWizard/SkipForNow';
import {
  toCreateOidcProviderBody,
  toScopeList,
  toUpdateOidcProviderBody,
} from '@/core/helpers/oidcProviders.helpers';
import { useCreateOidcProvider } from '@/core/hooks/useCreateOidcProvider';
import { TCreateOidcProviderResponse } from '@/core/hooks/useCreateOidcProvider/types';
import { TOidcProvider } from '@/core/hooks/useFetchSetupStatus/types';
import { useUpdateOidcProvider } from '@/core/hooks/useUpdateOidcProvider';
import { CreateUpdateOidcProviderFormData } from '@/core/validationSchemas/oidcProviders.schema';
import { IconArrowLeft, IconArrowRight } from '@repo/dfe-icons';
import { Button, Card } from 'antd';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ConfigureOIDCForm } from './ConfigureOIDCForm';
import { TestOIDCConnection } from './TestOIDCConnection';

export const ConfigureOidcStep = ({
  goPrevious,
  goNext,
  oidcProvider,
}: {
  goPrevious: () => void;
  goNext: () => void;
  oidcProvider: TOidcProvider;
}) => {
  const router = useRouter();
  const [createdOidcProvider, setCreatedOidcProvider] = useState<
    TOidcProvider | TCreateOidcProviderResponse
  >(null);
  const effectiveOidcProvider = oidcProvider ?? createdOidcProvider;
  const [isOidcTested, setIsOidcTested] = useState(false);
  const [form] = Form.useForm();
  const {
    mutate: createOidcProvider,
    isPending: isCreateOidcProviderPending,
    error: createOidcProviderError,
  } = useCreateOidcProvider({
    onSuccess: (data) => {
      setCreatedOidcProvider(data);
      router.refresh();
    },
  });

  const {
    mutate: updateOidcProvider,
    isPending: isUpdateOidcProviderPending,
    error: updateOidcProviderError,
  } = useUpdateOidcProvider({
    name: effectiveOidcProvider?.name ?? '',
  });

  // Setup status carries scopes as one string, a created provider as a list.
  const initialScopes =
    effectiveOidcProvider && 'scopes' in effectiveOidcProvider
      ? toScopeList(effectiveOidcProvider.scopes)
      : undefined;

  const handleFinish = (values: CreateUpdateOidcProviderFormData) => {
    if (effectiveOidcProvider?.name) {
      const storedType =
        'type' in effectiveOidcProvider ? effectiveOidcProvider.type : '';
      updateOidcProvider(
        toUpdateOidcProviderBody(values, {
          ...effectiveOidcProvider,
          type: storedType,
          scopes: initialScopes ?? [],
        }),
      );
      return;
    }

    createOidcProvider(toCreateOidcProviderBody(values));
  };
  return (
    <Card
      classNames={{
        root: 'w-3/4',
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
            ...effectiveOidcProvider,
            scopes: initialScopes,
          }}
          submitButtonLabel={
            effectiveOidcProvider?.name
              ? 'Update OIDC Provider'
              : 'Add OIDC Provider'
          }
          hasReset={!!effectiveOidcProvider?.name}
          // The engine's update takes no name, type or issuer.
          disabledFields={{
            name: !!effectiveOidcProvider?.name,
            type: !!effectiveOidcProvider?.name,
            issuer: !!effectiveOidcProvider?.name,
          }}
        />

        {effectiveOidcProvider?.name && (
          <TestOIDCConnection
            oidcProviderName={effectiveOidcProvider.name}
            setIsOidcTested={setIsOidcTested}
          />
        )}
      </>

      <div className="flex flex-row justify-between mt-2">
        <Button
          type="text"
          className="text-light p-0 pr-2"
          onClick={goPrevious}
        >
          <IconArrowLeft /> Back
        </Button>

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

          <Button
            type="text"
            className="text-light p-0 pl-2"
            onClick={goNext}
            disabled={!isOidcTested}
          >
            Next <IconArrowRight />
          </Button>
        </div>
      </div>
    </Card>
  );
};
