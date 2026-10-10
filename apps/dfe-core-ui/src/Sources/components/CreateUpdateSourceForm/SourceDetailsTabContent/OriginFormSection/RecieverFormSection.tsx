import { Form } from '@/core/components/Form';
import { NotificationCard } from '@/core/components/NotificationCard';
import {
  CreateUpdateSourceFormData,
  DisabledFields,
} from '@/Sources/components/CreateUpdateSourceForm';
import {
  MATCH_OPERATORS,
  RECEIVER_TABLE_LABELS,
} from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { IconInfoCircle } from '@repo/dfe-icons';
import { FormInstance, FormRule, Input, Radio, Select } from 'antd';

export const ReceiverFormSection = ({
  formValidation,
  form,
  disabledFields,
}: {
  formValidation: FormRule;
  form: FormInstance<CreateUpdateSourceFormData>;
  disabledFields?: DisabledFields;
}) => {
  const operationType = Form.useWatch(['match', 'operator'], form);
  const isMatchValueDisabled = operationType === 'exists';

  // The schema holds these rules in its receiver refinement, so it derives no mark.
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
          label="Field"
          rules={[formValidation]}
          required
        >
          <Input placeholder="Enter field" />
        </Form.Item>
        <Form.Item
          name={['match', 'operator']}
          label="Operator"
          className="min-w-36"
          rules={[formValidation]}
          required
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
          label="Value"
          rules={[formValidation]}
          required={!isMatchValueDisabled}
        >
          <Input disabled={isMatchValueDisabled} placeholder="Enter value" />
        </Form.Item>
      </div>
      <Form.Item
        name={['receiver_ui_config', 'table']}
        label="Table"
        rules={[formValidation]}
        help="You can either use the shared table or add your own table. You will need to deploy the source if own table is selected."
      >
        <Radio.Group
          disabled={disabledFields?.receiver_ui_config?.table}
          options={Object.entries(RECEIVER_TABLE_LABELS).map(
            ([value, label]) => ({ label, value }),
          )}
        />
      </Form.Item>
    </>
  );
};
