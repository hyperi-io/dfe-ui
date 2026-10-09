import { cn } from '@/core/utils/style';
import {
  getZodSchemaForRule,
  isZodFieldRequired,
} from '@/core/utils/zod/useAntdZodResolver';
import { Form as AntdForm, type FormItemProps, type FormProps } from 'antd';
import type { ReactNode } from 'react';

const zodRequiredFromRules = (
  name: FormItemProps['name'],
  rules: FormItemProps['rules'],
): boolean | undefined => {
  if (name == null || !rules?.length) return undefined;
  for (const rule of rules) {
    const schema = getZodSchemaForRule(rule);
    if (schema) return isZodFieldRequired(schema, name);
  }
  return undefined;
};

const FormItem = ({
  children,
  layout = 'vertical',
  className,
  name,
  rules,
  required,
  ...props
}: FormItemProps) => {
  // Ant Design only reads `required` from plain rule objects / RuleRender
  // return values. Our zod resolver is a shared RuleRender with no field
  // path, so the asterisk has to come from the Item `name` + schema instead.
  const zodRequired = zodRequiredFromRules(name, rules);

  return (
    <AntdForm.Item
      layout={layout}
      className={cn('m-0!', className)}
      name={name}
      rules={rules}
      required={required ?? (zodRequired || undefined)}
      {...props}
    >
      {children}
    </AntdForm.Item>
  );
};
type AntdFormType = typeof AntdForm;

const FormWrapper = ({
  className,
  layout = 'vertical',
  children,
  ...rest
}: FormProps) => {
  return (
    <AntdForm
      layout={layout}
      className={cn('w-full flex flex-col gap-3', className)}
      {...rest}
    >
      {children as ReactNode}
    </AntdForm>
  );
};

export const Form = Object.assign(FormWrapper, {
  ...AntdForm,
  Item: FormItem,
}) as AntdFormType;
