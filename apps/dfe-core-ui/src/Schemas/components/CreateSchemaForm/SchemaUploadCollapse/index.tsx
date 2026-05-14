import { Form } from '@/core/components/Form';
import { cn } from '@/core/utils/style';
import { AddSchemaTable } from '@/Schemas/components/CreateSchemaForm/AddSchemaTable';
import { PreloadedSchema } from '@/Schemas/components/CreateSchemaForm/types';
import { UploadedSchemaTable } from '@/Schemas/components/CreateSchemaForm/UploadedSchemaTable';
import { IconChevronDown, IconChevronUp } from '@repo/dfe-icons';
import { FormInstance, FormRule, Radio, Tabs } from 'antd';
import { useState } from 'react';
import { CreateSchemaFormData } from '..';
import { SchemaUploadFileSection } from './SchemaUploadFileSection';

export const SchemaUploadCollapse = ({
  form,
  formValidation,
}: {
  form: FormInstance<CreateSchemaFormData>;
  formValidation: FormRule;
}) => {
  const [showFileUpload, setShowFileUpload] = useState(true);
  const [uploadedSchema, setUploadedSchema] = useState<PreloadedSchema>([]);

  const hasUploadedSchema = uploadedSchema.length > 0;

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

            <SchemaUploadFileSection
              form={form}
              formValidation={formValidation}
              setUploadedSchema={setUploadedSchema}
            />
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
                <UploadedSchemaTable
                  data={uploadedSchema}
                  formValidation={formValidation}
                  form={form}
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
