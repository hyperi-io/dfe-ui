'use client';

import { useEffect, useRef } from 'react';
import type * as monaco from 'monaco-editor';
import { LspClient } from './client';
import { registerLspProviders } from './providers';

const LANGUAGE_SERVER_URL =
  process.env.NEXT_PUBLIC_LANGUAGE_SERVER_URL ?? 'ws://localhost:3001';

type SupportedLspLanguage = 'rust' | 'go';

const LSP_LANGUAGES = new Set<string>(['rust', 'go']);

export function isLspLanguage(lang: string): lang is SupportedLspLanguage {
  return LSP_LANGUAGES.has(lang);
}

interface UseLanguageServerOptions {
  language: string;
  editor: monaco.editor.IStandaloneCodeEditor | null;
  monacoInstance: typeof monaco | null;
}

/**
 * Manages the full LSP lifecycle for a Monaco editor instance:
 * 1. Connects to the language server via WebSocket
 * 2. Sends initialize / textDocument/didOpen
 * 3. Syncs document changes via textDocument/didChange
 * 4. Registers Monaco providers (completion, hover, diagnostics, signatures)
 * 5. Cleans up on unmount or language change
 */
export function useLanguageServer({
  language,
  editor,
  monacoInstance,
}: UseLanguageServerOptions) {
  const clientRef = useRef<LspClient | null>(null);
  const providersRef = useRef<monaco.IDisposable | null>(null);
  const versionRef = useRef(0);

  useEffect(() => {
    if (!editor || !monacoInstance || !isLspLanguage(language)) return;

    const model = editor.getModel();
    if (!model) return;

    let disposed = false;
    let changeListener: monaco.IDisposable | null = null;

    const uri = model.uri.toString();

    async function setup() {
      const client = new LspClient(`${LANGUAGE_SERVER_URL}/${language}`);
      clientRef.current = client;

      try {
        await client.connect();
      } catch {
        console.warn(`[LSP] Could not connect to ${language} language server`);
        return;
      }

      if (disposed) {
        client.dispose();
        return;
      }

      await client.request('initialize', {
        processId: null,
        rootUri: null,
        capabilities: {
          textDocument: {
            completion: {
              completionItem: {
                snippetSupport: true,
                documentationFormat: ['markdown', 'plaintext'],
              },
            },
            hover: {
              contentFormat: ['markdown', 'plaintext'],
            },
            signatureHelp: {
              signatureInformation: {
                documentationFormat: ['markdown', 'plaintext'],
                parameterInformation: { labelOffsetSupport: true },
              },
            },
            publishDiagnostics: {
              relatedInformation: true,
            },
            synchronization: {
              didSave: true,
              willSave: false,
              willSaveWaitUntil: false,
              dynamicRegistration: false,
            },
          },
        },
      });

      if (disposed) {
        client.dispose();
        return;
      }

      client.notify('initialized', {});

      versionRef.current = 1;
      client.notify('textDocument/didOpen', {
        textDocument: {
          uri,
          languageId: language,
          version: versionRef.current,
          text: model!.getValue(),
        },
      });

      providersRef.current = registerLspProviders({
        monacoInstance: monacoInstance!,
        language,
        client,
        model: model!,
      });

      changeListener = model!.onDidChangeContent(() => {
        versionRef.current++;
        client.notify('textDocument/didChange', {
          textDocument: { uri, version: versionRef.current },
          contentChanges: [{ text: model!.getValue() }],
        });
      });
    }

    setup().catch(() => {});

    return () => {
      disposed = true;
      changeListener?.dispose();
      providersRef.current?.dispose();
      providersRef.current = null;

      if (clientRef.current) {
        const client = clientRef.current;
        clientRef.current = null;

        const model = editor.getModel();
        if (model) {
          client.notify('textDocument/didClose', {
            textDocument: { uri: model.uri.toString() },
          });
        }
        client.request('shutdown', null).then(
          () => client.notify('exit', null),
          () => {},
        );

        setTimeout(() => client.dispose(), 500);
      }
    };
  }, [language, editor, monacoInstance]);
}
