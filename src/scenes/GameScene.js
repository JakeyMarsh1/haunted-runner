import Phaser from 'phaser';
import MusicManager from '../utils/MusicManager';
import SceneTransition from '../utils/SceneTransition';
import Player from '../components/Player';
import JumpScare from '../components/JumpScare.js';

import ParallaxManager, { PARALLAX_LAYERS, PARALLAX_TEXTURES } from '../utils/ParallaxManager';
import ObstacleManager from '../utils/ObstacleManager';
import DifficultyManager from '../utils/DifficultyManager';

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');

    this.baseGameSpeed = 340;
    this.currentGameSpeed = this.baseGameSpeed;
    this.primaryParallaxFactor = 1;
    this.obstacleConfig = {
      speedMultiplier: 0.8,
      intervalMs: [2200, 3600],
      floorYOffset: 112,
    };
    this.difficulty = null;
    this.distanceTraveled = 0;
    this.score = 0;

    this.isPaused = false;
  }

  init() {
    const menuScene = this.scene.get('MenuScene');
    this.jumpscareEnabled = menuScene?.jumpscareEnabled ?? true;
    this.musicEnabled = menuScene?.musicEnabled ?? true;
  }

  preload() {
    this.parallax = new ParallaxManager(this, { layers: PARALLAX_LAYERS });
    this.parallax.preload(PARALLAX_TEXTURES);
  }

  create() {
    const { width: W, height: H } = this.scale;

    SceneTransition.setupFadeIn(this, 800);
    MusicManager.setupMusic(this, 'gameMusic');

    if (!this.anims.exists('zombieHandAnim')) {
      this.anims.create({
        key: 'zombieHandAnim',
        frames: this.anims.generateFrameNumbers('zombieHand', { start: 0, end: 24 }),
        frameRate: 10,
        repeat: -1,
      });
    }

    const { primaryFactor } = this.parallax.create();
    this.primaryParallaxFactor = primaryFactor;

    this.jumpScare = new JumpScare(this, { invertMs: 1200 });
    this.controlsInverted = false;
    if (this.jumpscareEnabled) this.jumpScare.startAuto({ min: 12, max: 24 });
    this.input.keyboard.on('keydown-J', () => { if (this.jumpscareEnabled) this.jumpScare.trigger(); });

    // Ground / Player
    const FLOOR_Y = H - 112;
    const GROUND_THICKNESS = 8;

    this.ground = this.add.rectangle(
      W / 2, FLOOR_Y + GROUND_THICKNESS / 2, W, GROUND_THICKNESS, 0x000000, 0
    );
    this.physics.add.existing(this.ground, true);

    this.player = new Player(this, 250, 0);
    this.player.setDepth(100);
    const body = this.player.body;
    this.player.y = FLOOR_Y - body.halfHeight + 1;
    body.updateFromGameObject();
    this.player.markGrounded();
    this.physics.add.collider(this.player, this.ground, () => this.player.markGrounded());

    // Difficulty first
    this.difficulty = new DifficultyManager({
      baseGameSpeed: this.baseGameSpeed,
      obstacleSpeedMultiplier: this.obstacleConfig.speedMultiplier ?? 0.8,
      parallaxPrimaryFactor: this.primaryParallaxFactor,
    });

    // Obstacles with dynamic spawn interval provider
    this.obstacles = new ObstacleManager(this, {
      ...this.obstacleConfig,
      intervalProvider: (score) => this.difficulty.getSpawnIntervalRange(score),
    });

    this.musicButton = MusicManager.createMusicButton(this, W - 20, 20);
    this.setupJumpControls();

    // Pause button
    const settingsButton = this.add.text(W - 90, 32, '⚙', { fontSize: '28px', fontFamily: 'Arial' })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .setDepth(100);

    settingsButton.on('pointerover', () => settingsButton.setScale(1.2));
    settingsButton.on('pointerout', () => settingsButton.setScale(1.0));
    settingsButton.on('pointerdown', () => {
      this.isPaused = true;
      this.pauseAnimations();
      this.scene.launch('PauseScene');
    });

    this.input.keyboard.on('keydown-P', () => {
      if (this.isPaused) {
        this.isPaused = false;
        this.resumeAnimations();
        this.scene.stop('PauseScene');
      } else {
        this.isPaused = true;
        this.pauseAnimations();
        this.scene.launch('PauseScene');
      }
    });

    // HUD
    this.distanceTraveled = 0;
    this.score = 0;
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '32px',
      fill: '#00ff00',
      fontStyle: 'bold',
      fontFamily: 'Arial'
    }).setScrollFactor(0).setDepth(200);
  }

  setupJumpControls() {
    const press = () => this.player.pressJump();
    const release = () => this.player.releaseJump();

    this.input.keyboard.on('keydown-SPACE', press);
    this.input.keyboard.on('keyup-SPACE', release);

    this.input.on('pointerdown', p => {
      if (this.musicButton?.getBounds().contains(p.x, p.y)) return;
      press();
    });
    this.input.on('pointerup', release);
  }

  pauseAnimations() {
    this.input.enabled = false;
    this.player.anims.pause();
    this.obstacles.pause();
    if (this.jumpScare) this.jumpScare.pauseAnimations();
    this.parallax.pause();
  }

  resumeAnimations() {
    this.input.enabled = true;
    this.player.anims.resume();
    this.obstacles.resume();
    if (this.jumpScare) this.jumpScare.resumeAnimations();
    this.parallax.resume();
  }

  update(_t, delta) {
    if (this.isPaused) return;

    const gameSpeed = this.difficulty
      ? this.difficulty.getGameSpeed(this.score)
      : this.baseGameSpeed;
    this.currentGameSpeed = gameSpeed;
    const base = (gameSpeed * delta) / 1000;

    // Scale parallax with difficulty
    const mainFactor = this.difficulty
      ? this.difficulty.getParallaxFactor(this.score)
      : (this.parallax?.getPrimaryFactor?.() ?? this.primaryParallaxFactor ?? 1);

    const backgroundMove = base * mainFactor;

    this.distanceTraveled += backgroundMove;
    this.score = Math.floor(this.distanceTraveled * 0.1);
    if (this.scoreText) this.scoreText.setText(`Score: ${this.score.toLocaleString()}`);

    this.parallax.update(base, mainFactor);
    this.obstacles.update(delta, base, this.player, this.score);
  }
}

export default GameScene;
