import Phaser from 'phaser';

// Main plate
import bgLayer05 from '../assets/backgrounds/parallax/Spooky_Cemetery_Layer_05.png';

// Optional (kept loaded; enable via helper when needed)
import bgLayer01 from '../assets/backgrounds/parallax/Spooky_Cemetery_Layer_01.png';
import bgLayer02 from '../assets/backgrounds/parallax/Spooky_Cemetery_Layer_02.png';
import bgLayer03 from '../assets/backgrounds/parallax/Spooky_Cemetery_Layer_03.png';
import bgLayer04 from '../assets/backgrounds/parallax/Spooky_Cemetery_Layer_04.png';
import bgLayer06 from '../assets/backgrounds/parallax/Spooky_Cemetery_Layer_06.png';
import bgLayer07 from '../assets/backgrounds/parallax/Spooky_Cemetery_Layer_07.png';
import bgLayer08 from '../assets/backgrounds/parallax/Spooky_Cemetery_Layer_08.png';
import bgLayer09 from '../assets/backgrounds/parallax/Spooky_Cemetery_Layer_09.png';

// --- Adjust parallax layer order, depth, and motion below ---
// Ordered from furthest back (index 0) to closest foreground.
// - Change `factor` to tweak scroll speed (lower = further back).
// - Change `depth` for draw stacking.
// - Change `offsetY` to nudge vertical placement.
// Mark exactly one layer `primary: true` to drive score distance and set the reference scale.
export const PARALLAX_LAYERS = [
  // L9: adjust factor/offset to change sky pace/height
  { key: 'bg_l9', factor: 0.45, depth: 0, align: 'bottom', offsetY: -48, alpha: 0.9, note: 'L9 - night sky backdrop (farthest background)' },
  // L8: distant ridge behind L7
  { key: 'bg_l8', factor: 0.6, depth: 1, align: 'bottom', offsetY: -36, alpha: 0.95, note: 'L8 - distant ridgeline (behind L7)' },
  // L7: fog band overlay using SCREEN blend
  { key: 'bg_l7', factor: 0.75, depth: 2, align: 'top', offsetY: 260, alpha: 0.7, blend: Phaser.BlendModes.SCREEN, note: 'L7 - upper fog bands (in front of L8)' },
  // L6: far tree line depth/height
  { key: 'bg_l6', factor: 0.9, depth: 3, align: 'bottom', offsetY: -20, alpha: 0.95, note: 'L6 - far tree line (behind L5)' },
  // L5: main mid-ground; keep primary true
  { key: 'bg_l5', factor: 2.0, depth: 4, align: 'bottom', offsetY: 0, alpha: 1, primary: true, note: 'L5 - primary ground strip (mid layer, matches obstacle speed)' },
  // L4: foreground monuments in front of L5
  { key: 'bg_l4', factor: 0.60, depth: 5, align: 'bottom', offsetY: -2, alpha: 0.95, note: 'L4 - foreground monuments (front of L5)' },
  // L3: shares L5 scale; adjust offset for height
//   { key: 'bg_l3', factor: 0.85, depth: 6, align: 'bottom', offsetY: -8, alpha: 0.9, matchPrimaryScale: true, fillHeight: false, note: 'L3 - near pylons (front of L4)' },
  // L2: fast-moving fog on top blend
  { key: 'bg_l2', factor: 0.2, depth: 7, align: 'top', offsetY: 110, alpha: 0.55, blend: Phaser.BlendModes.SCREEN, note: 'L2 - drifting fog (front of L3)' },
  // L1: foreground glow; matches L5 scale
//   { key: 'bg_l1', factor: 0.85, depth: 8, align: 'bottom', offsetY: -28, alpha: 0.9, matchPrimaryScale: true, fillHeight: false, note: 'L1 - closest glow (foreground)' },
];

export const PARALLAX_TEXTURES = {
  bg_l9: bgLayer09,
  bg_l8: bgLayer08,
  bg_l7: bgLayer07,
  bg_l6: bgLayer06,
  bg_l5: bgLayer05,
  bg_l4: bgLayer04,
  bg_l3: bgLayer03,
  bg_l1: bgLayer01,
  bg_l2: bgLayer02,
};

export default class ParallaxManager {
  constructor(scene, { layers = PARALLAX_LAYERS } = {}) {
    this.scene = scene;
    this.layersConfig = layers;
    this.entries = [];
    this.primaryFactor = 1;
    this.primaryScale = 1;
  }

  preload(textures = PARALLAX_TEXTURES) {
    this.textures = textures;
    for (const [key, src] of Object.entries(textures)) {
      if (!this.scene.textures.exists(key)) this.scene.load.image(key, src);
    }
  }

  create() {
    const { scene } = this;
    this.entries.length = 0;
    this.primaryFactor = 1;
    this.primaryScale = 1;

    for (const cfg of this.layersConfig) this.#addLayer(cfg);

    return {
      primaryFactor: this.primaryFactor,
      primaryScale: this.primaryScale,
    };
  }

  update(baseSpeed, defaultFactor = this.primaryFactor) {
    for (const layer of this.entries) {
      if (!layer?.ts) continue;
      const f = layer.factor ?? defaultFactor;
      layer.ts.tilePositionX += baseSpeed * f;
    }
  }

  pause() {
    // tileSprites don't animate by default; nothing required
  }

  resume() {
    // noop
  }

  getPrimaryFactor() { return this.primaryFactor; }
  getPrimaryScale() { return this.primaryScale; }

  #addLayer(config) {
    const {
      key, factor = 1, align = 'bottom', offsetY = 0, alpha = 1, depth = 1,
      blend = null, note, primary = false, matchPrimaryScale = false,
      scale, fillHeight = true
    } = config;

    if (!this.scene.textures.exists(key)) return null;

    const { width: W, height: H } = this.scene.scale;
    const src = this.scene.textures.get(key).getSourceImage();
    if (!src) return null;

    const defaultScale = H / src.height;
    let tileScale = typeof scale === 'number' ? scale : defaultScale;

    if (matchPrimaryScale) tileScale = this.primaryScale ?? defaultScale;

    const drawW = Math.round(src.width * tileScale);
    const drawH = Math.round(src.height * tileScale);
    const tileHeight = fillHeight ? H : Math.max(drawH, 2);

    const ts = this.scene.add
      .tileSprite(0, 0, W + 2, tileHeight, key)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(depth)
      .setAlpha(alpha);

    ts.tileScaleX = tileScale;
    ts.tileScaleY = tileScale;
    ts.y = align === 'top' ? Math.round(offsetY) : Math.round(H - drawH + offsetY);

    const centerOffset = Math.round((W - drawW) / 2);
    ts.tilePositionX = -centerOffset;
    if (blend) ts.setBlendMode(blend);

    this.entries.push({ ts, factor, key, note, primary });

    if (primary) {
      this.primaryFactor = factor;
      this.primaryScale = tileScale;
    }
  }
}
