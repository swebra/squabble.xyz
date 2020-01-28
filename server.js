/*  SERVER  */

const Player = require("./js/player");
const Sqlite3 = require("sqlite3");
const DataFile = "./data/topScores.db";

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

        this.server.listen(8081, () => { // Listens to port 80
            console.log('Listening on ' + this.server.address().port);
        });
        this.players = {};
        this.setupEvents();

        this.db = this.openConn();
        this.leaderboard = this.getLeaderBoard();
    }

    /*  EVENTS  */
    setupEvents() {
        this.io.on("connection", (socket) => {
            /*  RX EVENTS  */
            socket.on("newplayer", () => {
                // Create a new "player" object and assign it to the new socket
                // object
                socket.player = new Player(socket.id);
                // update the total list of players
                this.players[socket.id] = socket.player;
                // send the client their ID
                socket.emit("yourplayer", socket.player); // TX

                // send current players to the new player
                socket.emit("currentplayers", Object.values(this.players));

                // tell pre-existing players about new player
                socket.broadcast.emit("newplayer", socket.player);
            });

            socket.on("killplayer",(data) => {
                console.log(data);
        if (!(data.id in this.players)) {
            // player was probably already killed and deleted
            return;
        }
                this.players[data.id].lives -= data.damage;
                this.updatePlayer(socket, this.players[data.id]);
                if(this.players[data.id].lives <= 0) {
                    delete this.players[data.id];
                }
                //Don't update here for performance reasons. Rely on other updatePlayer calls.
            });

            socket.on("disconnect", () => {
                // save player before deleting them?
                let query = "INSERT INTO topPlayers\
                        VALUES (?, ?)";
                this.db.all(query, [socket.player.id, ])
                delete this.players[socket.player.id];
                // Tell other players that this player died
                socket.player.lives = 0;
                this.updatePlayer(socket, socket.player);
            });

            /*  TX EVENTS  */
            socket.on("playerupdate", (data) => {
                // data is an updated player object
        if (!(data.id in this.players)) {
            // return early if player has been deleted or something
            // weird happened
            return;
        }
                this.players[data.id].posX = data.posX;
        this.players[data.id].posY = data.posY;
                this.updatePlayer(socket, this.players[data.id]);
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

    openConn() {
        return new Sqlite3.Database(DataFile, Sqlite3.OPEN_READWRITE, (e) => {
            if (e) { console.log(e.message); };
        });
    }

    getLeaderBoard() {
        // open db to get the top 3 players of all time
        let query = "SELECT *\
                FROM topPlayers t\
                ORDER BY t.pscore DESC\
                LIMIT 3";

        this.db.all(query, [], (e, res) => {
            if (e) {
                console.error("ERROR IN TOP PLAYER QUERY.\t" + e);
                return {};
            }
            // return list of top three players
            console.log(res);
            return res;
        });
    }
}

let main = () => {
    let server = new Server();
};

main();
