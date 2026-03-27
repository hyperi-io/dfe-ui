import { Form } from '@/core/components/Form';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useCompileTransform } from '@/Settings/hooks/useCompileTransform';
import { Button, Input, Select } from 'antd';
import z from 'zod';
import { ResponseModal } from './ResponseModal';

import { TransformAceEditor } from './TransformAceEditor';

const transformCompileSchema = z.object({
  name: z
    .string({ message: 'Name should be a string' })
    .min(1, { message: 'Name is required' }),
  language: z.enum(['rust', 'go', 'assemblyscript']),
  files: z.record(
    z.string(),
    z.string().min(1, { message: 'File content is required' }),
  ),
});

type TransformCompileFormData = z.infer<typeof transformCompileSchema>;

const fileExtensionMap = {
  rust: 'rs',
  go: 'go',
  assemblyscript: 'ts',
};

const aceMode = (language: 'rust' | 'go' | 'assemblyscript') => {
  switch (language) {
    case 'rust':
      return 'rust';
    case 'go':
      return 'golang';
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

        <div className="relative">
          <span className="absolute top-0 right-0 mt-1.5 text-xs text-foreground-muted dark:text-foreground-muted">
            EditorMode: {aceMode(fileLanguage)}
          </span>
          <Form.Item
            name={['files', fileName]}
            className="label:w-full"
            label={
              <span className="text-sm text-foreground-muted dark:text-foreground-muted">
                {fileName}.
                {
                  fileExtensionMap[
                    fileLanguage as keyof typeof fileExtensionMap
                  ]
                }
              </span>
            }
            rules={[transformCompileValidation]}
          >
            <TransformAceEditor height={`${componentHeight}px`} />
          </Form.Item>
        </div>

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
