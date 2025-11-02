import Phaser from "phaser";
import SceneTransition from "../utils/SceneTransition";
import menuBackgroundImg from "../assets/backgrounds/Background2.png";
import gameBackgroundImg from "../assets/backgrounds/Background4.png";
import menuMusicFile from "../assets/music/spooky-wind.mp3";
import gameMusicFile from "../assets/music/haunting-spooky.mp3";
import playerSpriteSheet from "../assets/sprites/sprite.png";
import scream1 from "../assets/audio/jumpscare-1.mp3";
import scream2 from "../assets/audio/jumpscare-2.mp3";
import zombieHandSprite from "../assets/sprites/ZombieHand.png";

const log = (...args) => {
  if (import.meta?.env?.DEV) {
    console.log("[BootScene]", ...args);
  }
};

const logError = (...args) => {
  if (import.meta?.env?.DEV) {
    console.error("[BootScene]", ...args);
  }
};

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    log("preload start");
    this.cameras.main.setBackgroundColor("#000000");

    this.load.on("filecomplete", (key) => {
      log("asset loaded", key);
    });

    this.load.on("loaderror", (_file) => {
      logError("asset failed", _file?.src || _file?.key, _file);
    });

    this.load.on("progress", (value) => {
      log("progress", `${Math.round(value * 100)}%`);
    });

    // Images
    this.load.image("menuBackground", menuBackgroundImg);
    this.load.image("gameBackground", gameBackgroundImg);


    // Audio (autoplay will still require a user gesture later)
    this.load.audio("menuMusic", menuMusicFile);
    this.load.audio("gameMusic", gameMusicFile);
    this.load.audio("sfx_js_1", scream1);
    this.load.audio("sfx_js_2", scream2);

    // Spritesheet
    this.load.spritesheet("player", playerSpriteSheet, {
      frameWidth: 900,
      frameHeight: 900,
    });

    // Zombie hand spritesheet (800x32, 25 frames of 32x32)
    this.load.spritesheet("zombieHand", zombieHandSprite, {
      frameWidth: 32,
      frameHeight: 32,
    });

    // Transition after loader completes
    this.load.once("complete", () => {
      log("preload complete; transitioning to MenuScene");
      SceneTransition.fadeToScene(this, "MenuScene", 400);
    });
  }

  create() {
    log("create called");
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
    window.addEventListener("error", this.handleGlobalError);
    window.addEventListener("unhandledrejection", this.handlePromiseRejection);
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
