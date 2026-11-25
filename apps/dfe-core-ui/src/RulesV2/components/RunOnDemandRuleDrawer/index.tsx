import { AceEditor } from '@/core/components/AceEditor';
import { Drawer } from '@/core/components/Drawer';
import { Form } from '@/core/components/Form';
import { Modal } from '@/core/components/Modal';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SourceSelect } from '@/core/components/SourceSelect';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { TRuleDetail } from '@/RulesV2/hooks/useFetchRuleDetail/types';
import { useTriggerOnDemandRule } from '@/RulesV2/hooks/useTriggerOnDemandRule';
import { TTriggerOnDemandRuleResponse } from '@/RulesV2/hooks/useTriggerOnDemandRule/types';
import { IconPlayerPlay } from '@repo/dfe-icons';
import { Button, ButtonProps, Spin } from 'antd';
import { cloneElement, useState } from 'react';
import z from 'zod';

const formSchema = z.object({
  source: z.string().min(1, { message: 'Source is required' }),
});

type FormData = z.infer<typeof formSchema>;

interface RunOnDemandRuleDrawerProps {
  rule: TRuleDetail;
  onSuccess?: (data: TTriggerOnDemandRuleResponse) => void;
  onError?: (error: Error) => void;
  trigger?: React.ReactElement<ButtonProps>;
}
export const RunOnDemandRuleDrawer = ({
  rule,
  onSuccess: onSuccessProp,
  onError,
  trigger,
}: RunOnDemandRuleDrawerProps) => {
  const [form] = Form.useForm<FormData>();
  const formValidation = useAntdZodResolver<FormData>(formSchema);

  const [openModal, setOpenModal] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);

  const onSuccess = (data: TTriggerOnDemandRuleResponse) => {
    setOpenDrawer(true);
    onSuccessProp?.(data);
  };

  const {
    data,
    mutate: runOnDemandRuleMutation,
    isPending,
    error,
  } = useTriggerOnDemandRule({
    name: rule.name,
    onSuccess,
    onError,
  });

  const handleOpen = () => {
    setOpenModal(true);
  };

  const handleRunOnDemandRule = (values: FormData) => {
    runOnDemandRuleMutation({
      source: values.source,
      name: rule.name,
      source_type: rule.source_type ?? 'raw',
    });
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
              aria-label={`Run on demand ${rule.display_name ?? rule.name}`}
              icon={<IconPlayerPlay />}
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
                aria-label={`Run on demand ${rule.display_name ?? rule.name}`}
                icon={<IconPlayerPlay />}
                onClick={handleOpen}
              />
            </span>
          )}
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        title={`Run on demand ${rule.display_name ?? rule.name}`}
        open={openModal}
        onCancel={() => setOpenModal(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} onFinish={handleRunOnDemandRule}>
          <Form.Item name="source" label="Source" rules={[formValidation]}>
            <SourceSelect />
          </Form.Item>

          {error && (
            <NotificationCard
              title="Error running on demand rule"
              description={error.message}
              type="error"
            />
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="default"
              htmlType="button"
              onClick={() => setOpenModal(false)}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={isPending}>
              Run on demand
            </Button>
          </div>
        </Form>
      </Modal>

      <Drawer
        title={`On-demand Result for ${rule.display_name ?? rule.name}`}
        open={openDrawer}
        footer={null}
        size="80%"
        destroyOnHidden
        preventClickaway={{
          enabled: false,
        }}
      >
        {isPending && (
          <div className="flex items-center w-full">
            <Spin /> <span className="sr-only">Loading</span>
          </div>
        )}
        {error && (
          <NotificationCard
            title="Error running on demand rule"
            description={error.message}
            type="error"
          />
        )}
        {data && (
          <AceEditor
            value={JSON.stringify(data, null, 2)}
            readOnly
            theme="github"
            height="100%"
            width="100%"
          />
        )}
      </Drawer>
    </>
  );
};
