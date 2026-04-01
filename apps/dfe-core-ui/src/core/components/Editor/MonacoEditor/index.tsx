'use client';

import { useTheme } from '@/core/contexts/ClientContext/ThemeContext';
import { Editor, type EditorProps } from '@monaco-editor/react';

export const MonacoEditor = ({
  theme: themeProp,
  language = 'javascript',
  options,
  ...props
}: EditorProps) => {
  const { colorMode } = useTheme();
  const theme = themeProp ?? (colorMode === 'light' ? 'light' : 'vs-dark');

  return (
    <Editor
      {...props}
      language={language}
      theme={theme}
      options={{
        ...options,
        minimap: {
          enabled: false,
        },
        contextmenu: false,
      }}
    />
  );
};
