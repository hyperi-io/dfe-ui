import ace from '@/core/config/AceEditor/init';
import { celErrorPosition, checkCel } from './checkCel';

type CelSession = {
  getValue: () => string;
  setAnnotations: (
    annotations: Array<{
      row: number;
      column: number;
      text: string;
      type: string;
    }>,
  ) => void;
  on: (event: 'change', callback: () => void) => void;
  off: (event: 'change', callback: () => void) => void;
};

type AceRequire = (id: string) => {
  inherits: (child: object, parent: object) => void;
  TextHighlightRules: new () => { normalizeRules: () => void };
  CelHighlightRules: new () => unknown;
  Mode: new () => object;
};

type AceExports = { CelHighlightRules?: unknown; Mode?: unknown };

const define = (
  ace as {
    define: (
      id: string,
      deps: string[],
      factory: (require: AceRequire, exports: AceExports) => void,
    ) => void;
  }
).define;

type HighlightRule = { token: string; regex: string; next?: string };

const quotedState = (quote: "'" | '"'): HighlightRule[] => [
  { token: 'string.escape', regex: '\\\\.' },
  { token: 'string', regex: quote, next: 'start' },
  { token: 'string', regex: `[^${quote}\\\\]+` },
];

const tripleQuotedState = (quote: "'" | '"'): HighlightRule[] => [
  { token: 'string.escape', regex: '\\\\.' },
  { token: 'string', regex: `${quote}{3}`, next: 'start' },
  { token: 'string', regex: `[^${quote}\\\\]+` },
  { token: 'string', regex: `${quote}(?!${quote}{2})` },
];

define('ace/mode/cel_highlight_rules', [
  'require',
  'exports',
  'module',
  'ace/lib/oop',
  'ace/mode/text_highlight_rules',
], (require, exports) => {
  const oop = require('ace/lib/oop');
  const TextHighlightRules =
    require('ace/mode/text_highlight_rules').TextHighlightRules;

  const CelHighlightRules = function (this: {
    $rules: unknown;
    normalizeRules: () => void;
  }) {
    this.$rules = {
      start: [
        { token: 'text', regex: '\\s+' },
        { token: 'comment', regex: '//.*$' },
        { token: 'string', regex: "'''", next: 'tsq' },
        { token: 'string', regex: '"""', next: 'tdq' },
        { token: 'string', regex: "'", next: 'sq' },
        { token: 'string', regex: '"', next: 'dq' },
        {
          token: 'constant.numeric',
          regex:
            '\\b(?:0[xX][0-9a-fA-F]+|\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?)[uU]?\\b',
        },
        { token: 'constant.language.boolean', regex: '\\b(?:true|false)\\b' },
        { token: 'constant.language', regex: '\\bnull\\b' },
        { token: 'keyword', regex: '\\b(?:in|as)\\b' },
        {
          token: 'support.function',
          regex: '[A-Za-z_][A-Za-z0-9_]*(?=\\s*\\()',
        },
        { token: 'identifier', regex: '[A-Za-z_][A-Za-z0-9_]*' },
        {
          token: 'keyword.operator',
          regex: '==|!=|<=|>=|&&|\\|\\||\\?\\.|[+\\-*/%<>=!?:.]',
        },
        { token: 'paren.lparen', regex: '[[({]' },
        { token: 'paren.rparen', regex: '[\\])}]' },
        { token: 'punctuation.operator', regex: ',' },
      ],
      sq: quotedState("'"),
      dq: quotedState('"'),
      tsq: tripleQuotedState("'"),
      tdq: tripleQuotedState('"'),
    };
    this.normalizeRules();
  };

  oop.inherits(CelHighlightRules, TextHighlightRules);
  exports.CelHighlightRules = CelHighlightRules;
});

define('ace/mode/cel', [
  'require',
  'exports',
  'module',
  'ace/lib/oop',
  'ace/mode/text',
  'ace/mode/cel_highlight_rules',
], (require, exports) => {
  const oop = require('ace/lib/oop');
  const TextMode = require('ace/mode/text').Mode;
  const CelHighlightRules =
    require('ace/mode/cel_highlight_rules').CelHighlightRules;

  const Mode = function (this: { HighlightRules: unknown }) {
    this.HighlightRules = CelHighlightRules;
  } as unknown as {
    new (): object;
    prototype: {
      $id: string;
      lineCommentStart: string;
      createWorker: (session: CelSession) => { terminate: () => void };
    };
  };

  oop.inherits(Mode, TextMode);
  Mode.prototype.$id = 'ace/mode/cel';
  Mode.prototype.lineCommentStart = '//';
  Mode.prototype.createWorker = (session) => {
    const mark = () => {
      const source = session.getValue();
      const error = checkCel(source);
      if (!error) {
        session.setAnnotations([]);
        return;
      }
      const position = celErrorPosition(source, error.span.start);
      session.setAnnotations([
        {
          row: position.row,
          column: position.column,
          text: error.message,
          type: 'error',
        },
      ]);
    };
    session.on('change', mark);
    mark();
    return {
      terminate: () => {
        session.off('change', mark);
        session.setAnnotations([]);
      },
    };
  };
  exports.Mode = Mode;
});
