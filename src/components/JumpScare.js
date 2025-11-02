import Phaser from 'phaser';

export default class JumpScare {
  constructor(scene, opts = {}) {
    this.scene = scene;
    this.opts = {
      volume: 0.9,
      shakeDur: 250,
      shakeMag: 0.012,
      zoom: 1.12,
      invertMs: 1500,
    };

    const { width: W, height: H } = scene.scale;

    this.flash = scene.add.rectangle(0, 0, W, H, 0xffffff, 1)
      .setOrigin(0)
      .setAlpha(0)
      .setDepth(400);

    this.vignette = scene.add.graphics().setDepth(399).setAlpha(0);
    this.#drawVignette(W, H);

    this.sfxKeys = ['sfx_js_1', 'sfx_js_2'].filter(k => scene.cache.audio.exists(k));
    this.timer = null;
  }

  #drawVignette(W, H) {
    const g = this.vignette;
    g.clear();
    const cx = W / 2, cy = H / 2;
    const outer = Math.hypot(cx, cy) * 1.2;
    g.fillStyle(0x8a0000, 0.65);
    g.beginPath();
    g.fillCircle(cx, cy, outer);
    g.blendMode = Phaser.BlendModes.MULTIPLY;
  }

  startAuto({ min = 10, max = 22 } = {}) {
    this.stopAuto();
    const schedule = () => {
      const delay = Phaser.Math.Between(min * 1000, max * 1000);
      this.timer = this.scene.time.delayedCall(delay, () => {
        this.trigger();
        schedule();
      });
    };
    schedule();
  }

  stopAuto() {
    if (this.timer) { this.timer.remove(false); this.timer = null; }
  }

  stopAllEffects() {
    // Stop any active tweens on flash/vignette
    this.scene.tweens.getTweensOf(this.flash).forEach(tween => tween.stop());
    this.scene.tweens.getTweensOf(this.vignette).forEach(tween => tween.stop());
    
    // Reset flash and vignette to default state
    this.flash.setAlpha(0);
    this.vignette.setAlpha(0);
    
    // Reset camera
    const cam = this.scene.cameras.main;
    cam.resetFX();
  }

  trigger({ invert = true } = {}) {
    const cam = this.scene.cameras.main;
    const { shakeDur, shakeMag, zoom, volume, invertMs } = this.opts;

    // Don't trigger if game is paused
    if (this.scene.isPaused) return;

    // Only play sound if music is enabled (not muted)
    const musicEnabled = this.scene.registry.get('musicEnabled');
    if (musicEnabled) {
      const key = Phaser.Utils.Array.GetRandom(this.sfxKeys);
      if (key) this.scene.sound.play(key, { volume });
    }

    // Apply visual effects
    cam.shake(shakeDur, shakeMag);
    cam.zoomTo(zoom, 120, 'Quad.easeOut', true, (_c, _p, done) => {
      if (done) cam.zoomTo(1, 180, 'Quad.easeOut', true);
    });

    // flash: fade in then out (no timeline)
    this.scene.tweens.add({
      targets: this.flash, alpha: 1, duration: 80, ease: 'Linear',
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.flash, alpha: 0, duration: 220, ease: 'Quad.easeOut'
        });
      }
    });

    // vignette pulse
    this.scene.tweens.add({
      targets: this.vignette, alpha: 1, duration: 80, yoyo: true, hold: 120, ease: 'Quad.easeInOut'
    });

    if (invert) {
      this.scene.controlsInverted = true;
      this.scene.time.delayedCall(invertMs, () => { this.scene.controlsInverted = false; });
    }
  }

  destroy() {
    this.stopAuto();
    this.flash.destroy();
    this.vignette.destroy();
  }

  pauseAnimations() {
    // Pause all tweens on flash and vignette
    this.scene.tweens.getTweensOf(this.flash).forEach(tween => tween.pause());
    this.scene.tweens.getTweensOf(this.vignette).forEach(tween => tween.pause());
  }

  resumeAnimations() {
    // Resume all tweens on flash and vignette
    this.scene.tweens.getTweensOf(this.flash).forEach(tween => tween.resume());
    this.scene.tweens.getTweensOf(this.vignette).forEach(tween => tween.resume());
  }
}
