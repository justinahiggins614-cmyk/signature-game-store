/* Neon Maze — retro raycaster. Find the exit core. */
GameStore.register("neon-maze", { boot: function (api) {
  var W = api.W, H = api.H;
  var MAPS = [
    ["##########", "#........#", "#.##.###.#", "#.#......#", "#.#.####.#", "#.#.#....#", "#...#.##.#", "###.#....#", "#....###E#", "##########"],
    ["##########", "#..#.....#", "#..#.###.#", "#..#.#...#", "#.##.#.#.#", "#....#.#.#", "####.#.#.#", "#....#...#", "#.######E#", "##########"]
  ];
  var map, px, py, pa, energy, level, exitFound;
  function loadLevel(lv) {
    var raw = MAPS[lv % MAPS.length];
    map = raw.map(function (r) { return r.split(""); });
    px = 1.5; py = 1.5; pa = 0; energy = 100; exitFound = false;
  }
  loadLevel(0); level = 1; api.score(0);
  function cast(ra) {
    var r = 0;
    while (r < 12) {
      r += 0.05;
      var x = Math.floor(px + Math.cos(ra) * r), y = Math.floor(py + Math.sin(ra) * r);
      if (y < 0 || y >= map.length || x < 0 || x >= map[0].length || map[y][x] === "#") return r;
    }
    return 12;
  }
  return {
    update: function (dt) {
      var ax = api.input.axis();
      if (ax.x === -1) pa -= 2.4 * dt;
      if (ax.x === 1) pa += 2.4 * dt;
      var mv = 0;
      if (ax.y === -1) mv = 2.2; else if (ax.y === 1) mv = -1.6;
      var nx = px + Math.cos(pa) * mv * dt, ny = py + Math.sin(pa) * mv * dt;
      if (map[Math.floor(py)][Math.floor(nx)] !== "#") px = nx;
      if (map[Math.floor(ny)][Math.floor(px)] !== "#") py = ny;
      energy -= dt * 1.1;
      if (energy <= 0) return api.gameOver("Energy depleted in maze " + level + "!");
      var cx = Math.floor(px), cy = Math.floor(py);
      if (map[cy][cx] === "E") {
        api.addScore(Math.round(energy) * 5 + 200);
        level++;
        if (level > 5) return api.win("All 5 mazes escaped! Master navigator.");
        loadLevel(level - 1); api.sfx.tune([[659, .1], [880, .16]]);
      }
    },
    draw: function () {
      var ctx = api.ctx;
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
      var rays = 60;
      for (var i = 0; i < rays; i++) {
        var ra = pa - 0.5 + (i / rays);
        var d = cast(ra) * Math.cos((i / rays) - 0.5);
        var hgt = Math.min(H, (H * 0.9) / Math.max(0.2, d));
        var sh = Math.max(0, 1 - d / 10);
        ctx.fillStyle = "rgb(" + Math.round(0 + sh * 0) + "," + Math.round(240 * sh) + "," + Math.round(255 * sh) + ")";
        ctx.fillRect(i * (W / rays), (H - hgt) / 2, W / rays + 1, hgt);
      }
      // minimap
      var s = 8, mx = W - map[0].length * s - 10, my = 40;
      for (var y = 0; y < map.length; y++) for (var x = 0; x < map[0].length; x++) {
        if (map[y][x] === "#") { ctx.fillStyle = "#1b2a6b"; ctx.fillRect(mx + x * s, my + y * s, s, s); }
        else if (map[y][x] === "E") { ctx.fillStyle = "#ffb300"; ctx.fillRect(mx + x * s, my + y * s, s, s); }
      }
      ctx.fillStyle = "#00f0ff";
      ctx.beginPath(); ctx.arc(mx + px * s, my + py * s, 4, 0, 7); ctx.fill();
      ctx.fillStyle = "#333"; ctx.fillRect(12, 12, 120, 12);
      ctx.fillStyle = "#00f0ff"; ctx.fillRect(12, 12, 120 * energy / 100, 12);
      GF.label(ctx, "MAZE " + Math.min(5, level) + "/5   SCORE " + api.state.score, W / 2, 22, 14, "#eaf2ff");
    }
  };
}});

