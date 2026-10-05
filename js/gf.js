/* =====================================================================
   THE SIGNATURE GAME STORE — GF micro game framework (v1.0)
   Every playable game registers here and gets: fixed-timestep loop,
   keyboard + touch input, WebAudio bleeps, score/game-over plumbing.
   Games are pure logic + canvas draw — harness-testable in node.
   ===================================================================== */
(function (root) {
"use strict";

var REG = {};          // id -> {meta, boot}
var META = {};         // id -> catalog metadata (set by catalog.js)

var GF = {
  register: function (id, def) { REG[id] = def; },
  get: function (id) { return REG[id]; },
  ids: function () { return Object.keys(REG); },
  setMeta: function (id, m) { META[id] = m; },
  meta: function (id) { return META[id]; }
};

/* Input state shared by the running game */
function makeInput(canvas) {
  var inp = { keys: {}, tap: null, swipe: null, _sx: 0, _sy: 0 };
  function key(e, down) {
    var k = e.key;
    if (k === " ") k = "Space";
    if (k && k.length === 1) k = k.toLowerCase();
    // normalize arrows
    var map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
    if (map[e.key]) k = map[e.key];
    inp.keys[k] = down;
    if (down && ["up","down","left","right","Space"].indexOf(k) >= 0 && e.preventDefault) e.preventDefault();
  }
  var kd = function (e) { key(e, true); };
  var ku = function (e) { key(e, false); };
  (typeof window !== "undefined" ? window : root).addEventListener
    && (typeof window !== "undefined" ? window : root).addEventListener("keydown", kd);
  (typeof window !== "undefined" ? window : root).addEventListener
    && (typeof window !== "undefined" ? window : root).addEventListener("keyup", ku);
  inp._detach = function () {
    try {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    } catch (e) {}
  };
  inp.pressed = function (k) { return !!inp.keys[k]; };
  inp.axis = function () {  // -1/0/1 for x and y
    var x = (inp.keys.right || inp.keys.d ? 1 : 0) - (inp.keys.left || inp.keys.a ? 1 : 0);
    var y = (inp.keys.down || inp.keys.s ? 1 : 0) - (inp.keys.up || inp.keys.w ? 1 : 0);
    return { x: x, y: y };
  };
  if (canvas && canvas.addEventListener) {
    canvas.addEventListener("touchstart", function (e) {
      var t = e.changedTouches[0];
      inp._sx = t.clientX; inp._sy = t.clientY;
    }, { passive: true });
    canvas.addEventListener("touchend", function (e) {
      var t = e.changedTouches[0];
      var dx = t.clientX - inp._sx, dy = t.clientY - inp._sy;
      if (Math.abs(dx) < 12 && Math.abs(dy) < 12) { inp.tap = { x: t.clientX, y: t.clientY }; }
      else if (Math.abs(dx) > Math.abs(dy)) { inp.swipe = dx > 0 ? "right" : "left"; }
      else { inp.swipe = dy > 0 ? "down" : "up"; }
      if (e.preventDefault) e.preventDefault();
    }, { passive: false });
    canvas.addEventListener("mousedown", function (e) { inp.tap = { x: e.offsetX, y: e.offsetY }; });
  }
  inp.consumeTap = function () { var t = inp.tap; inp.tap = null; return t; };
  inp.consumeSwipe = function () { var s = inp.swipe; inp.swipe = null; return s; };
  return inp;
}

/* Tiny WebAudio bleeps. Silent no-op when audio is unavailable. */
function makeSfx() {
  var ctx = null;
  function ac() {
    if (ctx) return ctx;
    try {
      var AC = (typeof window !== "undefined") && (window.AudioContext || window.webkitAudioContext);
      if (!AC) return null;
      ctx = new AC();
      return ctx;
    } catch (e) { return null; }
  }
  return {
    beep: function (freq, dur, type) {
      try {
        var a = ac(); if (!a) return;
        var o = a.createOscillator(), g = a.createGain();
        o.type = type || "square"; o.frequency.value = freq || 440;
        g.gain.setValueAtTime(0.08, a.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + (dur || 0.12));
        o.connect(g); g.connect(a.destination);
        o.start(); o.stop(a.currentTime + (dur || 0.12));
      } catch (e) {}
    },
    tune: function (notes) {  // notes: [[freq, dur], ...]
      var self = this, i = 0;
      (function next() {
        if (i >= notes.length) return;
        self.beep(notes[i][0], notes[i][1]);
        i++;
        setTimeout(next, notes[i - 1][1] * 1000 + 30);
      })();
    }
  };
}

/* ================= graphics era tiers =================
   Game LOGIC never changes across tiers — only the renderer. Every game
   draws its frame to an offscreen canvas; gfxPost() then re-renders that
   frame through the selected era tier. Same game, six eras, one dial.
   Tier is player-chosen, remembered in localStorage, and applies live
   with no reboot. */
var GFX_TIERS = ["6-BIT", "32-BIT", "PLAYSTATION", "64", "PS3", "BEYOND"];
var GFX_KEY = "jahgfx.tier";
var gfxTier = 3; /* default "64": clean, slick, fast on phones */
try {
  var _gs = (typeof localStorage !== "undefined") ? localStorage.getItem(GFX_KEY) : null;
  var _gt = parseInt(_gs || "", 10);
  if (_gt >= 0 && _gt < GFX_TIERS.length) gfxTier = _gt;
} catch (e) {}
var gfxFrame = 0;
GF.tiers = function () { return GFX_TIERS.slice(); };
GF.tier = function () { return gfxTier; };
GF.tierName = function () { return GFX_TIERS[gfxTier]; };
GF.setTier = function (t) {
  t = Math.max(0, Math.min(GFX_TIERS.length - 1, t | 0));
  gfxTier = t;
  try { if (typeof localStorage !== "undefined") localStorage.setItem(GFX_KEY, String(t)); } catch (e) {}
  return t;
};

function gfxCanvas(w, h) {
  try {
    if (typeof document !== "undefined" && document.createElement) {
      var c = document.createElement("canvas"); c.width = w; c.height = h; return c;
    }
  } catch (e) {}
  return { width: w, height: h, getContext: function () { return null; } };
}
var _scratch = {};
function gfxScratch(name, w, h) {
  var s = _scratch[name];
  if (!s || s.width !== w || s.height !== h) { s = gfxCanvas(w, h); _scratch[name] = s; }
  return s;
}
function hexA(hex, a) {
  var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}
function gfxVignette(dst, W, H, amt, color) {
  var g = dst.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, hexA(color, amt));
  dst.fillStyle = g; dst.fillRect(0, 0, W, H);
}
/* soft additive bloom of a blurred half-res copy */
function gfxBloom(dst, src, W, H, alpha, blurPx) {
  try {
    var s = gfxScratch("sbl", W >> 1, H >> 1), x = s.getContext("2d");
    if (!x) return;
    try { x.filter = "blur(" + blurPx + "px)"; } catch (e) {}
    x.drawImage(src, 0, 0, W >> 1, H >> 1);
    try { x.filter = "none"; } catch (e) {}
    dst.save();
    dst.globalCompositeOperation = "screen";
    dst.globalAlpha = alpha;
    dst.drawImage(s, 0, 0, W, H);
    dst.restore();
  } catch (e) {}
}
/* curated 64-color arcade-cabinet palette: deep blacks, hot neons, warm ambers */
var PAL64 = [
  "#000000", "#0a0a12", "#14141f", "#1f1f2e",
  "#2e1a2e", "#4b166b", "#7a2bd8", "#b44dff",
  "#0b1026", "#1b2a6b", "#2a4bd8", "#4dd8ff",
  "#062a2e", "#0e4a5a", "#00b3b3", "#00f0ff",
  "#0b2417", "#14532d", "#2bd85e", "#4dff88",
  "#2e2e0b", "#6b6b16", "#d8d82a", "#ffe14d",
  "#2e1a0b", "#6b3a16", "#d8762a", "#ff9f4d",
  "#260b0b", "#6b1616", "#d82a2a", "#ff6b6b",
  "#2e0b1f", "#6b1645", "#d82a8a", "#ff4dff",
  "#3a2a1a", "#6b5a3a", "#a88c5a", "#e8d8b0",
  "#1a1a1a", "#3a3a3a", "#6b6b6b", "#9a9a9a",
  "#c8c8c8", "#eaf2ff", "#ffffff", "#fff8e0",
  "#0e2a4a", "#123a6b", "#6bfffa", "#ff4d88",
  "#3a0a2a", "#8a1a4a", "#ffb300", "#ffd166",
  "#10241a", "#1e4a2e", "#7dffce", "#c44dff",
  "#241a10", "#4a3a1e", "#8a6f4d", "#d8b06b"
];
var PAL64RGB = PAL64.map(function (h) {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
});
/* TIER 0 — 6-BIT: chunky pixels, bold 64-color arcade palette, faint scanlines */
function post6bit(src, dst, W, H) {
  var sw = Math.max(2, Math.round(W / 4)), sh = Math.max(2, Math.round(H / 4));
  var s = gfxScratch("s6", sw, sh), x = s.getContext("2d");
  if (!x) { dst.drawImage(src, 0, 0); return; }
  try { x.imageSmoothingEnabled = false; } catch (e) {}
  x.drawImage(src, 0, 0, sw, sh);
  var img;
  try { img = x.getImageData(0, 0, sw, sh); } catch (e) { dst.drawImage(src, 0, 0); return; }
  var d = img.data, n = PAL64RGB.length, i, p, pr, pg, pb, dd, best, bd;
  for (i = 0; i < d.length; i += 4) {
    var r = d[i], g = d[i + 1], b = d[i + 2];
    best = 0; bd = 1e12;
    for (p = 0; p < n; p++) {
      pr = PAL64RGB[p][0] - r; pg = PAL64RGB[p][1] - g; pb = PAL64RGB[p][2] - b;
      dd = pr * pr + pg * pg + pb * pb;
      if (dd < bd) { bd = dd; best = p; }
    }
    d[i] = PAL64RGB[best][0]; d[i + 1] = PAL64RGB[best][1]; d[i + 2] = PAL64RGB[best][2];
  }
  try { x.putImageData(img, 0, 0); } catch (e) {}
  try { dst.imageSmoothingEnabled = false; } catch (e) {}
  dst.drawImage(s, 0, 0, W, H);
  try { dst.imageSmoothingEnabled = true; } catch (e) {}
  dst.fillStyle = "rgba(0,0,0,0.10)";
  for (var y = 0; y < H; y += 4) dst.fillRect(0, y, W, 1);
}
/* TIER 1 — 32-BIT: peak 2D. Full color, crisp, warm light leak, rich vignette */
function post32bit(src, dst, W, H) {
  dst.drawImage(src, 0, 0);
  var g = dst.createLinearGradient(0, 0, 0, H * 0.45);
  g.addColorStop(0, "rgba(255,196,120,0.12)");
  g.addColorStop(1, "rgba(255,196,120,0)");
  dst.fillStyle = g; dst.fillRect(0, 0, W, H * 0.45);
  gfxVignette(dst, W, H, 0.24, "#05030a");
}
/* TIER 2 — PLAYSTATION: 15-bit dither + affine swim wobble. Good color kept. */
var BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function postPS1(src, dst, W, H) {
  var sw = W >> 1, sh = H >> 1;
  var s = gfxScratch("sps", sw, sh), x = s.getContext("2d");
  if (!x) { dst.drawImage(src, 0, 0); return; }
  x.drawImage(src, 0, 0, sw, sh);
  var img;
  try { img = x.getImageData(0, 0, sw, sh); } catch (e) { dst.drawImage(src, 0, 0, W, H); return; }
  var d = img.data, xx, yy, i, th;
  for (yy = 0; yy < sh; yy++) {
    for (xx = 0; xx < sw; xx++) {
      i = (yy * sw + xx) * 4;
      th = (BAYER4[((yy & 3) << 2) + (xx & 3)] / 16 - 0.5) * 26;
      d[i] = Math.max(0, Math.min(255, ((d[i] + th) >> 3) << 3));
      d[i + 1] = Math.max(0, Math.min(255, ((d[i + 1] + th) >> 3) << 3));
      d[i + 2] = Math.max(0, Math.min(255, ((d[i + 2] + th) >> 3) << 3));
    }
  }
  try { x.putImageData(img, 0, 0); } catch (e) {}
  var t = gfxFrame * 0.05, slice = 8, y, h, wob;
  for (y = 0; y < sh; y += slice) {
    wob = Math.sin(t + y * 0.22) * 2;
    h = Math.min(slice, sh - y);
    dst.drawImage(s, 0, y, sw, h, wob, y * 2, W, h * 2);
  }
}
/* TIER 3 — 64: clean and slick. Soft bloom, cool vignette. */
function post64(src, dst, W, H) {
  dst.drawImage(src, 0, 0);
  gfxBloom(dst, src, W, H, 0.30, 5);
  gfxVignette(dst, W, H, 0.16, "#04060f");
}
/* drifting dust motes, fixed seed so every load looks the same */
var _DUST = null;
function gfxDust() {
  if (_DUST) return _DUST;
  var a = 987, out = [], i;
  function rnd() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  for (i = 0; i < 46; i++) out.push({ x: rnd(), y: rnd(), s: 0.6 + rnd() * 1.8, v: 0.10 + rnd() * 0.25, p: rnd() * 6.28 });
  _DUST = out;
  return out;
}
/* TIER 4 — PS3: HD showcase. Stronger bloom, god rays, additive dust, grade. */
function postPS3(src, dst, W, H) {
  dst.drawImage(src, 0, 0);
  gfxBloom(dst, src, W, H, 0.45, 7);
  var g = dst.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "rgba(180,220,255,0.15)");
  g.addColorStop(0.55, "rgba(180,220,255,0)");
  dst.save(); dst.globalCompositeOperation = "screen";
  dst.fillStyle = g; dst.fillRect(0, 0, W, H); dst.restore();
  var D = gfxDust(), t = gfxFrame * 0.016, i, p, y, tw;
  dst.save(); dst.globalCompositeOperation = "lighter";
  for (i = 0; i < D.length; i++) {
    p = D[i];
    y = (((p.y - t * p.v) % 1) + 1) % 1;
    tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 2 + p.p));
    dst.globalAlpha = 0.5 * tw;
    dst.fillStyle = "#cfe8ff";
    dst.beginPath(); dst.arc(p.x * W, y * H, p.s, 0, 6.3); dst.fill();
  }
  dst.restore();
  gfxVignette(dst, W, H, 0.20, "#03040a");
}
/* TIER 5 — BEYOND: the best the canvas can do. Max bloom, light streaks,
   cinematic teal-shadow / warm-highlight grade, dense atmosphere. */
