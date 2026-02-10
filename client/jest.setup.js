const mockAsyncStorage = require('@react-native-async-storage/async-storage/jest/async-storage-mock');

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

class MockWebSocket {
  static OPEN = 1;
  static CLOSED = 3;

  constructor(url) {
    this.url = url;
    this.readyState = MockWebSocket.OPEN;
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this.onclose = null;
  }

  send() {}

  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (typeof this.onclose === 'function') {
      this.onclose();
    }
  }
}

global.WebSocket = MockWebSocket;
