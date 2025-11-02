// src/scenes/HighScoreScene.js
import Phaser from 'phaser';
import { fetchTopScores, isSupabaseConfigured } from '../utils/SupabaseClient';

const TITLES = [
  'GHOST KING','WITCH CASS','ZOMBO-REX','SPIDER WEBSTER',
  'PUMPKIN JACK','BAT COUNT','DRACULA JR','MUMMY TOMB',
  'SPIRIT SUE','CRYPT CRAWLER'
];

export default class HighScoreScene extends Phaser.Scene {
  constructor() { 
    super('HighScoreScene');
    this.returnScore = null;
    this.returnName = '';
  }

  init(data) {
    this.returnScore = data?.score ?? null;
    this.returnName = data?.name ?? '';
    if (import.meta.env.DEV) {
      console.log('[HighScoreScene] init', data);
    }
  }

  create() {
    const { width: W, height: H } = this.scale;

    // background
    this.add.rectangle(0, 0, W, H, 0x0b0f14).setOrigin(0);

    // title
    this.add.text(W / 2, 60, 'LEADERBOARD', {
      fontFamily: '"Creepster", cursive',
      fontSize: 56,
      color: '#f87171',
      stroke: '#000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // table frame
    const table = { x: Math.round(W * 0.08), y: 120, w: Math.round(W * 0.84), h: 440 };
    const g = this.add.graphics();
    g.lineStyle(2, 0x64748b, 1);
    g.fillStyle(0x0f172a, 0.85);
    g.fillRoundedRect(table.x, table.y, table.w, table.h, 8);
    g.strokeRoundedRect(table.x, table.y, table.w, table.h, 8);

    // column alignment (Rank, Name, Score)
    const COL_RANK_X  = table.x + 32;
    const COL_NAME_X  = table.x + table.w * 0.50;
    const COL_SCORE_X = table.x + table.w - 80;

    // header
    this.add.text(COL_RANK_X, table.y + 18, 'RANK',  headerStyle());
    this.add.text(COL_NAME_X, table.y + 18, 'NAME',  headerStyle()).setOrigin(0.5, 0);
    this.add.text(COL_SCORE_X, table.y + 18, 'SCORE', headerStyle()).setOrigin(1, 0);

    // load rows
    this._loadAndRender(table, COL_RANK_X, COL_NAME_X, COL_SCORE_X)
      .catch(() => {
        const dummy = [
          { name: 'GHOST KING', score: 9999 },
          { name: 'WITCH CASS', score: 8700 },
          { name: 'ZOMBO-REX', score: 7600 },
        ];
        this._renderRows(table, COL_RANK_X, COL_NAME_X, COL_SCORE_X, dummy);
      });

    // back button
    makeButton(this, W / 2, H - 60, 260, 46, 10, 0xf97316, 'BACK TO GAME OVER', () => {
      this.scene.start('GameOverScene', {
        score: this.returnScore ?? 0,
        name: this.returnName ?? '',
      });
    });
  }

  async _loadAndRender(table, rx, nx, sx) {
    if (!isSupabaseConfigured()) throw new Error('no supabase');
    const rows = await fetchTopScores(10);
    this._renderRows(table, rx, nx, sx, rows);
  }

  _renderRows(table, rx, nx, sx, rows) {
    const rowH = 42;
    const startY = table.y + 58;

    rows.slice(0, 10).forEach((r, i) => {
      const y = startY + i * rowH;
      const { label, color, medal } = podium(i);

      // horizontal line
      this.add.line(0, 0, table.x + 16, y + rowH - 1, table.x + table.w - 16, y + rowH - 1, 0x1f2937, 1).setOrigin(0);

      // rank title
      this.add.text(rx, y + 6, `${medal} ${label}`, rowStyle(color));

      // name centered
      this.add.text(nx, y + 6, (r.name || '—').toUpperCase(), rowStyle('#e5e7eb')).setOrigin(0.5, 0);

      // score right-aligned
      this.add.text(sx, y + 6, Number(r.score ?? 0).toLocaleString(), rowStyle('#f8fafc')).setOrigin(1, 0);
    });
  }
}

/* style + helper functions */
function headerStyle() {
  return { fontFamily: 'monospace', fontSize: 20, color: '#e2e8f0' };
}
function rowStyle(color) {
  return { fontFamily: 'monospace', fontSize: 18, color };
}
function podium(i) {
  if (i === 0) return { medal: '👑', color: '#fde68a', label: 'GHOST KING 1' };
  if (i === 1) return { medal: '🥈', color: '#cbd5e1', label: 'WITCH CASS 2' };
  if (i === 2) return { medal: '🥉', color: '#fca5a5', label: 'ZOMBO-REX 3' };
  const title = TITLES[i] || `RANK ${i + 1}`;
  return { medal: ' ', color: '#a7b0c0', label: `${title} ${i + 1}` };
}
function makeButton(scene, cx, cy, w, h, r, color, label, onUp) {
  const g = scene.add.graphics();
  g.fillStyle(color, 1);
  g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, r);
  const zone = scene.add.zone(cx, cy, w, h).setOrigin(0.5).setInteractive({ useHandCursor: true });
  zone.on('pointerup', onUp);
  scene.add.text(cx, cy, label, { fontFamily: 'Inter, sans-serif', fontSize: 20, color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
}
