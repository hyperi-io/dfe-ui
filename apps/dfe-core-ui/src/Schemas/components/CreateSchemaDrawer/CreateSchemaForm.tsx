import { Form } from '@/core/components/Form';
import { cn } from '@/core/utils/style';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useElasticConvert } from '@/Schemas/hooks/useElasticConvert';
import { ElasticConverterResponse } from '@/Schemas/hooks/useElasticConvert/useElasticConvert';
import { convertCsv, CsvRow } from '@/Schemas/server/actions/convertCsv';
import { isJsonFile } from '@/Schemas/server/actions/convertCsv/csvConvert.helpers';
import { IconChevronDown, IconChevronUp } from '@repo/dfe-icons';
import { Button, FormProps, Input, Radio, Select, Tabs } from 'antd';
import { RcFile, UploadChangeParam, UploadFile } from 'antd/es/upload';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import z from 'zod';
import { AddSchemaTable, rowSchema } from './AddSchemaTable';
import { TYPE_OPTIONS } from './fieldOptions.constants';
import { FileUploadDragger } from './FileUploadDragger';

const NAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const GROUP_REGEX = /^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/;
const VERSION_REGEX = /^[0-9]+\.[0-9]+\.[0-9]+$/;

/** Used for building the request body */
const formSchemaRequest = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .refine((v) => NAME_REGEX.test(v), {
      message:
        'Name must contain only letters, numbers, underscores, and hyphens',
    }),
  path: z
    .string()
    .refine((v) => v && v.length > 0 && GROUP_REGEX.test(v), {
      message:
        'Groups must contain only letters, numbers, underscores, hyphens, and forward slashes',
    })
    .optional(),
  version: z
    .string()
    .min(1, { message: 'Version is required' })
    .refine((v) => VERSION_REGEX.test(v), {
      message: 'Version must be in the format x.x.x',
    }),
  type: z.enum(['model', 'addition', 'revision']),
  description: z.string().optional(),
  uploadedColumns: z.array(rowSchema).optional(),
  schemaColumns: z.array(rowSchema).optional(),
});

/** Used for state management and form controls */
const formSchemaControls = {
  uploadType: z.enum(['csv', 'json']),
  file: z.instanceof(Object).optional(),
};

const formSchema = formSchemaRequest.extend(formSchemaControls);

export type CreateSchemaFormData = z.infer<typeof formSchema>;

interface CreateSchemaFormProps extends FormProps<CreateSchemaFormData> {
  hasReset?: boolean;
  isPending?: boolean;
  buttonLabel?: string;
}

/** Row in the upload tab after CSV / Elastic import; includes stable client keys. */
type UploadedSchemaRow = {
  id: string;
  imported?: true;
  name?: string;
  type?: string;
  attribute?: string[];
  use_case?: string;
  expr?: string;
  comment?: string | null;
};
type UploadedSchema = UploadedSchemaRow[];
type PreloadedSchema = CsvRow[] | ElasticConverterResponse;

const getRcFileFromUploadInfo = (
  info: UploadChangeParam<UploadFile<RcFile>>,
): RcFile | undefined =>
  info.file?.originFileObj ?? info.fileList.at(-1)?.originFileObj;

