"use strict";

window.createVesselGame = function createVesselGame(canvas, { onEvent = () => {}, portrait = "assets/portrait.jpg" } = {}) {
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const width = 180;
  const height = 320;
  const tick = 1 / 180;
  const fixedPower = 252;
  const launchRadius = 5.2;
  const tau = Math.PI * 2;
  const vertex = [[44, 306], [28, 257], [25, 207], [27, 160], [17, 108], [10, 46], [27, 26], [49, 18],
    [68, 34], [77, 76], [90, 121], [102, 75], [113, 31], [133, 18], [155, 28], [171, 46],
    [164, 105], [153, 161], [157, 209], [153, 260], [138, 306]];
  const heartVertex = [
    [43, 309], [34, 287], [28, 261], [28, 239], [32, 219], [40, 200], [52, 183],
    [58, 168], [57, 156], [51, 145], [39, 132], [28, 118], [20, 104], [15, 91],
    [12, 77], [14, 64], [20, 51], [30, 40], [42, 34], [54, 32], [66, 36],
    [75, 44], [90, 60], [101, 47], [111, 38], [123, 33], [136, 32], [149, 37],
    [159, 46], [165, 58], [168, 73], [167, 88], [161, 104], [154, 118],
    [143, 133], [132, 146], [125, 157], [124, 168], [129, 181], [140, 196],
    [148, 213], [153, 232], [154, 255], [150, 280], [139, 309],
  ];

  function makeWalls(points) {
    return points.map(([x, y], i) => {
      const [endX, endY] = points[(i + 1) % points.length];
      const dx = endX - x;
      const dy = endY - y;
      const length = Math.hypot(dx, dy);
      return { x, y, length, ux: dx / length, uy: dy / length, nx: -dy / length, ny: dx / length,
        left: Math.min(x, endX) - launchRadius, right: Math.max(x, endX) + launchRadius,
        top: Math.min(y, endY) - launchRadius, bottom: Math.max(y, endY) + launchRadius };
    });
  }

  const walls = makeWalls(vertex);
  const heartWalls = makeWalls(heartVertex);

  const themes = [
    { outer: "#5c2845", edge: "#fa8e8a", tiles: "#ffac9c", floor: "#963753", floorLight: "#b84962", line: "#ef798d" },
    { outer: "#6a305c", edge: "#f498aa", tiles: "#ffb1ba", floor: "#94466b", floorLight: "#b75479", line: "#e480a0" },
    { outer: "#492849", edge: "#dc8de0", tiles: "#f4ade1", floor: "#763b73", floorLight: "#a54b85", line: "#d585bf" },
  ];

  const episodes = [
    [
      { target: [76, 199, 9], origin: [91, 274], bumpers: [{ x: 115, y: 212, radius: 11 }], kind: "virus", look: 0 },
      { target: [119, 175, 10], origin: [88, 269], bumpers: [{ x: 105, y: 224, radius: 12 }], kind: "virus", bounce: 1, look: 1 },
      { target: [53, 99, 11], origin: [82, 252], bumpers: [{ x: 63, y: 178, radius: 11 }, { x: 123, y: 160, radius: 9 }], kind: "virus", look: 2 },
    ],
    [
      { target: [81, 202, 12], origin: [92, 268], bumpers: [{ x: 57, y: 231, radius: 11 }, { x: 122, y: 223, radius: 11 }],
        kind: "portrait", route: [[81, 202], [75, 188], [87, 187], [89, 176]] },
      { target: [89, 176, 13], origin: [91, 266], bumpers: [{ x: 56, y: 224, radius: 12 }, { x: 123, y: 214, radius: 11 }],
        kind: "portrait", disc: true, route: [[89, 176], [88, 157], [89, 125], [99, 111]] },
    ],
    [
      { target: [56, 106, 15], origin: [93, 247], bumpers: [{ x: 72, y: 176, radius: 11 }], kind: "boss", shield: true, bounce: 1 },
      { target: [121, 150, 15], origin: [88, 270], bumpers: [{ x: 55, y: 181, radius: 9 }], kind: "boss", wave: true },
      { target: [58, 125, 16], origin: [93, 266], bumpers: [{ x: 108, y: 201, radius: 13, travel: 27 }, { x: 53, y: 189, radius: 8 }],
        kind: "boss", bumper: true },
    ],
  ];

  for (const scene of episodes) {
    for (const level of scene) {
      const [x, y, radius] = level.target;
      level.body = { x, y, radius };
      level.walls = level.kind === "portrait" ? heartWalls : walls;
      level.obstacles = level.bumpers.map((row, index) => ({ ...row, type: "bumper", index }));
      if (level.wave) level.obstacles.push({ x: 92, y: 210, radius: 11, type: "wave", index: -1 });
      level.moving = Boolean(level.wave || level.bumpers.some((bumper) => bumper.travel));
    }
  }

  const cheek = "#ffa8a8";
  const peach = "#ffd2a4";
  const light = "#fff0d3";
  const yellow = "#ffe17b";
  const mint = "#beffcd";
  const deep = "#49304b";
  const direction = (x, y) => Math.atan2(y, x);
  const clam = (value, min, max) => Math.max(min, Math.min(max, value));
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const pt = (x, y) => ({ x, y });

  const asset = (url) => {
    const image = new Image();
    image.src = url;
    return image;
  };
  const art = {
    portrait: typeof portrait === "string" ? asset(portrait) : portrait,
    leukocyte: asset("assets/vessel-leuko.png"),
    egor: asset("assets/vessel-egor.png"),
    rbc: asset("assets/vessel-rbc.png"),
    viruses: [1, 2, 3].map((id) => asset("assets/vessel-virus-" + id + ".png")),
  };

  let game;
  let timer;
  let running = false;
  let paused = false;
  let previous = 0;
  let remainder = 0;
  let pointer = null;
  let viewport = { width: 0, height: 0, ratio: 1, scale: 1, offsetX: 0, offsetY: 0 };
  canvas.style.touchAction = "none";

  function emit(type, fields = {}) {
    onEvent({ type, ...fields });
  }

  function sound(cue, strength = 1) {
    emit("sound", { cue, strength });
  }

  function say(id) {
    emit("dialogue", { id });
  }

  function phase() {
    return episodes[game.scene - 1][game.objective];
  }

  function targetOf(level) {
    return level.body;
  }

  function origin() {
    const [x, y] = phase().origin;
    return { x, y };
  }

  function obstacleAt(obstacle, time) {
    if (obstacle.type === "wave") return { ...obstacle, x: 92 + Math.sin(time * 2.12 + .5) * 48 };
    if (obstacle.travel) return { ...obstacle, x: obstacle.x + Math.sin(time * 1.43 + .8) * obstacle.travel };
    return obstacle;
  }

  function bumpersAt(level, time) {
    return level.moving ? level.obstacles.map((obstacle) => obstacleAt(obstacle, time)) : level.obstacles;
  }

  function begin(scene, objective = 0) {
    game.scene = scene;
    game.objective = objective;
    game.ball = null;
    game.hit = null;
    game.readyAt = null;
    game.misses = 0;
    game.aim = null;
    game.guide = null;
    game.guideModel = null;
    game.lastGuide = -Infinity;
    game.shownPull = false;
    game.phaseClock = 0;
    pointer = null;
    if (scene === 2) game.guide = findGuide();
    if (objective === 0) emit("scene", { scene });
    emit("progress", { done: objective, total: episodes[scene - 1].length });
    if (scene === 1 && objective === 0) say("start");
    if (scene === 1 && objective === 1) say("ricochet");
    if (scene === 2 && objective === 0) say("portrait-arrive");
    if (scene === 3) say(["egor-arrive", "egor-2", "egor-3"][objective]);
  }

  function updateViewport() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    if (rect.width === viewport.width && rect.height === viewport.height && ratio === viewport.ratio) return;
    const scale = Math.min(rect.width / width, rect.height / height);
    viewport = { width: rect.width, height: rect.height, ratio, scale, offsetX: (rect.width - width * scale) / 2,
      offsetY: (rect.height - height * scale) / 2 };
    canvas.width = Math.max(1, Math.round(rect.width * ratio));
    canvas.height = Math.max(1, Math.round(rect.height * ratio));
  }

  function createBall(angle, power) {
    return { ...origin(), vx: Math.cos(angle) * power, vy: Math.sin(angle) * power, life: 0, bounces: 0, bumperBounces: 0,
      wallTime: -1, obstacleTime: -1, targetTime: -1, firstDisc: null };
  }

  function reflect(ball, nx, ny, damping = .9) {
    const approach = ball.vx * nx + ball.vy * ny;
    if (approach >= -.001) return false;
    ball.vx = (ball.vx - 2 * approach * nx) * damping;
    ball.vy = (ball.vy - 2 * approach * ny) * damping;
    return true;
  }

  function circleCollision(ball, body, radius = launchRadius, damping = .92) {
    const dx = ball.x - body.x;
    const dy = ball.y - body.y;
    const reach = body.radius + radius;
    const squared = dx * dx + dy * dy;
    if (squared >= reach * reach) return false;
    const length = Math.sqrt(squared);
    const nx = length > 0 ? dx / length : -1;
    const ny = length > 0 ? dy / length : 0;
    ball.x = body.x + nx * (reach + .09);
    ball.y = body.y + ny * (reach + .09);
    return reflect(ball, nx, ny, damping);
  }

  function stepBall(ball, dt, level, clock, onCollision) {
    ball.life += dt;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    const friction = Math.exp(-dt * .72);
    ball.vx *= friction;
    ball.vy *= friction;

    for (const wall of level.walls) {
      if (ball.x < wall.left || ball.x > wall.right || ball.y < wall.top || ball.y > wall.bottom) continue;
      const along = clam((ball.x - wall.x) * wall.ux + (ball.y - wall.y) * wall.uy, 0, wall.length);
      const px = wall.x + wall.ux * along;
      const py = wall.y + wall.uy * along;
      const dx = ball.x - px;
      const dy = ball.y - py;
      const length = Math.hypot(dx, dy);
      if (length >= launchRadius) continue;
      const inside = dx * wall.nx + dy * wall.ny >= 0;
      const nx = length && inside ? dx / length : wall.nx;
      const ny = length && inside ? dy / length : wall.ny;
      ball.x = px + nx * (launchRadius + .08);
      ball.y = py + ny * (launchRadius + .08);
      if (reflect(ball, nx, ny, .94) && ball.life - ball.wallTime > .053) {
        ball.wallTime = ball.life;
        ball.bounces += 1;
        onCollision?.("bounce", ball.x, ball.y);
      }
    }

    for (const obstacle of level.obstacles) {
      const bumper = obstacleAt(obstacle, clock);
      if (circleCollision(ball, bumper) && ball.life - ball.obstacleTime > .072) {
        ball.obstacleTime = ball.life;
        if (bumper.type === "bumper") {
          ball.bounces += 1;
          ball.firstDisc ??= bumper.index;
          if (bumper.travel) ball.bumperBounces += 1;
          onCollision?.("bounce", ball.x, ball.y);
        } else {
          onCollision?.("wave", ball.x, ball.y);
        }
      }
    }

    const target = targetOf(level);
    const hitX = ball.x - target.x;
    const hitY = ball.y - target.y;
    const reach = target.radius + launchRadius + 1.15;
    if (hitX * hitX + hitY * hitY < reach * reach) {
      const noBounce = level.bounce && ball.bounces < level.bounce;
      const badAngle = level.shield && hitX > -reach * .62;
      const missedBumper = level.bumper && !ball.bumperBounces;
      const missedDisc = level.disc && ball.firstDisc === null;
      if (!noBounce && !badAngle && !missedBumper && !missedDisc) {
        return "hit";
      }
      if (circleCollision(ball, { ...target, radius: target.radius + 1.05 }) && ball.life - ball.targetTime > .09) {
        ball.targetTime = ball.life;
        onCollision?.("shield", ball.x, ball.y);
      }
    }

    if (ball.life > 2.6 || ball.vx * ball.vx + ball.vy * ball.vy < 55 * 55 || ball.x < -16 || ball.x > width + 16 || ball.y < -15 || ball.y > height + 15) return "stop";
    return null;
  }

  function project(angle, power, level, clock, drawPath = false) {
    const ball = createBall(angle, power);
    const segments = [];
    let previousBounces = 0;
    while (ball.life < 2.66) {
      const before = ball.life;
      const ended = stepBall(ball, tick, level, clock + ball.life + tick);
      const newBounce = previousBounces !== ball.bounces;
      if (drawPath && (Math.floor(ball.life * 20) > Math.floor(before * 20) || newBounce || ended)) {
        segments.push({ x: ball.x, y: ball.y, bounce: newBounce, hit: ended === "hit" });
      }
      previousBounces = ball.bounces;
      if (ended) return { hit: ended === "hit", life: ball.life, disc: ball.firstDisc, segments };
    }
    return { hit: false, life: ball.life, segments };
  }

  function findGuide() {
    const level = phase();
    const known = game.guideModel;
    if (known && (!level.moving || project(known.angle, known.power, level, game.phaseClock).hit)) return known;
    const launch = origin();
    const direct = direction(level.target[0] - launch.x, level.target[1] - launch.y);
    if (!level.bounce && !level.bumper && !level.disc && project(direct, fixedPower, level, game.phaseClock).hit) {
      game.guideModel = { angle: direct, power: fixedPower };
      return game.guideModel;
    }
    let best = null;
    for (const power of [fixedPower, 276, 225]) {
      for (let index = 0; index <= 80; index += 1) {
        const angle = -Math.PI - .43 + index * (Math.PI + .86) / 80;
        const projection = project(angle, power, level, game.phaseClock);
        if (!projection.hit) continue;
        const score = projection.life + Math.abs(angle - direct) * .11;
        if (!best || score < best.score) best = { angle, power, score, disc: projection.disc };
      }
      if (best) {
        game.guideModel = best;
        return best;
      }
    }
    return best;
  }

  function burst(x, y, pigment, count = 10, speed = 54) {
    const quantity = reduced.matches ? Math.ceil(count / 3) : count;
    for (let i = 0; i < quantity; i += 1) {
      const a = Math.random() * tau;
      const scale = .45 + Math.random() * .7;
      const life = .28 + Math.random() * .42;
      game.particles.push({ x, y, vx: Math.cos(a) * speed * scale, vy: Math.sin(a) * speed * scale,
        life, original: life, pigment, size: 1.1 + Math.random() * 2.3, star: i % 3 === 0 });
    }
  }

  function launch(angle, power) {
    if (!game || game.ball || game.hit || game.readyAt !== null || game.finished) return;
    game.aim = null;
    game.guide = null;
    game.ball = createBall(angle, power);
    game.trail = [];
    const source = origin();
    burst(source.x, source.y, mint, 8, 43);
    sound("launch");
  }

  function visitCollision(cue, x, y) {
    const particleColor = cue === "shield" ? peach : cue === "wave" ? "#ff8ab0" : yellow;
    burst(x, y, particleColor, 5, 32);
    sound(cue, Math.min(1, Math.hypot(game.ball.vx, game.ball.vy) / fixedPower));
    if (cue === "shield") game.blocked = .85;
    game.shake = Math.min(1.5, game.shake + .64);
  }

  function onTarget() {
    const level = phase();
    const final = game.scene === 3 && game.objective === 2;
    const body = targetOf(level);
    game.hit = { age: 0, final, offset: game.ball.vx < 0 ? -1 : 1, dialogue: false };
    game.ball = null;
    game.shake = level.kind === "boss" ? 3.8 : 2.5;
    burst(body.x, body.y, level.kind === "boss" ? yellow : cheek, final ? 30 : 19, final ? 110 : 75);
    burst(body.x, body.y, mint, level.kind === "portrait" ? 13 : 6, 62);
    sound(level.kind === "portrait" ? "portrait-rise" : level.kind === "boss" ? "boss-hit" : "virus");
    if (final) sound("win");
    emit("progress", { done: game.objective + 1, total: episodes[game.scene - 1].length });
  }

  function update(dt) {
    const level = phase();
    game.clock += dt;
    game.phaseClock += dt;
    game.shake *= Math.exp(-dt * 14);
    game.blocked = Math.max(0, game.blocked - dt);

    for (const particle of game.particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= .995;
      particle.vy += 51 * dt;
      particle.life -= dt;
    }
    game.particles = game.particles.filter((particle) => particle.life > 0);
    for (const node of game.trail) node.life -= dt;
    game.trail = game.trail.filter((node) => node.life > 0);

    if (game.hit) {
      game.hit.age += dt;
      if (!game.hit.dialogue && game.hit.age >= .73 && (level.kind === "portrait" && game.objective === 1 || game.hit.final)) {
        game.hit.dialogue = true;
        say(game.hit.final ? "egor-down" : "portrait-fly");
        return;
      }
      if (game.hit.age >= (game.hit.final ? 1.35 : level.kind === "portrait" ? 1.27 : .86)) {
        if (game.hit.final) {
          game.finished = true;
          emit("complete");
        } else {
          const { scene, objective } = game;
          if (objective === episodes[scene - 1].length - 1) begin(scene + 1);
          else begin(scene, objective + 1);
        }
      }
      return;
    }

    if (game.ball) {
      const last = game.trail.at(-1);
      if (!last || dist(last, game.ball) > 5) game.trail.push({ x: game.ball.x, y: game.ball.y, life: .32 });
      const result = stepBall(game.ball, dt, level, game.phaseClock, visitCollision);
      if (result === "hit") onTarget();
      else if (result === "stop") {
        game.ball = null;
        game.misses += 1;
        game.readyAt = game.clock + .38;
        if (game.misses === 2) sound("assist");
      }
      return;
    }

    if (game.readyAt !== null && game.clock >= game.readyAt) game.readyAt = null;
    if ((game.scene === 2 && !game.guide || game.misses >= 2) && game.clock - game.lastGuide > .31) {
      game.guide = findGuide();
      game.lastGuide = game.clock;
    }
  }
  function coordinate(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left - viewport.offsetX) / viewport.scale, y: (event.clientY - rect.top - viewport.offsetY) / viewport.scale };
  }

  function modelAim(position, pull, assist = false) {
    const base = origin();
    const x = pull ? base.x - position.x : position.x - base.x;
    const y = pull ? base.y - position.y : position.y - base.y;
    const angle = direction(x, y);
    const power = pull ? 207 + Math.min(Math.hypot(x, y), 63) * 1.14 : fixedPower;
    if (assist && game.misses >= 2) {
      const guide = findGuide();
      if (guide && (game.misses >= 4 || Math.abs(Math.atan2(Math.sin(guide.angle - angle), Math.cos(guide.angle - angle))) < .93)) {
        return { angle: guide.angle, power: guide.power };
      }
    }
    return { angle, power };
  }

  function ready() {
    return Boolean(game && !game.finished && running && !paused && !game.ball && !game.hit && game.readyAt === null);
  }

  canvas.addEventListener("pointerdown", (event) => {
    if (!ready() || !event.isPrimary || event.button !== 0) return;
    updateViewport();
    const position = coordinate(event);
    if (position.x < 0 || position.x > width || position.y < 0 || position.y > height) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    pointer = { id: event.pointerId, start: position, position, fromHero: dist(origin(), position) < 21 };
    game.aim = pointer.fromHero ? null : modelAim(position, false, true);
    sound("aim", .5);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (pointer?.id !== event.pointerId || !ready()) return;
    pointer.position = coordinate(event);
    const pull = pointer.fromHero && dist(origin(), pointer.position) > 5;
    game.aim = pull || !pointer.fromHero ? modelAim(pointer.position, pull, true) : null;
  });

  canvas.addEventListener("pointerup", (event) => {
    if (pointer?.id !== event.pointerId || !ready()) return;
    const position = coordinate(event);
    const pull = pointer.fromHero && dist(origin(), position) > 6;
    const tapHero = dist(origin(), position) <= 10;
    pointer = null;
    if (tapHero && !pull) {
      if (game.misses >= 2) {
        const guide = findGuide();
        if (guide) {
          launch(guide.angle, guide.power);
          return;
        }
      }
      game.aim = null;
      game.shownPull = true;
      return;
    }
    const aim = modelAim(position, pull, true);
    launch(aim.angle, aim.power);
  });

  for (const name of ["pointercancel", "lostpointercapture"]) {
    canvas.addEventListener(name, (event) => {
      if (pointer?.id !== event.pointerId) return;
      pointer = null;
      if (game) game.aim = null;
    });
  }

  canvas.addEventListener("keydown", (event) => {
    if (!ready() || (event.code !== "Space" && event.code !== "Enter")) return;
    event.preventDefault();
    const guide = findGuide();
    if (guide) launch(guide.angle, guide.power);
  });

  function circle(x, y, radius, fill, stroke, line = 1) {
    ctx.beginPath();
    ctx.arc(x, y, Math.max(radius, .01), 0, tau);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = line;
      ctx.stroke();
    }
  }

  function ellipse(x, y, width, height, fill, stroke, line = 1) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(width, .01), Math.max(height, .01), 0, 0, tau);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = line;
      ctx.stroke();
    }
  }

  function rectangle(x, y, width, height, radius, fill, stroke, line = 1) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = line;
      ctx.stroke();
    }
  }

  function segment(x, y, endX, endY, color, width = 1) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  function star(x, y, radius, color) {
    ctx.beginPath();
    ctx.moveTo(x, y - radius);
    ctx.lineTo(x + radius * .26, y - radius * .27);
    ctx.lineTo(x + radius, y);
    ctx.lineTo(x + radius * .26, y + radius * .27);
    ctx.lineTo(x, y + radius);
    ctx.lineTo(x - radius * .26, y + radius * .27);
    ctx.lineTo(x - radius, y);
    ctx.lineTo(x - radius * .26, y - radius * .27);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function drawAsset(image, x, y, size, aspect = 1) {
    if (!image?.complete || !image.naturalWidth) return false;
    const pixel = Math.round(size);
    const pixelHeight = Math.round(size * aspect);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, Math.round(x - pixel / 2), Math.round(y - pixelHeight / 2), pixel, pixelHeight);
    return true;
  }

  function polygon(points = vertex) {
    const [[firstX, firstY], ...rest] = points;
    ctx.beginPath();
    ctx.moveTo(firstX, firstY);
    for (const [x, y] of rest) ctx.lineTo(x, y);
    ctx.closePath();
  }

  function redCell(x, y, angle, size, alpha) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.rotate(angle);
    if (!drawAsset(art.rbc, 0, 0, size, .6087)) {
      ellipse(0, 0, size / 2, size * .3, "#e77b83", "#a24363", 1);
      ellipse(0, -.3, size * .27, size * .13, "#c35971");
      ellipse(-size * .14, -size * .18, size * .19, size * .05, "#ffb0a0");
    }
    ctx.restore();
  }

  function cellBackdrop(theme) {
    const t = game.clock * (reduced.matches ? .13 : 1);
    const positions = [[28, 104, 11], [57, 54, 12], [41, 140, 14], [124, 52, 16], [144, 111, 13], [122, 132, 8],
      [62, 137, 13], [116, 244, 16], [57, 216, 17], [94, 229, 11], [47, 263, 13], [101, 188, 14], [135, 276, 14],
      [140, 190, 11], [78, 289, 11], [66, 163, 7], [110, 103, 10], [61, 86, 7], [149, 57, 11]];
    for (const [index, [x, y, size]] of positions.entries()) {
      redCell(x + Math.sin(t * .52 + index * .78) * 5, y - Math.sin(t * .78 + index) * 8, index * .62 + t * .13,
        size, index % 3 ? .35 : .50);
    }

    ctx.globalAlpha = .24;
    for (let y = 40; y <= 293; y += 16) {
      const drift = (t * 4.2 + y / 2) % 16;
      for (let x = 22; x < 164; x += 19) circle(x + Math.sin(y / 17 + x) * 4, y + drift, .58, light);
    }
    ctx.globalAlpha = .23;
    ctx.setLineDash([2, 10]);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(91, 294);
    ctx.bezierCurveTo(83, 238, 95, 137, 49, 51);
    ctx.moveTo(91, 294);
    ctx.bezierCurveTo(97, 223, 86, 138, 133, 49);
    ctx.strokeStyle = theme.line;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  function heartTrack(points, color, thickness) {
    const [[x, y], ...rest] = points;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (const [endX, endY] of rest) ctx.lineTo(endX, endY);
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.stroke();
  }

  function heartTubes() {
    const tracks = [
      [[65, 49], [66, 39], [69, 29], [73, 20], [75, 11], [75, -4]],
      [[111, 50], [111, 40], [114, 31], [121, 23], [128, 16], [133, 7], [134, -4]],
    ];
    ctx.lineJoin = "round";
    ctx.lineCap = "butt";
    for (const track of tracks) {
      heartTrack(track, "#371127", 20);
      heartTrack(track, "#a2244d", 16);
      heartTrack(track, "#e64c65", 11);
      heartTrack(track, "#bc3159", 5);
      for (let i = 1; i < track.length - 1; i += 1) {
        const [x, y] = track[i];
        const [beforeX, beforeY] = track[i - 1];
        const [afterX, afterY] = track[i + 1];
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.atan2(afterY - beforeY, afterX - beforeX));
        rectangle(-4, -3.8, 8, 7.6, 1.4, i % 2 ? "#ff897f" : "#e76676", "#842048", .8);
        ctx.restore();
      }
    }
  }

  function heartValves() {
    const phaseTime = game.phaseClock;
    const level = phase();
    const approaching = game.ball && Math.abs(game.ball.y - 157) < 25;
    const entering = game.hit && level.disc;
    const pulse = reduced.matches ? 0 : Math.max(0, Math.sin(phaseTime * 3.9));
    const opening = entering ? Math.sin(Math.min(1, game.hit.age / .72) * Math.PI) * 7 : (approaching ? 2.5 : 0);
    const shift = 2.3 + pulse * .7 + opening;
    const lip = [[-2, -8], [-6, -8], [-12, -7], [-16, -6], [-22, -3], [-26, -1],
      [-30, 3], [-31, 7], [-27, 10], [-23, 10], [-19, 9], [-14, 7], [-9, 4], [-5, 1], [-3, -3]];
    const fold = [[-26, 6], [-20, 5], [-15, 3], [-11, 1], [-7, -3], [-5, -5]];
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(90 + shift * side, 154);
      ctx.scale(-side, 1);
      polygon(lip);
      ctx.fillStyle = "#ffe1ae";
      ctx.fill();
      ctx.lineJoin = "miter";
      ctx.lineWidth = 1.25;
      ctx.strokeStyle = "#8c3152";
      ctx.stroke();
      heartTrack(fold, "#de8d7c", 2.4);
      heartTrack([[-27, 8], [-21, 8], [-16, 6], [-11, 4]], "#fff0ca", 1.3);
      ctx.restore();
    }
  }

  function heartArtwork() {
    const side = viewport.offsetX / viewport.scale;
    const top = viewport.offsetY / viewport.scale;
    const backdrop = ctx.createRadialGradient(88, 144, 27, 90, 160, 188);
    backdrop.addColorStop(0, "#693052");
    backdrop.addColorStop(1, "#39152f");
    ctx.fillStyle = backdrop;
    ctx.fillRect(-side - 1, -top - 1, width + side * 2 + 2, height + top * 2 + 2);
    heartTubes();

    ctx.save();
    polygon(heartVertex);
    ctx.clip();
    const chamber = ctx.createLinearGradient(33, 225, 143, 37);
    chamber.addColorStop(0, "#741b44");
    chamber.addColorStop(.39, "#902451");
    chamber.addColorStop(.44, "#b62b53");
    chamber.addColorStop(.72, "#c73459");
    chamber.addColorStop(1, "#e34863");
    ctx.fillStyle = chamber;
    ctx.fillRect(0, 0, width, height);

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const folds = [
      [[27, 86], [26, 73], [32, 57], [44, 48], [55, 47], [66, 53], [76, 65], [82, 74]],
      [[25, 99], [35, 94], [46, 90], [58, 91], [70, 101], [76, 114], [80, 129]],
      [[154, 90], [154, 75], [150, 59], [139, 50], [128, 48], [115, 53], [102, 67], [94, 84], [87, 107], [85, 129]],
      [[152, 110], [145, 98], [137, 91], [127, 93], [119, 101], [116, 111]],
      [[61, 149], [69, 144], [80, 142], [92, 142], [104, 144], [119, 152]],
    ];
    const beating = reduced.matches ? 0 : (Math.max(0, Math.sin(game.clock * 3.55)) ** 5);
    for (const [index, fold] of folds.entries()) {
      heartTrack(fold, "#8d244a88", index === 2 ? 13.5 : 9.5);
      heartTrack(fold, index === 2 ? "#f25b6c" : "#e95066", index === 2 ? 9 : 6.5);
      ctx.globalAlpha = .57 + beating * .27;
      heartTrack(fold, "#ff8778", index === 2 ? 4.4 : 2.3);
      ctx.globalAlpha = 1;
    }

    const time = game.clock * (reduced.matches ? .12 : 1);
    const cells = [[42, 71, 12], [61, 115, 13], [114, 71, 10], [142, 115, 15], [82, 130, 8],
      [74, 251, 13], [106, 288, 11], [130, 257, 14], [48, 242, 10], [96, 217, 8], [116, 195, 6], [58, 282, 8]];
    for (const [index, [x, y, size]] of cells.entries()) {
      redCell(x + Math.sin(time * .62 + index * 1.4) * 3, y + Math.cos(time * .84 + index) * 5,
        -.52 + index * .31 + time * .104, size, index % 3 ? .48 : .61);
    }
    ctx.globalAlpha = .33 + beating * .23;
    for (const [x, y] of [[43, 55], [48, 52], [146, 65], [151, 69], [68, 135], [72, 133], [44, 229], [135, 264], [137, 259]]) {
      ctx.fillStyle = "#ffd08d";
      ctx.fillRect(x, y, 1.35, 1.35);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    ctx.lineJoin = "round";
    polygon(heartVertex);
    ctx.strokeStyle = "#481533";
    ctx.lineWidth = 9.4;
    ctx.stroke();
    ctx.strokeStyle = "#d74363";
    ctx.lineWidth = 6.8;
    ctx.stroke();

    for (const wall of heartWalls) {
      const along = wall.length / 2;
      const x = wall.x + wall.ux * along;
      const y = wall.y + wall.uy * along;
      const span = Math.min(10.3, wall.length * .86);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(direction(wall.ux, wall.uy));
      rectangle(-span / 2, -2.65, span, 5.3, 1.35, y < 164 ? "#f66a72" : "#c33f62", "#91244f", .45);
      rectangle(-span * .23, -1.55, span * .41, 2.5, .95, y < 164 ? "#ff9983" : "#ea6780");
      ctx.restore();
    }

    heartValves();
    if (beating > .2 || (game.hit && phase().disc)) {
      ctx.globalAlpha = .35 + beating * .49;
      for (const [x, y, vx, vy] of [[161, 133, 5, 2], [157, 139, 4, 4], [153, 144, 3, 4]]) {
        segment(x, y, x + vx, y + vy, "#ff9688", 1.6);
      }
      ctx.globalAlpha = 1;
    }
  }

  function artwork() {
    if (game.scene === 2) {
      heartArtwork();
      return;
    }
    const theme = themes[game.scene - 1];
    const outer = ctx.createRadialGradient(91, 151, 38, 89, 158, 174);
    outer.addColorStop(0, theme.outer);
    outer.addColorStop(1, game.scene === 3 ? "#61334d" : "#824054");
    const side = viewport.offsetX / viewport.scale;
    const top = viewport.offsetY / viewport.scale;
    ctx.fillStyle = outer;
    ctx.fillRect(-side - 1, -top - 1, width + side * 2 + 2, height + top * 2 + 2);

    ctx.save();
    polygon();
    ctx.clip();
    const floor = ctx.createLinearGradient(25, 325, 148, 17);
    floor.addColorStop(0, theme.floorLight);
    floor.addColorStop(.48, theme.floor);
    floor.addColorStop(1, theme.floorLight);
    ctx.fillStyle = floor;
    ctx.fillRect(0, 0, width, height);
    cellBackdrop(theme);
    ctx.restore();

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    polygon();
    ctx.strokeStyle = "#5b314b";
    ctx.lineWidth = 13;
    ctx.stroke();
    ctx.strokeStyle = theme.edge;
    ctx.lineWidth = 8.2;
    ctx.stroke();
    ctx.strokeStyle = "#ffc1a791";
    ctx.lineWidth = 1;
    ctx.stroke();

    for (const wall of walls) {
      const count = Math.floor(wall.length / 9);
      const span = wall.length / Math.max(1, count);
      for (let index = 0; index < count; index += 1) {
        const along = (index + .52) * span;
        const x = wall.x + wall.ux * along;
        const y = wall.y + wall.uy * along;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(direction(wall.ux, wall.uy));
        rectangle(-span * .43, -2.95, span * .86, 5.9, 2.5, theme.tiles, "#a9516f", .47);
        ellipse(-.4, .3, Math.min(1.5, span * .19), .82, theme.edge);
        ctx.restore();
      }
    }

    if (game.scene === 1) {
      star(12, 134, 4, "#ffc5ac");
      star(166, 217, 3.5, "#ffb1a4");
    } else {
      star(17, 126, 5, "#ffd0f2");
      star(166, 220, 5, "#ffb1e4");
    }
    star(90, 72, 2.5, "#ffadbb");
  }

  function drawObstacle(object) {
    const { x, y, radius } = object;
    if (object.type === "wave") {
      ctx.save();
      ctx.globalAlpha = .54;
      segment(44, y, 140, y, "#ff85a6", 1.2);
      ctx.globalAlpha = 1;
      ellipse(x, y + 1.2, 13.2, 6.8, "#6c3c6a", "#58304f", 1);
      ellipse(x, y - .2, 13, 8.2, "#ff8fb2", "#ffc2c4", .9);
      ctx.beginPath();
      ctx.moveTo(x - 10, y + .8);
      ctx.quadraticCurveTo(x - 4, y - 6, x + 2, y);
      ctx.quadraticCurveTo(x + 7, y + 5, x + 11, y - 2);
      ctx.strokeStyle = light;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (object.travel) {
      segment(81, y, 135, y, "#edb7d4", 1.2);
      for (let rail = 84; rail < 137; rail += 9) segment(rail, y - 2, rail, y + 2, "#ffd3df", .6);
    }
    ellipse(x, y + 3, radius + 1.6, radius * .77, "#55294879");
    circle(x, y, radius, object.travel ? "#ec91d2" : "#f0a37d", object.travel ? "#642b63" : "#783958", 1.2);
    circle(x, y - .6, radius * .7, object.travel ? "#ffb3e1" : "#ffcc98", "#fff0c2", 1);
    circle(x, y, radius * .39, object.travel ? "#bd68ad" : "#e2906c");
    star(x - radius * .29, y - radius * .48, radius * .24, light);
  }

  function bug(x, y, size, color) {
    for (let spike = 0; spike < 8; spike += 1) {
      const angle = spike * tau / 8;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      segment(x, y, x + dx * size, y + dy * size, deep, 2.65);
      segment(x, y, x + dx * size, y + dy * size, color, 1.45);
      circle(x + dx * size, y + dy * size, size * .13, color, deep, .45);
    }
    circle(x, y, size * .77, color, deep, .8);
    ellipse(x - 2.15, y - 1.5, 1.15, 1.65, light);
    ellipse(x + 2.15, y - 1.5, 1.15, 1.65, light);
    circle(x - 2, y - .9, .53, deep);
    circle(x + 2, y - .9, .53, deep);
    ellipse(x, y + 2.6, 1.45, .78, deep);
  }

  function courier(level) {
    if (!game.hit) return targetOf(level);
    const duration = level.disc ? .72 : .53;
    const t = Math.min(1, game.hit.age / duration);
    const travel = 1 - (1 - t) ** 1.48;
    const [start, bendOne, bendTwo, end] = level.route;
    const position = (axis) => (1 - travel) ** 3 * start[axis] + 3 * travel * (1 - travel) ** 2 * bendOne[axis] +
      3 * travel ** 2 * (1 - travel) * bendTwo[axis] + travel ** 3 * end[axis];
    return pt(position(0), position(1));
  }

  function drawCart(level) {
    const cart = courier(level);
    if (!game.ball && !game.hit && !level.disc) {
      circle(cart.x, cart.y, 18.4, "#ffe7b828", "#fff0bb", 1.25);
    }
    if (game.hit) {
      const [[fromX, fromY], [controlX, controlY], [bendX, bendY]] = level.route;
      ctx.setLineDash([1.1, 2.8]);
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.bezierCurveTo(controlX, controlY, bendX, bendY, cart.x, cart.y);
      ctx.strokeStyle = "#fff0b7";
      ctx.lineWidth = .9;
      ctx.stroke();
      ctx.setLineDash([]);
      if (level.disc && cart.y <= 127) {
        star(cart.x + 16, cart.y - 11, 3.4, "#fff0be");
        star(cart.x - 15, cart.y + 3, 2.2, "#ffcfaf");
      }
    }
    ellipse(cart.x, cart.y + 11, 15, 5, "#63284c80");
    ctx.save();
    ctx.translate(cart.x, cart.y);
    const rotate = game.hit && !reduced.matches ? Math.sin(game.hit.age * 19) * Math.max(0, .19 - game.hit.age * .27) : -.06;
    ctx.rotate(rotate);
    rectangle(-12, -15, 24, 25, 3.3, "#ffdeb1", "#542d4b", 1.3);
    if (art.portrait?.complete && art.portrait.naturalWidth) {
      const image = art.portrait;
      const cropWidth = Math.min(image.naturalWidth, image.naturalHeight * 20 / 19);
      const cropHeight = cropWidth * 19 / 20;
      const focusY = Number(image.dataset.focusY ?? .22);
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(-10, -13, 20, 19, 2.1);
      ctx.clip();
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(image, (image.naturalWidth - cropWidth) * .5, (image.naturalHeight - cropHeight) * focusY,
        cropWidth, cropHeight, -10, -13, 20, 19);
      ctx.restore();
    } else {
      ellipse(0, -4, 6, 8, "#ffb088", "#7e4a62", .65);
      ellipse(0, .2, 4.1, 4.1, deep);
      circle(-2.2, -6, .65, deep);
      circle(2.2, -6, .65, deep);
    }
    rectangle(-14, 6, 28, 5.5, 1.6, "#f59f83", "#6a3851", 1);
    rectangle(-11, 10.5, 22, 2, .6, "#ffe78d", "#6a3851", .65);
    circle(-8, 13, 2.7, "#76506b", "#542d4b", .8);
    circle(8, 13, 2.7, "#76506b", "#542d4b", .8);
    star(10.5, -9, 3, yellow);
    ctx.restore();
  }

  function ring(target, level) {
    const time = game.clock;
    const pulse = reduced.matches ? 0 : Math.sin(time * 4.5) * 1.35;
    if (level.shield) {
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius + 4.2, -2.24, 2.24);
      ctx.strokeStyle = game.blocked ? "#ffe6b8" : "#ffadcb";
      ctx.lineWidth = game.blocked ? 3.4 : 2.25;
      ctx.stroke();
      star(target.x - target.radius - 5.6, target.y, 2.85 + pulse * .35, yellow);
      return;
    }
    circle(target.x, target.y, target.radius + 3 + pulse, null, level.kind === "boss" ? "#ffe499ba" : "#ffb0b85c", .9);
  }

  function drawTarget(level) {
    if (level.kind === "portrait") {
      drawCart(level);
      return;
    }
    const target = targetOf(level);
    const bob = reduced.matches ? 0 : Math.sin(game.clock * 4) * 1.85;
    const age = game.hit?.age || 0;
    if (!game.hit) ring(target, level);
    if (game.hit && level.kind === "virus" && age > .29) return;
    const x = target.x + (game.hit ? Math.min(1, age * 3) * 11 * game.hit.offset : 0);
    const y = target.y + bob - (game.hit ? Math.sin(Math.min(1, age * 2.25) * Math.PI) * 6 : 0);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(game.hit && !reduced.matches ? Math.sin(age * 13) * .25 : 0);
    if (game.hit?.final) {
      ctx.globalAlpha = Math.max(.2, 1 - age * .57);
      ctx.scale(1 + age * .22, Math.max(.42, 1 - age * .42));
    } else if (game.hit && level.kind === "virus") {
      ctx.globalAlpha = Math.max(0, 1 - age * 3.45);
      ctx.scale(1 + age * .88, 1 - age * .8);
    }
    if (level.kind === "boss") {
      ellipse(0, 9, 15, 4.8, "#51264878");
      if (!drawAsset(art.egor, 0, -1, 34)) bug(0, 0, 13.5, "#efa2d9");
      if (!game.hit && !level.shield) star(13, -13, 2.25, yellow);
    } else {
      ellipse(0, 6.5, 10, 2.9, "#5b2a5280");
      if (!drawAsset(art.viruses[level.look], 0, -.5, 17 + level.look * 2)) bug(0, 0, target.radius * .86, ["#e98aa9", "#ffc08c", "#d3a5e6"][level.look]);
    }
    ctx.restore();
  }

  function vectorPreview(aim, guide = false) {
    const level = phase();
    const preview = project(aim.angle, aim.power, level, game.phaseClock, true);
    const tinge = preview.hit ? "#e5ffd5" : "#fff0cf";
    const opacity = guide ? .77 : 1;
    let steps = 0;
    for (const { x, y, bounce, hit } of preview.segments) {
      ctx.globalAlpha = opacity * Math.max(.36, 1 - steps / 97);
      if (bounce) star(x, y, guide ? 3.05 : 3.6, yellow);
      else circle(x, y, hit ? 2.1 : guide ? .94 : 1.13, tinge);
      steps += 1;
    }
    ctx.globalAlpha = 1;
  }

  function drawLauncher() {
    const base = origin();
    const pulse = reduced.matches ? 0 : 1 + Math.sin(game.clock * 4.5) * .13;
    const idle = !game.ball && !game.hit;
    ellipse(base.x, base.y + 2, 12.1, 7.2, "#71324d", "#ffa3a5", .8);
    if (idle) {
      circle(base.x, base.y, 9.5 + pulse, "#baffce18", "#d9ffd5", .9);
      circle(base.x, base.y, 12.5 + pulse, null, "#baffce4f", .65);
    }
    if (idle && game.aim) vectorPreview(game.aim);
    else if (idle && (game.scene === 2 || game.misses >= 2) && game.guide) vectorPreview(game.guide, true);
    if (idle && pointer?.fromHero && game.aim) {
      const distance = Math.min(26, dist(base, pointer.position) * .55);
      const backwards = pt(base.x - Math.cos(game.aim.angle) * distance, base.y - Math.sin(game.aim.angle) * distance);
      segment(base.x, base.y, backwards.x, backwards.y, "#c9ffd2", 1.13);
      circle(backwards.x, backwards.y, 1.85, light);
    }
    if (idle && !pointer && !game.misses && (game.objective === 0 && game.scene === 1 || game.shownPull)) {
      const pullY = base.y + 18 + (reduced.matches ? 0 : Math.sin(game.clock * 6) * 2.7);
      segment(base.x, base.y + 11, base.x, pullY, "#f1ffdc", .85);
      segment(base.x - 2, pullY - 2, base.x, pullY, "#f1ffdc", .85);
      segment(base.x + 2, pullY - 2, base.x, pullY, "#f1ffdc", .85);
    }
  }

  function drawHero() {
    const ball = game.ball;
    if (!ball && (game.hit || game.readyAt !== null)) return;
    const base = ball || origin();
    const stretch = !ball || reduced.matches ? 0 : Math.min(.22, Math.hypot(ball.vx, ball.vy) / 1250);
    ctx.save();
    ctx.translate(base.x, base.y);
    if (ball && !reduced.matches) ctx.rotate(direction(ball.vx, ball.vy) * .21);
    ctx.scale(1 + stretch, 1 - stretch * .7);
    if (!drawAsset(art.leukocyte, 0, -1.1, 15.5)) {
      circle(0, 0, 6.8, mint, deep, .9);
      ellipse(0, -.5, 4.6, 3.3, "#e8ffd4");
      circle(-1.5, -1.1, .65, deep);
      circle(1.5, -1.1, .65, deep);
      star(-4.2, -4.1, 1.9, light);
    }
    ctx.restore();
  }

  function effects() {
    if (!reduced.matches) {
      for (const node of game.trail) {
        ctx.globalAlpha = node.life * 1.62;
        circle(node.x, node.y, node.life * 10.5, mint);
      }
    }
    for (const particle of game.particles) {
      ctx.globalAlpha = Math.min(1, particle.life / particle.original * 1.35);
      if (particle.star) star(particle.x, particle.y, particle.size, particle.pigment);
      else circle(particle.x, particle.y, particle.size * .55, particle.pigment);
    }
    ctx.globalAlpha = 1;
  }

  function draw() {
    if (!game || !viewport.scale) return;
    const { scale, ratio, offsetX, offsetY } = viewport;
    ctx.setTransform(scale * ratio, 0, 0, scale * ratio, offsetX * ratio, offsetY * ratio);
    artwork();
    ctx.save();
    if (!reduced.matches) ctx.translate(Math.sin(game.clock * 67) * game.shake, Math.sin(game.clock * 93) * game.shake * .8);
    const level = phase();
    for (const obstacle of bumpersAt(level, game.phaseClock)) {
      if (!game.ball && !game.hit && level.disc && obstacle.index === game.guide?.disc) {
        circle(obstacle.x, obstacle.y, obstacle.radius + 3, "#fff0ae3b", "#fff0bb", 1.25);
      }
      drawObstacle(obstacle);
    }
    drawLauncher();
    drawTarget(level);
    effects();
    drawHero();
    ctx.restore();
  }

  function step(ms) {
    if (!game) return;
    updateViewport();
    if (running && !paused && !game.finished) {
      remainder += Math.min(5, Math.max(0, ms / 1000));
      while (remainder >= tick && running && !paused && !game.finished) {
        remainder -= tick;
        update(tick);
      }
    }
    draw();
  }

  function loop(time) {
    if (!running || paused || game.finished) return;
    step(previous ? Math.min(42, time - previous) : 0);
    previous = time;
    if (running && !paused && !game.finished) timer = window.requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    updateViewport();
    running = true;
    paused = false;
    previous = 0;
    remainder = 0;
    game = { scene: 1, objective: 0, clock: 0, shake: 0, blocked: 0, particles: [], trail: [], finished: false };
    begin(1);
    draw();
    if (running && !paused) timer = window.requestAnimationFrame(loop);
  }

  function pause() {
    if (!running || paused) return;
    paused = true;
    const id = pointer?.id;
    pointer = null;
    if (id !== undefined && canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
    game.aim = null;
    remainder = 0;
    window.cancelAnimationFrame(timer);
  }

  function resume() {
    if (!running || !paused) return;
    paused = false;
    previous = 0;
    timer = window.requestAnimationFrame(loop);
  }

  function stop() {
    if (!running) return;
    pause();
    running = false;
    paused = false;
  }

  function speakerPoint(id) {
    if (!game || !viewport.scale) return null;
    const level = phase();
    let world = id === "hero" ? game.ball || origin() : targetOf(level);
    if (id === "portrait" && level.kind === "portrait") {
      const cart = courier(level);
      world = pt(cart.x, cart.y - 8);
    }
    return { x: world.x * viewport.scale + viewport.offsetX, y: world.y * viewport.scale + viewport.offsetY };
  }

  function state() {
    if (!game) return null;
    const level = phase();
    const base = origin();
    const guide = ready() ? findGuide() : null;
    return {
      scene: game.scene, objective: game.objective, total: episodes[game.scene - 1].length, width, height,
      clock: game.phaseClock, origin: base, target: targetOf(level), bumpers: bumpersAt(level, game.phaseClock),
      ball: game.ball && { x: game.ball.x, y: game.ball.y, bounces: game.ball.bounces, bumperBounces: game.ball.bumperBounces },
      ready: ready(), paused, misses: game.misses, finished: game.finished, impact: Boolean(game.hit),
      guide: guide && { angle: guide.angle, power: guide.power, disc: guide.disc, from: base,
        pull: pt(base.x - Math.cos(guide.angle) * (guide.power - 207) / 1.14, base.y - Math.sin(guide.angle) * (guide.power - 207) / 1.14),
        tap: pt(base.x + Math.cos(guide.angle) * 54, base.y + Math.sin(guide.angle) * 54) },
      aim: game.aim && { ...game.aim, path: project(game.aim.angle, game.aim.power, level, game.phaseClock, true).segments },
    };
  }

  return { start, stop, pause, resume, step, state, speakerPoint };
};
