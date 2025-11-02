/*
  ConsentScene.js
  Purpose: Display a consent popup for jumpscare and music before starting the game.
  Stores preferences in localStorage for future sessions.
*/

import Phaser from 'phaser';

export default class ConsentScene extends Phaser.Scene {
  constructor() {
    super('ConsentScene');
  }

  create() {
    const { width: W, height: H } = this.scale;

    // Semi-transparent overlay
    this.add.rectangle(0, 0, W, H, 0x000000, 0.7)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(100);

    // Modal background
    const modalWidth = 500;
    const modalHeight = 350;
    const modalX = W / 2;
    const modalY = H / 2;

    this.add.rectangle(modalX, modalY, modalWidth, modalHeight, 0x1a1a1a)
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(101)
      .setStrokeStyle(2, 0xff6600);

    // Title
    this.add.text(modalX, modalY - 140, 'Game Settings', {
      fontSize: '28px',
      fill: '#ff6600',
      fontStyle: 'bold',
      fontFamily: 'Arial'
    })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(102);

    // Jumpscare consent checkbox
    const jumpscareY = modalY - 70;
    const checkboxSize = 20;

    this.jumpscareCheckbox = this.add.rectangle(
      modalX - 200,
      jumpscareY,
      checkboxSize,
      checkboxSize,
      0x00aa00
    )
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(102)
      .setInteractive({ useHandCursor: true });

    this.jumpscareCheckbox.on('pointerdown', () => {
      this.jumpscareEnabled = !this.jumpscareEnabled;
      this.updateCheckboxes();
    });

    this.jumpscareCheckboxText = this.add.text(
      modalX - 165,
      jumpscareY,
      'Enable Jump Scares',
      { fontSize: '16px', fill: '#ffffff', fontFamily: 'Arial' }
    )
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(102);

    // Music consent checkbox
    const musicY = modalY - 10;

    this.musicCheckbox = this.add.rectangle(
      modalX - 200,
      musicY,
      checkboxSize,
      checkboxSize,
      0x00aa00
    )
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(102)
      .setInteractive({ useHandCursor: true });

    this.musicCheckbox.on('pointerdown', () => {
      this.musicEnabled = !this.musicEnabled;
      this.updateCheckboxes();
    });

    this.musicCheckboxText = this.add.text(
      modalX - 165,
      musicY,
      'Enable Music',
      { fontSize: '16px', fill: '#ffffff', fontFamily: 'Arial' }
    )
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(102);

    // Load saved preferences or use defaults
    this.jumpscareEnabled = this.getSavedPreference('jumpscareEnabled', true);
    this.musicEnabled = this.getSavedPreference('musicEnabled', true);
    this.updateCheckboxes();

    // Continue button
    const continueButton = this.add.rectangle(
      modalX,
      modalY + 100,
      150,
      50,
      0xff6600
    )
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(102)
      .setInteractive({ useHandCursor: true });

    continueButton.on('pointerdown', () => this.handleContinue());

    this.add.text(modalX, modalY + 100, 'CONTINUE', {
      fontSize: '20px',
      fill: '#000000',
      fontStyle: 'bold',
      fontFamily: 'Arial'
    })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(102);

    // Info text
    this.add.text(
      modalX,
      modalY + 50,
      'You can change these settings anytime',
      { fontSize: '12px', fill: '#999999', fontFamily: 'Arial' }
    )
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(102);
  }

  updateCheckboxes() {
    // Update checkbox colors based on state
    this.jumpscareCheckbox.setFillStyle(this.jumpscareEnabled ? 0x00ff00 : 0x333333);
    this.musicCheckbox.setFillStyle(this.musicEnabled ? 0x00ff00 : 0x333333);
  }

  getSavedPreference(key, defaultValue) {
    const saved = localStorage.getItem(`hauntedRunner_${key}`);
    return saved !== null ? JSON.parse(saved) : defaultValue;
  }

  savePreferences() {
    localStorage.setItem('hauntedRunner_jumpscareEnabled', JSON.stringify(this.jumpscareEnabled));
    localStorage.setItem('hauntedRunner_musicEnabled', JSON.stringify(this.musicEnabled));
  }

  handleContinue() {
    this.savePreferences();

    // Pass preferences to MenuScene
    this.scene.start('MenuScene', {
      jumpscareEnabled: this.jumpscareEnabled,
      musicEnabled: this.musicEnabled
    });
  }
}
