import Phaser from "phaser";
import SceneTransition from "../utils/SceneTransition";
import menuBackgroundImg from "../assets/backgrounds/Background2.png";
import gameBackgroundImg from "../assets/backgrounds/Background4.png";
import menuMusicFile from "../assets/music/spooky-wind.mp3";
import gameMusicFile from "../assets/music/haunting-spooky.mp3";
import skullyRunningSpriteSheet from "../assets/sprites/skully_running.png";
import skullyJumpStartSpriteSheet from "../assets/sprites/skully_jump_start.png";
import skullyInAirSpriteSheet from "../assets/sprites/skully_inair.png";
import skullyFallingSpriteSheet from "../assets/sprites/skully_falling.png";
import skullyDeathSpriteSheet from "../assets/sprites/skully_death.png";
import scream1 from "../assets/audio/jumpscare-1.mp3";
import scream2 from "../assets/audio/jumpscare-2.mp3";
import zombieHandSprite from "../assets/sprites/ZombieHand.png";

const log = (...args) => {
  if (import.meta.env.DEV) console.log("[BootScene]", ...args);
};
const logError = (...args) => {
  if (import.meta.env.DEV) console.error("[BootScene]", ...args);
};

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
    this.isMobile = false;
    this.orientDim = null;
    this.orientMsg = null;
  }

  preload() {
    log("preload start");
    this.cameras.main.setBackgroundColor("#000000");

    this.load.on("filecomplete", (key) => log("asset loaded", key));
    this.load.on("loaderror", (file) => logError("asset failed", file?.src || file?.key, file));
    this.load.on("progress", (value) => log("progress", `${Math.round(value * 100)}%`));

    this.load.image("menuBackground", menuBackgroundImg);
    this.load.image("gameBackground", gameBackgroundImg);

    this.load.audio("menuMusic", menuMusicFile);
    this.load.audio("gameMusic", gameMusicFile);
    this.load.audio("sfx_js_1", scream1);
    this.load.audio("sfx_js_2", scream2);

    this.load.spritesheet("player", skullyRunningSpriteSheet, { frameWidth: 900, frameHeight: 900 });
    this.load.spritesheet("skullyJumpStart", skullyJumpStartSpriteSheet, { frameWidth: 900, frameHeight: 900 });
    this.load.spritesheet("skullyInAir", skullyInAirSpriteSheet, { frameWidth: 900, frameHeight: 900 });
    this.load.spritesheet("skullyFalling", skullyFallingSpriteSheet, { frameWidth: 900, frameHeight: 900 });
    this.load.spritesheet("skullyDeath", skullyDeathSpriteSheet, { frameWidth: 900, frameHeight: 900 });

    this.load.spritesheet("zombieHand", zombieHandSprite, { frameWidth: 32, frameHeight: 32 });

    // Keep BootScene alive to host the orientation guard. Do NOT stop this scene.
    this.load.once("complete", () => {
      log("preload complete; launching MenuScene");
      this.scene.launch("MenuScene"); // start next scene without destroying BootScene
    });
  }

  create() {
    log("create called");
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
    window.addEventListener("error", this.handleGlobalError);
    window.addEventListener("unhandledrejection", this.handlePromiseRejection);

    this.setupOrientationGuard();
  }

  // ----- Orientation guard (BootScene-only) -----
  setupOrientationGuard() {
    this.isMobile = !this.sys.game.device.os.desktop;

    const { width: W, height: H } = this.scale;
    this.orientDim = this.add
      .rectangle(W / 2, H / 2, W, H, 0x000000, 0.65)
      .setScrollFactor(0)
      .setDepth(100000)
      .setVisible(false)
      .setInteractive(); // swallow input when visible

    this.orientMsg = this.add
      .text(W / 2, H / 2, "Rotate your phone to landscape to play", {
        fontSize: "22px",
        fontFamily: "Arial",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: Math.min(520, W - 40) },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100001)
      .setVisible(false);

    // Keep overlay sized/centered
    this.scale.on("resize", ({ width, height }) => {
      this.orientDim.setSize(width, height).setPosition(width / 2, height / 2);
      this.orientMsg.setPosition(width / 2, height / 2);
      this.applyOrientationGuard();
    });

    // React to orientation changes
    this.scale.on("orientationchange", () => this.applyOrientationGuard());

    // Initial state after scale is ready
    this.time.delayedCall(0, () => this.applyOrientationGuard());
  }

  isPortraitNow() {
    const s = this.scale;
    if (typeof s.orientation !== "undefined") {
      return s.orientation === Phaser.Scale.PORTRAIT;
    }
    return s.height > s.width; // fallback
  }

  applyOrientationGuard() {
    if (!this.isMobile) {
      // Desktop: ensure overlay hidden and send BootScene behind gameplay scenes
      this.orientDim.setVisible(false).disableInteractive();
      this.orientMsg.setVisible(false);
      this.scene.sendToBack(); // keep out of the way
      return;
    }

    if (this.isPortraitNow()) {
      // Show overlay and bring BootScene above others
      this.orientDim.setVisible(true).setInteractive();
      this.orientMsg.setVisible(true);
      this.scene.bringToTop();
    } else {
      // Hide overlay and push BootScene behind others
      this.orientDim.setVisible(false).disableInteractive();
      this.orientMsg.setVisible(false);
      this.scene.sendToBack();
    }
  }

  shutdown() {
    log("shutdown called");
    window.removeEventListener("error", this.handleGlobalError);
    window.removeEventListener("unhandledrejection", this.handlePromiseRejection);
  }

  handleGlobalError = (event) => {
    logError("window error", event?.message, event?.error);
  };

  handlePromiseRejection = (event) => {
    logError("unhandled promise rejection", event?.reason);
  };
}
