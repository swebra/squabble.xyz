/*  CLIENT  */

class Client {
    constructor() {
        this.socket = io.connect();
        this.player = null;
    }


    askNewPlayer(player) {
        this.socket.emit("newplayer");
    };
    
    playerUpdate(player) {
        this.socket.emit("playerupdate", this.player);
    }
    
    receiveId() {
        return new Promise((resolve, reject) => {
            this.socket.on('connect', () => {
                this.askNewPlayer();
                console.log('Successfully connected!');
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
        this.socket.on("recieveplayers", (data) => {
            console.log("recieving players");
        });
    }
}
