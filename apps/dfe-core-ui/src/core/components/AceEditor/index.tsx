'use client';

import { useTheme } from '@/core/contexts/ClientContext/ThemeContext';
import type { Editor } from 'ace-builds';
import * as aceBeautify from 'ace-builds/src-noconflict/ext-beautify';
import ReactAceEditor from 'react-ace';

import { cn } from '@/core/utils/style';
import 'ace-builds/src-noconflict/ext-beautify';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-github_dark';
import 'ace-builds/src-noconflict/theme-github_light_default';
interface AceEditorProps extends React.ComponentProps<typeof ReactAceEditor> {
  'aria-invalid'?: boolean;
}

export const AceEditor = ({
  className,
  'aria-invalid': ariaInvalid,
  editorProps,
  ...props
}: AceEditorProps) => {
  const { colorMode } = useTheme();

  const beautifyContent = (editor: Editor) => {
    aceBeautify.beautify(editor.getSession());
  };

  return (
    <ReactAceEditor
      width="100%"
      height="600px"
      showPrintMargin={false}
      className={cn(
        'border rounded-sm transition-shadow',
        'border-foreground/10 dark:border-dark-foreground/10',
        ariaInvalid
          ? 'focus-within:ring-2 focus-within:ring-error/10'
          : 'focus-within:ring-2 focus-within:ring-info/10 focus-within:border-info hover:border-info',
        ariaInvalid && 'border-error',
        className,
      )}
      wrapEnabled
      editorProps={{ ...editorProps, $blockScrolling: true }}
      theme={colorMode === 'light' ? 'github_light_default' : 'github_dark'}
      enableSnippets
      enableBasicAutocompletion
      enableLiveAutocompletion
      onLoad={(editor) => {
        editor.commands.addCommand({
          name: 'beautify',
          bindKey: { win: 'Ctrl-Shift-B', mac: 'Command-Shift-B' },
          exec: (editor: Editor) => beautifyContent(editor),
        });
      }}
      {...props}
    />
  );
};
