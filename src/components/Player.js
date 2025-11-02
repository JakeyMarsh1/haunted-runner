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

    if (!scene.anims.exists('run')) {
      scene.anims.create({
        key: 'run',
        frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 11 }),
        frameRate: 12,
        repeat: -1
      });
    }
    this.play('run');

    // State
    this._jumpHeld = false;
    this._canJump = false;
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

    // Clamp fall speed
    if (this.body.velocity.y > Player.MAX_FALL) {
      this.setVelocityY(Player.MAX_FALL);
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
