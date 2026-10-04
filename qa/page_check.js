/* Game Store page-level QA: node --check all JS + inline scripts; build a
   standalone download (like game.html does) and run it headless. */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm"),
      { execSync } = require("child_process");
const DIR = "/home/hatch/workspace/signature-game-store";
let fails = 0;
const ok = (n, good, extra) => { console.log((good ? "PASS" : "FAIL") + " " + n + (extra ? " :: " + extra : "")); if (!good) fails++; };

// 1. --check every js file
for (const f of ["js/gf.js","js/catalog.js","js/netnav.js","js/games/batch1.js","js/games/batch2.js","js/games/batch3.js","qa/harness.js"]) {
  try { execSync("node --check " + path.join(DIR, f), { stdio: "pipe" }); ok("check " + f, true); }
  catch (e) { ok("check " + f, false, e.message.split("\n")[0]); }
}
// 2. inline scripts in html
for (const h of ["index.html","archive.html","game.html"]) {
  const html = fs.readFileSync(path.join(DIR, h), "utf8");
  const blocks = [...html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  let good = true, msg = "";
  blocks.forEach((b, i) => {
    const tmp = "/tmp/gs-inline-" + h + "-" + i + ".js";
    fs.writeFileSync(tmp, b);
    try { execSync("node --check " + tmp, { stdio: "pipe" }); }
    catch (e) { good = false; msg = "block " + i + ": " + (e.stdout || e.message).toString().split("\n").slice(0,4).join(" | "); }
  });
  ok("inline " + h + " (" + blocks.length + " blocks)", good, msg);
}

// 3. standalone download integrity: replicate game.html's standaloneHTML for each game, run headless
function makeCtx() {
  const grad = { addColorStop() {} };
  return new Proxy({}, { get(t,k){
    if (k==="createLinearGradient"||k==="createRadialGradient") return ()=>grad;
    if (k==="measureText") return ()=>({width:10});
    return t[k]!==undefined?t[k]:(()=>{});
  }, set(t,k,v){ t[k]=v; return true; } });
}
const listeners = {};
const sandbox = { console, Math, JSON, Date,
  setTimeout:()=>0, clearTimeout(){}, setInterval:()=>0,
  requestAnimationFrame:()=>0, cancelAnimationFrame(){},
  document: { getElementById: () => ({ width:420, height:640, getContext:()=>makeCtx(), addEventListener(){}, removeEventListener(){} }) },
};
sandbox.window = { addEventListener:(t,f)=>{(listeners[t]=listeners[t]||[]).push(f);}, removeEventListener(){} };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
const load = f => vm.runInContext(fs.readFileSync(path.join(DIR,f),"utf8"), sandbox, {filename:f});
load("js/gf.js"); sandbox.GameStore = sandbox.window.GameStore; sandbox.GF = sandbox.window.GF;
for (const f of ["js/games/batch1.js","js/games/batch2.js","js/games/batch3.js"]) load(f);
const GF = sandbox.window.GF, GS = sandbox.window.GameStore;
const gfSrc = fs.readFileSync(path.join(DIR,"js/gf.js"), "utf8");
// capture ALL boot sources before running any standalone (re-running gf.js resets its registry)
const bootSrcs = {};
for (const id of ["neon-serpent","brick-breaker","star-vanguard","turbo-circuit","pixel-hopper","gem-matcher",
                  "starship-odyssey","shadow-strike","neon-maze","asteroid-miner","neon-siege","pong-legends","sky-hopper"]) {
  const fn = GS.bootFn(id);
  if (!fn) { ok("bootSrc " + id, false, "not registered"); }
  else bootSrcs[id] = fn.toString();
}
for (const id of Object.keys(bootSrcs)) {
  try {
    const standalone = gfSrc + "\nGameStore.register(" + JSON.stringify(id) +
      ", { boot: " + bootSrcs[id] + " });\nGF.boot(" + JSON.stringify(id) + ", document.getElementById('c'), {});";
    vm.runInContext(standalone, sandbox, { filename: "standalone-" + id + ".js" });
    ok("standalone " + id, true);
  } catch (e) { ok("standalone " + id, false, (e.stack||e).split("\n").slice(0,2).join(" | ")); }
}
console.log(fails === 0 ? "PAGE QA ALL GREEN" : fails + " FAILURES");
process.exit(fails ? 1 : 0);
