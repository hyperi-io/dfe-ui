import { Drawer } from '@/core/components/Drawer';
import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { cn } from '@/core/utils/style';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useCreateGovernanceAction } from '@/Platform/hooks/governance/useCreateGovernanceAction';
import { IconMinus, IconPlus } from '@repo/dfe-icons';
import { Button, ButtonProps, Input } from 'antd';
import { cloneElement, ReactElement, useState } from 'react';
import z from 'zod';

interface CreateActionDrawerProps {
  trigger?: ReactElement<ButtonProps>;
}

const createActionSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  required_action: z
    .string()
    .min(1, { message: 'Required Action is required' }),
  changes: z.array(
    z.object({
      cls: z.string().min(1, { message: 'Class is required' }),
      name: z.string().min(1, { message: 'Name is required' }),
      path: z.string().min(1, { message: 'Path is required' }),
      value: z.string().min(1, { message: 'Value is required' }),
    }),
  ),
});

type CreateActionSchema = z.infer<typeof createActionSchema>;

export const CreateActionDrawer = ({ trigger }: CreateActionDrawerProps) => {
  const [open, setOpen] = useState(false);

  const [form] = Form.useForm<CreateActionSchema>();
  const formValidation = useAntdZodResolver(createActionSchema);

  const {
    mutate: createAction,
    isPending,
    error,
  } = useCreateGovernanceAction();

  const handleFinish = (values: CreateActionSchema) => {
    createAction(values);
  };

  return (
    <>
      {(trigger && cloneElement(trigger, { onClick: () => setOpen(true) })) || (
        <Button
          type="primary"
          onClick={() => setOpen(true)}
          icon={<IconPlus />}
        >
          Add Action
        </Button>
      )}
      <Drawer title="Create Action" open={open} onClose={() => setOpen(false)}>
        <Form
          form={form}
          onFinish={handleFinish}
          initialValues={{
            name: '',
            description: '',
            required_action: '',
            changes: [{ cls: '', name: '', path: '', value: '' }],
          }}
        >
          <Form.Item label="Name" name="name" rules={[formValidation]}>
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            label="Required Action"
            name="required_action"
            rules={[formValidation]}
          >
            <Input />
          </Form.Item>
          <Form.List name="changes">
            {(fields, { add, remove }) => (
              <div className="flex items-center flex-col gap-2">
                <div className="w-full flex justify-between items-center gap-2">
                  Changes
                  <Button
                    type="primary"
                    icon={<IconPlus />}
                    onClick={() => add({})}
                  >
                    Add Change
                  </Button>
                </div>

                <ul className="w-full">
                  {fields.map(({ key, name, ...restField }) => (
                    <li
                      key={key}
                      className={cn(
                        'relative grid grid-cols-2 w-full gap-2',
                        'border border-foreground/10 rounded-md p-2',
                      )}
                    >
                      <Form.Item
                        {...restField}
                        label="Class"
                        name={[name, 'cls']}
                      >
                        <Input className="w-full" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Name"
                        name={[name, 'name']}
                      >
                        <Input className="w-full" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Path"
                        name={[name, 'path']}
                      >
                        <Input className="w-full" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Value"
                        name={[name, 'value']}
                      >
                        <Input className="w-full" />
                      </Form.Item>
                      <Button
                        className="absolute top-2 right-2"
                        danger
                        icon={<IconMinus />}
                        size="small"
                        shape="circle"
                        onClick={() => remove(name)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Form.List>
          {error && <FormNotification text={error.message} type="error" />}
          <Form.Item className="flex justify-end">
            <Button type="primary" htmlType="submit" loading={isPending}>
              Create Action
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};
