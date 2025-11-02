export default class SceneTransition {
  /**
   * Fade out current scene to black, then start new scene
   * @param {Phaser.Scene} currentScene - The current scene
   * @param {string} targetScene - The key of the scene to transition to
   * @param {number} duration - Fade duration in milliseconds (default: 500)
   */
  static fadeToScene(currentScene, targetScene, duration = 500) {
    // Fade camera to black
    currentScene.cameras.main.fadeOut(duration, 0, 0, 0);
    
    // Once fade completes, start the new scene
    currentScene.cameras.main.once('camerafadeoutcomplete', () => {
      currentScene.scene.start(targetScene);
    });
  }

  /**
   * Fade in from black when scene starts
   * @param {Phaser.Scene} scene - The scene to fade in
   * @param {number} duration - Fade duration in milliseconds (default: 500)
   */
  static fadeIn(scene, duration = 500) {
    scene.cameras.main.fadeIn(duration, 0, 0, 0);
  }

  /**
   * Setup a scene with automatic fade in
   * Call this at the start of your scene's create() method
   * @param {Phaser.Scene} scene - The scene
   * @param {number} duration - Fade duration in milliseconds (default: 500)
   */
  static setupFadeIn(scene, duration = 500) {
    // Start with camera black
    scene.cameras.main.setBackgroundColor('#000000');
    // Fade in
    SceneTransition.fadeIn(scene, duration);
  }
}

