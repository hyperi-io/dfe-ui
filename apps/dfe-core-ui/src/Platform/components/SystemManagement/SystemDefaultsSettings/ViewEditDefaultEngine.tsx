import { Form } from '@/core/components/Form';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SourceEngineSelect } from '@/core/components/SourceEngineSelect';
import { cn } from '@/core/utils/style';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useUpdateSystemDefaults } from '@/Platform/hooks/system/useUpdateDefaults';
import { IconEdit, IconX } from '@repo/dfe-icons';
import { App, Button } from 'antd';
import { useState } from 'react';
import z from 'zod';

const formSchema = z.object({
  engine: z.string(),
});
type TFormSchema = z.infer<typeof formSchema>;

export const ViewEditDefaultEngine = ({
  defaultEngine,
}: {
  defaultEngine: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const { notification } = App.useApp();

  const { mutate: updateDefaultEngine, isPending: isUpdating } =
    useUpdateSystemDefaults({
      onSuccess: () => {
        setIsEditing(false);
        notification.success({
          title: 'Default engine updated successfully',
          placement: 'bottomLeft',
        });
      },
      onError: (error) => {
        notification.error({
          title: 'Error updating default engine',
          description: error instanceof Error ? error.message : 'Unknown error',
          placement: 'bottomLeft',
        });
      },
    });

  const [form] = Form.useForm<TFormSchema>();
  const formValidation = useAntdZodResolver(formSchema);

  const handleFinish = (values: TFormSchema) => {
    updateDefaultEngine(values);
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
          {defaultEngine}
        </span>
        <RbacProtected action={RbacProtected.rbacActions.system_write}>
          <RbacProtected.Unrestricted>
            <Button
              icon={isEditing ? <IconX /> : <IconEdit />}
              type="text"
              size="small"
              shape="circle"
              aria-label={isEditing ? 'Cancel' : 'Edit default engine'}
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
              default_engine: defaultEngine,
            }}
          >
            <Form.Item name="engine" rules={[formValidation]}>
              <SourceEngineSelect size="small" />
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
