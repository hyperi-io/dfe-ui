'use client';

import { WriteResultFeedback } from '@/core/components/WriteResultFeedback';
import { TLibraryArtifactDetail } from '@/Library/hooks/useFetchLibraryArtifactDetail/types';
import { usePatchLibraryArtifact } from '@/Library/hooks/usePatchLibraryArtifact';
import { useSetLibraryArtifactState } from '@/Library/hooks/useSetLibraryArtifactState';
import { Form } from '@/core/components/Form';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { getApiErrorResponseBody } from '@/core/config/api/client';
import { LIBRARY_TOKEN_VALIDATOR } from '@/core/validationSchemas/utils';
import { Button, FormRule, Input, Select } from 'antd';
import { useEffect } from 'react';

type LabelsFormData = {
  description?: string;
  group?: string;
  labels?: string;
};

/** Parse the `key=value` lines the form edits back into a label map. */
export const parseLabelLines = (raw: string): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const split = trimmed.indexOf('=');
    if (split <= 0) continue;
    out[trimmed.slice(0, split).trim()] = trimmed.slice(split + 1).trim();
  }
  return out;
};

const groupRule: FormRule = {
  validator: (_rule, value?: string) =>
    !value || LIBRARY_TOKEN_VALIDATOR.regex.test(value)
      ? Promise.resolve()
      : Promise.reject(new Error(LIBRARY_TOKEN_VALIDATOR.message('Group'))),
};

const labelsRule: FormRule = {
  validator: (_rule, value?: string) =>
    Object.entries(parseLabelLines(value ?? '')).every(
      ([key, labelValue]) =>
        LIBRARY_TOKEN_VALIDATOR.regex.test(key) &&
        LIBRARY_TOKEN_VALIDATOR.regex.test(labelValue),
    )
      ? Promise.resolve()
      : Promise.reject(
          new Error(
            LIBRARY_TOKEN_VALIDATOR.message('Each label key and value'),
          ),
        ),
};

const formatLabelLines = (labels: Record<string, string>) =>
  Object.entries(labels)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

/**
 * The mutable metadata: description, group, labels and lifecycle state.
 *
 * None of it creates a version. Versions are content, so a relabel must never
 * read as a republish.
 */
export const ArtifactLabels = ({
  artifact,
}: {
  artifact: TLibraryArtifactDetail;
}) => {
  const [form] = Form.useForm<LabelsFormData>();
  const {
    data: patchResult,
    mutate: patchArtifact,
    isPending,
    error,
    reset,
  } = usePatchLibraryArtifact({ artifact: artifact.name });
  const {
    data: stateResult,
    mutate: setState,
    isPending: isSettingState,
  } = useSetLibraryArtifactState({ artifact: artifact.name });

  useEffect(() => {
    form.setFieldsValue({
      description: artifact.description,
      group: artifact.group,
      labels: formatLabelLines(artifact.labels ?? {}),
    });
  }, [artifact, form]);

  const message = getApiErrorResponseBody(error)?.message ?? error?.message;

  return (
    <div className="flex flex-col gap-3">
      <RbacProtected action={RbacProtected.rbacActions.library_write}>
        <RbacProtected.Unrestricted>
          <Form.Item label="Lifecycle state">
            <Select
              value={artifact.state}
              loading={isSettingState}
              onChange={(state) => setState({ state })}
              options={[
                { label: 'enabled', value: 'enabled' },
                { label: 'disabled', value: 'disabled' },
                { label: 'deprecated', value: 'deprecated' },
              ]}
            />
          </Form.Item>
          {stateResult && <WriteResultFeedback result={stateResult} />}

          <Form
            form={form}
            onFinish={(values: LabelsFormData) => {
              reset();
              patchArtifact({
                description: values.description ?? '',
                group: values.group ?? '',
                labels: parseLabelLines(values.labels ?? ''),
              });
            }}
          >
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item name="group" label="Group" rules={[groupRule]}>
              <Input placeholder="network" />
            </Form.Item>
            <Form.Item
              name="labels"
              label="Labels"
              extra="One key=value per line. Listing filters on these."
              rules={[labelsRule]}
            >
              <Input.TextArea rows={4} className="font-mono" />
            </Form.Item>

            {message && <NotificationCard type="error" title={message} />}
            {patchResult && <WriteResultFeedback result={patchResult} />}

            <Form.Item className="flex justify-end">
              <Button htmlType="submit" loading={isPending}>
                Save metadata
              </Button>
            </Form.Item>
          </Form>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </div>
  );
};
