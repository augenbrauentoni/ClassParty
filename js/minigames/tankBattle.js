// Minigame 7: Panzer-Duell (Tank Battle)
class TankBattleMinigame extends MinigameBase {
  constructor(canvas, players, options = {}) {
    super(canvas, players, options);
    this.totalDuration = 45;
    this.timeRemaining = this.totalDuration;
    this.bullets = [];
    this.obstacles = [];
    this.eliminated = [];
    this.prevShootStates = [false, false, false, false];
  }

  setupArena() {
    this.timeRemaining = this.totalDuration;
    this.bullets = [];
    this.eliminated = [];
    this.prevShootStates = [false, false, false, false];

    // Tank spawns in 4 quadrants
    const spawns = [
      { x: 120, y: 120, angle: 0 },
      { x: 880, y: 120, angle: Math.PI },
      { x: 120, y: 530, angle: 0 },
      { x: 880, y: 530, angle: Math.PI }
    ];

    this.players.forEach((p, i) => {
      p.x = spawns[i].x;
      p.y = spawns[i].y;
      p.angle = spawns[i].angle;
      p.aimX = Math.cos(spawns[i].angle);
      p.aimY = Math.sin(spawns[i].angle);
      p.lives = 3;
      p.alive = true;
      p.shootCooldown = 0;
      p.invulnTimer = 0;
      p.vx = 0;
      p.vy = 0;
    });

    // Arena Obstacles: Stone (indestructible) and Crates (destructible)
    this.obstacles = [
      // Stone central and flanking pillars
      { x: 470, y: 290, w: 60, h: 70, type: 'stone', hp: 999 },
      { x: 260, y: 180, w: 50, h: 50, type: 'stone', hp: 999 },
      { x: 690, y: 180, w: 50, h: 50, type: 'stone', hp: 999 },
      { x: 260, y: 420, w: 50, h: 50, type: 'stone', hp: 999 },
      { x: 690, y: 420, w: 50, h: 50, type: 'stone', hp: 999 },

      // Destructible Wooden Crates
      { x: 470, y: 150, w: 60, h: 45, type: 'crate', hp: 1 },
      { x: 470, y: 450, w: 60, h: 45, type: 'crate', hp: 1 },
      { x: 370, y: 300, w: 45, h: 50, type: 'crate', hp: 1 },
      { x: 585, y: 300, w: 45, h: 50, type: 'crate', hp: 1 },
      { x: 190, y: 300, w: 45, h: 50, type: 'crate', hp: 1 },
      { x: 765, y: 300, w: 45, h: 50, type: 'crate', hp: 1 }
    ];
  }

