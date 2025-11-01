import Phaser from "phaser";
import "./style/main.css";

import BootScene from "./scenes/BootScene";
import AboutScene from './scenes/AboutScene';
import MenuScene from "./scenes/MenuScene";
import GameScene from "./scenes/GameScene";

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 1280,
  height: 720,
  backgroundColor: "#000000",
  scene: [BootScene, AboutScene, MenuScene, GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 350 },
    },
  },
};

const createGame = () => new Phaser.Game(config);

if (!window.__HAUNTED_RUNNER_GAME__) {
  window.__HAUNTED_RUNNER_GAME__ = createGame();
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.__HAUNTED_RUNNER_GAME__?.destroy(true);
    window.__HAUNTED_RUNNER_GAME__ = undefined;
  });

  import.meta.hot.accept(() => {
    window.__HAUNTED_RUNNER_GAME__?.destroy(true);
    window.__HAUNTED_RUNNER_GAME__ = createGame();
  });
}
