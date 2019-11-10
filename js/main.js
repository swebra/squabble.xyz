console.log("Creating new phaser game...");

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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

function update () {
    cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown) {
        console.log("Left");
    }
    else if (cursors.right.isDown) {
        console.log("Right");
    }
    else if (cursors.up.isDown || cursors.space.isDown){
        console.log("jump");
    } else {
        console.log("nothing");
    }
}
