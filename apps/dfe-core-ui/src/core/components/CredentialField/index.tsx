'use client';

import { Form } from '@/core/components/Form';
import { Input, Select, Space, type FormItemProps } from 'antd';
import { useId, useState } from 'react';

type TNamePath = NonNullable<FormItemProps['name']>;

type TCredentialSource = 'value' | 'env';

/** The engine rejects an env var name that does not match this. */
const ENV_VAR_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

const SOURCE_OPTIONS: { label: string; value: TCredentialSource }[] = [
  { label: 'Value', value: 'value' },
  { label: 'Env Var', value: 'env' },
];

const ENV_VAR_NAME_RULES: FormItemProps['rules'] = [
  {
    pattern: ENV_VAR_NAME_PATTERN,
    message: 'Use letters, digits and underscores, not a leading digit',
  },
];

const STORED_SECRET_HINT = 'Secret stored - leave blank to keep it';

const isFilled = (value: unknown) => typeof value === 'string' && value !== '';

interface CredentialFieldProps {
  label: string;
  /** The form field holding the credential itself. */
  valueName: TNamePath;
  /** The form field holding the name of the env var that supplies it. */
  envName: TNamePath;
  /** Masks the value, which the engine treats as write-only. */
  secret?: boolean;
  /** The stored secret's path, non-empty when a blank value keeps it. */
  storedName?: TNamePath;
  tooltip?: string;
}

/** A credential set as a value or as the name of the env var holding it; only the selected member is a mounted form field, so a submit carries that member alone. */
export const CredentialField = ({
  envName,
  label,
  secret = false,
  storedName,
  tooltip,
  valueName,
}: CredentialFieldProps) => {
  const form = Form.useFormInstance();
  const id = useId();
  const hasStoredSecret =
    storedName !== undefined && isFilled(form.getFieldValue(storedName));
  const [source, setSource] = useState<TCredentialSource>(() =>
    isFilled(form.getFieldValue(envName)) &&
    !isFilled(form.getFieldValue(valueName)) &&
    !hasStoredSecret
      ? 'env'
      : 'value',
  );
  const inputId = `${id}-${source}`;

  return (
    <Form.Item label={label} htmlFor={inputId} tooltip={tooltip}>
      <Space.Compact block>
        <Select
          id={`${id}-source`}
          aria-label={`${label} source`}
          className="w-28 shrink-0"
          options={SOURCE_OPTIONS}
          value={source}
          onChange={setSource}
          virtual={false}
        />
        {source === 'value' ? (
          <Form.Item key="value" name={valueName} noStyle>
            {secret ? (
              <Input.Password
                id={inputId}
                autoComplete="new-password"
                placeholder={hasStoredSecret ? STORED_SECRET_HINT : undefined}
              />
            ) : (
              <Input id={inputId} />
            )}
          </Form.Item>
        ) : (
          <Form.Item
            key="env"
            name={envName}
            noStyle
            rules={ENV_VAR_NAME_RULES}
          >
            <Input id={inputId} placeholder="Environment variable name" />
          </Form.Item>
        )}
      </Space.Compact>
    </Form.Item>
  );
};
