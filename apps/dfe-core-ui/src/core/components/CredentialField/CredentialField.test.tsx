import { CredentialField } from '@/core/components/CredentialField';
import { chooseCredentialSource } from '@/core/components/CredentialField/CredentialField.mocks';
import { Form } from '@/core/components/Form';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { expectFieldError } from '@/core/utils/test-utils/expectFieldError';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { ENV_VAR_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from 'antd';
import { describe, expect, test, vi } from 'vitest';
import z from 'zod';

const { wrapper } = buildTestWrapper().withTheme();

const STORED_SECRET_HINT = 'Secret stored - leave blank to keep it';

const CLIENT_ID_REQUIRED = 'Enter a Client ID or its environment variable';

const envVarName = () =>
  z
    .string()
    .refine((value) => !value || ENV_VAR_NAME_VALIDATOR.regex.test(value), {
      message: ENV_VAR_NAME_VALIDATOR.message,
    })
    .default('');

// A rule that pins its either-or error to the value member, as the provider rules do.
const SCHEMA = z
  .object({
    client_id: z.string().default(''),
    client_id_env: envVarName(),
    client_secret: z.string().default(''),
    client_secret_env: envVarName(),
  })
  .superRefine((values, ctx) => {
    if (!values.client_id && !values.client_id_env) {
      ctx.addIssue({
        code: 'custom',
        message: CLIENT_ID_REQUIRED,
        path: ['client_id'],
      });
    }
  });

type TFields = 'clientId' | 'clientSecret' | 'both';

const Fields = ({
  fields,
  initialValues,
  onFinish,
}: {
  fields: TFields;
  initialValues: Record<string, string>;
  onFinish: (values: unknown) => void;
}) => {
  const rule = useAntdZodResolver(SCHEMA);

  return (
    <Form initialValues={initialValues} onFinish={onFinish}>
      {fields !== 'clientSecret' && (
        <CredentialField
          label="Client ID"
          valueName="client_id"
          envName="client_id_env"
          rule={rule}
        />
      )}
      {fields !== 'clientId' && (
        <CredentialField
          label="Client Secret"
          valueName="client_secret"
          envName="client_secret_env"
          storedName="client_secret_path"
          rule={rule}
          secret
        />
      )}
      <Button htmlType="submit">Save</Button>
    </Form>
  );
};

const renderFields = (
  fields: TFields,
  initialValues: Record<string, string>,
) => {
  const onFinish = vi.fn();
  render(
    <Fields
      fields={fields}
      initialValues={initialValues}
      onFinish={onFinish}
    />,
    { wrapper },
  );
  return { onFinish, user: userEvent.setup() };
};

const renderClientId = (initialValues: Record<string, string>) =>
  renderFields('clientId', initialValues);

const renderClientSecret = (initialValues: Record<string, string>) =>
  renderFields('clientSecret', { client_id: 'client-id', ...initialValues });

const submittedValues = async (onFinish: ReturnType<typeof vi.fn>) => {
  await waitFor(() => expect(onFinish).toHaveBeenCalled());
  return onFinish.mock.lastCall?.[0];
};

describe('CredentialField', () => {
  test('names its source selector after the label', () => {
    renderClientId({ client_id: '', client_id_env: '' });

    expect(
      screen.getByRole('combobox', { name: 'Client ID source' }),
    ).toBeInTheDocument();
  });

  test('starts on Value when no env var name is set', () => {
    renderClientId({ client_id: 'okta-client-id', client_id_env: '' });

    expect(screen.getByLabelText('Client ID')).toHaveValue('okta-client-id');
  });

  test('starts on Env Var when only an env var name is set', () => {
    renderClientId({ client_id_env: 'OKTA_CLIENT_ID' });

    const input = screen.getByLabelText('Client ID');
    expect(input).toHaveValue('OKTA_CLIENT_ID');
    expect(input).toHaveAttribute('placeholder', 'Environment variable name');
  });

  test('starts on Value when both a value and an env var name are set', () => {
    renderClientId({ client_id: 'okta-client-id', client_id_env: 'OKTA_ID' });

    expect(screen.getByLabelText('Client ID')).toHaveValue('okta-client-id');
  });

  test('switching the source swaps the input under the same label', async () => {
    const { user } = renderClientId({
      client_id: 'okta-client-id',
      client_id_env: 'OKTA_CLIENT_ID',
    });

    await chooseCredentialSource(user, 'Client ID', 'Env Var');
    expect(screen.getByLabelText('Client ID')).toHaveValue('OKTA_CLIENT_ID');

    await chooseCredentialSource(user, 'Client ID', 'Value');
    expect(screen.getByLabelText('Client ID')).toHaveValue('okta-client-id');
  });

  test('each source selector switches only its own field', async () => {
    const { user } = renderFields('both', {
      client_id: 'okta-client-id',
      client_secret_env: '',
    });

    await chooseCredentialSource(user, 'Client ID', 'Env Var');
    await chooseCredentialSource(user, 'Client Secret', 'Env Var');

    expect(screen.getByLabelText('Client ID')).toHaveAttribute(
      'placeholder',
      'Environment variable name',
    );
    expect(screen.getByLabelText('Client Secret')).toHaveAttribute(
      'type',
      'text',
    );
  });

  test('a submit carries only the value when the source is Value', async () => {
    const { onFinish, user } = renderClientId({
      client_id: 'okta-client-id',
      client_id_env: 'STALE_CLIENT_ID',
    });

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await submittedValues(onFinish)).toStrictEqual({
      client_id: 'okta-client-id',
    });
  });

  test('a submit carries only the env var name when the source is Env Var', async () => {
    const { onFinish, user } = renderClientId({
      client_id: 'stale-client-id',
      client_id_env: '',
    });

    await chooseCredentialSource(user, 'Client ID', 'Env Var');
    await user.type(screen.getByLabelText('Client ID'), 'OKTA_CLIENT_ID');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await submittedValues(onFinish)).toStrictEqual({
      client_id_env: 'OKTA_CLIENT_ID',
    });
  });

  test.each(['1OKTA_CLIENT_ID', 'OKTA-CLIENT-ID'])(
    'the env var name %j is refused with the rule message',
    async (name) => {
      const { onFinish, user } = renderClientId({ client_id: '' });

      await chooseCredentialSource(user, 'Client ID', 'Env Var');
      await user.type(screen.getByLabelText('Client ID'), name);
      await user.click(screen.getByRole('button', { name: 'Save' }));

      await expectFieldError('Client ID', ENV_VAR_NAME_VALIDATOR.message);
      expect(onFinish).not.toHaveBeenCalled();
    },
  );

  test.each(['Value', 'Env Var'] as const)(
    'an error the rule pins to the value shows with %s selected',
    async (source) => {
      const { onFinish, user } = renderClientId({
        client_id: '',
        client_id_env: '',
      });

      await chooseCredentialSource(user, 'Client ID', source);
      await user.click(screen.getByRole('button', { name: 'Save' }));

      await expectFieldError('Client ID', CLIENT_ID_REQUIRED);
      expect(onFinish).not.toHaveBeenCalled();
    },
  );

  test('a secret value is masked and never autofilled', () => {
    renderClientSecret({ client_secret_env: '' });

    const input = screen.getByLabelText('Client Secret');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('autocomplete', 'new-password');
  });

  test('a secret env var name is plain text', async () => {
    const { user } = renderClientSecret({ client_secret_env: '' });

    await chooseCredentialSource(user, 'Client Secret', 'Env Var');

    const input = screen.getByLabelText('Client Secret');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('placeholder', 'Environment variable name');
  });

  test('a stored secret keeps the source on Value and says blank keeps it', () => {
    renderClientSecret({
      client_secret_env: 'OKTA_CLIENT_SECRET',
      client_secret_path: 'oidc/okta/client_secret',
    });

    const input = screen.getByLabelText('Client Secret');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('placeholder', STORED_SECRET_HINT);
  });

  test('a secret with only an env var name starts on Env Var', () => {
    renderClientSecret({
      client_secret_env: 'OKTA_CLIENT_SECRET',
      client_secret_path: '',
    });

    expect(screen.getByLabelText('Client Secret')).toHaveValue(
      'OKTA_CLIENT_SECRET',
    );
  });

  test('a secret switched from its env var to a blank value is refused', async () => {
    const { onFinish, user } = renderClientSecret({
      client_secret_env: 'OKTA_CLIENT_SECRET',
      client_secret_path: '',
    });

    await chooseCredentialSource(user, 'Client Secret', 'Value');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await expectFieldError(
      'Client Secret',
      'Enter the Client Secret, or switch back to Env Var',
    );
    expect(onFinish).not.toHaveBeenCalled();
  });

  test('a stored secret left blank on Value submits', async () => {
    const { onFinish, user } = renderClientSecret({
      client_secret_env: 'OKTA_CLIENT_SECRET',
      client_secret_path: 'oidc/okta/client_secret',
    });

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await submittedValues(onFinish)).not.toHaveProperty(
      'client_secret_env',
    );
  });

  test('a secret with nothing stored gives no stored-secret hint', () => {
    renderClientSecret({ client_secret_env: '', client_secret_path: '' });

    expect(screen.getByLabelText('Client Secret')).not.toHaveAttribute(
      'placeholder',
      STORED_SECRET_HINT,
    );
  });
});
