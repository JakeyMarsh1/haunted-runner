import Phaser from "phaser";
import MusicManager from "../utils/MusicManager";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const { width, height } = this.scale;

    // Initialize music manager
    MusicManager.init(this);
    MusicManager.setupMusic(this);

    // Add the background first
    const bg = this.add.image(width /2, height /2, "menuBackground").setOrigin(0.5);
    bg.setDisplaySize(width, height); // make it fill the whole screen


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

   // --- Music Toggle Button ---
   this.musicButton = MusicManager.createMusicButton(this, width - 20, 20);

  

  // Input: go straight to GameScene
  this.input.keyboard.on("keydown-SPACE", () => {
  
    this.scene.start("GameScene");
  });

  this.input.on("pointerdown", (pointer) => {
    // Don't start game if clicking on the music button
    if (this.musicButton.getBounds().contains(pointer.x, pointer.y)) {
      return;
    }
    this.scene.start("GameScene");
  });
}
}