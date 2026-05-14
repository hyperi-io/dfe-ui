import { Form } from '@/core/components/Form';
import { PreloadedSchema } from '@/Schemas/components/CreateSchemaForm/types';
import { FileUploadDragger } from '@/Schemas/components/FileUploadDragger';
import { useElasticConvert } from '@/Schemas/hooks/useElasticConvert';
import { convertCsv } from '@/Schemas/server/actions/convertCsv';
import { isJsonFile } from '@/Schemas/server/actions/convertCsv/csvConvert.helpers';
import { FormInstance, FormRule } from 'antd';
import { RcFile, UploadChangeParam, UploadFile } from 'antd/es/upload';
import { Dispatch, SetStateAction } from 'react';
import { CreateSchemaFormData } from '..';

const getRcFileFromUploadInfo = (
  info: UploadChangeParam<UploadFile<RcFile>>,
): RcFile | undefined =>
  info.file?.originFileObj ?? info.fileList.at(-1)?.originFileObj;

/** Subscribes only this subtree to `uploadType` so Tabs / uploaded table do not rerender on radio change. */
export const SchemaUploadFileSection = ({
  form,
  formValidation,
  setUploadedSchema,
}: {
  form: FormInstance<CreateSchemaFormData>;
  formValidation: FormRule;
  setUploadedSchema: Dispatch<SetStateAction<PreloadedSchema>>;
}) => {
  const { mutate: convertElasticSchema } = useElasticConvert({
    onSuccess: (data) => {
      setUploadedSchema(data);
    },
    onError: (error) => {
      form.setFields([{ name: 'file', errors: [(error as Error).message] }]);
      setUploadedSchema([]);
    },
  });

  const watchUploadType = Form.useWatch('uploadType', form) ?? 'csv';

  const handleFileChange = (info: UploadChangeParam<UploadFile<RcFile>>) => {
    /** Reset field error onChange */
    form.setFields([{ name: 'file', errors: [] }]);

    /** Get file from upload info */
    const file = getRcFileFromUploadInfo(info);
    if (!file) {
      setUploadedSchema([]);
      return;
    }

    /** Convert CSV */
    if (watchUploadType === 'csv') {
      void (async () => {
        try {
          const jsonSchema = await convertCsv(file);
          setUploadedSchema(jsonSchema);
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : 'Could not convert CSV';
          form.setFields([{ name: 'file', errors: [message] }]);
          setUploadedSchema([]);
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
        setUploadedSchema([]);
        return;
      }

      convertElasticSchema({ file }); // Data upload happens in the mutation onSuccess
    }
  };

  return (
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
  );
};
