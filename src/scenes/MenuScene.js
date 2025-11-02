import Phaser from "phaser";
import MusicManager from "../utils/MusicManager";
import SceneTransition from "../utils/SceneTransition";
import ConsentModal from "../utils/ConsentModal";
import Typewriter from "../utils/Typewriter";

const log = (...args) => {
  if (import.meta?.env?.DEV) console.log("[MenuScene]", ...args);
};
const logError = (...args) => {
  if (import.meta?.env?.DEV) console.error("[MenuScene]", ...args);
};

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const { width, height } = this.scale;

    SceneTransition.setupFadeIn(this, 800);

    const bg = this.add.image(width / 2, height / 2, "menuBackground").setOrigin(0.5);
    bg.setDisplaySize(width, height);

    const hasSeenStory = this.registry.get("hasSeenStory");
    if (!hasSeenStory) {
      this.showStoryIntro();
      return;
    }

    this.buildMenu();
  }

  showStoryIntro() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setOrigin(0.5);

    const contentY = height * 0.3;
    this.add
      .rectangle(width / 2, contentY + 120, width - 80, height * 0.5, 0x1f2937, 0.9)
      .setOrigin(0.5)
      .setDepth(9);

    const graphics = this.add.graphics();
    graphics.lineStyle(3, 0xff6600, 1);
    graphics.strokeRoundedRect(
      40,
      contentY + 120 - (height * 0.5) / 2,
      width - 80,
      height * 0.5,
      10
    );
    graphics.setDepth(10);

    this.add
      .text(width / 2, height * 0.15, "The Legend of Skully the Haunted Runner", {
        fontFamily: '"Creepster", cursive',
        fontSize: "42px",
        color: "#ff6600",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(11);

    const typewriter = new Typewriter();
    typewriter.init(this, {
      x: width / 2,
      y: contentY - 20,
      fontFamily: "Inter, sans-serif",
      fontSize: 22,
      maxWidth: width - 140,
      color: "#ffffff",
      align: "center",
      lineSpacing: 12,
      text:
        "👻 On the edge of a forgotten graveyard, under a sky lit by a crooked moon, " +
        "a mischievous little skull named Skully came to life one Halloween night. ⚡💀\n" +
        "Every year since, as the clock strikes midnight, Skully awakens once more — doomed  to race through the haunted fields in search of freedom. " +
        "But the graveyard isn't quiet anymore…\n\n" +
        "Only by running through the night of endless Halloween, jumping over traps and dodging every fright,\n" +
        "can Skully hope to break the curse and finally rest in peace...\n" +
        "At least, until next Halloween. 👀✨",
      delay: 30,
      depth: 11,
      origin: { x: 0.5, y: 0 },
      onComplete: () => this.showStoryContinueMessage(),
    });
    typewriter.start();
    this.typewriter = typewriter;

    this.input.keyboard.once("keydown", () => {
      if (this.typewriter?.getIsTyping()) this.typewriter.skip();
    });
  }

  showStoryContinueMessage() {
    const { width, height } = this.scale;

    const continueText = this.add
      .text(width / 2, height * 0.85, "Press any key to continue...", {
        fontFamily: "Inter, sans-serif",
        fontSize: "18px",
        color: "#cbd5f5",
      })
      .setOrigin(0.5)
      .setDepth(12);

    this.tweens.add({
      targets: continueText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    const proceed = () => {
      this.registry.set("hasSeenStory", true);
      this.scene.restart();
    };
    this.input.keyboard.once("keydown", proceed);
    this.input.once("pointerdown", proceed);
  }

  buildMenu() {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height * 0.25, "Haunted Runner", {
        fontFamily: '"Creepster", cursive',
        fontSize: "56px",
        color: "#ff6600",
        stroke: "#000000",
        strokeThickness: 5,
        align: "center",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.37, "Choose your path...", {
        fontFamily: "Inter, sans-serif",
        fontSize: "18px",
        color: "#cbd5f5",
        fontStyle: "italic",
      })
      .setOrigin(0.5);

    const startBtn = this.createMenuButton(width / 2, height * 0.48, "🎃 Start Game");
    startBtn.on("pointerup", () => SceneTransition.fadeToScene(this, "GameScene", 600));

    const tutorialBtn = this.createMenuButton(width / 2, height * 0.58, "📖 Tutorial");
    tutorialBtn.on("pointerup", () => SceneTransition.fadeToScene(this, "TutorialScene", 600));

    const aboutBtn = this.createMenuButton(width / 2, height * 0.68, "👥 About the team");
    aboutBtn.on("pointerup", () => SceneTransition.fadeToScene(this, "AboutScene", 600));

    this.menuButtons = [startBtn, tutorialBtn, aboutBtn];

    this.musicButton = MusicManager.createMusicButton(this, width - 20, 20);

    const settingsButton = this.add
      .text(width - 90, 32, "⚙️", { fontSize: "28px", fontFamily: "Arial" })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .setDepth(100);

    settingsButton.on("pointerover", () => settingsButton.setScale(1.2));
    settingsButton.on("pointerout", () => settingsButton.setScale(1.0));
    settingsButton.on("pointerdown", () => {
      if (this.consentModalOpen) return;
      this.consentModalOpen = true;
      new ConsentModal(this, (preferences) => this.handleConsentComplete(preferences));
    });

    this.consentModalOpen = true;
    new ConsentModal(this, (preferences) => this.handleConsentComplete(preferences));

    this.input.keyboard.on("keydown-SPACE", () => {
      if (this.consentModalOpen) return;
      SceneTransition.fadeToScene(this, "GameScene", 600);
    });
  }

  createMenuButton(x, y, text) {
    const button = this.add
      .text(x, y, text, {
        fontFamily: '"Creepster", cursive',
        fontSize: "38px",
        color: "#fde68a",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.on("pointerover", () => {
      button.setColor("#ffffff");
      button.setScale(1.1);
    });
    button.on("pointerout", () => {
      button.setColor("#fde68a");
      button.setScale(1.0);
    });
    button.on("pointerdown", () => {
      button.setScale(0.95);
    });

    return button;
  }

  handleConsentComplete(preferences) {
    log("handleConsentComplete", preferences);

    this.jumpscareEnabled = preferences.jumpscareEnabled;
    this.musicEnabled = preferences.musicEnabled;

    MusicManager.init(this);
    const currentMusicState = MusicManager.getMusicState(this);

    if (preferences.musicEnabled && !currentMusicState) {
      MusicManager.setupMusic(this, "menuMusic");
      MusicManager.toggleMusic(this);
    } else if (!preferences.musicEnabled && currentMusicState) {
      MusicManager.toggleMusic(this);
    } else if (preferences.musicEnabled && !this.music?.isPlaying) {
      MusicManager.setupMusic(this, "menuMusic");
    }

    const newMusicState = MusicManager.getMusicState(this);
    if (this.musicButton) this.musicButton.setText(newMusicState ? "🔊" : "🔇");

    this.time.delayedCall(200, () => {
      this.consentModalOpen = false;
    });
  }

  showFatalError(error) {
    const { width, height } = this.scale;
    const message = error instanceof Error ? error.message : String(error);
    this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0, 0).setDepth(9999);
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
