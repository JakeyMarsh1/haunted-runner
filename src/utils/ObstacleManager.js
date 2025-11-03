import Phaser from 'phaser';
import Obstacle from '../components/Obstacle.js';

export default class ObstacleManager {
  constructor(scene, {
    speedMultiplier = 1,
    intervalMs = [2200, 3600],
    floorYOffset = 112,
    intervalProvider = null,
    intervalFloor = 500,
    minSpacingPx = 300,
    minSpacingDelayMs = 220,
  } = {}) {
    this.scene = scene;
    this.speedMultiplier = speedMultiplier;
    this.intervalMin = intervalMs[0];
    this.intervalMax = intervalMs[1];
    this.floorYOffset = floorYOffset;
    this.intervalProvider = intervalProvider;
    this.intervalFloor = intervalFloor;
    this.minSpacingPx = minSpacingPx;
    this.minSpacingDelayMs = minSpacingDelayMs;

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

  update(deltaMs, distancePerFrame, player, score = 0, currentSpeed = null) {
    this.elapsed += deltaMs;

    if (this.elapsed >= this.nextSpawnIn) {
      const effectiveSpeed = currentSpeed ?? (distancePerFrame * 60);
      if (this.#hasSpawnSpace(effectiveSpeed)) {
        this.spawn();
        this.elapsed = 0;
        this.nextSpawnIn = this.#rngInterval(score);
      } else {
        // not enough room yet; try again shortly
        this.nextSpawnIn += this.minSpacingDelayMs;
        this.nextSpawnIn = Math.min(this.nextSpawnIn, this.minSpacingDelayMs * 3);
      }
    }

    // Move obstacles faster as baseSpeed rises
    const move = distancePerFrame * this.speedMultiplier;

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
        min = Math.max(this.intervalFloor, Math.min(range[0], range[1]));
        max = Math.max(min + 250, Math.max(range[0], range[1]));
      }
    }

    min = Math.max(this.intervalFloor, min);
    max = Math.max(min + 250, max);

    return Phaser.Math.Between(min, max);
  }

  #hasSpawnSpace(currentSpeed = 0) {
    if (!this.obstacles.length) return true;

    const { width: W } = this.scene.scale;
    const futureSpawnX = W + 50;
    const minDistance = Math.max(this.minSpacingPx, Math.round(currentSpeed * 0.55));

    let rightmost = -Infinity;
    for (const ob of this.obstacles) {
      const x = ob?.sprite?.x ?? -Infinity;
      if (x > rightmost) rightmost = x;
    }

    if (!Number.isFinite(rightmost)) return true;
    return futureSpawnX - rightmost >= minDistance;
  }
}
