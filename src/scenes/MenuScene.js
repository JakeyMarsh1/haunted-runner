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
      y: contentY - 20,
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
      .text(width / 2, height * 0.25, "Haunted Runner", {
        fontFamily: '"Creepster", cursive',
        fontSize: "56px",
        color: "#ff6600",
        stroke: "#000000",
        strokeThickness: 5,
        align: "center",
      })
      .setOrigin(0.5);

    // Subtitle hint
    this.add
      .text(width / 2, height * 0.37, "Choose your path...", {
        fontFamily: 'Inter, sans-serif',
        fontSize: "18px",
        color: "#cbd5f5",
        fontStyle: "italic",
      })
      .setOrigin(0.5);

    // --- Button 1: Start Game ---
    const startBtn = this.createMenuButton(width / 2, height * 0.48, "🎃 Start Game");
    startBtn.on("pointerup", () => {
      if (this.consentModalOpen) return;
      SceneTransition.fadeToScene(this, "GameScene", 600);
    });

    // --- Button 2: Tutorial ---
    const tutorialBtn = this.createMenuButton(width / 2, height * 0.58, "📖 Tutorial");
    tutorialBtn.on("pointerup", () => {
      if (this.consentModalOpen) return;
      SceneTransition.fadeToScene(this, "TutorialScene", 600);
    });

    // --- Button 3: About Us ---
    const aboutBtn = this.createMenuButton(width / 2, height * 0.68, "👥 About the team");
    aboutBtn.on("pointerup", () => {
      if (this.consentModalOpen) return;
      SceneTransition.fadeToScene(this, "AboutScene", 600);
    });

    // Store button references
    this.menuButtons = [startBtn, tutorialBtn, aboutBtn];

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

    // Flag to prevent click-to-start while modal is being closed
    this.consentModalOpen = true;

    // Show consent modal overlay on top of menu
    new ConsentModal(this, (preferences) => {
      this.handleConsentComplete(preferences);
    });

    // Keyboard shortcut - SPACE to start game
    this.input.keyboard.on("keydown-SPACE", () => {
      if (this.consentModalOpen) return;
      SceneTransition.fadeToScene(this, "GameScene", 600);
    });
  }

  createMenuButton(x, y, text) {
    const button = this.add.text(x, y, text, {
      fontFamily: '"Creepster", cursive',
      fontSize: "38px",
      color: "#fde68a",
      stroke: "#000000",
      strokeThickness: 4,
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Hover effects
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
