/*  CLIENT  */
let Client = {};
Client.socket = io.connect();

Client.askNewPlayer = () => {
    // emit a newplayer event
    Client.socket.emit("newplayer");
};
