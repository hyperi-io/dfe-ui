import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { IconChevronDown, IconChevronUp } from '@repo/dfe-icons';
import { Button, FormProps, Input, Select } from 'antd';
import { useLayoutEffect, useRef, useState } from 'react';
import { isBlankSchemaListRow, rowSchema } from './AddSchemaTable';
import { TYPE_OPTIONS } from './AddSchemaTable/fieldOptions.constants';
import {
  CreateSchemaFormProvider,
  useCreateSchemaFormContext,
} from './contexts/CreateSchemaForm.context';
import { CreateSchemaFormData } from './CreateSchemaForm.schema';
import { SchemaUploadCollapse } from './SchemaUploadCollapse';

interface CreateSchemaFormProps extends FormProps<CreateSchemaFormData> {
  hasReset?: boolean;
  isPending?: boolean;
  buttonLabel?: string;
}

const CreateSchemaFormBase = ({
  hasReset = false,
  isPending = false,
  buttonLabel = 'Save',
  onFinish: onFinishProp,
}: CreateSchemaFormProps) => {
  const {
    form,
    formValidation,
    handleUpdateUploadedSchemaColumns,
    uploadedSchemaColumns,
    schemaColumns,
    invalidUploadedSchemaColumns,
    changedValuesTriggerInvalidTabErrors,
    recomputeValidationErrors,
    handleValidateColumnListsOnly,
  } = useCreateSchemaFormContext();
  const [showDescription, setShowDescription] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const prevSchemaColumnsLengthRef = useRef(0);

  useLayoutEffect(() => {
    const cols = form.getFieldValue('schemaColumns');
    prevSchemaColumnsLengthRef.current = Array.isArray(cols) ? cols.length : 0;
  }, [form]);

  const onFinish = (values: CreateSchemaFormData) => {
    const isUploadedColumnsValid = uploadedSchemaColumns
      .map((column) => {
        return rowSchema.safeParse(column);
      })
      .every((result) => result.success);

    if (!isUploadedColumnsValid || invalidUploadedSchemaColumns.length > 0) {
      setFormError(
        'There are validation errors in the uploaded columns. Please fix them and try again.',
      );
      return;
    }

    const isSchemaColumnsValid = schemaColumns
      .map((column) => {
        return rowSchema.safeParse(column);
      })
      .every((result) => result.success);

    if (!isSchemaColumnsValid) {
      setFormError(
        'There are validation errors in the schema columns. Please fix them and try again.',
      );
      return;
    }

    onFinishProp?.({
      ...values,
      uploadedColumns: uploadedSchemaColumns.map((column) =>
        rowSchema.parse(column),
      ),
      schemaColumns,
    });
  };

  const handleConditionalValidation = (
    changedValues: unknown,
    allValues: CreateSchemaFormData,
  ) => {
    const touchedLists = changedValuesTriggerInvalidTabErrors(changedValues);
    const cv = changedValues as Record<string, unknown>;
    const schemaCols = allValues.schemaColumns;
    const nextLen = Array.isArray(schemaCols) ? schemaCols.length : 0;
    const prevLen = prevSchemaColumnsLengthRef.current;

    const onlySchemaColumnsChanged =
      touchedLists &&
      cv !== null &&
      typeof cv === 'object' &&
      Object.keys(cv).length === 1 &&
      Object.hasOwn(cv, 'schemaColumns');

    const appendedSingleBlankRow =
      onlySchemaColumnsChanged &&
      Array.isArray(schemaCols) &&
      nextLen === prevLen + 1 &&
      isBlankSchemaListRow(schemaCols[nextLen - 1]);

    prevSchemaColumnsLengthRef.current = nextLen;

    /** List validators are async — avoid preemptive full validate when Add Column appends one blank row. */
    if (!touchedLists) {
      queueMicrotask(() => recomputeValidationErrors());
      return;
    }
    if (appendedSingleBlankRow) {
      queueMicrotask(() => recomputeValidationErrors());
      return;
    }
    queueMicrotask(() => handleValidateColumnListsOnly());
  };

  return (
    <Form
      className="h-[calc(100vh-120px)] css-custom-scrollbar"
      form={form}
      onFinish={onFinish}
      preserve
      onValuesChange={(changedValues, allValues) => {
        setFormError(null);
        handleUpdateUploadedSchemaColumns(changedValues as unknown);
        handleConditionalValidation(changedValues, allValues);
      }}
    >
      <div className="flex gap-2 w-full">
        <Form.Item
          className="w-full"
          name="path"
          rules={[formValidation]}
          label="Path"
          tooltip="Prepends the file name in the directory structure"
        >
          <Input placeholder="Enter path" />
        </Form.Item>

        <Form.Item
          className="w-full"
          name="name"
          label="Name"
          rules={[formValidation]}
        >
          <Input placeholder="Enter name" />
        </Form.Item>
      </div>
      <div className="flex gap-2 w-full">
        <Form.Item
          className="w-full"
          name="type"
          label="Type"
          rules={[formValidation]}
        >
          <Select options={TYPE_OPTIONS} placeholder="Select type" />
        </Form.Item>

        <Form.Item
          className="w-full"
          name="version"
          label="Version"
          rules={[formValidation]}
        >
          <Input placeholder="Enter version" />
        </Form.Item>
      </div>

      <div className="relative w-full">
        <button
          className="absolute top-0 right-0 z-2 cursor-pointer p-1"
          onClick={() => setShowDescription(!showDescription)}
        >
          {showDescription ? <IconChevronUp /> : <IconChevronDown />}
        </button>

        {!showDescription && (
          <button
            className="cursor-pointer border-b border-foreground/10 dark:border-dark-foreground/10 w-full text-left pb-2"
            onClick={(e) => {
              e.preventDefault();
              setShowDescription(true);
            }}
          >
            <label htmlFor="description">Description</label>
          </button>
        )}

        {showDescription && (
          <Form.Item
            name="description"
            label="Description"
            rules={[formValidation]}
          >
            <Input.TextArea placeholder="Enter description" />
          </Form.Item>
        )}
      </div>

      <SchemaUploadCollapse />

      {formError && <FormNotification type="error" text={formError} />}

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
  const [form] = Form.useForm<CreateSchemaFormData>();
  return (
    <CreateSchemaFormProvider form={form}>
      <CreateSchemaFormBase {...props} />
    </CreateSchemaFormProvider>
  );
};
