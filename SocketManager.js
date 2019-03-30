class SocketManager {
  initIO (io) {
    this.io = io;
  }

  messageReceived (chatId) {
    this.connectToNamespace(chatId);
    this.socket.emit('NEW_MESSAGE');
  }

  connectToNamespace (nsp) {
    this.socket = this.io.of('/' + nsp);
    this.socket.on('connection', (sk) => {
    });
  }

  socketConnected (socket) {
    this.socket = socket;
  }
}

module.exports = new SocketManager();
