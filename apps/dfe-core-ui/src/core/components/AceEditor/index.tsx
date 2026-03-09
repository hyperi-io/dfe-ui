'use client';

import { useTheme } from '@/core/contexts/ThemeContext';
import type { Editor } from 'ace-builds';
import * as aceBeautify from 'ace-builds/src-noconflict/ext-beautify';
import ReactAceEditor from 'react-ace';

import 'ace-builds/src-noconflict/ext-beautify';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-github_dark';
import 'ace-builds/src-noconflict/theme-github_light_default';

export const AceEditor = ({ ...props }) => {
  const { colorMode } = useTheme();

  const beautifyContent = (editor: Editor) => {
    aceBeautify.beautify(editor.getSession());
  };

  return (
    <ReactAceEditor
      width="100%"
      height="600px"
      showPrintMargin={false}
      wrapEnabled
      editorProps={{ $blockScrolling: true }}
      theme={colorMode === 'light' ? 'github_light_default' : 'github_dark'}
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
