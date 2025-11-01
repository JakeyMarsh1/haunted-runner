export default class JumpScare {
  constructor(scene) {
    this.scene = scene;
    this.active = false;
    this.timer = scene.time.addEvent({
      delay: 7000,
      loop: true,
      callback: () => this.tryTrigger(),
    });
  }

  tryTrigger() {
    if (this.active || Math.random() > 0.35) return;
    this.trigger();
  }

  trigger() {
    this.active = true;

    // Flash + shake
    const cam = this.scene.cameras.main;
    cam.flash(100, 255, 0, 50);
    cam.shake(300, 0.004);

    // Distort sound
    this.scene.sound.play('jumpscare', { volume: 0.9 });

    // Temporary control inversion
    this.scene.controlsInverted = true;

    // Optional visual overlay
    const g = this.scene.add.rectangle(0, 0, cam.width, cam.height, 0x000000, 0.0).setOrigin(0);
    this.scene.tweens.add({
      targets: g,
      alpha: { from: 0.0, to: 0.4 },
      duration: 150,
      yoyo: true,
      hold: 200,
      onComplete: () => g.destroy(),
    });

    // End effect after 2 s
    this.scene.time.delayedCall(2000, () => {
      this.scene.controlsInverted = false;
      this.active = false;
    });
  }
}
