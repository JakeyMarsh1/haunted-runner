import Phaser from "phaser";
import MusicManager from "../utils/MusicManager";
import SceneTransition from "../utils/SceneTransition";
import ConsentModal from "../utils/ConsentModal";

const MUSIC_ICON_ON = "🔊";
const MUSIC_ICON_OFF = "🔇";

const log = (...args) => {
  if (import.meta?.env?.DEV) {
    console.log("[MenuScene]", ...args);
  }
};

const logError = (...args) => {
  if (import.meta?.env?.DEV) {
    console.error("[MenuScene]", ...args);
  }
};

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    try {
      log("create start");
      const { width, height } = this.scale;

      // Fade in
      SceneTransition.setupFadeIn(this, 800);

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

      // Flag to prevent click-to-start while modal is being closed
      this.consentModalOpen = true;

      // Show consent modal overlay on top of menu
      log("creating consent modal");
      new ConsentModal(this, (preferences) => {
        log("consent confirmed", preferences);
        this.handleConsentComplete(preferences);
      });

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
        // Don't navigate if consent modal just closed
        if (this.consentModalOpen) return;
        log("about button pressed");
        SceneTransition.fadeToScene(this, "AboutScene", 600);
      });

      // --- Music Toggle Button ---
      log("creating music button");
      this.musicButton = MusicManager.createMusicButton(
        this,
        width - 20,
        20,
        MUSIC_ICON_ON,
        MUSIC_ICON_OFF
      );

      // --- Settings Button ---
      const settingsButton = this.add.text(width - 90, 32, "⚙", {
        fontSize: "32px",
        fontFamily: "Arial",
      })
        .setOrigin(0.5, 0.5)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true })
        .setDepth(100);

      settingsButton.on("pointerover", () => {
        settingsButton.setScale(1.2);
      });

      settingsButton.on("pointerout", () => {
        settingsButton.setScale(1.0);
      });

      settingsButton.on("pointerdown", () => {
        if (this.consentModalOpen) return;
        log("settings button pressed");
        // Reopen consent modal
        this.consentModalOpen = true;
        new ConsentModal(this, (preferences) => {
          log("consent re-confirmed", preferences);
          this.handleConsentComplete(preferences);
        });
      });

      // Start game via keyboard
      this.input.keyboard.on("keydown-SPACE", () => {
        log("SPACE pressed -> start GameScene");
        SceneTransition.fadeToScene(this, "GameScene", 600);
      });

      // Start game via click/tap anywhere EXCEPT About button or Music button
      this.input.on("pointerdown", (pointer) => {
        if (this.consentModalOpen) return;

        const p = new Phaser.Math.Vector2(pointer.x, pointer.y);
        const overMusic = this.musicButton.getBounds().contains(p.x, p.y);
        const overAbout =
          aboutBtn.getBounds().contains(p.x, p.y) ||
          aboutLabel.getBounds().contains(p.x, p.y);
        if (overMusic || overAbout) return;
        log("pointerdown -> start GameScene");
        SceneTransition.fadeToScene(this, "GameScene", 600);
      });

      log("create complete");
    } catch (error) {
      logError("create failed", error);
      this.showFatalError(error);
    }
  }

  #ensureButtonTexture() {
    if (this.textures.exists("ui-btn")) return;
    const w = 280;
    const h = 64;
    const r = 18;
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

  handleConsentComplete(preferences) {
    log("handleConsentComplete", preferences);
    // Save preferences for use in GameScene
    this.jumpscareEnabled = preferences.jumpscareEnabled;
    this.musicEnabled = preferences.musicEnabled;

    // Setup music with saved preference
    MusicManager.init(this);

    const currentMusicState = MusicManager.getMusicState(this);

    // If user enabled music and it's currently disabled, enable it
    if (preferences.musicEnabled && !currentMusicState) {
      MusicManager.setupMusic(this, "menuMusic");
      MusicManager.toggleMusic(this); // Toggle to enable
    }
    // If user disabled music and it's currently enabled, disable it
    else if (!preferences.musicEnabled && currentMusicState) {
      MusicManager.toggleMusic(this); // Toggle to disable
    }
    // If not currently playing, setup the music
    else if (preferences.musicEnabled && !this.music?.isPlaying) {
      MusicManager.setupMusic(this, "menuMusic");
    }

    // Update the music button icon to reflect current state
    const newMusicState = MusicManager.getMusicState(this);
    if (this.musicButton) {
      this.musicButton.setText(newMusicState ? MUSIC_ICON_ON : MUSIC_ICON_OFF);
    }

    // Allow click-to-start after a small delay to prevent the continue click from triggering game start
    this.time.delayedCall(200, () => {
      this.consentModalOpen = false;
      log("consent modal closed");
    });
  }

  showFatalError(error) {
    const { width, height } = this.scale;
    const message = error instanceof Error ? error.message : String(error);
    this.add
      .rectangle(0, 0, width, height, 0x000000, 0.85)
      .setOrigin(0, 0)
      .setDepth(9999);
    this.add
      .text(width / 2, height / 2, `Menu failed to load\n${message}`.trim(), {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#ff5555",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(10000);
  }
}
