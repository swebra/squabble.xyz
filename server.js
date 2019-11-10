/*  SERVER  */

const Player = require("./js/player")

class Server {

    constructor() {
        this.express = require('express');
        this.app = this.express();
        this.server = require('http').Server(this.app);
        this.io = require('socket.io').listen(this.server);
        this.app.use('/css', this.express.static(__dirname + '/css'));
        this.app.use('/js', this.express.static(__dirname + '/js'));
        this.app.use('/node_modules', this.express.static(__dirname + '/node_modules'));
        this.app.use('/assets', this.express.static(__dirname + '/assets'));
        this.app.get('/', (req, res) => {
            res.sendFile(__dirname+'/index.html');
        });

        this.server.listen(80, () => { // Listens to port 8081
            console.log('Listening on ' + this.server.address().port);
        });
        this.lastPlayerID = 0;
        this.players = {};
        this.setupEvents();
    }

    /*  EVENTS  */
    setupEvents() {
        this.io.on("connection", (socket) => {
            /*  RX EVENTS  */
            socket.on("newplayer", () => {
                // Create a new "player" object and assign it to the new socket
                // object
                socket.player = new Player(this.lastPlayerID++);
                // update the total list of players
                this.players[socket.player.id] = socket.player;
                // send the client their ID
                socket.emit("yourid", socket.player.id); // TX

		// send current players to the new player
		socket.emit("currentplayers", Object.values(this.players));

		// tell pre-existing players about new player
		socket.broadcast.emit("newplayer", socket.player);
            });

            socket.on("killplayer",(data) => {
                this.players[data.id].lives -= data.damage;
                this.updatePlayer(socket, this.players[data.id]);
                if(this.players[data.id].lives <= 0) {
                    delete this.players[data.id];
                }
                //Don't update here for performance reasons. Rely on other updatePlayer calls.
            });

            socket.on("disconnect", () => {
                delete this.players[socket.player.id];
		// Tell other players that this player died
		socket.player.lives = 0;
                this.updatePlayer(socket, socket.player);
            });

            /*  TX EVENTS  */
            socket.on("playerupdate", (data) => {
                // data is an updated player object
                this.players[data.id] = data;
                this.updatePlayer(socket, data);
            });

        });
    }

    /**
     * Tells everyone that a player was updated either in position or lives.
     */
    updatePlayer(socket, player) {
        socket.emit("updateplayer", player);
        socket.broadcast.emit("updateplayer", player);
    }


}

let main = () => {
    let server = new Server();
};

main();
