// Minigame 1: Bomb Tag (Heiße Kartoffel)
class BombTagMinigame extends MinigameBase {
  constructor(canvas, players, options = {}) {
    super(canvas, players, options);
    this.roundDuration = 15;
    this.fuseTime = this.roundDuration;
    this.bombHolderIndex = 0;
    this.tagCooldown = 0;
    this.eliminated = [];
    this.obstacles = [
      { x: 300, y: 220, r: 35 },
      { x: 700, y: 220, r: 35 },
      { x: 300, y: 430, r: 35 },
      { x: 700, y: 430, r: 35 }
    ];
    this.tickTimer = 0;
  }

  setupArena() {
    // Position 4 players in 4 corners of arena
    const spawns = [
      { x: 180, y: 150 },
      { x: 820, y: 150 },
      { x: 180, y: 500 },
      { x: 820, y: 500 }
    ];

    this.players.forEach((p, i) => {
      p.x = spawns[i].x;
      p.y = spawns[i].y;
      p.alive = true;
      p.score = 0;
    });

    this.eliminated = [];
    this.startNewBombRound();
  }

  startNewBombRound() {
    const alivePlayers = this.players.filter(p => p.alive);
    if (alivePlayers.length <= 1) {
      this.resolveMatch();
      return;
    }

    // Pick random alive player to hold bomb
    const chosen = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
    this.bombHolderIndex = this.players.indexOf(chosen);
    this.fuseTime = this.roundDuration;
    this.tagCooldown = 1.0; // Grace period at start
  }

  update(dt) {
    if (!this.isRunning) return;

    this.fuseTime -= dt;
    this.tagCooldown = Math.max(0, this.tagCooldown - dt);

    // Audio ticking sound speeding up
    this.tickTimer += dt;
    const tickInterval = Math.max(0.12, (this.fuseTime / this.roundDuration) * 0.8);
    if (this.tickTimer >= tickInterval) {
      this.tickTimer = 0;
      if (window.soundEngine) {
        const pitchScale = 1.0 + (1 - this.fuseTime / this.roundDuration) * 1.5;
        window.soundEngine.playBombTick(pitchScale);
      }
    }

    // Check fuse expiration
    if (this.fuseTime <= 0) {
      this.handleExplosion();
      return;
    }

    // Update players
    this.players.forEach((p, idx) => {
      if (!p.alive) return;

      // Handle Bot AI
      if (p.type === 'bot') {
        this.updateBotAI(p, idx);
      }

      // Movement physics
      const isCarrier = idx === this.bombHolderIndex;
      const speed = isCarrier ? 240 : 205; // Carrier has speed boost to catch up

      let moveX = 0;
      let moveY = 0;
      if (p.inputs.left) moveX -= 1;
      if (p.inputs.right) moveX += 1;
      if (p.inputs.up) moveY -= 1;
      if (p.inputs.down) moveY += 1;

      if (moveX !== 0 && moveY !== 0) {
        const len = Math.hypot(moveX, moveY);
        moveX /= len;
        moveY /= len;
      }

      p.vx = moveX * speed;
      p.vy = moveY * speed;

      let nextX = p.x + p.vx * dt;
      let nextY = p.y + p.vy * dt;

      // Arena bounds collision
      const radius = 18;
      nextX = Math.max(radius + 20, Math.min(this.width - radius - 20, nextX));
      nextY = Math.max(radius + 20, Math.min(this.height - radius - 20, nextY));

      // Obstacle collisions
      this.obstacles.forEach(obs => {
        const dist = Math.hypot(nextX - obs.x, nextY - obs.y);
        const minDist = obs.r + radius;
        if (dist < minDist) {
          const angle = Math.atan2(nextY - obs.y, nextX - obs.x);
          nextX = obs.x + Math.cos(angle) * minDist;
          nextY = obs.y + Math.sin(angle) * minDist;
        }
      });

      p.x = nextX;
      p.y = nextY;
    });

    // Tag detection
    if (this.tagCooldown <= 0) {
      const carrier = this.players[this.bombHolderIndex];
      if (carrier && carrier.alive) {
        for (let i = 0; i < this.players.length; i++) {
          if (i === this.bombHolderIndex) continue;
          const other = this.players[i];
          if (!other.alive) continue;

          const dist = Math.hypot(carrier.x - other.x, carrier.y - other.y);
          if (dist < 36) {
            // Tagged!
            this.bombHolderIndex = i;
            this.tagCooldown = 0.8;
            if (window.soundEngine) {
              window.soundEngine.playHit();
            }
            this.spawnParticles((carrier.x + other.x) / 2, (carrier.y + other.y) / 2, '#F59E0B', 12, 100);
            break;
          }
        }
      }
    }

    this.updateParticles(dt);
  }

