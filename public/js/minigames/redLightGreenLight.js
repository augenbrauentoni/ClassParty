// Minigame 8: Ochs am Berg (Red Light, Green Light)
class RedLightGreenLightMinigame extends MinigameBase {
  constructor(canvas, players, options = {}) {
    super(canvas, players, options);
    this.totalDuration = 40;
    this.timeRemaining = this.totalDuration;
    this.lightState = 'GREEN'; // GREEN, WARN, RED
    this.stateTimer = 2.5;
    this.startX = 80;
    this.finishLineX = 890;
    this.finishers = [];
    this.eyeX = 945;
    this.eyeY = 325;
    this.laserBeams = [];
  }

  setupArena() {
    this.timeRemaining = this.totalDuration;
    this.lightState = 'GREEN';
    this.stateTimer = 3.0;
    this.finishers = [];
    this.laserBeams = [];

    // Lane spacing vertically
    const startY = 160;
    const laneH = 100;

    this.players.forEach((p, i) => {
      p.x = this.startX;
      p.y = startY + i * laneH;
      p.vx = 0;
      p.targetSpeed = 0;
      p.alive = true;
      p.finished = false;
      p.shockTimer = 0;
      p.score = 0;
      p.botMistake = false;
    });
  }

  update(dt) {
    if (!this.isRunning) return;

    this.timeRemaining -= dt;
    if (this.timeRemaining <= 0) {
      this.resolveMatch();
      return;
    }

    this.stateTimer -= dt;

    // State machine for Guardian Light
    if (this.lightState === 'GREEN') {
      if (this.stateTimer <= 0) {
        this.lightState = 'WARN';
        this.stateTimer = 0.7;
        if (window.soundEngine) window.soundEngine.playLaserWarning();

        // Roll 15% mistake chance for bots
        this.players.forEach(p => {
          if (p.type === 'bot') {
            p.botMistake = Math.random() < 0.15;
          }
        });
      }
    } else if (this.lightState === 'WARN') {
      if (this.stateTimer <= 0) {
        this.lightState = 'RED';
        this.stateTimer = 1.5 + Math.random() * 1.0;
        if (window.soundEngine) window.soundEngine.playLaserWarning();
      }
    } else if (this.lightState === 'RED') {
      if (this.stateTimer <= 0) {
        this.lightState = 'GREEN';
        this.stateTimer = 2.0 + Math.random() * 1.8;
      }
    }

    // Update laser visual effects
    for (let i = this.laserBeams.length - 1; i >= 0; i--) {
      this.laserBeams[i].life -= dt;
      if (this.laserBeams[i].life <= 0) this.laserBeams.splice(i, 1);
    }

    // Update Players
    this.players.forEach((p, idx) => {
      if (p.finished) return;

      p.shockTimer = Math.max(0, p.shockTimer - dt);

      // Bot AI
      if (p.type === 'bot') {
        window.BotController.updateRedLightBot(p, this.lightState, dt);
      }

      if (p.shockTimer > 0) {
        p.vx = 0;
        return;
      }

      // Movement input (Right key or Action key sprints forward)
      const wantsRun = p.inputs.right || p.inputs.action;
      const baseSpeed = p.inputs.action ? 275 : 220;

      if (wantsRun) {
        p.vx = baseSpeed;
      } else {
        p.vx = Math.max(0, p.vx - dt * 600); // Friction deceleration
      }

      // RED LIGHT DETECTION: Moving while eye scans!
      if (this.lightState === 'RED' && (p.vx > 15 || wantsRun)) {
        this.catchPlayer(p, idx);
        return;
      }

      p.x += p.vx * dt;

      // Crossing finish line!
      if (p.x >= this.finishLineX) {
        p.x = this.finishLineX + 15;
        p.vx = 0;
        p.finished = true;
        this.finishers.push(idx);

        if (window.soundEngine) window.soundEngine.playCoin();
        this.spawnParticles(p.x, p.y, p.color, 25, 140, 0.6);
        this.spawnParticles(p.x, p.y, '#FBBF24', 20, 160, 0.8);
      }
    });

    this.updateParticles(dt);

    // End match if all players finished
    const unfinished = this.players.filter(p => !p.finished).length;
    if (unfinished === 0) {
      setTimeout(() => this.resolveMatch(), 600);
      this.isRunning = false;
    }
  }

  catchPlayer(p, idx) {
    p.vx = 0;
    p.shockTimer = 1.1;

    // Laser beam strike from eye to player
    this.laserBeams.push({
      fromX: this.eyeX,
      fromY: this.eyeY,
      toX: p.x,
      toY: p.y,
      life: 0.35
    });

    if (window.soundEngine) window.soundEngine.playLaserZap();

    this.spawnParticles(p.x, p.y, '#EF4444', 25, 180, 0.7);
    this.spawnParticles(p.x, p.y, '#38BDF8', 15, 120, 0.5);

    // Penalty: send player back 240px or to start
    p.x = Math.max(this.startX, p.x - 240);
  }

