import WebSocket from 'ws';

export function sendJsonIfOpen(ws: WebSocket, json: string): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(json);
  }
}

export function closeIfOpen(ws: WebSocket, code: number, reason: string): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.close(code, reason);
  }
}
