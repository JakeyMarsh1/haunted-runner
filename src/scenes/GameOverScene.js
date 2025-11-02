/*
  GameOverScene.js
  Purpose: Display game over screen with final score, player name input, and options to restart or view leaderboard.
  Ready for score data passed from GameScene and Supabase submission.
*/

import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    // Receive score from GameScene
    this.finalScore = data.score || 0;
    if (import.meta.env.DEV) {
      console.log('GameOverScene init — final score:', this.finalScore);
    }
  }

  create() {
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
      `FINAL SCORE`,
      { fontSize: '24px', fill: '#ffffff' }
    ).setOrigin(0.5);

    this.add.text(
      this.cameras.main.centerX,
      220,
      `${this.finalScore}`,
      { fontSize: '64px', fill: '#00ff00', fontStyle: 'bold' }
    ).setOrigin(0.5);

    // Name input prompt
    this.add.text(
      this.cameras.main.centerX,
      310,
      'Enter your name:',
      { fontSize: '18px', fill: '#ffffff' }
    ).setOrigin(0.5);

    // Name input field (HTML input overlay)
    // Acceptable character limits: 3-20 alphanumeric + spaces
    this.nameInput = document.createElement('input');
    this.nameInput.type = 'text';
    this.nameInput.placeholder = 'Your name (3-20 chars)...';
    this.nameInput.maxLength = '20';
    this.nameInput.minLength = '3';
    this.nameInput.style.cssText = `
      position: absolute;
      top: 350px;
      left: 50%;
      transform: translateX(-50%);
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
    
    // Add input validation: allow only alphanumeric, spaces, and basic punctuation
    this.nameInput.addEventListener('input', (e) => {
      // Remove invalid characters (keep only letters, numbers, spaces, hyphens, apostrophes)
      e.target.value = e.target.value.replace(/[^a-zA-Z0-9\s\-']/g, '');
    });
    
    document.body.appendChild(this.nameInput);
    this.nameInput.focus();

    // Restart button
    const restartButton = this.add.rectangle(
      this.cameras.main.centerX - 120,
      430,
      180,
      50,
      0x00aa00
    );
    restartButton.setInteractive({ useHandCursor: true });
    restartButton.on('pointerdown', () => this.handleRestart());

    this.add.text(
      this.cameras.main.centerX - 120,
      430,
      'RESTART',
      { fontSize: '20px', fill: '#000', fontStyle: 'bold' }
    ).setOrigin(0.5);

    // Leaderboard button
    const leaderboardButton = this.add.rectangle(
      this.cameras.main.centerX + 120,
      430,
      180,
      50,
      0x0066ff
    );
    leaderboardButton.setInteractive({ useHandCursor: true });
    leaderboardButton.on('pointerdown', () => this.handleLeaderboard());

    this.add.text(
      this.cameras.main.centerX + 120,
      430,
      'LEADERBOARD',
      { fontSize: '20px', fill: '#fff', fontStyle: 'bold' }
    ).setOrigin(0.5);

    // Submit score button (for Supabase integration)
    const submitButton = this.add.rectangle(
      this.cameras.main.centerX,
      510,
      200,
      50,
      0xff6600
    );
    submitButton.setInteractive({ useHandCursor: true });
    submitButton.on('pointerdown', () => this.handleSubmitScore());

    this.add.text(
      this.cameras.main.centerX,
      510,
      'SUBMIT SCORE',
      { fontSize: '20px', fill: '#fff', fontStyle: 'bold' }
    ).setOrigin(0.5);

    // Submission status text (hidden until submit)
    this.statusText = this.add.text(
      this.cameras.main.centerX,
      580,
      '',
      { fontSize: '16px', fill: '#ffff00' }
    ).setOrigin(0.5);
  }

  handleSubmitScore() {
    const playerName = this.nameInput.value.trim();

    // Validate name: 3-20 characters, alphanumeric + spaces/hyphens/apostrophes
    if (!playerName) {
      this.statusText.setText('Please enter your name!');
      return;
    }

    if (playerName.length < 3) {
      this.statusText.setText('Name too short (min 3 characters)');
      return;
    }

    if (playerName.length > 20) {
      this.statusText.setText('Name too long (max 20 characters)');
      return;
    }

    // Check for valid characters (already filtered by input, but double-check)
    if (!/^[a-zA-Z0-9\s\-']+$/.test(playerName)) {
      this.statusText.setText('Invalid characters. Use letters, numbers, spaces, hyphens.');
      return;
    }

    // TODO: Integrate with supabase/leaderboard.js submitScore()
    // Example:
    // this.statusText.setText('Submitting...');
    // supabaseLeaderboard.submitScore({ name: playerName, score: this.finalScore })
    //   .then(() => {
    //     this.statusText.setText('Score submitted!');
    //   })
    //   .catch((err) => {
    //     this.statusText.setText('Submission failed. Score queued locally.');
    //   });

    if (import.meta.env.DEV) {
      console.log('Submit score:', { name: playerName, score: this.finalScore });
    }

    this.statusText.setText('Score submitted! (TODO: integrate Supabase)');
  }

  handleRestart() {
    // Clean up input
    if (this.nameInput && this.nameInput.parentNode) {
      this.nameInput.parentNode.removeChild(this.nameInput);
    }

    // Restart GameScene
    this.scene.start('GameScene');
  }

  handleLeaderboard() {
    // Clean up input
    if (this.nameInput && this.nameInput.parentNode) {
      this.nameInput.parentNode.removeChild(this.nameInput);
    }

    // Transition to HighScoreScene
    this.scene.start('HighScoreScene');
  }

  shutdown() {
    // Clean up input on scene shutdown
    if (this.nameInput && this.nameInput.parentNode) {
      this.nameInput.parentNode.removeChild(this.nameInput);
    }
  }
}