  update(dt) {
    if (!this.isRunning) return;

    this.timeRemaining -= dt;
    if (this.timeRemaining <= 0) {
      this.resolveMatch();
      return;
    }

    // Update Players
    this.players.forEach((p, idx) => {
      if (!p.alive) return;

      p.shootCooldown = Math.max(0, p.shootCooldown - dt);
      p.invulnTimer = Math.max(0, p.invulnTimer - dt);

      // Bot AI
      if (p.type === 'bot') {
        window.BotController.updateTankBattleBot(p, idx, this.players, this.obstacles, this.bullets, dt);
      }

      // Movement
      const speed = 190;
      let mx = 0;
      let my = 0;
      if (p.inputs.left) mx -= 1;
      if (p.inputs.right) mx += 1;
      if (p.inputs.up) my -= 1;
      if (p.inputs.down) my += 1;

      if (mx !== 0 && my !== 0) {
        const len = Math.hypot(mx, my);
        mx /= len;
        my /= len;
      }

      if (mx !== 0 || my !== 0) {
        p.aimX = mx;
        p.aimY = my;
        p.angle = Math.atan2(my, mx);
      }

      p.vx = mx * speed;
      p.vy = my * speed;

      let nextX = p.x + p.vx * dt;
      let nextY = p.y + p.vy * dt;

      // Arena boundary collision
      const radius = 20;
      nextX = Math.max(radius + 18, Math.min(this.width - radius - 18, nextX));
      nextY = Math.max(radius + 18, Math.min(this.height - radius - 18, nextY));

      // Obstacle collision for tank body
      this.obstacles.forEach(obs => {
        if (obs.hp <= 0) return;
        if (nextX + radius > obs.x && nextX - radius < obs.x + obs.w &&
            nextY + radius > obs.y && nextY - radius < obs.y + obs.h) {
          // Resolve collision simply by sliding
          if (p.x + radius <= obs.x || p.x - radius >= obs.x + obs.w) {
            nextX = p.x;
          }
          if (p.y + radius <= obs.y || p.y - radius >= obs.y + obs.h) {
            nextY = p.y;
          }
        }
      });

      p.x = nextX;
      p.y = nextY;

      // Shooting trigger (edge-triggered)
      let shootRequested = false;
      if (p.type === 'bot') {
        shootRequested = p.inputs.action && p.shootCooldown <= 0;
      } else {
        const isCurrentDown = !!p.inputs.action;
        const wasDown = this.prevShootStates[idx];
        if (isCurrentDown && !wasDown && p.shootCooldown <= 0) {
          shootRequested = true;
        }
        this.prevShootStates[idx] = isCurrentDown;
      }

      if (shootRequested && p.shootCooldown <= 0) {
        this.fireBullet(p, idx);
      }
    });

    // Update Bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;

      if (b.life <= 0) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Check arena wall collision (Ricochet once)
      let bounced = false;
      if (b.x <= 20 || b.x >= this.width - 20) {
        if (b.bounces < 1) {
          b.vx = -b.vx;
          b.bounces++;
          bounced = true;
          b.x = Math.max(22, Math.min(this.width - 22, b.x));
        } else {
          this.spawnParticles(b.x, b.y, '#94A3B8', 6, 60, 0.2);
          this.bullets.splice(i, 1);
          continue;
        }
      }
      if (b.y <= 20 || b.y >= this.height - 20) {
        if (b.bounces < 1) {
          b.vy = -b.vy;
          b.bounces++;
          bounced = true;
          b.y = Math.max(22, Math.min(this.height - 22, b.y));
        } else {
          this.spawnParticles(b.x, b.y, '#94A3B8', 6, 60, 0.2);
          this.bullets.splice(i, 1);
          continue;
        }
      }

      if (bounced) {
        if (window.soundEngine) window.soundEngine.playRicochet();
        this.spawnParticles(b.x, b.y, '#FBBF24', 8, 80, 0.2);
      }

      // Check Obstacle collisions
      let hitObstacle = false;
      for (const obs of this.obstacles) {
        if (obs.hp <= 0) continue;

        if (b.x >= obs.x && b.x <= obs.x + obs.w && b.y >= obs.y && b.y <= obs.y + obs.h) {
          hitObstacle = true;

          if (obs.type === 'crate') {
            // Destructible crate breaks!
            obs.hp -= 1;
            this.spawnParticles(obs.x + obs.w / 2, obs.y + obs.h / 2, '#B45309', 16, 90, 0.5);
            if (window.soundEngine) window.soundEngine.playPlatformBreak();
            this.bullets.splice(i, 1);
            break;
          } else {
            // Stone: Ricochet once!
            if (b.bounces < 1) {
              // Determine collision side
              const distLeft = Math.abs(b.x - obs.x);
              const distRight = Math.abs(b.x - (obs.x + obs.w));
              const distTop = Math.abs(b.y - obs.y);
              const distBottom = Math.abs(b.y - (obs.y + obs.h));
              const minDist = Math.min(distLeft, distRight, distTop, distBottom);

              if (minDist === distLeft || minDist === distRight) b.vx = -b.vx;
              else b.vy = -b.vy;

              b.bounces++;
              if (window.soundEngine) window.soundEngine.playRicochet();
              this.spawnParticles(b.x, b.y, '#FEF08A', 8, 90, 0.25);
              break;
            } else {
              this.spawnParticles(b.x, b.y, '#94A3B8', 8, 70, 0.2);
              this.bullets.splice(i, 1);
              break;
            }
          }
        }
      }
      if (hitObstacle) continue;

      // Check Player Tank hits
      for (let pIdx = 0; pIdx < this.players.length; pIdx++) {
        const target = this.players[pIdx];
        if (!target.alive || target.invulnTimer > 0) continue;

        // Don't hit self immediately on firing
        if (b.ownerIndex === pIdx && b.bounces === 0 && b.life > 3.8) continue;

        const dist = Math.hypot(target.x - b.x, target.y - b.y);
        if (dist < 22) {
          // Hit!
          target.lives -= 1;
          target.invulnTimer = 1.0;

          // Knockback
          target.x += b.vx * 0.04;
          target.y += b.vy * 0.04;

          this.spawnParticles(b.x, b.y, target.color, 15, 120, 0.4);
          if (window.soundEngine) window.soundEngine.playHit();

          if (target.lives <= 0) {
            target.alive = false;
            this.eliminated.push(pIdx);
            if (window.soundEngine) window.soundEngine.playExplosion();
            this.spawnParticles(target.x, target.y, '#EF4444', 30, 200, 0.8);
            this.spawnParticles(target.x, target.y, '#F59E0B', 20, 140, 0.6);
          }

          this.bullets.splice(i, 1);
          break;
        }
      }
    }

