/*
  GameOverScene.js
  Purpose: Display game over screen with final score, player name input, and options to restart or view leaderboard.
  Ready for score data passed from GameScene and Supabase submission.
*/

import Phaser from 'phaser';
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
      promptY: 310,
      inputY: 360,
      submitY: 430,
      statusY: 470,
      actionY: 520,
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

  create() {
    const { promptY, submitY, statusY, actionY } = this.layout;

    // Background
    this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x1a1a1a
    );

    // Title: "GAME OVER"
    this.add.text(
      this.cameras.main.centerX,
      80,
      'GAME OVER',
      { fontSize: '48px', fill: '#ff6600', fontStyle: 'bold' }
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

    // Restart button
    const restartButton = this.add.rectangle(
      this.cameras.main.centerX - 120,
      actionY,
      180,
      50,
      0x00aa00
    );
    restartButton.setInteractive({ useHandCursor: true });
    restartButton.on('pointerdown', () => this.handleRestart());

    this.add.text(
      this.cameras.main.centerX - 120,
      actionY,
      'RESTART',
      { fontSize: '20px', fill: '#000', fontStyle: 'bold' }
    ).setOrigin(0.5);

    // Leaderboard button
    const leaderboardButton = this.add.rectangle(
      this.cameras.main.centerX + 120,
      actionY,
      180,
      50,
      0x0066ff
    );
    leaderboardButton.setInteractive({ useHandCursor: true });
    leaderboardButton.on('pointerdown', () => this.handleLeaderboard());

    this.add.text(
      this.cameras.main.centerX + 120,
      actionY,
      'LEADERBOARD',
      { fontSize: '20px', fill: '#fff', fontStyle: 'bold' }
    ).setOrigin(0.5);

    // Submit score button (for Supabase integration)
    const submitButton = this.add.rectangle(
      this.cameras.main.centerX,
      submitY,
      200,
      50,
      0xff6600
    );
    submitButton.setInteractive({ useHandCursor: true });
    submitButton.on('pointerdown', () => this.handleSubmitScore());

    this.add.text(
      this.cameras.main.centerX,
      submitY,
      'SUBMIT SCORE',
      { fontSize: '20px', fill: '#fff', fontStyle: 'bold' }
    ).setOrigin(0.5);

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
      width: 250px;
      padding: 10px;
      font-size: 16px;
      border: 2px solid #ff6600;
      border-radius: 5px;
      background: #222;
      color: #fff;
      text-align: center;
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
