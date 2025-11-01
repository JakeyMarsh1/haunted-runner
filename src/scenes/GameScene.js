import Phaser from 'phaser';

class GameScene extends Phaser.Scene {

  constructor() {
    super('GameScene');
  }

  create() {
    console.log('GameScene create() started');
    const { height, width } = this.game.config;
    console.log('Game dimensions:', width, height);
    
    // --- Add the background ---
    const bg = this.add.image(width / 2, height / 2, "gameBackground");
    bg.setOrigin(0.5);
    bg.setDisplaySize(width, height); // Makes it fill the whole screen


    // Create the player sprite
    this.player = this.physics.add.sprite(200, height - 200, 'player');
    this.player.setScale(0.45); // Scale down from 900px to ~405px (3x bigger)
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10); // Make sure player is above background
    
    // Create running animation (12 frames: 0-11)
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 11 }),
      frameRate: 24,
      repeat: -1
    });
    
    // Play the running animation
    this.player.play('run');
    
    // Set horizontal velocity to make it run
    this.player.setVelocityX(200);
    
    // Debug: log player position and visibility
    console.log('Player created at:', this.player.x, this.player.y);
    console.log('Player velocity:', this.player.body.velocity.x, this.player.body.velocity.y);
    console.log('Player body:', this.player.body);
  }

  update(){
    // Wrap around screen when player goes off the right edge
    if (this.player.x > this.game.config.width) {
      this.player.x = -this.player.width;
    }
  }
}

export default GameScene