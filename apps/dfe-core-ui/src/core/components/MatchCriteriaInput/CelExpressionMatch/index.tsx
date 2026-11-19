import { AceEditor } from '@/core/components/AceEditor';
import { FormNotification } from '@/core/components/FormNotification';
import { useCheckCel } from '@/core/hooks/useCelCheck';
import { IconCheck, IconX } from '@repo/dfe-icons';
import type { Editor } from 'ace-builds';
import { Button } from 'antd';
import { useEffect, useRef, useState } from 'react';

const EXAMPLE = "// eg: data_stream.dataset == 'okta.system'";

export const CelExpressionMatch = ({
  value,
  onChange,
}: {
  onChange?: (value?: string) => void;
  value?: string;
}) => {
  const [expression, setExpression] = useState(value ?? EXAMPLE);
  const editorRef = useRef<Editor | null>(null);

  const {
    data,
    mutate: checkCel,
    isPending,
    error,
    reset: resetCheckCel,
  } = useCheckCel();

  const handleExpressionChange = (value: string) => {
    setExpression(value);
    resetCheckCel();
    onChange?.(value);
  };

  useEffect(() => {
    const editor = editorRef.current;
    const errors = (data?.errors ?? []).filter((message) => message.length > 0);
    if (!editor || data?.valid !== false || errors.length === 0) return;
    editor.session.setAnnotations(
      errors.map((text) => ({ row: 0, column: 0, text, type: 'error' })),
    );
  }, [data]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end absolute top-12 right-2 z-10">
        <Button
          icon={data ? data?.valid ? <IconCheck /> : <IconX /> : null}
          danger={data ? !data?.valid : false}
          type="default"

          loading={isPending}
          htmlType="button"
          onClick={() => checkCel({ expression, check_profile: true })}
        >
          {data
            ? data?.valid
              ? 'Expression is valid'
              : 'Expression is invalid'
            : 'Check Expression'}
        </Button>
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
      {data && !data?.valid && (
        <FormNotification
          title="Expression is invalid"
          text={data?.errors?.join(', ')}
          type="error"
        />
      )}
      {error && (
        <FormNotification
          title="Error checking expression"
          text={error.message}
          type="error"
        />
      )}
    </div>
  );
};
