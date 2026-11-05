// Minigame 5: Boden-Merkspiel (Memory Tiles)
class MemoryTilesMinigame extends MinigameBase {
  constructor(canvas, players, options = {}) {
    super(canvas, players, options);
    this.totalRounds = 3;
    this.currentRound = 1;
    this.phase = 'MEMORIZE'; // MEMORIZE, HIDE_AND_CALL, REVEAL, ROUND_OVER
    this.phaseTimer = 3.0;
    this.targetSymbol = null;
    this.grid = [];
    this.symbols = [
      { id: 'star', name: 'Stern', icon: '⭐', color: '#FBBF24' },
      { id: 'mushroom', name: 'Pilz', icon: '🍄', color: '#EF4444' },
      { id: 'coin', name: 'Münze', icon: '🪙', color: '#EAB308' },
      { id: 'fire', name: 'Flamme', icon: '🔥', color: '#F97316' }
    ];
  }

  setupArena() {
    this.currentRound = 1;

    // Reset player lives and scores
    this.players.forEach((p, i) => {
      p.lives = 3;
      p.alive = true;
      p.score = 0;
      p.isFalling = false;
      p.fallScale = 1.0;
    });

    this.startRound(1);
  }

  startRound(roundNum) {
    this.currentRound = roundNum;

    // Build 4x4 Grid
    const startX = 250;
    const startY = 110;
    const tileSize = 105;
    const gap = 14;

    // 16 symbols: 4 of each
    const symbolList = [];
    this.symbols.forEach(sym => {
      for (let k = 0; k < 4; k++) symbolList.push(sym);
    });

    // Shuffle symbols
    for (let i = symbolList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [symbolList[i], symbolList[j]] = [symbolList[j], symbolList[i]];
    }

    this.grid = [];
    let idx = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        this.grid.push({
          row: r,
          col: c,
          x: startX + c * (tileSize + gap),
          y: startY + r * (tileSize + gap),
          size: tileSize,
          symbol: symbolList[idx],
          fallen: false,
          shake: 0
        });
        idx++;
      }
    }

    // Position players around the center
    const cornerTiles = [this.grid[0], this.grid[3], this.grid[12], this.grid[15]];
    this.players.forEach((p, i) => {
      if (p.lives > 0) {
        const ct = cornerTiles[i] || this.grid[0];
        p.x = ct.x + ct.size / 2;
        p.y = ct.y + ct.size / 2;
        p.vx = 0;
        p.vy = 0;
        p.isFalling = false;
        p.fallScale = 1.0;
        p.chosenTargetTile = null;
        p.targetRoundSymbol = null;
      }
    });

    // Timing gets faster with each round
    const memorizeDuration = Math.max(1.8, 3.2 - (roundNum - 1) * 0.7);
    this.phase = 'MEMORIZE';
    this.phaseTimer = memorizeDuration;
    this.targetSymbol = null;

    if (window.soundEngine) window.soundEngine.playEvent();
  }

  update(dt) {
    if (!this.isRunning) return;

    this.phaseTimer -= dt;

    // State machine within round
    if (this.phase === 'MEMORIZE') {
      if (this.phaseTimer <= 0) {
        // Transition to HIDE_AND_CALL
        this.phase = 'HIDE_AND_CALL';
        // Pick random target symbol
        this.targetSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
        this.phaseTimer = Math.max(2.4, 4.2 - (this.currentRound - 1) * 0.8);
        if (window.soundEngine) window.soundEngine.playDiceStop();
      }
    } else if (this.phase === 'HIDE_AND_CALL') {
      if (this.phaseTimer <= 0) {
        // Transition to REVEAL
        this.phase = 'REVEAL';
        this.phaseTimer = 2.2;
        this.executeReveal();
      }
    } else if (this.phase === 'REVEAL') {
      if (this.phaseTimer <= 0) {
        // Check next round or match end
        this.checkRoundProgression();
      }
    }

    // Update Players movement and physics
    this.players.forEach((p, idx) => {
      if (p.lives <= 0) return;

      if (p.isFalling) {
        p.fallScale = Math.max(0, p.fallScale - dt * 2.2);
        return;
      }

      // Bot AI (runs during HIDE_AND_CALL)
      if (p.type === 'bot' && this.phase === 'HIDE_AND_CALL' && this.targetSymbol) {
        window.BotController.updateMemoryTilesBot(p, this.grid, this.targetSymbol, 0.75);
      }

      // Movement
      const speed = 230;
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

      // Keep within arena bounds
      p.x = Math.max(230, Math.min(770, p.x));
      p.y = Math.max(90, Math.min(610, p.y));
    });

    // Player vs Player bumping/pushing
    for (let i = 0; i < this.players.length; i++) {
      for (let j = i + 1; j < this.players.length; j++) {
        const p1 = this.players[i];
        const p2 = this.players[j];
        if (p1.lives <= 0 || p2.lives <= 0 || p1.isFalling || p2.isFalling) continue;

        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const minDist = 34;
        if (dist < minDist && dist > 0) {
          const overlap = (minDist - dist) / 2;
          const nx = (p2.x - p1.x) / dist;
          const ny = (p2.y - p1.y) / dist;

          p1.x -= nx * overlap * 1.5;
          p1.y -= ny * overlap * 1.5;
          p2.x += nx * overlap * 1.5;
          p2.y += ny * overlap * 1.5;

          if (Math.random() < 0.1 && window.soundEngine) {
            window.soundEngine.playHit();
          }
        }
      }
    }

    this.updateParticles(dt);
  }

  executeReveal() {
    if (!this.targetSymbol) return;

    // Shake and drop wrong tiles
    this.grid.forEach(tile => {
      if (tile.symbol.id !== this.targetSymbol.id) {
        tile.fallen = true;
        this.spawnParticles(tile.x + tile.size / 2, tile.y + tile.size / 2, '#475569', 8, 60, 0.4);
      }
    });

    if (window.soundEngine) window.soundEngine.playPlatformBreak();

    // Check which players are standing on fallen tiles
    this.players.forEach(p => {
      if (p.lives <= 0) return;

      // Find tile under player
      const standingTile = this.grid.find(t =>
        p.x >= t.x && p.x <= t.x + t.size &&
        p.y >= t.y && p.y <= t.y + t.size
      );

      if (!standingTile || standingTile.fallen) {
        // Player falls!
        p.isFalling = true;
        p.lives -= 1;
        if (window.soundEngine) window.soundEngine.playHit();
        this.spawnParticles(p.x, p.y, p.color, 16, 100, 0.5);
      } else {
        // Safe!
        p.score += 1;
        if (window.soundEngine) window.soundEngine.playCoin();
      }
    });
  }

  checkRoundProgression() {
    const playersWithLives = this.players.filter(p => p.lives > 0).length;

    if (this.currentRound >= this.totalRounds || playersWithLives <= 1) {
      this.resolveMatch();
    } else {
      this.startRound(this.currentRound + 1);
    }
  }

  resolveMatch() {
    // Rank players: Lives remaining (primary), then score (secondary)
    const sorted = [...this.players]
      .map((p, idx) => ({ idx, lives: p.lives, score: p.score }))
      .sort((a, b) => {
        if (b.lives !== a.lives) return b.lives - a.lives;
        return b.score - a.score;
      });

    const rankings = sorted.map(s => s.idx);
    this.finishGame(rankings);
  }

  render(ctx) {
    ctx.clearRect(0, 0, this.width, this.height);

    // Dark Abyss Background
    const abyssGrad = ctx.createRadialGradient(this.width / 2, this.height / 2, 40, this.width / 2, this.height / 2, 550);
    abyssGrad.addColorStop(0, '#0F172A');
    abyssGrad.addColorStop(0.7, '#020617');
    abyssGrad.addColorStop(1, '#000000');
    ctx.fillStyle = abyssGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Abyss pit grid wires
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // Draw Tiles
    this.grid.forEach(tile => {
      this.drawTile(ctx, tile);
    });

    // Draw Players
    this.players.forEach(p => {
      if (p.lives > 0) {
        ctx.save();
        if (p.isFalling) {
          ctx.translate(p.x, p.y);
          ctx.scale(p.fallScale, p.fallScale);
          ctx.translate(-p.x, -p.y);
        }
        this.drawPlayer(ctx, p);

        // Draw Player Hearts
        ctx.fillStyle = '#EF4444';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        let hearts = '';
        for (let h = 0; h < p.lives; h++) hearts += '❤️';
        ctx.fillText(hearts, p.x, p.y - 32);

        ctx.restore();
      }
    });

    // Render Particles
    this.renderParticles(ctx);

    // HUD: Round, Target Symbol & Phase Timer
    this.drawHUD(ctx);
  }

  drawTile(ctx, tile) {
    if (tile.fallen) {
      // Fallen into abyss
      return;
    }

    const x = tile.x;
    const y = tile.y;
    const s = tile.size;

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(x + 4, y + 6, s, s, 12);
    ctx.fill();

    // Tile Base Plate
    const isRevealSafe = this.phase === 'REVEAL' && tile.symbol.id === this.targetSymbol.id;
    ctx.fillStyle = isRevealSafe ? '#065F46' : '#1E293B';
    ctx.beginPath();
    ctx.roundRect(x, y, s, s, 12);
    ctx.fill();

    ctx.strokeStyle = isRevealSafe ? '#10B981' : '#475569';
    ctx.lineWidth = isRevealSafe ? 4 : 2;
    ctx.stroke();

    // Show symbol during MEMORIZE or during REVEAL
    const showSymbol = this.phase === 'MEMORIZE' || (this.phase === 'REVEAL' && !tile.fallen);

    if (showSymbol) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '40px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tile.symbol.icon, x + s / 2, y + s / 2);
    } else {
      // Hidden: show mystery pattern
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(x + s / 2, y + s / 2, 14, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawHUD(ctx) {
    ctx.save();

    // Header Panel
    const panelW = 460;
    const panelH = 54;
    const panelX = (this.width - panelW) / 2;
    const panelY = 16;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 16);
    ctx.fill();
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (this.phase === 'MEMORIZE') {
      ctx.fillStyle = '#FBBF24';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`👀 MERKE DIR DIE PLATTEN! [${Math.ceil(this.phaseTimer)}s]`, this.width / 2, panelY + panelH / 2);
    } else if (this.phase === 'HIDE_AND_CALL') {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 19px sans-serif';
      ctx.fillText(`LAUFE AUF: ${this.targetSymbol.icon} ${this.targetSymbol.name}! [${Math.ceil(this.phaseTimer)}s]`, this.width / 2, panelY + panelH / 2);
    } else if (this.phase === 'REVEAL') {
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 19px sans-serif';
      ctx.fillText(`AUFLÖSUNG: ${this.targetSymbol ? this.targetSymbol.icon : ''} BLEIBT STEHEN!`, this.width / 2, panelY + panelH / 2);
    }

    // Round Pill (top left)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.beginPath();
    ctx.roundRect(40, 16, 140, 36, 12);
    ctx.fill();
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`Runde ${this.currentRound} / ${this.totalRounds}`, 110, 34);

    ctx.restore();
  }
}

window.MemoryTilesMinigame = MemoryTilesMinigame;
