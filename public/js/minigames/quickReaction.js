// Minigame 10: Schnellschuss (Quick Reaction)
class QuickReactionMinigame extends MinigameBase {
  constructor(canvas, players, options = {}) {
    super(canvas, players, options);
    this.phase = 'TENSION'; // TENSION, SIGNAL, RESOLVE
    this.tensionDuration = 2.5 + Math.random() * 4.0;
    this.tensionTimer = this.tensionDuration;
    this.signalTimestamp = 0;
    this.heartbeatTimer = 0;
    this.tumbleweed = { x: -60, y: 530, rot: 0, speed: 140 };
    this.cacti = [
      { x: 180, y: 440, h: 90 },
      { x: 500, y: 460, h: 70 },
      { x: 820, y: 430, h: 100 }
    ];
    this.prevActionStates = [false, false, false, false];
  }

  setupArena() {
    this.phase = 'TENSION';
    this.tensionDuration = 2.5 + Math.random() * 4.0;
    this.tensionTimer = this.tensionDuration;
    this.signalTimestamp = 0;
    this.heartbeatTimer = 0.8;
    this.prevActionStates = [false, false, false, false];

    // Position 4 dueling players along the floor
    const stepX = this.width / 5;
    this.players.forEach((p, i) => {
      p.x = stepX * (i + 1);
      p.y = 510;
      p.alive = true;
      p.disqualified = false;
      p.hasShot = false;
      p.reactionTime = null; // ms
      p.score = 0;
      p.shotFired = false;
    });

    this.tumbleweed = { x: -60, y: 530, rot: 0, speed: 140 };
  }

  update(dt) {
    if (!this.isRunning) return;

    // Animate tumbleweed
    this.tumbleweed.x += this.tumbleweed.speed * dt;
    this.tumbleweed.rot += dt * 3.5;
    if (this.tumbleweed.x > this.width + 60) {
      this.tumbleweed.x = -60;
    }

    if (this.phase === 'TENSION') {
      this.tensionTimer -= dt;

      // Heartbeat sound every ~0.9s
      this.heartbeatTimer -= dt;
      if (this.heartbeatTimer <= 0) {
        this.heartbeatTimer = 0.9;
        if (window.soundEngine) window.soundEngine.playHeartbeat();
      }

      // Check player inputs for FALSE START
      this.players.forEach((p, idx) => {
        let isPress = false;
        if (p.type === 'bot') {
          // 5% chance of early false start for bots
          if (!p.botTestedMisfire) {
            p.botTestedMisfire = true;
            if (Math.random() < 0.05) isPress = true;
          }
        } else {
          const isDown = !!p.inputs.action;
          const wasDown = this.prevActionStates[idx];
          if (isDown && !wasDown) isPress = true;
          this.prevActionStates[idx] = isDown;
        }

        if (isPress && !p.disqualified) {
          p.disqualified = true;
          p.hasShot = true;
          if (window.soundEngine) window.soundEngine.playMisfire();
          this.spawnParticles(p.x, p.y - 20, '#EF4444', 12, 60, 0.4);
        }
      });

      // Tension ends -> FIRE SIGNAL!
      if (this.tensionTimer <= 0) {
        this.phase = 'SIGNAL';
        this.signalTimestamp = performance.now();
        if (window.soundEngine) window.soundEngine.playWesternGong();

        // Schedule Bot reaction times (220ms - 420ms)
        this.players.forEach((p, idx) => {
          if (p.type === 'bot' && !p.disqualified) {
            const reactionMs = 220 + Math.random() * 200;
            p.botFireTime = this.signalTimestamp + reactionMs;
          }
        });
      }
    } else if (this.phase === 'SIGNAL') {
      const now = performance.now();

      // Check shots after signal
      this.players.forEach((p, idx) => {
        if (p.disqualified || p.hasShot) return;

        let shouldFire = false;
        if (p.type === 'bot') {
          if (now >= p.botFireTime) shouldFire = true;
        } else {
          const isDown = !!p.inputs.action;
          const wasDown = this.prevActionStates[idx];
          if (isDown && !wasDown) shouldFire = true;
          this.prevActionStates[idx] = isDown;
        }

        if (shouldFire) {
          p.hasShot = true;
          p.reactionTime = Math.round(now - this.signalTimestamp);
          p.shotFired = true;

          if (window.soundEngine) window.soundEngine.playWesternShot();
          this.spawnParticles(p.x + 20, p.y - 12, '#FBBF24', 16, 120, 0.3);
          this.spawnParticles(p.x + 20, p.y - 12, '#94A3B8', 8, 50, 0.4);
        }
      });

      // End when all valid players have shot, or after 2.5s timeout
      const elapsedSinceSignal = now - this.signalTimestamp;
      const waiting = this.players.filter(p => !p.disqualified && !p.hasShot).length;

      if (waiting === 0 || elapsedSinceSignal > 2500) {
        this.phase = 'RESOLVE';
        setTimeout(() => this.resolveMatch(), 1600);
      }
    }

    this.updateParticles(dt);
  }

