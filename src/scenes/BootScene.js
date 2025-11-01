import Phaser from "phaser";
import menuBackgroundImg from "../assets/backgrounds/Background2.png";
import gameBackgroundImg from "../assets/backgrounds/Background4.png";
import menuMusicFile from "../assets/music/spooky-wind.mp3";
import playerSpriteSheet from "../assets/sprites/sprite.png";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#ffffff");

    // Load all game assets
    this.load.image("menuBackground", menuBackgroundImg);
    this.load.image("gameBackground", gameBackgroundImg);
    this.load.audio("menuMusic", menuMusicFile);
    
    // Load player spritesheet (12 frames, each 900x900 pixels)
    this.load.spritesheet("player", playerSpriteSheet, {
      frameWidth: 900,
      frameHeight: 900,
    });
  }

  create() {
    // Start the menu scene once everything is loaded
    this.scene.start("MenuScene");
  }
}
