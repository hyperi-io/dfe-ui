import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { TDeploymentDetailResponse } from '@/Services/hooks/deployments/useFetchDeploymentDetail/types';
import { useUpdateDeployment } from '@/Services/hooks/deployments/useUpdateDeployment';
import {
  TDeploymentUpdateRequestBody,
  TDeploymentUpdateResponse,
} from '@/Services/hooks/deployments/useUpdateDeployment/types';
import { App, Button } from 'antd';
import { FormSectionRender } from './FormSectionRender';

export const UpdateDeploymentForm = ({
  serviceDeployment: { config, service: serviceName, instance },
  onSuccess,
}: {
  serviceDeployment: TDeploymentDetailResponse;
  onSuccess?: (serviceDeployment: TDeploymentUpdateResponse) => void;
}) => {
  const { notification } = App.useApp();
  const {
    // Raw Fields
    size,
    replicas,
    image,
    // Grouped Objects
    resources,
    keda,
    hpa,
    pod,
    service,
    config_secret,
    extra_env,
  } = config;

  const {
    mutate: updateDeployment,
    isPending,
    error,
  } = useUpdateDeployment({
    onSuccess: (response) => {
      notification.success({
        title: 'Deployment updated successfully',
        description: `Updated ${serviceName}/${instance}`,
        placement: 'bottomLeft',
      });
      onSuccess?.(response);
    },
  });

  const [form] = Form.useForm();

  const handleFinish = (values: TDeploymentUpdateRequestBody) => {
    updateDeployment({ ...values, serviceName, instanceName: instance });
  };
  return (
    <Form
      form={form}
      onFinish={handleFinish}
      initialValues={{
        size,
        replicas,
        image,
        resources,
        keda,
        hpa,
        pod,
        service,
        config_secret,
      }}
      className="flex flex-col gap-4 pt-4"
    >
      <FormSectionRender
        title="Deployment Details"
        data={{
          size,
          replicas,
          image,
        }}
      />
      <FormSectionRender
        title="Resources"
        formKey="resources"
        data={resources as Record<string, unknown>}
      />
      <FormSectionRender
        title="KEDA"
        formKey="keda"
        data={keda as Record<string, unknown>}
      />
      <FormSectionRender
        title="HPA"
        formKey="hpa"
        data={hpa as Record<string, unknown>}
      />
      <FormSectionRender
        title="Pod"
        formKey="pod"
        data={pod as Record<string, unknown>}
      />
      <FormSectionRender
        title="Service"
        formKey="service"
        data={service as Record<string, unknown>}
      />
      <FormSectionRender
        title="Config Secret"
        formKey="config_secret"
        data={config_secret as Record<string, unknown>}
      />
      <FormSectionRender
        title="Extra Env"
        formKey="extra_env"
        data={extra_env as Record<string, unknown>}
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
