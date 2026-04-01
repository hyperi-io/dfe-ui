'use client';

import { useState } from 'react';
import type * as monacoType from 'monaco-editor';
import { MonacoEditor } from '@/core/components/Editor/MonacoEditor';
import { useLanguageServer } from '@/core/components/Editor/MonacoEditor/lsp/useLanguageServer';

export const TransformMonacoEditor = ({
  onMount,
  language,
  ...props
}: React.ComponentProps<typeof MonacoEditor>) => {
  const [editor, setEditor] = useState<monacoType.editor.IStandaloneCodeEditor | null>(null);
  const [monacoInstance, setMonacoInstance] = useState<typeof monacoType | null>(null);

  useLanguageServer({
    language: language ?? '',
    editor,
    monacoInstance,
  });

  return (
    <MonacoEditor
      {...props}
      language={language}
      onMount={(editorInstance, monaco) => {
        setEditor(editorInstance);
        setMonacoInstance(monaco);
        onMount?.(editorInstance, monaco);
      }}
    />
  );
};
