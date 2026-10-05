/* =====================================================================
   THE SIGNATURE GAME STORE — catalog (v1.0)
   13 hand-built playable seeds + deterministic concept long-tail.
   Covers: deterministic SVG per game (hash -> palette, genre -> motif).
   AI personas quoted verbatim from the phone-book canon (ai-catalog.json).
   ===================================================================== */
(function (root) {
"use strict";

/* ---------- seeded hash / rng ---------- */
function hashStr(s) {
  var h = 1779033703 ^ String(s).length;
  for (var i = 0; i < String(s).length; i++) {
    h = Math.imul(h ^ String(s).charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}
function mulberry32(a) {
  a = a >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- 8 palettes (book-cover pattern) ---------- */
var PALETTES = [
  { bg1: "#0b1026", bg2: "#1b2a6b", neon: "#00f0ff", warm: "#ffb300", fg: "#eaf2ff" },
  { bg1: "#160b26", bg2: "#4b166b", neon: "#ff4dff", warm: "#ffd166", fg: "#f7eaff" },
  { bg1: "#0b2417", bg2: "#14532d", neon: "#4dff88", warm: "#ffe14d", fg: "#eafff0" },
  { bg1: "#260b0b", bg2: "#6b1616", neon: "#ff6b4d", warm: "#ffc14d", fg: "#ffefea" },
  { bg1: "#0b1e26", bg2: "#0e4a5a", neon: "#4dd8ff", warm: "#ff9f4d", fg: "#eaf7ff" },
  { bg1: "#221026", bg2: "#5a2a6b", neon: "#c44dff", warm: "#7dffce", fg: "#f3eaff" },
  { bg1: "#101010", bg2: "#2e2e2e", neon: "#ffe14d", warm: "#ff6b4d", fg: "#f5f5f5" },
  { bg1: "#0a1a2f", bg2: "#123a6b", neon: "#6bfffa", warm: "#ff4d88", fg: "#eaf4ff" }
];

/* ---------- the 13 playable seeds ---------- */
var GAMES = [
  { id: "JAH-GAME-000001", key: "neon-serpent", title: "Neon Serpent", genre: "arcade", era: "1970s Arcade",
    desc: "The timeless snake, Signature-style: guide the neon serpent, eat the orbs, don't bite yourself. Speeds up as you feast.",
    controls: "Arrow keys / WASD or swipe. Eat orbs to grow.",
    difficulty: "Easy to learn, hard to master",
    ai: { id: "JAH-AI-DOM-169", name: "Joke Writer", role: "Sideline comic", line: "Punchlines with timing built in — it heckles your high score." } },
  { id: "JAH-GAME-000002", key: "brick-breaker", title: "Brick Breaker Blitz", genre: "arcade", era: "1970s Arcade",
    desc: "Smash every brick with the bouncing power-ball. Catch falling power-ups: wide paddle, multi-ball, laser.",
    controls: "Left/Right arrows or mouse/touch to move the paddle.",
    difficulty: "Easy",
    ai: { id: "JAH-AI-DOM-075", name: "Chess Coach", role: "Strategy tips", line: "Sees six moves deep and teaches you to see two — it calls your angles." } },
  { id: "JAH-GAME-000003", key: "star-vanguard", title: "Star Vanguard", genre: "shooter", era: "1970s Arcade",
    desc: "Classic vertical space shooter: weave through the swarm, blast the invaders, survive the waves. Boss every 5 waves.",
    controls: "Arrows/WASD to fly, Space to shoot.",
    difficulty: "Medium",
    ai: { id: "JAH-AI-SL-138", name: "Signature Ridgeward Pilot", role: "Wingman guide", line: "Your Signature-line wingman — calls out incoming waves." } },
  { id: "JAH-GAME-000004", key: "turbo-circuit", title: "Turbo Circuit", genre: "racer", era: "8-bit",
    desc: "Top-down championship racing: 3 laps, 5 rivals, boost pads and oil slicks. Finish first to take the cup.",
    controls: "Up = gas, Down = brake, Left/Right = steer.",
    difficulty: "Medium",
    ai: { id: "JAH-AI-DOM-164", name: "Fantasy Name Generator", role: "Rival namer", line: "Elves, dwarves, and starfarers, named properly — it names your rivals." } },
  { id: "JAH-GAME-000005", key: "pixel-hopper", title: "Pixel Hopper", genre: "platformer", era: "8-bit",
    desc: "Run, jump and bounce across the floating islands. Grab every star coin, stomp the grumblers, reach the flag.",
    controls: "Arrows/WASD to move, Space/Up to jump.",
    difficulty: "Medium",
    ai: { id: "JAH-AI-DOM-008", name: "Fitness Coach", role: "Cheerleader", line: "Your corner coach — no shame, just reps. It cheers every coin." } },
  { id: "JAH-GAME-000006", key: "gem-matcher", title: "Gem Matcher", genre: "puzzle", era: "90s",
    desc: "Swap gems to line up 3 or more. Chain combos for fever points before the 90-second clock runs out.",
    controls: "Click/tap two adjacent gems to swap.",
    difficulty: "Easy",
    ai: { id: "JAH-AI-DOM-168", name: "Riddle Maker", role: "Hint giver", line: "Twisty words, fair answers — it drops a hint when you're stuck." } },
  { id: "JAH-GAME-000007", key: "starship-odyssey", title: "Starship Odyssey", genre: "explorer", era: "Modern",
    desc: "Our flagship: captain the starship Odyssey across a story-driven multiverse in the style of classic space operas — nebula sectors, robot worlds, candy nebulas and noir stations, with crossover guests from across the Signature universe. Chart sectors, beam down, make choices, and bring the ship home.",
    controls: "Arrows/WASD to steer the ship, Space to scan/pulse, E to beam down at stations.",
    difficulty: "Story — everyone finishes",
    ai: { id: "JAH-AI-DOM-074", name: "Game Master (RPG)", role: "Narrator & guide", line: "Weaves worlds from dice and dreams. The table is yours — it narrates your voyage." },
    best: true,
    bestWhy: "The richest game in the store: a full story voyage across crossover sectors with a real AI narrator, scanning, choices and multiple endings — the one to play first." },
  { id: "JAH-GAME-000008", key: "shadow-strike", title: "Shadow Strike Ops", genre: "combat", era: "Modern",
    desc: "Modern combat-style top-down ops: clear 8 waves of hostiles with rifles, grenades and airstrikes. Stay in the light.",
    controls: "WASD to move, aim with mouse, click to fire, G grenade, Q airstrike.",
    difficulty: "Hard",
    ai: { id: "JAH-AI-SL-139", name: "Signature Sableward Pilot", role: "Squad leader", line: "Your Signature-line squad leader — calls targets and evac windows." } },
  { id: "JAH-GAME-000009", key: "neon-maze", title: "Neon Maze", genre: "maze", era: "90s",
    desc: "A glowing first-person maze rendered in retro raycasting. Find the exit core before your energy drains. 5 mazes, deeper each time.",
    controls: "W/S or Up/Down to walk, A/D or Left/Right to turn.",
    difficulty: "Medium",
    ai: { id: "JAH-AI-DOM-095", name: "Memory Trainer", role: "Maze memory", line: "A palace for every fact — it remembers the turns so you don't have to." } },
  { id: "JAH-GAME-000010", key: "asteroid-miner", title: "Asteroid Miner", genre: "miner", era: "1970s Arcade",
    desc: "Blast the rocks, tractor the ore, dodge the debris. Every chunk of ore is credits — bank 1,000 to clear the belt.",
    controls: "Arrows to thrust/turn, Space to mine-blast.",
    difficulty: "Medium",
    ai: { id: "JAH-AI-DOM-169", name: "Joke Writer", role: "Space-trucker radio", line: "Punchlines with timing built in — keeps the long haul funny." } },
  { id: "JAH-GAME-000011", key: "neon-siege", title: "Neon Siege", genre: "defense", era: "Modern",
    desc: "Tower defense: build blasters, frost and cannon towers along the winding road. Hold 12 waves. No leaks.",
    controls: "Click a tower type, then click the field to build. Click a tower to upgrade.",
    difficulty: "Hard",
    ai: { id: "JAH-AI-DOM-074", name: "Game Master (RPG)", role: "Defense strategist", line: "Weaves worlds from dice and dreams — it narrates the siege and warns of waves." } },
  { id: "JAH-GAME-000012", key: "pong-legends", title: "Pong Legends", genre: "pong", era: "1970s Arcade",
    desc: "The original duel, remastered: first to 7 against an AI champion that learns your angles. Pure reflex.",
    controls: "Up/Down arrows or mouse to move your paddle.",
    difficulty: "Adaptive",
    ai: { id: "JAH-AI-DOM-075", name: "Chess Coach", role: "AI opponent", line: "Sees six moves deep — it IS your opponent, and it adapts." } },
  { id: "JAH-GAME-000013", key: "sky-hopper", title: "Sky Hopper", genre: "flyer", era: "Mobile",
    desc: "One-button flight: tap to flap through the neon gates. Chain perfect gates for fever. How far can you hop?",
    controls: "Space / click / tap to flap.",
    difficulty: "Easy to start, brutal later",
    ai: { id: "JAH-AI-DOM-008", name: "Fitness Coach", role: "Flight coach", line: "Your corner coach — it counts your gates and pushes your best." } }
];

/* ---------- deterministic SVG covers ---------- */
function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

/* ---------- deterministic painted covers (comic-cover bar) ----------
   Same game = same cover (seeded), fast pure-SVG, no external assets.
   Painted look: layered gradients, nebulas, glow, rim light, depth. */
function coverSVG(game, w, h) {
  w = w || 300; h = h || 400;
  var pal = PALETTES[hashStr(game.id) % PALETTES.length];
  var rng = mulberry32(hashStr(game.id + game.title));
  var uid = "c" + String(game.id).replace(/\D/g, "").slice(-6);
  var n = pal.neon, wv = pal.warm, fg = pal.fg, bg1 = pal.bg1, bg2 = pal.bg2;
  var s = "";
  function R(x, y, ww, hh, rx, fill, op) { return '<rect x="' + x + '" y="' + y + '" width="' + ww + '" height="' + hh + '" rx="' + (rx || 0) + '" fill="' + fill + '" opacity="' + (op == null ? 1 : op) + '"/>'; }
  function C(cx, cy, r, fill, op) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '" opacity="' + (op == null ? 1 : op) + '"/>'; }
  function E(cx, cy, rx, ry, fill, op) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '" opacity="' + (op == null ? 1 : op) + '"/>'; }
  function P(pts, fill, op) { return '<polygon points="' + pts + '" fill="' + fill + '" opacity="' + (op == null ? 0.95 : op) + '"/>'; }
  function T(x, y, txt, size, fill, extra) { return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-family="sans-serif" ' + (extra || "") + ' font-size="' + size + '" fill="' + fill + '">' + esc(txt) + "</text>"; }
  function G(id, stops) {
    var o = '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">';
    for (var i = 0; i < stops.length; i++) o += '<stop offset="' + stops[i][0] + '" stop-color="' + stops[i][1] + '"' + (stops[i][2] ? ' stop-opacity="' + stops[i][2] + '"' : "") + "/>";
    return o + "</linearGradient>";
  }
  function RG(id, cx, cy, r, stops) {
    var o = '<radialGradient id="' + id + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '" gradientUnits="userSpaceOnUse">';
    for (var j = 0; j < stops.length; j++) o += '<stop offset="' + stops[j][0] + '" stop-color="' + stops[j][1] + '"' + (stops[j][2] ? ' stop-opacity="' + stops[j][2] + '"' : "") + "/>";
    return o + "</radialGradient>";
  }
  var H = { R: R, C: C, E: E, P: P, T: T, G: G, RG: RG, rng: rng, uid: uid, pal: pal, n: n, wv: wv, fg: fg, bg1: bg1, bg2: bg2 };

  s += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="' + w + '" height="' + h + '" role="img" aria-label="' + esc(game.title) + ' cover">';
  s += "<defs>";
  s += G(uid + "sky", [[0, bg2], [0.55, bg1], [1, "#04060f"]]);
  s += RG(uid + "neb1", 90, 120, 140, [[0, n, 0.55], [1, n, 0]]);
  s += RG(uid + "neb2", 225, 205, 150, [[0, wv, 0.42], [1, wv, 0]]);
  s += G(uid + "plate", [[0, "#05070f", 0.94], [1, "#05070f", 0.30]]);
  s += '<filter id="' + uid + 'b6" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>';
  s += '<filter id="' + uid + 'b12" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="12"/></filter>';
  s += "</defs>";
  s += R(0, 0, 300, 400, 0, "url(#" + uid + "sky)");
  s += E(90, 120, 140, 115, "url(#" + uid + "neb1)", 0.5);
  s += E(225, 205, 150, 120, "url(#" + uid + "neb2)", 0.45);
  var i, sx, sy, sr, so;
  for (i = 0; i < 70; i++) {
    sx = (rng() * 300).toFixed(0); sy = (rng() * 300).toFixed(0);
    sr = (rng() * 1.5 + 0.3).toFixed(1); so = (rng() * 0.6 + 0.25).toFixed(2);
    if (rng() < 0.16) s += C(sx, sy, (+sr + 3).toFixed(1), fg, 0.22);
    s += C(sx, sy, sr, fg, so);
  }
  s += paintedMotif(game.genre, H);
  /* cinematic light streaks over everything */
  s += P("30,400 80,400 210,0 160,0", "#ffffff", 0.05);
  s += P("190,400 222,400 300,110 300,70", n, 0.07);
  /* title plate */
  s += R(0, 292, 300, 108, 0, "url(#" + uid + "plate)");
  s += T(150, 330, game.title.toUpperCase(), 21, n, 'font-weight="bold" letter-spacing="2"');
  s += T(150, 354, game.era + " · " + game.genre, 12, fg, 'letter-spacing="1"');
  s += '<text x="150" y="378" text-anchor="middle" font-family="monospace" font-size="11" fill="' + wv + '">' + esc(game.id) + "</text>";
  s += '<rect x="2" y="2" width="296" height="396" fill="none" stroke="' + n + '" stroke-width="4" opacity="0.8"/>';
  s += '<rect x="9" y="9" width="282" height="382" fill="none" stroke="' + fg + '" stroke-width="1" opacity="0.35"/>';
  s += "</svg>";
  return s;
}

function paintedMotif(genre, H) {
  var R = H.R, C = H.C, E = H.E, P = H.P, T = H.T, rng = H.rng, uid = H.uid;
  var n = H.n, wv = H.wv, fg = H.fg;
  var b6 = ' filter="url(#' + uid + 'b6)"', b12 = ' filter="url(#' + uid + 'b12)"';
  var s = "", i;
  function glowShape(shape) { return shape.replace("/>", b6 + "/>"); }

  if (genre === "shooter" || genre === "explorer") {
    /* ringed planet looming over a hero starship mid-barrage */
    s += C(232, 84, 42, wv, 0.92);
    s += C(220, 74, 42, H.bg1, 0.38);
    s += '<ellipse cx="232" cy="84" rx="60" ry="15" fill="none" stroke="' + wv + '" stroke-width="4" opacity="0.55"/>';
    s += C(150, 242, 30, wv, 0.75).replace("/>", b12 + "/>");
    s += P("150,150 130,198 150,188 170,198", n);
    s += P("150,150 141,198 150,190", fg, 0.55);
    s += P("130,198 104,230 132,222", n, 0.85);
    s += P("170,198 196,230 168,222", n, 0.85);
    s += E(150, 172, 8, 11, fg, 0.95);
    s += C(152, 168, 2.5, "#ffffff", 0.9);
    for (i = 0; i < 3; i++) {
      var lx = 118 + i * 32;
      s += R(lx, 56, 6, 96, 3, wv, 0.85).replace("/>", b6 + "/>");
    }
    for (i = 0; i < 8; i++) s += C((rng() * 300).toFixed(0), (120 + rng() * 160).toFixed(0), (rng() * 2 + 1).toFixed(1), fg, 0.5);
  } else if (genre === "racer") {
    /* night grand prix: perspective road, hero car, headlight beams */
    s += E(150, 150, 130, 20, n, 0.28).replace("/>", b12 + "/>");
    s += P("50,400 250,400 188,148 112,148", "#0e0e18");
    s += P("50,400 112,148 122,148 62,400", n, 0.85);
    s += P("250,400 188,148 178,148 238,400", n, 0.85);
    for (i = 0; i < 5; i++) { var dy = 190 + i * 42, dw = 4 + i * 2.4; s += R(150 - dw / 2, dy, dw, 16 - i * 2, 2, fg, 0.75); }
    s += E(150, 330, 56, 11, "#000000", 0.55);
    s += P("196,296 268,238 268,340", wv, 0.22).replace("/>", b6 + "/>");
    s += R(100, 288, 100, 36, 14, n);
    s += R(100, 288, 100, 14, 14, fg, 0.35);
    s += R(126, 272, 48, 24, 9, "#0a0f22", 0.95);
    s += R(132, 274, 18, 20, 5, fg, 0.5);
    s += C(120, 326, 14, "#0a0a0a"); s += C(120, 326, 6, wv);
    s += C(180, 326, 14, "#0a0a0a"); s += C(180, 326, 6, wv);
    for (i = 0; i < 4; i++) s += R(20, 250 + i * 26, 52 - i * 8, 4, 2, fg, 0.28);
  } else if (genre === "platformer") {
    /* floating islands, caped hopper, star coins */
    function island(x, y, w) {
      var o = "";
      o += E(x, y + 52, w * 0.55, 10, n, 0.35).replace("/>", b6 + "/>");
      o += P(x - w / 2 + "," + y + " " + (x + w / 2) + "," + y + " " + (x + w * 0.28) + "," + (y + 52) + " " + (x - w * 0.28) + "," + (y + 52), "#5a4632");
      o += P(x - w * 0.28 + "," + (y + 52) + " " + (x + w * 0.28) + "," + (y + 52) + " " + x + "," + (y + 66), "#3a2d20");
      o += R(x - w / 2, y - 12, w, 15, 7, n);
      o += R(x - w / 2, y - 12, w, 6, 3, fg, 0.5);
      return o;
    }
    s += island(80, 250, 110);
    s += island(215, 185, 90);
    s += island(105, 120, 70);
    s += R(128, 62, 6, 46, 3, fg, 0.9);
    s += P("134,62 134,84 162,73", n);
    var coins = [[150, 150], [200, 110], [70, 190]];
    for (i = 0; i < coins.length; i++) {
      s += C(coins[i][0], coins[i][1], 10, wv, 0.9).replace("/>", b6 + "/>");
      s += C(coins[i][0], coins[i][1], 9, wv);
      s += C(coins[i][0], coins[i][1], 4.5, "#fff8e0");
    }
    s += E(150, 248, 24, 7, "#000000", 0.4);
    s += C(150, 222, 21, wv);
    s += E(150, 230, 13, 9, fg, 0.45);
    s += C(157, 215, 7.5, "#ffffff"); s += C(159, 216, 3.6, "#111111"); s += C(156, 213, 2, "#ffffff");
    s += P("132,210 112,196 128,226", n, 0.9);
    s += R(138, 240, 10, 12, 4, "#7a5a20"); s += R(154, 240, 10, 12, 4, "#7a5a20");
  } else if (genre === "puzzle") {
    /* faceted gems with sparkle */
    var gems = [[90, 150, n], [160, 120, wv], [220, 170, "#ff6b9d"], [120, 220, fg], [195, 235, "#7dffce"]];
    for (i = 0; i < gems.length; i++) {
      var gx = gems[i][0], gy = gems[i][1], gc = gems[i][2], gr = 24 + (i % 2) * 6;
      s += P(gx + "," + gy + " " + (gx + gr) + "," + (gy + 8) + " " + gx + "," + (gy + 18) + " " + (gx - gr) + "," + (gy + 8), gc, 0.3).replace("/>", b12 + "/>");
      s += P(gx + "," + (gy - gr) + " " + (gx + gr * 0.8) + "," + gy + " " + gx + "," + (gy + gr) + " " + (gx - gr * 0.8) + "," + gy, gc, 0.95);
      s += P(gx + "," + (gy - gr) + " " + (gx + gr * 0.8) + "," + gy + " " + gx + "," + gy, "#ffffff", 0.35);
      s += P((gx - gr * 0.8) + "," + gy + " " + gx + "," + (gy + gr) + " " + gx + "," + gy, "#000000", 0.35);
      s += R(gx - 2, gy - gr - 10, 4, 20, 2, "#ffffff", 0.9);
      s += R(gx - 10, gy - gr - 2, 20, 4, 2, "#ffffff", 0.9);
    }
  } else if (genre === "combat") {
    /* crosshair over a night raid */
    for (i = 0; i < 3; i++) s += P((40 + i * 30) + ",400 " + (90 + i * 30) + ",400 " + (150 + i * 20) + ",180", fg, 0.06);
    s += '<circle cx="150" cy="185" r="66" fill="none" stroke="' + n + '" stroke-width="7" opacity="0.9"/>';
    s += '<circle cx="150" cy="185" r="66" fill="none" stroke="' + n + '" stroke-width="14" opacity="0.3"' + b6 + "/>";
    s += C(150, 185, 9, wv);
    s += R(146, 108, 8, 30, 3, n); s += R(146, 232, 8, 30, 3, n);
    s += R(73, 181, 30, 8, 3, n); s += R(197, 181, 30, 8, 3, n);
    var chev = [[90, 260], [150, 275], [210, 260]];
    for (i = 0; i < chev.length; i++) {
      s += '<polygon points="' + chev[i][0] + ',' + chev[i][1] + " " + (chev[i][0] + 26) + "," + (chev[i][1] - 16) + " " + (chev[i][0] + 52) + "," + chev[i][1] + " " + (chev[i][0] + 52) + "," + (chev[i][1] + 10) + " " + (chev[i][0] + 26) + "," + (chev[i][1] - 6) + " " + chev[i][0] + "," + (chev[i][1] + 10) + '" fill="#14141f" stroke="' + n + '" stroke-width="2.5" opacity="0.95"/>';
    }
    s += C(110, 150, 12, wv, 0.9).replace("/>", b6 + "/>");
    s += C(110, 150, 5, "#ffffff");
  } else if (genre === "maze") {
    /* neon labyrinth plate with a blazing exit core */
    s += R(46, 86, 208, 208, 12, "#0d1226");
    s += R(46, 86, 208, 7, 3, n, 0.85); s += R(46, 86, 7, 208, 3, n, 0.5);
    var walls = [[70, 110, 90, 12], [180, 110, 54, 12], [70, 150, 12, 80], [120, 150, 90, 12], [160, 190, 12, 80], [110, 230, 100, 12]];
    for (i = 0; i < walls.length; i++) {
      s += R(walls[i][0], walls[i][1], walls[i][2], walls[i][3], 4, n, 0.72);
      s += R(walls[i][0], walls[i][1], walls[i][2], 3, 2, fg, 0.6);
    }
    var path = [[86, 262], [86, 200], [140, 200], [140, 168], [200, 168], [200, 210], [228, 210]];
    for (i = 0; i < path.length; i++) s += C(path[i][0], path[i][1], 4, wv, 0.85);
    s += C(232, 236, 17, wv, 0.9).replace("/>", b12 + "/>");
    s += C(232, 236, 16, wv); s += C(232, 236, 7, "#ffffff");
  } else if (genre === "miner") {
    /* ore-rich belt, mining ship, tractor beam */
    var rocks = [[70, 150, 30], [160, 120, 38], [240, 170, 28], [110, 220, 34], [210, 240, 26]];
    for (i = 0; i < rocks.length; i++) {
      var ax = rocks[i][0], ay = rocks[i][1], ar = rocks[i][2];
      var pts = [];
      for (var k = 0; k < 7; k++) { var aa = k / 7 * 6.283, rr = ar * (0.8 + rng() * 0.4); pts.push((ax + Math.cos(aa) * rr).toFixed(0) + "," + (ay + Math.sin(aa) * rr).toFixed(0)); }
      s += P(pts.join(" "), "#8a6f4d", 0.95);
      s += C(ax - ar * 0.25, ay - ar * 0.2, ar * 0.28, "#5a4632", 0.8);
      s += C(ax + ar * 0.3, ay + ar * 0.25, 4, wv, 0.95).replace("/>", b6 + "/>");
    }
    s += P("150,108 118,250 182,250", fg, 0.16).replace("/>", b6 + "/>");
    s += P("150,84 138,112 162,112", n);
    s += R(143, 66, 14, 24, 6, n); s += E(150, 62, 9, 7, fg, 0.9);
    for (i = 0; i < 6; i++) s += C((60 + rng() * 180).toFixed(0), (250 + rng() * 40).toFixed(0), 2.5, wv, 0.8);
  } else if (genre === "defense") {
    /* the winding road at dusk, towers hot */
    s += '<path d="M30,300 Q150,215 270,300" fill="none" stroke="' + fg + '" stroke-width="17" opacity="0.32"/>';
    s += '<path d="M30,300 Q150,215 270,300" fill="none" stroke="' + fg + '" stroke-width="3" stroke-dasharray="12 10" opacity="0.6"/>';
    var tws = [[80, 170], [150, 150], [220, 170]];
    for (i = 0; i < tws.length; i++) {
      var tx = tws[i][0], ty = tws[i][1];
      s += '<circle cx="' + tx + '" cy="' + (ty + 28) + '" r="34" fill="none" stroke="' + fg + '" stroke-width="2" opacity="0.28"/>';
      s += R(tx - 15, ty, 30, 56, 8, "#1a2340");
      s += R(tx - 15, ty, 30, 10, 5, n, 0.8);
      s += C(tx, ty - 8, 14, n);
      s += C(tx, ty - 8, 14, n, 0.4).replace("/>", b6 + "/>");
      s += R(tx - 3, ty - 34, 6, 28, 3, fg);
      s += C(tx, ty - 36, 6, wv, 0.95).replace("/>", b6 + "/>");
    }
    for (i = 0; i < 5; i++) s += C((60 + i * 44).toFixed(0), (292 - Math.sin(i * 0.9) * 22).toFixed(0), 6, "#ff6b6b", 0.9);
  } else if (genre === "pong") {
    /* the eternal duel, dramatic */
    s += T(150, 130, "7", 72, fg, 'font-weight="bold" opacity="0.16"');
    for (i = 0; i < 8; i++) s += R(148, 60 + i * 30, 4, 16, 2, fg, 0.4);
    s += R(52, 150, 15, 96, 7, n, 0.35).replace("/>", b6 + "/>");
    s += R(52, 150, 15, 96, 7, n); s += R(52, 150, 5, 96, 2, fg, 0.7);
    s += R(233, 150, 15, 96, 7, wv, 0.35).replace("/>", b6 + "/>");
    s += R(233, 150, 15, 96, 7, wv); s += R(243, 150, 5, 96, 2, "#fff8e0", 0.7);
    for (i = 0; i < 4; i++) s += R(30 - i * 6, 168 + i * 8, 22, 5, 2, n, 0.3 - i * 0.06);
    for (i = 4; i >= 0; i--) s += C(150 - i * 16, 198, 10 - i * 1.4, wv, 0.25 + (4 - i) * 0.15);
    s += C(150, 198, 11, wv).replace("/>", b6 + "/>");
    s += C(150, 198, 11, wv); s += C(147, 195, 3.5, "#ffffff");
  } else if (genre === "flyer") {
    /* dusk sky, glowing gates, daredevil hopper */
    s += R(0, 60, 300, 90, 0, wv, 0.10); s += R(0, 150, 300, 80, 0, n, 0.10);
    var gates = [70, 150, 230];
    for (i = 0; i < gates.length; i++) {
      var gx2 = gates[i];
      s += R(gx2, 66, 32, 84, 6, n, 0.9); s += R(gx2, 66, 32, 10, 5, fg, 0.5);
      s += R(gx2, 196, 32, 84, 6, n, 0.9); s += R(gx2, 260, 32, 10, 5, fg, 0.5);
      s += R(gx2, 66, 32, 84, 6, n, 0.35).replace("/>", b6 + "/>");
      s += T(gx2 + 16, 178, String(i + 1), 20, fg, 'font-weight="bold" opacity="0.85"');
    }
    for (i = 0; i < 5; i++) s += R(0, 100 + i * 38, 60, 3, 1, fg, 0.25);
    s += E(150, 200, 30, 8, "#000000", 0.3);
    s += E(150, 186, 21, 14, wv);
    s += P("132,182 108,168 112,192", wv);
    s += P("168,182 190,172 186,194", "#c78a1e");
    s += C(158, 181, 4, "#111111"); s += C(157, 180, 1.4, "#ffffff");
  } else {
    /* arcade default: neon serpent coiled around its orb */
    var segs = 8, px2 = 80, py2 = 210;
    for (i = 0; i < segs; i++) {
      var rr2 = 15 - i * 1.1;
      s += C(px2.toFixed(0), py2.toFixed(0), rr2.toFixed(1), n, 0.35).replace("/>", b6 + "/>");
      s += C(px2.toFixed(0), py2.toFixed(0), rr2.toFixed(1), n);
      s += C((px2 - rr2 * 0.3).toFixed(0), (py2 - rr2 * 0.3).toFixed(0), (rr2 * 0.4).toFixed(1), fg, 0.5);
      px2 += (i % 3 === 2 ? -26 : 26); py2 += (i % 2 ? 26 : -8);
      px2 = Math.max(56, Math.min(244, px2)); py2 = Math.max(90, Math.min(262, py2));
    }
    s += C(80, 210, 13, wv, 0.85).replace("/>", b12 + "/>");
    s += C(80, 210, 12, wv); s += C(80, 210, 5, "#fff8e0");
    s += C(66, 198, 5, "#ffffff"); s += C(94, 198, 5, "#ffffff");
    s += C(66, 199, 2.4, "#111111"); s += C(94, 199, 2.4, "#111111");
    for (i = 0; i < 2; i++) for (var q2 = 0; q2 < 5; q2++)
      s += R(52 + q2 * 50, 96 + i * 24, 42, 18, 5, [n, wv, fg, "#ff6b9d", "#7dffce"][(i * 5 + q2) % 5], 0.9);
  }
  return s;
}

/* ---------- deterministic concept long-tail (marches to 1M) ---------- */
var CONCEPT_GENRES = ["arcade", "shooter", "racer", "platformer", "puzzle", "explorer", "combat", "maze", "miner", "defense", "pong", "flyer"];
var CONCEPT_ERAS = ["1970s Arcade", "8-bit", "16-bit", "90s", "Modern", "Mobile", "Future"];
var T1 = ["Neon", "Turbo", "Quantum", "Crimson", "Shadow", "Pixel", "Astro", "Iron", "Storm", "Ghost", "Solar", "Vortex", "Ember", "Frost", "Blaze", "Echo"];
var T2 = ["Strike", "Drift", "Quest", "Siege", "Run", "Legends", "Force", "Realm", "Dash", "Arena", "Voyage", "Clash", "Rising", "Prime", "Zero", "X"];
var HOOKS = {
  arcade: "Dodge the patterns, chase the high score — pure reflex joy.",
  shooter: "Blast the swarm, dodge the storm, beat the boss.",
  racer: "Out-drive the pack across wild tracks.",
  platformer: "Jump, bounce and climb to the goal flag.",
  puzzle: "Think three moves ahead and clear the board.",
  explorer: "Chart strange sectors and uncover their secrets.",
  combat: "Hold the line through escalating waves.",
  maze: "Find the exit before your energy runs out.",
  miner: "Harvest the belt and bank your credits.",
  defense: "Build, upgrade, and hold the road.",
  pong: "The eternal duel of paddle and ball.",
  flyer: "Thread the gates — one more try."
};

function conceptFor(n) {  // n >= 14  -> deterministic concept
  var rng = mulberry32(hashStr("JAH-GAME-" + n));
  var genre = CONCEPT_GENRES[Math.floor(rng() * CONCEPT_GENRES.length)];
  var era = CONCEPT_ERAS[Math.floor(rng() * CONCEPT_ERAS.length)];
  var title = T1[Math.floor(rng() * T1.length)] + " " + T2[Math.floor(rng() * T2.length)];
  var id = "JAH-GAME-" + String(n).padStart(6, "0");
  var d = "A Signature-line " + genre + " concept in " + era + " style. " + HOOKS[genre] + " (Concept record — full build queued in the generator.)";
  return {
    id: id, title: title, genre: genre, era: era, concept: true,
    desc: d, description: d,
    controls: "Concept — controls ship with the full build.",
    rules: "Concept record — the full build ships with complete rules and win conditions.",
    win: "Concept record — win conditions ship with the full build.",
    difficulty: ["Easy", "Medium", "Hard"][Math.floor(rng() * 3)],
    seed: n,
    cover: { palette: hashStr(id) % PALETTES.length, motif: genre },
    ai: { id: "JAH-AI-DOM-074", name: "Game Master (RPG)", role: "Concept narrator", line: "Weaves worlds from dice and dreams." }
  };
}

/* ---------- helpers the store pages call ---------- */
function aiName(ai) { return (ai && ai.name) || "Game Master (RPG)"; }
function aiPersona(ai) {
  ai = ai || {};
  var role = ai.role || "AI pal", line = ai.line || "";
  return {
    id: ai.id || "", name: aiName(ai), role: role, line: line,
    desc: role + (line ? " — " + line : ""),
    tip: line || "Ask me anything about this game."
  };
}
/* normalize seed records so the pages never render "undefined" */
GAMES.forEach(function (g) {
  if (!g.description && g.desc) g.description = g.desc;
  if (!g.win) g.win = "The game scores your run — play for the high score.";
  if (!g.aiRole && g.ai && g.ai.role) g.aiRole = g.ai.role;
  if (typeof g.playable === "undefined") g.playable = true;
  g.cover = { palette: hashStr(g.id) % PALETTES.length, motif: g.genre || "arcade" };
});

/* archive helpers */
function allPlayable() { return GAMES; }
function findGame(id) {
  for (var i = 0; i < GAMES.length; i++) if (GAMES[i].id === id) return GAMES[i];
  var m = /^JAH-GAME-(\d{6})$/.exec(id || "");
  if (m) { var n = parseInt(m[1], 10); if (n >= 14 && n <= 1000000) return conceptFor(n); }
  return null;
}
function letterOf(g) {
  var c = (g.title || "?").charAt(0).toUpperCase();
  return (c >= "A" && c <= "Z") ? c : "#";
}

root.GameCatalog = {
  GAMES: GAMES, coverSVG: coverSVG, conceptFor: conceptFor,
  allPlayable: allPlayable, findGame: findGame, letterOf: letterOf,
  PALETTES: PALETTES, esc: esc, aiName: aiName, aiPersona: aiPersona
};
})(typeof window !== "undefined" ? window : globalThis);
