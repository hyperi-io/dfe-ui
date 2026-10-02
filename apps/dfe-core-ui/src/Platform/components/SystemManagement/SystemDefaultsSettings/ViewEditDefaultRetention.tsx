import { Form } from '@/core/components/Form';
import { RbacProtected } from '@/core/components/RbacProtected';
import { cn } from '@/core/utils/style';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useUpdateSystemDefaults } from '@/Platform/hooks/system/useUpdateDefaults';
import { IconEdit, IconX } from '@repo/dfe-icons';
import { App, Button, InputNumber } from 'antd';
import { isInteger } from 'lodash';
import { useState } from 'react';
import z from 'zod';

const formSchema = z.object({
  ttl_days: z
    .number()
    .min(0)
    .refine((val) => Number.isInteger(val), {
      message: 'Default TTL Days must be a whole number',
    }),
});
type TFormSchema = z.infer<typeof formSchema>;

const formatDays = (days: number) =>
  days === 0 ? 'none (kept forever)' : `${days} days`;

export const ViewEditDefaultRetention = ({
  defaultRetention,
}: {
  defaultRetention: number;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const { notification } = App.useApp();

  const { mutate: updateRetention, isPending: isUpdating } =
    useUpdateSystemDefaults({
      onSuccess: () => {
        setIsEditing(false);
        notification.success({
          title: 'Retention updated successfully',
          placement: 'bottomLeft',
        });
      },
      onError: (error) => {
        notification.error({
          title: 'Error updating retention',
          description: error instanceof Error ? error.message : 'Unknown error',
          placement: 'bottomLeft',
        });
      },
    });

  const [form] = Form.useForm<TFormSchema>();
  const formValidation = useAntdZodResolver(formSchema);

  const handleFinish = (values: TFormSchema) => {
    updateRetention(values);
  };

  const handleChange = (value: number | null) => {
    if (!value) {
      return;
    }
    if (!isInteger(value)) {
      return form.setFieldsValue({ ttl_days: Math.floor(value) });
    }

    form.setFieldsValue({ ttl_days: value });
  };
  return (
    <div className="flex items-center gap-2">
      <>
        <span
          className={cn(
            'shrink-0',
            isEditing &&
              'font-semibold text-foreground/30 dark:text-foreground/30',
          )}
        >
          {formatDays(defaultRetention)}
        </span>
        <RbacProtected action={RbacProtected.rbacActions.system_write}>
          <RbacProtected.Unrestricted>
            <Button
              icon={isEditing ? <IconX /> : <IconEdit />}
              type="text"
              size="small"
              shape="circle"
              aria-label={isEditing ? 'Cancel' : 'Edit retention'}
              onClick={() => setIsEditing(!isEditing)}
            />
          </RbacProtected.Unrestricted>
        </RbacProtected>

        {isEditing && (
          <Form
            className="flex flex-row items-center gap-2"
            layout="inline"
            form={form}
            onFinish={handleFinish}
            initialValues={{
              default_ttl_days: defaultRetention,
            }}
          >
            <Form.Item name="ttl_days" rules={[formValidation]}>
              <InputNumber
                onChange={handleChange}
                size="small"
                min={0}
                inputMode="decimal"
              />
            </Form.Item>

            <div className="flex gap-2 justify-end">
              <Button
                type="primary"
                htmlType="submit"
                size="small"
                loading={isUpdating}
                disabled={isUpdating}
              >
                Update
              </Button>
            </div>
          </Form>
        )}
      </>
    </div>
  );
};
