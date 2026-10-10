'use client';

import { Form } from '@/core/components/Form';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { WriteResultFeedback } from '@/core/components/WriteResultFeedback';
import { getApiErrorResponseBody } from '@/core/config/api/client';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { LIBRARY_TOKEN_VALIDATOR } from '@/core/validationSchemas/utils';
import { useDeleteLibraryTag } from '@/Library/hooks/useDeleteLibraryTag';
import { TLibraryArtifactDetail } from '@/Library/hooks/useFetchLibraryArtifactDetail/types';
import { useSetLibraryTag } from '@/Library/hooks/useSetLibraryTag';
import { IconTrash } from '@repo/dfe-icons';
import { Button, Input, InputNumber, Select, Tag } from 'antd';
import z from 'zod';

const formSchema = z.object({
  tag: z
    .string({ message: 'Tag name is required' })
    .min(1, { message: 'Tag name is required' })
    .refine((v) => LIBRARY_TOKEN_VALIDATOR.regex.test(v), {
      message: LIBRARY_TOKEN_VALIDATOR.message('Tag name'),
    }),
  version: z
    .number({ message: 'Version is required' })
    .min(1, { message: 'Version is required' }),
});
type TagFormData = z.infer<typeof formSchema>;

/**
 * Tags point at versions; labels classify the artefact. Two mechanisms, kept
 * apart because linking to `stable` and filtering by `team=platform` are
 * different jobs.
 *
 * A tag moves only through this surface, never as a side effect of publishing.
 */
export const ArtifactTags = ({
  artifact,
}: {
  artifact: TLibraryArtifactDetail;
}) => {
  const [form] = Form.useForm<TagFormData>();
  const formValidation = useAntdZodResolver(formSchema);
  const {
    data: setResult,
    mutate: setTag,
    isPending: isSetting,
    error: setError,
    reset,
  } = useSetLibraryTag({ artifact: artifact.name });
  const { mutate: deleteTag, isPending: isDeleting } = useDeleteLibraryTag({
    artifact: artifact.name,
  });

  const entries = Object.entries(artifact.tags ?? {});
  const message =
    getApiErrorResponseBody(setError)?.message ?? setError?.message;

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-wrap gap-2">
        {entries.map(([tag, version]) => (
          <li
            key={tag}
            className="bg-foreground/10 dark:bg-dark-foreground/10 flex items-center gap-2 rounded-md px-3 py-1"
          >
            <Tag color="blue">{tag}</Tag>
            <span className="text-sm">{`version ${version}`}</span>
            <RbacProtected action={RbacProtected.rbacActions.library_write}>
              <RbacProtected.Unrestricted>
                <Button
                  size="small"
                  type="text"
                  aria-label={`Remove tag ${tag}`}
                  icon={<IconTrash />}
                  loading={isDeleting}
                  onClick={() => deleteTag(tag)}
                />
              </RbacProtected.Unrestricted>
            </RbacProtected>
          </li>
        ))}
        {entries.length === 0 && (
          <li className="text-foreground/50 dark:text-dark-foreground/50 text-sm">
            No tags yet.
          </li>
        )}
      </ul>

      <RbacProtected action={RbacProtected.rbacActions.library_write}>
        <RbacProtected.Unrestricted>
          <Form
            form={form}
            onFinish={(values: TagFormData) => {
              reset();
              setTag({ tag: values.tag, body: { version: values.version } });
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <Form.Item name="tag" label="Tag" rules={[formValidation]}>
                <Input placeholder="stable" />
              </Form.Item>
              <Form.Item
                name="version"
                label="Points at version"
                rules={[formValidation]}
              >
                {(artifact.versions ?? []).length > 0 ? (
                  <Select
                    options={(artifact.versions ?? []).map((version) => ({
                      label: String(version),
                      value: version,
                    }))}
                  />
                ) : (
                  <InputNumber min={1} className="w-full" />
                )}
              </Form.Item>
            </div>

            {message && <NotificationCard type="error" title={message} />}
            {setResult && <WriteResultFeedback result={setResult} />}

            <Form.Item className="flex justify-end">
              <Button htmlType="submit" loading={isSetting}>
                Point tag
              </Button>
            </Form.Item>
          </Form>
        </RbacProtected.Unrestricted>
      </RbacProtected>
    </div>
  );
};
