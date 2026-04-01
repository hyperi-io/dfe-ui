/**
 * Bidirectional converters between LSP types and Monaco editor types.
 */
import type * as monaco from 'monaco-editor';

/* ------------------------------------------------------------------ */
/*  LSP Type Definitions (subset used by this integration)            */
/* ------------------------------------------------------------------ */

export interface LspPosition {
  line: number;
  character: number;
}

export interface LspRange {
  start: LspPosition;
  end: LspPosition;
}

export interface LspTextEdit {
  range: LspRange;
  newText: string;
}

export interface LspCompletionItem {
  label: string | { label: string; detail?: string; description?: string };
  kind?: number;
  detail?: string;
  documentation?: string | { kind: string; value: string };
  insertText?: string;
  insertTextFormat?: number;
  textEdit?: LspTextEdit & { insert?: LspRange; replace?: LspRange };
  additionalTextEdits?: LspTextEdit[];
  sortText?: string;
  filterText?: string;
  preselect?: boolean;
}

export interface LspCompletionList {
  isIncomplete: boolean;
  items: LspCompletionItem[];
}

export interface LspHover {
  contents: LspMarkupContent | LspMarkupContent[] | string;
  range?: LspRange;
}

export interface LspMarkupContent {
  kind: 'plaintext' | 'markdown';
  value: string;
}

export interface LspDiagnostic {
  range: LspRange;
  severity?: number;
  code?: number | string;
  source?: string;
  message: string;
}

export interface LspSignatureHelp {
  signatures: LspSignatureInformation[];
  activeSignature?: number;
  activeParameter?: number;
}

export interface LspSignatureInformation {
  label: string;
  documentation?: string | LspMarkupContent;
  parameters?: LspParameterInformation[];
}

export interface LspParameterInformation {
  label: string | [number, number];
  documentation?: string | LspMarkupContent;
}

/* ------------------------------------------------------------------ */
/*  Monaco ↔ LSP Position / Range                                    */
/* ------------------------------------------------------------------ */

export function toMonacoPosition(pos: LspPosition): monaco.IPosition {
  return { lineNumber: pos.line + 1, column: pos.character + 1 };
}

export function toLspPosition(pos: monaco.IPosition): LspPosition {
  return { line: pos.lineNumber - 1, character: pos.column - 1 };
}

export function toMonacoRange(range: LspRange): monaco.IRange {
  return {
    startLineNumber: range.start.line + 1,
    startColumn: range.start.character + 1,
    endLineNumber: range.end.line + 1,
    endColumn: range.end.character + 1,
  };
}

/* ------------------------------------------------------------------ */
/*  Completion Kind Mapping                                           */
/* ------------------------------------------------------------------ */

const LSP_TO_MONACO_COMPLETION_KIND: Record<number, number> = {
  1: 18, // Text
  2: 1,  // Method
  3: 1,  // Function
  4: 8,  // Constructor
  5: 4,  // Field
  6: 5,  // Variable
  7: 7,  // Class
  8: 8,  // Interface
  9: 9,  // Module
  10: 10, // Property
  11: 12, // Unit
  12: 13, // Value
  13: 15, // Enum
  14: 17, // Keyword
  15: 27, // Snippet
  16: 19, // Color
  17: 20, // File
  18: 21, // Reference
  19: 23, // Folder
  20: 16, // EnumMember
  21: 14, // Constant
  22: 6,  // Struct
  23: 24, // Event
  24: 11, // Operator
  25: 25, // TypeParameter
};

/* ------------------------------------------------------------------ */
/*  Completion Conversion                                             */
/* ------------------------------------------------------------------ */

function resolveDocumentation(
  doc: string | LspMarkupContent | undefined,
): string | { value: string } | undefined {
  if (!doc) return undefined;
  if (typeof doc === 'string') return doc;
  return { value: doc.value };
}

export function toMonacoCompletionItem(
  item: LspCompletionItem,
  range: monaco.IRange,
): monaco.languages.CompletionItem {
  const label = typeof item.label === 'string' ? item.label : item.label.label;
  const insertTextFormat = item.insertTextFormat ?? 1;

  return {
    label: typeof item.label === 'string'
      ? item.label
      : { label: item.label.label, detail: item.label.detail, description: item.label.description },
    kind: LSP_TO_MONACO_COMPLETION_KIND[item.kind ?? 1] ?? 18,
    detail: item.detail,
    documentation: resolveDocumentation(item.documentation),
    insertText: item.insertText ?? label,
    insertTextRules:
      insertTextFormat === 2 ? 4 /* InsertAsSnippet */ : 0,
    range,
    sortText: item.sortText,
    filterText: item.filterText,
    preselect: item.preselect,
  } as monaco.languages.CompletionItem;
}

export function toMonacoCompletionList(
  result: LspCompletionList | LspCompletionItem[] | null,
  range: monaco.IRange,
): monaco.languages.CompletionList {
  if (!result) return { suggestions: [] };

  const items = Array.isArray(result) ? result : result.items;
  const isIncomplete = Array.isArray(result) ? false : result.isIncomplete;

  return {
    incomplete: isIncomplete,
    suggestions: items.map((item) => toMonacoCompletionItem(item, range)),
  };
}

/* ------------------------------------------------------------------ */
/*  Hover Conversion                                                  */
/* ------------------------------------------------------------------ */

function normalizeMarkupContent(
  content: string | LspMarkupContent,
): { value: string } {
  if (typeof content === 'string') return { value: content };
  return { value: content.value };
}

export function toMonacoHover(hover: LspHover | null): monaco.languages.Hover | null {
  if (!hover) return null;

  let contents: { value: string }[];
  if (Array.isArray(hover.contents)) {
    contents = hover.contents.map(normalizeMarkupContent);
  } else {
    contents = [normalizeMarkupContent(hover.contents)];
  }

  return {
    contents,
    range: hover.range ? toMonacoRange(hover.range) : undefined,
  };
}

/* ------------------------------------------------------------------ */
/*  Diagnostic Conversion                                             */
/* ------------------------------------------------------------------ */

const LSP_SEVERITY_TO_MONACO: Record<number, number> = {
  1: 8, // Error
  2: 4, // Warning
  3: 2, // Information
  4: 1, // Hint
};

export function toMonacoMarkers(
  diagnostics: LspDiagnostic[],
): monaco.editor.IMarkerData[] {
  return diagnostics.map((d) => ({
    severity: LSP_SEVERITY_TO_MONACO[d.severity ?? 1] ?? 8,
    startLineNumber: d.range.start.line + 1,
    startColumn: d.range.start.character + 1,
    endLineNumber: d.range.end.line + 1,
    endColumn: d.range.end.character + 1,
    message: d.message,
    source: d.source,
    code: d.code?.toString(),
  }));
}

/* ------------------------------------------------------------------ */
/*  Signature Help Conversion                                         */
/* ------------------------------------------------------------------ */

export function toMonacoSignatureHelp(
  result: LspSignatureHelp | null,
): monaco.languages.SignatureHelpResult | null {
  if (!result) return null;

  return {
    value: {
      signatures: result.signatures.map((sig) => ({
        label: sig.label,
        documentation: resolveDocumentation(sig.documentation),
        parameters: (sig.parameters ?? []).map((p) => ({
          label: p.label,
          documentation: resolveDocumentation(p.documentation),
        })),
      })),
      activeSignature: result.activeSignature ?? 0,
      activeParameter: result.activeParameter ?? 0,
    },
    dispose: () => {},
  };
}
