// Minigame 2: Meteor Dodge (Ausweichen)
class MeteorDodgeMinigame extends MinigameBase {
  constructor(canvas, players, options = {}) {
    super(canvas, players, options);
    this.totalDuration = 30;
    this.timeRemaining = this.totalDuration;
    this.meteors = [];
    this.spawnTimer = 0;
    this.eliminated = [];
    this.groundY = 560;
  }

  setupArena() {
    const spacing = this.width / 5;
    this.players.forEach((p, i) => {
      p.x = spacing * (i + 1);
      p.y = this.groundY;
      p.alive = true;
      p.score = 0;
      p.dashCooldown = 0;
      p.isDashing = false;
      p.dashTimer = 0;
    });
    this.meteors = [];
    this.eliminated = [];
    this.spawnTimer = 0.5;
  }

  update(dt) {
    if (!this.isRunning) return;

    this.timeRemaining -= dt;
    if (this.timeRemaining <= 0) {
      this.resolveMatch();
      return;
    }

    // Meteor Spawner: rate increases as time elapses
    const progress = 1 - (this.timeRemaining / this.totalDuration); // 0 -> 1
    const spawnInterval = Math.max(0.35, 1.4 - progress * 1.0);

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = spawnInterval;
      this.spawnMeteor(progress);
    }

    // Update Meteors
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.progress += dt / m.fallDuration;

      // Trailing sparks
      if (Math.random() < 0.6) {
        this.spawnParticles(m.targetX + (Math.random() - 0.5) * 20, m.y, '#F97316', 2, 40, 0.2);
      }

      m.y = m.startY + (m.targetY - m.startY) * m.progress;

