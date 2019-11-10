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

                this.updatePlayers(socket);

                console.log(this.players);
            });

            /*  TX EVENTS  */
            socket.on("playerupdate", (data) => {
                // data is an updated player object
                this.players[data.id] = data;
                console.log(this.players[data.id])
                this.updatePlayers(socket);
            });

        });
    }

    updatePlayers(socket) {
        // send array of players to current socket
        socket.emit("updateplayers", Object.values(this.players));
        // send to all sockets except current socket
        socket.broadcast.emit("updateplayers", Object.values(this.players));
    }
}

let main = () => {
    let server = new Server();
}

main();
