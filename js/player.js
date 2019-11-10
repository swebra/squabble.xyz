/*  DEFINE PLAYER TYPE  */
class Player {
    constructor(ID) {
        this.id = ID;
        this.posX = 0;
        this.posY = 0;
        this.velX = 0;
        this.velY = 0;
        this.lives = 3;
    }
}

module.exports = Player;
