export default class DifficultyManager {
  constructor({
    baseGameSpeed = 330,
    obstacleSpeedMultiplier = 0.1,
    parallaxPrimaryFactor = 0.8,

    // Slower, longer early ramp
    rampStart = 450,
    rampEnd = 7200,
    maxSpeedAtRampEnd = 1.45,    // scale at rampEnd

    // Endless post-ramp growth toward a sane cap
    hardSpeedCap = 3.0,
    postRampStep = 800,         // score per growth step
    postRampGrowthRate = 0.02,  // ~2% per step

    // Spawn windows: tighten more conservatively
    spawnIntervalBase = [3200, 4800],
    spawnIntervalAtRampEnd = [1800, 2800],
    postRampTightenRate = 0.05, // ~5% tighter per step
    minSpawnFloor = 700,
  } = {}) {
    this.baseGameSpeed = baseGameSpeed;
    this.obstacleSpeedMultiplier = obstacleSpeedMultiplier;
    this.parallaxPrimaryFactor = parallaxPrimaryFactor;

    this.rampStart = rampStart;
    this.rampEnd = rampEnd;
    this.maxSpeedAtRampEnd = maxSpeedAtRampEnd;

    this.hardSpeedCap = hardSpeedCap;
    this.postRampStep = postRampStep;
    this.postRampGrowthRate = postRampGrowthRate;

    this.spawnIntervalBase = spawnIntervalBase;
    this.spawnIntervalAtRampEnd = spawnIntervalAtRampEnd;
    this.postRampTightenRate = postRampTightenRate;
    this.minSpawnFloor = minSpawnFloor;
  }

  #progress(score = 0) {
    if (score <= this.rampStart) return 0;
    if (score >= this.rampEnd) return 1;
    return (score - this.rampStart) / (this.rampEnd - this.rampStart);
  }

  // Smoothstep easing on the ramp so early growth is gentle, mid-game steadier.
  #easeSmoothstep(t) {
    return t * t * (3 - 2 * t);
  }

  getSpeedScale(score = 0) {
    if (score <= this.rampEnd) {
      const t = this.#easeSmoothstep(this.#progress(score));
      return 1 + t * (this.maxSpeedAtRampEnd - 1);
    }
    const extra = score - this.rampEnd;
    const steps = extra / this.postRampStep;
    const growth = Math.pow(1 + this.postRampGrowthRate, steps);
    const scale = this.maxSpeedAtRampEnd * growth;
    return Math.min(this.hardSpeedCap, scale);
  }

  getGameSpeed(score) {
    return this.baseGameSpeed * this.getSpeedScale(score);
  }

  getObstacleSpeed(score) {
    return this.getGameSpeed(score) * this.obstacleSpeedMultiplier;
  }

  getParallaxFactor(score) {
    return this.parallaxPrimaryFactor * this.getSpeedScale(score);
  }

  getSpawnIntervalRange(score = 0) {
    const lerp = (a, b, t) => a + (b - a) * t;

    if (score <= this.rampEnd) {
      const t = this.#easeSmoothstep(this.#progress(score));
      const [bMin, bMax] = this.spawnIntervalBase;
      const [rMin, rMax] = this.spawnIntervalAtRampEnd;
      let min = Math.round(lerp(bMin, rMin, t));
      let max = Math.round(lerp(bMax, rMax, t));
      min = Math.max(this.minSpawnFloor, min);
      max = Math.max(min + 250, max);
      return [min, max];
    }

    const [startMin, startMax] = this.spawnIntervalAtRampEnd;
    const extra = score - this.rampEnd;
    const steps = extra / this.postRampStep;
    const tighten = Math.pow(1 + this.postRampTightenRate, steps);

    let min = Math.max(this.minSpawnFloor, Math.round(startMin / tighten));
    let max = Math.max(min + 250, Math.round(startMax / tighten));
    return [min, max];
  }
}
