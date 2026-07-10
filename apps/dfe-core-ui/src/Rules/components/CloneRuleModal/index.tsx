import { Form } from '@/core/components/Form';

import { FormNotification } from '@/core/components/FormNotification';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useListRulesContext } from '@/Rules/contexts/ListRulesContext';
import { useCreateRule } from '@/Rules/hooks/useCreateRule';
import { TRuleCreateResponse } from '@/Rules/hooks/useCreateRule/types';
import { RuleDetail } from '@/Rules/hooks/useFetchRuleDetail/types';
import { IconCopy } from '@repo/dfe-icons';
import { Button, ButtonProps, Input, Modal } from 'antd';
import { cloneElement, useState } from 'react';
import z from 'zod';

export const DB_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .refine((v) => DB_NAME_REGEX.test(v), {
      message:
        'Name must contain only letters, numbers, underscores, and hyphens',
    }),
});

type FormData = z.infer<typeof formSchema>;

interface CloneRuleModalProps {
  rule: RuleDetail;
  onSuccess?: (data: TRuleCreateResponse) => void;
  onError?: (error: Error) => void;
  trigger?: React.ReactElement<ButtonProps>;
}
export const CloneRuleModal = ({
  rule,
  onSuccess: onSuccessProp,
  onError,
  trigger,
}: CloneRuleModalProps) => {
  const [form] = Form.useForm<FormData>();
  const formValidation = useAntdZodResolver<FormData>(formSchema);
  const [open, setOpen] = useState(false);

  const { refetch: refetchRules } = useListRulesContext();

  const onSuccess = (data: TRuleCreateResponse) => {
    refetchRules();
    onSuccessProp?.(data);
    setOpen(false);
  };

  const {
    mutate: createRuleMutation,
    isPending,
    error,
  } = useCreateRule({
    onSuccess,
    onError,
  });
  const handleCloneRule = (values: FormData) => {
    createRuleMutation({
      source_type: 'raw',
      user_sql: rule.original_sql,
      severity: rule.severity,
      cel_filter: rule.cel_filter,
      hunt_name: rule.hunt_name,
      source: rule.source,
      estimate_cost: false,
      cost_window_minutes: 0,
      name: values.name,
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
              aria-label={`Clone ${rule.display_name ?? rule.name}`}
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
                aria-label={`Clone ${rule.display_name ?? rule.name}`}
                icon={<IconCopy />}
                onClick={handleOpen}
              />
            </span>
          )}
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        title={`Clone ${rule.display_name ?? rule.name}`}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          onFinish={handleCloneRule}
          initialValues={{
            name: `${rule.name}_copy`,
            display_name: `Copy: ${rule.display_name ?? rule.name}`,
            user_sql: rule.original_sql,
            severity: rule.severity,
            cel_filter: rule.cel_filter,
            hunt_name: rule.hunt_name,
            source: rule.source,
          }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[formValidation]}
            className="w-full mb-2"
          >
            <Input placeholder={`${rule.name}_copy`} />
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
