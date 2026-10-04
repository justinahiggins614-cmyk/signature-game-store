/* Neon Serpent — snake-style arcade. Eat orbs, grow, don't bite yourself. */
GameStore.register("neon-serpent", { boot: function (api) {
  var W = api.W, H = api.H, cell = 20;
  var cols = Math.floor(W / cell), rows = Math.floor(H / cell);
  var snake, dir, ndir, orb, speed, acc, alive;
  function reset() {
    snake = [{ x: 7, y: 10 }, { x: 6, y: 10 }, { x: 5, y: 10 }];
    dir = { x: 1, y: 0 }; ndir = dir; speed = 7; acc = 0;
    api.score(0); placeOrb();
  }
  function placeOrb() {
    orb = { x: api.ri(0, cols - 1), y: api.ri(0, rows - 1) };
  }
  reset();
  return {
    update: function (dt) {
      var ax = api.input.axis();
      var sw = api.input.consumeSwipe();
      if (sw === "up") ndir = { x: 0, y: -1 };
      else if (sw === "down") ndir = { x: 0, y: 1 };
      else if (sw === "left") ndir = { x: -1, y: 0 };
      else if (sw === "right") ndir = { x: 1, y: 0 };
      else if (ax.x === 1 && dir.x !== -1) ndir = { x: 1, y: 0 };
      else if (ax.x === -1 && dir.x !== 1) ndir = { x: -1, y: 0 };
      else if (ax.y === -1 && dir.y !== 1) ndir = { x: 0, y: -1 };
      else if (ax.y === 1 && dir.y !== -1) ndir = { x: 0, y: 1 };
      acc += dt;
      if (acc < 1 / speed) return;
      acc = 0; dir = ndir;
      var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows) return api.gameOver("The serpent hit the wall!");
      for (var i = 0; i < snake.length; i++)
        if (snake[i].x === head.x && snake[i].y === head.y) return api.gameOver("The serpent bit itself!");
      snake.unshift(head);
      if (head.x === orb.x && head.y === orb.y) {
        api.addScore(10); api.sfx.beep(660, 0.08);
        if (api.state.score % 50 === 0) speed = Math.min(16, speed + 1);
        placeOrb();
      } else snake.pop();
    },
    draw: function () {
      var ctx = api.ctx;
      ctx.fillStyle = "#060a18"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#00f0ff";
      for (var i = 0; i < snake.length; i++) {
        ctx.globalAlpha = 1 - i / (snake.length + 6);
        ctx.fillRect(snake[i].x * cell + 1, snake[i].y * cell + 1, cell - 2, cell - 2);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#ffb300";
      ctx.beginPath(); ctx.arc(orb.x * cell + cell / 2, orb.y * cell + cell / 2, cell / 2 - 2, 0, 7); ctx.fill();
      GF.label(ctx, "SCORE " + api.state.score, W / 2, 22, 15, "#eaf2ff");
    }
  };
}});

