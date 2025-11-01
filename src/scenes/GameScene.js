import Phaser from 'phaser';
import MusicManager from '../utils/MusicManager';

class GameScene extends Phaser.Scene {

  constructor() {
    super('GameScene');
  }

  create() {
    this.gameSpeed = 2;
    const { height, width } = this.game.config;

    // Initialize music manager with game music
    MusicManager.setupMusic(this, 'gameMusic');

    // --- Add the scrolling background ---
    this.gameBackground = this.add.tileSprite(width / 2, height / 2, width * 1.5, height * 1.5, "gameBackground");
    this.gameBackground.setOrigin(0.5, 0.5);
    this.gameBackground.setScale(0.75); // Zoom out to see more of the background
    this.gameBackground.tilePositionY = 55; // Shift the texture up to show different part of image
    

    // Create the player sprite
    this.player = this.physics.add.sprite(200, height - 200, 'player');
    this.player.setScale(0.45); // Scale down from 900px to ~405px (3x bigger)
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10); // Make sure player is above background
    
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
    
    // --- Music Toggle Button ---
    this.musicButton = MusicManager.createMusicButton(this, width - 20, 20);
  }
  update(){
    // Scroll the background to create running effect
    this.gameBackground.tilePositionX += this.gameSpeed;
  }
}

export default GameScene