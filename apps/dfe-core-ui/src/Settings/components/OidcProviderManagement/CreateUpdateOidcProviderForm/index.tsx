import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { Form } from '@/core/components/Form';
import {
  OidcGroupFields,
  OidcLoginFields,
} from '@/core/components/OidcProviderFields';
import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import {
  PROVIDERS,
  PROVIDERS_MAP,
} from '@/core/constants/oidcProviders.constants';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import {
  buildOidcProviderSchema,
  CreateUpdateOidcProviderFormData,
} from '@/core/validationSchemas/oidcProviders.schema';
import { Button, FormProps, Select, Switch } from 'antd';
import { useMemo } from 'react';

interface CreateUpdateOidcProviderFormProps extends FormProps {
  disabledFields?: {
    name?: boolean;
    type?: boolean;
    issuer?: boolean;
  };
  hasReset?: boolean;
  buttonLabel?: string;
  isPending: boolean;
  error: Error | null;
  onFinish: (values: CreateUpdateOidcProviderFormData) => void;
}

export const CreateUpdateOidcProviderForm = ({
  disabledFields,
  onFinish,
  hasReset = false,
  buttonLabel = 'Create',
  isPending = false,
  error,
  initialValues,
  ...props
}: CreateUpdateOidcProviderFormProps) => {
  const [form] = Form.useForm();
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

  const handleFinish = (values: CreateUpdateOidcProviderFormData) => {
    onFinish?.(values);
  };

  return (
    <Form
      form={form}
      className="gap-4"
      {...props}
      initialValues={{
        enabled: true,
        client_secret_env: '',
        ...PROVIDERS_MAP['google']?.initialValues,
        ...initialValues,
      }}
      onFinish={handleFinish}
    >
      <div className="flex gap-2">
        <Form.Item
          className="grow"
          label="Type"
          name="type"
          rules={[formValidation]}
        >
          <Select
            disabled={disabledFields?.type}
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

      <SimpleCollapse
        title="Groups"
        classNames={{
          // No side padding, so the group fields line up with the fields above.
          container: 'px-0',
          content: 'grid grid-cols-2 gap-4',
        }}
        defaultOpen={true}
      >
        <OidcGroupFields rule={formValidation} />
      </SimpleCollapse>

      {error && <ApiErrorNotification error={error} />}

      <Form.Item className="flex justify-end col-span-2">
        {hasReset && (
          <Button className="mr-2" type="default" htmlType="reset">
            Reset Form
          </Button>
        )}
        <Button
          loading={isPending}
          disabled={isPending}
          type="primary"
          htmlType="submit"
        >
          {buttonLabel}
        </Button>
      </Form.Item>
    </Form>
  );
};
