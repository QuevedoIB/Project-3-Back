class SocketManager {
  constructor () {
  }
  initIO (io) {
    this.io = io;
  }

  messageReceived (chatId) {
    this.connectToNamespace(chatId);
    this.socket.emit('NEW_MESSAGE');
  }

  enableImagesRequest (chatId) {
    this.connectToNamespace(chatId);
    this.socket.emit('ENABLE-IMAGES');
  }

  onTyping (chatId, userTypingId) {
    console.log('AAAAAAAAAAAAAAAAAA', chatId, userTypingId);
    this.connectToNamespace(chatId);
    this.socket.emit('TYPING', { userTypingId });
  }

  // onStopTyping (chatId) {
  //   this.connectToNamespace(chatId);
  //   this.socket.emit('STOP_TYPING');
  // }

  connectToNamespace (nsp) {
    this.socket = this.io.of('/' + nsp);
    this.socket.on('connection', (sk) => {
      console.log('User connected');
    });
  }

  socketConnected (socket) {
    this.socket = socket;
  }
}

module.exports = new SocketManager();
