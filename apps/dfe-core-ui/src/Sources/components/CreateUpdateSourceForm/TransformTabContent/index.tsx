import { Form } from '@/core/components/Form';
import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { FormRule, Input, Radio, Select, type FormInstance } from 'antd';
import { useState } from 'react';
import { EnvKeyValueBuilder } from './EnvKeyValueBuilder';
import {
  AssignTransformOptions,
  getInitialAssignTransform,
} from './TransformTabContent.helpers';

export const TransformTabContent = ({
  formValidation,
  form,
}: {
  formValidation: FormRule;
  form: FormInstance<CreateUpdateSourceFormData>;
}) => {
  const initialTransform = form.getFieldValue('transform');
  const [assignTransform, setAssignTransform] =
    useState<AssignTransformOptions>(() =>
      getInitialAssignTransform(initialTransform),
    );
  return (
    <div className="flex flex-col gap-2">
      <Radio.Group
        value={assignTransform}
        onChange={(e) => {
          setAssignTransform(e.target.value as AssignTransformOptions);
        }}
      >
        <Radio value="none">No Transform</Radio>
        <Radio value="define_transform">Define Transform</Radio>
      </Radio.Group>

      {assignTransform === 'define_transform' && (
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
      )}
    </div>
  );
};