function postBeyond(src, dst, W, H) {
  dst.drawImage(src, 0, 0);
  gfxBloom(dst, src, W, H, 0.60, 9);
  var t = gfxFrame * 0.02, i;
  dst.save(); dst.globalCompositeOperation = "screen";
  for (i = 0; i < 3; i++) {
    var x0 = ((t * (40 + i * 25) + i * 220) % (W + 300)) - 150;
    var g = dst.createLinearGradient(x0 - 70, 0, x0 + 70, H);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.5, "rgba(255,255,255," + (0.11 - i * 0.03).toFixed(3) + ")");
    g.addColorStop(1, "rgba(255,255,255,0)");
    dst.fillStyle = g; dst.fillRect(0, 0, W, H);
  }
  dst.restore();
  /* cinematic grade */
  dst.save(); dst.globalCompositeOperation = "screen";
  var wg = dst.createRadialGradient(W * 0.8, H * 0.15, 10, W * 0.8, H * 0.15, W * 0.9);
  wg.addColorStop(0, "rgba(255,190,120,0.16)"); wg.addColorStop(1, "rgba(255,190,120,0)");
  dst.fillStyle = wg; dst.fillRect(0, 0, W, H); dst.restore();
  dst.save(); dst.globalCompositeOperation = "multiply";
  var tg = dst.createRadialGradient(W * 0.15, H * 0.9, 10, W * 0.15, H * 0.9, W * 0.9);
  tg.addColorStop(0, "rgba(120,220,230,0.20)"); tg.addColorStop(1, "rgba(120,220,230,0)");
  dst.fillStyle = tg; dst.fillRect(0, 0, W, H); dst.restore();
  var D = gfxDust(), t2 = gfxFrame * 0.016, p, y, tw;
  dst.save(); dst.globalCompositeOperation = "lighter";
  for (i = 0; i < D.length; i++) {
    p = D[i];
    y = (((p.y - t2 * p.v * 1.6) % 1) + 1) % 1;
    tw = 0.4 + 0.6 * Math.abs(Math.sin(t2 * 2.4 + p.p));
    dst.globalAlpha = 0.65 * tw;
    dst.fillStyle = "#e8f4ff";
    dst.beginPath(); dst.arc(p.x * W, y * H, p.s * 1.3, 0, 6.3); dst.fill();
  }
  dst.restore();
  gfxVignette(dst, W, H, 0.26, "#02030a");
}
function gfxPost(src, dst, W, H, tier) {
  try {
    if (tier === 0) return post6bit(src, dst, W, H);
    if (tier === 1) return post32bit(src, dst, W, H);
    if (tier === 2) return postPS1(src, dst, W, H);
    if (tier === 3) return post64(src, dst, W, H);
    if (tier === 4) return postPS3(src, dst, W, H);
    return postBeyond(src, dst, W, H);
  } catch (e) {
    try { dst.drawImage(src, 0, 0); } catch (e2) {}
  }
}

