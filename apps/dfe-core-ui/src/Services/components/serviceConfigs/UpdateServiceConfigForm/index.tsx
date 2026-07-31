import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { TFetchServiceConfigDetailResponse } from '@/Services/hooks/serviceConfigs/useFetchServiceConfigDetail/types';
import { useUpdateServiceConfig } from '@/Services/hooks/serviceConfigs/useUpdateServiceConfig';
import {
  TServiceConfigUpdateRequestBody,
  TServiceConfigUpdateResponse,
} from '@/Services/hooks/serviceConfigs/useUpdateServiceConfig/types';
import { App, Button } from 'antd';
import { FormSectionRender } from './FormSectionRender';

export const UpdateServiceConfigForm = ({
  serviceConfig: { config, service, instance },
  onSuccess,
}: {
  serviceConfig: TFetchServiceConfigDetailResponse;
  onSuccess?: (serviceConfig: TServiceConfigUpdateResponse) => void;
}) => {
  const { notification } = App.useApp();
  const {
    metrics,
    logging,
    kafka,
    archive,
    buffer,
    memory,
    routing,
    compression,
  } = config;

  const {
    mutate: updateServiceConfig,
    isPending,
    error,
  } = useUpdateServiceConfig({
    onSuccess: (response) => {
      notification.success({
        title: 'Service config updated successfully',
        description: `Updated ${service}/${instance}`,
        placement: 'bottomLeft',
      });
      onSuccess?.(response);
    },
  });

  const [form] = Form.useForm();

  const handleFinish = (values: TServiceConfigUpdateRequestBody) => {
    updateServiceConfig({
      ...values,
      serviceName: service,
      instanceName: instance,
    });
  };
  return (
    <Form
      form={form}
      onFinish={handleFinish}
      initialValues={{
        metrics,
        logging,
        kafka,
        archive,
        buffer,
        memory,
        routing,
        compression,
      }}
      className="flex flex-col gap-4 pt-4"
    >
      <FormSectionRender
        title="Metrics"
        formKey="metrics"
        data={metrics as Record<string, unknown>}
      />
      <FormSectionRender
        title="Logging"
        formKey="logging"
        data={logging as Record<string, unknown>}
      />
      <FormSectionRender
        title="Kafka"
        formKey="kafka"
        data={kafka as Record<string, unknown>}
      />
      <FormSectionRender
        title="Archive"
        formKey="archive"
        data={archive as Record<string, unknown>}
      />
      <FormSectionRender
        title="Buffer"
        formKey="buffer"
        data={buffer as Record<string, unknown>}
      />
      <FormSectionRender
        title="Memory"
        formKey="memory"
        data={memory as Record<string, unknown>}
      />
      <FormSectionRender
        title="Routing"
        formKey="routing"
        data={routing as Record<string, unknown>}
      />
      <FormSectionRender
        title="Compression"
        formKey="compression"
        data={compression as Record<string, unknown>}
      />

      {error && <FormNotification text={error.message} type="error" />}
      <Form.Item className="flex justify-end">
        <Button type="primary" htmlType="submit" loading={isPending}>
          Update
        </Button>
      </Form.Item>
    </Form>
  );
};
