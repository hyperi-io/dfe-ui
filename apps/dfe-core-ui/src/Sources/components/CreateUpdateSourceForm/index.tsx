import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { TabLabel } from '@/core/components/TabLabel';
import { ListFieldMapsProvider } from '@/core/contexts/ListFieldMapsContext';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { Button, FormProps, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import {
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
} from './SourceDetailsTabContent/OriginFormSection/helpers';
import {
  formSchema,
  type CreateUpdateSourceFormData,
} from './sourceForm.schema';
import { TransformTabContent } from './TransformTabContent';
import { ViewsTabContent } from './ViewsTabContent';

export { formSchema, type CreateUpdateSourceFormData };

export interface DisabledFields {
  source?: boolean;
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
  const [form] = Form.useForm<CreateUpdateSourceFormData>();
  const formValidation =
    useAntdZodResolver<CreateUpdateSourceFormData>(formSchema);

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
    onFinishFailed?.(errorInfo);
  };

  const handleFinish = (values: CreateUpdateSourceFormData) => {
    // Handle data transformation for header type if needed
    onFinish?.(values);
  };

  const metaSchema = Form.useWatch(['schema'], form);
  const isMetaSchemaFormValueDefined = !!metaSchema?.meta_schema;

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
    {
      key: 'schemaConfig',
      label: (
        <TabLabel
          label={TAB_LABEL_MAP['schemaConfig']}
          validationErrors={getTabErrors(validationErrors, 'schemaConfig')}
        />
      ),
      forceRender: true,
      children: (
        <SchemaConfigTabContent formValidation={formValidation} form={form} />
      ),
    },

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
        match: { ...EMPTY_MATCH, ...initialValues?.match },
        fetcher: { ...EMPTY_FETCHER, ...initialValues?.fetcher },
      }}
      layout="vertical"
      onFinishFailed={handleFinishFailed}
      onFieldsChange={handleFieldsChange}
      {...props}
    >
      <Tabs destroyOnHidden={false} items={tabItems} />

      {error && (
        <Form.Item>
          <ApiErrorNotification error={error} />
        </Form.Item>
      )}

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
