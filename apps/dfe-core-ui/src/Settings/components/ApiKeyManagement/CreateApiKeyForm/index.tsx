import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { NotificationCard } from '@/core/components/NotificationCard';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { GroupRoleSelect } from '@/Settings/components/GroupManagement/GroupRoleSelect';
import { useCreateApiKey } from '@/Settings/hooks/apiKeys/useCreateApiKey';
import { TApiKeyCreateResponse } from '@/Settings/hooks/apiKeys/useCreateApiKey/types';
import { Button, Card, DatePicker, Input, Tag } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useCallback } from 'react';
import z from 'zod';
import { ApiKeyHiddenCopy } from './ApiKeyHiddenCopy';

dayjs.extend(utc);

const expiryAtEndOfSelectedDay = (val: unknown): unknown => {
  if (val == null || val === '') {
    return undefined;
  }
  const selected = dayjs.isDayjs(val) ? val : dayjs(val as Date);
  if (!selected.isValid()) {
    return val;
  }
  return dayjs
    .utc()
    .year(selected.year())
    .month(selected.month())
    .date(selected.date())
    .hour(23)
    .minute(59)
    .second(59)
    .millisecond(999)
    .toDate();
};

const createApiKeyFormSchema = z.object({
  name: z
    .string({ message: 'Name is required' })
    .min(1, { message: 'Name is required' }),
  description: z
    .string({ message: 'Description is required' })
    .min(1, { message: 'Description is required' }),
  groups: z.array(z.string()).optional(),
  expires_at: z.preprocess(
    expiryAtEndOfSelectedDay,
    z
      .date()
      .optional()
      .refine(
        (date) =>
          date === undefined ||
          !dayjs.utc(date).startOf('day').isBefore(dayjs.utc().startOf('day')),
        { message: 'The expiry date cannot be in the past' },
      ),
  ),
});

export type CreateApiKeyFormSchema = z.infer<typeof createApiKeyFormSchema>;

const disablePastExpiryDates = (current: Dayjs) =>
  current != null && current.startOf('day').isBefore(dayjs().startOf('day'));

export const CreateApiKeyForm = ({
  onSuccess,
  onAccept,
  initialValues,
}: {
  initialValues?: CreateApiKeyFormSchema;
  onSuccess?: (data: TApiKeyCreateResponse) => void;
  onAccept?: () => void;
}) => {
  const {
    data,
    mutate: generateApiKey,
    error,
    isPending,
    reset,
  } = useCreateApiKey({
    onSuccess: (data) => {
      onSuccess?.(data);
    },
  });

  const formValidation = useAntdZodResolver(createApiKeyFormSchema);

  const [form] = Form.useForm<CreateApiKeyFormSchema>();

  const handleAccept = useCallback(() => {
    form.resetFields();
    reset();
    onAccept?.();
  }, [form, reset, onAccept]);

  const handleOnFinish = (values: CreateApiKeyFormSchema) => {
    generateApiKey({
      ...values,
      expires_at: values.expires_at
        ? dayjs(values.expires_at).toISOString()
        : null,
    });
  };

  return (
    <>
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
            ...initialValues,
            expires_at: undefined,
          }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true }, formValidation]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }, formValidation]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="groups" label="Groups" rules={[formValidation]}>
            <GroupRoleSelect />
          </Form.Item>

          <Form.Item name="expires_at" label="Expires" rules={[formValidation]}>
            <DatePicker
              className="w-full!"
              disabledDate={disablePastExpiryDates}
              allowClear
              placeholder="Select expiry date"
            />
          </Form.Item>

          {error && <FormNotification text={error.message} type="error" />}

          <Form.Item className="flex justify-end">
            <Button type="primary" htmlType="submit" loading={isPending}>
              Generate
            </Button>
          </Form.Item>
        </Form>
      )}
    </>
  );
};
