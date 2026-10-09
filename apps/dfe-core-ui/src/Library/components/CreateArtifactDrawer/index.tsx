'use client';

import { Drawer } from '@/core/components/Drawer';
import { Form } from '@/core/components/Form';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { WriteResultFeedback } from '@/core/components/WriteResultFeedback';
import { getApiErrorResponseBody } from '@/core/config/api/client';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useCreateLibraryArtifact } from '@/Library/hooks/useCreateLibraryArtifact';
import { useFetchLibraryKinds } from '@/Library/hooks/useFetchLibraryKinds';
import { IconPlus } from '@repo/dfe-icons';
import { Button, Input, Select } from 'antd';
import { useState } from 'react';
import z from 'zod';

const formSchema = z.object({
  name: z
    .string({ message: 'Name is required' })
    .min(1, { message: 'Name is required' }),
  kind: z
    .string({ message: 'Kind is required' })
    .min(1, { message: 'Kind is required' }),
  group: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
});
type CreateArtifactFormData = z.infer<typeof formSchema>;

/**
 * Create an artefact, with or without a first version.
 *
 * The kind list comes from the engine's manifest, so a new authored language
 * appears in this form on a manifest edit rather than a UI release.
 */
export const CreateArtifactDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [form] = Form.useForm<CreateArtifactFormData>();
  const { data: kinds } = useFetchLibraryKinds({ queryEnabled: isOpen });
  const formValidation = useAntdZodResolver(formSchema);
  const {
    data: result,
    mutate: createArtifact,
    isPending,
    error,
    reset,
  } = useCreateLibraryArtifact();

  const handleFinish = (values: CreateArtifactFormData) => {
    reset();
    createArtifact({
      name: values.name,
      kind: values.kind,
      group: values.group ?? '',
      description: values.description ?? '',
      labels: {},
      message: '',
      ...(values.content ? { content: values.content } : {}),
    });
  };

  const message = getApiErrorResponseBody(error)?.message ?? error?.message;

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.library_write}>
        <RbacProtected.Unrestricted>
          <Button
            type="primary"
            icon={<IconPlus />}
            onClick={() => setIsOpen(true)}
          >
            New artefact
          </Button>
        </RbacProtected.Unrestricted>
      </RbacProtected>

      <Drawer
        title="New artefact"
        open={isOpen}
        size="40%"
        onClose={() => setIsOpen(false)}
      >
        <Form form={form} onFinish={handleFinish}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true }, formValidation]}
          >
            <Input placeholder="syslog-parse" />
          </Form.Item>

          <Form.Item
            name="kind"
            label="Kind"
            rules={[{ required: true }, formValidation]}
          >
            <Select
              placeholder="Select a kind"
              options={(kinds ?? []).map((kind) => ({
                label: `${kind.name} (${kind.suffixes.join(', ')})`,
                value: kind.name,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="group"
            label="Group"
            help="Optional namespace, used for filtering."
            rules={[formValidation]}
          >
            <Input placeholder="network" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[formValidation]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item
            name="content"
            label="First version"
            help="Leave empty to create the artefact without content and publish later."
            rules={[formValidation]}
          >
            <Input.TextArea rows={8} className="font-mono" />
          </Form.Item>

          {message && <NotificationCard type="error" title={message} />}
          {result && <WriteResultFeedback result={result} />}

          <Form.Item className="flex justify-end">
            <Button type="primary" htmlType="submit" loading={isPending}>
              Create
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};
