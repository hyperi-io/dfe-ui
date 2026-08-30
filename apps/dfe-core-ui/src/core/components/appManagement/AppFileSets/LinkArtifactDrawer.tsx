'use client';

import { WriteResultFeedback } from '@/core/components/WriteResultFeedback';
import { useLinkAppFile } from '@/core/hooks/apps/files/useLinkAppFile';
import { useFetchLibraryArtifacts } from '@/core/hooks/library/useFetchLibraryArtifacts';
import { Drawer } from '@/core/components/Drawer';
import { Form } from '@/core/components/Form';
import { NotificationCard } from '@/core/components/NotificationCard';
import { getApiErrorResponseBody } from '@/core/config/api/client';
import { IconLink } from '@repo/dfe-icons';
import { Button, Input, Select } from 'antd';
import { useMemo, useState } from 'react';

type LinkFormData = {
  name: string;
  artifact: string;
  tag?: string;
  version?: number;
};

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
            help={`Must end in one of ${suffixes.join(', ')}`}
            rules={[{ required: true, message: 'A filename is required' }]}
          >
            <Input placeholder={`my-file${suffixes[0] ?? ''}`} />
          </Form.Item>

          <Form.Item
            name="artifact"
            label="Artefact"
            rules={[{ required: true, message: 'An artefact is required' }]}
          >
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
