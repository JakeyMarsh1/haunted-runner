import "./style/main.css";

const app = document.querySelector("#app");

if (app) {
  app.innerHTML = `
    <main class="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <h1 class="text-4xl font-black tracking-wide">Haunted Runner</h1>
      <p class="max-w-lg text-center text-lg text-slate-300">Prepare to build out your haunted adventure. Start by wiring up the Phaser scenes in the "src/scenes" directory.</p>
      <button type="button" class="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400">
        Launch Game
      </button>
    </main>
  `;
}