/* Asteroid Miner — blast rocks, tractor ore, bank 1000 credits. */
GameStore.register("asteroid-miner", { boot: function (api) {
  var W = api.W, H = api.H;
  var ship, rocks, ores, shots, credits, banked;
  function rock(x, y, big) {
    return { x: x, y: y, vx: api.rr(-1, 1), vy: api.rr(-1, 1), r: big ? api.ri(22, 34) : api.ri(10, 16), big: big, rot: Math.random() * 6, vr: api.rr(-1, 1) };
  }
  function reset() {
    ship = { x: W / 2, y: H / 2, a: 0, vx: 0, vy: 0, cd: 0 };
    rocks = []; ores = []; shots = [];
    for (var i = 0; i < 7; i++) rocks.push(rock(Math.random() * W, Math.random() * H, true));
    credits = 0; banked = 0; api.score(0);
  }
  reset();
  return {
    update: function (dt) {
      var ax = api.input.axis();
      if (ax.y === -1) { ship.vx += Math.cos(ship.a) * 6 * dt; ship.vy += Math.sin(ship.a) * 6 * dt; }
      if (ax.x === -1) ship.a -= 3.4 * dt;
      if (ax.x === 1) ship.a += 3.4 * dt;
      ship.vx *= 0.99; ship.vy *= 0.99;
      ship.x = (ship.x + ship.vx + W) % W; ship.y = (ship.y + ship.vy + H) % H;
      ship.cd -= dt;
      if ((api.input.pressed("Space") || api.input.consumeTap()) && ship.cd <= 0) {
        shots.push({ x: ship.x + Math.cos(ship.a) * 18, y: ship.y + Math.sin(ship.a) * 18, vx: Math.cos(ship.a) * 8 + ship.vx, vy: Math.sin(ship.a) * 8 + ship.vy, t: 1.2 });
        ship.cd = 0.22; api.sfx.beep(330, 0.06, "sawtooth");
      }
      api.input.keys.Space = false;
      var i, j;
      for (i = shots.length - 1; i >= 0; i--) {
        var s = shots[i]; s.t -= dt; s.x = (s.x + s.vx + W) % W; s.y = (s.y + s.vy + H) % H;
        if (s.t <= 0) { shots.splice(i, 1); continue; }
        for (j = rocks.length - 1; j >= 0; j--) {
          var r = rocks[j];
          if (Math.hypot(s.x - r.x, s.y - r.y) < r.r) {
            shots.splice(i, 1); rocks.splice(j, 1); api.sfx.beep(150, 0.12);
            if (r.big) { rocks.push(rock(r.x, r.y, false)); rocks.push(rock(r.x, r.y, false)); }
            for (var k = 0; k < 3; k++) ores.push({ x: r.x, y: r.y, vx: api.rr(-2, 2), vy: api.rr(-2, 2), v: r.big ? 25 : 15 });
            break;
          }
        }
      }
      for (i = ores.length - 1; i >= 0; i--) {
        var o = ores[i]; o.x += o.vx; o.y += o.vy; o.vx *= 0.98; o.vy *= 0.98;
        if (Math.hypot(o.x - ship.x, o.y - ship.y) < 26) { ores.splice(i, 1); credits += o.v; api.addScore(o.v); api.sfx.beep(990, 0.05); }
      }
      for (i = 0; i < rocks.length; i++) {
        var rk = rocks[i];
        rk.x = (rk.x + rk.vx + W) % W; rk.y = (rk.y + rk.vy + H) % H; rk.rot += rk.vr * dt;
        if (Math.hypot(rk.x - ship.x, rk.y - ship.y) < rk.r + 10)
          return api.gameOver("Hull breached! You banked " + banked + " credits.");
      }
      if (credits - banked >= 200) { banked = credits; api.sfx.tune([[660, .08], [880, .1]]); }
      if (banked >= 1000) return api.win("1,000 credits banked! Belt cleared, miner.");
      if (rocks.length === 0) for (i = 0; i < 5; i++) rocks.push(rock(Math.random() * W, 0, true));
    },
    draw: function () {
      var ctx = api.ctx;
      ctx.fillStyle = "#060810"; ctx.fillRect(0, 0, W, H);
      var i;
      ctx.fillStyle = "#8a6f4d";
      for (i = 0; i < rocks.length; i++) {
        var r = rocks[i];
        ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.rot);
        ctx.beginPath();
        for (var k = 0; k < 8; k++) { var a = k / 8 * 6.283, rr = r.r * (0.8 + 0.2 * Math.sin(k * 3 + r.rot)); ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
        ctx.closePath(); ctx.fill(); ctx.restore();
      }
      ctx.fillStyle = "#ffe14d";
      for (i = 0; i < ores.length; i++) { ctx.beginPath(); ctx.arc(ores[i].x, ores[i].y, 4, 0, 7); ctx.fill(); }
      ctx.fillStyle = "#fff";
      for (i = 0; i < shots.length; i++) ctx.fillRect(shots[i].x - 1, shots[i].y - 4, 2, 8);
      ctx.save(); ctx.translate(ship.x, ship.y); ctx.rotate(ship.a);
      ctx.fillStyle = "#00f0ff";
      ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-10, -10); ctx.lineTo(-6, 0); ctx.lineTo(-10, 10); ctx.closePath(); ctx.fill();
      ctx.restore();
      // tractor radius
      ctx.strokeStyle = "rgba(0,240,255,0.25)"; ctx.beginPath(); ctx.arc(ship.x, ship.y, 26, 0, 7); ctx.stroke();
      GF.label(ctx, "CREDITS " + banked + " / 1000   SCORE " + api.state.score, W / 2, 22, 14, "#eaf2ff");
    }
  };
}});

