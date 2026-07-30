import { Form } from '@/core/components/Form';
import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { IconMinus, IconPlus } from '@repo/dfe-icons';
import { Button, Input, InputNumber, Switch } from 'antd';
import isArray from 'lodash/isArray';

const getName = (formKey: string | string[], key: string) => {
  return isArray(formKey) ? [...formKey, key] : [formKey, key];
};
const booleanFormItemRender = ({
  key,
  label,
  value,
  formKey,
}: {
  key: string;
  label: string;
  value: boolean;
  formKey: string | string[];
}) => {
  return (
    <Form.Item name={getName(formKey, key)} label={label}>
      <Switch checked={value} />
    </Form.Item>
  );
};

const stringFormItemRender = ({
  key,
  label,
  formKey,
}: {
  key: string;
  label: string;
  value?: string;
  formKey: string | string[];
}) => {
  return (
    <Form.Item name={getName(formKey, key)} label={label}>
      <Input />
    </Form.Item>
  );
};

const objectFormItemRender = ({
  key: parentKey,
  label,
  value: parentValue,
  formKey,
}: {
  key: string;
  label: string;
  value: object | null;
  formKey: string | string[];
}) => {
  if (parentValue === null) {
    return stringFormItemRender({
      key: parentKey,
      label: label,
      formKey: formKey,
    });
  }

  return (
    <div className="col-span-2 flex flex-col gap-2 bg-red-500">
      <p>{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(parentValue ?? {}).map(([childKey, childValue]) => {
          return handleFormItemRender({
            key: childKey,
            value: childValue,
            formKey: getName(formKey, parentKey),
          });
        })}
      </div>
    </div>
  );
};

const arrayFormItemRender = ({
  key,
  label,
  formKey,
}: {
  key: string;
  label: string;
  value?: string[];
  formKey: string | string[];
}) => {
  return (
    <Form.List name={getName(formKey, key)}>
      {(fields, { add, remove }) => (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            {label}
            <Button icon={<IconPlus />} type="default" onClick={() => add('')}>
              Add {label}
            </Button>
          </div>
          {fields.map(({ key, ...field }) => (
            <div key={key} className="flex items-center gap-1">
              <Form.Item className="grow" {...field}>
                <Input className="w-full" placeholder={`Enter ${label}`} />
              </Form.Item>
              <Button
                icon={<IconMinus />}
                type="default"
                aria-label="Remove"
                size="small"
                shape="circle"
                danger
                onClick={() => remove(key)}
              />
            </div>
          ))}
        </div>
      )}
    </Form.List>
  );
};

const numberFormItemRender = ({
  key,
  label,
  formKey,
}: {
  key: string;
  label: string;
  value?: number;
  formKey: string | string[];
}) => {
  return (
    <Form.Item name={getName(formKey, key)} label={label}>
      <InputNumber className="w-full" />
    </Form.Item>
  );
};

const handleFormItemRender = ({
  key,
  value,
  formKey,
}: {
  key: string;
  value: unknown;
  formKey: string | string[];
}): React.ReactNode => {
  if (value === null)
    return stringFormItemRender({
      key,
      label: handleKeyRender(key),
      formKey,
    });

  if (typeof value === 'boolean')
    return booleanFormItemRender({
      key,
      label: handleKeyRender(key),
      value,
      formKey,
    });
  if (typeof value === 'string')
    return stringFormItemRender({
      key,
      label: handleKeyRender(key),
      value,
      formKey,
    });
  if (isArray(value))
    return arrayFormItemRender({
      key,
      label: handleKeyRender(key),
      formKey,
    });
  if (typeof value === 'object')
    return objectFormItemRender({
      key,
      label: handleKeyRender(key),
      value,
      formKey,
    });
  if (typeof value === 'number')
    return numberFormItemRender({
      key,
      label: handleKeyRender(key),
      value,
      formKey,
    });
  return <></>;
};

const handleKeyRender = (key: string) => {
  const splitKey = key.split('_');
  return splitKey
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const FormSectionRender = ({
  title,
  formKey,
  data,
}: {
  title: string;
  formKey: string | string[];
  data: Record<string, unknown>;
}) => {
  return (
    <SimpleCollapse
      defaultOpen={true}
      title={<span className="font-medium">{title}</span>}
    >
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(data).map(([key, value]) =>
          handleFormItemRender({ key, value, formKey }),
        )}
      </div>
    </SimpleCollapse>
  );
};
