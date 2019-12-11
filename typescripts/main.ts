/// <reference path="phaser.d.ts"/>

var config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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

var game = new Phaser.Game(config);

var score = 0;
var scoreText;
var platforms;
var player;
var stars;
var bombs;
var cursors;
var gameOver;
var movingPlatforms;

function preload(){
    this.load.image('sky', 'images/sky.png');
    this.load.image('base', 'images/bottom_platform.png');
    this.load.image('ground', 'images/platform.png');
    this.load.image('star', 'images/star.png');
    this.load.image('bomb', 'images/bomb.png');
    this.load.spritesheet('dude', 'images/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create(){
    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'base').setScale(2).refreshBody();

    platforms.create(100, 330, 'ground');
    platforms.create(750, 310, 'ground');
    platforms.create(420, 230, 'ground');
    platforms.create(30, 180, 'ground');
    platforms.create(620, 120, 'ground');

    movingPlatforms = this.physics.add.image(450, 430, 'ground');

    movingPlatforms.setImmovable(true);
    movingPlatforms.body.allowGravity = false;
    movingPlatforms.setVelocityX(50);


    player = this.physics.add.sprite(100, 450, 'dude');

    player.setBounce(0);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
    
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(player, movingPlatforms);

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 },
    });

    stars.children.iterate(function (child) {
    
        child.setBounceY(Phaser.Math.FloatBetween(0.1, 0.4));
    
    });

    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(stars, movingPlatforms);

    this.physics.add.overlap(player, stars, collectStar, null, this);

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

    bombs = this.physics.add.group();

    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(bombs, movingPlatforms);

    this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update(){
    cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown)
    {
        player.setVelocityX(-150);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(150);

        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-305);
    }

    if (movingPlatforms.x >= 550)
    {
        movingPlatforms.setVelocityX(-50)
    }
    else if(movingPlatforms.x <= 300)
    {
        movingPlatforms.setVelocityX(50);
    }
}

function collectStar (player, star)
{
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0)
    {
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

    }
}

function hitBomb (player, bomb)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;

    if(gameOver == true){
        alert("Congratulations on getting a score of " + score + "!" + "\nRefresh the page and try and beat it!");
    }
}