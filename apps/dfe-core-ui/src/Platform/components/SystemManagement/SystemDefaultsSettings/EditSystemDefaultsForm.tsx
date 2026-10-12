import { CommonHeaderSelect } from '@/core/components/CommonHeaderSelect';
import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { SourceEngineSelect } from '@/core/components/SourceEngineSelect';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useUpdateSystemDefaults } from '@/Platform/hooks/system/useUpdateDefaults';
import { TUpdateSystemDefaultsResponse } from '@/Platform/hooks/system/useUpdateDefaults/types';
import { App, Button, InputNumber, Select } from 'antd';
import isInteger from 'lodash/isInteger';
import { useCallback, useMemo, useState } from 'react';
import z from 'zod';

const formSchema = z.object({
  ttl_days: z.number().min(1).max(365),
  engine: z.string().min(1),
  common_header_version: z.string().min(1),
  common_header_type: z.string().min(1),
});

type TFormValues = z.infer<typeof formSchema>;

const normalizeHeaderType = (value?: string) =>
  (value ?? '').replace(/^common-header\//, '');

const haveFormValuesChanged = (
  initial: TFormValues | undefined,
  current: Partial<TFormValues> | undefined,
) => {
  if (!initial || !current) {
    return false;
  }

  const fieldsReady = [
    current.ttl_days,
    current.engine,
    current.common_header_type,
    current.common_header_version,
  ].some((value) => value !== undefined);

  if (!fieldsReady) {
    return false;
  }

  return (
    initial.ttl_days !== current.ttl_days ||
    initial.engine !== current.engine ||
    normalizeHeaderType(initial.common_header_type) !==
      normalizeHeaderType(current.common_header_type) ||
    initial.common_header_version !== current.common_header_version
  );
};

const hasDefaultsChanged = ({
  initial_ttl_days,
  initial_engine,
  initial_common_header_type,
  initial_common_header_version,
  response_ttl_days,
  response_engine,
  response_common_header_type,
  response_common_header_version,
}: {
  initial_ttl_days: number;
  initial_engine: string;
  initial_common_header_type: string;
  initial_common_header_version: string;
  response_ttl_days: number;
  response_engine: string;
  response_common_header_type: string;
  response_common_header_version: string;
}) => {
  return (
    initial_ttl_days !== response_ttl_days ||
    initial_engine !== response_engine ||
    initial_common_header_type !== response_common_header_type ||
    initial_common_header_version !== response_common_header_version
  );
};
export const EditSystemDefaultsForm = ({
  initialValues,
  onSuccess,
  onClose,
}: {
  initialValues?: TFormValues;
  onSuccess?: (
    response: TUpdateSystemDefaultsResponse & { changed: boolean },
  ) => void;
  onClose?: () => void;
}) => {
  const { notification } = App.useApp();

  const {
    mutate: updateSystemDefaults,
    isPending: isUpdating,
    error,
  } = useUpdateSystemDefaults({
    onSuccess: (response) => {
      const changed = hasDefaultsChanged({
        initial_ttl_days: initialValues?.ttl_days ?? 0,
        initial_engine: initialValues?.engine ?? '',
        initial_common_header_type: initialValues?.common_header_type ?? '',
        initial_common_header_version:
          initialValues?.common_header_version ?? '',
        response_ttl_days: response.ttl_days.effective,
        response_engine: response.engine.effective,
        response_common_header_type: response.common_header_type.effective,
        response_common_header_version:
          response.common_header_version.effective,
      });
      onSuccess?.({ ...response, changed });
      notification.success({
        title: 'Common header defaults updated successfully',
        placement: 'bottomLeft',
      });
    },
  });

  const [form] = Form.useForm<TFormValues>();
  const formValidation = useAntdZodResolver(formSchema);
  const ttlDays = Form.useWatch('ttl_days', form);
  const engine = Form.useWatch('engine', form);
  const commonHeaderType = Form.useWatch('common_header_type', form);
  const commonHeaderVersion = Form.useWatch('common_header_version', form);
  const canUpdate =
    !isUpdating &&
    haveFormValuesChanged(initialValues, {
      ttl_days: ttlDays,
      engine,
      common_header_type: commonHeaderType,
      common_header_version: commonHeaderVersion,
    });

  const handleChangeTtlDays = (value: number | null) => {
    if (!value) {
      return;
    }
    if (!isInteger(value)) {
      return form.setFieldsValue({ ttl_days: Math.floor(value) });
    }

    form.setFieldsValue({ ttl_days: value });
  };

  const [commonHeaderVersions, setCommonHeaderVersions] = useState<string[]>(
    [],
  );
  const handleChangeCommonHeader = useCallback(
    (
      value: string | null,
      commonHeader?: { versions: string[] },
      action_type?: string,
    ) => {
      if (value) {
        setCommonHeaderVersions(commonHeader?.versions ?? []);

        if (action_type === '_select') {
          form.setFieldsValue({
            common_header_version:
              commonHeader?.versions?.length === 1
                ? commonHeader?.versions?.[0]
                : undefined,
          });
        }
      }
    },
    [form],
  );
  const commonHeaderVersionsOptions = useMemo(() => {
    return (
      commonHeaderVersions?.map((version) => ({
        label: version,
        value: version,
      })) ?? []
    );
  }, [commonHeaderVersions]);

  const handleFinish = (values: TFormValues) => {
    updateSystemDefaults(values);
  };

  return (
    <Form
      layout="inline"
      className="grid grid-cols-2 gap-1"
      initialValues={initialValues}
      form={form}
      onFinish={handleFinish}
    >
      <Form.Item
        label="Default Retention"
        layout="horizontal"
        name="ttl_days"
        rules={[formValidation]}
      >
        <InputNumber
          onChange={handleChangeTtlDays}
          size="small"
          min={0}
          inputMode="decimal"
        />
      </Form.Item>

      <Form.Item
        layout="horizontal"
        label="Default Engine"
        name="engine"
        rules={[formValidation]}
      >
        <SourceEngineSelect size="small" />
      </Form.Item>

      <Form.Item
        label="Common Header"
        name="common_header_type"
        layout="horizontal"
        rules={[formValidation]}
      >
        <CommonHeaderSelect
          className="min-w-60"
          onChange={handleChangeCommonHeader}
          size="small"
        />
      </Form.Item>

      <Form.Item
        label="Version"
        name="common_header_version"
        layout="horizontal"
        rules={[formValidation]}
      >
        <Select
          className="min-w-32"
          options={commonHeaderVersionsOptions}
          size="small"
        />
      </Form.Item>

      {error && <FormNotification text={error.message} type="error" />}

      <div className="flex gap-2 justify-end col-span-2">
        <Button type="default" onClick={onClose}>
          Cancel
        </Button>

        <Button
          type="primary"
          htmlType="submit"
          loading={isUpdating}
          disabled={!canUpdate}
        >
          Update
        </Button>
      </div>
    </Form>
  );
};
