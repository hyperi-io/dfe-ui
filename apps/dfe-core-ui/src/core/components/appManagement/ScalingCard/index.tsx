'use client';

import { useFetchAppScaling } from '@/core/hooks/apps/scaling/useFetchAppScaling';
import { useUpdateAppScaling } from '@/core/hooks/apps/scaling/useUpdateAppScaling';
import { TUpdateAppScalingRequest } from '@/core/hooks/apps/scaling/useUpdateAppScaling/types';
import { WriteResultFeedback } from '@/core/components/WriteResultFeedback';
import { Form } from '@/core/components/Form';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { getApiErrorResponseBody } from '@/core/config/api/client';
import { IconAlertTriangle } from '@repo/dfe-icons';
import { Button, InputNumber, Input, Spin, Switch } from 'antd';
import { useEffect } from 'react';

/** Where these dials land, which is what decides whether they apply at all. */
const DeployTarget = ({ target }: { target: string }) => (
  <p className="text-foreground/60 dark:text-dark-foreground/60 text-sm">
    {`Deploy target: ${target}`}
  </p>
);

type ScalingFormData = {
  keda_enabled?: boolean;
  replica_count?: number | null;
  min_replicas?: number | null;
  max_replicas?: number | null;
  cpu_request?: string | null;
  memory_request?: string | null;
  cpu_limit?: string | null;
  memory_limit?: string | null;
};

/**
 * Both scaling axes on one surface.
 *
 * Horizontal (KEDA's replica range) and vertical (CPU and memory) are separate
 * decisions but the same overlay, so splitting them across two places just
 * hides one of them. Off Kubernetes the endpoint answers `supported: false`
 * with a reason, and that reason is what renders - never a dead slider.
 */
export const ScalingCard = ({
  service,
  instance,
}: {
  service: string;
  instance: string;
}) => {
  const [form] = Form.useForm<ScalingFormData>();
  const {
    data: scaling,
    isLoading,
    error,
  } = useFetchAppScaling({ service, instance });
  const {
    data: writeResult,
    mutate: updateScaling,
    isPending,
    error: updateError,
    reset: resetWriteResult,
  } = useUpdateAppScaling({ service, instance });

  useEffect(() => {
    if (!scaling?.supported) return;
    form.setFieldsValue({
      keda_enabled: scaling.keda_enabled ?? undefined,
      replica_count: scaling.replica_count,
      min_replicas: scaling.min_replicas,
      max_replicas: scaling.max_replicas,
      cpu_request: scaling.cpu_request,
      memory_request: scaling.memory_request,
      cpu_limit: scaling.cpu_limit,
      memory_limit: scaling.memory_limit,
    });
  }, [form, scaling]);

  const kedaEnabled = Form.useWatch('keda_enabled', form);

  if (isLoading) {
    return (
      <SectionCard title="Scaling">
        <Spin size="small" />
      </SectionCard>
    );
  }

  if (error || !scaling) {
    return (
      <SectionCard title="Scaling">
        <NotificationCard
          type="error"
          title="Could not read the scaling dials"
          description={error?.message}
        />
      </SectionCard>
    );
  }

  if (!scaling.supported) {
    return (
      <SectionCard title="Scaling">
        <DeployTarget target={scaling.deploy_target} />
        <NotificationCard
          type="info"
          icon={<IconAlertTriangle />}
          title="Scaling dials do not apply here"
          description={scaling.reason}
        />
      </SectionCard>
    );
  }

  const handleFinish = (values: ScalingFormData) => {
    resetWriteResult();
    // Only send what the operator actually set. A null here means the overlay
    // does not set that dial, which is not the same as setting it to a value,
    // and sending it back would freeze a chart default into the overlay.
    const body: TUpdateAppScalingRequest = Object.fromEntries(
      Object.entries(values).filter(
        ([, value]) => value !== undefined && value !== null && value !== '',
      ),
    );
    // A fixed count needs KEDA explicitly off in the same write. An unset flag
    // reads as the chart default, which both engine guards refuse.
    if (body.replica_count != null && values.keda_enabled !== true) {
      body.keda_enabled = false;
    }
    updateScaling(body);
  };

  const updateMessage =
    getApiErrorResponseBody(updateError)?.message ?? updateError?.message;

  return (
    <SectionCard title="Scaling">
      <DeployTarget target={scaling.deploy_target} />
      <RbacProtected action={RbacProtected.rbacActions.helmvars_write}>
        <RbacProtected.Unrestricted>
          <Form form={form} onFinish={handleFinish}>
            <h2 className="text-sm font-semibold">Horizontal</h2>

            <Form.Item
              name="keda_enabled"
              label="KEDA autoscaling"
              valuePropName="checked"
            >
              <Switch size="small" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-3">
              <Form.Item
                name="min_replicas"
                label="Minimum replicas"
                help="At least 1 - scaling to zero needs an idle replica count this surface does not set."
              >
                <InputNumber
                  min={1}
                  className="w-full"
                  disabled={kedaEnabled === false}
                />
              </Form.Item>
              <Form.Item name="max_replicas" label="Maximum replicas">
                <InputNumber
                  min={1}
                  max={1000}
                  className="w-full"
                  disabled={kedaEnabled === false}
                />
              </Form.Item>
            </div>

            {/* The engine refuses a count while KEDA is on, so the switch and
                the count go in one submission. */}
            <Form.Item
              name="replica_count"
              label="Fixed replica count"
              help="Applies with KEDA off, and is submitted together with the switch. The ScaledObject owns the count while KEDA is on."
            >
              <InputNumber
                min={0}
                max={1000}
                className="w-full"
                disabled={kedaEnabled === true}
              />
            </Form.Item>

            <h2 className="mt-2 text-sm font-semibold">Vertical</h2>

            <div className="grid grid-cols-2 gap-3">
              <Form.Item
                name="cpu_request"
                label="CPU request"
                help="Cores or millicores, e.g. 0.5 or 500m."
              >
                <Input placeholder="unset - chart default applies" />
              </Form.Item>
              <Form.Item name="cpu_limit" label="CPU limit">
                <Input placeholder="unset - chart default applies" />
              </Form.Item>
              <Form.Item
                name="memory_request"
                label="Memory request"
                help="Bytes with an optional suffix, e.g. 512Mi or 2Gi."
              >
                <Input placeholder="unset - chart default applies" />
              </Form.Item>
              <Form.Item name="memory_limit" label="Memory limit">
                <Input placeholder="unset - chart default applies" />
              </Form.Item>
            </div>

            {updateMessage && (
              <NotificationCard type="error" title={updateMessage} />
            )}

            {writeResult && <WriteResultFeedback result={writeResult} />}

            <Form.Item className="flex justify-end">
              <Button
                type="primary"
                htmlType="submit"
                loading={isPending}
                disabled={isPending}
              >
                Commit dials
              </Button>
            </Form.Item>
          </Form>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </SectionCard>
  );
};
