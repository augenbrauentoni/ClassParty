// Minigame 6: Ballon-Pumpen (Button Masher)
class ButtonMasherMinigame extends MinigameBase {
  constructor(canvas, players, options = {}) {
    super(canvas, players, options);
    this.totalDuration = 20;
    this.timeRemaining = this.totalDuration;
    this.finishers = [];
    this.prevActionStates = [false, false, false, false];
  }

  setupArena() {
    this.timeRemaining = this.totalDuration;
    this.finishers = [];
    this.prevActionStates = [false, false, false, false];

    // 4 Pedestals evenly distributed
    const stepX = this.width / 4;
    this.players.forEach((p, i) => {
      p.pedestalX = stepX * i + stepX / 2;
      p.pedestalY = 530;
      p.x = p.pedestalX - 35;
      p.y = p.pedestalY - 24;

      p.balloonProgress = 0; // 0 to 100%
      p.popped = false;
      p.plungerOffset = 0; // Animation of pump handle
      p.wobble = 0;
      p.alive = true;
      p.score = 0;
    });
  }

  update(dt) {
    if (!this.isRunning) return;

    this.timeRemaining -= dt;
    if (this.timeRemaining <= 0) {
      this.resolveMatch();
      return;
    }

    this.players.forEach((p, idx) => {
      if (p.popped) return;

      // Decay wobble and plunger animation
      p.wobble = Math.max(0, p.wobble - dt * 3.5);
      p.plungerOffset = Math.max(0, p.plungerOffset - dt * 140);

      // Check Keydown Edge (only trigger on false -> true transition)
      let triggered = false;

      if (p.type === 'bot') {
        triggered = window.BotController.updateButtonMasherBot(p, dt);
      } else {
        const isCurrentDown = !!p.inputs.action;
        const wasDown = this.prevActionStates[idx];
        if (isCurrentDown && !wasDown) {
          triggered = true;
        }
        this.prevActionStates[idx] = isCurrentDown;
      }

      if (triggered) {
        this.pumpBalloon(p, idx);
      }
    });

    this.updateParticles(dt);

    // If everyone popped, end match early
    const unpopped = this.players.filter(p => !p.popped).length;
    if (unpopped === 0) {
      setTimeout(() => this.resolveMatch(), 800);
      this.isRunning = false;
    }
  }

  pumpBalloon(p, idx) {
    if (p.popped) return;

    // Plunger handle goes down
    p.plungerOffset = 22;
    p.wobble = 0.22;

    // Pump stroke increment ~2.8%
    p.balloonProgress = Math.min(100, p.balloonProgress + 2.85);

    if (window.soundEngine) window.soundEngine.playPumpHiss();

    // Puff particle at nozzle
    const nozzleX = p.pedestalX + 20;
    const nozzleY = p.pedestalY - 40;
    this.spawnParticles(nozzleX, nozzleY, '#E2E8F0', 4, 45, 0.2);

    // Check Pop
    if (p.balloonProgress >= 100) {
      p.popped = true;
      p.balloonProgress = 100;
      this.finishers.push(idx);

      if (window.soundEngine) window.soundEngine.playBalloonPop();

      // Confetti burst!
      const balloonY = 220;
      this.spawnParticles(p.pedestalX, balloonY, p.color, 45, 260, 1.2);
      this.spawnParticles(p.pedestalX, balloonY, '#FEF08A', 30, 200, 1.0);
      this.spawnParticles(p.pedestalX, balloonY, '#FFFFFF', 20, 150, 0.8);
    }
  }

  resolveMatch() {
    let rankings = [];

    // Finishers in order of pop
    this.finishers.forEach(f => {
      if (!rankings.includes(f)) rankings.push(f);
    });

    // Remaining unpopped players sorted by highest balloon progress
    const remaining = this.players
      .map((p, idx) => ({ idx, progress: p.balloonProgress }))
      .filter(item => !rankings.includes(item.idx))
      .sort((a, b) => b.progress - a.progress);

    remaining.forEach(r => rankings.push(r.idx));

    this.finishGame(rankings);
  }

