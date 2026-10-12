'use client';

import { Form } from '@/core/components/Form';
import { ruleCheckingField } from '@/core/utils/zod/useAntdZodResolver';
import { Input, Select, Space, type FormItemProps, type FormRule } from 'antd';
import { useId, useState } from 'react';

type TNamePath = NonNullable<FormItemProps['name']>;

type TCredentialSource = 'value' | 'env';

const SOURCE_OPTIONS: { label: string; value: TCredentialSource }[] = [
  { label: 'Value', value: 'value' },
  { label: 'Env Var', value: 'env' },
];

const STORED_SECRET_HINT = 'Secret stored - leave blank to keep it';

const isFilled = (value: unknown) => typeof value === 'string' && value !== '';

interface CredentialFieldProps {
  label: string;
  /** The form field holding the credential itself. */
  valueName: TNamePath;
  /** The form field holding the name of the env var that supplies it. */
  envName: TNamePath;
  /** The form's validation rule, checked for both members whichever is shown. */
  rule: FormRule;
  /** Fields whose change re-checks this credential. */
  dependencies?: FormItemProps['dependencies'];
  /** Masks the value, which the engine treats as write-only. */
  secret?: boolean;
  /** The stored secret's path, non-empty when a blank value keeps it. */
  storedName?: TNamePath;
}

/** A credential set as a value or as the name of the env var holding it; only the selected member is a mounted form field, so a submit carries that member alone. */
export const CredentialField = ({
  dependencies,
  envName,
  label,
  rule,
  secret = false,
  storedName,
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
  // The shown member also reports an error the rules pin to the member that is not mounted.
  const rules = (hidden: TNamePath) => [rule, ruleCheckingField(rule, hidden)];

  return (
    <Form.Item label={label} htmlFor={inputId}>
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
          <Form.Item
            key="value"
            name={valueName}
            noStyle
            rules={rules(envName)}
            dependencies={dependencies}
          >
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
            rules={rules(valueName)}
            dependencies={dependencies}
          >
            <Input id={inputId} placeholder="Environment variable name" />
          </Form.Item>
        )}
      </Space.Compact>
    </Form.Item>
  );
};
