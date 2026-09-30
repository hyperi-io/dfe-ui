import { Form } from '@/core/components/Form';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { cn } from '@/core/utils/style';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useFetchRetention } from '@/Platform/hooks/system/useFetchRetention';
import { useUpdateRetention } from '@/Platform/hooks/system/useUpdateRetention';
import { IconEdit, IconX } from '@repo/dfe-icons';
import { App, Button, InputNumber } from 'antd';
import { isInteger } from 'lodash';
import { useState } from 'react';
import z from 'zod';

const formSchema = z.object({
  default_ttl_days: z
    .number()
    .min(0)
    .refine((val) => Number.isInteger(val), {
      message: 'Default TTL Days must be a whole number',
    }),
});
type TFormSchema = z.infer<typeof formSchema>;

const formatDays = (days: number) =>
  days === 0 ? 'none (kept forever)' : `${days} days`;

const dataListTermStyle = 'text-foreground/50 dark:text-foreground/50';

/** The deployment default TTL, which the environment sets and the console only reports. */
export const RetentionCard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { notification } = App.useApp();

  const { data: retention, isLoading, error } = useFetchRetention();

  const { mutate: updateRetention, isPending: isUpdating } = useUpdateRetention(
    {
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
    },
  );

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
      return form.setFieldsValue({ default_ttl_days: Math.floor(value) });
    }

    form.setFieldsValue({ default_ttl_days: value });
  };

  return (
    <SectionCard title="Retention">
      <RbacProtected action={RbacProtected.rbacActions.system_read}>
        <RbacProtected.Unrestricted>
          <>
            <dl className="min-h-8 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs items-center">
              <dt className={dataListTermStyle}>Default Retention</dt>
              <dd>
                <div className="flex items-center gap-2">
                  {isLoading && <div>Loading...</div>}
                  {error && <div>Error: {error.message}</div>}
                  {retention && (
                    <>
                      <span
                        className={cn(
                          'shrink-0',
                          isEditing &&
                            'font-semibold text-foreground/30 dark:text-foreground/30',
                        )}
                      >
                        {formatDays(retention.default_ttl_days)}
                      </span>
                      <RbacProtected
                        action={RbacProtected.rbacActions.system_write}
                      >
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
                            default_ttl_days: retention.default_ttl_days,
                          }}
                        >
                          <Form.Item
                            name="default_ttl_days"
                            rules={[formValidation]}
                          >
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
                  )}
                </div>
              </dd>
            </dl>
            <p className="mt-2 text-xs text-foreground/50 dark:text-foreground/50">
              Set by DFE_CLICKHOUSE_DEFAULT_TTL_DAYS. A change applies to every
              table that follows the default when the engine restarts.
            </p>
          </>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </SectionCard>
  );
};
