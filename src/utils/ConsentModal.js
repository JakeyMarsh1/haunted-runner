/*
  ConsentModal.js
  Purpose: Display a consent popup overlay for jumpscare and music preferences.
  Works as an overlay on top of any scene (MenuScene, etc).
  Stores preferences in localStorage for future sessions.
*/

export default class ConsentModal {
  constructor(scene, onConfirm) {
    this.scene = scene;
    this.onConfirm = onConfirm;
    this.jumpscareEnabled = this.getSavedPreference('jumpscareEnabled', false);
    this.musicEnabled = this.getSavedPreference('musicEnabled', false);
    this.elements = []; // Track all created elements for cleanup
    
    this.create();
  }

  create() {
    const { width: W, height: H } = this.scene.scale;

    // Semi-transparent overlay
    this.overlay = this.scene.add.rectangle(0, 0, W, H, 0x000000, 0.7)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(500)
      .setInteractive(); // Make it block clicks from going through
    this.elements.push(this.overlay);

    // Modal background
    const modalWidth = 500;
    const modalHeight = 350;
    const modalX = W / 2;
    const modalY = H / 2;

    this.modal = this.scene.add.rectangle(modalX, modalY, modalWidth, modalHeight, 0x1a1a1a)
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(501)
      .setStrokeStyle(2, 0xff6600);
    this.elements.push(this.modal);

    // Title
    const titleText = this.scene.add.text(modalX, modalY - 140, 'Game Settings', {
      fontSize: '28px',
      fill: '#ff6600',
      fontStyle: 'bold',
      fontFamily: 'Arial'
    })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(502);
    this.elements.push(titleText);

    // Jumpscare consent checkbox
    const jumpscareY = modalY - 70;
    const checkboxSize = 20;

    this.jumpscareCheckbox = this.scene.add.rectangle(
      modalX - 200,
      jumpscareY,
      checkboxSize,
      checkboxSize,
      0x00aa00
    )
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(502)
      .setInteractive({ useHandCursor: true });
    this.elements.push(this.jumpscareCheckbox);

    this.jumpscareCheckbox.on('pointerdown', () => {
      this.jumpscareEnabled = !this.jumpscareEnabled;
      this.updateCheckboxes();
    });

    const jumpscareLabel = this.scene.add.text(
      modalX - 165,
      jumpscareY,
      'Enable Jump Scares',
      { fontSize: '16px', fill: '#ffffff', fontFamily: 'Arial' }
    )
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(502);
    this.elements.push(jumpscareLabel);

    // Music consent checkbox
    const musicY = modalY - 10;

    this.musicCheckbox = this.scene.add.rectangle(
      modalX - 200,
      musicY,
      checkboxSize,
      checkboxSize,
      0x00aa00
    )
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(502)
      .setInteractive({ useHandCursor: true });
    this.elements.push(this.musicCheckbox);

    this.musicCheckbox.on('pointerdown', () => {
      this.musicEnabled = !this.musicEnabled;
      this.updateCheckboxes();
    });

    const musicLabel = this.scene.add.text(
      modalX - 165,
      musicY,
      'Enable Music',
      { fontSize: '16px', fill: '#ffffff', fontFamily: 'Arial' }
    )
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(502);
    this.elements.push(musicLabel);

    this.updateCheckboxes();

    // Continue button
    const continueButton = this.scene.add.rectangle(
      modalX,
      modalY + 100,
      150,
      50,
      0xff6600
    )
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(502)
      .setInteractive({ useHandCursor: true });
    this.elements.push(continueButton);

    continueButton.on('pointerdown', () => {
      this.handleConfirm();
    });

    const continueText = this.scene.add.text(modalX, modalY + 100, 'CONTINUE', {
      fontSize: '20px',
      fill: '#000000',
      fontStyle: 'bold',
      fontFamily: 'Arial'
    })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(502);
    this.elements.push(continueText);

    // Info text
    const infoText = this.scene.add.text(
      modalX,
      modalY + 50,
      'You can change these settings anytime',
      { fontSize: '12px', fill: '#999999', fontFamily: 'Arial' }
    )
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(502);
    this.elements.push(infoText);
  }

  updateCheckboxes() {
    // Update checkbox colors based on state
    this.jumpscareCheckbox.setFillStyle(this.jumpscareEnabled ? 0x00ff00 : 0x333333);
    this.musicCheckbox.setFillStyle(this.musicEnabled ? 0x00ff00 : 0x333333);
  }

  getSavedPreference(key, defaultValue) {
    try {
      if (typeof window === 'undefined' || !window?.localStorage) return defaultValue;
      const saved = window.localStorage.getItem(`hauntedRunner_${key}`);
      return saved !== null ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.warn('[ConsentModal] Failed to read preference', key, error);
      return defaultValue;
    }
  }

  savePreferences() {
    try {
      if (typeof window === 'undefined' || !window?.localStorage) return;
      window.localStorage.setItem('hauntedRunner_jumpscareEnabled', JSON.stringify(this.jumpscareEnabled));
      window.localStorage.setItem('hauntedRunner_musicEnabled', JSON.stringify(this.musicEnabled));
    } catch (error) {
      console.warn('[ConsentModal] Failed to persist preferences', error);
    }
  }

  handleConfirm() {
    this.savePreferences();

    // Clean up all modal elements
    this.elements.forEach(element => element.destroy());

    // Call the callback with preferences
    if (this.onConfirm) {
      this.onConfirm({
        jumpscareEnabled: this.jumpscareEnabled,
        musicEnabled: this.musicEnabled
      });
    }
  }
}
