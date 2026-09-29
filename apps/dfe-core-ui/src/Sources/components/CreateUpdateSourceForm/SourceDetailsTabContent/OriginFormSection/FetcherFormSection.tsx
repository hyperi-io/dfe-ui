import { AceEditor } from '@/core/components/AceEditor';
import { Form } from '@/core/components/Form';
import { NotificationCard } from '@/core/components/NotificationCard';
import { useFetchApps } from '@/core/hooks/apps/instances/useFetchApps';
import { IconInfoCircle } from '@repo/dfe-icons';
import { FormRule, Select } from 'antd';
import { getFetcherSourceTypes } from './helpers';

export const FetcherFormSection = ({
  formValidation,
}: {
  formValidation: FormRule;
}) => {
  const { data: apps, isLoading } = useFetchApps();
  const sourceTypes = getFetcherSourceTypes(apps);
  const hasSourceTypes = sourceTypes.length > 0;

  return (
    <>
      <NotificationCard
        icon={<IconInfoCircle />}
        description="A fetcher polls the source API and gets its own deployment, one per source"
      />

      <Form.Item
        name={['fetcher', 'source_type']}
        label="Source type"
        rules={[formValidation]}
        help={
          hasSourceTypes
            ? undefined
            : 'No fetcher is deployed, so there are no source types to pick from'
        }
      >
        <Select
          loading={isLoading}
          disabled={!hasSourceTypes}
          showSearch
          placeholder="Select source type"
          options={sourceTypes.map((sourceType) => ({
            label: sourceType,
            value: sourceType,
          }))}
        />
      </Form.Item>

      <Form.Item
        name={['fetcher', 'config']}
        label="Config"
        rules={[formValidation]}
        help="The fetcher's own YAML stanza. Credentials must be env: or vault: references, never literals."
      >
        <AceEditor name="fetcher_config" mode="yaml" height="300px" />
      </Form.Item>
    </>
  );
};