  updateBotAI(bot, idx) {
    const isCarrier = idx === this.bombHolderIndex;
    const carrier = this.players[this.bombHolderIndex];

    if (isCarrier) {
      // Hunt nearest alive player
      let target = null;
      let minDist = Infinity;
      this.players.forEach((p, i) => {
        if (i === idx || !p.alive) return;
        const d = Math.hypot(p.x - bot.x, p.y - bot.y);
        if (d < minDist) {
          minDist = d;
          target = p;
        }
      });

      if (target) {
        bot.inputs.left = target.x < bot.x - 5;
        bot.inputs.right = target.x > bot.x + 5;
        bot.inputs.up = target.y < bot.y - 5;
        bot.inputs.down = target.y > bot.y + 5;
      }
    } else if (carrier && carrier.alive) {
      // Flee from carrier!
      const dist = Math.hypot(carrier.x - bot.x, carrier.y - bot.y);
      if (dist < 260) {
        bot.inputs.left = carrier.x > bot.x;
        bot.inputs.right = carrier.x < bot.x;
        bot.inputs.up = carrier.y > bot.y;
        bot.inputs.down = carrier.y < bot.y;
      } else {
        // Idle wander away from walls
        bot.inputs.left = bot.x > this.width - 150;
        bot.inputs.right = bot.x < 150;
        bot.inputs.up = bot.y > this.height - 150;
        bot.inputs.down = bot.y < 150;
      }
    }
  }

  handleExplosion() {
    const carrier = this.players[this.bombHolderIndex];
    if (carrier) {
      carrier.alive = false;
      this.eliminated.push(this.bombHolderIndex);

      if (window.soundEngine) {
        window.soundEngine.playExplosion();
      }
      this.spawnParticles(carrier.x, carrier.y, '#EF4444', 35, 200, 0.9);
      this.spawnParticles(carrier.x, carrier.y, '#F59E0B', 25, 140, 0.7);
    }

    const aliveCount = this.players.filter(p => p.alive).length;
    if (aliveCount <= 1) {
      setTimeout(() => this.resolveMatch(), 1200);
    } else {
      setTimeout(() => this.startNewBombRound(), 1200);
    }
  }

  resolveMatch() {
    // Winner is last alive or first not eliminated
    const alive = this.players.map((p, i) => ({ alive: p.alive, idx: i })).filter(p => p.alive);
    let rankings = [];

    if (alive.length === 1) {
      rankings.push(alive[0].idx);
    }
    // Reverse eliminated list (last eliminated is 2nd place, first is 4th)
    for (let i = this.eliminated.length - 1; i >= 0; i--) {
      if (!rankings.includes(this.eliminated[i])) {
        rankings.push(this.eliminated[i]);
      }
    }
    // Any remaining
    for (let i = 0; i < this.players.length; i++) {
      if (!rankings.includes(i)) rankings.push(i);
    }

    this.finishGame(rankings);
  }

  render(ctx) {
    ctx.clearRect(0, 0, this.width, this.height);

    // Arena Floor
    const grad = ctx.createRadialGradient(this.width / 2, this.height / 2, 50, this.width / 2, this.height / 2, 550);
    grad.addColorStop(0, '#1E293B');
    grad.addColorStop(1, '#0F172A');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Arena border
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, this.width - 20, this.height - 20);

    // Danger border warning when bomb about to explode
    if (this.fuseTime < 4) {
      const alpha = Math.abs(Math.sin(performance.now() * 0.015)) * 0.4;
      ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // Draw Obstacles (Pillars)
    this.obstacles.forEach(obs => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.arc(obs.x, obs.y + 6, obs.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(obs.x, obs.y, obs.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#64748B';
      ctx.beginPath();
      ctx.arc(obs.x, obs.y - 4, obs.r - 8, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Players
    this.players.forEach((p, idx) => {
      this.drawPlayer(ctx, p);
    });

    // Draw Bomb on carrier
    const carrier = this.players[this.bombHolderIndex];
    if (carrier && carrier.alive) {
      this.drawBomb(ctx, carrier.x, carrier.y - 32, this.fuseTime);
    }

    // Particles
    this.renderParticles(ctx);

    // HUD: Timer & remaining players
    this.drawHUD(ctx);
  }

  drawBomb(ctx, x, y, timeLeft) {
    const pulse = 1.0 + Math.sin(performance.now() * (0.01 + (15 - timeLeft) * 0.003)) * 0.15;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(pulse, pulse);

    // Bomb body
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Cap & burning fuse
    ctx.fillStyle = '#6B7280';
    ctx.fillRect(-4, -20, 8, 5);

    // Sparkle
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(0, -23, 4, 0, Math.PI * 2);
    ctx.fill();

    // Seconds display
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.max(0, Math.ceil(timeLeft))}`, 0, 0);

    ctx.restore();
  }

  drawHUD(ctx) {
    ctx.save();
    // Fuse timer bar at top
    const barWidth = 360;
    const barHeight = 16;
    const barX = (this.width - barWidth) / 2;
    const barY = 24;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(barX - 4, barY - 4, barWidth + 8, barHeight + 8);

    const ratio = Math.max(0, this.fuseTime / this.roundDuration);
    const grad = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
    grad.addColorStop(0, '#EF4444');
    grad.addColorStop(0.5, '#F59E0B');
    grad.addColorStop(1, '#10B981');
    ctx.fillStyle = grad;
    ctx.fillRect(barX, barY, barWidth * ratio, barHeight);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`💣 BOMBE EXPLODIERT IN: ${Math.ceil(this.fuseTime)}s`, this.width / 2, barY + 36);

    ctx.restore();
  }
}

window.BombTagMinigame = BombTagMinigame;
