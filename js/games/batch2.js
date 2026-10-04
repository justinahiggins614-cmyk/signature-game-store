/* Pixel Hopper — platformer: run, jump, coins, flag. */
GameStore.register("pixel-hopper", { boot: function (api) {
  var W = api.W, H = api.H, G = 0.5;
  var plats, coins, grumps, flag, me;
  function reset() {
    plats = [
      { x: 0, y: H - 30, w: W, h: 30 },
      { x: 60, y: H - 130, w: 110, h: 18 }, { x: 230, y: H - 200, w: 110, h: 18 },
      { x: 60, y: H - 290, w: 110, h: 18 }, { x: 250, y: H - 360, w: 110, h: 18 },
      { x: 90, y: H - 450, w: 130, h: 18 }
    ];
    coins = []; grumps = [];
    var spots = [[100, H - 165], [270, H - 235], [100, H - 325], [290, H - 395], [140, H - 485]];
    for (var i = 0; i < spots.length; i++) coins.push({ x: spots[i][0], y: spots[i][1], got: false });
    grumps.push({ x: 250, y: H - 218, w: 26, h: 26, vx: 1.2, min: 230, max: 340 });
    grumps.push({ x: 90, y: H - 308, w: 26, h: 26, vx: -1.4, min: 60, max: 170 });
    flag = { x: 190, y: H - 500, w: 20, h: 50 };
    me = { x: 40, y: H - 80, w: 24, h: 30, vx: 0, vy: 0, ground: false };
    api.score(0);
  }
  reset();
  return {
    update: function (dt) {
      var ax = api.input.axis();
      me.vx = ax.x * 3.4;
      if ((ax.y === -1 || api.input.pressed("Space")) && me.ground) { me.vy = -11; me.ground = false; api.sfx.beep(520, 0.07); }
      me.vy = Math.min(12, me.vy + G);
      me.x = api.clamp(me.x + me.vx, 0, W - me.w);
      me.y += me.vy; me.ground = false;
      for (var i = 0; i < plats.length; i++) {
        var p = plats[i];
        if (me.x + me.w > p.x && me.x < p.x + p.w && me.y + me.h > p.y && me.y + me.h < p.y + p.h + 14 && me.vy >= 0) {
          me.y = p.y - me.h; me.vy = 0; me.ground = true;
        }
      }
      if (me.y > H) return api.gameOver("You fell! Try again.");
      for (i = 0; i < coins.length; i++) {
        var c = coins[i];
        if (!c.got && Math.abs(me.x + 12 - c.x) < 22 && Math.abs(me.y + 15 - c.y) < 26) {
          c.got = true; api.addScore(50); api.sfx.beep(900, 0.07);
        }
      }
      for (i = 0; i < grumps.length; i++) {
        var g = grumps[i];
        g.x += g.vx; if (g.x < g.min || g.x > g.max) g.vx *= -1;
        if (me.x < g.x + g.w && me.x + me.w > g.x && me.y < g.y + g.h && me.y + me.h > g.y) {
          if (me.vy > 2 && me.y + me.h - g.y < 16) { grumps.splice(i, 1); api.addScore(100); api.sfx.beep(300, 0.1); me.vy = -8; i--; }
          else return api.gameOver("A grumbler got you!");
        }
      }
      if (me.x + me.w > flag.x && me.x < flag.x + flag.w && me.y + me.h > flag.y)
        return api.win("You reached the flag with " + api.state.score + " points!");
    },
    draw: function () {
      var ctx = api.ctx;
      var grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, "#0b1026"); grd.addColorStop(1, "#1b2a6b");
      ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#2a3a5f";
      for (var i = 0; i < plats.length; i++) { var p = plats[i]; ctx.fillRect(p.x, p.y, p.w, p.h); }
      ctx.fillStyle = "#00f0ff";
      for (i = 0; i < plats.length; i++) { p = plats[i]; ctx.fillRect(p.x, p.y, p.w, 5); }
      ctx.fillStyle = "#ffe14d";
      for (i = 0; i < coins.length; i++) { var c = coins[i]; if (!c.got) { ctx.beginPath(); ctx.arc(c.x, c.y, 9, 0, 7); ctx.fill(); } }
      ctx.fillStyle = "#ff4d6b";
      for (i = 0; i < grumps.length; i++) { var g = grumps[i]; ctx.fillRect(g.x, g.y, g.w, g.h); ctx.fillStyle = "#fff"; ctx.fillRect(g.x + 5, g.y + 6, 5, 5); ctx.fillRect(g.x + 16, g.y + 6, 5, 5); ctx.fillStyle = "#ff4d6b"; }
      ctx.fillStyle = "#8a6f4d"; ctx.fillRect(flag.x, flag.y, 6, flag.h);
      ctx.fillStyle = "#4dff88";
      ctx.beginPath(); ctx.moveTo(flag.x + 6, flag.y); ctx.lineTo(flag.x + 40, flag.y + 10); ctx.lineTo(flag.x + 6, flag.y + 20); ctx.fill();
      ctx.fillStyle = "#ffb300"; ctx.fillRect(me.x, me.y, me.w, me.h);
      ctx.fillStyle = "#111"; ctx.fillRect(me.x + 5, me.y + 7, 5, 5); ctx.fillRect(me.x + 14, me.y + 7, 5, 5);
      GF.label(ctx, "SCORE " + api.state.score, W / 2, 22, 14, "#fff");
    }
  };
}});

