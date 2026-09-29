import ace from 'ace-builds/src-noconflict/ace';
import { describe, expect, test } from 'vitest';
import './AnnotatedAceEditor';
import './index';

// The snippet modules the console's modes ask for (their snippetFileId).
const SNIPPET_MODULES = ['ace/snippets/javascript', 'ace/snippets/sql'];

describe('Ace snippets', () => {
  test.each(SNIPPET_MODULES)(
    '%s resolves from the bundle, so Ace never fetches it from a page-relative path',
    (id) => {
      let loaded: { snippetText?: string } | undefined;
      // Answers synchronously only for a module already defined; otherwise it injects a script tag.
      ace.config.loadModule(id, (module: { snippetText?: string }) => {
        loaded = module;
      });

      expect(loaded?.snippetText).toBeTruthy();
    },
  );
});
