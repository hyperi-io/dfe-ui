import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { TabLabel } from '@/core/components/TabLabel';
import { ListFieldMapsProvider } from '@/core/contexts/ListFieldMapsContext';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { Button, FormProps, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { getValidationErrors, type FormValidationErrors } from './helpers';
import { MappingStandardsTabContent } from './MappingStandardsTabContent';
import { SchemaConfigTabContent } from './SchemaConfigTabContent';
import { SourceDetailsTabContent } from './SourceDetailsTabContent';
import {
  formSchema,
  type CreateUpdateSourceFormData,
} from './sourceForm.schema';
import { SourceTypeTabContent } from './SourceTypeTabContent';
import { TransformTabContent } from './TransformTabContent';

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

const TAB_LABEL_MAP = {
  sourceDetails: 'Details',
  mappingStandards: 'Mapping',
  sourceType: 'Origin',
  schemaConfig: 'Meta Schema',
  transform: 'Transform',
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
      mappingStandards: [],
      sourceType: [],
      schemaConfig: [],
      transform: [],
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
  const isMetaSchemaDefined =
    !!metaSchema?.meta_schema || !!metaSchema?.derived_schema;

  return (
    <Form
      form={form}
      onFinish={handleFinish}
      initialValues={{
        enabled: true,
        ...initialValues,
      }}
      layout="vertical"
      onFinishFailed={handleFinishFailed}
      onFieldsChange={handleFieldsChange}
      {...props}
    >
      <Tabs
        destroyOnHidden={false}
        items={[
          {
            key: 'sourceDetails',
            label: (
              <TabLabel
                label="Details"
                validationErrors={validationErrors?.sourceDetails}
              />
            ),
            forceRender: true,
            children: (
              <SourceDetailsTabContent
                formValidation={formValidation}
                disabledFields={disabledFields}
              />
            ),
          },
          {
            key: 'sourceType',
            label: (
              <TabLabel
                label="Origin"
                validationErrors={validationErrors?.sourceType}
              />
            ),
            forceRender: true,
            children: (
              <SourceTypeTabContent
                formValidation={formValidation}
                form={form}
              />
            ),
          },
          {
            key: 'schemaConfig',
            label: (
              <TabLabel
                label="Meta Schema"
                validationErrors={validationErrors?.schemaConfig}
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

          ...(isMetaSchemaDefined
            ? /* Progressive disclosure - the next tab Items are hidden until meta/derived schema is defined */
              [
                {
                  key: 'transform',
                  label: (
                    <TabLabel
                      label="Transform"
                      validationErrors={validationErrors?.transform}
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
                  key: 'mappingStandards',
                  label: (
                    <TabLabel
                      label="Mapping"
                      validationErrors={validationErrors?.mappingStandards}
                    />
                  ),
                  forceRender: true,
                  children: (
                    <MappingStandardsTabContent
                      formValidation={formValidation}
                      initialValues={initialValues}
                      form={form}
                    />
                  ),
                },
              ]
            : []),
        ]}
      />

      {error && (
        <Form.Item>
          <FormNotification
            type="error"
            text={error.message ?? 'An unexpected error occurred'}
          />
        </Form.Item>
      )}

      {Object.values(validationErrors).some((errors) => errors.length > 0) && (
        <Form.Item>
          <FormNotification
            type="warning"
            text={
              <>
                There are validation errors in the following tabs:
                {Object.keys(validationErrors)
                  .map(
                    (key) => TAB_LABEL_MAP[key as keyof typeof TAB_LABEL_MAP],
                  )
                  .join(', ')}
                .<br />
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