/* Brick Breaker Blitz — paddle, ball, bricks, power-ups. */
GameStore.register("brick-breaker", { boot: function (api) {
  var W = api.W, H = api.H;
  var paddle, ball, bricks, lives, level;
  function buildBricks() {
    bricks = [];
    var rows = 5, colsL = 8, bw = W / colsL;
    for (var r = 0; r < rows; r++) for (var c = 0; c < colsL; c++)
      bricks.push({ x: c * bw + 2, y: 50 + r * 24, w: bw - 4, h: 20, hp: r === 0 ? 2 : 1, pu: Math.random() < 0.12 });
  }
  function reset() {
    paddle = { x: W / 2 - 45, w: 90, y: H - 40 };
    ball = { x: W / 2, y: H - 60, vx: 3, vy: -4, r: 7, stuck: true };
    lives = 3; level = 1; api.score(0); buildBricks();
  }
  reset();
  function launch() {
    if (ball.stuck) { ball.stuck = false; api.sfx.beep(440, 0.08); }
  }
  return {
    update: function (dt) {
      var ax = api.input.axis();
      paddle.x += ax.x * 7;
      var tap = api.input.consumeTap();
      if (tap) { paddle.x = tap.x - paddle.w / 2; launch(); }
      if (api.input.pressed("Space")) launch();
      paddle.x = api.clamp(paddle.x, 0, W - paddle.w);
      if (ball.stuck) { ball.x = paddle.x + paddle.w / 2; ball.y = paddle.y - 12; return; }
      ball.x += ball.vx; ball.y += ball.vy;
      if (ball.x < ball.r || ball.x > W - ball.r) { ball.vx *= -1; api.sfx.beep(300, 0.05); }
      if (ball.y < ball.r) { ball.vy *= -1; api.sfx.beep(300, 0.05); }
      if (ball.y > H) {
        lives--;
        if (lives <= 0) return api.gameOver("Out of balls!");
        ball = { x: paddle.x + paddle.w / 2, y: paddle.y - 12, vx: 3, vy: -4, r: 7, stuck: true };
        return;
      }
      if (ball.vy > 0 && ball.y + ball.r >= paddle.y && ball.y < paddle.y + 12 &&
          ball.x > paddle.x && ball.x < paddle.x + paddle.w) {
        var rel = (ball.x - paddle.x) / paddle.w - 0.5;
        ball.vx = rel * 8; ball.vy = -Math.abs(ball.vy); api.sfx.beep(500, 0.06);
      }
      for (var i = bricks.length - 1; i >= 0; i--) {
        var b = bricks[i];
        if (ball.x > b.x - ball.r && ball.x < b.x + b.w + ball.r && ball.y > b.y - ball.r && ball.y < b.y + b.h + ball.r) {
          b.hp--; ball.vy *= -1; api.sfx.beep(700, 0.05);
          if (b.hp <= 0) {
            bricks.splice(i, 1); api.addScore(25);
            if (b.pu) { paddle.w = Math.min(150, paddle.w + 20); api.addScore(10); }
          }
          break;
        }
      }
      if (bricks.length === 0) { level++; api.addScore(100); buildBricks(); ball.stuck = true; }
    },
    draw: function () {
      var ctx = api.ctx;
      ctx.fillStyle = "#0a0a1a"; ctx.fillRect(0, 0, W, H);
      var cols = ["#ff4d88", "#ffb300", "#00f0ff", "#4dff88", "#c44dff"];
      for (var i = 0; i < bricks.length; i++) {
        var b = bricks[i];
        ctx.fillStyle = cols[Math.floor((b.y - 50) / 24) % cols.length];
        ctx.globalAlpha = b.hp === 2 ? 1 : 0.75;
        ctx.fillRect(b.x, b.y, b.w, b.h);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#eaf2ff";
      ctx.fillRect(paddle.x, paddle.y, paddle.w, 12);
      ctx.fillStyle = "#ffb300";
      ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, 7); ctx.fill();
      GF.label(ctx, "SCORE " + api.state.score + "   LIVES " + lives + "   LV " + level, W / 2, 22, 14, "#eaf2ff");
      if (ball.stuck) GF.label(ctx, "tap / SPACE to launch", W / 2, H / 2, 16, "#9fc2ff");
    }
  };
}});

