class Scene2 extends Phaser.Scene{
    constructor() {
        super("playGame");
    }

    create(){
        // this.background = this.add.image(0,0,"background");
        this.background = this.add.tileSprite(0, 0, gameConfig.width, gameConfig.height, "background")
        this.background.setOrigin(0,0);
        // this.background.setScrollFactor(0);

        // this.ship1 = this.add.image(gameConfig.width/2 - 50,gameConfig.height/2,"ship");
        // this.ship2 = this.add.image(gameConfig.width/2,gameConfig.height/2,"ship2");
        // this.ship3 = this.add.image(gameConfig.width/2 + 50, gameConfig.height/2,"ship3");
        this.ship1 = this.add.sprite(gameConfig.width/2 - 50,gameConfig.height/2,"ship");
        this.ship2 = this.add.sprite(gameConfig.width/2,gameConfig.height/2,"ship2");
        this.ship3 = this.add.sprite(gameConfig.width/2 + 50, gameConfig.height/2,"ship3");

        this.enemies = this.physics.add.group();
        this.enemies.add(this.ship1);
        this.enemies.add(this.ship2);
        this.enemies.add(this.ship3);

        this.powerUps = this.physics.add.group();

        var maxObjects = 4;
        for (var i = 0; i <= maxObjects; i++){
            var powerUp = this.physics.add.sprite(16,16,"power-up");
            this.powerUps.add(powerUp);
            powerUp.setRandomPosition(0,0,game.config.width, game.config.height);

            if (Math.random() > 0.5){
                powerUp.play("red");
            }else {
                powerUp.play("gray");
            }

            powerUp.setVelocity(100,100);
            powerUp.setCollideWorldBounds(true);
            powerUp.setBounce(1);
        }

        this.ship1.play("ship1_anim");
        this.ship2.play("ship2_anim");
        this.ship3.play("ship3_anim");

        //Add the player to the physics
        this.player = this.physics.add.sprite(gameConfig.width/2 - 8, gameConfig.height - 64, "player");
        this.player.play("thrust");

        //create cursor keys
        this.cursorKeys = this.input.keyboard.createCursorKeys();

        //Dont let the player to leave the screen
        this.player.setCollideWorldBounds(true);

        //camera follows the player
        // this.cameras.main.startFollow(this.player);

        //fire button define
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.projectiles = this.add.group();

        this.ship1.setInteractive();
        this.ship2.setInteractive();
        this.ship3.setInteractive();

        this.input.on('gameobjectdown', this.destroyShip, this);

        // this.add.text(20,20,"Playing game", {
        //     font: "25px Arial",
        //     fill: "yellow"
        // });

        //graphic object to the score
        var graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 1);
        graphics.beginPath();
        graphics.moveTo(0, 0);
        graphics.lineTo(gameConfig.width, 0);
        graphics.lineTo(gameConfig.width, 20);
        graphics.lineTo(0, 20);
        graphics.lineTo(0, 0);
        graphics.closePath();
        graphics.fillPath();

        this.score = 0;
        this.scoreLabel = this.add.bitmapText(10, 5, "pixelFont", "SCORE", 16);


        //collision between beams and power ups
        this.physics.add.collider(this.projectiles, this.powerUps, function (projectile, powerup) {
            projectile.destroy();
        });

        //overlap player and powerup
        this.physics.add.overlap(this.player, this.powerUps, this.pickPowerUp, null, this);

        //player hit enemy
        this.physics.add.overlap(this.player, this.enemies, this.hurtPlayer, null, this);

        //beam hit enemy
        this.physics.add.overlap(this.projectiles, this.enemies, this.hitEnemy, null, this);
    }

    update(){
        this.moveShip(this.ship1,1);
        this.moveShip(this.ship2,2);
        this.moveShip(this.ship3,3);

        this.background.tilePositionY -= 0.5;

        this.movePlayerManager();

        //event for player shooting, just once per pressing
        if (Phaser.Input.Keyboard.JustDown(this.spacebar)){
            if (this.player.active){
                this.shootBeam();
            }
        }

        for (var i = 0; i < this.projectiles.getChildren().length; i++) {
            var beam = this.projectiles.getChildren()[i];
            beam.update();
        }

    }

    moveShip(ship, speed){
        ship.y += speed;
        if (ship.y > gameConfig.height){
            this.resetShipsPos(ship);
        }
    }

    resetShipsPos(ship){
        ship.y = 0;
        var randomX = Phaser.Math.Between(0, gameConfig.width);
        ship.x = randomX;
    }

    destroyShip(pointer, gameObject){
        gameObject.setTexture("explosion");
        gameObject.play("explode");
    }

    movePlayerManager() {
        if (this.cursorKeys.left.isDown){
            this.player.setVelocityX(-gameSettings.playerSpeed);
        }else if (this.cursorKeys.right.isDown){
            this.player.setVelocityX(gameSettings.playerSpeed);
        }

        if (this.cursorKeys.up.isDown){
            this.player.setVelocityY(-gameSettings.playerSpeed);
        }else if (this.cursorKeys.down.isDown){
            this.player.setVelocityY(gameSettings.playerSpeed);
        }
    }

    shootBeam() {
        var beam = new Beam(this);
    }

    pickPowerUp(player, powerUp) {
        powerUp.disableBody(true, true);
    }

    hurtPlayer(player, enemy) {
        this.resetShipsPos(enemy);
        var explosion = new Explosion(this, player.x, player.y);
        player.disableBody(true,true);
        // this.resetPlayer();

        this.time.addEvent({
            delay: 1000,
            callback: this.resetPlayer,
            callbackScope: this,
            loop: false
        });
    }


    hitEnemy(projectile, enemy) {
        var explosion = new Explosion(this, enemy.x, enemy.y);
        projectile.destroy();
        this.resetShipsPos(enemy);
        this.score += 15;
        var  scoreFormatted = this.zeroPad(this.score, 6);
        this.scoreLabel.text = "SCORE " + scoreFormatted;
    }

    //adding zeros to the beginning of the score
    zeroPad(number, size){
        var stringNumber = String(number);
        while (stringNumber.length < (size || 2)){
            stringNumber = "0" + stringNumber;
        }
        return stringNumber;
    }

    //reset player position
    resetPlayer(){
        var x = gameConfig.width/2 - 8;
        var  y = gameConfig.height + 64;
        this.player.enableBody(true, x, y, true, true);

        //make the player transparent
        this.player.alpha = 0.5;

        //tween adding
        var tween = this.tweens.add({
           targets: this.player,
           y: gameConfig.height - 64,
           ease: 'Power1',
            duration: 1500,
            repeat: 0,
            onComplete: function () {
                this.player.alpha = 1;
            },
            callbackScope: this
        });

    }

}