import Phaser from 'phaser';
import MusicManager from '../utils/MusicManager';
import SceneTransition from '../utils/SceneTransition';
import Player from '../components/Player';
import JumpScare from '../components/JumpScare.js';

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

    this.parallax = [{ ts: l5, speed: 0.24 }]; // slightly faster layer factor

    // --- Optional: enable more strips one by one ---
    // this.#addLayerFitToHeight('bg_l4', 0.18, 'bottom', -16, 0.95, 2); // distant silhouettes
    // this.#addLayerFitToHeight('bg_l6', 0.22, 'bottom', -28, 0.95, 2);
    // this.#addLayerFitToHeight('bg_l1', 0.06, 'bottom',   0, 1.00, 0);
    // this.#addLayerFitToHeight('bg_l2', 0.30, 'top',     90, 0.45, 4, Phaser.BlendModes.SCREEN);
    // this.#addLayerFitToHeight('bg_l7', 0.34, 'top',    300, 0.50, 5, Phaser.BlendModes.SCREEN);
    // this.#addLayerFitToHeight('bg_l8', 0.40, 'bottom', -12, 1.00, 6);

    this.jumpScare = new JumpScare(this, { invertMs: 1200 });
    this.controlsInverted = false;
    this.jumpScare.startAuto({ min: 12, max: 24 });
    this.input.keyboard.on('keydown-J', () => this.jumpScare.trigger()); // Remove later!

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

    this.musicButton = MusicManager.createMusicButton(this, W - 20, 20);
    this.setupJumpControls();
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

  update(_t, delta) {
    if (this.parallax.length === 0) return;
    const base = (this.gameSpeed * delta) / 1000;
    for (const l of this.parallax) l.ts.tilePositionX += base * l.speed;
  }
}

export default GameScene;
