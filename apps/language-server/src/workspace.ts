import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { SupportedLanguage } from './languageServerProcess.js';

const SCAFFOLDING: Record<SupportedLanguage, { files: Record<string, string>; entryDir: string }> = {
  go: {
    files: {
      'go.mod': 'module workspace\n\ngo 1.21\n',
    },
    entryDir: '.',
  },
  rust: {
    files: {
      'Cargo.toml': [
        '[package]',
        'name = "workspace"',
        'version = "0.1.0"',
        'edition = "2021"',
        '',
      ].join('\n'),
    },
    entryDir: 'src',
  },
};

const DEFAULT_FILENAME: Record<SupportedLanguage, string> = {
  go: 'main.go',
  rust: 'main.rs',
};

/**
 * Manages a temporary filesystem workspace that language servers
 * can operate against. Handles scaffolding, URI mapping, and
 * file syncing.
 */
export class Workspace {
  readonly root: string;
  readonly rootUri: string;
  private language: SupportedLanguage;
  private clientToFile = new Map<string, string>();
  private fileToClient = new Map<string, string>();

  constructor(language: SupportedLanguage) {
    this.language = language;
    this.root = mkdtempSync(join(tmpdir(), `lsp-${language}-`));
    this.rootUri = pathToFileURL(this.root).toString();

    const scaffold = SCAFFOLDING[language];
    if (scaffold.entryDir !== '.') {
      mkdirSync(join(this.root, scaffold.entryDir), { recursive: true });
    }
    for (const [name, content] of Object.entries(scaffold.files)) {
      writeFileSync(join(this.root, name), content, 'utf-8');
    }
  }

  /**
   * Maps a client URI (e.g. inmemory://model/1) to a file:// URI
   * in the temp workspace. Creates the mapping on first encounter.
   */
  mapClientUri(clientUri: string): string {
    if (clientUri.startsWith('file://')) return clientUri;

    const existing = this.clientToFile.get(clientUri);
    if (existing) return existing;

    const scaffold = SCAFFOLDING[this.language];
    const filename = DEFAULT_FILENAME[this.language];
    const filePath = join(this.root, scaffold.entryDir, filename);
    const fileUri = pathToFileURL(filePath).toString();

    this.clientToFile.set(clientUri, fileUri);
    this.fileToClient.set(fileUri, clientUri);
    return fileUri;
  }

  /**
   * Maps a file:// URI back to the client's original URI.
   * Returns the URI unchanged if no mapping exists.
   */
  mapFileUri(fileUri: string): string {
    return this.fileToClient.get(fileUri) ?? fileUri;
  }

  /**
   * Writes content to the file mapped from clientUri.
   */
  writeFile(clientUri: string, content: string): void {
    const fileUri = this.clientToFile.get(clientUri);
    if (!fileUri) return;

    const filePath = new URL(fileUri).pathname;
    writeFileSync(filePath, content, 'utf-8');
  }

  dispose(): void {
    try {
      rmSync(this.root, { recursive: true, force: true });
    } catch {
      // best-effort cleanup
    }
  }
}
