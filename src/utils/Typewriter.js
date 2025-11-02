/**
 * Typewriter.js
 * Purpose: Creates a typewriter text effect for tutorials 
 */

export default class Typewriter {
  constructor() {
    this.scene = null;
    this.textObject = null;
    this.fullText = '';
    this.currentIndex = 0;
    this.timerEvent = null;
    this.isTyping = false;
    this.onCompleteCallback = null;
    this.typingSound = null;
    this.delay = 50;
  }

  /**
   * Initialize the typewriter with a scene and options
   * @param {Phaser.Scene} gameInstance - The Phaser scene instance
   * @param {Object} options - Configuration options
   * @param {number} options.x - X position
   * @param {number} options.y - Y position
   * @param {string} options.fontFamily - Font family (default: 'Inter')
   * @param {number} options.fontSize - Font size in pixels (default: 18)
   * @param {number} options.maxWidth - Max width for word wrap (default: 600)
   * @param {string} options.text - The full text to type out
   * @param {string} options.sound - Optional sound key to play with typing
   * @param {number} options.delay - Delay between characters in ms (default: 50)
   * @param {string} options.color - Text color (default: '#ffffff')
   * @param {Function} options.onComplete - Callback when typing completes
   */
  init(gameInstance, options = {}) {
    this.scene = gameInstance;
    this.fullText = options.text || '';
    this.currentIndex = 0;
    this.isTyping = false;
    this.onCompleteCallback = options.onComplete || null;
    this.delay = options.delay || 50;

    // Setup typing sound if provided
    if (options.sound) {
      if (typeof options.sound === 'string' && this.scene.sound.get(options.sound)) {
        this.typingSound = this.scene.sound.get(options.sound);
      } else if (options.sound.play) {
        // If it's already a sound object
        this.typingSound = options.sound;
      }
    }

    const style = {
      fontFamily: options.fontFamily || 'Inter, sans-serif',
      fontSize: `${options.fontSize || 18}px`,
      color: options.color || '#ffffff',
      align: options.align || 'left',
      wordWrap: { width: options.maxWidth || 600 },
      lineSpacing: options.lineSpacing || 8,
    };

    // Add stroke if specified
    if (options.stroke) {
      style.stroke = options.stroke;
      style.strokeThickness = options.strokeThickness || 2;
    }

    // Create text object
    this.textObject = this.scene.add.text(
      options.x || 100,
      options.y || 100,
      '',
      style
    );

    if (options.origin) {
      this.textObject.setOrigin(options.origin.x || 0, options.origin.y || 0);
    }

    if (options.depth !== undefined) {
      this.textObject.setDepth(options.depth);
    }

    return this;
  }

  /**
   * Start the typewriter effect
   * @param {number} delay - Optional: Override delay between characters in ms
   */
  start(delay) {
    if (this.isTyping) return;

    if (delay !== undefined) {
      this.delay = delay;
    }

    this.isTyping = true;
    this.currentIndex = 0;
    this.textObject.setText('');

    // Create timer event for typing
    this.timerEvent = this.scene.time.addEvent({
      delay: this.delay,
      callback: this.typeNextCharacter,
      callbackScope: this,
      loop: true
    });
  }

  /**
   * Type the next character
   */
  typeNextCharacter() {
    if (this.currentIndex < this.fullText.length) {
      const currentText = this.fullText.substring(0, this.currentIndex + 1);
      this.textObject.setText(currentText);
      this.currentIndex++;
      
      // Play typing sound
      if (this.typingSound && this.typingSound.play) {
        this.typingSound.play({ volume: 0.3 });
      }
    } else {
      // Typing complete
      this.stop();
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
      }
    }
  }

  /**
   * Stop the typewriter effect
   */
  stop() {
    this.isTyping = false;
    if (this.timerEvent) {
      this.timerEvent.remove();
      this.timerEvent = null;
    }
  }

  /**
   * Skip to the end immediately
   */
  skip() {
    this.stop();
    this.textObject.setText(this.fullText);
    this.currentIndex = this.fullText.length;
    if (this.onCompleteCallback) {
      this.onCompleteCallback();
    }
  }

  /**
   * Destroy the typewriter and clean up
   */
  destroy() {
    this.stop();
    if (this.textObject) {
      this.textObject.destroy();
      this.textObject = null;
    }
    this.scene = null;
    this.onCompleteCallback = null;
  }

  /**
   * Get the text object
   */
  getTextObject() {
    return this.textObject;
  }

  /**
   * Check if currently typing
   */
  getIsTyping() {
    return this.isTyping;
  }
}