      // Impact!
      if (m.progress >= 1) {
        this.handleMeteorImpact(m);
        this.meteors.splice(i, 1);
      }
    }

    // Update Players
    this.players.forEach((p, idx) => {
      if (!p.alive) return;

      p.dashCooldown = Math.max(0, p.dashCooldown - dt);
      if (p.isDashing) {
        p.dashTimer -= dt;
        if (p.dashTimer <= 0) p.isDashing = false;
      }

      // Bot AI
      if (p.type === 'bot') {
        this.updateBotAI(p, dt);
      }

      // Action: Dash
      if (p.inputs.action && p.dashCooldown <= 0 && !p.isDashing) {
        p.isDashing = true;
        p.dashTimer = 0.22;
        p.dashCooldown = 1.3;
        const dir = p.inputs.left ? -1 : (p.inputs.right ? 1 : (Math.random() < 0.5 ? -1 : 1));
        p.dashDir = dir;
        this.spawnParticles(p.x, p.y, p.color || '#3B82F6', 8, 80, 0.25);
        if (window.soundEngine) window.soundEngine.playStep();
      }

      let speed = 250;
      if (p.isDashing) {
        speed = 520;
        p.vx = (p.dashDir || 1) * speed;
      } else {
        let dir = 0;
        if (p.inputs.left) dir -= 1;
        if (p.inputs.right) dir += 1;
        p.vx = dir * speed;
      }

      p.x += p.vx * dt;
      // Boundaries
      p.x = Math.max(35, Math.min(this.width - 35, p.x));
    });

    this.updateParticles(dt);

    // End match if everyone is eliminated
    const aliveCount = this.players.filter(p => p.alive).length;
    if (aliveCount === 0) {
      this.resolveMatch();
    }
  }

  spawnMeteor(progress) {
    const targetX = Math.random() * (this.width - 120) + 60;
    const fallDuration = Math.max(0.75, 1.6 - progress * 0.7);
    const radius = 34 + Math.random() * 12;

    this.meteors.push({
      targetX,
      targetY: this.groundY,
      startY: -40,
      y: -40,
      progress: 0,
      fallDuration,
      radius
    });
  }

  handleMeteorImpact(m) {
    if (window.soundEngine) {
      window.soundEngine.playExplosion();
    }

    // Explosion shockwave & sparks
    this.spawnParticles(m.targetX, m.targetY, '#EF4444', 28, 220, 0.8);
    this.spawnParticles(m.targetX, m.targetY, '#F59E0B', 20, 160, 0.6);
    this.spawnParticles(m.targetX, m.targetY, '#78716C', 15, 110, 0.5);

    // Check hit players
    this.players.forEach((p, idx) => {
      if (!p.alive || p.isDashing) return;

      const dist = Math.abs(p.x - m.targetX);
      if (dist < m.radius + 14) {
        p.alive = false;
        this.eliminated.push(idx);
        this.spawnParticles(p.x, p.y, p.color, 25, 180, 0.8);
        if (window.soundEngine) window.soundEngine.playHit();
      }
    });
  }

  updateBotAI(bot, dt) {
    // Find closest threatening meteor
    let dangerMeteor = null;
    let minTimeToHit = Infinity;

    this.meteors.forEach(m => {
      const dist = Math.abs(m.targetX - bot.x);
      const timeToHit = (1 - m.progress) * m.fallDuration;
      if (dist < m.radius + 35 && timeToHit < 1.1) {
        if (timeToHit < minTimeToHit) {
          minTimeToHit = timeToHit;
          dangerMeteor = m;
        }
      }
    });

    if (dangerMeteor) {
      // Escape direction
      const runLeft = dangerMeteor.targetX > bot.x;
      bot.inputs.left = runLeft && bot.x > 50;
      bot.inputs.right = !runLeft && bot.x < this.width - 50;

      // Emergency dash
      if (minTimeToHit < 0.35 && bot.dashCooldown <= 0) {
        bot.inputs.action = true;
      } else {
        bot.inputs.action = false;
      }
    } else {
      // Return towards center if too close to edges
      bot.inputs.action = false;
      if (bot.x < 120) {
        bot.inputs.left = false;
        bot.inputs.right = true;
      } else if (bot.x > this.width - 120) {
        bot.inputs.left = true;
        bot.inputs.right = false;
      } else {
        bot.inputs.left = false;
        bot.inputs.right = false;
      }
    }
  }

  resolveMatch() {
    // Surviving players get top ranks
    let rankings = [];
    this.players.forEach((p, i) => {
      if (p.alive) rankings.push(i);
    });

    // Append eliminated in reverse (last eliminated = higher rank)
    for (let i = this.eliminated.length - 1; i >= 0; i--) {
      if (!rankings.includes(this.eliminated[i])) {
        rankings.push(this.eliminated[i]);
      }
    }

    // Fallback fill
    for (let i = 0; i < this.players.length; i++) {
      if (!rankings.includes(i)) rankings.push(i);
    }

    this.finishGame(rankings);
  }

  render(ctx) {
    ctx.clearRect(0, 0, this.width, this.height);

    // Volcanic Night Sky Background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    skyGrad.addColorStop(0, '#1E1B4B');
    skyGrad.addColorStop(0.6, '#450A0A');
    skyGrad.addColorStop(1, '#1C1917');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Stars / embers in background
    ctx.fillStyle = 'rgba(254, 215, 170, 0.4)';
    for (let i = 0; i < 20; i++) {
      const sx = (i * 53 + performance.now() * 0.02) % this.width;
      const sy = (i * 37) % (this.groundY - 100);
      ctx.fillRect(sx, sy, 2, 2);
    }

    // Ground platform
    ctx.fillStyle = '#292524';
    ctx.fillRect(0, this.groundY + 18, this.width, this.height - (this.groundY + 18));
    ctx.fillStyle = '#78350F';
    ctx.fillRect(0, this.groundY + 15, this.width, 5);

    // Draw Meteor Target Indicators on ground
    this.meteors.forEach(m => {
      const alpha = Math.min(1, m.progress * 1.4);
      const currentRadius = m.radius * (0.3 + 0.7 * m.progress);

      // Warning ring
      ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(m.targetX, this.groundY + 14, currentRadius, currentRadius * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Warning fill
      ctx.fillStyle = `rgba(249, 115, 22, ${alpha * 0.35})`;
      ctx.beginPath();
      ctx.ellipse(m.targetX, this.groundY + 14, currentRadius, currentRadius * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Crosshair exclamation mark
      if (m.progress > 0.4) {
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️', m.targetX, this.groundY - 15);
      }
    });

    // Draw Falling Meteors
    this.meteors.forEach(m => {
      ctx.save();
      // Fiery trail
      const trailGrad = ctx.createLinearGradient(m.targetX, m.y - 60, m.targetX, m.y);
      trailGrad.addColorStop(0, 'rgba(239, 68, 68, 0)');
      trailGrad.addColorStop(1, 'rgba(249, 115, 22, 0.9)');
      ctx.fillStyle = trailGrad;
      ctx.beginPath();
      ctx.moveTo(m.targetX - 16, m.y);
      ctx.lineTo(m.targetX, m.y - 75);
      ctx.lineTo(m.targetX + 16, m.y);
      ctx.closePath();
      ctx.fill();

      // Meteor stone
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.arc(m.targetX, m.y, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#EA580C';
      ctx.beginPath();
      ctx.arc(m.targetX - 3, m.y - 3, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw Players
    this.players.forEach(p => {
      this.drawPlayer(ctx, p);
      // Cooldown bar above player
      if (p.alive && p.dashCooldown > 0) {
        const barW = 24;
        const left = p.x - barW / 2;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(left, p.y - 32, barW, 4);
        ctx.fillStyle = '#38BDF8';
        ctx.fillRect(left, p.y - 32, barW * (1 - p.dashCooldown / 1.3), 4);
      }
    });

    // Render Particles
    this.renderParticles(ctx);

    // HUD: Timer
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(this.width / 2 - 120, 20, 240, 42);
    ctx.strokeStyle = '#F97316';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.width / 2 - 120, 20, 240, 42);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`⏱️ ÜBERLEBE: ${Math.ceil(this.timeRemaining)}s`, this.width / 2, 47);
    ctx.restore();
  }
}

window.MeteorDodgeMinigame = MeteorDodgeMinigame;
