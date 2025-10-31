import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#020617");

    this.add
      .text(width / 2, height * 0.28, "Haunted Runner", {
        fontFamily: "Inter, sans-serif",
        fontSize: "46px",
        fontStyle: "900",
        color: "#f8fafc",
        align: "center",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.45, "Tap or press SPACE to begin", {
        fontFamily: "Inter, sans-serif",
        fontSize: "20px",
        color: "#cbd5f5",
      })
      .setOrigin(0.5);

    const flashing = this.add
      .text(width / 2, height * 0.6, "Menu prototype", {
        fontFamily: "Inter, sans-serif",
        fontSize: "16px",
        color: "#22d3ee",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: flashing,
      alpha: { from: 0.2, to: 1 },
      duration: 900,
      yoyo: true,
      repeat: -1,
    });

    this.input.keyboard.on("keydown-SPACE", () => this.pulse());
    this.input.on("pointerdown", () => this.pulse());
  }

  pulse() {
    this.cameras.main.flash(150, 34, 211, 255);
  }
}
