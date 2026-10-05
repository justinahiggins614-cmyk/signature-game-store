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

function coverSVG(game, w, h) {
  w = w || 300; h = h || 400;
  var pal = PALETTES[hashStr(game.id) % PALETTES.length];
  var rng = mulberry32(hashStr(game.id + game.title));
  var s = "";
  s += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="' + w + '" height="' + h + '" role="img" aria-label="' + esc(game.title) + ' cover">';
  s += '<defs><linearGradient id="g' + game.id.slice(-6) + '" x1="0" y1="0" x2="0" y2="1">' +
       '<stop offset="0" stop-color="' + pal.bg2 + '"/><stop offset="1" stop-color="' + pal.bg1 + '"/></linearGradient></defs>';
  s += '<rect width="300" height="400" fill="url(#g' + game.id.slice(-6) + ')"/>';
  // starfield
  for (var i = 0; i < 40; i++) {
    s += '<circle cx="' + (rng() * 300).toFixed(0) + '" cy="' + (rng() * 400).toFixed(0) + '" r="' + (rng() * 1.6 + 0.4).toFixed(1) + '" fill="' + pal.fg + '" opacity="' + (rng() * 0.6 + 0.2).toFixed(2) + '"/>';
  }
  s += motif(game.genre, pal, rng);
  // title plate
  s += '<rect x="0" y="296" width="300" height="104" fill="rgba(0,0,0,0.55)"/>';
  s += '<text x="150" y="330" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="21" fill="' + pal.neon + '">' + esc(game.title.toUpperCase()) + '</text>';
  s += '<text x="150" y="354" text-anchor="middle" font-family="sans-serif" font-size="12" fill="' + pal.fg + '">' + esc(game.era) + ' · ' + esc(game.genre) + '</text>';
  s += '<text x="150" y="378" text-anchor="middle" font-family="monospace" font-size="11" fill="' + pal.warm + '">' + esc(game.id) + '</text>';
  s += '<rect x="0" y="0" width="300" height="400" fill="none" stroke="' + pal.neon + '" stroke-width="4" opacity="0.7"/>';
  s += '</svg>';
  return s;
}