  resolveMatch() {
    let rankings = [];

    // Finishers first in order of arrival
    this.finishers.forEach(f => {
      if (!rankings.includes(f)) rankings.push(f);
    });

    // Remaining players sorted by distance reached (X-coordinate descending)
    const remaining = this.players
      .map((p, idx) => ({ idx, x: p.x }))
      .filter(item => !rankings.includes(item.idx))
      .sort((a, b) => b.x - a.x);

    remaining.forEach(r => rankings.push(r.idx));

    this.finishGame(rankings);
  }

  render(ctx) {
    ctx.clearRect(0, 0, this.width, this.height);

    // Track Background
    const bgGrad = ctx.createLinearGradient(0, 0, this.width, 0);
    bgGrad.addColorStop(0, '#0F172A');
    bgGrad.addColorStop(0.7, '#1E293B');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Track Lanes
    const startY = 160;
    const laneH = 100;
    for (let i = 0; i < 4; i++) {
      const ly = startY + i * laneH;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(0, ly - 40, this.width, 80);

      // Lane divider line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([12, 12]);
      ctx.beginPath();
      ctx.moveTo(0, ly + 40);
      ctx.lineTo(this.width, ly + 40);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Start Line
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.startX, 100);
    ctx.lineTo(this.startX, 560);
    ctx.stroke();

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('START', this.startX, 90);

    // Finish Line (checkered pattern)
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(this.finishLineX, 100);
    ctx.lineTo(this.finishLineX, 560);
    ctx.stroke();

    ctx.fillStyle = '#FBBF24';
    ctx.fillText('ZIEL 🏁', this.finishLineX, 90);

    // Draw Red Light Scan Cone across field
    if (this.lightState === 'RED') {
      const scanAlpha = 0.15 + Math.sin(performance.now() * 0.01) * 0.05;
      const coneGrad = ctx.createRadialGradient(this.eyeX, this.eyeY, 20, this.eyeX, this.eyeY, 950);
      coneGrad.addColorStop(0, `rgba(239, 68, 68, ${scanAlpha * 2})`);
      coneGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = coneGrad;

      ctx.beginPath();
      ctx.moveTo(this.eyeX, this.eyeY);
      ctx.lineTo(0, 100);
      ctx.lineTo(0, 560);
      ctx.closePath();
      ctx.fill();
    }

    // Draw Guardian Eye / Robot
    this.drawGuardianEye(ctx);

    // Draw Laser Beams
    this.laserBeams.forEach(b => {
      ctx.save();
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(b.fromX, b.fromY);
      ctx.lineTo(b.toX, b.toY);
      ctx.stroke();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(b.fromX, b.fromY);
      ctx.lineTo(b.toX, b.toY);
      ctx.stroke();
      ctx.restore();
    });

    // Draw Players
    this.players.forEach(p => {
      this.drawPlayer(ctx, p);

      if (p.shockTimer > 0) {
        ctx.fillStyle = '#38BDF8';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ GESCHOCKT! ⚡', p.x, p.y - 28);
      } else if (p.finished) {
        ctx.fillStyle = '#FBBF24';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🏁 IM ZIEL!', p.x, p.y - 28);
      }
    });

    // Render Particles
    this.renderParticles(ctx);

    // Top HUD
    this.drawHUD(ctx);
  }

  drawGuardianEye(ctx) {
    const x = this.eyeX;
    const y = this.eyeY;
    const radius = 34;

    ctx.save();

    // Robot body mount
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(x, y, radius + 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Eye Color & Glow based on light state
    let eyeColor = '#10B981';
    let glowColor = 'rgba(16, 185, 129, 0.4)';

    if (this.lightState === 'WARN') {
      eyeColor = '#F59E0B';
      glowColor = 'rgba(245, 158, 11, 0.6)';
    } else if (this.lightState === 'RED') {
      eyeColor = '#EF4444';
      glowColor = 'rgba(239, 68, 68, 0.8)';
    }

    // Outer glow
    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.arc(x, y, radius + 18, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner iris
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    const lookOffset = this.lightState === 'GREEN' ? 10 : -8; // Looks away on green, stares left on red
    ctx.arc(x + lookOffset, y, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(x + lookOffset, y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Warning icon if in WARN state
    if (this.lightState === 'WARN') {
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️', x, y - 50);
    }

    ctx.restore();
  }

  drawHUD(ctx) {
    ctx.save();
    const panelW = 340;
    const panelH = 50;
    const px = (this.width - panelW) / 2;
    const py = 16;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(px, py, panelW, panelH, 16);
    ctx.fill();

    let borderColor = '#10B981';
    let statusText = '🟢 GRÜNES LICHT - RENNE!';
    let textColor = '#10B981';

    if (this.lightState === 'WARN') {
      borderColor = '#F59E0B';
      statusText = '🟡 ACHTUNG - ABBREMSEN!';
      textColor = '#F59E0B';
    } else if (this.lightState === 'RED') {
      borderColor = '#EF4444';
      statusText = '🔴 ROTES LICHT - NICHT BEWEGEN!';
      textColor = '#EF4444';
    }

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${statusText} [${Math.ceil(this.timeRemaining)}s]`, this.width / 2, py + panelH / 2);

    ctx.restore();
  }
}

window.RedLightGreenLightMinigame = RedLightGreenLightMinigame;
