import { cn } from '@/core/utils/style';
import { Form as AntdForm, type FormItemProps, type FormProps } from 'antd';
import type { ReactNode } from 'react';

const FormItem = ({
  children,
  layout = 'vertical',
  className,
  ...props
}: FormItemProps) => {
  return (
    <AntdForm.Item layout={layout} className={cn('m-0!', className)} {...props}>
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
  Item: FormItem,
  List: AntdForm.List,
  ErrorList: AntdForm.ErrorList,
  useForm: AntdForm.useForm,
  useWatch: AntdForm.useWatch,
  Provider: AntdForm.Provider,
}) as AntdFormType;
