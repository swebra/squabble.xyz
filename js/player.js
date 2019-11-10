/*  DEFINE PLAYER TYPE  */
class Player {
    constructor(ID) {
        this.id = ID;
        this.posX = 0;
        this.posY = 0;
        this.lives = 3;
        // Randomly assign color from the colorList
        let colorList = [0xb8312f, 0xd04740, 0xe14937, 0xeb6a56, 0xf37934,
                        0xfba026, 0xfac41c, 0xf6d964, 0x60bc6c, 0x41a85f,
                        0x00a885, 0x1abc9c, 0x54acd2, 0x3d8eb9, 0x2c82c9,
                        0x2969b0, 0x9364b8, 0x553982]; // FIXME: Better spot for this
        this.color = colorList[Math.floor((Math.random() * colorList.length) + 1)];
    }
}

module.exports = Player;