/* Gem Matcher — match-3 swap puzzler, 90s timer. */
GameStore.register("gem-matcher", { boot: function (api) {
  var W = api.W, H = api.H, N = 8, SZ = 44, ox = (W - N * SZ) / 2, oy = 110;
  var grid, sel, timeLeft, combo;
  var COLORS = ["#ff4d88", "#00f0ff", "#ffe14d", "#4dff88", "#c44dff"];
  function gem() { return { c: api.ri(0, 4), pop: 0 }; }
  function reset() {
    grid = []; for (var r = 0; r < N; r++) { grid.push([]); for (var c = 0; c < N; c++) grid[r].push(gem()); }
    // avoid starting matches
    var m; do { m = findMatches(); if (m.length) refill(true); } while (m.length);
    sel = null; timeLeft = 90; combo = 0; api.score(0);
  }
  function findMatches() {
    var out = [], r, c;
    for (r = 0; r < N; r++) for (c = 0; c < N - 2; c++)
      if (grid[r][c].c === grid[r][c + 1].c && grid[r][c].c === grid[r][c + 2].c) {
        var k = c + 2; while (k + 1 < N && grid[r][k + 1].c === grid[r][c].c) k++;
        for (var q = c; q <= k; q++) out.push([r, q]); c = k;
      }
    for (c = 0; c < N; c++) for (r = 0; r < N - 2; r++)
      if (grid[r][c].c === grid[r + 1][c].c && grid[r][c].c === grid[r + 2][c].c) {
        var k2 = r + 2; while (k2 + 1 < N && grid[k2 + 1][c].c === grid[r][c].c) k2++;
        for (var q2 = r; q2 <= k2; q2++) { var dup = false; for (var d = 0; d < out.length; d++) if (out[d][0] === q2 && out[d][1] === c) dup = true; if (!dup) out.push([q2, c]); }
        r = k2;
      }
    return out;
  }
  function refill(silent) {
    var m = findMatches();
    if (!m.length) return false;
    combo++;
    for (var i = 0; i < m.length; i++) grid[m[i][0]][m[i][1]] = gem();
    // gravity: compact columns
    for (var c = 0; c < N; c++) {
      var col = [];
      for (var r = N - 1; r >= 0; r--) col.push(grid[r][c]);
      // already compact since we replaced in place; just re-drop empties: none needed
    }
    if (!silent) { api.addScore(m.length * 10 * combo); api.sfx.beep(500 + combo * 90, 0.09); }
    // cascade
    var again = 0;
    while (findMatches().length && again < 6) { again++; var m2 = findMatches(); combo++; for (i = 0; i < m2.length; i++) grid[m2[i][0]][m2[i][1]] = gem(); if (!silent) api.addScore(m2.length * 10 * combo); }
    return true;
  }
  function cellAt(x, y) {
    var c = Math.floor((x - ox) / SZ), r = Math.floor((y - oy) / SZ);
    return (r >= 0 && r < N && c >= 0 && c < N) ? { r: r, c: c } : null;
  }
  reset();
  return {
    update: function (dt) {
      timeLeft -= dt;
      if (timeLeft <= 0) return api.gameOver("Time! Final score " + api.state.score);
      var tap = api.input.consumeTap();
      if (tap) {
        var cl = cellAt(tap.x, tap.y);
        if (cl) {
          if (!sel) sel = cl;
          else {
            var dr = Math.abs(sel.r - cl.r), dc = Math.abs(sel.c - cl.c);
            if (dr + dc === 1) {
              var t = grid[sel.r][sel.c]; grid[sel.r][sel.c] = grid[cl.r][cl.c]; grid[cl.r][cl.c] = t;
              combo = 0;
              if (!refill(false)) { // no match: swap back
                t = grid[sel.r][sel.c]; grid[sel.r][sel.c] = grid[cl.r][cl.c]; grid[cl.r][cl.c] = t;
                api.sfx.beep(180, 0.08);
              }
            }
            sel = null;
          }
        } else sel = null;
      }
    },
    draw: function () {
      var ctx = api.ctx;
      ctx.fillStyle = "#120b26"; ctx.fillRect(0, 0, W, H);
      GF.label(ctx, "GEM MATCHER", W / 2, 34, 20, "#ff4dff");
      GF.label(ctx, "SCORE " + api.state.score + "   ⏱ " + Math.ceil(timeLeft) + "s" + (combo > 1 ? "   🔥x" + combo : ""), W / 2, 62, 15, "#eaf2ff");
      for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
        var x = ox + c * SZ, y = oy + r * SZ;
        ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fillRect(x + 1, y + 1, SZ - 2, SZ - 2);
        var g = grid[r][c];
        ctx.fillStyle = COLORS[g.c];
        ctx.beginPath();
        var gx = x + SZ / 2, gy = y + SZ / 2, s2 = SZ / 2 - 7;
        ctx.moveTo(gx, gy - s2); ctx.lineTo(gx + s2 * 0.9, gy); ctx.lineTo(gx, gy + s2); ctx.lineTo(gx - s2 * 0.9, gy);
        ctx.closePath(); ctx.fill();
        if (sel && sel.r === r && sel.c === c) { ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.strokeRect(x + 2, y + 2, SZ - 4, SZ - 4); }
      }
      GF.label(ctx, "tap two touching gems to swap", W / 2, oy + N * SZ + 34, 14, "#9aa4b2");
    }
  };
}});

