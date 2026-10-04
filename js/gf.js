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

/* Boot a registered game into a canvas. Returns a handle {stop, state}. */
GF.boot = function (id, canvas, opts) {
  var def = REG[id];
  if (!def) throw new Error("unknown game: " + id);
  opts = opts || {};
  var W = canvas.width || 480, H = canvas.height || 640;
  var ctx = canvas.getContext("2d");
  var input = makeInput(canvas);
  var sfx = makeSfx();
  var state = { score: 0, over: false, won: false, ticks: 0, msg: "" };
  var api = {
    W: W, H: H, ctx: ctx, input: input, sfx: sfx, state: state,
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
})(typeof window !== "undefined" ? window : globalThis);
