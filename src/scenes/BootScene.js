import Phaser from "phaser";
import SceneTransition from "../utils/SceneTransition";
import menuBackgroundImg from "../assets/backgrounds/Background2.png";
import gameBackgroundImg from "../assets/backgrounds/Background4.png";
import menuMusicFile from "../assets/music/spooky-wind.mp3";
import gameMusicFile from "../assets/music/haunting-spooky.mp3";
import playerSpriteSheet from "../assets/sprites/sprite.png";
import scream1 from '../assets/audio/jumpscare-1.mp3';
import scream2 from '../assets/audio/jumpscare-2.mp3';

import L1 from '../assets/backgrounds/parallax/Spooky_Cemetery_Layer_01.png';
import L2 from '../assets/backgrounds/parallax/Spooky_Cemetery_Layer_02.png';
import L3 from '../assets/backgrounds/parallax/Spooky_Cemetery_Layer_03.png';
import L4 from '../assets/backgrounds/parallax/Spooky_Cemetery_Layer_04.png';
import L5 from '../assets/backgrounds/parallax/Spooky_Cemetery_Layer_05.png';
import L6 from '../assets/backgrounds/parallax/Spooky_Cemetery_Layer_06.png';
import L7 from '../assets/backgrounds/parallax/Spooky_Cemetery_Layer_07.png';
import L8 from '../assets/backgrounds/parallax/Spooky_Cemetery_Layer_08.png';
import L9 from '../assets/backgrounds/parallax/Spooky_Cemetery_Layer_09.png';

export default class BootScene extends Phaser.Scene {
  constructor() { super("BootScene"); }

  preload() {
    this.cameras.main.setBackgroundColor("#000000");

    // Images
    this.load.image("menuBackground", menuBackgroundImg);
    this.load.image("gameBackground", gameBackgroundImg);
    this.load.image('bg_l1', L1);
    this.load.image('bg_l2', L2);
    this.load.image('bg_l3', L3);
    this.load.image('bg_l4', L4);
    this.load.image('bg_l5', L5);
    this.load.image('bg_l6', L6);
    this.load.image('bg_l7', L7);
    this.load.image('bg_l8', L8);
    this.load.image('bg_l9', L9);

    // Audio (autoplay will still require a user gesture later)
    this.load.audio("menuMusic", menuMusicFile);
    this.load.audio("gameMusic", gameMusicFile);
    this.load.audio('sfx_js_1', scream1);
    this.load.audio('sfx_js_2', scream2);

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
