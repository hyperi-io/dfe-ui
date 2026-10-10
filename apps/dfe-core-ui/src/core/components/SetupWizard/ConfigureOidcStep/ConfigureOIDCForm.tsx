import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { Form } from '@/core/components/Form';
import {
  OidcGroupFields,
  OidcLoginFields,
} from '@/core/components/OidcProviderFields';
import {
  PROVIDERS,
  PROVIDERS_MAP,
} from '@/core/constants/oidcProviders.constants';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import {
  buildOidcProviderSchema,
  CreateUpdateOidcProviderFormData,
} from '@/core/validationSchemas/oidcProviders.schema';
import { Button, FormInstance, FormProps, Select, Switch } from 'antd';
import { useMemo } from 'react';

interface ConfigureOidcProviderFormProps extends FormProps {
  error: Error | null;
  form: FormInstance<CreateUpdateOidcProviderFormData>;
  isSubmitting: boolean;
  submitButtonLabel?: string;
  hasReset?: boolean;
  disabledFields?: {
    name?: boolean;
    type?: boolean;
    issuer?: boolean;
  };
}

export const ConfigureOIDCForm = ({
  form,
  error,
  initialValues,
  isSubmitting,
  submitButtonLabel = 'Add OIDC Provider',
  hasReset = false,
  disabledFields = {},
  ...props
}: ConfigureOidcProviderFormProps) => {
  const loginSecretPath = initialValues?.client_secret_path;
  const apiTokenPath = initialValues?.groups?.api_token_path;
  const directorySecretPath = initialValues?.groups?.client_secret_path;
  const schema = useMemo(
    () =>
      buildOidcProviderSchema({
        client_secret_path: loginSecretPath,
        groups: {
          api_token_path: apiTokenPath,
          client_secret_path: directorySecretPath,
        },
      }),
    [loginSecretPath, apiTokenPath, directorySecretPath],
  );
  const formValidation = useAntdZodResolver(schema);
  const typeWatch = Form.useWatch('type', form);

  return (
    <Form
      form={form}
      classNames={{ root: 'mt-2', content: 'flex flex-row gap-4' }}
      {...props}
      initialValues={{
        enabled: true,
        client_secret_env: '',
        ...PROVIDERS_MAP['google']?.initialValues,
        ...initialValues,
      }}
    >
      <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-2 w-[47%]">
          <p className="font-medium">OIDC Provider</p>
          <div className="flex gap-2">
            <Form.Item
              className="grow"
              label="Type"
              name="type"
              rules={[formValidation]}
            >
              <Select
                disabled={disabledFields.type}
                options={PROVIDERS.map((provider) => ({
                  label: provider.name,
                  value: provider.key,
                }))}
                onChange={(value) => {
                  form.setFieldsValue({
                    ...PROVIDERS_MAP[value]?.initialValues,
                  });
                }}
              />
            </Form.Item>
            <Form.Item
              className="w-20"
              label="Enabled"
              name="enabled"
              rules={[formValidation]}
            >
              <Switch />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <OidcLoginFields
              rule={formValidation}
              disabledFields={disabledFields}
              hasStoredScopes={!!initialValues?.scopes?.length}
            />
          </div>
        </div>

        <div className="grow max-w-px bg-gray-200" />

        {typeWatch && (
          <div className="flex flex-col gap-2 w-[47%]">
            <p className="font-medium">Groups</p>
            <div className="grid grid-cols-2 gap-4">
              <OidcGroupFields rule={formValidation} />
            </div>
          </div>
        )}
      </div>

      {error && <ApiErrorNotification error={error} />}

      <Form.Item className="flex justify-end">
        {hasReset && (
          <Button className="mr-2" type="default" htmlType="reset">
            Reset Form
          </Button>
        )}
        <Button type="primary" htmlType="submit" loading={isSubmitting}>
          {submitButtonLabel}
        </Button>
      </Form.Item>
    </Form>
  );
};
