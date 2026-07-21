import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { SectionCard } from '@/core/components/SectionCard';
import { useFetchRepositoryPreferences } from '@/Platform/hooks/repository/useFetchRepositoryPreferences';
import { usePatchRepositoryPreferences } from '@/Platform/hooks/repository/usePatchRepositoryPreferences';
import { Button, Select, Spin } from 'antd';

export const RepositoryPreferences = () => {
  const [form] = Form.useForm();
  const {
    data: { preferences: repositoryPreferences, etag } = {},
    isLoading: isLoadingRepositoryPreferences,
    error: errorRepositoryPreferences,
  } = useFetchRepositoryPreferences();
  const {
    mutate: updateRepositoryPreferences,
    isPending: isUpdatingRepositoryPreferences,
    error: errorUpdatingRepositoryPreferences,
  } = usePatchRepositoryPreferences();
  return (
    <SectionCard
      title={
        <span className="w-full flex items-center justify-between gap-2">
          Repository Preferences{' '}
          <span className="text-xs bg-foreground/10 dark:bg-foreground/10 px-4 py-1 rounded-full">
            ETag: {etag ?? 'None'}
          </span>
        </span>
      }
    >
      {isLoadingRepositoryPreferences && (
        <>
          <Spin /> <span className="sr-only">Loading...</span>
        </>
      )}
      {errorRepositoryPreferences && (
        <FormNotification
          text={errorRepositoryPreferences.message}
          type="error"
        />
      )}
      <Form
        form={form}
        initialValues={repositoryPreferences}
        onFinish={updateRepositoryPreferences}
      >
        <Form.Item name="theme" label="Theme">
          <Select
            options={[
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
            ]}
            placeholder="Select a theme"
          />
        </Form.Item>

        {errorUpdatingRepositoryPreferences && (
          <FormNotification
            text={errorUpdatingRepositoryPreferences.message}
            type="error"
          />
        )}

        <Form.Item className="flex justify-end">
          <Button
            type="primary"
            htmlType="submit"
            loading={isUpdatingRepositoryPreferences}
          >
            Update
          </Button>
        </Form.Item>
      </Form>
    </SectionCard>
  );
};