/* Boot a registered game into a canvas. Returns a handle {stop, state}. */
GF.boot = function (id, canvas, opts) {
  var def = REG[id];
  if (!def) throw new Error("unknown game: " + id);
  opts = opts || {};
  var W = canvas.width || 480, H = canvas.height || 640;
  var view = canvas.getContext("2d");
  /* games render to an offscreen frame; the era tier re-renders it to the visible canvas */
  var off = gfxCanvas(W, H);
  var octx = (off.getContext && off.getContext("2d")) || view;
  var ctx = view;
  var input = makeInput(canvas);
  var sfx = makeSfx();
  var state = { score: 0, over: false, won: false, ticks: 0, msg: "" };
  var api = {
    W: W, H: H, ctx: octx, input: input, sfx: sfx, state: state,
    gfxTier: function () { return gfxTier; },
    gfxName: function () { return GFX_TIERS[gfxTier]; },
    score: function (n) { state.score = n; if (opts.onScore) opts.onScore(n); },
    addScore: function (n) { state.score += n; if (opts.onScore) opts.onScore(state.score); },
    gameOver: function (msg) {
      if (state.over) return;
      state.over = true; state.msg = msg || "Game over";
      sfx.tune([[220, .15], [160, .2], [110, .3]]);
      if (opts.onOver) opts.onOver(state);
    },
    win: function (msg) {
      if (state.over) return;
      state.over = true; state.won = true; state.msg = msg || "You win!";
      sfx.tune([[523, .12], [659, .12], [784, .2]]);
      if (opts.onOver) opts.onOver(state);
    },
    rr: function (a, b) { return a + Math.random() * (b - a); },
    ri: function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); },
    clamp: function (v, a, b) { return v < a ? a : v > b ? b : v; }
  };
  var game = def.boot(api);   // {update(dt), draw(), }
  var last = 0, acc = 0, raf = 0, running = true;
  var STEP = 1 / 60;
  function frame(ts) {
    if (!running) return;
    raf = (typeof requestAnimationFrame !== "undefined")
      ? requestAnimationFrame(frame) : setTimeout(frame, 16);
    var now = ts || Date.now();
    var dt = Math.min(0.1, (now - last) / 1000 || STEP);
    last = now; acc += dt;
    var n = 0;
    while (acc >= STEP && n < 5) { if (!state.over && game.update) game.update(STEP); acc -= STEP; n++; state.ticks++; }
    try { if (game.draw) game.draw(); } catch (e) { /* draw must never kill the loop */ }
    gfxFrame++;
    gfxPost(octx, view, W, H, gfxTier);
    if (state.over && game.drawOver !== false) {
      ctx.fillStyle = "rgba(0,0,0,0.62)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#fff"; ctx.textAlign = "center";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText(state.won ? "🏆 YOU WIN!" : "GAME OVER", W / 2, H / 2 - 14);
      ctx.font = "16px sans-serif";
      ctx.fillText(state.msg, W / 2, H / 2 + 14);
      ctx.fillText("Score: " + state.score, W / 2, H / 2 + 40);
    }
  }
  if (typeof requestAnimationFrame !== "undefined") raf = requestAnimationFrame(frame);
  else raf = setTimeout(frame, 16);
  // expose a manual stepper for the node harness
  var handle = {
    stop: function () {
      running = false;
      try {
        if (typeof cancelAnimationFrame !== "undefined") cancelAnimationFrame(raf);
        else clearTimeout(raf);
      } catch (e) {}
      input._detach();
    },
    state: state, api: api, game: game,
    step: function (dt) {  // harness: advance logic without rAF
      if (!state.over && game.update) { game.update(dt || STEP); state.ticks++; }
      if (game.draw) game.draw();
      try { gfxFrame++; gfxPost(octx, view, W, H, gfxTier); } catch (e) {}
    }
  };
  return handle;
};

/* text helper for canvas games */
GF.label = function (ctx, txt, x, y, size, color, align) {
  ctx.fillStyle = color || "#fff";
  ctx.font = "bold " + (size || 16) + "px sans-serif";
  ctx.textAlign = align || "center";
  ctx.fillText(txt, x, y);
};

root.GF = GF;
root.GameStore = root.GameStore || {};
root.GameStore.register = GF.register;
root.GameStore.meta = GF.setMeta;
root.GameStore.bootFn = function (id) { return REG[id] && REG[id].boot; };
root.GameStore.get = GF.get;
})(typeof window !== "undefined" ? window : globalThis);
