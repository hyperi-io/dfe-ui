/**
 * WebSocket-based LSP client implementing the Language Server Protocol
 * JSON-RPC transport layer.
 */

type RequestId = number;
type NotificationHandler = (params: unknown) => void;

interface PendingRequest {
  resolve: (result: unknown) => void;
  reject: (error: Error) => void;
}

export class LspClient {
  private ws: WebSocket | null = null;
  private requestId = 0;
  private pending = new Map<RequestId, PendingRequest>();
  private notificationHandlers = new Map<string, NotificationHandler>();
  private url: string;
  private disposed = false;

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.disposed) {
        reject(new Error('Client is disposed'));
        return;
      }

      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => resolve();
      this.ws.onerror = () => reject(new Error(`Failed to connect to ${this.url}`));

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data as string);
          this.handleMessage(message);
        } catch {
          // ignore malformed messages
        }
      };

      this.ws.onclose = () => {
        this.rejectAllPending();
      };
    });
  }

  onNotification(method: string, handler: NotificationHandler): void {
    this.notificationHandlers.set(method, handler);
  }

  async request<T>(method: string, params: unknown): Promise<T> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected');
    }

    const id = ++this.requestId;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, {
        resolve: resolve as (result: unknown) => void,
        reject,
      });
      this.ws!.send(JSON.stringify({ jsonrpc: '2.0', id, method, params }));
    });
  }

  notify(method: string, params: unknown): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ jsonrpc: '2.0', method, params }));
  }

  dispose(): void {
    this.disposed = true;
    this.resolveAllPending();
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this.notificationHandlers.clear();
  }

  private handleMessage(message: {
    id?: RequestId;
    method?: string;
    params?: unknown;
    result?: unknown;
    error?: { code: number; message: string };
  }): void {
    if (message.id != null && this.pending.has(message.id)) {
      const pending = this.pending.get(message.id)!;
      this.pending.delete(message.id);
      if (message.error) {
        pending.reject(new Error(message.error.message));
      } else {
        pending.resolve(message.result);
      }
    } else if (message.method) {
      const handler = this.notificationHandlers.get(message.method);
      handler?.(message.params);
    }
  }

  private resolveAllPending(): void {
    for (const pending of this.pending.values()) {
      pending.resolve(undefined);
    }
    this.pending.clear();
  }

  private rejectAllPending(): void {
    for (const pending of this.pending.values()) {
      pending.reject(new Error('Connection closed'));
    }
    this.pending.clear();
  }
}