/* Starship Odyssey — story explorer in the style of classic space operas. */
GameStore.register("starship-odyssey", { boot: function (api) {
  var W = api.W, H = api.H;
  var SECTORS = [
    { name: "Nebula Verge", hue: "#7b2ff7", text: "Ion storms crackle. A derelict freighter drifts — scan it?" },
    { name: "Robot Foundry", hue: "#00f0ff", text: "A world of machine cities. The foundry minds offer you a spare warp coil." },
    { name: "Candy Nebula", hue: "#ff6b9d", text: "Sweet gas clouds, harmless and beautiful. Your crew's morale soars." },
    { name: "Noir Station", hue: "#9aa4b2", text: "A smoky dock where informants trade star charts for stories." },
    { name: "Ember Belt", hue: "#ff6b4d", text: "Volcanic asteroids. Rich ore — but the belt bites back." },
    { name: "Quiet Expanse", hue: "#4dff88", text: "Deep calm. Long-range scans pick up a signal: home." }
  ];
  var ship, pulses, motes, sector, fuel, artifacts, log, mode;
  function reset() {
    ship = { x: W / 2, y: H / 2, vx: 0, vy: 0 };
    pulses = []; motes = [];
    for (var i = 0; i < 40; i++) motes.push({ x: Math.random() * W, y: Math.random() * H, s: Math.random() * 2 + 0.5 });
    sector = 0; fuel = 100; artifacts = 0; mode = "fly";
    log = ["Captain's log: the Odyssey leaves dock. Six sectors ahead."];
    api.score(0);
  }
  function say(t) { log.push(t); if (log.length > 4) log.shift(); }
  reset();
  return {
    update: function (dt) {
      var ax = api.input.axis();
      if (mode === "fly") {
        ship.vx = api.clamp(ship.vx + ax.x * 14 * dt, -3.4, 3.4);
        ship.vy = api.clamp(ship.vy + ax.y * 14 * dt, -3.4, 3.4);
        ship.vx *= 0.985; ship.vy *= 0.985;
        ship.x = api.clamp(ship.x + ship.vx, 20, W - 20);
        ship.y = api.clamp(ship.y + ship.vy, 90, H - 20);
        fuel = Math.max(0, fuel - dt * 0.55);
        if (fuel <= 0) return api.gameOver("Out of fuel, adrift among the stars...");
        if (api.input.pressed("Space") || api.input.consumeTap()) {
          pulses.push({ x: ship.x, y: ship.y, r: 6 });
          api.sfx.beep(740, 0.1);
          var s = SECTORS[sector];
          if (sector === 0) { say("Scan: derelict freighter holds an artifact! (+1)"); artifacts++; api.addScore(150); }
          else if (sector === 1) { say("Foundry minds gift a warp coil. Fuel restored!"); fuel = 100; api.addScore(100); }
          else if (sector === 3) { say("Informant's chart reveals a shortcut. (+200)"); api.addScore(200); }
          else if (sector === 4) { say("Ore secured! (+250) but the belt scorches the hull."); api.addScore(250); fuel = Math.max(0, fuel - 12); }
          else { say("Scan complete: " + s.text); api.addScore(50); }
          api.input.keys.Space = false;
        }
        if (api.input.pressed("e") || api.input.pressed("E")) {
          api.input.keys.e = false; api.input.keys.E = false;
          if (sector < SECTORS.length - 1) {
            sector++; fuel = Math.min(100, fuel + 25);
            say("Warp! Entering " + SECTORS[sector].name + ".");
            say(SECTORS[sector].text);
            api.sfx.tune([[392, .1], [523, .12], [659, .16]]);
            api.addScore(100);
          } else {
            api.score(api.state.score + artifacts * 100 + Math.round(fuel));
            return api.win("The Odyssey comes home. " + artifacts + " artifacts, " + Math.round(fuel) + "% fuel to spare. A voyage for the ages!");
          }
        }
      }
      for (var i = pulses.length - 1; i >= 0; i--) { pulses[i].r += 5; if (pulses[i].r > 130) pulses.splice(i, 1); }
      for (i = 0; i < motes.length; i++) { motes[i].y += motes[i].s * 0.5; if (motes[i].y > H) motes[i].y = 90; }
    },
    draw: function () {
      var ctx = api.ctx, s = SECTORS[sector];
      ctx.fillStyle = "#05060f"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = s.hue; ctx.globalAlpha = 0.14;
      ctx.beginPath(); ctx.arc(W - 60, 160, 90, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#fff";
      for (var i =  0; i < motes.length; i++) ctx.fillRect(motes[i].x, motes[i].y, motes[i].s, motes[i].s);
      ctx.strokeStyle = s.hue; ctx.lineWidth = 2;
      for (i = 0; i < pulses.length; i++) { ctx.globalAlpha = 1 - pulses[i].r / 130; ctx.beginPath(); ctx.arc(pulses[i].x, pulses[i].y, pulses[i].r, 0, 7); ctx.stroke(); }
      ctx.globalAlpha = 1;
      // ship
      ctx.fillStyle = "#eaf2ff";
      ctx.beginPath(); ctx.moveTo(ship.x, ship.y - 18); ctx.lineTo(ship.x - 13, ship.y + 12); ctx.lineTo(ship.x, ship.y + 5); ctx.lineTo(ship.x + 13, ship.y + 12); ctx.fill();
      ctx.fillStyle = s.hue; ctx.fillRect(ship.x - 3, ship.y - 6, 6, 10);
      // HUD
      ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(0, 0, W, 84);
      GF.label(ctx, "✦ " + s.name.toUpperCase() + " ✦  (" + (sector + 1) + "/6)", W / 2, 24, 15, s.hue, "center");
      GF.label(ctx, "FUEL " + Math.round(fuel) + "%   ARTIFACTS " + artifacts + "   SCORE " + api.state.score, W / 2, 48, 13, "#eaf2ff");
      GF.label(ctx, "SPACE scan · E warp to next sector", W / 2, 70, 12, "#9aa4b2");
      // log
      ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(0, H - 108, W, 108);
      ctx.fillStyle = "#9fd8ff"; ctx.font = "12px sans-serif"; ctx.textAlign = "left";
      for (i = 0; i < log.length; i++) ctx.fillText("» " + log[i].slice(0, 64), 12, H - 88 + i * 20);
    }
  };
}});

/* Shadow Strike Ops — modern combat-style top-down shooter, 8 waves. */
GameStore.register("shadow-strike", { boot: function (api) {
  var W = api.W, H = api.H;
  var me, bullets, foes, nades, strikes, wave, wtime, cd, gcd;
  function reset() {
    me = { x: W / 2, y: H / 2, hp: 100 };
    bullets = []; foes = []; nades = []; strikes = [];
    wave = 0; wtime = 0; cd = 0; gcd = 0; api.score(0);
    nextWave();
  }
  function nextWave() {
    wave++; wtime = 0;
    var n = 3 + wave * 2;
    for (var i = 0; i < n; i++) {
      var a = Math.random() * 6.283;
      foes.push({ x: W / 2 + Math.cos(a) * (W / 2 + 40), y: H / 2 + Math.sin(a) * (H / 2 + 40), hp: 2 + Math.floor(wave / 3), sp: 0.7 + wave * 0.09 + Math.random() * 0.5 });
    }
  }
  reset();
  return {
    update: function (dt) {
      wtime += dt;
      var ax = api.input.axis();
      me.x = api.clamp(me.x + ax.x * 3.6, 14, W - 14);
      me.y = api.clamp(me.y + ax.y * 3.6, 14, H - 14);
      cd -= dt; gcd -= dt;
      var tap = api.input.consumeTap();
      var ang = Math.atan2((tap ? tap.y : H / 2 - 60) - me.y, (tap ? tap.x : me.x + 60) - me.x);
      if ((tap || api.input.pressed("Space")) && cd <= 0) {
        bullets.push({ x: me.x, y: me.y, vx: Math.cos(ang) * 9, vy: Math.sin(ang) * 9 });
        cd = 0.18; api.sfx.beep(220, 0.06, "sawtooth");
      }
      if (api.input.pressed("g") && gcd <= 0) {
        nades.push({ x: me.x, y: me.y, vx: Math.cos(ang) * 5, vy: Math.sin(ang) * 5, t: 0.8 });
        gcd = 1.2; api.sfx.beep(150, 0.15);
      }
      if (api.input.pressed("q") && gcd <= 0) {
        strikes.push({ x: me.x + Math.cos(ang) * 120, y: me.y + Math.sin(ang) * 120, t: 0.6 });
        gcd = 3; api.sfx.tune([[880, .08], [440, .12]]);
      }
      api.input.keys.Space = false;
      var i, j;
      for (i = bullets.length - 1; i >= 0; i--) {
        var b = bullets[i]; b.x += b.vx; b.y += b.vy;
        if (b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) { bullets.splice(i, 1); continue; }
        for (j = foes.length - 1; j >= 0; j--) {
          var f = foes[j];
          if (Math.abs(b.x - f.x) < 13 && Math.abs(b.y - f.y) < 13) {
            bullets.splice(i, 1); f.hp--;
            if (f.hp <= 0) { foes.splice(j, 1); api.addScore(40); }
            break;
          }
        }
      }
      for (i = nades.length - 1; i >= 0; i--) {
        var nd = nades[i]; nd.t -= dt; nd.x += nd.vx; nd.y += nd.vy;
        if (nd.t <= 0) {
          for (j = foes.length - 1; j >= 0; j--) {
            var f2 = foes[j];
            if (Math.hypot(f2.x - nd.x, f2.y - nd.y) < 70) { foes.splice(j, 1); api.addScore(40); }
          }
          nades.splice(i, 1); api.sfx.beep(90, 0.3, "sawtooth");
        }
      }
      for (i = strikes.length - 1; i >= 0; i--) {
        var st = strikes[i]; st.t -= dt;
        if (st.t <= 0) {
          for (j = foes.length - 1; j >= 0; j--) {
            var f3 = foes[j];
            if (Math.hypot(f3.x - st.x, f3.y - st.y) < 110) { foes.splice(j, 1); api.addScore(40); }
          }
          strikes.splice(i, 1);
        }
      }
      for (i = foes.length - 1; i >= 0; i--) {
        var e = foes[i];
        var dx = me.x - e.x, dy = me.y - e.y, d = Math.hypot(dx, dy) || 1;
        e.x += dx / d * e.sp; e.y += dy / d * e.sp;
        if (d < 20) { me.hp -= 25 * dt * 2; api.sfx.beep(140, 0.06); if (me.hp <= 0) return api.gameOver("KIA on wave " + wave + ". The squad remembers."); }
      }
      if (foes.length === 0) {
        if (wave >= 8) return api.win("All 8 waves cleared. Outstanding, operator!");
        me.hp = Math.min(100, me.hp + 25);
        api.addScore(150); nextWave(); api.sfx.tune([[523, .1], [659, .1], [784, .16]]);
      }
    },
    draw: function () {
      var ctx = api.ctx;
      ctx.fillStyle = "#0a0f0a"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(120,255,150,0.12)"; ctx.lineWidth = 1;
      for (var g = 0; g < W; g += 40) { ctx.beginPath(); ctx.moveTo(g, 0); ctx.lineTo(g, H); ctx.stroke(); }
      for (g = 0; g < H; g += 40) { ctx.beginPath(); ctx.moveTo(0, g); ctx.lineTo(W, g); ctx.stroke(); }
      var i;
      ctx.fillStyle = "#ff4d4d";
      for (i = 0; i < foes.length; i++) { var f = foes[i]; ctx.beginPath(); ctx.arc(f.x, f.y, 11, 0, 7); ctx.fill(); ctx.fillStyle = "#7a0000"; ctx.beginPath(); ctx.arc(f.x, f.y, 5, 0, 7); ctx.fill(); ctx.fillStyle = "#ff4d4d"; }
      ctx.fillStyle = "#ffe14d";
      for (i = 0; i < bullets.length; i++) { ctx.beginPath(); ctx.arc(bullets[i].x, bullets[i].y, 3, 0, 7); ctx.fill(); }
      ctx.fillStyle = "#4dff88";
      for (i = 0; i < nades.length; i++) { ctx.beginPath(); ctx.arc(nades[i].x, nades[i].y, 5, 0, 7); ctx.fill(); }
      ctx.strokeStyle = "#ff9f4d"; ctx.lineWidth = 2;
      for (i = 0; i < strikes.length; i++) { ctx.beginPath(); ctx.arc(strikes[i].x, strikes[i].y, 110 * (1 - strikes[i].t), 0, 7); ctx.stroke(); }
      // operator
      ctx.fillStyle = "#2f6f4f";
      ctx.beginPath(); ctx.arc(me.x, me.y, 12, 0, 7); ctx.fill();
      ctx.fillStyle = "#9fd8ff"; ctx.beginPath(); ctx.arc(me.x, me.y, 5, 0, 7); ctx.fill();
      // hp bar
      ctx.fillStyle = "#333"; ctx.fillRect(12, 12, 120, 12);
      ctx.fillStyle = me.hp > 40 ? "#4dff88" : "#ff4d4d"; ctx.fillRect(12, 12, 120 * me.hp / 100, 12);
      GF.label(ctx, "WAVE " + wave + "/8   SCORE " + api.state.score, W / 2, 22, 14, "#eaf2ff");
      GF.label(ctx, "click/tap to fire · G grenade · Q airstrike", W / 2, H - 12, 12, "#9aa4b2");
    }
  };
}});
