import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { TabLabel } from '@/core/components/TabLabel';
import { ListFieldMapsProvider } from '@/core/contexts/ListFieldMapsContext';
import { useFetchDeployment } from '@/core/hooks/useFetchDeployment';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { getRuleErrors } from '@/Sources/utils/ingestErrors';
import { isMatchGroup } from '@/Sources/utils/sourceMatch';
import { Button, FormProps, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import {
  getFirstTabWithErrors,
  getTabErrors,
  getTabsWithErrors,
  getValidationErrors,
  TAB_LABEL_MAP,
  type FormValidationErrors,
  type SourceFormTab,
} from './helpers';
import { SchemaConfigTabContent } from './SchemaConfigTabContent';
import { SourceDetailsTabContent } from './SourceDetailsTabContent';
import {
  EMPTY_FETCHER,
  EMPTY_MATCH,
  EMPTY_RECEIVER_UI_CONFIG,
} from './SourceDetailsTabContent/OriginFormSection/helpers';
import {
  formSchema,
  type CreateUpdateSourceFormData,
} from './sourceForm.schema';
import { SourceWriteErrorProvider } from './sourceWriteError.context';
import { TransformTabContent } from './TransformTabContent';
import { getInitialAssignTransform } from './TransformTabContent/TransformTabContent.helpers';
import { ViewsTabContent } from './ViewsTabContent';

export { formSchema, type CreateUpdateSourceFormData };

/** A rule refusal whose every reason the match section already shows, so the foot of the form points there instead. */
const isShownAtTheMatch = (error: unknown) => {
  const ruleErrors = getRuleErrors(error);
  return (
    ruleErrors.length > 0 &&
    ruleErrors.every(
      (ruleError) =>
        ruleError.field === 'when' || ruleError.field.startsWith('match'),
    )
  );
};

export interface DisabledFields {
  source?: boolean;
  origin?: boolean;
  fetcher?: {
    topic?: boolean;
  };
  receiver_ui_config?: {
    table?: boolean;
  };
  // Add other disabled fields here as necessary
}

type CreateUpdateSourceFormProps = FormProps<CreateUpdateSourceFormData> & {
  onFinish: (values: CreateUpdateSourceFormData) => void;
  initialValues?: CreateUpdateSourceFormData;
  isPending: boolean;
  error: Error | null;
  resetFormFields?: boolean;
  buttonLabel?: string;
  disabledFields?: DisabledFields;
  hasReset?: boolean;
};

export const CreateUpdateSourceFormBase = ({
  disabledFields,
  initialValues,
  onFinish,
  isPending = false,
  error,
  resetFormFields,
  buttonLabel = 'Save',
  hasReset = false,
  onFinishFailed,
  onFieldsChange,
  ...props
}: CreateUpdateSourceFormProps) => {
  const [validationErrors, setValidationErrors] =
    useState<FormValidationErrors>({
      sourceDetails: [],
      origin: [],
      schemaConfig: [],
      transform: [],
      views: [],
    });
  const [activeTab, setActiveTab] = useState<string>('sourceDetails');
  const [form] = Form.useForm<CreateUpdateSourceFormData>();
  const formValidation =
    useAntdZodResolver<CreateUpdateSourceFormData>(formSchema);

  const { data: { transports: { available = [] } = {} } = {} } =
    useFetchDeployment();

  useEffect(() => {
    if (resetFormFields) {
      form.resetFields();
    }
  }, [resetFormFields, form]);

  const handleFieldsChange: NonNullable<
    FormProps<CreateUpdateSourceFormData>['onFieldsChange']
  > = (changedFields, allFields) => {
    const validationErrors = getValidationErrors({ formFields: allFields });
    setValidationErrors(validationErrors);
    onFieldsChange?.(changedFields, allFields);
  };

  const handleFinishFailed: NonNullable<
    FormProps<CreateUpdateSourceFormData>['onFinishFailed']
  > = (errorInfo) => {
    const validationErrors = getValidationErrors({
      formFields: errorInfo.errorFields ?? [],
    });
    setValidationErrors(validationErrors);
    // A refused field may sit on a tab nobody has opened, so go to it.
    const failedTab = getFirstTabWithErrors(validationErrors);
    if (failedTab) {
      setActiveTab(failedTab);
    }
    onFinishFailed?.(errorInfo);
  };

  const handleFinish = (values: CreateUpdateSourceFormData) => {
    // An unrendered Views tab sends no views, and an older engine drops any it is not sent.
    onFinish?.({ ...values, views: values.views ?? initialValues?.views });
  };

  const metaSchema = Form.useWatch(['schema'], form);
  const isMetaSchemaFormValueDefined = !!metaSchema?.meta_schema;
  const hasStoredViews = (initialValues?.views?.length ?? 0) > 0;

  const watchFetcherTopic = Form.useWatch(['fetcher', 'topic'], form);
  const watchReceiverTable = Form.useWatch(
    ['receiver_ui_config', 'table'],
    form,
  );
  const isFetcherTopicOwn = watchFetcherTopic === 'own';
  const isReceiverTableOwn = watchReceiverTable === 'own';

  const tabItems = [
    {
      key: 'sourceDetails',
      label: (
        <TabLabel
          label={TAB_LABEL_MAP['sourceDetails']}
          validationErrors={getTabErrors(validationErrors, 'sourceDetails')}
        />
      ),
      forceRender: true,
      children: (
        <SourceDetailsTabContent
          formValidation={formValidation}
          disabledFields={disabledFields}
          form={form}
        />
      ),
    },
    ...(isReceiverTableOwn || isFetcherTopicOwn
      ? [
          {
            key: 'schemaConfig',
            label: (
              <TabLabel
                label={TAB_LABEL_MAP['schemaConfig']}
                validationErrors={getTabErrors(
                  validationErrors,
                  'schemaConfig',
                )}
              />
            ),
            forceRender: true,
            children: (
              <SchemaConfigTabContent
                formValidation={formValidation}
                form={form}
              />
            ),
          },
        ]
      : []),

    ...(isMetaSchemaFormValueDefined
      ? /* Progressive disclosure - the next tab Items are hidden until meta schema is defined */
        [
          {
            key: 'transform',
            label: (
              <TabLabel
                label={TAB_LABEL_MAP['transform']}
                validationErrors={getTabErrors(validationErrors, 'transform')}
              />
            ),
            forceRender: true,
            children: (
              <TransformTabContent
                formValidation={formValidation}
                form={form}
              />
            ),
          },
        ]
      : []),
    // A source on the shared table has no meta schema but can still carry views.
    ...(isMetaSchemaFormValueDefined || hasStoredViews
      ? [
          {
            key: 'views',
            label: (
              <TabLabel
                label={TAB_LABEL_MAP['views']}
                validationErrors={getTabErrors(validationErrors, 'views')}
              />
            ),
            forceRender: true,
            children: (
              <ViewsTabContent formValidation={formValidation} form={form} />
            ),
          },
        ]
      : []),
  ];

  // Named off the rendered tabs, so the banner can never send the user to a tab
  // this dialog does not have.
  const tabsWithErrors = getTabsWithErrors(
    validationErrors,
    tabItems.map((item) => item.key as SourceFormTab),
  );

  return (
    <Form
      form={form}
      onFinish={handleFinish}
      initialValues={{
        enabled: true,
        origin: 'receiver',
        // The engine's write body requires archive, so a fresh create carries
        // it rather than leaving the field undefined and unsubmittable.
        archive: false,
        transform: {
          engine: initialValues?.transform?.engine || '',
        },
        ...initialValues,
        // Both blocks are seeded so switching origin lands on a usable form.
        match: isMatchGroup(initialValues?.match)
          ? initialValues?.match
          : { ...EMPTY_MATCH, ...initialValues?.match },
        fetcher: { ...EMPTY_FETCHER, ...initialValues?.fetcher },
        receiver_ui_config: {
          ...EMPTY_RECEIVER_UI_CONFIG,
          match_mode: initialValues?.when ? 'expression' : 'conditions',
          compat_mode: initialValues?.compat_profiles ? 'own' : 'inherit',
          ...initialValues?.receiver_ui_config,
        },
        transform_ui_config: {
          assign: getInitialAssignTransform(initialValues?.transform),
          ...initialValues?.transform_ui_config,
        },
        transport: initialValues?.transport ?? available[0],
      }}
      layout="vertical"
      onFinishFailed={handleFinishFailed}
      onFieldsChange={handleFieldsChange}
      {...props}
    >
      <SourceWriteErrorProvider error={error}>
        <Tabs
          destroyOnHidden={false}
          items={tabItems}
          // A tab that has left the dialog (Own table switched to Shared) falls back to the first.
          activeKey={
            tabItems.some((item) => item.key === activeTab)
              ? activeTab
              : tabItems[0]?.key
          }
          onChange={setActiveTab}
        />
      </SourceWriteErrorProvider>

      {error &&
        (isShownAtTheMatch(error) ? (
          <Form.Item>
            <FormNotification
              type="error"
              text="The receiver would refuse this match. The reason is marked on it above."
            />
          </Form.Item>
        ) : (
          <Form.Item>
            <ApiErrorNotification error={error} />
          </Form.Item>
        ))}

      {tabsWithErrors.length > 0 && (
        <Form.Item>
          <FormNotification
            type="warning"
            text={
              <>
                There are validation errors in the following tabs:{' '}
                {tabsWithErrors.join(', ')}.<br />
                Please address the errors and try again.
              </>
            }
          />
        </Form.Item>
      )}

      <Form.Item className="flex justify-end">
        {hasReset && (
          <Button className="mr-2" type="default" htmlType="reset">
            Reset Form
          </Button>
        )}
        <Button
          loading={isPending}
          disabled={isPending}
          type="primary"
          htmlType="submit"
        >
          {buttonLabel}
        </Button>
      </Form.Item>
    </Form>
  );
};

export const CreateUpdateSourceForm = (props: CreateUpdateSourceFormProps) => {
  return (
    <ListFieldMapsProvider>
      <CreateUpdateSourceFormBase {...props} />
    </ListFieldMapsProvider>
  );
};
