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

    this._kbDownHandlers = [];
    this._kbUpHandlers = [];
    this._ptrHandlers = [];
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
    // hard reset of any stale overlay/paused state
    this.isPaused = false;
    this.input.enabled = true;
    if (this.physics?.world?.isPaused) this.physics.world.resume();
    if (this.scene.isActive('PauseScene')) this.scene.stop('PauseScene');

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
    this._bindKeyDown('J', () => { if (this.jumpscareEnabled) this.jumpScare.trigger(); });

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

    this._bindKeyDown('P', () => {
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

    // lifecycle cleanup hooks
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this._onShutdown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this._onShutdown, this);
  }

  setupJumpControls() {
    const press = () => this.player?.pressJump?.();
    const release = () => this.player?.releaseJump?.();

    this._bindKeyDown('SPACE', press);
    this._bindKeyUp('SPACE', release);

    const ptrDown = (p) => {
      if (this.musicButton?.getBounds?.()?.contains(p.x, p.y)) return;
      press();
    };
    const ptrUp = () => release();

    this.input.on('pointerdown', ptrDown);
    this.input.on('pointerup', ptrUp);

    this._ptrHandlers.push(['pointerdown', ptrDown], ['pointerup', ptrUp]);
  }

  pauseAnimations() {
    this.input.enabled = false;
    if (this.player?.anims) this.player.anims.pause();
    this.obstacles?.pause?.();
    this.jumpScare?.pauseAnimations?.();
    this.parallax?.pause?.();
    if (this.physics?.world) this.physics.world.pause();
  }

  resumeAnimations() {
    if (this.physics?.world?.isPaused) this.physics.world.resume();
    this.input.enabled = true;
    if (this.player?.anims) this.player.anims.resume();
    this.obstacles?.resume?.();
    this.jumpScare?.resumeAnimations?.();
    this.parallax?.resume?.();
  }

  update(_t, delta) {
    if (this.scene.isActive('PauseScene')) return;
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

  // --- internal: input binding helpers and cleanup ---

  _bindKeyDown(key, fn) {
    this.input.keyboard.on(`keydown-${key}`, fn);
    this._kbDownHandlers.push([`keydown-${key}`, fn]);
  }

  _bindKeyUp(key, fn) {
    this.input.keyboard.on(`keyup-${key}`, fn);
    this._kbUpHandlers.push([`keyup-${key}`, fn]);
  }

  _removeInputBindings() {
    // keyboard
    for (const [evt, fn] of this._kbDownHandlers) this.input.keyboard.off(evt, fn);
    for (const [evt, fn] of this._kbUpHandlers) this.input.keyboard.off(evt, fn);
    this._kbDownHandlers.length = 0;
    this._kbUpHandlers.length = 0;

    // pointer
    for (const [evt, fn] of this._ptrHandlers) this.input.off(evt, fn);
    this._ptrHandlers.length = 0;
  }

  _onShutdown() {
    this._removeInputBindings();
    this.obstacles?.destroy?.();
    this.jumpScare?.destroy?.();
    // do not destroy parallax textures; manager should handle its own cleanup
    this.musicButton = null;
  }
}

export default GameScene;
