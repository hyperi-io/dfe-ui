'use client';

import { Drawer } from '@/core/components/Drawer';
import { Form } from '@/core/components/Form';
import { NotificationCard } from '@/core/components/NotificationCard';
import { WriteResultFeedback } from '@/core/components/WriteResultFeedback';
import { getApiErrorResponseBody } from '@/core/config/api/client';
import { useLinkAppFile } from '@/core/hooks/apps/files/useLinkAppFile';
import { useFetchLibraryArtifacts } from '@/core/hooks/library/useFetchLibraryArtifacts';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { APP_FILENAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { IconLink } from '@repo/dfe-icons';
import { Button, Input, Select } from 'antd';
import { useMemo, useState } from 'react';
import z from 'zod';

const buildFormSchema = (suffixes: string[]) =>
  z.object({
    name: z
      .string({ message: 'Filename is required' })
      .min(1, { message: 'Filename is required' })
      .refine((v) => APP_FILENAME_VALIDATOR.regex.test(v), {
        message: APP_FILENAME_VALIDATOR.message('Filename'),
      })
      .refine((v) => suffixes.some((suffix) => v.endsWith(suffix)), {
        message: 'Filename needs an extension this app reads',
      }),
    artifact: z
      .string({ message: 'Artefact is required' })
      .min(1, { message: 'Artefact is required' }),
    tag: z.string().optional(),
    version: z.number().optional(),
  });
type LinkFormData = z.infer<ReturnType<typeof buildFormSchema>>;

/**
 * Point one file in the set at a library artefact.
 *
 * A link may name a version or follow a tag, and the engine records the
 * version it actually resolved either way - so "linked to stable" never leaves
 * you guessing what deployed.
 */
export const LinkArtifactDrawer = ({
  service,
  instance,
  setName,
  suffixes,
}: {
  service: string;
  instance: string;
  setName: string;
  suffixes: string[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form] = Form.useForm<LinkFormData>();
  const formSchema = useMemo(() => buildFormSchema(suffixes), [suffixes]);
  const formValidation = useAntdZodResolver(formSchema);
  const { data: artifacts } = useFetchLibraryArtifacts({
    queryEnabled: isOpen,
  });
  const {
    data: linkResult,
    mutate: linkFile,
    isPending,
    error,
    reset,
  } = useLinkAppFile({ service, instance, setName });

  const selectedArtifact = Form.useWatch('artifact', form);
  const artifactOptions = useMemo(
    () =>
      (artifacts ?? []).map((artifact) => ({
        label: artifact.group
          ? `${artifact.group}/${artifact.name}`
          : artifact.name,
        value: artifact.name,
      })),
    [artifacts],
  );
  const tagOptions = useMemo(() => {
    const found = artifacts?.find((item) => item.name === selectedArtifact);
    return Object.keys(found?.tags ?? {}).map((tag) => ({
      label: tag,
      value: tag,
    }));
  }, [artifacts, selectedArtifact]);

  const handleFinish = (values: LinkFormData) => {
    reset();
    linkFile({
      name: values.name,
      artifact: values.artifact,
      tag: values.tag ?? '',
      ...(values.version ? { version: Number(values.version) } : {}),
    });
  };

  const message = getApiErrorResponseBody(error)?.message ?? error?.message;

  return (
    <>
      <Button size="small" icon={<IconLink />} onClick={() => setIsOpen(true)}>
        Link from library
      </Button>
      <Drawer
        title="Link from library"
        open={isOpen}
        size="40%"
        onClose={() => setIsOpen(false)}
      >
        <Form form={form} onFinish={handleFinish}>
          <Form.Item
            name="name"
            label="Filename"
            extra={`Must end in one of ${suffixes.join(', ')}`}
            rules={[formValidation]}
          >
            <Input placeholder={`my-file${suffixes[0] ?? ''}`} />
          </Form.Item>

          <Form.Item name="artifact" label="Artefact" rules={[formValidation]}>
            <Select
              options={artifactOptions}
              placeholder="Select an artefact"
              showSearch
            />
          </Form.Item>

          <Form.Item
            name="tag"
            label="Follow a tag"
            help="Leave both empty to pin the artefact's current version."
          >
            <Select options={tagOptions} allowClear placeholder="No tag" />
          </Form.Item>

          <Form.Item name="version" label="Or pin a version number">
            <Input type="number" placeholder="Current version" />
          </Form.Item>

          {message && <NotificationCard type="error" title={message} />}
          {linkResult && <WriteResultFeedback result={linkResult} />}

          <Form.Item className="flex justify-end">
            <Button type="primary" htmlType="submit" loading={isPending}>
              Link
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};
