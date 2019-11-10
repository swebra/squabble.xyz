/*  GAME    */

// config spec
let config = {
    parent: document.getElementById("game"),
    scale: { mode: Phaser.Scale.RESIZE },
    type: Phaser.AUTO,
    width: "100",
    height: "100",
    // adding physics into scene
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    // specify functions
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
}


// setting global variables
let score = 0;
let scoreText;
let livesText;
// set physics boundaries
let levelWidth = 2000;
let levelHeight = 2000;

function create () {

    // set score and lives
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    scoreText.setScrollFactor(0);
    livesText = this.add.text(300, 16, 'Lives: 0', { fontSize: '32px', fill: '#000' });
    livesText.setScrollFactor(0);

    // set the boundaries of our game world
    this.physics.world.bounds.width = levelWidth;
    this.physics.world.bounds.height = levelHeight;

    // create other players and set collision stuff
    this.otherPlayers = this.physics.add.group();

    // instanciate client
    this.client = client;

    // create platforms
    createLevel(this);

    // create player
    this.playerSize = 50; // In px
    const playerRect = this.add.rectangle(Math.floor(Math.random()*levelWidth), levelHeight - 50, this.playerSize,
                                          this.playerSize, this.client.player.color);
    this.gPlayer = this.physics.add.existing(playerRect);
    this.gPlayer.body.setGravityY(1000);
    this.gPlayer.body.setCollideWorldBounds(true);

    // add collision listener for player and platforms
    this.physics.add.collider(this.gPlayer, this.platforms);

    // create other players and set collision stuff
    this.otherPlayers = this.physics.add.group();
    this.client.tmpPlayers.forEach((player) => {
    if (this.client.player.id != player.id) {
        addEnemy(this, player);
    }
    });
    // idk why this need to be here
    this.client.game = this;
    this.client.setupEvents();

    // setup keyboard collection object
    cursors = this.input.keyboard.createCursorKeys();

    // set camera properties              roundpx, lerpx, lerpy
    this.cameras.main.startFollow(this.gPlayer, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, levelWidth, levelHeight);
    this.cameras.main.setDeadzone(50, 50);
    this.cameras.main.setBackgroundColor('#ccccff');
}

// function to create platforms
function createLevel(game) {
    let platformColor = 0x6666ff;
    game.platforms = game.physics.add.staticGroup();
    // ground
    game.platforms.add(game.add.rectangle(1000, levelHeight-10, 2000, 20, platformColor));
    for (let i = 0; i < 5; i++) {
        // add platforms                       x    y    w   h
        for (let j = 0; j < 4; j++) {
            let px = 400*i + 100 + Math.floor(Math.random()*200);
            let py = levelHeight - 250 - 200*j;
            let pw = Math.floor(Math.random(300)*100 + 150);
            game.platforms.add(game.add.rectangle(px, py,pw , 30, platformColor));
        }
    }
}

function update () {
    // update lives text
    livesText.setText("Lives: " + this.client.player.lives);

    // gplayer movement
    if (cursors.left.isDown) {
    // left
        this.gPlayer.body.setVelocityX(-500);
    }
    else if (cursors.right.isDown) {
    // right
        this.gPlayer.body.setVelocityX(500);
    }
    else if (cursors.down.isDown && !this.gPlayer.body.touching.down) {
    // groundpound
        this.gPlayer.body.setVelocityY(1000);
        this.gPlayer.body.setVelocityX(0);
    }
    else {
    // not moving
        this.gPlayer.body.setVelocityX(0);
    }
    if (cursors.up.isDown && this.gPlayer.body.touching.down) {
    // jumping
        this.gPlayer.body.setVelocityY(-400 - 100*score);
    }

        // emit player movement
    var x = this.gPlayer.x;
    var y = this.gPlayer.y;
    // check if position changed and only update if different
    if (this.gPlayer.oldPosition && (x !== this.gPlayer.oldPosition.x || y !== this.gPlayer.oldPosition.y)) {
        // // update server game state
        this.client.player.posX = this.gPlayer.x;
        this.client.player.posY = this.gPlayer.y;
        this.client.playerUpdate();
    }
    // save old position data
    this.gPlayer.oldPosition = {
      x: this.gPlayer.x,
      y: this.gPlayer.y,
    };

}

function addEnemy(game, enemy) {
    // create rectangle for enemy
    const enemyRect = game.add.rectangle(enemy.posX, enemy.posY, game.playerSize,
                                         game.playerSize, enemy.color);
    game.physics.add.collider(enemyRect, game.platforms);
    enemyRect.killable = false;
    setTimeout(() => { enemyRect.killable = true; }, 1000);
    game.physics.add.collider(enemyRect, game.platforms);

    // add an "id" field to the rectangle object so that we can tell which player
    // it is later when we update positions
    enemyRect.id = enemy.id;
    game.otherPlayers.add(enemyRect);

    // add killing ability collider
    game.physics.add.overlap(game.gPlayer, game.otherPlayers, playerKill, null, game);
};

function playerKill(gPlayer, otherPlayer) {
    // TODO: May need to be modified with new rectangle change
    if (otherPlayer.killable && gPlayer.y + gPlayer.height < otherPlayer.y) {// this double checks that the collision occurs on top
        console.log("kill");
        score++;
        scoreText.setText("Score: " + score);
        otherPlayer.killable = false;
        // 1 second delay before you can kill again
        setTimeout(() => { console.log("ready"); otherPlayer.killable = true; }, 1000);
        console.log("Player Collision");
        gPlayer.body.setVelocityY(0);
        // otherPlayer.disableBody(true, true);
        // do 1 damage
        client.killPlayer(otherPlayer.id, 1);
    }
}

main();
