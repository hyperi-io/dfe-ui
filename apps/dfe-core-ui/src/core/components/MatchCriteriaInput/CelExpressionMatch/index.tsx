import { AceEditor } from '@/core/components/AceEditor';
import { FormNotification } from '@/core/components/FormNotification';
import { IconCheck, IconX } from '@repo/dfe-icons';
import type { Editor } from 'ace-builds';
import { Button } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { ValidateCel } from '..';

const EXAMPLE = "// eg: data_stream.dataset == 'okta.system'";

export const CelExpressionMatch = ({
  value,
  onChange,
  validateCel,
}: {
  onChange?: (value?: string) => void;
  value?: string;
  validateCel: ValidateCel;
}) => {
  const [expression, setExpression] = useState(value ?? EXAMPLE);
  const editorRef = useRef<Editor | null>(null);

  const handleExpressionChange = (value: string) => {
    setExpression(value);
    validateCel?.reset();
    onChange?.(value);
  };

  useEffect(() => {
    const editor = editorRef.current;
    const errors = (validateCel?.data?.errors ?? []).filter(
      (message) => message.length > 0,
    );
    if (!editor || validateCel?.data?.valid !== false || errors.length === 0)
      return;
    editor.session.setAnnotations(
      errors.map((text) => ({ row: 0, column: 0, text, type: 'error' })),
    );
  }, [validateCel?.data]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end absolute top-12 right-2 z-10">
        {validateCel && (
          <Button
            icon={
              validateCel?.data ? (
                validateCel?.data?.valid ? (
                  <IconCheck />
                ) : (
                  <IconX />
                )
              ) : null
            }
            danger={validateCel?.data ? !validateCel?.data?.valid : false}
            type="default"

            loading={validateCel?.isPending}
            htmlType="button"
            onClick={() => validateCel?.mutate(expression)}
          >
            {validateCel?.data
              ? validateCel?.data?.valid
                ? 'Expression is valid'
                : 'Expression is invalid'
              : 'Check Expression'}
          </Button>
        )}
      </div>

      <AceEditor
        mode="cel"
        className="min-h-14"
        minLines={2}
        maxLines={8}
        value={expression}
        onChange={handleExpressionChange}
        onLoad={(editor) => {
          editorRef.current = editor;
        }}
      />
      {validateCel?.data && !validateCel?.data?.valid && (
        <FormNotification
          title="Expression is invalid"
          text={validateCel?.data?.errors?.join(', ')}
          type="error"
        />
      )}
      {validateCel?.error && (
        <FormNotification
          title="Error checking expression"
          text={validateCel?.error?.message}
          type="error"
        />
      )}
    </div>
  );
};
