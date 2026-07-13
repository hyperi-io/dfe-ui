import { useCloneSource } from '@/Sources/hooks/useCloneSource';
import { TSourceCreateResponse } from '@/Sources/hooks/useCreateSource/types';
import { sourceNameValidator } from '@/Sources/utils/validation';
import { Form } from '@/core/components/Form';

import { FormNotification } from '@/core/components/FormNotification';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { IconCopy } from '@repo/dfe-icons';
import {
  Button,
  ButtonProps,
  Input,
  Modal,
  Select,
  Switch,
  Tooltip,
} from 'antd';
import { cloneElement, useState } from 'react';
import z from 'zod';

const formSchema = z.object({
  source: sourceNameValidator,
  display_name: z.string().min(1, { message: 'Display name is required' }),
  enabled: z.boolean({ message: 'Enabled is required' }),
});

export type CloneSourceFormData = z.infer<typeof formSchema>;

interface CloneSourceModalProps {
  name: string;
  display_name?: string | null;
  enabled: boolean;
  versions: string[];
  onSuccess?: (source: TSourceCreateResponse) => void;
  trigger?: React.ReactElement<ButtonProps>;
}

export const CloneSourceModal = ({
  name,
  display_name,
  enabled,
  versions,
  onSuccess,
  trigger,
}: CloneSourceModalProps) => {
  const [form] = Form.useForm<CloneSourceFormData>();
  const formValidation = useAntdZodResolver<CloneSourceFormData>(formSchema);
  const [open, setOpen] = useState(false);

  const getDefaultFormValues = (): CloneSourceFormData => ({
    source: `${name}_copy`,
    display_name: `Copy: ${display_name ?? name}`,
    enabled: enabled,
  });

  const handleClose = () => {
    setOpen(false);
    form.resetFields();
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const version = Form.useWatch('version', form);

  const {
    mutate: cloneSourceMutation,
    isPending,
    error,
  } = useCloneSource({
    source_name: name,
    source_version: version,
    onSuccess: (data) => {
      handleClose();
      onSuccess?.(data);
    },
    queryEnabled: open,
  });
  const handleCloneSource = (values: CloneSourceFormData) => {
    cloneSourceMutation(values);
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.source_write}>
        <RbacProtected.Unrestricted>
          {trigger ? (
            cloneElement(trigger, {
              ...trigger.props,
              onClick: (event: React.MouseEvent<HTMLElement>) => {
                handleOpen();
                trigger.props.onClick?.(event);
              },
            })
          ) : (
            <Tooltip destroyOnHidden title={`Clone ${name}`}>
              <Button
                type="default"
                shape="circle"
                size="small"
                aria-label={`Clone ${name}`}
                icon={<IconCopy />}
                onClick={handleOpen}
              />
            </Tooltip>
          )}
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          className="justify-start opacity-100"
          tooltip={{ show: true, placement: 'left' }}
        >
          {trigger ? (
            cloneElement(trigger, {
              ...trigger.props,
              disabled: true,
              onClick: (event: React.MouseEvent<HTMLElement>) => {
                handleOpen();
                trigger.props.onClick?.(event);
              },
            })
          ) : (
            <span className="bg-white rounded-full">
              <Button
                type="default"
                shape="circle"
                disabled
                size="small"
                aria-label={`Clone ${name}`}
                icon={<IconCopy />}
                onClick={handleOpen}
              />
            </span>
          )}
        </RbacProtected.Restricted>
      </RbacProtected>
      <Modal
        title={`Clone ${name}`}
        open={open}
        onCancel={handleClose}
        afterOpenChange={(visible) => {
          if (visible) {
            form.setFieldsValue(getDefaultFormValues());
          }
        }}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          onFinish={handleCloneSource}
          initialValues={getDefaultFormValues()}
        >
          <div className="flex gap-x-2">
            <Form.Item
              name="source"
              label="Source"
              rules={[formValidation]}
              className="w-full mb-2"
            >
              <Input placeholder={`${name}_copy`} />
            </Form.Item>
            <Form.Item name="enabled" label="Enabled" rules={[formValidation]}>
              <Switch />
            </Form.Item>
          </div>

          <Form.Item
            name="version"
            label="Version"
            rules={[formValidation]}
            className="w-full mb-2"
          >
            <Select
              options={versions.map((version) => ({
                label: version,
                value: version,
              }))}
              placeholder="Select version"
            />
          </Form.Item>

          <Form.Item
            name="display_name"
            label="Display Name"
            rules={[formValidation]}
            className="mb-2"
          >
            <Input placeholder={`${display_name ?? name} - copy`} />
          </Form.Item>

          {error && <FormNotification text={error.message} type="error" />}
          <div className="flex justify-end gap-x-2">
            <Button
              loading={isPending}
              disabled={isPending}
              htmlType="submit"
              type="primary"
            >
              Clone
            </Button>
            <Button
              loading={isPending}
              disabled={isPending}
              type="default"
              onClick={handleClose}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};
