import Phaser from "phaser";
import MusicManager from "../utils/MusicManager";
import SceneTransition from "../utils/SceneTransition";
import ConsentModal from "../utils/ConsentModal";
import Typewriter from '../utils/Typewriter';


export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const { width, height } = this.scale;

    // Fade in
    SceneTransition.setupFadeIn(this, 800);

    // Background
    const bg = this.add.image(width / 2, height / 2, "menuBackground").setOrigin(0.5);
    bg.setDisplaySize(width, height);
    
    // Check if user has seen the story intro
    const hasSeenStory = this.registry.get('hasSeenStory');
    
    if (!hasSeenStory) {
      // Show story intro first
      this.showStoryIntro();
      return; // Exit early, will rebuild menu after story
    }
    
    // Build normal menu
    this.buildMenu();
  }

  showStoryIntro() {
    const { width, height } = this.scale;

    // Semi-transparent overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setOrigin(0.5);

    // Story content container
    const contentY = height * 0.3;
    const contentBg = this.add.rectangle(
      width / 2,
      contentY + 120,
      width - 80,
      height * 0.5,
      0x1f2937,
      0.9
    ).setOrigin(0.5).setDepth(9);

    // Add border to content box
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

    // Title
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

    // Initialize typewriter for story text
    const typewriter = new Typewriter();
    
    typewriter.init(this, {
      x: width / 2,
      y: contentY,
      fontFamily: 'Inter, sans-serif',
      fontSize: 22,
      maxWidth: width - 140,
      color: '#ffffff',
      align: 'center',
      lineSpacing: 12,
      text: "👻 On the edge of a forgotten graveyard, " +
            "under a sky lit by a crooked moon, " +
            "a mischievous little skull named Skully " +
            "came to life one Halloween night. ⚡💀\n" +
            "Every year since, as the clock strikes midnight, " +
            "Skully awakens once more — doomed  to race through the haunted fields " +
            "in search of freedom. " +
            "But the graveyard isn't quiet anymore…\n\n" +
            "Only by running through the night of endless Halloween, " +
            "jumping over traps and dodging every fright,\n" +
            "can Skully hope to break the curse and finally rest in peace...\n" +
            "At least, until next Halloween. 👀✨",
      delay: 30,
      depth: 11,
      origin: { x: 0.5, y: 0 },
      onComplete: () => {
        // Show continue message after typing is done
        this.showStoryContinueMessage();
      }
    });

    // Start typing animation
    typewriter.start();
    this.typewriter = typewriter;

    // Skip typing on any key press
    const skipHandler = this.input.keyboard.once('keydown', () => {
      if (this.typewriter && this.typewriter.getIsTyping()) {
        this.typewriter.skip();
      }
    });
  }

  showStoryContinueMessage() {
    const { width, height } = this.scale;
    
    // Flashing "Continue" text
    const continueText = this.add
      .text(width / 2, height * 0.85, "Press any key to continue...", {
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

    // Continue to menu on any input
    this.input.keyboard.once('keydown', () => {
      this.registry.set('hasSeenStory', true);
      this.scene.restart(); // Restart scene to show menu
    });

    this.input.once('pointerdown', () => {
      this.registry.set('hasSeenStory', true);
      this.scene.restart(); // Restart scene to show menu
    });
  }

  buildMenu() {
    const { width, height } = this.scale;

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

    // Tutorial Button
    const tutorialBtn = this.add.text(width / 2, height * 0.55, "📖 Tutorial", {
      fontFamily: '"Creepster", cursive',
      fontSize: "28px",
      color: "#fde68a",
      stroke: "#000000",
      strokeThickness: 3,
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Hover/press effects for tutorial button
    tutorialBtn.on("pointerover", () => {
      tutorialBtn.setColor("#ffffff");
      tutorialBtn.setScale(1.1);
    });
    
    tutorialBtn.on("pointerout", () => {
      tutorialBtn.setColor("#fde68a");
      tutorialBtn.setScale(1.0);
    });
    
    tutorialBtn.on("pointerdown", () => {
      tutorialBtn.setScale(0.95);
    });
    
    tutorialBtn.on("pointerup", () => {
      tutorialBtn.setScale(1.1);
      // Don't navigate if consent modal is open
      if (this.consentModalOpen) return;
      SceneTransition.fadeToScene(this, "TutorialScene", 600);
    });

    // Flag to prevent click-to-start while modal is being closed
    this.consentModalOpen = true;

    // Show consent modal overlay on top of menu
    new ConsentModal(this, (preferences) => {
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
      SceneTransition.fadeToScene(this, "AboutScene", 600);
    });

    // --- Music Toggle Button ---
    this.musicButton = MusicManager.createMusicButton(this, width - 20, 20);

    // --- Settings Button ---
    const settingsButton = this.add.text(width - 90, 32, '⚙️', {
      fontSize: '28px',
      fontFamily: 'Arial'
    })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .setDepth(100);

    settingsButton.on('pointerover', () => {
      settingsButton.setScale(1.2);
    });

    settingsButton.on('pointerout', () => {
      settingsButton.setScale(1.0);
    });

    settingsButton.on('pointerdown', () => {
      if (this.consentModalOpen) return;
      // Reopen consent modal
      this.consentModalOpen = true;
      new ConsentModal(this, (preferences) => {
        this.handleConsentComplete(preferences);
      });
    });

    // Start game via keyboard
    this.input.keyboard.on("keydown-SPACE", () => {
      SceneTransition.fadeToScene(this, "GameScene", 600);
    });

    // Start game via click/tap anywhere EXCEPT About, Tutorial, or Music buttons
    this.input.on("pointerdown", (pointer) => {
      // Don't start game if consent modal is visible or just closed
      if (this.consentModalOpen) return;

      const p = new Phaser.Math.Vector2(pointer.x, pointer.y);
      const overMusic = this.musicButton.getBounds().contains(p.x, p.y);
      const overAbout = aboutBtn.getBounds().contains(p.x, p.y) || aboutLabel.getBounds().contains(p.x, p.y);
      const overTutorial = tutorialBtn.getBounds().contains(p.x, p.y);
      if (overMusic || overAbout || overTutorial) return;
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

  handleConsentComplete(preferences) {
    // Save preferences for use in GameScene
    this.jumpscareEnabled = preferences.jumpscareEnabled;
    this.musicEnabled = preferences.musicEnabled;

    // Setup music with saved preference
    MusicManager.init(this);
    
    const currentMusicState = MusicManager.getMusicState(this);
    
    // If user enabled music and it's currently disabled, enable it
    if (preferences.musicEnabled && !currentMusicState) {
      MusicManager.setupMusic(this, 'menuMusic');
      MusicManager.toggleMusic(this); // Toggle to enable
    } 
    // If user disabled music and it's currently enabled, disable it
    else if (!preferences.musicEnabled && currentMusicState) {
      MusicManager.toggleMusic(this); // Toggle to disable
    }
    // If not currently playing, setup the music
    else if (preferences.musicEnabled && !this.music?.isPlaying) {
      MusicManager.setupMusic(this, 'menuMusic');
    }

    // Update the music button icon to reflect current state
    const newMusicState = MusicManager.getMusicState(this);
    this.musicButton.setText(newMusicState ? "🔊" : "🔇");

    // Allow click-to-start after a small delay to prevent the continue click from triggering game start
    this.time.delayedCall(200, () => {
      this.consentModalOpen = false;
    });
  }
}
