import { useCloneSource } from '@/Sources/hooks/useCloneSource';
import { SourceCreateResponse } from '@/Sources/hooks/useCreateSource/types';
import { sourceNameValidator } from '@/Sources/utils/validation';
import { Form } from '@/core/components/Form';
import type { SourceSummary } from '@/core/hooks/useFetchInfiniteFilteredSources/types';

import { FormNotification } from '@/core/components/FormNotification';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { IconCopy } from '@dfe/icons';
import { Button, Input, Modal, Switch } from 'antd';
import { useState } from 'react';
import z from 'zod';

const formSchema = z.object({
  source: sourceNameValidator,
  display_name: z.string().min(1, { message: 'Display name is required' }),
});

type FormData = z.infer<typeof formSchema>;

export const CloneSourceModal = ({
  source,
  onSuccess,
}: {
  source: SourceSummary;
  onSuccess?: (source: SourceCreateResponse) => void;
}) => {
  const [enabled, setEnabled] = useState(false);
  const [form] = Form.useForm<FormData>();
  const formValidation = useAntdZodResolver<FormData>(formSchema);
  const [open, setOpen] = useState(false);
  const {
    mutate: cloneSourceMutation,
    isPending,
    error,
  } = useCloneSource({
    source_name: source?.source,
    onSuccess: (data) => {
      setOpen(false);
      onSuccess?.(data);
    },
    enabled,
  });
  const handleCloneSource = (values: FormData) => {
    cloneSourceMutation(values);
  };

  return (
    <>
      <Button
        type="default"
        shape="circle"
        size="small"
        aria-label={`Clone ${source.source}`}
        icon={<IconCopy />}
        onClick={() => {
          setOpen(true);
          setEnabled(true);
        }}
      />
      <Modal
        title={`Clone ${source.source}`}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          onFinish={handleCloneSource}
          initialValues={{
            ...source,
            source: undefined,
          }}
        >
          <div className="flex gap-x-2">
            <Form.Item
              name="source"
              label="Source"
              rules={[formValidation]}
              className="mb-2 w-full"
            >
              <Input placeholder={`${source.source}_copy`} />
            </Form.Item>
            <Form.Item name="enabled" label="Enabled" rules={[formValidation]}>
              <Switch />
            </Form.Item>
          </div>

          <Form.Item
            name="display_name"
            label="Display Name"
            rules={[formValidation]}
            className="mb-2"
          >
            <Input
              placeholder={`${source.display_name ?? source.source} - copy`}
            />
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
