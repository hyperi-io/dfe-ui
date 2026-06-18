import { Form, FormRule, Input, Select } from 'antd';
import { EnvKeyValueBuilder } from './EnvKeyValueBuilder';

export const TransformForm = ({
  formValidation,
}: {
  formValidation: FormRule;
}) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Form.Item
          name={['transform', 'engine']}
          label="Transform Engine"
          rules={[formValidation]}
        >
          <Select
            placeholder="Select engine"
            options={[
              {
                disabled: true,
                label: (
                  <span className="text-foreground-muted/40 dark:text-foreground-muted/40">
                    Elastic - Coming soon!
                  </span>
                ),
                value: 'elastic',
              },
              {
                disabled: true,
                label: (
                  <span className="text-foreground-muted/40 dark:text-foreground-muted/40">
                    Splack - Coming soon!
                  </span>
                ),
                value: 'splack',
              },
              { label: 'Vector', value: 'vector' },
              { label: 'VRL', value: 'vrl' },
              { label: 'Wasm', value: 'wasm' },
            ]}
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
