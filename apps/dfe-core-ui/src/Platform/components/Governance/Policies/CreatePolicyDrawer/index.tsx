import { Drawer } from '@/core/components/Drawer';
import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useCreateGovernancePolicy } from '@/Platform/hooks/governance/useCreateGovernancePolicy';
import { IconPlus } from '@repo/dfe-icons';
import { App, Button, ButtonProps, Input, Select } from 'antd';
import { cloneElement, ReactElement, useState } from 'react';
import z from 'zod';

interface CreatePolicyDrawerProps {
  trigger?: ReactElement<ButtonProps>;
}

const createPolicySchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  protected: z.array(z.string()).min(1, { message: 'Protected is required' }),
});

type CreatePolicySchema = z.infer<typeof createPolicySchema>;

export const CreatePolicyDrawer = ({ trigger }: CreatePolicyDrawerProps) => {
  const [open, setOpen] = useState(false);

  const [form] = Form.useForm<CreatePolicySchema>();
  const formValidation = useAntdZodResolver(createPolicySchema);

  const { notification } = App.useApp();

  const {
    mutate: createPolicy,
    isPending,
    error,
  } = useCreateGovernancePolicy({
    onSuccess: ({ name }) => {
      setOpen(false);
      form.resetFields();
      notification.success({
        title: `Policy ${name} created successfully`,
        placement: 'bottomLeft',
      });
    },
  });

  const handleFinish = (values: CreatePolicySchema) => {
    createPolicy(values);
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.governance_write}>
        <RbacProtected.Unrestricted>
          {(trigger &&
            cloneElement(trigger, { onClick: () => setOpen(true) })) || (
            <Button
              type="primary"
              onClick={() => setOpen(true)}
              icon={<IconPlus />}
            >
              Add Policy
            </Button>
          )}
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          {(trigger && cloneElement(trigger, { disabled: true })) || (
            <Button type="primary" disabled icon={<IconPlus />}>
              Add Policy
            </Button>
          )}
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        destroyOnHidden
        title="Create Policy"
        open={open}
        onClose={() => setOpen(false)}
      >
        <Form
          form={form}
          onFinish={handleFinish}
          initialValues={{
            name: '',
            description: '',
            protected: [],
          }}
        >
          <Form.Item
            label={<Form.Label required>Name</Form.Label>}
            name="name"
            rules={[formValidation]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            label={<Form.Label required>Protected</Form.Label>}
            name="protected"
            rules={[formValidation]}
          >
            <Select
              mode="multiple"
              options={[
                { label: 'Protected', value: 'protected' },
                { label: 'Unprotected', value: 'unprotected' },
              ]}
            />
          </Form.Item>

          {error && <FormNotification text={error.message} type="error" />}
          <Form.Item className="flex justify-end">
            <Button type="primary" htmlType="submit" loading={isPending}>
              Create Policy
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};
