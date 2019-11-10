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

        this.server.listen(8081, () => { // Listens to port 8081
            console.log('Listening on ' + this.server.address().port);
        });
        this.lastPlayerID = 0;
        this.players = [];
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
                this.players.push(socket.player);
                // send the client their ID
                socket.emit("yourid", socket.player.id);
                // Tell the new player about the other players
                socket.emit("allplayers", this.players);
                // Tells existing players that there is a new player
                socket.broadcast.emit("newplayer", socket.player);
                console.log(this.players);
            });

            /*  TX EVENTS  */

        });
    }
}

let main = () => {
    let server = new Server();
}

main();
