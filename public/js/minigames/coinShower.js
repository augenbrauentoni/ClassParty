// Minigame 3: Coin Shower (Münzregen)
class CoinShowerMinigame extends MinigameBase {
  constructor(canvas, players, options = {}) {
    super(canvas, players, options);
    this.totalDuration = 30;
    this.timeRemaining = this.totalDuration;
    this.items = [];
    this.spawnTimer = 0;
    this.floaters = [];
  }

  setupArena() {
    const spawns = [
      { x: 250, y: 200 },
      { x: 750, y: 200 },
      { x: 250, y: 460 },
      { x: 750, y: 460 }
    ];

    this.players.forEach((p, i) => {
      p.x = spawns[i].x;
      p.y = spawns[i].y;
      p.alive = true;
      p.score = 0;
      p.stunTimer = 0;
    });

    this.items = [];
    this.floaters = [];
    this.spawnTimer = 0.3;
  }

  update(dt) {
    if (!this.isRunning) return;

    this.timeRemaining -= dt;
    if (this.timeRemaining <= 0) {
      this.resolveMatch();
      return;
    }

    // Spawn falling items
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 0.45;
      this.spawnItem();
    }

    // Update Items (falling and ground lifetime)
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      if (it.falling) {
        it.altitude -= dt * 320;
        if (it.altitude <= 0) {
          it.altitude = 0;
          it.falling = false;
        }
      } else {
        it.lifetime -= dt;
        if (it.lifetime <= 0) {
          this.items.splice(i, 1);
          continue;
        }
      }
    }

    // Update Players
    this.players.forEach((p, idx) => {
      p.stunTimer = Math.max(0, p.stunTimer - dt);

      // Bot AI
      if (p.type === 'bot' && p.stunTimer <= 0) {
        this.updateBotAI(p);
      }

      if (p.stunTimer > 0) {
        p.vx = 0;
        p.vy = 0;
        return;
      }

      const speed = 230;
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

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Arena bounds
      p.x = Math.max(30, Math.min(this.width - 30, p.x));
      p.y = Math.max(70, Math.min(this.height - 30, p.y));

      // Check item pickup
      for (let i = this.items.length - 1; i >= 0; i--) {
        const it = this.items[i];
        if (it.falling && it.altitude > 25) continue; // Not reachable yet

        const dist = Math.hypot(p.x - it.x, p.y - it.y);
        if (dist < 26) {
          this.collectItem(p, it);
          this.items.splice(i, 1);
        }
      }
    });

    // Update floating texts
    for (let i = this.floaters.length - 1; i >= 0; i--) {
      const f = this.floaters[i];
      f.y -= dt * 45;
      f.life -= dt;
      if (f.life <= 0) {
        this.floaters.splice(i, 1);
      }
    }

    this.updateParticles(dt);
  }

  spawnItem() {
    if (this.items.length >= 25) return;

    const roll = Math.random();
    let type = 'coin';
    let value = 1;

    if (roll < 0.15) {
      type = 'bag'; // Gold bag
      value = 5;
    } else if (roll < 0.35) {
      type = 'hazard'; // Spiky bomb
      value = -3;
    } else if (roll < 0.6) {
      type = 'gold_coin';
      value = 2;
    }

    const x = Math.random() * (this.width - 120) + 60;
    const y = Math.random() * (this.height - 180) + 110;

    this.items.push({
      x,
      y,
      altitude: 180,
      falling: true,
      type,
      value,
      lifetime: 8
    });
  }

  collectItem(player, item) {
    if (item.type === 'hazard') {
      player.score = Math.max(0, player.score + item.value);
      player.stunTimer = 1.0;
      this.spawnParticles(player.x, player.y, '#EF4444', 18, 140, 0.6);
      this.addFloater(player.x, player.y - 20, '-3 💥', '#EF4444');
      if (window.soundEngine) window.soundEngine.playCoinLoss();
    } else {
      player.score += item.value;
      const color = item.type === 'bag' ? '#F59E0B' : '#FDE047';
      this.spawnParticles(item.x, item.y, color, item.value * 4, 100, 0.4);
      this.addFloater(player.x, player.y - 20, `+${item.value}`, color);
      if (window.soundEngine) {
        if (item.type === 'bag') window.soundEngine.playStar();
        else window.soundEngine.playCoin();
      }
    }
  }

  addFloater(x, y, text, color) {
    this.floaters.push({
      x,
      y,
      text,
      color,
      life: 0.8
    });
  }

  updateBotAI(bot) {
    // Find best target on ground
    let bestTarget = null;
    let bestScore = -Infinity;

    this.items.forEach(it => {
      if (it.type === 'hazard') return; // Don't pick hazards!

      const dist = Math.hypot(it.x - bot.x, it.y - bot.y);
      const score = (it.value * 120) - dist;
      if (score > bestScore) {
        bestScore = score;
        bestTarget = it;
      }
    });

    // Avoid nearby hazard
    let avoidX = 0;
    let avoidY = 0;
    this.items.forEach(it => {
      if (it.type !== 'hazard') return;
      const dist = Math.hypot(it.x - bot.x, it.y - bot.y);
      if (dist < 60) {
        avoidX += (bot.x - it.x) * 2;
        avoidY += (bot.y - it.y) * 2;
      }
    });

    if (avoidX !== 0 || avoidY !== 0) {
      bot.inputs.left = avoidX < -5;
      bot.inputs.right = avoidX > 5;
      bot.inputs.up = avoidY < -5;
      bot.inputs.down = avoidY > 5;
    } else if (bestTarget) {
      bot.inputs.left = bestTarget.x < bot.x - 8;
      bot.inputs.right = bestTarget.x > bot.x + 8;
      bot.inputs.up = bestTarget.y < bot.y - 8;
      bot.inputs.down = bestTarget.y > bot.y + 8;
    } else {
      bot.inputs.left = false;
      bot.inputs.right = false;
      bot.inputs.up = false;
      bot.inputs.down = false;
    }
  }

  resolveMatch() {
    // Rank players by score descending
    const sorted = [...this.players]
      .map((p, idx) => ({ idx, score: p.score }))
      .sort((a, b) => b.score - a.score);

    const rankings = sorted.map(s => s.idx);
    this.finishGame(rankings);
  }

  render(ctx) {
    ctx.clearRect(0, 0, this.width, this.height);

    // Arena Floor
    const grad = ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, '#064E3B');
    grad.addColorStop(1, '#022C22');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Decorative grid tiles
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
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

    // Arena Border
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, this.width - 12, this.height - 12);

    // Draw Items
    this.items.forEach(it => {
      // Ground shadow
      const shadowScale = Math.max(0.2, 1 - (it.altitude / 200));
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(it.x, it.y + 4, 12 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Render Item at altitude
      const drawY = it.y - it.altitude;
      ctx.save();
      ctx.translate(it.x, drawY);

      if (it.type === 'bag') {
        // Gold treasure bag
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#B45309';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#EF4444';
        ctx.fillRect(-6, -14, 12, 4);

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💰', 0, 4);
      } else if (it.type === 'hazard') {
        // Spiky bomb
        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💣', 0, 4);
      } else {
        // Coin
        const isGold = it.type === 'gold_coin';
        ctx.fillStyle = isGold ? '#F59E0B' : '#EAB308';
        ctx.beginPath();
        ctx.arc(0, 0, isGold ? 12 : 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#CA8A04';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#FEF08A';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(it.value, 0, 3);
      }

      ctx.restore();
    });

    // Draw Players
    this.players.forEach(p => {
      this.drawPlayer(ctx, p);

      // Draw Player Score Bubble
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.beginPath();
      ctx.roundRect(p.x - 24, p.y - 42, 48, 18, 6);
      ctx.fill();

      ctx.fillStyle = '#FDE047';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🪙 ${p.score}`, p.x, p.y - 29);

      // Stun stars if stunned
      if (p.stunTimer > 0) {
        ctx.fillStyle = '#EF4444';
        ctx.font = '14px sans-serif';
        ctx.fillText('💫', p.x, p.y - 46);
      }
      ctx.restore();
    });

    // Draw Floaters
    this.floaters.forEach(f => {
      ctx.save();
      ctx.fillStyle = f.color;
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    });

    // Render Particles
    this.renderParticles(ctx);

    // HUD: Timer
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(this.width / 2 - 110, 16, 220, 38);
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.width / 2 - 110, 16, 220, 38);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`⏳ ZEIT: ${Math.ceil(this.timeRemaining)}s`, this.width / 2, 41);
    ctx.restore();
  }
}

window.CoinShowerMinigame = CoinShowerMinigame;