function motif(genre, pal, rng) {
  var n = pal.neon, wv = pal.warm, fg = pal.fg, s = "";
  function poly(pts, fill, op) { return '<polygon points="' + pts + '" fill="' + fill + '" opacity="' + (op || 0.9) + '"/>'; }
  if (genre === "shooter" || genre === "explorer") {
    // starship + lasers + planet
    s += '<circle cx="228" cy="86" r="44" fill="' + wv + '" opacity="0.85"/>';
    s += '<circle cx="228" cy="86" r="54" fill="none" stroke="' + wv + '" stroke-width="3" opacity="0.5"/>';
    s += poly("150,210 138,238 162,238", n, 0.95);
    s += '<rect x="144" y="180" width="12" height="34" rx="5" fill="' + n + '"/>';
    s += '<rect x="128" y="206" width="44" height="10" rx="4" fill="' + fg + '" opacity="0.9"/>';
    for (var i = 0; i < 4; i++) s += '<rect x="' + (100 + i * 26) + '" y="' + (120 + (i % 2) * 30) + '" width="4" height="34" fill="' + wv + '" opacity="0.8"/>';
  } else if (genre === "racer") {
    s += poly("110,300 190,300 235,120 65,120", "#222", 1);
    s += poly("146,300 154,300 152,120 148,120", fg, 0.8);
    s += '<rect x="128" y="220" width="44" height="26" rx="8" fill="' + n + '"/>';
    s += '<rect x="134" y="226" width="32" height="12" rx="4" fill="' + pal.bg1 + '" opacity="0.8"/>';
    s += '<circle cx="136" cy="250" r="7" fill="#111"/><circle cx="164" cy="250" r="7" fill="#111"/>';
    s += '<rect x="60" y="60" width="180" height="26" rx="6" fill="rgba(0,0,0,0.5)"/>';
  } else if (genre === "platformer") {
    for (var p = 0; p < 4; p++) s += '<rect x="' + (20 + p * 72) + '" y="' + (250 - p * 42) + '" width="64" height="14" rx="6" fill="' + n + '" opacity="0.85"/>';
    s += '<rect x="142" y="120" width="26" height="34" rx="8" fill="' + wv + '"/>';
    s += '<circle cx="155" cy="112" r="11" fill="' + wv + '"/>';
    for (var c = 0; c < 3; c++) s += '<circle cx="' + (60 + c * 90) + '" cy="' + (200 - c * 40) + '" r="9" fill="' + wv + '" stroke="' + fg + '" stroke-width="2"/>';
  } else if (genre === "puzzle") {
    var cols = [n, wv, fg, "#ff6b9d"];
    for (var r = 0; r < 4; r++) for (var q = 0; q < 4; q++) {
      var cx = 70 + q * 44, cy = 90 + r * 44;
      s += poly(cx + "," + (cy - 14) + " " + (cx + 13) + "," + cy + " " + cx + "," + (cy + 14) + " " + (cx - 13) + "," + cy, cols[(r + q) % 4], 0.9);
    }
  } else if (genre === "combat") {
    s += '<circle cx="150" cy="170" r="70" fill="none" stroke="' + n + '" stroke-width="6" opacity="0.9"/>';
    s += '<circle cx="150" cy="170" r="8" fill="' + wv + '"/>';
    s += '<rect x="147" y="96" width="6" height="30" fill="' + n + '"/>';
    s += '<rect x="147" y="214" width="6" height="30" fill="' + n + '"/>';
    s += '<rect x="76" y="167" width="30" height="6" fill="' + n + '"/>';
    s += '<rect x="194" y="167" width="30" height="6" fill="' + n + '"/>';
  } else if (genre === "maze") {
    s += '<rect x="60" y="60" width="180" height="180" fill="none" stroke="' + n + '" stroke-width="5"/>';
    for (var m = 0; m < 6; m++) {
      var x1 = 60 + rng() * 160, y1 = 60 + rng() * 160;
      s += '<rect x="' + x1.toFixed(0) + '" y="' + y1.toFixed(0) + '" width="' + (20 + rng() * 60).toFixed(0) + '" height="8" fill="' + n + '" opacity="0.7"/>';
    }
    s += '<circle cx="230" cy="230" r="10" fill="' + wv + '"/>';
  } else if (genre === "miner") {
    for (var a = 0; a < 6; a++) {
      var ax = 50 + rng() * 200, ay = 60 + rng() * 150;
      s += poly(ax + "," + ay + " " + (ax + 26) + "," + (ay + 8) + " " + (ax + 14) + "," + (ay + 30), "#8a6f4d", 0.95);
      s += '<circle cx="' + (ax + 13).toFixed(0) + '" cy="' + (ay + 14).toFixed(0) + '" r="4" fill="' + wv + '"/>';
    }
    s += poly("150,250 138,278 162,278", n, 0.95);
    s += '<rect x="144" y="220" width="12" height="34" rx="5" fill="' + n + '"/>';
  } else if (genre === "defense") {
    s += '<path d="M40,260 Q150,180 260,260" fill="none" stroke="' + fg + '" stroke-width="10" opacity="0.5"/>';
    for (var t = 0; t < 3; t++) {
      var tx = 80 + t * 70;
      s += '<rect x="' + tx + '" y="150" width="26" height="60" rx="6" fill="' + n + '" opacity="0.9"/>';
      s += '<circle cx="' + (tx + 13) + '" cy="142" r="12" fill="' + wv + '"/>';
    }
  } else if (genre === "pong") {
    s += '<rect x="52" y="120" width="12" height="80" rx="6" fill="' + n + '"/>';
    s += '<rect x="236" y="120" width="12" height="80" rx="6" fill="' + n + '"/>';
    s += '<circle cx="150" cy="160" r="11" fill="' + wv + '"/>';
    s += '<rect x="148" y="60" width="4" height="180" fill="' + fg + '" opacity="0.4"/>';
  } else if (genre === "flyer") {
    for (var g = 0; g < 3; g++) {
      var gx = 60 + g * 80;
      s += '<rect x="' + gx + '" y="60" width="34" height="90" fill="' + n + '" opacity="0.85"/>';
      s += '<rect x="' + gx + '" y="200" width="34" height="80" fill="' + n + '" opacity="0.85"/>';
    }
    s += '<ellipse cx="150" cy="176" rx="20" ry="14" fill="' + wv + '"/>';
    s += poly("130,176 112,166 112,186", wv, 1);
    s += '<circle cx="158" cy="172" r="3" fill="#111"/>';
  } else { // arcade default: serpent/bricks vibe
    var px = 70, py = 200;
    s += '<circle cx="230" cy="100" r="16" fill="' + wv + '"/>';
    for (var sg = 0; sg < 8; sg++) {
      s += '<rect x="' + px + '" y="' + py + '" width="22" height="22" rx="7" fill="' + (sg % 2 ? n : fg) + '" opacity="0.92"/>';
      px += (sg % 3 === 2 ? -24 : 24); py += (sg % 2 ? 24 : -6);
      px = Math.max(50, Math.min(230, px)); py = Math.max(80, Math.min(260, py));
    }
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
