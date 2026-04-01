/**
 * JSON-RPC message framing for LSP stdio transport.
 * Language servers communicate via Content-Length delimited JSON-RPC messages
 * over stdin/stdout.
 */

export interface JsonRpcMessage {
  jsonrpc: '2.0';
  id?: number | string;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

/**
 * Encodes a JSON-RPC message with Content-Length headers for stdio transport.
 */
export function encode(message: JsonRpcMessage): Buffer {
  const body = JSON.stringify(message);
  const header = `Content-Length: ${Buffer.byteLength(body, 'utf-8')}\r\n\r\n`;
  return Buffer.from(header + body, 'utf-8');
}

/**
 * Streaming parser for Content-Length delimited JSON-RPC messages.
 * Buffers incoming data and emits complete messages.
 */
export class MessageParser {
  private buffer = Buffer.alloc(0);

  parse(chunk: Buffer): JsonRpcMessage[] {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    const messages: JsonRpcMessage[] = [];

    while (true) {
      const headerEnd = this.buffer.indexOf('\r\n\r\n');
      if (headerEnd === -1) break;

      const header = this.buffer.subarray(0, headerEnd).toString('utf-8');
      const match = header.match(/Content-Length:\s*(\d+)/i);
      if (!match) {
        this.buffer = this.buffer.subarray(headerEnd + 4);
        continue;
      }

      const contentLength = parseInt(match[1]!, 10);
      const bodyStart = headerEnd + 4;

      if (this.buffer.length < bodyStart + contentLength) break;

      const body = this.buffer.subarray(bodyStart, bodyStart + contentLength).toString('utf-8');
      this.buffer = this.buffer.subarray(bodyStart + contentLength);

      try {
        messages.push(JSON.parse(body) as JsonRpcMessage);
      } catch {
        // skip malformed messages
      }
    }

    return messages;
  }
}