  render(ctx) {
    ctx.clearRect(0, 0, this.width, this.height);

    // Carnival Arena Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, '#1E1B4B');
    bgGrad.addColorStop(0.6, '#312E81');
    bgGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Floor
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 530, this.width, this.height - 530);
    ctx.fillStyle = '#6366F1';
    ctx.fillRect(0, 526, this.width, 4);

    // Draw 4 Player Stations
    this.players.forEach((p, idx) => {
      this.drawStation(ctx, p, idx);
    });

    // Render Particles (confetti)
    this.renderParticles(ctx);

    // Top HUD
    this.drawHUD(ctx);
  }

  drawStation(ctx, p, idx) {
    const px = p.pedestalX;
    const py = p.pedestalY;
    const balloonCenterY = 220;

    // 1. Pedestal Base
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.roundRect(px - 90, py, 180, 26, 8);
    ctx.fill();
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 3;
    ctx.stroke();

    // 2. Air Pump Mechanism
    const pumpX = px + 15;
    const pumpBaseY = py;

    // Pump cylinder
    ctx.fillStyle = '#475569';
    ctx.fillRect(pumpX - 7, pumpBaseY - 45, 14, 45);
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(pumpX - 5, pumpBaseY - 45, 10, 4);

    // Plunger Rod & T-Handle
    const rodTop = pumpBaseY - 65 + (p.plungerOffset || 0);
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(pumpX - 3, rodTop, 6, 25);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(pumpX - 16, rodTop - 6, 32, 7);

    // Hose from pump to balloon
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(pumpX, pumpBaseY - 10);
    ctx.bezierCurveTo(pumpX + 35, pumpBaseY - 15, px + 25, balloonCenterY + 110, px, balloonCenterY + 80);
    ctx.stroke();

    // 3. Player Character
    this.drawPlayer(ctx, p);

    // 4. Balloon
    if (!p.popped) {
      this.drawBalloon(ctx, px, balloonCenterY, p);
    } else {
      // Confetti text
      ctx.fillStyle = '#FBBF24';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💥 GEPLATZT!', px, balloonCenterY);
    }

    // 5. Progress percentage bar
    const barW = 100;
    const barH = 10;
    const barX = px - barW / 2;
    const barY = py + 34;

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);

    ctx.fillStyle = p.balloonProgress > 85 ? '#EF4444' : p.color;
    ctx.fillRect(barX, barY, (barW * p.balloonProgress) / 100, barH);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.floor(p.balloonProgress)}%`, px, barY + barH + 14);
  }

  drawBalloon(ctx, cx, cy, p) {
    const scale = 0.25 + (p.balloonProgress / 100) * 0.75;
    const radius = 28 + scale * 75;
    const wobbleScale = 1 + Math.sin(performance.now() * 0.02) * (p.wobble || 0);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(wobbleScale, 1 / wobbleScale);

    // Stretched translucency as it approaches 100%
    const isStretched = p.balloonProgress > 85;

    // Balloon Body
    ctx.fillStyle = p.color;
    ctx.globalAlpha = isStretched ? 0.8 : 0.95;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius, radius * 1.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = p.colorDark || '#1E40AF';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Gloss shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(-radius * 0.35, -radius * 0.4, radius * 0.22, radius * 0.38, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Knot at bottom
    ctx.fillStyle = p.colorDark || '#1E40AF';
    ctx.beginPath();
    ctx.moveTo(-6, radius * 1.12);
    ctx.lineTo(6, radius * 1.12);
    ctx.lineTo(0, radius * 1.12 + 10);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawHUD(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(this.width / 2 - 160, 16, 320, 42);
    ctx.strokeStyle = '#F43F5E';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.width / 2 - 160, 16, 320, 42);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🎈 HÄMMER DIE TASTE! [${Math.ceil(this.timeRemaining)}s]`, this.width / 2, 42);
    ctx.restore();
  }
}

window.ButtonMasherMinigame = ButtonMasherMinigame;
