import Phaser from "phaser";
import menuBackgroundImg from "../assets/backgrounds/Background4.png";
import menuMusicFile from "../assets/music/spooky-wind.mp3";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  preload() {
    // Load the background image
    this.load.image("menuBackground", menuBackgroundImg);
   // Music or sound
    this.load.audio("menuMusic", menuMusicFile);
  }

  create() {
    const { width, height } = this.scale;

    // Add the background first
    const bg = this.add.image(width /2, height /2, "menuBackground").setOrigin(0.5);
    bg.setDisplaySize(width, height); // make it fill the whole screen

      // Add and play background music
    this.music = this.sound.add("menuMusic", {
      volume: 0.5, // between 0 and 1
      loop: true   // repeat continuously
    });
    this.music.play();


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


  // Input: go straight to GameScene
  this.input.keyboard.on("keydown-SPACE", () => {
    this.music.stop()
    this.scene.start("GameScene");
  });

  this.input.on("pointerdown", () => {
    this.music.stop();
    this.scene.start("GameScene");
  });
}
}