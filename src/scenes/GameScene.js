/*
  GameScene.js
  Purpose: Core horizontal runner gameplay — fixed player on X-axis, scrolling background, input handling.
*/

import Phaser from 'phaser';

class GameScene extends Phaser.Scene {

  constructor() {
    super('GameScene');
    this.playerFixedX = 300; // Fixed X position (center-left)
    this.worldSpeed = 150;   // Pixels per second (forward motion)
  }

  create() {
    if (import.meta.env.DEV) console.log('GameScene create() started');
    const { height, width } = this.game.config;
    if (import.meta.env.DEV) console.log('Game dimensions:', width, height);
    
    // --- Add scrolling background (tileSprite for seamless loop) ---
    this.background = this.add.tileSprite(width / 2, height / 2, width, height, 'gameBackground');
    this.background.setOrigin(0.5);
    this.background.setScrollFactor(0); // Fixed to camera
    this.background.setDepth(0);

    // Create the player sprite at FIXED X position
    this.player = this.physics.add.sprite(this.playerFixedX, height - 200, 'player');
    this.player.setScale(0.45);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10); // Above background
    this.player.body.setDrag(0.98); // Smooth deceleration
    
    // Create running animation (12 frames: 0-11)
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 11 }),
      frameRate: 24,
      repeat: -1
    });
    
    // Play the running animation
    this.player.play('run');
    
    // NO horizontal velocity — player is fixed on X axis
    this.player.setVelocityX(0);
    
    // Input for vertical movement
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      s: Phaser.Input.Keyboard.KeyCodes.S
    });

    if (import.meta.env.DEV) console.log('Player created at FIXED X:', this.player.x, 'Y:', this.player.y);
  }

  // update() runs every frame: handles input, locks player X, scrolls background
  update() {
    const { height } = this.game.config;

    // Player movement: UP/DOWN or W/S only (Y-axis)
    if (this.keys.up.isDown || this.keys.w.isDown) {
      this.player.setVelocityY(-250);
    } else if (this.keys.down.isDown || this.keys.s.isDown) {
      this.player.setVelocityY(250);
    } else {
      this.player.setVelocityY(0);
    }

    // Keep player X FIXED (don't let it move horizontally)
    this.player.x = this.playerFixedX;

    // Move background LEFT to simulate forward motion
    this.background.tilePositionX += this.worldSpeed * (1 / 60);

    // Clamp player Y to screen bounds
    if (this.player.y < 0) this.player.y = 0;
    if (this.player.y > height) this.player.y = height;
  }
}

export default GameScene