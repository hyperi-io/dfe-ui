import { Form } from '@/core/components/Form';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { ApiError, getApiErrorResponseBody } from '@/core/config/api/client';
import { useFetchRetention } from '@/Platform/hooks/system/useFetchRetention';
import { useUpdateRetention } from '@/Platform/hooks/system/useUpdateRetention';
import { TUpdateSystemRetentionResponse } from '@/Platform/hooks/system/useUpdateRetention/types';
import { App, Button, InputNumber } from 'antd';
import { useEffect } from 'react';

type RetentionFormData = {
  default_ttl_days?: number | null;
};

const dataListTermStyle = 'text-foreground/50 dark:text-foreground/50';

const formatDays = (days: number) => (days === 0 ? 'none' : `${days} days`);

const successTitle = (result: TUpdateSystemRetentionResponse) =>
  result.origin === 'override'
    ? `Default retention set to ${formatDays(result.effective)}`
    : `Default retention follows the deployment default (${formatDays(result.effective)})`;

const successDescription = (result: TUpdateSystemRetentionResponse) =>
  result.reconcile.tables_altered.length > 0
    ? `${result.reconcile.summary}: ${result.reconcile.tables_altered.join(', ')}`
    : result.reconcile.summary;

export const RetentionCard = () => {
  const [form] = Form.useForm<RetentionFormData>();
  const { notification } = App.useApp();
  const { data: retention, isLoading, error } = useFetchRetention();
  const {
    mutate: updateRetention,
    isPending,
    error: updateError,
    reset: resetUpdate,
  } = useUpdateRetention({
    onSuccess: (result) => {
      notification.success({
        title: successTitle(result),
        description: successDescription(result),
        placement: 'bottomLeft',
      });
    },
  });

  useEffect(() => {
    if (!retention) return;
    form.setFieldsValue({ default_ttl_days: retention.effective });
  }, [form, retention]);

  const handleFinish = (values: RetentionFormData) => {
    resetUpdate();
    updateRetention({ default_ttl_days: values.default_ttl_days ?? null });
  };

  const handleUseDeploymentDefault = () => {
    resetUpdate();
    updateRetention({ default_ttl_days: null });
  };

  const updateMessage =
    getApiErrorResponseBody(updateError)?.message ?? updateError?.message;
  const storedButNotApplied =
    updateError instanceof ApiError && updateError.status === 502;

  return (
    <SectionCard title="Retention">
      <RbacProtected action={RbacProtected.rbacActions.system_read}>
        <RbacProtected.Unrestricted>
          {isLoading && <div>Loading...</div>}
          {error && <div>Error: {error.message}</div>}
          {retention && (
            <>
              <dl className="grid grid-cols-[auto_1fr_auto_1fr] gap-x-4 gap-y-2 text-xs">
                <dt className={dataListTermStyle}>Default Retention</dt>
                <dd>{formatDays(retention.effective)}</dd>
                <dt className={dataListTermStyle}>Origin</dt>
                <dd>
                  {retention.origin === 'override'
                    ? 'override set here'
                    : 'deployment default'}
                </dd>
                {retention.origin === 'override' && (
                  <>
                    <dt className={dataListTermStyle}>Deployment Default</dt>
                    <dd>{formatDays(retention.deployment_default)}</dd>
                  </>
                )}
              </dl>
              <RbacProtected action={RbacProtected.rbacActions.system_write}>
                <RbacProtected.Unrestricted>
                  <Form form={form} onFinish={handleFinish}>
                    <Form.Item
                      name="default_ttl_days"
                      label="Default retention (days)"
                      help="Whole days. 0 keeps data with no TTL. Leave empty to follow the deployment default."
                    >
                      <InputNumber
                        className="w-full"
                        min={0}
                        precision={0}
                        step={1}
                        placeholder="Enter retention days"
                      />
                    </Form.Item>

                    {updateMessage && (
                      <NotificationCard
                        type="error"
                        title={updateMessage}
                        description={
                          storedButNotApplied
                            ? 'The value is stored and will apply on the next schema apply.'
                            : undefined
                        }
                      />
                    )}

                    <Form.Item className="flex justify-end">
                      <Button
                        className="mr-2"
                        onClick={handleUseDeploymentDefault}
                        disabled={
                          retention.origin === 'deployment' || isPending
                        }
                      >
                        Use deployment default
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={isPending}
                        disabled={isPending}
                      >
                        Save
                      </Button>
                    </Form.Item>
                  </Form>
                </RbacProtected.Unrestricted>
                <RbacProtected.Restricted tooltip={{ show: true }}>
                  <Button disabled>Save</Button>
                </RbacProtected.Restricted>
              </RbacProtected>
            </>
          )}
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </SectionCard>
  );
};
