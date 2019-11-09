let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io').listen(server);

// Store and increment the player id each time a new player adds
let lastPlayerID = 0;

app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/node_modules',express.static(__dirname + '/node_modules'));
app.use('/assets',express.static(__dirname + '/assets'));

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

server.listen(8081,function(){ // Listens to port 8081
    console.log('Listening on '+server.address().port);
});

function getAllPlayers() {
    let players = [];
    // Go through all open sockets and get the "player" object
    Object.keys(io.sockets.connected).forEach((socketID) => {
        let player = io.sockets.connected[socketID].player;
        if (player) players.push(player);
    });
    return players;
}

function main() {
    io.on("connection", (socket) => {
        socket.on("newplayer", () => {
            // Create a new "player" object and assign it to the new socket
            // object
            socket.player = {
                id: lastPlayerID++,
            };
            // Tell the new player about the other players
            socket.emit("allplayers", getAllPlayers());
            // Tells existing players that there is a new player
            socket.broadcast.emit("newplayer", socket.player);
            console.log(getAllPlayers());
        });
    });
}

main();
