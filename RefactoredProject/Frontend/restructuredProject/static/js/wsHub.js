// js/wsHub.js
export class WsHub extends EventTarget {
  constructor(url) {
    super();
    this.url = url;
    this.ws = null;
    this.backoffMs = 500;
    this.maxBackoffMs = 5000;
    this.connect();
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);
    } catch (e) {
      this._scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.backoffMs = 500;
      this.dispatchEvent(new Event("ws:open"));
    };

    this.ws.onclose = () => {
      this.dispatchEvent(new Event("ws:close"));
      this._scheduleReconnect();
    };

    this.ws.onerror = () => {
      // onclose kommt meist danach
      this.dispatchEvent(new Event("ws:error"));
    };

    this.ws.onmessage = (e) => {
      let msg;
      try { msg = JSON.parse(e.data); } catch { return; }

      // Erwartetes Format:
      // { "type": "sensor:update", "payload": {...} }
      if (!msg?.type) return;

      this.dispatchEvent(new CustomEvent(msg.type, { detail: msg.payload }));
    };
  }

  _scheduleReconnect() {
    setTimeout(() => this.connect(), this.backoffMs);
    this.backoffMs = Math.min(this.backoffMs * 1.5, this.maxBackoffMs);
  }

  send(type, payload = {}) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
    this.ws.send(JSON.stringify({ type, payload }));
    return true;
  }
}
