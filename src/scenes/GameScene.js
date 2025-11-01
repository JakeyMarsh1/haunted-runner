import Phaser from 'phaser';
import MusicManager from '../utils/MusicManager';
import SceneTransition from '../utils/SceneTransition';

class GameScene extends Phaser.Scene {

  constructor() {
    super('GameScene');
  }

  create() {
    this.gameSpeed = 5;
    const { height, width } = this.game.config;

    // Fade in from black
    SceneTransition.setupFadeIn(this, 800);

    // Initialize music manager with game music
    MusicManager.setupMusic(this, 'gameMusic');

    // --- Add the scrolling background ---
    this.gameBackground = this.add.tileSprite(width / 2, height / 2, width * 1.5, height * 1.5, "gameBackground");
    this.gameBackground.setOrigin(0.5, 0.5);
    this.gameBackground.setScale(0.75); // Zoom out to see more of the background
    this.gameBackground.tilePositionY = 55; // Shift the texture up to show different part of image

    // Create visible ground for player to stand on
    const groundY = height + 55; // Ground position
    this.ground = this.add.rectangle(width / 2, groundY, width, 200, 0x1b0e1c, 0.9); // Red with 50% opacity
    this.physics.add.existing(this.ground, true); // true = static body (doesn't move)

    // Create the player sprite
    this.player = this.physics.add.sprite(250 , groundY - 250, 'player');
    this.player.setScale(0.45); // Scale down from 900px to ~405px (3x bigger)
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10); // Make sure player is above background
    
    // Make sure player physics body is active
    this.player.body.setSize(this.player.width * 0.6, this.player.height * 0.7);
    this.player.body.setOffset(this.player.width * 0.2, this.player.height * 0.1);
    
    // Add collision between player and ground
    this.physics.add.collider(this.player, this.ground);
    
    // Create running animation (12 frames: 0-11)
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 11 }),
      frameRate: 12,
      repeat: -1
    });
    
    // Play the running animation
    this.player.play('run');
    
    // Player stays in place - background moves instead
    this.player.setVelocityX(0);
    
    // Setup jump controls
    this.setupJumpControls();
    
    // --- Music Toggle Button ---
    this.musicButton = MusicManager.createMusicButton(this, width - 20, 20);
  }

  setupJumpControls() {
    // Listen for SPACE key press
    this.input.keyboard.on('keydown-SPACE', () => {
      // Check if player is touching the ground (can only jump when on ground)
      if (!this.player.body.touching.down) {
        return; // Player is in air, can't jump again
      }
      
      // Make player jump
      this.player.setVelocityY(-600);
    });
    
    // Also allow clicking/tapping to jump
    this.input.on('pointerdown', (pointer) => {
      // Don't jump if clicking on the music button
      if (this.musicButton.getBounds().contains(pointer.x, pointer.y)) {
        return;
      }
      
      // Check if player is on ground
      if (!this.player.body.touching.down) {
        return;
      }
      
      // Make player jump
      this.player.setVelocityY(-600);
    });
  }

  update(){
    // Scroll the background to create running effect
    this.gameBackground.tilePositionX += this.gameSpeed;
 
  }
}

export default GameScene