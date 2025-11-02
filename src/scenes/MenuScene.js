import Phaser from "phaser";
import MusicManager from "../utils/MusicManager";
import SceneTransition from "../utils/SceneTransition";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const { width, height } = this.scale;

    // Fade in
    SceneTransition.setupFadeIn(this, 800);

    // Music
    MusicManager.init(this);
    MusicManager.setupMusic(this);

    // Background
    const bg = this.add.image(width / 2, height / 2, "menuBackground").setOrigin(0.5);
    bg.setDisplaySize(width, height);

    // Title
    this.add
      .text(width / 2, height * 0.28, "Haunted Runner", {
        fontFamily: "Inter, sans-serif",
        fontSize: "46px",
        fontStyle: "900",
        color: "#f8fafc",
        align: "center",
      })
      .setOrigin(0.5);

    // Instructions
    this.add
      .text(width / 2, height * 0.45, "Tap or press SPACE to begin", {
        fontFamily: "Inter, sans-serif",
        fontSize: "20px",
        color: "#cbd5f5",
      })
      .setOrigin(0.5);

    // Ensure a reusable button texture exists
    this.#ensureButtonTexture();

    // --- About Button (real button: rounded rect + label) ---
    const btnY = height * 0.68;
    const aboutBtn = this.add.image(width / 2, btnY, "ui-btn").setOrigin(0.5);
    const aboutLabel = this.add
      .text(width / 2, btnY, "About the Team", {
        fontFamily: '"Creepster", cursive',
        fontSize: "32px",
        color: "#f87171",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // Make the button interactive (use the image as the hit area)
    aboutBtn.setInteractive({ useHandCursor: true });

    // Hover/press effects
    aboutBtn.on("pointerover", () => {
      aboutBtn.setTint(0x222222);
      aboutLabel.setColor("#ffffff");
      aboutLabel.setScale(1.05);
    });
    aboutBtn.on("pointerout", () => {
      aboutBtn.clearTint();
      aboutLabel.setColor("#f87171");
      aboutLabel.setScale(1.0);
    });
    aboutBtn.on("pointerdown", () => {
      aboutBtn.setTint(0x111111);
    });
    aboutBtn.on("pointerup", () => {
      aboutBtn.clearTint();
      SceneTransition.fadeToScene(this, "AboutScene", 600);
    });

    // --- Music Toggle Button ---
    this.musicButton = MusicManager.createMusicButton(this, width - 20, 20);

    // Start game via keyboard
    this.input.keyboard.on("keydown-SPACE", () => {
      SceneTransition.fadeToScene(this, "GameScene", 600);
    });

    // Start game via click/tap anywhere EXCEPT About button or Music button
    this.input.on("pointerdown", (pointer) => {
      const p = new Phaser.Math.Vector2(pointer.x, pointer.y);
      const overMusic = this.musicButton.getBounds().contains(p.x, p.y);
      const overAbout = aboutBtn.getBounds().contains(p.x, p.y) || aboutLabel.getBounds().contains(p.x, p.y);
      if (overMusic || overAbout) return;
      SceneTransition.fadeToScene(this, "GameScene", 600);
    });
  }

  #ensureButtonTexture() {
    if (this.textures.exists("ui-btn")) return;
    const w = 280, h = 64, r = 18;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // base
    g.fillStyle(0x0f172a, 1);
    g.fillRoundedRect(0, 0, w, h, r);
    // inner highlight
    g.lineStyle(2, 0x1f2937, 1);
    g.strokeRoundedRect(1, 1, w - 2, h - 2, r - 2);
    // subtle bottom glow
    g.fillStyle(0x111827, 1);
    g.fillRoundedRect(0, h - 10, w, 10, { tl: 0, tr: 0, br: r, bl: r });
    g.generateTexture("ui-btn", w, h);
    g.destroy();
  }
}
