/*
  Obstacle.js
  Purpose: Obstacle/hazard component that moves left with the world.
  On collision with player, triggers game over. Recycles when off-screen.
*/

import Phaser from 'phaser';

export default class Obstacle {
  constructor(scene, x, y) {
    // Create zombie hand sprite with animation
    this.sprite = scene.add.sprite(x, y - 25, 'zombieHand', 0);
    this.sprite.setScale(3); // Slightly larger
    
    // Randomly mirror the sprite
    if (Math.random() > 0.5) {
      this.sprite.setFlipX(true);
    }
    
    // Add physics body for collision detection
    scene.physics.add.existing(this.sprite);
    this.sprite.body.setImmovable(true);
    this.sprite.body.setAllowGravity(false);
    this.sprite.body.setVelocity(0, 0);
    
    // Reduce hitbox to match image size
    this.sprite.body.setSize(2, 4); // Ultra-thin hitbox
    
    // Disable physics movement - we move manually
    this.sprite.body.moves = false;

    this.scene = scene;
    this.sprite.setDepth(99);
    
    // Play animation if it exists
    if (scene.anims.exists('zombieHandAnim')) {
      this.sprite.play('zombieHandAnim');
      this.scene.sound.play('typeSound1');
    }

    if (import.meta.env.DEV) {
      console.log('Obstacle (Zombie Hand) created at:', x, y);
    }
  }  update(moveDistance) {
    // Don't update when paused
    if (this.scene.isPaused) return;
    
    // Move LEFT 
    this.sprite.x -= moveDistance;
    this.sprite.body.updateFromGameObject();

    // Remove if off-screen
    if (this.sprite.x < -50) {
      this.sprite.destroy();
    }
  }

  // Called when player collides with obstacle
  onCollide(player) {
    if (import.meta.env.DEV) {
      console.log('Obstacle collision with player!');
    }

    // Only trigger death once
    if (player.isDead()) return;

    // Play death animation on player
    player.playDeath();

    // Pause game movement
    this.scene.isPaused = true;

    // Wait for death animation to complete (~1 second), then transition to GameOver
    this.scene.time.delayedCall(1000, () => {
      this.scene.scene.start('GameOverScene', { 
        score: this.scene.score || 0,
        jumpscareEnabled: this.scene.jumpscareEnabled,
        musicEnabled: this.scene.musicEnabled
      });
    });
  }
}
