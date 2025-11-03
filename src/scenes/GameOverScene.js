/*
  GameOverScene.js
  Purpose: Display game over screen with final score, player name input, and options to restart or view leaderboard.
  Ready for score data passed from GameScene and Supabase submission.
*/

import Phaser from 'phaser';
import backgroundImg from '../assets/backgrounds/Background1.png';
import evilLaughSfx from '../assets/audio/evil-laugh.mp3';
import {
  submitScore,
  sanitizeName,
  validateName,
  MIN_NAME_LENGTH,
  MAX_NAME_LENGTH,
} from '../utils/HighScoreManager';

const INVALID_NAME_CHAR_REGEX = /[^A-Za-z0-9\s\-']/g;

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
    this.nameInput = null;
    this.nameInputHandler = null;
    this.boundRepositionInput = null;
    this.isSubmitting = false;
    this.scoreSubmitted = false;
    this.layout = {
      promptY: 300,
      inputY: 360,
      submitY: 470,
      statusY: 520,
      actionY: 590,
    };
  }

  init(data) {
    // Receive score from GameScene
    this.finalScore = data?.score ?? 0;
    this.pendingName = data?.name
      ? sanitizeName(data.name).slice(0, MAX_NAME_LENGTH)
      : '';
    if (import.meta.env.DEV) {
      console.log('GameOverScene init -> final score:', this.finalScore);
    }
  }

  preload() {
    if (!this.textures.exists('gameOverBg')) {
      this.load.image('gameOverBg', backgroundImg);
    }
    if (!this.cache.audio.exists('gameOverLaugh')) {
      this.load.audio('gameOverLaugh', evilLaughSfx);
    }
  }

  create() {
    const { promptY, submitY, statusY, actionY } = this.layout;

    // Background
    if (this.textures.exists('gameOverBg')) {
      this.add
        .image(this.cameras.main.centerX, this.cameras.main.centerY, 'gameOverBg')
        .setOrigin(0.5)
        .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
        .setDepth(-5);
    }

    this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x0b0f14,
      0.82
    );

    if (this.cache.audio.exists('gameOverLaugh')) {
      try {
        this.sound.play('gameOverLaugh', { volume: 0.8 });
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('[GameOverScene] Failed to play evil laugh', error);
        }
      }
    }

    // Title: "GAME OVER"
    this.add.text(
      this.cameras.main.centerX,
      80,
      'GAME OVER',
      {
        fontFamily: '"Creepster", cursive',
        fontSize: '64px',
        fill: '#ff6600',
        stroke: '#000000',
        strokeThickness: 6,
      }
    ).setOrigin(0.5);

    // Final score display
    this.add.text(
      this.cameras.main.centerX,
      160,
      'FINAL SCORE',
      { fontSize: '24px', fill: '#ffffff' }
    ).setOrigin(0.5);

    this.add.text(
      this.cameras.main.centerX,
      220,
      `${Math.floor(this.finalScore).toLocaleString()}`,
      { fontSize: '64px', fill: '#00ff00', fontStyle: 'bold' }
    ).setOrigin(0.5);

    // Name input prompt
    this.add.text(
      this.cameras.main.centerX,
      promptY,
      'Enter your name:',
      { fontSize: '18px', fill: '#ffffff' }
    ).setOrigin(0.5);

    this.nameInput = this.createNameInputElement();
    document.body.appendChild(this.nameInput);
    if (this.pendingName) {
      this.nameInput.value = this.pendingName;
    }
    this.nameInput.focus();
    this.positionNameInput();
    window.requestAnimationFrame(() => this.positionNameInput());
    this.boundRepositionInput = () => this.positionNameInput();
    window.addEventListener('resize', this.boundRepositionInput);
    window.addEventListener('scroll', this.boundRepositionInput, { passive: true });
    this.scale.on('resize', this.boundRepositionInput, this);

    // Submit score button (for Supabase integration)
    this.createRoundedButton({
      x: this.cameras.main.centerX,
      y: submitY,
      width: 220,
      height: 56,
      fill: 0xff6b2c,
      label: '📨 Submit Score',
      textColor: '#ffffff',
      onClick: () => this.handleSubmitScore(),
    });

    // Restart button
    this.createRoundedButton({
      x: this.cameras.main.centerX - 150,
      y: actionY,
      width: 200,
      height: 56,
      fill: 0x22c55e,
      label: '🔄 Restart',
      textColor: '#0f172a',
      onClick: () => this.handleRestart(),
    });

    // Leaderboard button
    this.createRoundedButton({
      x: this.cameras.main.centerX + 150,
      y: actionY,
      width: 200,
      height: 56,
      fill: 0x2563eb,
      label: '🏆 Leaderboard',
      textColor: '#ffffff',
      onClick: () => this.handleLeaderboard(),
    });

    // Submission status text (hidden until submit)
    this.statusText = this.add
      .text(this.cameras.main.centerX, statusY, '', {
        fontSize: '18px',
        fill: '#ffff00',
      })
      .setOrigin(0.5);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onSceneShutdown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.onSceneShutdown, this);
  }

  createRoundedButton({ x, y, width, height, fill, label, textColor = '#ffffff', onClick }) {
    const radius = Math.min(12, height / 2);
    const graphics = this.add.graphics();
    graphics.fillStyle(fill, 1);
    graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, radius);
    graphics.setDepth(1);

    const zone = this.add
      .zone(x, y, width, height)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    zone.on('pointerdown', onClick);

    const text = this.add
      .text(x, y, label, {
        fontFamily: 'Inter, sans-serif',
        fontSize: '20px',
        fontStyle: 'bold',
        color: textColor,
      })
      .setOrigin(0.5)
      .setDepth(6);

    zone.on('pointerover', () => {
      graphics.setAlpha(0.9);
      text.setScale(1.05);
    });
    zone.on('pointerout', () => {
      graphics.setAlpha(1);
      text.setScale(1);
    });

    return { graphics, zone, text };
  }

  createNameInputElement() {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Your name (${MIN_NAME_LENGTH}-${MAX_NAME_LENGTH} chars)...`;
    input.maxLength = `${MAX_NAME_LENGTH}`;
    input.minLength = `${MIN_NAME_LENGTH}`;
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      transform: translate(-50%, -50%);
      width: 260px;
      padding: 12px;
      font-size: 16px;
      border: 2px solid #ff6600;
      border-radius: 12px;
      background: rgba(34, 34, 34, 0.9);
      color: #fff;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
      z-index: 100;
    `;

    this.nameInputHandler = (event) => {
      if (!event?.target) {
        return;
      }

      const sanitized = sanitizeName(
        event.target.value.replace(INVALID_NAME_CHAR_REGEX, '')
      ).slice(0, MAX_NAME_LENGTH);

      if (event.target.value !== sanitized) {
        event.target.value = sanitized;
      }

      if (!this.isSubmitting && this.statusText?.text) {
        this.statusText.setColor('#ffff00').setText('');
      }
    };

    input.addEventListener('input', this.nameInputHandler);

    return input;
  }

  positionNameInput() {
    if (!this.nameInput) {
      return;
    }

    const canvas = this.game?.canvas;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const { inputY } = this.layout;
    const camera = this.cameras?.main;

    if (!rect || !camera) {
      return;
    }

    const xRatio = camera.centerX / camera.width;
    const yRatio = inputY / camera.height;

    const left = rect.left + rect.width * xRatio;
    const top = rect.top + rect.height * yRatio;

    this.nameInput.style.left = `${left}px`;
    this.nameInput.style.top = `${top}px`;
  }

  async handleSubmitScore() {
    if (this.scoreSubmitted || this.isSubmitting) {
      return;
    }

    if (!this.nameInput) {
      this.statusText.setText('Name input unavailable.');
      return;
    }

    const sanitizedName = sanitizeName(this.nameInput.value).slice(0, MAX_NAME_LENGTH);
    this.nameInput.value = sanitizedName;

    const validation = validateName(sanitizedName);
    if (!validation.valid) {
      this.statusText.setColor('#ff3333').setText(validation.message);
      return;
    }

    this.isSubmitting = true;
    this.statusText.setColor('#ffff00').setText('Submitting score...');

    if (import.meta.env.DEV) {
      console.log('[GameOverScene] submitting score', {
        name: sanitizedName,
        score: this.finalScore,
      });
    }

    const result = await submitScore({ name: sanitizedName, score: this.finalScore });

    if (result.success) {
      this.statusText.setColor('#00ff66').setText('Score submitted!');
      this.scoreSubmitted = true;
      this.nameInput.disabled = true;
    } else {
      this.statusText
        .setColor('#ff3333')
        .setText(result.error || 'Submission failed. Please try again later.');
    }

    if (import.meta.env.DEV) {
      console.log('[GameOverScene] submission result', result);
    }

    this.isSubmitting = false;
  }

  handleRestart() {
    this.cleanupNameInput();
    this.isSubmitting = false;
    this.scoreSubmitted = false;
    this.scene.start('GameScene');
  }

  handleLeaderboard() {
    const pendingName = this.nameInput
      ? sanitizeName(this.nameInput.value).slice(0, MAX_NAME_LENGTH)
      : '';
    this.cleanupNameInput();
    this.isSubmitting = false;
    this.scoreSubmitted = false;
    this.scene.start('HighScoreScene', {
      score: this.finalScore,
      name: pendingName,
    });
  }

  cleanupNameInput() {
    if (this.boundRepositionInput) {
      window.removeEventListener('resize', this.boundRepositionInput);
      window.removeEventListener('scroll', this.boundRepositionInput);
      this.scale.off('resize', this.boundRepositionInput, this);
      this.boundRepositionInput = null;
    }

    if (this.nameInput) {
      if (this.nameInputHandler) {
        this.nameInput.removeEventListener('input', this.nameInputHandler);
        this.nameInputHandler = null;
      }

      if (this.nameInput.parentNode) {
        this.nameInput.parentNode.removeChild(this.nameInput);
      }

      this.nameInput = null;
    }
  }

  onSceneShutdown() {
    this.cleanupNameInput();
    this.isSubmitting = false;
    this.scoreSubmitted = false;
  }
}
