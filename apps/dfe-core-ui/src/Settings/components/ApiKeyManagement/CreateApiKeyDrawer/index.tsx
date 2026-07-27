import { Drawer } from '@/core/components/Drawer';
import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { NotificationCard } from '@/core/components/NotificationCard';
import { usePreventNavigate } from '@/core/hooks/usePreventNavigate';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { GroupRoleSelect } from '@/Settings/components/GroupManagement/GroupRoleSelect';
import { useCreateApiKey } from '@/Settings/hooks/apiKeys/useCreateApiKey';
import { Button, Card, Input, Tag } from 'antd';
import { useCallback, useState } from 'react';
import z from 'zod';
import { ApiKeyHiddenCopy } from './ApiKeyHiddenCopy';

const createApiKeyFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  groups: z.array(z.string()).optional(),
});

type CreateApiKeyFormSchema = z.infer<typeof createApiKeyFormSchema>;

export const CreateApiKeyDrawer = () => {
  const [open, setOpen] = useState(false);

  const {
    data,
    mutate: generateApiKey,
    error,
    isPending,
    reset,
  } = useCreateApiKey();

  const formValidation = useAntdZodResolver(createApiKeyFormSchema);

  const [form] = Form.useForm<CreateApiKeyFormSchema>();

  const mustAcknowledgeCopy = open && data != null;

  const handleAccept = useCallback(() => {
    setOpen(false);
    form.resetFields();
    reset();
  }, [form, reset]);

  const { confirmLeave } = usePreventNavigate({
    enabled: mustAcknowledgeCopy,
    blockBrowserBack: true,
    modal: {
      title: 'Have you copied the API key?',
      message: 'You will not be able to retrieve it later.',
      okText: 'I have copied the API key',
      cancelText: 'Cancel',
      okButtonProps: { danger: false },
    },
  });

  const handleOnFinish = (values: CreateApiKeyFormSchema) => {
    generateApiKey(values);
  };

  const handleClose = useCallback(() => {
    confirmLeave(handleAccept);
  }, [confirmLeave, handleAccept]);

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Generate API Key
      </Button>

      <Drawer
        title={data ? 'API Key Generated' : 'Generate API Key'}
        open={open}
        onClose={handleClose}
        keyboard={!mustAcknowledgeCopy}
      >
        {data && (
          <div className="flex flex-col gap-2">
            <Card
              classNames={{ body: 'flex flex-col gap-2' }}
              title={`API Key: ${data.name}`}
              size="small"
            >
              <p>
                <span className="font-medium">Description:</span>{' '}
                {data.description}
              </p>
              <p className="flex gap-2 items-center">
                <span className="font-medium">Groups:</span>{' '}
                {data.groups?.map((group) => (
                  <Tag key={group}>{group}</Tag>
                ))}
              </p>

              <NotificationCard
                title="API key needs to be copied and stored securely"
                description="It should only be shared with trusted users and applications. You will not be able to retrieve it later."
                type="warning"
              />
              <ApiKeyHiddenCopy apiKey={data.full_key} />
            </Card>
            <Button className="ml-auto" type="primary" onClick={handleAccept}>
              I have copied the API key
            </Button>
          </div>
        )}
        {!data && (
          <Form
            form={form}
            onFinish={handleOnFinish}
            initialValues={{
              name: '',
              description: '',
              groups: [],
            }}
          >
            <Form.Item name="name" label="Name" rules={[formValidation]}>
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[formValidation]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item name="groups" label="Groups" rules={[formValidation]}>
              <GroupRoleSelect />
            </Form.Item>

            {error && <FormNotification text={error.message} type="error" />}

            <Form.Item className="flex justify-end">
              <Button type="primary" htmlType="submit" loading={isPending}>
                Generate
              </Button>
            </Form.Item>
          </Form>
        )}
      </Drawer>
    </>
  );
};
