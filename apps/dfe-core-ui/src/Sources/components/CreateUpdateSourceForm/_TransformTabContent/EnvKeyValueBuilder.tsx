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
      <div className="flex justify-between">
        <label>Environment Variables</label>
      </div>
      <Form.List name="env">
        {(fields, { add, remove }) => (
          <div className="flex flex-col gap-y-2">
            <div className="flex justify-end -mt-8">
              <Button
                size="small"
                aria-label="Add environment variable"
                shape="circle"
                icon={<IconPlus />}
                type="default"
                onClick={() => add(['', ''])}
              />
            </div>
            {fields.map(({ key, name, ...restField }) => (
              <div key={key} className="flex gap-2 justify-start">
                <Form.Item
                  {...restField}
                  name={[name, 0]}
                  className="w-full"
                  rules={[formValidation]}
                >
                  <Input placeholder="Enter environment variable key" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 1]}
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
