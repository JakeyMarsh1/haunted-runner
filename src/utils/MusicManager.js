const MUSIC_ICON_ON = "🔊";
const MUSIC_ICON_OFF = "🔇";

export default class MusicManager {
  static init(scene) {
    // Initialize music state in registry if not exists
    if (scene.registry.get('musicEnabled') === undefined) {
      scene.registry.set('musicEnabled', false);
    }
  }

  static setupMusic(scene, musicKey = 'menuMusic') {
    // Stop any currently playing music from other scenes
    scene.sound.stopAll();
    
    // Get or create the music
    if (!scene.sound.get(musicKey)) {
      scene.music = scene.sound.add(musicKey, {
        volume: 0.5,
        loop: true
      });
    } else {
      scene.music = scene.sound.get(musicKey);
    }

    // Store current music key
    scene.registry.set('currentMusicKey', musicKey);

    // Play if enabled
    if (scene.registry.get('musicEnabled') && !scene.music.isPlaying) {
      scene.music.play();
    }
  }

  static toggleMusic(scene) {
    const currentState = scene.registry.get('musicEnabled');
    const newState = !currentState;
    
    scene.registry.set('musicEnabled', newState);
    
    if (newState) {
      // Unmute: set mute flag to false and resume all sounds
      scene.sound.mute = false;
      if (scene.music && !scene.music.isPlaying) {
        scene.music.play();
      }
      scene.sound.resumeAll();
    } else {
      // Mute: set mute flag to true and pause all sounds
      scene.sound.mute = true;
      if (scene.music && scene.music.isPlaying) {
        scene.music.stop();
      }
      scene.sound.pauseAll();
    }
    
    return newState;
  }

  static createMusicButton(scene, x, y, iconOn = MUSIC_ICON_ON, iconOff = MUSIC_ICON_OFF) {
    const musicEnabled = scene.registry.get('musicEnabled');
    const icon = musicEnabled ? iconOn : iconOff;
    
    const button = scene.add.text(x, y, icon, {
      fontSize: "32px",
      color: "#f8fafc",
    })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(1000); // Always on top
    
    button.on("pointerdown", () => {
      const newState = MusicManager.toggleMusic(scene);
      button.setText(newState ? iconOn : iconOff);
    });
    
    return button;
  }

  static getMusicState(scene) {
    return scene.registry.get('musicEnabled');
  }
}
