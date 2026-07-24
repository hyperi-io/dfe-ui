import { Form } from '@/core/components/Form';
import { IconPlus, IconTrash } from '@repo/dfe-icons';
import { Button, FormRule, Input } from 'antd';

export const EnvKeyValueBuilder = ({
  formValidation,
}: {
  formValidation: FormRule;
}) => {
  return (
    <>
      <Form.List name={['transform', 'env']}>
        {(fields, { add, remove }) => (
          <div className="flex flex-col gap-y-2">
            <div className="flex justify-between items-center">
              <p>Environment Variables</p>
              <Button
                aria-label="Add environment variable"
                icon={<IconPlus />}
                type="default"
                onClick={() => add({ key: '', value: '' })}
              >
                Add Environment Variable
              </Button>
            </div>
            {fields.map(({ key, name, ...restField }) => (
              <div key={key} className="flex gap-2 justify-start">
                <Form.Item
                  {...restField}
                  name={[name, 'key']}
                  className="w-full"
                  label="Key"
                  layout="horizontal"
                  rules={[formValidation]}
                >
                  <Input placeholder="Enter environment variable key" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'value']}
                  label="Value"
                  layout="horizontal"
                  className="w-full"
                  rules={[formValidation]}
                >
                  <Input placeholder="Enter environment variable value" />
                </Form.Item>
                <Button
                  aria-label="Delete environment variable"
                  icon={<IconTrash />}
                  size="small"
                  shape="circle"
                  type="default"
                  className="hover:border-error hover:text-error mt-xs"
                  onClick={() => remove(name)}
                />
              </div>
            ))}
          </div>
        )}
      </Form.List>
    </>
  );
};
