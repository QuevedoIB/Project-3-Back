class SocketManager {
  constructor(){
  }
  initIO(io){
    this.io=io;
  }

  messageReceived(chatId){
    this.connectToNamespace(chatId);
    this.socket.emit("NEW_MESSAGE");
    console.log('EMITTED MESSAGE');
  }
 
  connectToNamespace (nsp){
    
    this.socket = this.io.of('/'+nsp);
    this.socket.on('connection', (sk) => {
      console.log('user connected')
    });
    return;
  }

  socketConnected(socket){
    this.socket = socket;
  }
}

module.exports = new SocketManager();