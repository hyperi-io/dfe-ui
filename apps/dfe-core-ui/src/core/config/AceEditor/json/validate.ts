import AceEditor from 'react-ace';

interface AceValidateJSONProps {
  value: string;
  editorRef: React.RefObject<AceEditor>;
}

/**
 * Validate a JSON string using ACE Editor's annotations
 *
 * @param value - The JSON string to validate
 * @param editorRef - The editor reference
 * @returns void
 */

export const aceValidateJSON = ({ value, editorRef }: AceValidateJSONProps) => {
  if (!editorRef.current?.editor) return;

  try {
    JSON.parse(value);
    // Clear annotations if JSON is valid
    editorRef.current.editor.getSession().clearAnnotations();
  } catch (error) {
    const err = error as Error;
    // Parse error message to get line number
    const match = err.message.match(/position (\d+)/);
    let line = 0;
    let column = 0;

    if (match) {
      const position = parseInt(match[1], 10);
      const lines = value.substring(0, position).split('\n');
      line = lines.length - 1;
      column = lines[lines.length - 1].length;
    }

    // Set annotation to show error
    editorRef.current.editor.getSession().setAnnotations([
      {
        row: line,
        column: column,
        text: err.message,
        type: 'error',
      },
    ]);
  }
};
