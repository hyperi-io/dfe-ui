import { Form } from '@/core/components/Form';
import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm';
import { FormInstance, FormRule, Input, InputNumber, Select } from 'antd';
import { useMemo, useState } from 'react';
import { AuthTypeProgressiveDisclosure } from './AuthTypeProgressiveDisclosure';
import { BaseUrlSelector } from './BaseUrlSelector';
import { FETCHER_DEFAULTS, FETCHERS } from './fetcher.constants';

export const FetcherForm = ({
  formValidation,
  form,
}: {
  formValidation: FormRule;
  form: FormInstance<CreateUpdateSourceFormData>;
}) => {
  const [search, setSearch] = useState<string>('');
  const sourceType = Form.useWatch(['fetcher', 'source_type'], form);
  const baseUrl = Form.useWatch(['fetcher', 'base_url'], form);
  const [provider] = (sourceType ?? '').split('.');
  const defaults =
    provider &&
    provider in FETCHER_DEFAULTS &&
    FETCHER_DEFAULTS[provider as keyof typeof FETCHER_DEFAULTS];

  const handleSourceTypeChange = (value: string) => {
    if (!value) return undefined;
    const [provider] = value.split('.');
    const selectedDefaults =
      provider &&
      provider in FETCHER_DEFAULTS &&
      FETCHER_DEFAULTS[provider as keyof typeof FETCHER_DEFAULTS];

    if (selectedDefaults) {
      form.setFieldsValue({
        fetcher: { source_type: value, ...selectedDefaults },
      });
    }
  };

  const filteredFetchers = useMemo(() => {
    return FETCHERS.filter((fetcher: (typeof FETCHERS)[number]) =>
      fetcher.label.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);
  return (
    <>
      <div className="flex gap-2 w-full">
        <Form.Item
          className="w-full"
          name={['fetcher', 'source_type']}
          label="Source Type"
          rules={[formValidation]}
        >
          <Select
            options={filteredFetchers}
            placeholder="Select source type"
            allowClear
            onChange={handleSourceTypeChange}
            showSearch={{ onSearch: (value) => setSearch(value) }}
          />
        </Form.Item>
        <Form.Item
          className="min-w-60"
          name={['fetcher', 'poll_interval_secs']}
          label="Poll Interval (secs)"
          rules={[formValidation]}
        >
          <InputNumber
            className="w-full"
            placeholder="Enter poll interval (secs)"
          />
        </Form.Item>
      </div>

      <div className="flex gap-2 w-full">
        <Form.Item
          className="w-full"
          name={['fetcher', 'base_url']}
          label="Base URL"
          rules={[formValidation]}
        >
          <Input placeholder="Enter base URL" />
        </Form.Item>
        {defaults?.base_urls && (
          <BaseUrlSelector
            value={baseUrl}
            options={defaults.base_urls}
            onChange={(value) => {
              form.setFieldsValue({
                fetcher: {
                  base_url: value,
                },
              });
            }}
          />
        )}
      </div>

      <AuthTypeProgressiveDisclosure
        formValidation={formValidation}
        form={form}
      />
    </>
  );
};
