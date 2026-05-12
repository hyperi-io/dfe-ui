import { Form } from '@/core/components/Form';
import { cn } from '@/core/utils/style';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { convertCsv, CsvRow } from '@/Schemas/server/actions/convertCsv';
import { IconChevronDown, IconChevronUp } from '@repo/dfe-icons';
import { Button, FormProps, Input, Radio, Select, Tabs } from 'antd';
import { RcFile, UploadChangeParam, UploadFile } from 'antd/es/upload';
import { useState } from 'react';
import z from 'zod';
import { AddSchemaTable, rowSchema } from './AddSchemaTable';
import { TYPE_OPTIONS } from './fieldOptions.constants';
import { FileUploadDragger } from './FileUploadDragger';

const NAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const GROUP_REGEX = /^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/;
const VERSION_REGEX = /^[0-9]+\.[0-9]+\.[0-9]+$/;

const formSchema = z.object({
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
  uploadedColumns: z.record(z.string(), rowSchema).optional(),
  schemaColumns: z.record(z.string(), rowSchema).optional(),
});
export type CreateSchemaFormData = z.infer<typeof formSchema>;

interface CreateSchemaFormProps extends FormProps<CreateSchemaFormData> {
  hasReset?: boolean;
  isPending?: boolean;
  buttonLabel?: string;
}

export const CreateSchemaForm = ({
  hasReset = false,
  isPending = false,
  buttonLabel = 'Save',
  onFinish,
}: CreateSchemaFormProps) => {
  const [form] = Form.useForm<CreateSchemaFormData>();
  const formValidation = useAntdZodResolver<CreateSchemaFormData>(formSchema);
  const [viewMore, setViewMore] = useState(false);
  const [fileUpload, setFileUpload] = useState(false);
  const [uploadedSchema, setUploadedSchema] = useState<CsvRow[]>([]);
  /** Remount CSV table after each successful convert so rows (and IDs) rebuild without a syncing effect */
  const [uploadedImportKey, setUploadedImportKey] = useState(0);

  const hasUploadedSchema = uploadedSchema.length > 0;

  const watchUploadType = Form.useWatch('uploadType', form);
  const handleFileChange = async (
    info: UploadChangeParam<UploadFile<RcFile>>,
  ) => {
    if (watchUploadType === 'csv') {
      const jsonSchema = await convertCsv(
        info.fileList[0]?.originFileObj as unknown as File,
      );
      setUploadedSchema(jsonSchema);
      setUploadedImportKey((k) => k + 1);
    }
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
          onClick={() => setViewMore(!viewMore)}
        >
          {viewMore ? <IconChevronUp /> : <IconChevronDown />}
        </button>

        {!viewMore && (
          <button
            className="cursor-pointer border-b border-foreground/10 dark:border-dark-foreground/10 w-full text-left pb-2"
            onClick={(e) => {
              e.preventDefault();
              setViewMore(true);
            }}
          >
            <label htmlFor="description">Description</label>
          </button>
        )}

        {viewMore && (
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
          onClick={() => setFileUpload(!fileUpload)}
        >
          {viewMore ? <IconChevronUp /> : <IconChevronDown />}
        </button>

        <button
          className={cn(
            'cursor-pointer border-b border-foreground/10 dark:border-dark-foreground/10 w-full text-left pb-2',
            fileUpload && 'border-b-0 pb-0',
          )}
          onClick={(e) => {
            e.preventDefault();
            setFileUpload(true);
          }}
        >
          <p>Upload from file</p>
        </button>

        {fileUpload && (
          <div className="flex flex-col gap-y-2">
            <Form.Item name="uploadType" initialValue="csv">
              <Radio.Group className="flex flex-row w-full mt-3">
                <Radio.Button value="csv" className="w-1/2 text-center">
                  DFE CSV
                </Radio.Button>
                <Radio.Button
                  disabled
                  value="json"
                  className="w-1/2 text-center"
                >
                  ELASTIC INDEX TEMPLATE (Coming Soon!)
                </Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="file"
              rules={[formValidation]}
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
                />
              ),
            },
            {
              key: 'schemaColumns',
              label: 'Additional Columns',
              forceRender: true,
              children: (
                <AddSchemaTable
                  name="schemaColumns"
                  formValidation={formValidation}
                />
              ),
            },
          ]}
        />
      )}

      {!hasUploadedSchema && (
        <Form.Item name="schemaColumns" label="Schema Columns">
          <AddSchemaTable
            name="schemaColumns"
            formValidation={formValidation}
          />
        </Form.Item>
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
