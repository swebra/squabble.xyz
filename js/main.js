/*  GAME    */

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
//let game;

function main() {
    client.receiveId().then(() => {
        game = new Phaser.Game(config);
	// TODO refactor this
	//game.addEnemy = addEnemy;

	// give client a reference to game
	//client.game = game;
    });
}

function preload () {
    this.load.image('ground', 'assets/platform.png');
    this.load.image('block', 'assets/block.png');
}

function create () {
    // create other players and set collision stuff
    this.otherPlayers = this.physics.add.group();

    this.client = client;
    // create static group for platforms
    this.platforms = this.physics.add.staticGroup();

    // create ground
    this.platforms.create(400, 1000, 'ground').setScale(2).refreshBody();
    this.platforms.create(1200, 1000, 'ground').setScale(2).refreshBody();
    this.platforms.create(2000, 1000, 'ground').setScale(2).refreshBody();

    // add platforms
    this.platforms.create(600, 800, 'ground');
    this.platforms.create(50, 250, 'ground');
    this.platforms.create(750, 220, 'ground');


    // create player
    this.gPlayer = this.physics.add.sprite(100, 950, 'block');
    this.gPlayer.body.setGravityY(500);
    this.gPlayer.setCollideWorldBounds(true);

    // add collision listener
    this.physics.add.collider(this.gPlayer, this.platforms);

    // create other players and set collision stuff
    this.otherPlayers = this.physics.add.group();
    this.client.currentPlayers.forEach((player) => {
	if (this.client.player.id != player.id) {
	    addEnemy(this, player);
	}
    });
    // idk why this need to be here
    this.client.game = this;
    this.client.setupEvents();

    // setup keyboard collection object
    cursors = this.input.keyboard.createCursorKeys();

    // set physics boundaries
    var globalLevelWidth = 4000;
    var globalLevelHeight = 1000;

    // set the boundaries of our game world
    this.physics.world.bounds.width = globalLevelWidth;
    this.physics.world.bounds.height = globalLevelHeight;

    // set camera properties              roundpx, lerpx, lerpy
    this.cameras.main.startFollow(this.gPlayer, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, globalLevelWidth, globalLevelHeight);
    this.cameras.main.setDeadzone(50, 50);
    this.cameras.main.setBackgroundColor('#ccccff');
}

function update () {
    // gplayer movement
    if (cursors.left.isDown) {
	// left
        this.gPlayer.setVelocityX(-500);
    }
    else if (cursors.right.isDown) {
    // right
        this.gPlayer.setVelocityX(500);
    }
    else if (cursors.down.isDown && !this.gPlayer.body.touching.down) {
    // groundpound
        this.gPlayer.setVelocityY(1000);
        this.gPlayer.setVelocityX(0);
    }
    else {
    // not moving
        this.gPlayer.setVelocityX(0);
    }
    if (cursors.up.isDown && this.gPlayer.body.touching.down) {
    // jumping
        this.gPlayer.setVelocityY(-600);
    }


    // // update server game state
    this.client.player.velX = this.gPlayer.body.velocity.x;
    this.client.player.velY = this.gPlayer.body.velocity.y;
    this.client.player.posX = this.gPlayer.x;
    this.client.player.posY = this.gPlayer.y;
    this.client.playerUpdate();
}

function addEnemy(game, enemy) {
    // create sprite for enemy
    const enemySprite = game.add.sprite(enemy.posX, enemy.posY,
					"block");
    enemySprite.setTint(0xff0000);
    game.physics.add.collider(enemySprite, game.platforms);

    // add an "id" field to the sprite object so that we can tell which player
    // it is later when we update positions
    enemySprite.id = enemy.id;
    game.otherPlayers.add(enemySprite);
};

main();
