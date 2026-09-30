import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useCreateSchemaReviewContext } from '@/core/contexts/CreateSchemaReviewContext';
import { useListSchemasContext } from '@/core/contexts/ListSchemasContext';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { rowSchema } from '@/core/validationSchemas/CreateSchemaForm/AddSchemaTable.schema';
import { CreateSchemaFormData } from '@/core/validationSchemas/CreateSchemaForm/CreateSchemaForm.schema';
import { Button, FormProps, Input, Select } from 'antd';
import { isBlankSchemaListRow } from './AddSchemaTable';
import { TYPE_OPTIONS } from './AddSchemaTable/fieldOptions.constants';
import {
  CreateSchemaFormProvider,
  useCreateSchemaFormContext,
} from './contexts/CreateSchemaForm.context';
import { SchemaUploadCollapse } from './SchemaUploadCollapse';

interface CreateSchemaFormProps extends FormProps<CreateSchemaFormData> {
  hasReset?: boolean;
  isPending?: boolean;
  buttonLabel?: string;
  disabledFields?: {
    [key in keyof CreateSchemaFormData]?: boolean;
  };
  initialValues?: Partial<CreateSchemaFormData>;
  hideFields?: {
    version?: boolean;
    uploadSchemaInput?: boolean;
  };
  config?: {
    uploadedTab: {
      tabTitle: string;
      tableTitle: string;
    };
  };
}

const META_SCHEMA_TYPE_OPTIONS = [{ label: 'Meta Schema', value: 'meta' }];

const OTHER_SCHEMA_TYPE_OPTIONS = [
  { label: 'Header Schema', value: 'common_header' },
  { label: 'Hunt Schema', value: 'hunts' },
];

const CreateSchemaFormBase = ({
  hasReset = false,
  isPending = false,
  buttonLabel = 'Save',
  onFinish: onFinishProp,
  initialValues,
  disabledFields,
  hideFields,
  config,
}: CreateSchemaFormProps) => {
  const {
    form,
    formValidation,
    uploadedSchemaColumns,
    schemaColumns,
    invalidUploadedSchemaColumns,
    handleFormValuesChange,
    recomputeValidationErrors,
    handleValidate,
  } = useCreateSchemaFormContext();

  const { componentHeight } = useSetComponentHeight({
    offset: 120,
  });

  const { schemaTypesScope } = useListSchemasContext();

  const { formErrorMessage, setFormErrorMessage } =
    useCreateSchemaReviewContext();

  const onFinish = (values: CreateSchemaFormData) => {
    recomputeValidationErrors();

    const isUploadedColumnsValid = uploadedSchemaColumns
      .map((column) => {
        return rowSchema.safeParse(column);
      })
      .every((result) => result.success);

    if (!isUploadedColumnsValid || invalidUploadedSchemaColumns.length > 0) {
      setFormErrorMessage({
        message:
          'There are validation errors in the uploaded columns. Please fix them and try again.',
        errors: [],
      });

      return;
    }

    const nonBlankSchemaColumns = schemaColumns.filter(
      (row) => !isBlankSchemaListRow(row),
    );

    const isSchemaColumnsValid = nonBlankSchemaColumns
      .map((column) => {
        return rowSchema.safeParse(column);
      })
      .every((result) => result.success);

    if (!isSchemaColumnsValid) {
      setFormErrorMessage({
        message:
          'There are validation errors in the schema columns. Please fix them and try again.',
        errors: [],
      });
      return;
    }

    onFinishProp?.({
      ...values,
      uploadedColumns: uploadedSchemaColumns.map((column) =>
        rowSchema.parse(column),
      ),
      schemaColumns: nonBlankSchemaColumns.map((column) =>
        rowSchema.parse(column),
      ),
    });
  };

  const isMetaSchemaScope =
    schemaTypesScope?.length === 1 && schemaTypesScope[0] === 'meta';

  return (
    <CustomScrollbar height={componentHeight}>
      <Form
        form={form}
        onFinish={onFinish}
        onFinishFailed={() => {
          setFormErrorMessage({
            message:
              'There are validation errors in the form. Please fix them and try again.',
            errors: [],
          });
          handleValidate();
        }}
        preserve
        onValuesChange={(changedValues, allValues) => {
          setFormErrorMessage(null);
          handleFormValuesChange(changedValues, allValues);
        }}
        initialValues={{
          path: '',
          name: '',
          description: '',
          schema_type: isMetaSchemaScope ? 'meta' : 'common_header',
          version: '1.0.0',
          type: 'model',
          ...initialValues,
        }}
      >
        <div className="flex w-full gap-2">
          <Form.Item
            className="w-96"
            name="schema_type"
            label={<Form.Label required>Schema Type</Form.Label>}
            rules={[formValidation]}
          >
            <Select
              disabled={isMetaSchemaScope}
              options={
                isMetaSchemaScope
                  ? META_SCHEMA_TYPE_OPTIONS
                  : OTHER_SCHEMA_TYPE_OPTIONS
              }
            />
          </Form.Item>
          <Form.Item
            className="w-full"
            name="path"
            rules={[formValidation]}
            label="Path"
            tooltip="Prepends the file name in the directory structure"
          >
            <Input placeholder="Enter path" disabled={disabledFields?.path} />
          </Form.Item>

          <Form.Item
            className="w-full"
            name="name"
            label={<Form.Label required>Name</Form.Label>}
            rules={[formValidation]}
          >
            <Input placeholder="Enter name" disabled={disabledFields?.name} />
          </Form.Item>
        </div>
        <div className="flex w-full gap-2">
          <Form.Item
            className="w-full"
            name="type"
            label={<Form.Label required>Type</Form.Label>}
            rules={[formValidation]}
          >
            <Select
              options={TYPE_OPTIONS}
              placeholder="Select type"
              disabled={disabledFields?.type}
            />
          </Form.Item>

          {!hideFields?.version && (
            <Form.Item
              className="w-full"
              name="version"
              label="Version"
              rules={[formValidation]}
            >
              <Input disabled={disabledFields?.version} />
            </Form.Item>
          )}
        </div>

        <Form.Item
          name="description"
          label={<Form.Label required>Description</Form.Label>}
          rules={[formValidation]}
        >
          <Input.TextArea
            placeholder="Enter description"
            disabled={disabledFields?.description}
          />
        </Form.Item>

        <SchemaUploadCollapse
          hideFields={hideFields}
          disabledFields={disabledFields}
          config={config}
        />

        {formErrorMessage && (
          <FormNotification
            type="error"
            title={formErrorMessage.message}
            text={formErrorMessage.errors
              ?.map((error) => error?.message)
              ?.join(', ')}
          />
        )}

        <Form.Item className="flex justify-end">
          {hasReset && (
            <Button
              className="mr-2"
              type="default"
              htmlType="reset"
              disabled={isPending}
            >
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
    </CustomScrollbar>
  );
};

export const CreateSchemaForm = ({
  initialValues,
  ...props
}: CreateSchemaFormProps) => {
  return (
    <CreateSchemaFormProvider initialValues={initialValues}>
      <CreateSchemaFormBase {...props} initialValues={initialValues} />
    </CreateSchemaFormProvider>
  );
};
