import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { OrganisationSelect } from '@/core/components/OrganisationSelect';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useTriggerHunt } from '@/Hunts/hooks/useTriggerHunt';
import { IconPlayerPlay } from '@repo/dfe-icons';
import { Button, Modal } from 'antd';
import { useState } from 'react';
import z from 'zod';

const triggerHuntSchema = z.object({
  customer: z.string().min(1, { message: 'Customer is required' }),
});
type TriggerHuntFormValues = z.infer<typeof triggerHuntSchema>;

export const TriggerHunt = ({
  selectedHuntName,
}: {
  selectedHuntName: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form] = Form.useForm<TriggerHuntFormValues>();
  const formValidation = useAntdZodResolver(triggerHuntSchema);

  const {
    mutate: triggerHunt,
    isPending,
    error,
  } = useTriggerHunt({
    name: selectedHuntName,
  });

  const handleSubmit = (values: TriggerHuntFormValues) => {
    triggerHunt(values);
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.hunt_execute}>
        <RbacProtected.Unrestricted>
          <Button onClick={() => setIsOpen(true)}>
            Trigger On-Demand <IconPlayerPlay />
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button disabled>
            Trigger On-Demand <IconPlayerPlay />
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        title="Trigger On-Demand Hunt"
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit}>
          <Form.Item label="Customer" name="customer" rules={[formValidation]}>
            <OrganisationSelect placeholder="Select Customer" />
          </Form.Item>
          {error && <FormNotification text={error.message} type="error" />}
          <Form.Item>
            <Button loading={isPending} type="primary" htmlType="submit">
              Trigger Hunt
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
