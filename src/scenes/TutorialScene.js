import Phaser from "phaser";
import SceneTransition from "../utils/SceneTransition";
import MusicManager from "../utils/MusicManager";

export default class TutorialScene extends Phaser.Scene {
  constructor() {
    super("TutorialScene");
  }

  create() {
    const { width: W, height: H } = this.scale;

    // Fade in
    SceneTransition.setupFadeIn(this, 800);

    // Background - use same as menu
    const bg = this.add.image(W / 2, H / 2, "menuBackground").setOrigin(0.5);
    bg.setDisplaySize(W, H);

    // Semi-transparent overlay
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7).setOrigin(0.5);

    // Tutorial content container
    const contentY = H * 0.3;
    const contentBg = this.add.rectangle(
      W / 2,
      contentY + 120,
      W - 80,
      H * 0.5,
      0x1f2937,
      0.9
    ).setOrigin(0.5).setDepth(9);

    // Add border to content box
    const graphics = this.add.graphics();
    graphics.lineStyle(3, 0xf87171, 1);
    graphics.strokeRoundedRect(
      40,
      contentY + 120 - (H * 0.5) / 2,
      W - 80,
      H * 0.5,
      10
    );
    graphics.setDepth(10);

    // Title
    this.add
      .text(W / 2, H * 0.15, "How to Play", {
        fontFamily: '"Creepster", cursive',
        fontSize: "48px",
        color: "#ff6600",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(11);

    // Tutorial text (no typewriter)
    this.add
      .text(W / 2, contentY, 
        "🎃 Welcome to Haunted Runner!\n" +
        "👻 OBJECTIVE: Survive as long as you can!\n" +
        "🎮 CONTROLS:\n" +
        "Press SPACE or TAP the screen to JUMP\n" +
        "☠️ AVOID: Watch out for zombie hands crawling from the right!\n" +
        "😱 JUMPSCARES: Stay alert!", 
        {
          fontFamily: 'Inter, sans-serif',
          fontSize: "22px",
          color: '#ffffff',
          align: 'center',
          wordWrap: { width: W - 140 },
          lineSpacing: 12,
        })
      .setOrigin(0.5, 0)
      .setDepth(11);

    // "Continue" text
    const continueText = this.add
      .text(W / 2, H * 0.85, "Press any key or click to continue...", {
        fontFamily: 'Inter, sans-serif',
        fontSize: "18px",
        color: "#cbd5f5",
      })
      .setOrigin(0.5)
      .setDepth(12);

    // Flash animation
    this.tweens.add({
      targets: continueText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Music button
    this.musicButton = MusicManager.createMusicButton(this, W - 20, 20);

    // Go back to menu on any input
    this.input.keyboard.once('keydown', () => {
      SceneTransition.fadeToScene(this, "MenuScene", 600);
    });

    this.input.once('pointerdown', (pointer) => {
      // Don't navigate if clicking music button
      if (this.musicButton?.getBounds().contains(pointer.x, pointer.y)) return;
      SceneTransition.fadeToScene(this, "MenuScene", 600);
    });
  }
}
