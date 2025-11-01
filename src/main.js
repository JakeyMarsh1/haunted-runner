import Phaser from "phaser";
import "./style/main.css";

import BootScene from "./scenes/BootScene";
import MenuScene from "./scenes/MenuScene";

const root = document.querySelector("#app");

if (root) {
  root.innerHTML = `
    <main class="min-h-screen flex flex-col items-center gap-8 bg-gradient-to-b from-slate-950 via-slate-900 to-black px-6 py-10">
      <header class="flex flex-col items-center gap-3 text-center">
        <p class="text-sm uppercase tracking-[0.3em] text-emerald-400">Prototype</p>
        <h1 class="text-4xl font-black text-white drop-shadow-lg">Haunted Runner</h1>
        <p class="max-w-xl text-base text-slate-300">
          A Phaser-powered endless runner playground.
        </p>
      </header>
      <section id="game-shell" class="flex w-full max-w-md flex-col items-center rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-xl shadow-emerald-500/10">
        <div id="game-container" class="overflow-hidden rounded-xl border border-slate-800 shadow-inner shadow-black/60"></div>
      </section>
      <footer class="text-xs uppercase tracking-[0.3em] text-slate-500">Press space or tap to start</footer>
    </main>
  `;
}

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 480,
  height: 720,
  backgroundColor: "#0f172a",
  scene: [BootScene, MenuScene],
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