/* Neon Siege — tower defense: 12 waves, no leaks. */
GameStore.register("neon-siege", { boot: function (api) {
  var W = api.W, H = api.H;
  var PATH = [];
  (function () {
    var pts = [[-20, 120], [120, 120], [120, 300], [300, 300], [300, 140], [W - 60, 140], [W - 60, 420], [180, 420], [180, 520], [W + 20, 520]];
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1], d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.ceil(d / 8);
      for (var k = 0; k < n; k++) PATH.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
    }
  })();
  var TYPES = {
    blaster: { cost: 50, rng: 95, dmg: 1, rate: 0.5, color: "#00f0ff" },
    frost: { cost: 75, rng: 80, dmg: 0.4, rate: 0.8, color: "#9fd8ff", slow: true },
    cannon: { cost: 120, rng: 120, dmg: 3, rate: 1.1, color: "#ffb300" }
  };
  var towers, foes, shots, gold, lives, wave, wstate, wtimer, sel;
  function reset() {
    towers = []; foes = []; shots = [];
    gold = 160; lives = 20; wave = 0; wstate = "build"; wtimer = 0; sel = "blaster";
    api.score(0);
  }
  function startWave() {
    wave++; wstate = "fight";
    var n = 5 + wave * 2;
    for (var i = 0; i < n; i++)
      foes.push({ pi: -i * 26, hp: 4 + wave * 2.2, maxhp: 4 + wave * 2.2, sp: 26 + wave * 2.2, slow: 0, x: -30, y: 120 });
  }
  reset();
  return {
    update: function (dt) {
      wtimer += dt;
      if (wstate === "build" && wtimer > 1.2) { startWave(); wtimer = 0; }
      var tap = api.input.consumeTap();
      if (tap) {
        // tap tower buttons row (bottom)
        if (tap.y > H - 64) {
          var names = Object.keys(TYPES);
          var idx = Math.floor(tap.x / (W / names.length));
          if (names[idx]) { sel = names[idx]; api.sfx.beep(600, 0.05); }
        } else {
          var T = TYPES[sel];
          if (gold >= T.cost) {
            var ok = true;
            for (var i = 0; i < towers.length; i++) if (Math.hypot(towers[i].x - tap.x, towers[i].y - tap.y) < 34) ok = false;
            // not on path
            for (i = 0; i < PATH.length; i += 6) if (Math.hypot(PATH[i][0] - tap.x, PATH[i][1] - tap.y) < 30) ok = false;
            if (ok) { towers.push({ x: tap.x, y: tap.y, type: sel, cd: 0, lvl: 1 }); gold -= T.cost; api.sfx.beep(700, 0.07); }
            else api.sfx.beep(160, 0.1);
          } else api.sfx.beep(160, 0.1);
        }
      }
      var i, j;
      for (i = foes.length - 1; i >= 0; i--) {
        var f = foes[i];
        f.slow = Math.max(0, f.slow - dt);
        f.pi += f.sp * (f.slow > 0 ? 0.45 : 1) * dt;
        var pi2 = Math.max(0, Math.min(PATH.length - 1, Math.floor(f.pi)));
        var p = PATH[pi2];
        f.x = p[0]; f.y = p[1];
        if (f.pi >= PATH.length - 1) { foes.splice(i, 1); lives--; api.sfx.beep(120, 0.2); if (lives <= 0) return api.gameOver("The road was overrun on wave " + wave + "!"); }
      }
      for (i = 0; i < towers.length; i++) {
        var t = towers[i], TD = TYPES[t.type];
        t.cd -= dt;
        if (t.cd > 0) continue;
        var best = null, bd = 1e9;
        for (j = 0; j < foes.length; j++) {
          var d = Math.hypot(foes[j].x - t.x, foes[j].y - t.y);
          if (d < TD.rng && d < bd) { bd = d; best = foes[j]; }
        }
        if (best) {
          t.cd = TD.rate;
          shots.push({ x: t.x, y: t.y, tx: best.x, ty: best.y, dmg: TD.dmg * t.lvl, color: TD.color, slow: !!TD.slow, sp: 420 });
          api.sfx.beep(t.type === "cannon" ? 200 : 800, 0.04);
        }
      }
      for (i = shots.length - 1; i >= 0; i--) {
        var s = shots[i];
        var dx = s.tx - s.x, dy = s.ty - s.y, d = Math.hypot(dx, dy);
        if (d < 12) {
          for (j = foes.length - 1; j >= 0; j--) {
            var f2 = foes[j];
            if (Math.hypot(f2.x - s.tx, f2.y - s.ty) < 26) {
              f2.hp -= s.dmg; if (s.slow) f2.slow = 1.6;
              if (f2.hp <= 0) { foes.splice(j, 1); gold += 8; api.addScore(20); }
            }
          }
          shots.splice(i, 1);
        } else { s.x += dx / d * s.sp * dt; s.y += dy / d * s.sp * dt; }
      }
      if (wstate === "fight" && foes.length === 0) {
        api.addScore(wave * 100); gold += 40;
        if (wave >= 12) return api.win("12 waves held! The city stands.");
        wstate = "build"; wtimer = 0;
      }
    },
    draw: function () {
      var ctx = api.ctx;
      ctx.fillStyle = "#0a0f1a"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#3a3a55"; ctx.lineWidth = 26; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(PATH[0][0], PATH[0][1]);
      for (var i = 1; i < PATH.length; i += 4) ctx.lineTo(PATH[i][0], PATH[i][1]);
      ctx.stroke();
      var k;
      for (k = 0; k < towers.length; k++) {
        var t = towers[k], TD = TYPES[t.type];
        ctx.fillStyle = TD.color;
        ctx.fillRect(t.x - 13, t.y - 13, 26, 26);
        ctx.fillStyle = "#0a0f1a"; ctx.font = "bold 13px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(t.type[0].toUpperCase(), t.x, t.y + 5);
        if (t.lvl > 1) { ctx.fillStyle = "#ffe14d"; ctx.fillText("★", t.x + 12, t.y - 12); }
      }
      for (k = 0; k < foes.length; k++) {
        var f = foes[k];
        ctx.fillStyle = f.slow > 0 ? "#9fd8ff" : "#ff4d6b";
        ctx.beginPath(); ctx.arc(f.x, f.y, 10, 0, 7); ctx.fill();
        ctx.fillStyle = "#333"; ctx.fillRect(f.x - 12, f.y - 18, 24, 5);
        ctx.fillStyle = "#4dff88"; ctx.fillRect(f.x - 12, f.y - 18, 24 * Math.max(0, f.hp / f.maxhp), 5);
      }
      ctx.fillStyle = "#ffe14d";
      for (k = 0; k < shots.length; k++) { ctx.beginPath(); ctx.arc(shots[k].x, shots[k].y, 4, 0, 7); ctx.fill(); }
      // HUD + build bar
      ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(0, 0, W, 34);
      GF.label(ctx, "WAVE " + Math.max(1, wave) + "/12   ❤ " + lives + "   🪙 " + gold + "   SCORE " + api.state.score, W / 2, 22, 14, "#eaf2ff");
      var names = Object.keys(TYPES), bw = W / names.length;
      for (k = 0; k < names.length; k++) {
        var TD2 = TYPES[names[k]];
        ctx.fillStyle = sel === names[k] ? "rgba(0,240,255,0.25)" : "rgba(255,255,255,0.07)";
        ctx.fillRect(k * bw + 2, H - 60, bw - 4, 52);
        ctx.fillStyle = TD2.color; ctx.font = "bold 13px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(names[k] + " 🪙" + TD2.cost, k * bw + bw / 2, H - 32);
      }
      if (wstate === "build") GF.label(ctx, "build phase — tap the field to place " + sel, W / 2, H - 76, 13, "#9fc2ff");
    }
  };
}});

