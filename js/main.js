console.log("Creating new phaser game...");

let gameDiv = document.getElementById("game")
gameDiv.style.height = gameDiv.parentNode.height+"px"

let config = {
    type: Phaser.AUTO,
    width: "100",
    height: "100",
    parent: document.getElementById("game"),
    scale: { mode: Phaser.Scale.RESIZE },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload ()
{
}

function create () {
    // Send the server a newplayer event
    Client.askNewPlayer();
}

function update ()
{
}
