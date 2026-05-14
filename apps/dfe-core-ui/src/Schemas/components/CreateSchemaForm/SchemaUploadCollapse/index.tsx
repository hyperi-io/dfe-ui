import { Form } from '@/core/components/Form';
import { cn } from '@/core/utils/style';
import { AddSchemaTable } from '@/Schemas/components/CreateSchemaForm/AddSchemaTable';
import { FileUploadDragger } from '@/Schemas/components/FileUploadDragger';
import { useElasticConvert } from '@/Schemas/hooks/useElasticConvert';
import { ElasticConverterResponse } from '@/Schemas/hooks/useElasticConvert/useElasticConvert';
import { convertCsv, CsvRow } from '@/Schemas/server/actions/convertCsv';
import { isJsonFile } from '@/Schemas/server/actions/convertCsv/csvConvert.helpers';
import { IconChevronDown, IconChevronUp } from '@repo/dfe-icons';
import { FormInstance, FormRule, Radio, Tabs } from 'antd';
import { RcFile, UploadChangeParam, UploadFile } from 'antd/es/upload';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CreateSchemaFormData } from '..';

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

export const SchemaUploadCollapse = ({
  form,
  formValidation,
}: {
  form: FormInstance<CreateSchemaFormData>;
  formValidation: FormRule;
}) => {
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

  return (
    <>
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
    </>
  );
};