/* Pong Legends — vs the Chess Coach AI. First to 7. */
GameStore.register("pong-legends", { boot: function (api) {
  var W = api.W, H = api.H;
  var me, ai, ball, ms, as, diff;
  function serve(dir) { ball = { x: W / 2, y: H / 2, vx: 4.2 * dir, vy: (Math.random() - 0.5) * 5 }; }
  function reset() {
    me = { y: H / 2 - 40, s: 0 }; ai = { y: H / 2 - 40, s: 0 };
    diff = 3.4; serve(Math.random() < 0.5 ? 1 : -1); api.score(0);
  }
  reset();
  return {
    update: function (dt) {
      var ax = api.input.axis();
      me.y = api.clamp(me.y + ax.y * 6, 0, H - 80);
      var tap = api.input.consumeTap();
      if (tap) me.y = api.clamp(tap.y - 40, 0, H - 80);
      // AI tracks with error that shrinks as it "learns"
      var err = Math.sin(api.state.ticks / 90) * 26 * Math.max(0.25, 1 - (me.s + ai.s) * 0.06);
      var target = ball.y - 40 + err;
      ai.y += api.clamp(target - ai.y, -diff, diff);
      ball.x += ball.vx; ball.y += ball.vy;
      if (ball.y < 6 || ball.y > H - 6) { ball.vy *= -1; api.sfx.beep(300, 0.04); }
      function hit(p, px) {
        if (ball.vx < 0 === (px < W / 2) && Math.abs(ball.x - px) < 14 && ball.y > p.y - 6 && ball.y < p.y + 86) {
          var rel = (ball.y - (p.y + 40)) / 40;
          ball.vx = -ball.vx * 1.06; ball.vy = rel * 5.2;
          ball.x = px + (px < W / 2 ? 14 : -14);
          api.sfx.beep(520, 0.05);
          return true;
        }
        return false;
      }
      hit(me, 26); hit(ai, W - 26);
      if (ball.x < -10) { ai.s++; api.sfx.beep(180, 0.15); diff = Math.min(6.4, diff + 0.25); serve(1); }
      if (ball.x > W + 10) { me.s++; api.addScore(100); api.sfx.beep(700, 0.1); diff = Math.min(6.4, diff + 0.25); serve(-1); }
      if (me.s >= 7) return api.win("You beat the Chess Coach 7-" + ai.s + "! Legend status.");
      if (ai.s >= 7) return api.gameOver("The Chess Coach takes it 7-" + me.s + ". Rematch?");
    },
    draw: function () {
      var ctx = api.ctx;
      ctx.fillStyle = "#061206"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 4; ctx.setLineDash([12, 12]);
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "#00f0ff"; ctx.fillRect(20, me.y, 12, 80);
      ctx.fillStyle = "#ff4d88"; ctx.fillRect(W - 32, ai.y, 12, 80);
      ctx.fillStyle = "#ffe14d"; ctx.beginPath(); ctx.arc(ball.x, ball.y, 8, 0, 7); ctx.fill();
      GF.label(ctx, me.s + "  :  " + ai.s, W / 2, 52, 34, "#fff");
      GF.label(ctx, "YOU", 70, 30, 13, "#00f0ff");
      GF.label(ctx, "CHESS COACH AI", W - 90, 30, 13, "#ff4d88");
      GF.label(ctx, "first to 7 · the coach adapts to your angles", W / 2, H - 16, 12, "#9aa4b2");
    }
  };
}});

