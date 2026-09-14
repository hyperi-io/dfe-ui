'use client';

import { Form } from '@/core/components/Form';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Table } from '@/core/components/Table';
import { WriteResultFeedback } from '@/core/components/WriteResultFeedback';
import { getApiErrorResponseBody } from '@/core/config/api/client';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { TLibraryArtifactDetail } from '@/Library/hooks/useFetchLibraryArtifactDetail/types';
import { useFetchLibraryVersions } from '@/Library/hooks/useFetchLibraryVersions';
import { usePublishLibraryVersion } from '@/Library/hooks/usePublishLibraryVersion';
import { useRollbackLibraryArtifact } from '@/Library/hooks/useRollbackLibraryArtifact';
import { Button, Input, Tag } from 'antd';
import z from 'zod';

const formSchema = z.object({
  content: z
    .string({ message: 'Content is required' })
    .min(1, { message: 'Content is required' }),
  description: z.string().optional(),
});
type PublishFormData = z.infer<typeof formSchema>;

/**
 * An artefact's version history, plus publishing and rollback.
 *
 * Versions are immutable and a rollback moves the `current` pointer rather
 * than removing anything, so nothing on this surface destroys history.
 */
export const ArtifactVersions = ({
  artifact,
}: {
  artifact: TLibraryArtifactDetail;
}) => {
  const [form] = Form.useForm<PublishFormData>();
  const formValidation = useAntdZodResolver(formSchema);
  const { data: versions } = useFetchLibraryVersions({
    artifact: artifact.name,
  });
  const {
    data: publishResult,
    mutate: publishVersion,
    isPending: isPublishing,
    error: publishError,
    reset,
  } = usePublishLibraryVersion({ artifact: artifact.name });
  const {
    data: rollbackResult,
    mutate: rollback,
    isPending: isRollingBack,
  } = useRollbackLibraryArtifact({ artifact: artifact.name });

  const publishMessage =
    getApiErrorResponseBody(publishError)?.message ?? publishError?.message;

  const columns = [
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      render: (value: number) => (
        <span className="flex items-center gap-1">
          {value}
          {value === artifact.current && <Tag color="green">current</Tag>}
        </span>
      ),
    },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'By', dataIndex: 'published_by', key: 'published_by' },
    {
      title: 'Published',
      dataIndex: 'published_at',
      key: 'published_at',
      render: (value: number) =>
        value ? new Date(value * 1000).toLocaleString() : '-',
    },
    {
      title: 'Digest',
      dataIndex: 'digest',
      key: 'digest',
      render: (value: string) => (
        <span className="font-mono text-xs">{value.slice(0, 16)}</span>
      ),
    },
    {
      title: '',
      key: 'actions',
      render: (_: unknown, row: { version: number }) =>
        row.version === artifact.current ? null : (
          <RbacProtected action={RbacProtected.rbacActions.library_write}>
            <RbacProtected.Unrestricted>
              <Button
                size="small"
                loading={isRollingBack}
                onClick={() => rollback({ version: row.version })}
              >
                Make current
              </Button>
            </RbacProtected.Unrestricted>
          </RbacProtected>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <Table rowKey="version" columns={columns} dataSource={versions ?? []} />

      {rollbackResult && <WriteResultFeedback result={rollbackResult} />}

      <RbacProtected action={RbacProtected.rbacActions.library_write}>
        <RbacProtected.Unrestricted>
          <Form
            form={form}
            onFinish={(values: PublishFormData) => {
              reset();
              publishVersion({
                content: values.content,
                description: values.description ?? '',
                message: '',
              });
            }}
          >
            <Form.Item
              name="content"
              label={<Form.Label required>Publish a new version</Form.Label>}
              rules={[formValidation]}
            >
              <Input.TextArea rows={10} className="font-mono" />
            </Form.Item>
            <Form.Item
              name="description"
              label="What changed"
              help="Fixed to this version at publish - it does not change afterwards."
              rules={[formValidation]}
            >
              <Input />
            </Form.Item>

            {publishMessage && (
              <NotificationCard type="error" title={publishMessage} />
            )}
            {publishResult && <WriteResultFeedback result={publishResult} />}

            <Form.Item className="flex justify-end">
              <Button type="primary" htmlType="submit" loading={isPublishing}>
                Publish
              </Button>
            </Form.Item>
          </Form>
        </RbacProtected.Unrestricted>
      </RbacProtected>
    </div>
  );
};
