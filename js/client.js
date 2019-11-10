/*  CLIENT  */

console.log("New server...")

class Client {
    constructor() {
        this.socket = io.connect();
        this.player = null;
        this.players = [];
    }


    // TX EVENT - newplayer
    askNewPlayer(player) {
        this.socket.emit("newplayer");
    };
    
    // TX EVENT - playerupdate
    playerUpdate(player) {
        this.socket.emit("playerupdate", this.player);
    }
    
    receiveId() {
        return new Promise((resolve, reject) => {
            this.socket.on('connect', () => {
                this.askNewPlayer();
                console.log('Successfully connected!');
                // RX EVENT - yourid
                this.socket.on("yourid", (data) => {
                    console.log(data);
                    this.player = new Player(data);
                    console.log("about to resolve");
                    this.setupEvents();
                    resolve();
                });
            });
        });
    }

    setupEvents() {
        // RX EVENTS

        this.socket.on("updateplayers", (data) => {
            this.players = data;
        });
    }
}
