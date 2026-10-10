'use client';

import type { FormControlAria } from '@/core/components/Form/formControlAria';
import { useTheme } from '@/core/contexts/ClientContext/ThemeContext';
import type { Editor } from 'ace-builds';
import * as aceBeautify from 'ace-builds/src-noconflict/ext-beautify';
import ReactAceEditor from 'react-ace';

import { cn } from '@/core/utils/style';
import { useEffect, useRef } from 'react';
import 'ace-builds/src-noconflict/ext-beautify';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/mode-yaml';
// Registered here so enableSnippets never fetches them from a page-relative path.
import 'ace-builds/src-noconflict/snippets/sql';
import 'ace-builds/src-noconflict/theme-github_dark';
import 'ace-builds/src-noconflict/theme-github_light_default';
const SUPPORTED_ACE_BEAUTIFY_MODES = new Set([
  'css',
  'html',
  'javascript',
  'php',
]);

interface AceEditorProps
  extends React.ComponentPropsWithRef<typeof ReactAceEditor>, FormControlAria {}

/** An absent attribute and `false` mean the same, so neither is written. */
const ariaValue = (value: React.AriaAttributes['aria-invalid']) =>
  value === undefined || value === false || value === 'false'
    ? undefined
    : String(value);

const setAttribute = (
  element: HTMLElement,
  name: keyof FormControlAria,
  value: string | undefined,
) => {
  if (value === undefined) {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, value);
  }
};

export const AceEditor = ({
  className,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  'aria-required': ariaRequired,
  editorProps,
  mode = 'json',
  onLoad,
  ...props
}: AceEditorProps) => {
  const { colorMode } = useTheme();
  const editorRef = useRef<Editor | null>(null);
  const invalid = ariaValue(ariaInvalid);
  const required = ariaValue(ariaRequired);
  const isInvalid = invalid !== undefined;

  useEffect(() => {
    const input = editorRef.current?.textInput?.getElement();
    if (!input) return;
    setAttribute(input, 'aria-invalid', invalid);
    setAttribute(input, 'aria-describedby', ariaDescribedBy);
    setAttribute(input, 'aria-required', required);
  }, [invalid, ariaDescribedBy, required]);

  const beautifyContent = (editor: Editor) => {
    aceBeautify.beautify(editor.getSession());
  };

  const handleOnLoad = (editor: Editor) => {
    editorRef.current = editor;
    onLoad?.(editor);

    /**
     * Only beautify if the mode is supported
     * YAML is not supported by ace-beautify and is handled by the yaml library
     * which is already beautified
     *
     * If beautify is run on YAML it strips the whitespace from the YAML file
     * causing the YAML file to be invalid
     */
    const modeSlug = typeof mode === 'string' ? mode : '';
    if (modeSlug && SUPPORTED_ACE_BEAUTIFY_MODES.has(modeSlug)) {
      beautifyContent(editor);
    }
  };

  return (
    <ReactAceEditor
      width="100%"
      height="600px"
      showPrintMargin={false}
      className={cn(
        'border rounded-sm transition-shadow',
        'border-foreground/10 dark:border-dark-foreground/10',
        isInvalid
          ? 'focus-within:ring-2 focus-within:ring-error/10'
          : 'focus-within:ring-2 focus-within:ring-info/10 focus-within:border-info hover:border-info',
        isInvalid && 'border-error',
        className,
      )}
      wrapEnabled
      editorProps={{ ...editorProps, $blockScrolling: true }}
      theme={colorMode === 'light' ? 'github_light_default' : 'github_dark'}
      enableSnippets
      enableBasicAutocompletion
      enableLiveAutocompletion
      mode={mode}
      onLoad={handleOnLoad}
      {...props}
    />
  );
};
