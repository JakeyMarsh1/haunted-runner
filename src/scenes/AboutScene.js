// src/scenes/AboutScene.js
import Phaser from 'phaser';
import avatarJakeImg from '../assets/avatars/jake.png';
import avatarChahinezImg from '../assets/avatars/chahinez.jpg';
import avatarSoumyaImg from '../assets/avatars/soumya.jpg';
import avatarKarolisImg from '../assets/avatars/karolis.jpg';

const TEAM = [
  { key: 'avatar_jake',     name: 'Jake',     role: 'Scrum Master',
    links: [{ label: 'GitHub', url: 'https://github.com/example1' },
            { label: 'LinkedIn', url: 'https://example.com' }] },
  { key: 'avatar_chahinez', name: 'Chahinez', role: 'Game Dev',
    links: [{ label: 'GitHub', url: 'https://github.com/example2' },
            { label: 'LinkedIn', url: 'https://example.com' }] },
  { key: 'avatar_soumya',   name: 'Soumya',   role: 'Documentation',
    links: [{ label: 'GitHub', url: 'https://github.com/example3' },
            { label: 'LinkedIn', url: 'https://www.linkedin.com/in/soumya-sharma-a34b76374/' }] },
  { key: 'avatar_karolis',  name: 'Karolis',  role: 'Emotional Support',
    links: [{ label: 'GitHub', url: 'https://github.com/kpetrauskas92' },
            { label: 'LinkedIn', url: 'https://www.linkedin.com/in/pkarolisdev/' }] },
];

const AVATAR_ASSETS = [
  { key: 'avatar_jake', src: avatarJakeImg },
  { key: 'avatar_chahinez', src: avatarChahinezImg },
  { key: 'avatar_soumya', src: avatarSoumyaImg },
  { key: 'avatar_karolis', src: avatarKarolisImg },
];

export default class AboutScene extends Phaser.Scene {
  constructor() { super('AboutScene'); }

  preload() {
    AVATAR_ASSETS.forEach(({ key, src }) => {
      if (!this.textures.exists(key)) {
        this.load.image(key, src);
      }
    });
  }

  create() {
    // Screen dimensions
    const { width: W, height: H } = this.scale;
    this.cameras.main.setBackgroundColor('#0b0f14');
    this.add.rectangle(0, 0, W, H, 0x0b0f14).setOrigin(0);

    // Title
    this.add.text(W/2, 60, 'ABOUT THE TEAM', {
      fontFamily: '"Creepster", cursive',
      fontSize: 64, color: '#ff3333', stroke: '#000', strokeThickness: 6
    }).setOrigin(0.5);

    // Grid Config
    const cols = 2;
    const rows = Math.ceil(TEAM.length / cols);
    const cardW = Math.min(420, Math.floor(W * 0.44));
    const cardH = 210;
    const gapX = 40;
    const gapY = 30;

    // Calculate vertical space needed for grid, center vertically
    const gridWidth = cols * cardW + (cols - 1) * gapX;
    const gridHeight = rows * cardH + (rows - 1) * gapY;
    const startX = (W - gridWidth) / 2 + cardW/2;
    const startY = Math.max(120, (H - gridHeight) / 2);

    this._avatarMaskShapes = [];
    this.events.once('shutdown', () => {
      this._avatarMaskShapes.forEach(g => g.destroy());
      this._avatarMaskShapes.length = 0;
    });

    TEAM.forEach((m, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const cardCenterX = startX + col * (cardW + gapX);
      const cardTopY = startY + row * (cardH + gapY);

      // Card background
      const card = this.add.rectangle(cardCenterX, cardTopY, cardW, cardH, 0x111827, 0.97)
        .setOrigin(0.5, 0);
      card.setStrokeStyle(2, 0x1f2937, 1);

      // Avatar + circle
      const avatarX = cardCenterX - cardW/2 + 65;
      const avatarY = cardTopY + 70;

      const avatarContainer = this.add.container(avatarX, avatarY);

      const circleBG = this.add.graphics();
      circleBG.fillStyle(0x27272a, 1).fillCircle(0, 0, 48);
      circleBG.lineStyle(2, 0x1f2937, 1).strokeCircle(0, 0, 48);
      avatarContainer.add(circleBG);

      if (this.textures.exists(m.key)) {
        const avatarImage = this.add.image(0, 0, m.key).setDisplaySize(96, 96).setOrigin(0.5);
        avatarContainer.add(avatarImage);

        const maskShape = this.make.graphics({ x: avatarX, y: avatarY, add: false });
        maskShape.fillStyle(0xffffff, 1).fillCircle(0, 0, 48);
        const mask = maskShape.createGeometryMask();
        avatarImage.setMask(mask);
        this._avatarMaskShapes.push(maskShape);
      } else {
        const placeholder = this.add.text(0, 0, m.name[0].toUpperCase(), {
          fontFamily: '"Creepster", cursive',
          fontSize: 46, color: '#e5e7eb'
        }).setOrigin(0.5);
        avatarContainer.add(placeholder);
      }

      // Name (right of avatar)
      const name = this.add.text(avatarX + 75, cardTopY + 50, m.name.toUpperCase(), {
        fontFamily: '"Creepster", cursive',
        fontSize: 36, color: '#f87171', stroke: '#000', strokeThickness: 2
      }).setOrigin(0, 0.5);

      // Role (under name)
      const role = this.add.text(avatarX + 75, cardTopY + 93, m.role, {
        fontFamily: '"Creepster", cursive', fontSize: 22, color: '#fde68a'
      }).setOrigin(0, 0.5);

      // Links at bottom of card
      const linkY = cardTopY + cardH - 28;

      // GitHub (bottom-left)
      const githubLink = this.add.text(cardCenterX - cardW / 2 + 25, linkY, 'GITHUB', {
        fontFamily: '"Creepster", cursive',
        fontSize: 22,
        color: '#93c5fd'
      }).setOrigin(0, 0.5);

      // LinkedIn (bottom-right)
      const linkedinLink = this.add.text(cardCenterX + cardW / 2 - 25, linkY, 'LINKEDIN', {
        fontFamily: '"Creepster", cursive',
        fontSize: 22,
        color: '#93c5fd'
      }).setOrigin(1, 0.5);

      // Interactivity
      [githubLink, linkedinLink].forEach((linkText, idx) => {
        const url = m.links[idx].url;
        linkText.setInteractive({ useHandCursor: true });
        linkText.on('pointerover', () => linkText.setColor('#ffffff'));
        linkText.on('pointerout', () => linkText.setColor('#93c5fd'));
        linkText.on('pointerup', () => window.open(url, '_blank'));
      });
    });

    // Back button (fixed position at bottom)
    this.add.text(W/2, H - 36, 'Back', {
      fontFamily: '"Creepster", cursive', fontSize: 32,
      color: '#9ca3af', stroke: '#000', strokeThickness: 3
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .setDepth(20)
    .on('pointerup', () => this.scene.start('MenuScene'));
  }
}
