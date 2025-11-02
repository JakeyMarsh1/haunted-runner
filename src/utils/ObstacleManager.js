import Phaser from 'phaser';
import Obstacle from '../components/Obstacle.js';

export default class ObstacleManager {
  constructor(scene, {
    speedMultiplier = 0.9,
    intervalMs = [2200, 3600],
    floorYOffset = 112,
    intervalProvider = null,
  } = {}) {
    this.scene = scene;
    this.speedMultiplier = speedMultiplier;
    this.intervalMin = intervalMs[0];
    this.intervalMax = intervalMs[1];
    this.floorYOffset = floorYOffset;
    this.intervalProvider = intervalProvider;

    this.obstacles = [];
    this.elapsed = 0;
    this.nextSpawnIn = this.#rngInterval(0);
  }

  reset() {
    this.obstacles.forEach(o => o?.sprite?.destroy());
    this.obstacles.length = 0;
    this.elapsed = 0;
    this.nextSpawnIn = this.#rngInterval(0);
  }

  update(deltaMs, baseSpeed, player, score = 0) {
    this.elapsed += deltaMs;

    if (this.elapsed >= this.nextSpawnIn) {
      this.spawn();
      this.elapsed = 0;
      this.nextSpawnIn = this.#rngInterval(score);
    }

    // Move obstacles faster as baseSpeed rises
    const move = baseSpeed * this.speedMultiplier;

    this.obstacles = this.obstacles.filter((ob) => {
      ob.update(move);

      if (this.scene.physics.overlap(player, ob.sprite)) {
        ob.onCollide(player);
        return false;
      }

      return ob.sprite?.active;
    });
  }

  spawn() {
    const { width: W, height: H } = this.scene.scale;
    const FLOOR_Y = H - this.floorYOffset;
    const obstacle = new Obstacle(this.scene, W + 50, FLOOR_Y);
    this.obstacles.push(obstacle);
    if (import.meta.env.DEV) console.log('[ObstacleManager] spawn @', FLOOR_Y);
  }

  pause() { this.obstacles.forEach(o => o.sprite?.anims?.pause()); }
  resume() { this.obstacles.forEach(o => o.sprite?.anims?.resume()); }

  #rngInterval(score = 0) {
    let min = this.intervalMin;
    let max = this.intervalMax;

    if (typeof this.intervalProvider === 'function') {
      const range = this.intervalProvider(score);
      if (Array.isArray(range) && range.length === 2) {
        min = Math.max(250, Math.min(range[0], range[1]));
        max = Math.max(min + 1, Math.max(range[0], range[1]));
      }
    }

    return Phaser.Math.Between(min, max);
  }
}
