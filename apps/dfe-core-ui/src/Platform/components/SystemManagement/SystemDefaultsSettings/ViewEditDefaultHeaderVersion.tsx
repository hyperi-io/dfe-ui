import { CommonHeaderSelect } from '@/core/components/CommonHeaderSelect';
import { Form } from '@/core/components/Form';
import { RbacProtected } from '@/core/components/RbacProtected';
import { cn } from '@/core/utils/style';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useUpdateSystemDefaults } from '@/Platform/hooks/system/useUpdateDefaults';
import { IconEdit, IconX } from '@repo/dfe-icons';
import { App, Button, Select } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import z from 'zod';

const formSchema = z.object({
  common_header_version: z.string().min(1),
  common_header_type: z.string().min(1),
});
type TFormSchema = z.infer<typeof formSchema>;

export const ViewEditDefaultHeaderVersion = ({
  defaultHeaderVersion,
  defaultHeader,
}: {
  defaultHeaderVersion: string;
  defaultHeader: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const { notification } = App.useApp();

  const { mutate: updateSystemDefaults, isPending: isUpdating } =
    useUpdateSystemDefaults({
      onSuccess: () => {
        setIsEditing(false);
        notification.success({
          title: 'Common header defaults updated successfully',
          placement: 'bottomLeft',
        });
      },
      onError: (error) => {
        notification.error({
          title: 'Error updating common header defaults',
          description: error instanceof Error ? error.message : 'Unknown error',
          placement: 'bottomLeft',
        });
      },
    });

  const [form] = Form.useForm<TFormSchema>();
  const formValidation = useAntdZodResolver(formSchema);

  const handleFinish = (values: TFormSchema) => {
    updateSystemDefaults(values);
  };

  const [commonHeaderVersions, setCommonHeaderVersions] = useState<string[]>(
    [],
  );
  const handleChangeCommonHeader = useCallback(
    (
      value: string | null,
      commonHeader?: { versions: string[] },
      action_type?: string,
    ) => {
      if (value) {
        setCommonHeaderVersions(commonHeader?.versions ?? []);

        if (action_type === '_select') {
          form.setFieldsValue({
            common_header_version:
              commonHeader?.versions?.length === 1
                ? commonHeader?.versions?.[0]
                : undefined,
          });
        }
      }
    },
    [form],
  );
  const commonHeaderVersionsOptions = useMemo(() => {
    return (
      commonHeaderVersions?.map((version) => ({
        label: version,
        value: version,
      })) ?? []
    );
  }, [commonHeaderVersions]);

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
          {defaultHeader}@v{defaultHeaderVersion}
        </span>
        <RbacProtected action={RbacProtected.rbacActions.system_write}>
          <RbacProtected.Unrestricted>
            <Button
              icon={isEditing ? <IconX /> : <IconEdit />}
              type="text"
              size="small"
              shape="circle"
              aria-label={
                isEditing ? 'Cancel' : 'Edit default header & version'
              }
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
              common_header_version: defaultHeaderVersion,
              common_header_type: `common-header/${defaultHeader}`,
            }}
          >
            <Form.Item
              label="Common Header"
              layout="horizontal"
              name="common_header_type"
              rules={[formValidation]}
            >
              <CommonHeaderSelect
                className="min-w-60"
                onChange={handleChangeCommonHeader}
                size="small"
              />
            </Form.Item>

            <Form.Item
              label="Version"
              layout="horizontal"
              name="common_header_version"
              rules={[formValidation]}
            >
              <Select
                className="min-w-32"
                options={commonHeaderVersionsOptions}
                size="small"
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
