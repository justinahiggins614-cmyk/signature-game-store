/* Game Store QA harness: boots every registered game with stubbed canvas,
   steps 900 ticks with scripted input, asserts no exceptions + progress. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DIR = "/home/hatch/workspace/signature-game-store/js";

// ---- browser stubs ----
function makeCtx() {
  const grad = { addColorStop() {} };
  return new Proxy({}, {
    get(t, k) {
      if (k === "createLinearGradient" || k === "createRadialGradient") return () => grad;
      if (k === "measureText") return () => ({ width: 10 });
      if (k === "getImageData") return () => ({ data: [] });
      if (typeof k === "string") return t[k] !== undefined ? t[k] : (() => {});
      return () => {};
    },
    set(t, k, v) { t[k] = v; return true; }
  });
}
function makeCanvas() {
  return {
    width: 420, height: 640,
    getContext: () => makeCtx(),
    addEventListener() {}, removeEventListener() {}
  };
}
const listeners = {};
const sandbox = {
  console, Math, JSON, Date, setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0,
  requestAnimationFrame: () => 0, cancelAnimationFrame() {},
  window: undefined, document: undefined,
};
sandbox.window = {
  addEventListener: (t, f) => { (listeners[t] = listeners[t] || []).push(f); },
  removeEventListener() {},
  AudioContext: undefined, webkitAudioContext: undefined,
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

function load(f) {
  const code = fs.readFileSync(path.join(DIR, f), "utf8");
  vm.runInContext(code, sandbox, { filename: f });
}
load("gf.js");
sandbox.GameStore = sandbox.window.GameStore; // batch files use bare GameStore
sandbox.GF = sandbox.window.GF; // games use GF.label
load("catalog.js");
sandbox.GameCatalog = sandbox.window.GameCatalog;
for (const f of ["games/batch1.js", "games/batch2.js", "games/batch3.js"]) load(f);

const GF = sandbox.window.GF;
const ids = ["neon-serpent","brick-breaker","star-vanguard","turbo-circuit","pixel-hopper",
  "gem-matcher","starship-odyssey","shadow-strike","neon-maze","asteroid-miner",
  "neon-siege","pong-legends","sky-hopper"];

let fails = 0;
for (const id of ids) {
  try {
    const def = GF.get(id);
    if (!def) throw new Error("not registered");
    const canvas = makeCanvas();
    const scores = [];
    const h = GF.boot(id, canvas, { onScore: s => scores.push(s), onOver: () => {} });
    const input = h.api.input;
    // scripted input: wiggle keys + taps + swipes over 900 ticks
    const keySeq = ["up","down","left","right","Space","w","a","s","d","g","q","e","E"];
    for (let t = 0; t < 900; t++) {
      // hold a rotating key
      const k = keySeq[t % keySeq.length];
      input.keys = {}; input.keys[k] = true;
      if (t % 30 === 0) input.tap = { x: 210, y: 320 };
      if (t % 47 === 0) input.swipe = ["up","down","left","right"][t % 4];
      h.step(1/60);
      if (t % 30 === 0) input.tap = null;
      if (h.state.over && t > 120) break; // game reached an end state: good
    }
    const st = h.state;
    // progress = ran a while with scoring, or reached a legit end state (win/game over)
    const progressed = st.ticks > 10 && (scores.length > 0 || st.over);
    console.log((progressed ? "PASS" : "WEAK") + " " + id +
      " ticks=" + st.ticks + " score=" + st.score + " over=" + st.over + " scoreEvents=" + scores.length);
    if (!progressed) fails++;
    h.stop();
  } catch (e) {
    fails++;
    console.log("FAIL " + id + " :: " + (e && e.stack ? e.stack.split("\n").slice(0,3).join(" | ") : e));
  }
}
// covers + concepts
try {
  const GC = sandbox.GameCatalog;
  for (const g of GC.GAMES) {
    const svg = GC.coverSVG(g);
    if (!svg.startsWith("<svg") || svg.indexOf(g.title.toUpperCase()) < 0 || svg.indexOf(g.id) < 0)
      throw new Error("bad cover for " + g.id);
  }
  const c1 = GC.conceptFor(42), c2 = GC.conceptFor(42);
  if (JSON.stringify(c1) !== JSON.stringify(c2)) throw new Error("concept not deterministic");
  const f = GC.findGame("JAH-GAME-000007");
  if (!f || f.title !== "Starship Odyssey") throw new Error("findGame broken");
  if (GC.findGame("JAH-GAME-000001").concept) throw new Error("seed flagged concept");
  console.log("PASS covers(" + GC.GAMES.length + ") + concepts deterministic + findGame");
} catch (e) { fails++; console.log("FAIL catalog :: " + e.message); }

console.log(fails === 0 ? "ALL GREEN" : fails + " FAILURES");
process.exit(fails === 0 ? 0 : 1);
