// Base Minigame Class
class MinigameBase {
  constructor(canvas, players, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.players = players.map(p => ({
      ...p,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      alive: true,
      score: 0,
      inputs: { up: false, down: false, left: false, right: false, action: false }
    }));
    this.isHost = options.isHost !== undefined ? options.isHost : true;
    this.isLocalMode = options.isLocalMode !== undefined ? options.isLocalMode : false;
    this.onNetSend = options.onNetSend || (() => {});
    this.onEnd = options.onEnd || (() => {});

    this.isRunning = false;
    this.timeRemaining = 30;
    this.particles = [];
    this.lastTime = 0;
    this.animationFrameId = null;
  }

  // Lifecycle
  init() {
    this.setupArena();
  }

  setupArena() {
    // Override in subclass
  }

  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  loop(currentTime) {
    if (!this.isRunning) return;

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.update(dt);
    this.render(this.ctx);

    if (this.isRunning) {
      this.animationFrameId = requestAnimationFrame(this.loop);
    }
  }

  update(dt) {
    // Override in subclass
    this.updateParticles(dt);
  }

  render(ctx) {
    // Override in subclass
    this.renderParticles(ctx);
  }

  handleInput(playerIndex, action, isDown) {
    const p = this.players[playerIndex];
    if (p && p.inputs && p.inputs[action] !== undefined) {
      p.inputs[action] = isDown;
    }
  }

  // Common particle system
  spawnParticles(x, y, color, count = 15, speed = 120, life = 0.5) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 0.7 + 0.3) * speed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color,
        size: Math.random() * 4 + 2,
        life,
        maxLife: life
      });
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  renderParticles(ctx) {
    ctx.save();
    for (const pt of this.particles) {
      const alpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Draw standard cute player character in arena (Mario-Party-Style Archetypes)
  drawPlayer(ctx, p, options = {}) {
    if (!p.alive && !options.forceDraw) return;

    const x = p.x;
    const y = p.y;
    const radius = options.radius || 18;
    const slotIdx = p.slotIndex !== undefined ? p.slotIndex : 0;
    const charRef = p.archetype || slotIdx;
    const lookX = p.vx ? Math.sign(p.vx) : 0;
    const lookY = p.vy ? Math.sign(p.vy) : 0;
    const isMoving = Math.abs(p.vx || 0) > 5 || Math.abs(p.vy || 0) > 5;

    if (window.CharacterRenderer) {
      window.CharacterRenderer.drawCharacter(ctx, x, y - 4, charRef, {
        scale: radius / 17,
        lookX,
        lookY,
        isMoving,
        isJumping: options.isJumping || false,
        punching: options.punching || false,
        state: options.state || (p.alive ? (isMoving ? 'walk' : 'idle') : 'sad'),
        animTime: performance.now() / 1000
      });

      // Player number badge
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 3;
      ctx.fillText(`P${slotIdx + 1}`, x, y + radius + 10);
      ctx.restore();
      return;
    }

    // Fallback simple circle
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x, y + radius * 0.8, radius * 0.9, radius * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = p.color || '#3B82F6';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // End match and fire rankings
  finishGame(rankings) {
    this.stop();
    if (this.onEnd) {
      this.onEnd(rankings);
    }
  }

  getRankings() {
    // Override in subclass
    return [0, 1, 2, 3];
  }
}

window.MinigameBase = MinigameBase;
