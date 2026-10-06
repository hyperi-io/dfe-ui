import { Form } from '@/core/components/Form';
import { NotificationCard } from '@/core/components/NotificationCard';
import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm';
import {
  MATCH_OPERATORS,
  RECEIVER_TABLE_LABELS,
} from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { IconInfoCircle } from '@repo/dfe-icons';
import { FormInstance, FormRule, Input, Radio, Select } from 'antd';

export const ReceiverFormSection = ({
  formValidation,
  form,
}: {
  formValidation: FormRule;
  form: FormInstance<CreateUpdateSourceFormData>;
}) => {
  const operationType = Form.useWatch(['match', 'operator'], form);
  const isMatchValueDisabled = operationType === 'exists';

  return (
    <>
      <NotificationCard
        icon={<IconInfoCircle />}
        description="Incoming data that matches the following criteria will be processed by this source"
      />
      <div className="flex gap-x-2">
        <Form.Item
          className="w-full"
          name={['match', 'field']}
          label={<Form.Label required>Field</Form.Label>}
          rules={[formValidation]}
        >
          <Input placeholder="Enter field" />
        </Form.Item>
        <Form.Item
          name={['match', 'operator']}
          label="Operator"
          className="min-w-36"
          rules={[formValidation]}
        >
          <Select
            placeholder="Select operator"
            onChange={(value) => {
              if (value === 'exists') {
                form.setFields([
                  {
                    name: ['match', 'value'],
                    errors: [],
                    value: '',
                  },
                ]);
              }
            }}
            options={MATCH_OPERATORS.map((operator) => ({
              label: operator,
              value: operator,
            }))}
          />
        </Form.Item>

        <Form.Item
          className="w-full"
          name={['match', 'value']}
          label={
            <Form.Label required={operationType !== 'exists'}>Value</Form.Label>
          }
          rules={[formValidation]}
        >
          <Input disabled={isMatchValueDisabled} placeholder="Enter value" />
        </Form.Item>
      </div>
      <Form.Item
        name={['receiver_ui_config', 'table']}
        label="Table"
        rules={[formValidation]}
        help="You can either share main table or add your own table. You will need to deploy the source if own table is selected."
      >
        <Radio.Group
          options={Object.entries(RECEIVER_TABLE_LABELS).map(
            ([value, label]) => ({ label, value }),
          )}
        />
      </Form.Item>
    </>
  );
};
