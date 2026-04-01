import { type ChildProcess, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { type JsonRpcMessage, MessageParser, encode } from './jsonrpc.js';

export type SupportedLanguage = 'rust' | 'go';

interface LanguageServerConfig {
  command: string;
  args: string[];
}

const LANGUAGE_SERVER_CONFIG: Record<SupportedLanguage, LanguageServerConfig> = {
  rust: { command: 'rust-analyzer', args: [] },
  go: { command: 'gopls', args: ['serve'] },
};

/**
 * Builds a PATH that includes common language toolchain bin directories
 * so spawned language servers can be found even when the parent shell
 * doesn't have them on PATH.
 */
function buildPath(): string {
  const home = homedir();
  const extra = [
    join(home, 'go', 'bin'),
    join(home, '.cargo', 'bin'),
    join(home, '.local', 'bin'),
    '/usr/local/go/bin',
  ].filter((p) => existsSync(p));
  return [...extra, process.env.PATH ?? ''].join(':');
}

export function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return lang in LANGUAGE_SERVER_CONFIG;
}

/**
 * Manages a language server child process, bridging JSON-RPC messages
 * between a callback-based interface and the process's stdio.
 */
export class LanguageServerProcess {
  private process: ChildProcess | null = null;
  private parser = new MessageParser();
  private onMessage: (msg: JsonRpcMessage) => void;
  private onClose: () => void;
  private language: SupportedLanguage;
  private cwd: string;

  constructor(
    language: SupportedLanguage,
    cwd: string,
    onMessage: (msg: JsonRpcMessage) => void,
    onClose: () => void,
  ) {
    this.language = language;
    this.cwd = cwd;
    this.onMessage = onMessage;
    this.onClose = onClose;
  }

  start(): void {
    const config = LANGUAGE_SERVER_CONFIG[this.language];
    this.process = spawn(config.command, config.args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: this.cwd,
      env: { ...process.env, PATH: buildPath() },
    });

    this.process.stdout?.on('data', (chunk: Buffer) => {
      for (const msg of this.parser.parse(chunk)) {
        this.onMessage(msg);
      }
    });

    this.process.stderr?.on('data', (chunk: Buffer) => {
      console.error(`[${this.language}] ${chunk.toString('utf-8').trimEnd()}`);
    });

    this.process.on('error', (err) => {
      console.error(`[${this.language}] Failed to start: ${err.message}`);
      this.onClose();
    });

    this.process.on('exit', (code) => {
      console.log(`[${this.language}] Process exited with code ${code}`);
      this.onClose();
    });
  }

  send(message: JsonRpcMessage): void {
    if (!this.process?.stdin?.writable) return;
    this.process.stdin.write(encode(message));
  }

  kill(): void {
    if (this.process && !this.process.killed) {
      this.process.kill('SIGTERM');
      this.process = null;
    }
  }
}
