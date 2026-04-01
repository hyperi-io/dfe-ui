import { Form } from '@/core/components/Form';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useCompileTransform } from '@/Settings/hooks/useCompileTransform';
import { Button, Input, Select } from 'antd';
import z from 'zod';
import { ResponseModal } from './ResponseModal';

import { FormNotification } from '@/core/components/FormNotification';
import { TransformMonacoEditor } from './TransformMonacoEditor';

const transformCompileSchema = z.object({
  name: z
    .string({ message: 'Name should be a string' })
    .min(1, { message: 'Name is required' }),
  language: z.enum(['rust', 'go', 'assemblyscript']),
  files: z.record(
    z.string(),
    z
      .string({ message: 'File content is required' })
      .min(1, { message: 'File content is required' }),
  ),
});

type TransformCompileFormData = z.infer<typeof transformCompileSchema>;

const fileExtensionMap = {
  rust: 'rs',
  go: 'go',
  assemblyscript: 'ts',
};

const monacoLanguage = (language: 'rust' | 'go' | 'assemblyscript') => {
  switch (language) {
    case 'rust':
      return 'rust';
    case 'go':
      return 'go';
    case 'assemblyscript':
      return 'typescript';
  }
};

export const CreateTransform = () => {
  const { componentHeight } = useSetComponentHeight({
    offset: 300,
  });
  const [form] = Form.useForm<TransformCompileFormData>();
  const transformCompileValidation =
    useAntdZodResolver<TransformCompileFormData>(transformCompileSchema);
  const {
    data: compileTransformData,
    mutate: compileTransform,
    isPending,
    reset: resetCompileTransform,
    error: compileTransformError,
  } = useCompileTransform();
  const handleFinish = (values: TransformCompileFormData) => {
    compileTransform(values);
  };

  const fileName = Form.useWatch('name', form);
  const fileLanguage = Form.useWatch('language', form);
  return (
    <>
      <Form
        form={form}
        onFinish={handleFinish}
        initialValues={{
          name: 'new_file',
          language: 'assemblyscript',
        }}
      >
        <div className="grid grid-cols-2 gap-2">
          <Form.Item
            name="name"
            label="Name"
            rules={[transformCompileValidation]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>
          <Form.Item
            name="language"
            label="Language"
            rules={[transformCompileValidation]}
          >
            <Select
              options={[
                { label: 'Rust', value: 'rust' },
                { label: 'Go', value: 'go' },
                { label: 'AssemblyScript', value: 'assemblyscript' },
              ]}
              placeholder="Select language"
            />
          </Form.Item>
        </div>

        <Form.Item
          name={['files', fileName]}
          className="[&_label]:w-full"
          label={
            <div className="text-foreground-muted/40 dark:text-foreground-muted/40 flex items-center justify-between w-full">
              <p>{`${fileName}.${fileExtensionMap[fileLanguage as keyof typeof fileExtensionMap]}`}</p>

              <p>Editor mode: {monacoLanguage(fileLanguage)}</p>
            </div>
          }
          rules={[transformCompileValidation]}
        >
          <TransformMonacoEditor
            height={`${componentHeight}px`}
            language={monacoLanguage(fileLanguage)}
          />
        </Form.Item>

        {compileTransformError && (
          <FormNotification
            type="error"
            text={
              compileTransformError?.message ?? 'An unexpected error occurred'
            }
          />
        )}

        <Form.Item className="flex justify-end">
          <Button
            loading={isPending}
            disabled={isPending}
            type="primary"
            htmlType="submit"
          >
            Compile
          </Button>
        </Form.Item>
      </Form>
      {compileTransformData != null && (
        <ResponseModal
          response={compileTransformData}
          onClose={resetCompileTransform}
        />
      )}
    </>
  );
};
