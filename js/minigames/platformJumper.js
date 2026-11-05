// Minigame 4: Lava-Turm (Platform Jumper)
class PlatformJumperMinigame extends MinigameBase {
  constructor(canvas, players, options = {}) {
    super(canvas, players, options);
    this.totalDuration = 45;
    this.timeRemaining = this.totalDuration;
    this.seed = options.seed || Math.floor(Math.random() * 1000000);
    this.lavaY = 660;
    this.lavaGraceTime = 3.0;
    this.platforms = [];
    this.cameraY = 0;
    this.eliminated = [];
    this.bubbles = [];
  }

  // Seeded PRNG for identical platforms in multiplayer
  seededRandom() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  setupArena() {
    this.timeRemaining = this.totalDuration;
    this.lavaY = 660;
    this.lavaGraceTime = 3.0;
    this.cameraY = 0;
    this.eliminated = [];
    this.bubbles = [];

    // Base ground platform
    this.platforms = [
      { x: 40, y: 580, w: this.width - 80, h: 26, type: 'stone', crumbling: false, steppedOn: false, crumbleTimer: 1.5, crumbled: false }
    ];

    // Procedural platforms going up
    let currentY = 500;
    let prevX = this.width / 2;

    for (let i = 0; i < 45; i++) {
      const w = 90 + this.seededRandom() * 60;
      // Ensure reachable jump distance
      let x = prevX + (this.seededRandom() - 0.5) * 360;
      x = Math.max(50, Math.min(this.width - w - 50, x));
      prevX = x;

      const isCrumbling = i > 1 && this.seededRandom() < 0.28;

      this.platforms.push({
        x,
        y: currentY,
        w,
        h: 18,
        type: isCrumbling ? 'crumble' : 'stone',
        crumbling: isCrumbling,
        steppedOn: false,
        crumbleTimer: 1.5,
        crumbled: false,
        shakeOffset: 0
      });

      // Extra alternate platform every few steps for multiple path choices
      if (this.seededRandom() < 0.45) {
        const altW = 85 + this.seededRandom() * 50;
        const altX = (x > this.width / 2) ? (50 + this.seededRandom() * 250) : (this.width - altW - 50 - this.seededRandom() * 250);
        this.platforms.push({
          x: altX,
          y: currentY + (this.seededRandom() - 0.5) * 20,
          w: altW,
          h: 18,
          type: 'stone',
          crumbling: false,
          steppedOn: false,
          crumbleTimer: 1.5,
          crumbled: false,
          shakeOffset: 0
        });
      }

      currentY -= 68 + this.seededRandom() * 24;
    }

    // Players setup
    const spacing = 140;
    this.players.forEach((p, i) => {
      p.x = 280 + i * spacing;
      p.y = 550;
      p.vx = 0;
      p.vy = 0;
      p.onGround = true;
      p.alive = true;
      p.maxHeight = 0;
      p.deathTime = 0;
    });
  }