    this.updateParticles(dt);

    // End match if 1 or 0 tanks alive
    const aliveTanks = this.players.filter(p => p.alive).length;
    if (aliveTanks <= 1 && this.players.length > 1) {
      setTimeout(() => this.resolveMatch(), 1000);
      this.isRunning = false;
    }
  }

  fireBullet(p, idx) {
    p.shootCooldown = 0.9;

    const barrelLength = 26;
    const startX = p.x + p.aimX * barrelLength;
    const startY = p.y + p.aimY * barrelLength;

    const bulletSpeed = 380;
    this.bullets.push({
      x: startX,
      y: startY,
      vx: p.aimX * bulletSpeed,
      vy: p.aimY * bulletSpeed,
      ownerIndex: idx,
      bounces: 0,
      life: 4.0
    });

    if (window.soundEngine) window.soundEngine.playTankShoot();
    this.spawnParticles(startX, startY, '#FBBF24', 5, 60, 0.15);
  }

  resolveMatch() {
    let rankings = [];

    // Surviving tanks sorted by remaining lives
    const alive = this.players
      .map((p, idx) => ({ idx, lives: p.lives, alive: p.alive }))
      .filter(p => p.alive)
      .sort((a, b) => b.lives - a.lives);

    alive.forEach(a => rankings.push(a.idx));

    // Eliminated tanks in reverse order (last eliminated = higher rank)
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

    // Arena floor
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(0, 0, this.width, this.height);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // Arena walls border
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, this.width - 14, this.height - 14);

    // Draw Obstacles
    this.obstacles.forEach(obs => {
      if (obs.hp <= 0) return;

      if (obs.type === 'stone') {
        // Indestructible stone block
        ctx.fillStyle = '#334155';
        ctx.fillRect(obs.x, obs.y + 4, obs.w, obs.h);
        ctx.fillStyle = '#64748B';
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h - 4);
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x + 2, obs.y + 2, obs.w - 4, obs.h - 8);
      } else {
        // Wooden crate
        ctx.fillStyle = '#78350F';
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
        // Wood crate X cross
        ctx.beginPath();
        ctx.moveTo(obs.x + 2, obs.y + 2);
        ctx.lineTo(obs.x + obs.w - 2, obs.y + obs.h - 2);
        ctx.moveTo(obs.x + obs.w - 2, obs.y + 2);
        ctx.lineTo(obs.x + 2, obs.y + obs.h - 2);
        ctx.stroke();
      }
    });

    // Draw Bullets
    this.bullets.forEach(b => {
      ctx.save();
      ctx.fillStyle = b.bounces === 0 ? '#FBBF24' : '#F97316';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    });

    // Draw Tank Players
    this.players.forEach(p => {
      if (p.alive) {
        this.drawTank(ctx, p);
      }
    });

    // Render Particles
    this.renderParticles(ctx);

    // Top HUD
    this.drawHUD(ctx);
  }

  drawTank(ctx, p) {
    // Blinking if invulnerable
    if (p.invulnTimer > 0 && Math.floor(performance.now() * 0.015) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(p.x, p.y);

    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 6, 20, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rotate with angle
    ctx.rotate(p.angle);

    // Treads
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-18, -17, 36, 7);
    ctx.fillRect(-18, 10, 36, 7);

    // Tank Hull
    ctx.fillStyle = p.color;
    ctx.fillRect(-14, -11, 28, 22);
    ctx.strokeStyle = p.colorDark || '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(-14, -11, 28, 22);

    // Turret Cannon Barrel
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, -3.5, 24, 7);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, -3.5, 24, 7);

    // Turret Dome
    ctx.fillStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // Hearts & Reload bar above tank
    ctx.save();
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    let hearts = '';
    for (let h = 0; h < p.lives; h++) hearts += '❤️';
    ctx.fillText(hearts, p.x, p.y - 28);

    // Reload indicator
    if (p.shootCooldown > 0) {
      const rw = 26;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(p.x - rw / 2, p.y - 22, rw, 3);
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(p.x - rw / 2, p.y - 22, rw * (1 - p.shootCooldown / 0.9), 3);
    }
    ctx.restore();
  }

  drawHUD(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(this.width / 2 - 130, 16, 260, 42);
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.width / 2 - 130, 16, 260, 42);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🛡️ DUELLE: ${Math.ceil(this.timeRemaining)}s`, this.width / 2, 42);
    ctx.restore();
  }
}

window.TankBattleMinigame = TankBattleMinigame;
