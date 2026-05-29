import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useCreateSchemaReviewContext } from '@/core/contexts/CreateSchemaReviewContext';
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
  };
}

const CreateSchemaFormBase = ({
  hasReset = false,
  isPending = false,
  buttonLabel = 'Save',
  onFinish: onFinishProp,
  initialValues,
  disabledFields,
  hideFields,
}: CreateSchemaFormProps) => {
  const {
    form,
    formValidation,
    uploadedSchemaColumns,
    schemaColumns,
    invalidUploadedSchemaColumns,
    handleFormValuesChange,
  } = useCreateSchemaFormContext();

  const { formErrorMessage, setFormErrorMessage } =
    useCreateSchemaReviewContext();

  const onFinish = (values: CreateSchemaFormData) => {
    const isUploadedColumnsValid = uploadedSchemaColumns
      .map((column) => {
        return rowSchema.safeParse(column);
      })
      .every((result) => result.success);

    if (!isUploadedColumnsValid || invalidUploadedSchemaColumns.length > 0) {
      setFormErrorMessage(
        'There are validation errors in the uploaded columns. Please fix them and try again.',
      );
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
      setFormErrorMessage(
        'There are validation errors in the schema columns. Please fix them and try again.',
      );
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

  return (
    <Form
      className="h-[calc(100vh-120px)] css-custom-scrollbar"
      form={form}
      onFinish={onFinish}
      onFinishFailed={() => {
        setFormErrorMessage(
          'There are validation errors in the form. Please fix them and try again.',
        );
      }}
      preserve
      onValuesChange={(changedValues, allValues) => {
        setFormErrorMessage(null);
        handleFormValuesChange(changedValues, allValues);
      }}
      initialValues={initialValues}
    >
      <div className="flex gap-2 w-full">
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
          label="Name"
          rules={[formValidation]}
        >
          <Input placeholder="Enter name" disabled={disabledFields?.name} />
        </Form.Item>
      </div>
      <div className="flex gap-2 w-full">
        <Form.Item
          className="w-full"
          name="type"
          label="Type"
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
        label="Description"
        rules={[formValidation]}
      >
        <Input.TextArea
          placeholder="Enter description"
          disabled={disabledFields?.description}
        />
      </Form.Item>

      <SchemaUploadCollapse disabledFields={disabledFields} />

      {formErrorMessage && (
        <FormNotification type="error" text={formErrorMessage} />
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
  );
};

export const CreateSchemaForm = (props: CreateSchemaFormProps) => {
  return (
    <CreateSchemaFormProvider>
      <CreateSchemaFormBase {...props} />
    </CreateSchemaFormProvider>
  );
};
