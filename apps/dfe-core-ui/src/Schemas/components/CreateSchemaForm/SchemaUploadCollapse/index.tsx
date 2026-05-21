import { Form } from '@/core/components/Form';
import { TabLabel } from '@/core/components/TabLabel';
import { cn } from '@/core/utils/style';
import { AddSchemaTable } from '@/Schemas/components/CreateSchemaForm/AddSchemaTable';
import { useCreateSchemaFormContext } from '@/Schemas/components/CreateSchemaForm/contexts/CreateSchemaForm.context';
import { CreateSchemaFormData } from '@/Schemas/components/CreateSchemaForm/CreateSchemaForm.schema';
import { UploadedSchemaTable } from '@/Schemas/components/CreateSchemaForm/UploadedSchemaTable';
import { IconChevronDown, IconChevronUp } from '@repo/dfe-icons';
import { Radio, Tabs } from 'antd';
import { useState } from 'react';
import { SchemaUploadFileSection } from './SchemaUploadFileSection';

export const SchemaUploadCollapse = ({
  disabledFields,
}: {
  disabledFields?: {
    [key in keyof CreateSchemaFormData]?: boolean;
  };
}) => {
  const [activeKey, setActiveKey] = useState<
    'uploadedColumns' | 'schemaColumns'
  >('uploadedColumns');
  const { formValidation, uploadedSchemaColumns, validationErrors } =
    useCreateSchemaFormContext();
  const [showFileUpload, setShowFileUpload] = useState(true);

  const hasUploadedSchema = uploadedSchemaColumns.length > 0;

  return (
    <>
      <div className="relative w-full">
        <button
          type="button"
          className="absolute top-0 right-0 z-2 cursor-pointer p-1"
          onClick={() => setShowFileUpload(!showFileUpload)}
        >
          {showFileUpload ? <IconChevronUp /> : <IconChevronDown />}
        </button>

        <button
          type="button"
          className={cn(
            'cursor-pointer border-b border-foreground/10 dark:border-dark-foreground/10 w-full text-left pb-2',
            showFileUpload && 'border-b-0 pb-0',
          )}
          onClick={() => setShowFileUpload(true)}
        >
          <p>Upload from file</p>
        </button>

        {showFileUpload && (
          <div className="flex flex-col gap-y-2">
            <Form.Item name="uploadType" initialValue="csv">
              <Radio.Group
                className="flex flex-row w-full mt-3"
                disabled={disabledFields?.uploadType}
              >
                <Radio.Button value="csv" className="w-1/2 text-center">
                  DFE CSV
                </Radio.Button>
                <Radio.Button value="json" className="w-1/2 text-center">
                  ELASTIC INDEX TEMPLATE
                </Radio.Button>
              </Radio.Group>
            </Form.Item>

            <SchemaUploadFileSection
              onUpload={() => setActiveKey('uploadedColumns')}
            />
          </div>
        )}
      </div>

      <Tabs
        destroyOnHidden={false}
        activeKey={activeKey}
        onChange={(key) => {
          setActiveKey(key as 'uploadedColumns' | 'schemaColumns');
        }}
        items={[
          ...(hasUploadedSchema
            ? [
                {
                  key: 'uploadedColumns',
                  label: (
                    <TabLabel
                      label="Uploaded Columns"
                      validationErrors={validationErrors.uploadedColumns ?? []}
                    />
                  ),
                  forceRender: true,
                  children: <UploadedSchemaTable />,
                },
              ]
            : []),
          {
            key: 'schemaColumns',
            label: (
              <TabLabel
                label={
                  hasUploadedSchema ? 'Additional Columns' : 'Schema Columns'
                }
                validationErrors={validationErrors.schemaColumns ?? []}
              />
            ),
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
    </>
  );
};