/* Star Vanguard — vertical space shooter with waves + boss. */
GameStore.register("star-vanguard", { boot: function (api) {
  var W = api.W, H = api.H;
  var ship, bullets, foes, fbullets, stars, wave, cd;
  function reset() {
    ship = { x: W / 2, y: H - 70, cd: 0 };
    bullets = []; foes = []; fbullets = [];
    stars = []; for (var i = 0; i < 60; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, s: Math.random() * 2 + 0.5 });
    wave = 1; api.score(0); spawnWave();
  }
  function spawnWave() {
    var n = 4 + wave * 2, boss = wave % 5 === 0;
    for (var i = 0; i < n; i++)
      foes.push({ x: 40 + Math.random() * (W - 80), y: -30 - i * 46, hp: boss && i === 0 ? 20 : 1, boss: boss && i === 0, t: 0 });
  }
  reset();
  return {
    update: function (dt) {
      var ax = api.input.axis();
      ship.x = api.clamp(ship.x + ax.x * 5.5, 16, W - 16);
      ship.y = api.clamp(ship.y + ax.y * 5.5, H / 2, H - 24);
      ship.cd -= dt;
      if ((api.input.pressed("Space") || api.input.consumeTap()) && ship.cd <= 0) {
        bullets.push({ x: ship.x, y: ship.y - 16, vy: -9 }); ship.cd = 0.16; api.sfx.beep(880, 0.05);
      }
      var i, j;
      for (i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y += bullets[i].vy;
        if (bullets[i].y < -10) bullets.splice(i, 1);
      }
      for (i = foes.length - 1; i >= 0; i--) {
        var f = foes[i]; f.t += dt;
        f.y += (f.boss ? 0.5 : 1.1) + wave * 0.06;
        f.x += Math.sin(f.t * 2.4) * 1.4;
        if (Math.random() < 0.008 + wave * 0.001) fbullets.push({ x: f.x, y: f.y + 12, vy: 3.4 });
        for (j = bullets.length - 1; j >= 0; j--) {
          var b = bullets[j], r = f.boss ? 26 : 13;
          if (Math.abs(b.x - f.x) < r && Math.abs(b.y - f.y) < r) {
            bullets.splice(j, 1); f.hp--;
            if (f.hp <= 0) { foes.splice(i, 1); api.addScore(f.boss ? 500 : 50); api.sfx.beep(200, 0.12); }
            else api.sfx.beep(600, 0.05);
            break;
          }
        }
        if (f && Math.abs(f.x - ship.x) < 20 && Math.abs(f.y - ship.y) < 20) return api.gameOver("Your ship was destroyed on wave " + wave + "!");
        if (f && f.y > H + 30) foes.splice(foes.indexOf(f), 1);
      }
      for (i = fbullets.length - 1; i >= 0; i--) {
        fbullets[i].y += fbullets[i].vy;
        if (Math.abs(fbullets[i].x - ship.x) < 12 && Math.abs(fbullets[i].y - ship.y) < 12)
          return api.gameOver("Your ship was destroyed on wave " + wave + "!");
        if (fbullets[i].y > H + 10) fbullets.splice(i, 1);
      }
      for (i = 0; i < stars.length; i++) { stars[i].y += stars[i].s * 2; if (stars[i].y > H) stars[i].y = 0; }
      if (foes.length === 0) { wave++; api.addScore(100); spawnWave(); api.sfx.tune([[523, .1], [784, .15]]); }
    },
    draw: function () {
      var ctx = api.ctx;
      ctx.fillStyle = "#040614"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#fff";
      for (var i = 0; i < stars.length; i++) ctx.fillRect(stars[i].x, stars[i].y, stars[i].s, stars[i].s);
      ctx.fillStyle = "#00f0ff";
      ctx.beginPath(); ctx.moveTo(ship.x, ship.y - 16); ctx.lineTo(ship.x - 12, ship.y + 12); ctx.lineTo(ship.x + 12, ship.y + 12); ctx.fill();
      ctx.fillStyle = "#ffe14d";
      for (i = 0; i < bullets.length; i++) ctx.fillRect(bullets[i].x - 2, bullets[i].y - 8, 4, 12);
      for (i = 0; i < foes.length; i++) {
        var f = foes[i];
        ctx.fillStyle = f.boss ? "#ff4d4d" : "#ff6b9d";
        var r = f.boss ? 24 : 12;
        ctx.beginPath(); ctx.moveTo(f.x, f.y + r); ctx.lineTo(f.x - r, f.y - r); ctx.lineTo(f.x + r, f.y - r); ctx.fill();
      }
      ctx.fillStyle = "#ff9f4d";
      for (i = 0; i < fbullets.length; i++) { ctx.beginPath(); ctx.arc(fbullets[i].x, fbullets[i].y, 4, 0, 7); ctx.fill(); }
      GF.label(ctx, "SCORE " + api.state.score + "   WAVE " + wave, W / 2, 22, 14, "#eaf2ff");
    }
  };
}});