export const CreateSchemaForm = ({
  hasReset = false,
  isPending = false,
  buttonLabel = 'Save',
  onFinish: onFinishProp,
}: CreateSchemaFormProps) => {
  const [form] = Form.useForm<CreateSchemaFormData>();
  const formValidation = useAntdZodResolver<CreateSchemaFormData>(formSchema);
  const [showDescription, setShowDescription] = useState(true);
  const [showFileUpload, setShowFileUpload] = useState(true);
  const [uploadedSchema, setUploadedSchema] = useState<UploadedSchema>([]);
  /** Remount CSV table after each successful convert so rows (and IDs) rebuild without a syncing effect */
  const [uploadedImportKey, setUploadedImportKey] = useState(0);

  const updateUploadedSchema = (values: PreloadedSchema) => {
    const taggedValues: UploadedSchema = values.map((value) => ({
      ...value,
      id: uuidv4(),
      imported: true as const,
    }));
    setUploadedSchema(taggedValues);
    setUploadedImportKey((k) => k + 1);
  };

  const { mutate: convertElasticSchema } = useElasticConvert({
    onSuccess: (data) => {
      updateUploadedSchema(data);
    },
    onError: (error) => {
      form.setFields([{ name: 'file', errors: [(error as Error).message] }]);
      updateUploadedSchema([]);
    },
  });

  const hasUploadedSchema = uploadedSchema.length > 0;

  const watchUploadType = Form.useWatch('uploadType', form);
  const handleFileChange = (info: UploadChangeParam<UploadFile<RcFile>>) => {
    /** Reset field error onChange */
    form.setFields([{ name: 'file', errors: [] }]);

    /** Get file from upload info */
    const file = getRcFileFromUploadInfo(info);
    if (!file) {
      updateUploadedSchema([]);
      return;
    }

    /** Convert CSV */
    if (watchUploadType === 'csv') {
      void (async () => {
        try {
          const jsonSchema = await convertCsv(file);
          updateUploadedSchema(jsonSchema);
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : 'Could not convert CSV';
          form.setFields([{ name: 'file', errors: [message] }]);
          updateUploadedSchema([]);
        }
      })();
    }

    /** Convert Elastic Index Template */
    if (watchUploadType === 'json') {
      if (!isJsonFile(file)) {
        form.setFields([
          {
            name: 'file',
            errors: [
              'Upload must be a JSON file (text/json or a .json filename).',
            ],
          },
        ]);
        updateUploadedSchema([]);
        return;
      }

      convertElasticSchema({ file }); // Data upload happens in the mutation onSuccess
    }
  };

  const onFinish = (values: CreateSchemaFormData) => {
    onFinishProp?.(values);
  };

  return (
    <Form
      className="h-[calc(100vh-120px)] css-custom-scrollbar"
      form={form}
      onFinish={onFinish}
      preserve
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
      <div className="relative w-full">
        <button
          className="absolute top-0 right-0 z-2 cursor-pointer p-1"
          onClick={() => setShowFileUpload(!showFileUpload)}
        >
          {showFileUpload ? <IconChevronUp /> : <IconChevronDown />}
        </button>

        <button
          className={cn(
            'cursor-pointer border-b border-foreground/10 dark:border-dark-foreground/10 w-full text-left pb-2',
            showFileUpload && 'border-b-0 pb-0',
          )}
          onClick={(e) => {
            e.preventDefault();
            setShowFileUpload(true);
          }}
        >
          <p>Upload from file</p>
        </button>

        {showFileUpload && (
          <div className="flex flex-col gap-y-2">
            <Form.Item name="uploadType" initialValue="csv">
              <Radio.Group className="flex flex-row w-full mt-3">
                <Radio.Button value="csv" className="w-1/2 text-center">
                  DFE CSV
                </Radio.Button>
                <Radio.Button value="json" className="w-1/2 text-center">
                  ELASTIC INDEX TEMPLATE
                </Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="file"
              rules={[formValidation]}
              validateTrigger="onSubmit"
              label={watchUploadType === 'csv' ? 'CSV File' : 'JSON File'}
            >
              <FileUploadDragger
                maxCount={1}
                multiple={false}
                accept={watchUploadType === 'csv' ? '.csv' : '.json'}
                onChange={handleFileChange}
              />
            </Form.Item>
          </div>
        )}
      </div>

      {hasUploadedSchema && (
        <Tabs
          destroyOnHidden={false}
          items={[
            {
              key: 'uploadedColumns',
              label: 'Uploaded Columns',
              forceRender: true,
              children: (
                <AddSchemaTable
                  name="uploadedColumns"
                  key={uploadedImportKey}
                  initialValues={uploadedSchema}
                  formValidation={formValidation}
                  config={{
                    defaultEditFields: false,
                    defaultAddColumns: false,
                    defaultRemoveColumns: true,
                  }}
                  pagination={{
                    defaultPageSize: 50,
                    showSizeChanger: true,
                    pageSizeOptions: [10, 25, 50, 100],
                  }}
                />
              ),
            },
            {
              key: 'schemaColumns',
              label: 'Additional Columns',
              forceRender: true,
              children: (
                <AddSchemaTable
                  key="schemaColumns"
                  name="schemaColumns"
                  formValidation={formValidation}
                />
              ),
            },
          ]}
        />
      )}

      {!hasUploadedSchema && (
        <>
          <label htmlFor="schemaColumns">Schema Columns</label>
          <AddSchemaTable
            key="schemaColumns"
            name="schemaColumns"
            formValidation={formValidation}
          />
        </>
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
