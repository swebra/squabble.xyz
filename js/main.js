/*  GAME    */

console.log("Creating new phaser game...");

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

let client = new Client();

function main() {
    let game;
    client.receiveId().then(() => {
        console.log("resolved");
        console.log(client.player.id);
        game = new Phaser.Game(config);
    });
}

function preload () {
    this.client = client;
}

function create () {
}

function update () {
    console.log("UPDATE")
    // console.log(this);
    if (this.client.player === null) {
        console.log("it is null")
    }
    console.log(this.client);
    cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown) {
        console.log("Left");
        this.client.player.velX = -3;
    }
    else if (cursors.right.isDown) {
        console.log("Right");
        this.client.player.velX = 3;
    }
    else if (cursors.up.isDown || cursors.space.isDown) {
        console.log("jump");
    } else {
        //console.log("nothing");
        this.client.player.velX = 0;
    }
    this.client.playerUpdate();
}

main();