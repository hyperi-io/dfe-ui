/**
 * Registers Monaco language providers backed by an LSP client.
 * Returns a disposable that tears down all registrations.
 */
import type * as monaco from 'monaco-editor';
import type { LspClient } from './client';
import {
  toLspPosition,
  toMonacoCompletionList,
  toMonacoHover,
  toMonacoMarkers,
  toMonacoSignatureHelp,
  type LspCompletionItem,
  type LspCompletionList,
  type LspDiagnostic,
  type LspHover,
  type LspSignatureHelp,
} from './converters';

interface RegisterProvidersOptions {
  monacoInstance: typeof monaco;
  language: string;
  client: LspClient;
  model: monaco.editor.ITextModel;
}

export function registerLspProviders({
  monacoInstance,
  language,
  client,
  model,
}: RegisterProvidersOptions): monaco.IDisposable {
  const disposables: monaco.IDisposable[] = [];

  const uri = model.uri.toString();
  const textDocumentIdentifier = { uri };

  disposables.push(
    monacoInstance.languages.registerCompletionItemProvider(language, {
      triggerCharacters: ['.', ':', '<', '"', '/', '('],
      provideCompletionItems: async (m, position) => {
        if (m.uri.toString() !== uri) return { suggestions: [] };
        try {
          const result = await client.request<LspCompletionList | LspCompletionItem[] | null>(
            'textDocument/completion',
            {
              textDocument: textDocumentIdentifier,
              position: toLspPosition(position),
            },
          );
          const word = m.getWordUntilPosition(position);
          const range: monaco.IRange = {
            startLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endLineNumber: position.lineNumber,
            endColumn: word.endColumn,
          };
          return toMonacoCompletionList(result, range);
        } catch {
          return { suggestions: [] };
        }
      },
    }),
  );

  disposables.push(
    monacoInstance.languages.registerHoverProvider(language, {
      provideHover: async (m, position) => {
        if (m.uri.toString() !== uri) return null;
        try {
          const result = await client.request<LspHover | null>(
            'textDocument/hover',
            {
              textDocument: textDocumentIdentifier,
              position: toLspPosition(position),
            },
          );
          return toMonacoHover(result);
        } catch {
          return null;
        }
      },
    }),
  );

  disposables.push(
    monacoInstance.languages.registerSignatureHelpProvider(language, {
      signatureHelpTriggerCharacters: ['(', ','],
      provideSignatureHelp: async (m, position) => {
        if (m.uri.toString() !== uri) return null;
        try {
          const result = await client.request<LspSignatureHelp | null>(
            'textDocument/signatureHelp',
            {
              textDocument: textDocumentIdentifier,
              position: toLspPosition(position),
            },
          );
          return toMonacoSignatureHelp(result);
        } catch {
          return null;
        }
      },
    }),
  );

  client.onNotification('textDocument/publishDiagnostics', (params) => {
    const p = params as { uri: string; diagnostics: LspDiagnostic[] };
    if (p.uri !== uri) return;
    const markers = toMonacoMarkers(p.diagnostics);
    monacoInstance.editor.setModelMarkers(model, 'lsp', markers);
  });

  return {
    dispose: () => {
      for (const d of disposables) d.dispose();
      monacoInstance.editor.setModelMarkers(model, 'lsp', []);
    },
  };
}
