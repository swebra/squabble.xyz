/*  GAME    */

console.log("Creating new phaser game...");

let config = {
    parent: document.getElementById("game"),
    scale: { mode: Phaser.Scale.RESIZE },
    type: Phaser.AUTO,
    width: "100",
    height: "100",

    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },

    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let client = new Client();
var platforms;

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
    this.load.image('ground', 'assets/platform.png');
    this.load.image('block', 'assets/block.png');
}

function create () {
    // create static group for platforms
    platforms = this.physics.add.staticGroup();

    // create ground
    platforms.create(400, 1000, 'ground').setScale(2).refreshBody();
    platforms.create(1200, 1000, 'ground').setScale(2).refreshBody();
    platforms.create(2000, 1000, 'ground').setScale(2).refreshBody();

    // add platforms
    platforms.create(600, 800, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');


    // create player
    gPlayer = this.physics.add.sprite(100, 950, 'block');
    gPlayer.body.setGravityY(500);
    gPlayer.setCollideWorldBounds(true);

    // add collision listener
    this.physics.add.collider(gPlayer, platforms);

    // setup keyboard collection object
    cursors = this.input.keyboard.createCursorKeys();

    // set physics boundaries
    var globalLevelWidth = 4000;
    var globalLevelHeight = 1000;

    // set the boundaries of our game world
    this.physics.world.bounds.width = globalLevelWidth;
    this.physics.world.bounds.height = globalLevelHeight;

    // set camera properties              roundpx, lerpx, lerpy
    this.cameras.main.startFollow(gPlayer, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, globalLevelWidth, globalLevelHeight);
    this.cameras.main.setDeadzone(50, 50);
    this.cameras.main.setBackgroundColor('#ccccff');
}

function update () {
    // gplayer movement
    if (cursors.left.isDown) {
    // left
        gPlayer.setVelocityX(-500);
    }
    else if (cursors.right.isDown) {
    // right
        gPlayer.setVelocityX(500);
    }
    else if (cursors.down.isDown && !gPlayer.body.touching.down) {
    // groundpound
        gPlayer.setVelocityY(1000);
        gPlayer.setVelocityX(0);
    }
    else {
    // not moving
        gPlayer.setVelocityX(0);
    }
    if (cursors.up.isDown && gPlayer.body.touching.down) {
    // jumping
        gPlayer.setVelocityY(-600);
    }


    // // update server game state
    this.client.player.velX = gPlayer.body.velocity.x;
    this.client.player.velY = gPlayer.body.velocity.y;
    this.client.player.posX = gPlayer.x;
    this.client.player.posY = gPlayer.y;
    this.client.playerUpdate();

    renderEnemy(this.client);
}

function renderEnemy(client) {
    client.players.forEach((enemy) => {
        console.log(enemy);
    });
}

main();