  update(dt) {
    if (!this.isRunning) return;

    this.timeRemaining -= dt;
    if (this.timeRemaining <= 0) {
      this.resolveMatch();
      return;
    }

    // Lava Rising logic
    if (this.lavaGraceTime > 0) {
      this.lavaGraceTime = Math.max(0, this.lavaGraceTime - dt);
    } else {
      const timeElapsed = this.totalDuration - this.timeRemaining;
      const lavaSpeed = 38 + timeElapsed * 1.35; // Accelerates over time
      this.lavaY -= lavaSpeed * dt;
    }

    // Update Platforms (crumbling logic)
    this.platforms.forEach(plat => {
      if (plat.crumbling && plat.steppedOn && !plat.crumbled) {
        plat.crumbleTimer -= dt;
        plat.shakeOffset = (Math.random() - 0.5) * 5;
        if (plat.crumbleTimer <= 0) {
          plat.crumbled = true;
          if (window.soundEngine) window.soundEngine.playPlatformBreak();
          this.spawnParticles(plat.x + plat.w / 2, plat.y + 8, '#78716C', 16, 90, 0.6);
        }
      }
    });

    // Update Players
    const gravity = 880;
    let highestY = 600;

    this.players.forEach((p, idx) => {
      if (!p.alive) return;

      // Bot AI
      if (p.type === 'bot') {
        window.BotController.updatePlatformJumperBot(p, this.platforms, this.lavaY, dt);
      }

      // Horizontal controls
      const moveSpeed = 230;
      let moveDir = 0;
      if (p.inputs.left) moveDir -= 1;
      if (p.inputs.right) moveDir += 1;
      p.vx = moveDir * moveSpeed;

      // Jump control (Action or Up key)
      const wantsJump = p.inputs.action || p.inputs.up;
      if (wantsJump && p.onGround) {
        p.vy = -540;
        p.onGround = false;
        if (window.soundEngine) window.soundEngine.playJump();
        this.spawnParticles(p.x, p.y + 16, '#E2E8F0', 6, 50, 0.25);
      }

      // Apply gravity
      p.vy += gravity * dt;

      // Tentative next position
      let nextX = p.x + p.vx * dt;
      let nextY = p.y + p.vy * dt;

      // Wall bounds
      nextX = Math.max(22, Math.min(this.width - 22, nextX));

      // Platform collisions (only when moving downwards)
      let landed = false;
      const radius = 18;

      if (p.vy >= 0) {
        for (const plat of this.platforms) {
          if (plat.crumbled) continue;

          const footY = nextY + radius;
          const prevFootY = p.y + radius;

          // Check if crossing platform top
          if (prevFootY <= plat.y + 6 && footY >= plat.y) {
            if (nextX + radius * 0.6 >= plat.x && nextX - radius * 0.6 <= plat.x + plat.w) {
              nextY = plat.y - radius;
              p.vy = 0;
              landed = true;
              p.onGround = true;

              if (plat.crumbling && !plat.steppedOn) {
                plat.steppedOn = true;
              }
              break;
            }
          }
        }
      }

      if (!landed) {
        p.onGround = false;
      }

      p.x = nextX;
      p.y = nextY;

      // Track max height
      p.maxHeight = Math.max(p.maxHeight, 580 - p.y);

      // Check lava death
      if (p.y + radius >= this.lavaY) {
        p.alive = false;
        p.deathTime = this.timeRemaining;
        this.eliminated.push(idx);

        if (window.soundEngine) window.soundEngine.playExplosion();
        this.spawnParticles(p.x, this.lavaY, '#EF4444', 30, 220, 0.8);
        this.spawnParticles(p.x, this.lavaY, '#F59E0B', 20, 160, 0.6);
      } else {
        if (p.y < highestY) highestY = p.y;
      }
    });

    // Camera follow (tracks highest player with smooth lerp)
    const targetCamY = Math.min(0, highestY - 320);
    this.cameraY += (targetCamY - this.cameraY) * Math.min(1, dt * 4);

    // Spawn lava bubbles
    if (Math.random() < 0.25) {
      this.bubbles.push({
        x: Math.random() * this.width,
        y: this.lavaY + Math.random() * 20,
        r: 3 + Math.random() * 5,
        life: 0.6
      });
    }

    // Update bubbles
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      this.bubbles[i].life -= dt;
      if (this.bubbles[i].life <= 0) this.bubbles.splice(i, 1);
    }

    this.updateParticles(dt);

