import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { NotificationCard } from '@/core/components/NotificationCard';
import {
  CreateUpdateSourceFormData,
  DisabledFields,
} from '@/Sources/components/CreateUpdateSourceForm';
import { RECEIVER_TABLE_LABELS } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { useSourceWriteErrors } from '@/Sources/components/CreateUpdateSourceForm/sourceWriteError.context';
import { IconInfoCircle } from '@repo/dfe-icons';
import { FormInstance, FormRule, Radio } from 'antd';
import { MatchConditions } from './MatchConditions';
import { SourceCompatibility } from './SourceCompatibility';
import { WhenExpression } from './WhenExpression';

/** A label's `for` cannot name a radio group, so the group carries the same text itself. */
const TABLE_LABEL = 'Table';
const MATCH_MODE_LABEL = 'Match by';

export const ReceiverFormSection = ({
  formValidation,
  form,
  disabledFields,
}: {
  formValidation: FormRule;
  form: FormInstance<CreateUpdateSourceFormData>;
  disabledFields?: DisabledFields;
}) => {
  const matchMode = Form.useWatch(['receiver_ui_config', 'match_mode'], form);
  const isExpression = matchMode === 'expression';
  const { ruleErrors, aliasConflict } = useSourceWriteErrors();
  const matchRefusals = ruleErrors.filter((error) =>
    error.field.startsWith('match'),
  );

  // The schema holds these rules in its receiver refinement, so it derives no mark.
  return (
    <>
      <NotificationCard
        icon={<IconInfoCircle />}
        description="Incoming data that matches the following criteria will be processed by this source"
      />
      <Form.Item
        name={['receiver_ui_config', 'match_mode']}
        label={MATCH_MODE_LABEL}
        rules={[formValidation]}
      >
        <Radio.Group
          aria-label={MATCH_MODE_LABEL}
          optionType="button"
          options={[
            { label: 'Conditions', value: 'conditions' },
            { label: 'CEL Fast expression', value: 'expression' },
          ]}
        />
      </Form.Item>
      {isExpression ? (
        <WhenExpression
          form={form}
          formValidation={formValidation}
          ruleErrors={ruleErrors}
        />
      ) : (
        <>
          {matchRefusals.length > 0 && (
            <FormNotification
              type="error"
              title="The receiver would refuse these conditions"
              text={matchRefusals.map((error) => error.message).join(' ')}
            />
          )}
          <MatchConditions form={form} formValidation={formValidation} />
        </>
      )}
      <Form.Item
        name={['receiver_ui_config', 'table']}
        label={TABLE_LABEL}
        rules={[formValidation]}
        help="You can either use the shared table or add your own table. You will need to deploy the source if own table is selected."
      >
        <Radio.Group
          aria-label={TABLE_LABEL}
          disabled={disabledFields?.receiver_ui_config?.table}
          options={Object.entries(RECEIVER_TABLE_LABELS).map(
            ([value, label]) => ({ label, value }),
          )}
        />
      </Form.Item>
      <SourceCompatibility
        form={form}
        formValidation={formValidation}
        aliasConflict={aliasConflict}
      />
    </>
  );
};