/* Sky Hopper — one-button flappy through neon gates. */
GameStore.register("sky-hopper", { boot: function (api) {
  var W = api.W, H = api.H;
  var bird, gates, t, started, best;
  best = 0;
  function reset() {
    bird = { x: W * 0.32, y: H / 2, vy: 0 };
    gates = []; t = 0; started = false; api.score(0);
  }
  function addGate(x) {
    var gapY = 120 + Math.random() * (H - 320), gap = 150;
    gates.push({ x: x, gapY: gapY, gap: gap, passed: false });
  }
  reset();
  addGate(W + 40); addGate(W + 260); addGate(W + 480);
  return {
    update: function (dt) {
      var flap = api.input.pressed("Space") || api.input.consumeTap();
      api.input.keys.Space = false;
      if (!started) { if (flap) { started = true; bird.vy = -6.4; api.sfx.beep(660, 0.07); } return; }
      if (flap) { bird.vy = -6.4; api.sfx.beep(660, 0.06); }
      bird.vy = Math.min(10, bird.vy + 0.42);
      bird.y += bird.vy;
      t += dt;
      var i;
      for (i = gates.length - 1; i >= 0; i--) {
        var g = gates[i];
        g.x -= 3.1;
        if (!g.passed && g.x + 34 < bird.x) {
          g.passed = true; api.addScore(10);
          var perfect = Math.abs(bird.y - g.gapY) < 30;
          if (perfect) { api.addScore(10); api.sfx.tune([[880, .06], [1174, .08]]); }
          else api.sfx.beep(880, 0.06);
        }
        if (g.x < -60) gates.splice(i, 1);
        if (bird.x + 14 > g.x && bird.x - 14 < g.x + 34 && (bird.y - 12 < g.gapY - g.gap / 2 || bird.y + 12 > g.gapY + g.gap / 2))
          return api.gameOver("Clipped a gate! Score " + api.state.score + ".");
      }
      if (gates.length < 4) addGate(W + 40);
      if (bird.y > H - 8 || bird.y < -20) return api.gameOver("Sky Hopper down! Score " + api.state.score + ".");
      best = Math.max(best, api.state.score);
    },
    draw: function () {
      var ctx = api.ctx;
      var grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, "#1b1040"); grd.addColorStop(1, "#0b1e3a");
      ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#ffe14d";
      for (var i = 0; i < 30; i++) { var sx = (i * 97 + t * 20) % W; ctx.fillRect(sx, (i * 53) % H, 2, 2); }
      var k;
      for (k = 0; k < gates.length; k++) {
        var g = gates[k];
        ctx.fillStyle = "#00f0ff";
        ctx.fillRect(g.x, 0, 34, g.gapY - g.gap / 2);
        ctx.fillRect(g.x, g.gapY + g.gap / 2, 34, H);
        ctx.fillStyle = "#028a99";
        ctx.fillRect(g.x - 4, g.gapY - g.gap / 2 - 8, 42, 12);
        ctx.fillRect(g.x - 4, g.gapY + g.gap / 2 - 4, 42, 12);
      }
      ctx.save(); ctx.translate(bird.x, bird.y); ctx.rotate(api.clamp(bird.vy / 14, -0.5, 0.9));
      ctx.fillStyle = "#ffb300";
      ctx.beginPath(); ctx.ellipse(0, 0, 18, 13, 0, 0, 7); ctx.fill();
      ctx.fillStyle = "#ff8f00";
      ctx.beginPath(); ctx.moveTo(-8, -4); ctx.lineTo(-22, -14 + Math.sin(t * 30) * 6); ctx.lineTo(-8, 2); ctx.fill();
      ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(8, -4, 3, 0, 7); ctx.fill();
      ctx.fillStyle = "#ff4d00";
      ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-26, -5); ctx.lineTo(-26, 5); ctx.fill();
      ctx.restore();
      GF.label(ctx, "" + api.state.score, W / 2, 70, 44, "#fff");
      GF.label(ctx, "BEST " + best, W / 2, 100, 14, "#9aa4b2");
      if (!started) GF.label(ctx, "tap / SPACE to flap", W / 2, H / 2 - 60, 17, "#fff");
    }
  };
}});
