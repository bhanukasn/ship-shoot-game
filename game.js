// window.onload = function () {
    var gameConfig = {
        width: 256,
        height:272,
        backgroundColor: 0x1b0040,
        scene: [Scene1,Scene2],
        pixelArt: true,
        physics: {
            default: "arcade",
            arcade:{
                debug: false
            }
        }
    }

    var gameSettings = {
        playerSpeed: 200,
    }

    var game = new Phaser.Game(gameConfig);
// }