  resolveMatch() {
    // Rank players: Valid reaction times ascending, disqualified players last
    const sorted = [...this.players]
      .map((p, idx) => ({
        idx,
        disqualified: p.disqualified,
        reactionTime: p.reactionTime !== null ? p.reactionTime : 9999
      }))
      .sort((a, b) => {
        if (a.disqualified !== b.disqualified) return a.disqualified ? 1 : -1;
        return a.reactionTime - b.reactionTime;
      });

    const rankings = sorted.map(s => s.idx);
    this.finishGame(rankings);
  }

  render(ctx) {
    ctx.clearRect(0, 0, this.width, this.height);

    // Western Sunset Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 520);
    skyGrad.addColorStop(0, '#4C1D95'); // Deep purple
    skyGrad.addColorStop(0.3, '#BE185D'); // Crimson
    skyGrad.addColorStop(0.65, '#EA580C'); // Orange
    skyGrad.addColorStop(1, '#FDE047'); // Golden sunset horizon
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, 520);

    // Sun disc at horizon
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(this.width / 2, 480, 75, 0, Math.PI * 2);
    ctx.fill();

    // Desert Sand Ground
    ctx.fillStyle = '#78350F';
    ctx.fillRect(0, 515, this.width, this.height - 515);
    ctx.fillStyle = '#92400E';
    ctx.fillRect(0, 510, this.width, 8);

    // Draw Cacti silhouettes
    ctx.fillStyle = '#1C1917';
    this.cacti.forEach(c => {
      ctx.fillRect(c.x - 7, c.y, 14, c.h);
      ctx.fillRect(c.x - 24, c.y + 25, 17, 10);
      ctx.fillRect(c.x - 24, c.y + 12, 10, 23);
      ctx.fillRect(c.x + 7, c.y + 35, 17, 10);
      ctx.fillRect(c.x + 14, c.y + 20, 10, 25);
    });

    // Draw Tumbleweed
    ctx.save();
    ctx.translate(this.tumbleweed.x, this.tumbleweed.y);
    ctx.rotate(this.tumbleweed.rot);
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2.5;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      ctx.beginPath();
      ctx.arc(0, 0, 18, a, a + 0.6);
      ctx.stroke();
    }
    ctx.restore();

    // Draw Players in Duel Stance
    this.players.forEach(p => {
      this.drawDuelPlayer(ctx, p);
    });

    // Render Particles (muzzle flashes & smoke)
    this.renderParticles(ctx);

    // Draw Signal Banner or Tension HUD
    this.drawHUD(ctx);
  }

  drawDuelPlayer(ctx, p) {
    this.drawPlayer(ctx, p);

    // Cowboy Hat
    ctx.save();
    ctx.translate(p.x, p.y - 20);
    ctx.fillStyle = '#78350F';
    // Brim
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Crown
    ctx.fillRect(-10, -11, 20, 11);
    ctx.fillStyle = '#B45309';
    ctx.fillRect(-10, -4, 20, 3);
    ctx.restore();

    // Gun in hand
    ctx.save();
    ctx.translate(p.x + 16, p.y + 4);
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, -3, 14, 5);
    ctx.fillRect(0, 0, 4, 8);
    ctx.restore();

    // Reaction Time or Status Badges
    ctx.save();
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';

    if (p.disqualified) {
      ctx.fillStyle = '#EF4444';
      ctx.fillText('❌ FEHLSTART!', p.x, p.y - 38);
    } else if (p.reactionTime !== null) {
      ctx.fillStyle = '#FBBF24';
      ctx.fillText(`⚡ ${p.reactionTime} ms`, p.x, p.y - 38);
    }
    ctx.restore();
  }

  drawHUD(ctx) {
    ctx.save();

    if (this.phase === 'TENSION') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.beginPath();
      ctx.roundRect(this.width / 2 - 220, 24, 440, 52, 16);
      ctx.fill();
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#FEF08A';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🤠 BEREITHALTEN... NOCH NICHT DRÜCKEN!', this.width / 2, 50);
    } else if (this.phase === 'SIGNAL' || this.phase === 'RESOLVE') {
      // Big flashing "JETZT! / FEUER!" signal banner
      const pulse = 1 + Math.sin(performance.now() * 0.02) * 0.08;
      ctx.translate(this.width / 2, 60);
      ctx.scale(pulse, pulse);

      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.roundRect(-180, -32, 360, 64, 20);
      ctx.fill();
      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'black 34px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 8;
      ctx.fillText('🔥 JETZT! FEUER! 🔥', 0, 0);
    }

    ctx.restore();
  }
}

window.QuickReactionMinigame = QuickReactionMinigame;
