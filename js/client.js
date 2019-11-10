/*  CLIENT  */

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
                // RX EVENT - yourid
                this.socket.on("yourid", (data) => {
                    this.player = new Player(data);
                });

                this.socket.on("currentplayers", (data) => {
		    // Just store the list of current players for later. This
		    // will be used after the game object has been initialized.
		    this.currentPlayers = data;
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
            if (this.player.lives <= 0) {
                // I got killed
                        alert("I'm Dead. It was nice meeting you. Don't give up.")
                // TODO prompt user to refresh
            }
	    }

	    this.game.otherPlayers.getChildren().forEach((player) => {
                if (player.id === data.id) {
                    // move and re-render enemy sprite
                    player.setPosition(data.posX, data.posY);

                    // check if enemy got killed
                    if (data.lives <= 0) {
                    // delete enemy sprite
                    //this.game.otherPlayers.remove(player, true);
                    }
                }
            });
        });

        this.socket.on("newplayer", (data) => {
            this.players.push(data);
	    // create sprite for enemy
	    const enemySprite = this.game.add.sprite(data.posX, data.posY,
						     "block");
	    enemySprite.setTint(0xff0000);
	    this.game.physics.add.collider(enemySprite, this.game.platforms);

	    // add an "id" field to the sprite object so that we can tell which
	    // player it is later when we update positions
	    enemySprite.id = data.id;
	    this.game.otherPlayers.add(enemySprite);
        });
    }
}
