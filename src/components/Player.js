// src/components/Player.js
import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  // Tunables for an obstacle-clear jump
  static GRAVITY_Y = 1500;     // heavier = less float
  static JUMP_VELOCITY = -840; // jump height
  static JUMP_CUTOFF = 0.5;    // early release keeps ~50% upward speed
  static MAX_FALL = 1200;      // terminal velocity

  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.35).setCollideWorldBounds(true).setDepth(10);

    // Hitbox
    this.body.setSize(this.width * 0.5, this.height * 0.6);
    this.body.setOffset(this.width * 0.25, this.height * 0.2);

    // Physics feel
    this.body.setGravityY(Player.GRAVITY_Y);
    this.body.setMaxVelocity(1000, Player.MAX_FALL);
    this.setBounce(0);

    // Create all animations
    this.createAnimations(scene);
    this.play('run');

    // State
    this._jumpHeld = false;
    this._canJump = false;
    this._currentAnimState = 'run';
  }

  createAnimations(scene) {
    // Running animation
    if (!scene.anims.exists('run')) {
      scene.anims.create({
        key: 'run',
        frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 11 }),
        frameRate: 12,
        repeat: -1
      });
    }

    // Jump start animation (plays once when jumping)
    if (!scene.anims.exists('jumpStart')) {
      scene.anims.create({
        key: 'jumpStart',
        frames: scene.anims.generateFrameNumbers('skullyJumpStart', { start: 0, end: 5 }),
        frameRate: 15,
        repeat: 0
      });
    }

    // In air animation (loops while at peak of jump)
    if (!scene.anims.exists('inAir')) {
      scene.anims.create({
        key: 'inAir',
        frames: scene.anims.generateFrameNumbers('skullyInAir', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
      });
    }

    // Falling animation (loops while falling)
    if (!scene.anims.exists('falling')) {
      scene.anims.create({
        key: 'falling',
        frames: scene.anims.generateFrameNumbers('skullyFalling', { start: 0, end: 5 }),
        frameRate: 12,
        repeat: -1
      });
    }
  }

  // Input API
  pressJump() {
    const body = this.body;
    if (!body) return;
    this._jumpHeld = true;
    if (!this._canJump) return;
    this.setVelocityY(Player.JUMP_VELOCITY);
    this._canJump = false;
  }

  releaseJump() {
    const body = this.body;
    if (!body) return;
    this._jumpHeld = false;
    // Cut ascent for variable height
    if (body.velocity.y < 0) {
      this.setVelocityY(body.velocity.y * Player.JUMP_CUTOFF);
    }
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    
    // Don't update when paused
    if (this.scene.isPaused) return;

    // Clamp fall speed
    if (this.body.velocity.y > Player.MAX_FALL) {
      this.setVelocityY(Player.MAX_FALL);
    }

    // Update animation based on state
    this.updateAnimation();
  }

  updateAnimation() {
    const body = this.body;
    if (!body) return;

    const onGround = body.touching.down || body.blocked.down;
    const vy = body.velocity.y;

    let newState = this._currentAnimState;

    if (onGround) {
      // On ground - play run animation
      newState = 'run';
    } else if (vy < -100) {
      // Moving up quickly - play jump start or inair
      if (this._currentAnimState === 'run' || this._currentAnimState === 'falling') {
        newState = 'jumpStart';
      } else if (this._currentAnimState === 'jumpStart' && this.anims.currentFrame.index === 5) {
        // Jump start finished, transition to inAir
        newState = 'inAir';
      } else if (this._currentAnimState === 'jumpStart') {
        // Still playing jump start
        newState = 'jumpStart';
      } else {
        newState = 'inAir';
      }
    } else if (vy > 100) {
      // Falling down
      newState = 'falling';
    } else {
      // Near peak of jump
      newState = 'inAir';
    }

    // Only play new animation if state changed
    if (newState !== this._currentAnimState) {
      this._currentAnimState = newState;
      this.play(newState);
    }
  }

  markGrounded() {
    const body = this.body;
    if (!body) return;
    if (body.velocity.y >= 0) {
      this._canJump = true;
    }
  }
}
