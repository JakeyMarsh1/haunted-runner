import Phaser from "phaser";
import SceneTransition from "../utils/SceneTransition";
import menuBackgroundImg from "../assets/backgrounds/Background2.png";
import gameBackgroundImg from "../assets/backgrounds/Background4.png";
import menuMusicFile from "../assets/music/spooky-wind.mp3";
import gameMusicFile from "../assets/music/haunting-spooky.mp3";
import playerSpriteSheet from "../assets/sprites/sprite.png";

export default class BootScene extends Phaser.Scene {
  constructor() { super("BootScene"); }

  preload() {
    this.cameras.main.setBackgroundColor("#000000");

    // Images
    this.load.image("menuBackground", menuBackgroundImg);
    this.load.image("gameBackground", gameBackgroundImg);

    // Audio (autoplay will still require a user gesture later)
    this.load.audio("menuMusic", menuMusicFile);
    this.load.audio("gameMusic", gameMusicFile);

    // Spritesheet
    this.load.spritesheet("player", playerSpriteSheet, {
      frameWidth: 900,
      frameHeight: 900,
    });

    // Transition after loader completes
    this.load.once("complete", () => {

      SceneTransition.fadeToScene(this, "MenuScene", 400);
    });
  }

  create() {
    // No-op: create will run after preload; transition handled in the loader 'complete' callback.
  }
}
