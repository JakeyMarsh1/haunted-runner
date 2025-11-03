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
    this.returnTo = data?.from ?? 'GameOverScene';
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

    // column alignment (Rank, Title, Name, Score)
    const COL_RANK_X  = table.x + 32;
    const COL_TITLE_X = table.x + 120;
    const COL_NAME_X  = table.x + Math.round(table.w * 0.40);
    const COL_SCORE_X = table.x + table.w - 80;

    // header
    this.add.text(COL_RANK_X, table.y + 18, 'RANK', headerStyle());
    this.add.text(COL_TITLE_X, table.y + 18, 'TITLE', headerStyle());
    this.add.text(COL_NAME_X, table.y + 18, 'NAME', headerStyle()).setOrigin(0, 0);
    this.add.text(COL_SCORE_X, table.y + 18, 'SCORE', headerStyle()).setOrigin(1, 0);

    // load rows
    this._loadAndRender(
      table,
      { rankX: COL_RANK_X, titleX: COL_TITLE_X, nameX: COL_NAME_X, scoreX: COL_SCORE_X }
    )
      .catch(() => {
        const dummy = [
          { name: 'GHOST KING', score: 9999 },
          { name: 'WITCH CASS', score: 8700 },
          { name: 'ZOMBO-REX', score: 7600 },
        ];
        this._renderRows(
          table,
          { rankX: COL_RANK_X, titleX: COL_TITLE_X, nameX: COL_NAME_X, scoreX: COL_SCORE_X },
          dummy
        );
      });

    // back button
    const backLabel = this.returnTo === 'MenuScene' ? 'BACK TO MENU' : 'BACK TO GAME OVER';
    makeButton(this, W / 2, H - 60, 260, 46, 10, 0xf97316, backLabel, () => {
      if (this.returnTo === 'MenuScene') {
        this.scene.start('MenuScene');
      } else {
        this.scene.start('GameOverScene', {
          score: this.returnScore ?? 0,
          name: this.returnName ?? '',
        });
      }
    });
  }

  async _loadAndRender(table, columns) {
    if (!isSupabaseConfigured()) throw new Error('no supabase');
    const rows = await fetchTopScores(10);
    this._renderRows(table, columns, rows);
  }

  _renderRows(table, columns, rows) {
    const rowH = 42;
    const startY = table.y + 58;

    rows.slice(0, 10).forEach((r, i) => {
      const y = startY + i * rowH;
      const { medal, rankColor, titleColor, title, nameColor } = podium(i);
      const rankNumber = i + 1;

      // horizontal line
      this.add.line(0, 0, table.x + 16, y + rowH - 1, table.x + table.w - 16, y + rowH - 1, 0x1f2937, 1).setOrigin(0);

      // rank number (with medal)
      this.add.text(columns.rankX, y + 6, `${medal} ${rankNumber}`, rowStyle(rankColor));

      // title
      this.add.text(columns.titleX, y + 6, title, rowStyle(titleColor));

      // player name
      this.add.text(columns.nameX, y + 4, (r.name || '-').toUpperCase(), rowStyle(nameColor)).setOrigin(0, 0);

      // score right-aligned
      this.add.text(columns.scoreX, y + 6, Number(r.score ?? 0).toLocaleString(), rowStyle('#f8fafc')).setOrigin(1, 0);
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
  const rank = i + 1;
  const title = TITLES[i] || `RANK ${rank}`;

  if (i === 0) {
    return {
      medal: '👑',
      rankColor: '#fde68a',
      titleColor: '#fde68a',
      nameColor: '#fde68a',
      title,
    };
  }
  if (i === 1) {
    return {
      medal: '🥈',
      rankColor: '#cbd5e1',
      titleColor: '#cbd5e1',
      nameColor: '#cbd5e1',
      title,
    };
  }
  if (i === 2) {
    return {
      medal: '🥉',
      rankColor: '#fca5a5',
      titleColor: '#fca5a5',
      nameColor: '#fca5a5',
      title,
    };
  }
  return {
    medal: ' ',
    rankColor: '#a7b0c0',
    titleColor: '#cbd5f5',
    nameColor: '#e5e7eb',
    title,
  };
}
function makeButton(scene, cx, cy, w, h, r, color, label, onUp) {
  const g = scene.add.graphics();
  g.fillStyle(color, 1);
  g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, r);
  const zone = scene.add.zone(cx, cy, w, h).setOrigin(0.5).setInteractive({ useHandCursor: true });
  zone.on('pointerup', onUp);
  scene.add.text(cx, cy, label, { fontFamily: 'Inter, sans-serif', fontSize: 20, color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
}
