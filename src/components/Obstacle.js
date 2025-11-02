/*
  Obstacle.js
  Purpose: Obstacle/hazard component that moves left with the world.
  On collision with player, triggers game over. Recycles when off-screen.
*/

import Phaser from 'phaser';

export default class Obstacle {
  constructor(scene, x, y) {
    // Create a visual obstacle using a circle as placeholder
    // TODO: Replace with pumpkin sprite when asset is ready
    this.sprite = scene.add.circle(x, y, 15, 0xff6600); // Smaller radius for smaller hitbox
    
    // Add physics body for collision detection ONLY
    scene.physics.add.existing(this.sprite);
    this.sprite.body.setImmovable(true);
    this.sprite.body.setAllowGravity(false);
    this.sprite.body.setVelocity(0, 0);
    
    // CRITICAL: Disable physics movement - we move manually
    this.sprite.body.moves = false;

    this.scene = scene;
    this.sprite.setDepth(50);

    if (import.meta.env.DEV) {
      console.log('Obstacle created at:', x, y);
    }
  }

  update(moveDistance) {
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

    // Trigger game over
    this.scene.scene.start('GameOverScene', { score: this.scene.score || 0 });
  }
}