/* Turbo Circuit — top-down racer: 3 laps vs 5 rivals. */
GameStore.register("turbo-circuit", { boot: function (api) {
  var W = api.W, H = api.H;
  // simple oval track defined by center + radii; progress = angle
  var cx = W / 2, cy = H / 2, rx = W * 0.36, ry = H * 0.34;
  var rivals = [], me, lap, prog, place, t;
  var RNAMES = ["Zara Zoom", "Blip Blap", "Nova Nine", "Gear Grin", "Dash Duke"];
  function reset() {
    me = { a: 0, speed: 0, lap: 0 };
    rivals = [];
    for (var i = 0; i < 5; i++) rivals.push({ a: -0.06 * (i + 1), speed: 0, name: RNAMES[i], hue: i });
    lap = 0; t = 0; api.score(0);
  }
  function pos(a, off) {
    off = off || 0;
    return { x: cx + Math.cos(a) * (rx + off), y: cy + Math.sin(a) * (ry + off) };
  }
  reset();
  return {
    update: function (dt) {
      t += dt;
      var ax = api.input.axis();
      if (ax.y === -1) me.speed = Math.min(2.6, me.speed + 3.2 * dt);
      else if (ax.y === 1) me.speed = Math.max(0, me.speed - 5 * dt);
      else me.speed = Math.max(0.4, me.speed - 1.2 * dt);
      if (ax.x === -1) me.a -= (0.9 + me.speed * 0.5) * dt;
      if (ax.x === 1) me.a += (0.9 + me.speed * 0.5) * dt;
      // boost pads at fixed angles
      var padHit = [0.8, 2.4, 4.2, 5.6].some(function (p) { return Math.abs(((me.a - p) % 6.283 + 6.283) % 6.283) < 0.08; });
      if (padHit) me.speed = Math.min(3.4, me.speed + 2 * dt);
      me.a += me.speed * dt * 0.55;
      if (me.a >= 6.283) { me.a -= 6.283; me.lap++; api.sfx.beep(700, 0.1); api.addScore(100); }
      for (var i = 0; i < rivals.length; i++) {
        var r = rivals[i];
        r.speed = 1.55 + 0.22 * Math.sin(t * 0.7 + i * 2) + i * 0.02;
        r.a += r.speed * dt * 0.55;
        if (r.a >= 6.283) r.a -= 6.283;
      }
      // place = 1 + rivals ahead (by lap*2pi + a)
      var myTotal = me.lap * 6.283 + me.a, ahead = 0;
      for (i = 0; i < rivals.length; i++) if (rivals[i].a + 0 > myTotal % 6.283 && me.lap === 0) ahead++;
      // simpler: compare total distance; rivals never lap, so use angle when same lap
      place = 1;
      for (i = 0; i < rivals.length; i++) {
        var rt = rivals[i].a;
        if (rt > (myTotal % 6.283) + 0.001 && me.lap < 1) place++;
      }
      if (me.lap >= 3) {
        var won = place === 1;
        api.score(won ? 1000 : 500);
        if (won) api.win("🏆 You won the Turbo Cup!");
        else api.gameOver("Finished P" + place + " — so close! Race again.");
      }
      if (t > 120) return api.gameOver("Time up! P" + place);
    },
    draw: function () {
      var ctx = api.ctx;
      ctx.fillStyle = "#0d2417"; ctx.fillRect(0, 0, W, H);
      // track
      ctx.strokeStyle = "#3a3a3a"; ctx.lineWidth = 46;
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 7); ctx.stroke();
      ctx.strokeStyle = "#f5f5f5"; ctx.lineWidth = 3; ctx.setLineDash([14, 12]);
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 7); ctx.stroke();
      ctx.setLineDash([]);
      // boost pads
      ctx.fillStyle = "#00f0ff";
      [0.8, 2.4, 4.2, 5.6].forEach(function (p) { var q = pos(p); ctx.fillRect(q.x - 8, q.y - 8, 16, 16); });
      // start line
      var s = pos(0); ctx.fillStyle = "#fff"; ctx.fillRect(s.x - 4, s.y - 23, 8, 46);
      function car(a, color, off) {
        var p = pos(a, off || 0);
        ctx.save(); ctx.translate(p.x, p.y);
        var ang = Math.atan2(Math.cos(a) * ry, -Math.sin(a) * rx) + Math.PI / 2;
        ctx.rotate(-ang + Math.PI / 2);
        ctx.fillStyle = color; ctx.fillRect(-11, -7, 22, 14);
        ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.fillRect(-6, -4, 12, 8);
        ctx.restore();
      }
      var cols = ["#ff4d88", "#ffb300", "#c44dff", "#4dff88", "#ff6b4d"];
      for (var i = 0; i < rivals.length; i++) car(rivals[i].a, cols[i], 12);
      car(me.a, "#00f0ff", -12);
      GF.label(ctx, "LAP " + Math.min(3, me.lap + 1) + "/3   P" + place + "   " + t.toFixed(0) + "s", W / 2, 22, 14, "#fff");
    }
  };
}});
