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
import zombieHandSprite from '../assets/sprites/ZombieHand.png';

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

    // Skully Running Spritesheet (12 frames, 900x900 each)
    this.load.spritesheet("player", skullyRunningSpriteSheet, {
      frameWidth: 900,
      frameHeight: 900,
    });

    // Skully Jump Animations (6 frames each, 900x900 each)
    this.load.spritesheet("skullyJumpStart", skullyJumpStartSpriteSheet, {
      frameWidth: 900,
      frameHeight: 900,
    });

    this.load.spritesheet("skullyInAir", skullyInAirSpriteSheet, {
      frameWidth: 900,
      frameHeight: 900,
    });

    this.load.spritesheet("skullyFalling", skullyFallingSpriteSheet, {
      frameWidth: 900,
      frameHeight: 900,
    });

    // Skully Death Animation (15 frames, 900x900 each)
    this.load.spritesheet("skullyDeath", skullyDeathSpriteSheet, {
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

      SceneTransition.fadeToScene(this, "MenuScene", 400);
    });
  }

  create() {
    // No-op: create will run after preload; transition handled in the loader 'complete' callback.
  }
}
