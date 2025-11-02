// filepath: c:\Users\Jakey\Documents\vs-code-projects\haunted-runner\src\scenes\PauseScene.js
import Phaser from 'phaser';
import ConsentModal from '../utils/ConsentModal';
import MusicManager from '../utils/MusicManager';

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  create() {
    const { width: W, height: H } = this.scale;

    // Semi-transparent overlay covering the entire screen
    this.add.rectangle(0, 0, W, H, 0x000000, 0.5)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(0)
      .setInteractive(); // Block clicks from passing through

    // Show the consent modal
    new ConsentModal(this, (preferences) => {
      this.handleModalClose(preferences);
    });
  }

  handleModalClose(preferences) {
    // Get the paused GameScene
    const gameScene = this.scene.get('GameScene');
    
    // Update preferences in GameScene
    if (gameScene) {
      // Check if music preference changed
      const currentMusicState = gameScene.registry.get('musicEnabled');
      if (preferences.musicEnabled !== currentMusicState) {
        // Toggle music in GameScene
        MusicManager.toggleMusic(gameScene);
        // Update the music button icon
        if (gameScene.musicButton) {
          gameScene.musicButton.setText(preferences.musicEnabled ? '🔊' : '🔇');
        }
      }
      
      // Check if jumpscare preference changed
      const jumpscareChanged = preferences.jumpscareEnabled !== gameScene.jumpscareEnabled;
      gameScene.jumpscareEnabled = preferences.jumpscareEnabled;
      gameScene.musicEnabled = preferences.musicEnabled;
      
      // If jumpscares were disabled, stop auto triggers
      if (jumpscareChanged && !preferences.jumpscareEnabled && gameScene.jumpScare) {
        gameScene.jumpScare.stopAuto();
      }
      // If jumpscares were enabled, restart auto triggers
      else if (jumpscareChanged && preferences.jumpscareEnabled && gameScene.jumpScare) {
        gameScene.jumpScare.startAuto({ min: 12, max: 24 });
      }
      
      gameScene.isPaused = false; // Resume gameplay
      gameScene.resumeAnimations(); // Resume all animations
    }

    this.resumeGame();
  }

  resumeGame() {
    // Just stop the pause scene, GameScene keeps running
    this.scene.stop('PauseScene');
  }
}
