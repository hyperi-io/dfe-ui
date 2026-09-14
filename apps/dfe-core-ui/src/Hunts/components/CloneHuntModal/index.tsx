import { Form } from '@/core/components/Form';

import { FormNotification } from '@/core/components/FormNotification';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { DB_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { useListHuntsContext } from '@/Hunts/contexts/ListHuntsContext';
import { useCreateHunt } from '@/Hunts/hooks/useCreateHunt';
import { THuntCreateResponse } from '@/Hunts/hooks/useCreateHunt/types';
import { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { IconCopy } from '@repo/dfe-icons';
import { Button, ButtonProps, Input, Modal } from 'antd';
import { cloneElement, useState } from 'react';
import z from 'zod';

const formSchema = z.object({
  name: z
    .string({ message: 'Name is required' })
    .min(1, { message: 'Name is required' })
    .refine((v) => DB_NAME_VALIDATOR.regex.test(v), {
      message: DB_NAME_VALIDATOR.message('Name'),
    }),
  display_name: z.string().optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

interface CloneHuntModalProps {
  hunt: THuntDetailResponse;
  onSuccess?: (data: THuntCreateResponse) => void;
  onError?: (error: Error) => void;
  trigger?: React.ReactElement<ButtonProps>;
}
export const CloneHuntModal = ({
  hunt,
  onSuccess: onSuccessProp,
  onError,
  trigger,
}: CloneHuntModalProps) => {
  const [form] = Form.useForm<FormData>();
  const formValidation = useAntdZodResolver<FormData>(formSchema);
  const [open, setOpen] = useState(false);

  const { refetch: refetchHunts } = useListHuntsContext();

  const onSuccess = (data: THuntCreateResponse) => {
    refetchHunts();
    onSuccessProp?.(data);
    setOpen(false);
  };

  const {
    mutate: createHuntMutation,
    isPending,
    error,
  } = useCreateHunt({
    onSuccess,
    onError,
  });
  const handleCloneHunt = (values: FormData) => {
    createHuntMutation({
      cron: hunt.cron,
      log_buffer: hunt.log_buffer,
      global_target_table_name: hunt.global_target_table_name,
      global_source_table_name: hunt.global_source_table_name,
      customers: hunt.customers,
      rules: hunt.rules.map((rule) => rule.rule_name),
      ...values,
    });
  };

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.rule_write}>
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
            <Button
              type="default"
              shape="circle"
              size="small"
              aria-label={`Clone ${hunt.display_name ?? hunt.name}`}
              icon={<IconCopy />}
              onClick={handleOpen}
            />
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
                aria-label={`Clone ${hunt.display_name ?? hunt.name}`}
                icon={<IconCopy />}
                onClick={handleOpen}
              />
            </span>
          )}
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        title={`Clone ${hunt.display_name ?? hunt.name}`}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          onFinish={handleCloneHunt}
          initialValues={{
            name: `${hunt.name}_copy`,
            display_name: `Copy: ${hunt.display_name ?? hunt.name}`,
            cron: hunt.cron,
            log_buffer: hunt.log_buffer,
            global_target_table_name: hunt.global_target_table_name,
            global_source_table_name: hunt.global_source_table_name,
            customers: hunt.customers,
            rules: hunt.rules.map((rule) => rule.rule_name),
          }}
        >
          <Form.Item
            name="name"
            label={<Form.Label required>Name</Form.Label>}
            rules={[formValidation]}
            className="w-full mb-2"
          >
            <Input placeholder={`${hunt.name}_copy`} />
          </Form.Item>
          <Form.Item
            name="display_name"
            label="Display Name"
            rules={[formValidation]}
            className="w-full mb-2"
          >
            <Input placeholder={`Copy: ${hunt.display_name ?? hunt.name}`} />
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
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};