    // Check if match should end (all dead or only 1 alive)
    const aliveCount = this.players.filter(p => p.alive).length;
    if (aliveCount <= 1 && this.players.length > 1) {
      setTimeout(() => this.resolveMatch(), 1000);
      this.isRunning = false;
    }
  }

  resolveMatch() {
    let rankings = [];

    // Surviving players sorted by highest altitude reached
    const alive = this.players
      .map((p, idx) => ({ idx, alive: p.alive, height: p.maxHeight }))
      .filter(p => p.alive)
      .sort((a, b) => b.height - a.height);

    alive.forEach(a => rankings.push(a.idx));

    // Eliminated players in reverse elimination order (last eliminated = higher rank)
    for (let i = this.eliminated.length - 1; i >= 0; i--) {
      if (!rankings.includes(this.eliminated[i])) {
        rankings.push(this.eliminated[i]);
      }
    }

    // Fallback
    for (let i = 0; i < this.players.length; i++) {
      if (!rankings.includes(i)) rankings.push(i);
    }

    this.finishGame(rankings);
  }

  render(ctx) {
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    // Apply camera vertical translation
    ctx.translate(0, -this.cameraY);

    // Volcano Tower Background
    const bgGrad = ctx.createLinearGradient(0, this.cameraY, 0, this.cameraY + this.height);
    bgGrad.addColorStop(0, '#0F172A');
    bgGrad.addColorStop(0.5, '#1E1B4B');
    bgGrad.addColorStop(1, '#450A0A');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, this.cameraY, this.width, this.height);

    // Tower brick wall textures in background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let y = Math.floor(this.cameraY / 60) * 60; y < this.cameraY + this.height + 60; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // Draw Platforms
    this.platforms.forEach(plat => {
      if (plat.crumbled) return;

      const px = plat.x + (plat.shakeOffset || 0);
      const py = plat.y;

      if (plat.type === 'stone') {
        // Sturdy stone platform
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(px, py + 4, plat.w, plat.h);

        ctx.fillStyle = '#475569';
        ctx.fillRect(px, py, plat.w, plat.h - 4);

        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(px, py, plat.w, 3);
      } else {
        // Crumbling wooden / cracked platform
        ctx.fillStyle = '#451A03';
        ctx.fillRect(px, py + 4, plat.w, plat.h);

        ctx.fillStyle = plat.steppedOn ? '#DC2626' : '#B45309';
        ctx.fillRect(px, py, plat.w, plat.h - 4);

        // Cracks
        ctx.strokeStyle = '#FEF08A';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px + plat.w * 0.3, py);
        ctx.lineTo(px + plat.w * 0.45, py + plat.h - 4);
        ctx.lineTo(px + plat.w * 0.7, py + 2);
        ctx.stroke();
      }
    });

    // Draw Players
    this.players.forEach(p => {
      if (p.alive) {
        this.drawPlayer(ctx, p);
      }
    });

    // Draw Particles
    this.renderParticles(ctx);

    // Draw Rising Magma / Lava
    this.drawLava(ctx);

    ctx.restore();

    // HUD: Timer, Grace Countdown & Altitude
    this.drawHUD(ctx);
  }

  drawLava(ctx) {
    const wave = Math.sin(performance.now() * 0.005) * 8;

    // Glowing Lava Surface
    const lavaGrad = ctx.createLinearGradient(0, this.lavaY, 0, this.lavaY + 400);
    lavaGrad.addColorStop(0, '#FEF08A'); // Hot yellow crest
    lavaGrad.addColorStop(0.1, '#F97316'); // Bright orange
    lavaGrad.addColorStop(0.4, '#DC2626'); // Red
    lavaGrad.addColorStop(1, '#7F1D1D');
    ctx.fillStyle = lavaGrad;

    ctx.beginPath();
    ctx.moveTo(0, this.lavaY + wave);
    for (let x = 0; x <= this.width; x += 40) {
      const y = this.lavaY + Math.sin((x + performance.now() * 0.1) * 0.03) * 6;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(this.width, this.lavaY + 1200);
    ctx.lineTo(0, this.lavaY + 1200);
    ctx.closePath();
    ctx.fill();

    // Lava bubbles
    ctx.fillStyle = 'rgba(254, 240, 138, 0.8)';
    this.bubbles.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  drawHUD(ctx) {
    ctx.save();

    // Top timer pill
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(this.width / 2 - 140, 16, 280, 42);
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.width / 2 - 140, 16, 280, 42);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';

    if (this.lavaGraceTime > 0) {
      ctx.fillStyle = '#FBBF24';
      ctx.fillText(`⚠️ LAVA IN: ${Math.ceil(this.lavaGraceTime)}s!`, this.width / 2, 42);
    } else {
      ctx.fillText(`🌋 LAVA STEIGT! [${Math.ceil(this.timeRemaining)}s]`, this.width / 2, 42);
    }

    ctx.restore();
  }
}

window.PlatformJumperMinigame = PlatformJumperMinigame;
