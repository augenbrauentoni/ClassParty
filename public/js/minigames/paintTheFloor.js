// Minigame 9: Gebiete färben (Paint the Floor)
class PaintTheFloorMinigame extends MinigameBase {
  constructor(canvas, players, options = {}) {
    super(canvas, players, options);
    this.totalDuration = 30;
    this.timeRemaining = this.totalDuration;
    this.cols = 16;
    this.rows = 12;
    this.grid = [];
    this.powerups = [];
    this.powerupTimer = 5.0;
  }

  setupArena() {
    this.timeRemaining = this.totalDuration;
    this.powerups = [];
    this.powerupTimer = 4.0;

    // Grid coordinates
    const gridW = 860;
    const gridH = 520;
    const startX = (this.width - gridW) / 2;
    const startY = 85;
    const tileW = gridW / this.cols;
    const tileH = gridH / this.rows;

    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.grid.push({
          row: r,
          col: c,
          x: startX + c * tileW,
          y: startY + r * tileH,
          w: tileW,
          h: tileH,
          owner: null,
          color: '#334155' // Neutral gray
        });
      }
    }

    // 4 Players start in 4 corners
    const corners = [
      { x: startX + 50, y: startY + 45 },
      { x: startX + gridW - 50, y: startY + 45 },
      { x: startX + 50, y: startY + gridH - 45 },
      { x: startX + gridW - 50, y: startY + gridH - 45 }
    ];

    this.players.forEach((p, i) => {
      p.x = corners[i].x;
      p.y = corners[i].y;
      p.vx = 0;
      p.vy = 0;
      p.alive = true;
      p.paintedCount = 0;
      p.score = 0;
    });

    this.updateTileCounts();
  }

  update(dt) {
    if (!this.isRunning) return;

    this.timeRemaining -= dt;
    if (this.timeRemaining <= 0) {
      this.resolveMatch();
      return;
    }

    // Powerup Spawner (every ~7s)
    this.powerupTimer -= dt;
    if (this.powerupTimer <= 0) {
      this.powerupTimer = 7.0;
      this.spawnPaintBomb();
    }

    // Update Players
    this.players.forEach((p, idx) => {
      // Bot AI
      if (p.type === 'bot') {
        window.BotController.updatePaintTheFloorBot(p, idx, this.grid, this.powerups, dt);
      }

      // Movement
      const speed = 235;
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

      p.vx = mx * speed;
      p.vy = my * speed;

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Arena bounds
      p.x = Math.max(90, Math.min(this.width - 90, p.x));
      p.y = Math.max(105, Math.min(this.height - 70, p.y));

      // Paint tile under player's roller
      const currentTile = this.grid.find(t =>
        p.x >= t.x && p.x <= t.x + t.w &&
        p.y >= t.y && p.y <= t.y + t.h
      );

      if (currentTile && currentTile.owner !== idx) {
        currentTile.owner = idx;
        currentTile.color = p.color;

        // Splat particles
        if (Math.random() < 0.25) {
          this.spawnParticles(p.x, p.y, p.color, 4, 40, 0.2);
          if (window.soundEngine && Math.random() < 0.15) {
            window.soundEngine.playPaintSplash();
          }
        }
      }

      // Check powerup collection
      for (let i = this.powerups.length - 1; i >= 0; i--) {
        const bomb = this.powerups[i];
        const dist = Math.hypot(p.x - bomb.x, p.y - bomb.y);
        if (dist < 32) {
          this.triggerPaintBomb(p, idx, bomb.x, bomb.y);
          this.powerups.splice(i, 1);
        }
      }
    });

    // Player vs Player Bumping
    for (let i = 0; i < this.players.length; i++) {
      for (let j = i + 1; j < this.players.length; j++) {
        const p1 = this.players[i];
        const p2 = this.players[j];
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const minDist = 34;

        if (dist < minDist && dist > 0) {
          const overlap = (minDist - dist) / 2;
          const nx = (p2.x - p1.x) / dist;
          const ny = (p2.y - p1.y) / dist;

          p1.x -= nx * overlap * 1.6;
          p1.y -= ny * overlap * 1.6;
          p2.x += nx * overlap * 1.6;
          p2.y += ny * overlap * 1.6;

          if (Math.random() < 0.1 && window.soundEngine) {
            window.soundEngine.playHit();
          }
        }
      }
    }

    this.updateTileCounts();
    this.updateParticles(dt);
  }

  spawnPaintBomb() {
    if (this.powerups.length >= 2) return;

    // Pick random position within grid
    const targetTile = this.grid[Math.floor(Math.random() * this.grid.length)];
    this.powerups.push({
      x: targetTile.x + targetTile.w / 2,
      y: targetTile.y + targetTile.h / 2,
      pulse: 0
    });

    if (window.soundEngine) window.soundEngine.playStar();
  }

  triggerPaintBomb(player, playerIdx, cx, cy) {
    if (window.soundEngine) window.soundEngine.playPaintSplash();

    // 3x3 blast area around bomb
    const blastRadius = 90;
    this.grid.forEach(tile => {
      const dist = Math.hypot((tile.x + tile.w / 2) - cx, (tile.y + tile.h / 2) - cy);
      if (dist < blastRadius) {
        tile.owner = playerIdx;
        tile.color = player.color;
      }
    });

    this.spawnParticles(cx, cy, player.color, 35, 180, 0.7);
    this.spawnParticles(cx, cy, '#FEF08A', 20, 140, 0.5);
  }

  updateTileCounts() {
    // Count tiles for each player
    const counts = [0, 0, 0, 0];
    this.grid.forEach(t => {
      if (t.owner !== null && counts[t.owner] !== undefined) {
        counts[t.owner]++;
      }
    });

    this.players.forEach((p, i) => {
      p.paintedCount = counts[i];
      p.score = counts[i];
    });
  }

  resolveMatch() {
    // Rank players by paintedCount descending
    const sorted = [...this.players]
      .map((p, idx) => ({ idx, count: p.paintedCount }))
      .sort((a, b) => b.count - a.count);

    const rankings = sorted.map(s => s.idx);
    this.finishGame(rankings);
  }

  render(ctx) {
    ctx.clearRect(0, 0, this.width, this.height);

    // Arena Floor
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw Floor Grid
    this.grid.forEach(tile => {
      // Tile background
      ctx.fillStyle = tile.color;
      ctx.fillRect(tile.x + 1, tile.y + 1, tile.w - 2, tile.h - 2);

      // Subtle tile border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(tile.x + 1, tile.y + 1, tile.w - 2, tile.h - 2);
    });

    // Outer grid border
    const gridW = 860;
    const gridH = 520;
    const startX = (this.width - gridW) / 2;
    const startY = 85;
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 4;
    ctx.strokeRect(startX, startY, gridW, gridH);

    // Draw Power-Ups (Farbbomben)
    this.powerups.forEach(bomb => {
      const pulse = 1 + Math.sin(performance.now() * 0.008) * 0.15;
      ctx.save();
      ctx.translate(bomb.x, bomb.y);
      ctx.scale(pulse, pulse);

      // Glowing aura
      ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();

      // Bomb icon
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎨', 0, 1);

      ctx.restore();
    });

    // Draw Players
    this.players.forEach(p => {
      this.drawPlayer(ctx, p);

      // Paint Roller attached to player
      ctx.save();
      ctx.translate(p.x, p.y + 14);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.roundRect(-10, -4, 20, 8, 3);
      ctx.fill();
      ctx.strokeStyle = p.colorDark || '#000';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    });

    // Render Particles
    this.renderParticles(ctx);

    // Live HUD & Floor Share Bar
    this.drawHUD(ctx);
  }

  drawHUD(ctx) {
    ctx.save();

    // Top Share Bar
    const totalTiles = this.grid.length;
    const barW = 600;
    const barH = 16;
    const barX = (this.width - barW) / 2;
    const barY = 22;

    // Bar container
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);

    let curX = barX;
    this.players.forEach(p => {
      const share = p.paintedCount / totalTiles;
      const w = barW * share;
      if (w > 0) {
        ctx.fillStyle = p.color;
        ctx.fillRect(curX, barY, w, barH);
        curX += w;
      }
    });

    // Percentage & Tile Counts
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const pPills = this.players.map((p, i) => `${p.name}: ${p.paintedCount} 🎨`).join('   |   ');
    ctx.fillStyle = '#E2E8F0';
    ctx.fillText(pPills, this.width / 2, barY + 32);

    // Timer pill
    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`⏱️ ${Math.ceil(this.timeRemaining)}s`, 45, 34);

    ctx.restore();
  }
}

window.PaintTheFloorMinigame = PaintTheFloorMinigame;
