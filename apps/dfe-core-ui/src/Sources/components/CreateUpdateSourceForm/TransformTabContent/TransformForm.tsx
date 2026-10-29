import { Form } from '@/core/components/Form';
import { useFetchApps } from '@/core/hooks/apps/instances/useFetchApps';
import { FormRule, Input, Select } from 'antd';
import { EnvKeyValueBuilder } from './EnvKeyValueBuilder';
import { getTransformEngines } from './TransformTabContent.helpers';
import {
  TransformVariantFormItem,
  useEngineOffersVariants,
} from './TransformVariantSelect';

export const TransformForm = ({
  formValidation,
}: {
  formValidation: FormRule;
}) => {
  const { data: apps, isLoading } = useFetchApps();
  const engines = getTransformEngines(apps);
  const hasEngines = engines.length > 0;
  const engine = Form.useWatch<string | undefined>(['transform', 'engine']);
  const { offersVariants, isUnknown } = useEngineOffersVariants(engine);

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Form.Item
          name={['transform', 'engine']}
          label="Transform Engine"
          rules={[formValidation]}
          extra={
            hasEngines
              ? undefined
              : 'No transform app is deployed, so there are no engines to pick from'
          }
        >
          <Select
            loading={isLoading}
            disabled={!hasEngines}
            placeholder="Select engine"
            options={engines.map(({ engine, service }) => ({
              label: service,
              value: engine,
            }))}
            allowClear
          />
        </Form.Item>
        <Form.Item
          name={['transform', 'config_file']}
          label="Config File"
          rules={[formValidation]}
        >
          <Input placeholder="Enter config file" allowClear />
        </Form.Item>
      </div>
      {engine && isUnknown && (
        <Form.Item name={['transform', 'variant']} hidden>
          <input type="hidden" />
        </Form.Item>
      )}
      {engine && !isUnknown && offersVariants && (
        <TransformVariantFormItem
          name={['transform', 'variant']}
          engine={engine}
          rules={[formValidation]}
        />
      )}
      <Form.Item
        name={['transform', 'files']}
        label="Files"
        rules={[formValidation]}
      >
        <Select
          placeholder="Select files"
          mode="multiple"
          options={[]}
          allowClear
        />
      </Form.Item>
      <EnvKeyValueBuilder formValidation={formValidation} />
    </>
  );
};
