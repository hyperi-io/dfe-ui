import ace from 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/ext-language_tools';

/**
 * Setup JSON autocompletion for ACE Editor
 *
 * @returns void
 */
export const setupJSONAutocompletion = () => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const langTools = ace.require('ace/ext/language_tools');
  const jsonCompleter = {
    getCompletions: (
      _editor: any,
      session: any,
      pos: any,
      prefix: string,
      callback: any,
    ) => {
      const completions: any[] = [];
      const line = session.getLine(pos.row) as string;
      const linePrefix = line.substring(0, pos.column);

      // JSON structure completions
      if (linePrefix.trim().endsWith('{') || linePrefix.trim() === '') {
        completions.push(
          { name: '{}', value: '{}', score: 100, meta: 'JSON Object' },
          { name: '[]', value: '[]', score: 100, meta: 'JSON Array' },
        );
      }

      // Common JSON keywords
      const keywords = ['true', 'false', 'null'];
      keywords.forEach((keyword) => {
        if (keyword.startsWith(prefix)) {
          completions.push({
            name: keyword,
            value: keyword,
            score: 50,
            meta: 'JSON Literal',
          });
        }
      });

      // String quotes
      if (prefix === '"' || prefix === "'") {
        completions.push({
          name: '""',
          value: '""',
          score: 200,
          meta: 'String',
        });
      }

      callback(null, completions);
    },
  };

  langTools.setCompleters([langTools.textCompleter, jsonCompleter]);
  /* eslint-enable @typescript-eslint/no-explicit-any */
};
