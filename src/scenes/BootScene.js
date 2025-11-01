import Phaser from "phaser";
import menuBackgroundImg from "../assets/backgrounds/Background4.png";
import menuMusicFile from "../assets/music/spooky-wind.mp3";
import playerSpriteSheet from "../assets/sprites/sprite.png";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#020617");

    // Load all game assets
    this.load.image("menuBackground", menuBackgroundImg);
    this.load.audio("menuMusic", menuMusicFile);
    
    // Load player spritesheet (15 frames, each 70x70 pixels)
    this.load.spritesheet("player", playerSpriteSheet, {
      frameWidth: 70,
      frameHeight: 70,
    });
  }

  create() {
    // Start the menu scene once everything is loaded
    this.scene.start("MenuScene");
  }
}
