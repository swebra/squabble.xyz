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

    killPlayer(id, damage) {
        // This has not been tested!
        this.socket.emit("killplayer", {"id": id, "damage": damage});
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
                });

                this.socket.on("currentplayers", (data) => {
                    this.players = data;
                    resolve();
                });
            });
        });
    }



    setupEvents() {
        // RX EVENTS

        this.socket.on("updateplayer", (data) => {
	    // data is an updated player object

	    // update my own lives
	    if (this.player.id === data.id) {
		this.player.lives = data.lives;
	    }
            for(let i = 0; i < this.players.length; ++i) {
                if (data.id === this.players[i].id) {
		    this.players[i] = data;
		    // check if a player got killed
		    if (data.lives <= 0) {
			if (this.players[i].id === this.player.id) {
			    // I got killed
                            alert("I'm Dead. It was nice meeting you. Don't give up.")
			} else {
			    // Someone else got killed
			    delete this.players[i];
			}
		    }
                }
            }
        });

        this.socket.on("newplayer", (data) => {
	    console.log("got new player");
            this.players.push(data);
        });
    }
}
