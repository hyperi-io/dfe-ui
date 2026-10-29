import { cn } from '@/core/utils/style';
import {
  getZodSchemaForRule,
  isZodFieldRequired,
} from '@/core/utils/zod/useAntdZodResolver';
import {
  Form as AntdForm,
  type FormInstance,
  type FormItemProps,
  type FormProps,
} from 'antd';
import { type ReactNode, useEffect, useRef } from 'react';

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

const ERROR_SELECTOR = '.ant-form-item-explain-error';

// Ant Design gives a field error no role and no prop to add one, so it is
// set as each message is inserted, and a screen reader announces it then
// rather than only when the field next takes focus.
const markErrorsAsAlerts = (root: HTMLElement) => {
  const mark = () =>
    root
      .querySelectorAll(`${ERROR_SELECTOR}:not([role])`)
      .forEach((error) => error.setAttribute('role', 'alert'));
  mark();
  const observer = new MutationObserver(mark);
  observer.observe(root, { childList: true, subtree: true });
  return () => observer.disconnect();
};

const FormWrapper = ({
  className,
  layout = 'vertical',
  children,
  ...rest
}: FormProps) => {
  const formRef = useRef<FormInstance & { nativeElement?: HTMLElement }>(null);

  useEffect(() => {
    const root = formRef.current?.nativeElement;
    return root ? markErrorsAsAlerts(root) : undefined;
  }, []);

  return (
    <AntdForm
      ref={formRef}
      layout={layout}
      className={cn(
        'w-full flex flex-col gap-3',
        // Empty alt text on the drawn mark keeps it out of the field's name.
        "[&_label.ant-form-item-required]:before:content-['*'_/_'']",
        className,
      )}
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
