import Phaser from 'phaser';
import MusicManager from '../utils/MusicManager';
import SceneTransition from '../utils/SceneTransition';
import Player from '../components/Player';
import JumpScare from '../components/JumpScare.js';
import Obstacle from '../components/Obstacle.js';

// Main plate
import bgLayer05 from '../assets/backgrounds/parallax/Spooky_Cemetery_Layer_05.png';

// Optional (kept loaded; enable via helper when needed)
import bgLayer01 from '../assets/backgrounds/parallax/Spooky_Cemetery_Layer_01.png';
import bgLayer02 from '../assets/backgrounds/parallax/Spooky_Cemetery_Layer_02.png';
import bgLayer04 from '../assets/backgrounds/parallax/Spooky_Cemetery_Layer_04.png';
import bgLayer06 from '../assets/backgrounds/parallax/Spooky_Cemetery_Layer_06.png';
import bgLayer07 from '../assets/backgrounds/parallax/Spooky_Cemetery_Layer_07.png';
import bgLayer08 from '../assets/backgrounds/parallax/Spooky_Cemetery_Layer_08.png';

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.parallax = [];
    this.gameSpeed = 340;
    this.backgroundSpeedMultiplier = 2.0; // Even faster background
    this.obstacleSpeedMultiplier = 0.8; // Slightly faster obstacles
    
    // Scoring system
    this.distanceTraveled = 0; // Track total distance in pixels
    this.score = 0; // Simple score based on distance
    
    // Pause state (don't pause scene, use flag instead to avoid AudioContext issues)
    this.isPaused = false;
  }

  init(data) {
    // Get preferences from MenuScene or defaults
    const menuScene = this.scene.get('MenuScene');
    this.jumpscareEnabled = menuScene?.jumpscareEnabled ?? true;
    this.musicEnabled = menuScene?.musicEnabled ?? true;
  }

  init(data) {
    // Get preferences from MenuScene or defaults
    const menuScene = this.scene.get('MenuScene');
    this.jumpscareEnabled = menuScene?.jumpscareEnabled ?? true;
    this.musicEnabled = menuScene?.musicEnabled ?? true;
  }

  preload() {
    if (!this.textures.exists('bg_l5')) this.load.image('bg_l5', bgLayer05);

    // Preload other strips to toggle them later
    if (!this.textures.exists('bg_l1')) this.load.image('bg_l1', bgLayer01);
    if (!this.textures.exists('bg_l2')) this.load.image('bg_l2', bgLayer02);
    if (!this.textures.exists('bg_l4')) this.load.image('bg_l4', bgLayer04);
    if (!this.textures.exists('bg_l6')) this.load.image('bg_l6', bgLayer06);
    if (!this.textures.exists('bg_l7')) this.load.image('bg_l7', bgLayer07);
    if (!this.textures.exists('bg_l8')) this.load.image('bg_l8', bgLayer08);
  }

  create() {
    const { width: W, height: H } = this.scale;

    SceneTransition.setupFadeIn(this, 800);
    MusicManager.setupMusic(this, 'gameMusic');

    // Create zombie hand animation if it doesn't exist
    if (!this.anims.exists('zombieHandAnim')) {
      this.anims.create({
        key: 'zombieHandAnim',
        frames: this.anims.generateFrameNumbers('zombieHand', { start: 0, end: 24 }), // 25 frames total
        frameRate: 10,
        repeat: -1,
      });
    }

    // --- L5 only, fit-to-height, full-width tile area (no side gaps) ---
    const src = this.textures.get('bg_l5').getSourceImage();
    const scaleFitH = H / src.height;                  // 720/768 = 0.9375
    const drawW = Math.round(src.width * scaleFitH);   // 900
    const drawH = H;                                   // 720

    const l5 = this.add
      .tileSprite(0, 0, W + 2, drawH, 'bg_l5')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(3)
      .setAlpha(1);

    l5.tileScaleX = scaleFitH;
    l5.tileScaleY = scaleFitH;
    l5.y = H - drawH;

    // Center the texture inside the tile area by shifting tile offset
    const centerOffset = Math.round((W - drawW) / 2);  // 190px on 1280x720
    l5.tilePositionX = -centerOffset;

    this.parallax = [{ ts: l5, speed: this.backgroundSpeedMultiplier }]; // Use shared constant

    // --- Optional: enable more strips one by one ---
    // this.#addLayerFitToHeight('bg_l4', 0.18, 'bottom', -16, 0.95, 2); // distant silhouettes
    // this.#addLayerFitToHeight('bg_l6', 0.22, 'bottom', -28, 0.95, 2);
    // this.#addLayerFitToHeight('bg_l1', 0.06, 'bottom',   0, 1.00, 0);
    // this.#addLayerFitToHeight('bg_l2', 0.30, 'top',     90, 0.45, 4, Phaser.BlendModes.SCREEN);
    // this.#addLayerFitToHeight('bg_l7', 0.34, 'top',    300, 0.50, 5, Phaser.BlendModes.SCREEN);
    // this.#addLayerFitToHeight('bg_l8', 0.40, 'bottom', -12, 1.00, 6);

    this.jumpScare = new JumpScare(this, { invertMs: 1200 });
    this.controlsInverted = false;
    
    // Only enable jump scares if user consented
    if (this.jumpscareEnabled) {
      this.jumpScare.startAuto({ min: 12, max: 24 });
    }
    
    this.input.keyboard.on('keydown-J', () => {
      if (this.jumpscareEnabled) {
        this.jumpScare.trigger();
      }
    }); // Remove later!

    // --- Ground / Player ---
    const FLOOR_Y = H - 112;
    const GROUND_THICKNESS = 8;

    this.ground = this.add.rectangle(
      W / 2,
      FLOOR_Y + GROUND_THICKNESS / 2,
      W,
      GROUND_THICKNESS,
      0x000000,
      0
    );
    this.physics.add.existing(this.ground, true);

    this.player = new Player(this, 250, 0);
    this.player.setDepth(100);

    const body = this.player.body;
    this.player.y = FLOOR_Y - body.halfHeight + 1;
    body.updateFromGameObject();
    this.player.markGrounded();

    this.physics.add.collider(this.player, this.ground, () => this.player.markGrounded());

    // Obstacles array (not a Phaser group, since Obstacle is a custom class)
    this.obstacles = [];
    this.lastObstacleSpawnTime = 0;
    this.obstacleSpawnInterval = this.getRandomSpawnInterval(); // Random interval for first spawn

    this.musicButton = MusicManager.createMusicButton(this, W - 20, 20);
    this.setupJumpControls();

    // --- Settings Button (Pause) ---
    const settingsButton = this.add.text(W - 90, 32, '⚙️', {
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
      this.isPaused = true;
      this.pauseAnimations();
      this.scene.launch('PauseScene');
    });

    // P key to pause/unpause
    this.input.keyboard.on('keydown-P', () => {
      if (this.isPaused) {
        // Unpause
        this.isPaused = false;
        this.resumeAnimations();
        this.scene.stop('PauseScene');
      } else {
        // Pause
        this.isPaused = true;
        this.pauseAnimations();
        this.scene.launch('PauseScene');
      }
    });

    this.setupJumpControls();

    // --- Score Display HUD ---
    this.distanceTraveled = 0; // Initialize here as well
    this.score = 0; // Initialize here as well
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '32px',
      fill: '#00ff00',
      fontStyle: 'bold',
      fontFamily: 'Arial'
    });
    this.scoreText.setScrollFactor(0); // Fixed to camera, doesn't scroll
    this.scoreText.setDepth(200); // Above all game objects
  }

  // Helper: adds a strip using the same fit-to-height strategy and centered texture
  #addLayerFitToHeight(key, speed, align, yOffset, alpha, depth, blend = null) {
    if (!this.textures.exists(key)) return;
    const { width: W, height: H } = this.scale;
    const src = this.textures.get(key).getSourceImage();

    const s = H / src.height;
    const drawW = Math.round(src.width * s);
    const drawH = H;

    const ts = this.add
      .tileSprite(0, 0, W + 2, drawH, key)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(depth)
      .setAlpha(alpha);

    ts.tileScaleX = s;
    ts.tileScaleY = s;

    ts.y = (align === 'top') ? Math.round(yOffset) : Math.round(H - drawH + yOffset);

    // center texture in the tile area with offset
    const centerOffset = Math.round((W - drawW) / 2);
    ts.tilePositionX = -centerOffset;

    if (blend) ts.setBlendMode(blend);

    this.parallax.push({ ts, speed });
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
    // Disable input
    this.input.enabled = false;
    
    // Pause all sprite animations
    this.player.anims.pause();
    this.obstacles.forEach(obs => {
      if (obs.sprite && obs.sprite.anims) {
        obs.sprite.anims.pause();
      }
    });
    
    // Pause jumpscare animations if active
    if (this.jumpScare) {
      this.jumpScare.pauseAnimations();
    }
  }

  resumeAnimations() {
    // Enable input
    this.input.enabled = true;
    
    // Resume all sprite animations
    this.player.anims.resume();
    this.obstacles.forEach(obs => {
      if (obs.sprite && obs.sprite.anims) {
        obs.sprite.anims.resume();
      }
    });
    
    // Resume jumpscare animations
    if (this.jumpScare) {
      this.jumpScare.resumeAnimations();
    }
  }

  update(_t, delta) {
    if (this.parallax.length === 0) return;
    if (this.isPaused) return; // Don't update game when paused
    
    const base = (this.gameSpeed * delta) / 1000;
    const backgroundMove = base * this.backgroundSpeedMultiplier;
    const obstacleMove = base * this.obstacleSpeedMultiplier;
    
    // Track distance and calculate score (10% speed: 1 pixel = 0.1 points)
    const distanceThisFrame = backgroundMove;
    this.distanceTraveled += distanceThisFrame;
    this.score = Math.floor(this.distanceTraveled * 0.1); // Score = distance * 10%
    
    // Update score display
    if (this.scoreText) {
      this.scoreText.setText(`Score: ${this.score.toLocaleString()}`);
    }
    
    // Move background layers
    for (const l of this.parallax) {
      l.ts.tilePositionX += backgroundMove;
    }

    // Spawn obstacles at intervals
    this.lastObstacleSpawnTime += delta;
    if (this.lastObstacleSpawnTime >= this.obstacleSpawnInterval) {
      this.spawnObstacle();
      this.lastObstacleSpawnTime = 0;
      this.obstacleSpawnInterval = this.getRandomSpawnInterval();
    }

    // Update all obstacles with slower movement
    this.obstacles = this.obstacles.filter((obstacle) => {
      obstacle.update(obstacleMove);

      // Check collision with player
      if (this.physics.overlap(this.player, obstacle.sprite)) {
        obstacle.onCollide(this.player);
        return false;
      }

      return obstacle.sprite.active;
    });
  }

  spawnObstacle() {
    const { width: W, height: H } = this.scale;
    const FLOOR_Y = H - 112;

    // Spawn obstacles FIXED at floor level where player walks
    const obstacleY = FLOOR_Y;

    // Spawn off-screen to the right
    const obstacle = new Obstacle(this, W + 50, obstacleY);
    this.obstacles.push(obstacle);

    if (import.meta.env.DEV) {
      console.log('Obstacle spawned at floor Y:', obstacleY);
    }
  }

  getRandomSpawnInterval() {
    // Random spawn interval between 3 and 5 seconds (farther apart)
    return Phaser.Math.Between(3000, 5000);
  }

}

export default GameScene;
