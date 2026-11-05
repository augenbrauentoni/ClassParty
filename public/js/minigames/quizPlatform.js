// Minispiel 11: 🧠 IT- & Wirtschafts-Plattform-Quiz (quizPlatform.js)
// 4 Plattformen (A=Rot, B=Blau, C=Grün, D=Gelb) über einem Lava-Abgrund
// 5 Fachfragen - Falsche Plattformen klappen nach 10s weg!

class QuizPlatformMinigame extends window.MinigameBase {
  constructor(canvas, players, options = {}) {
    super(canvas, players, options);
    this.totalQuestions = 5;
    this.currentQuestionIndex = 0;
    this.questions = [];
    this.phase = 'countdown'; // 'countdown', 'thinking', 'reveal', 'intermission', 'game_over'
    this.phaseTimer = 0;
    this.questionDuration = 10.0;
    this.emberParticles = [];
    this.platformState = [
      { id: 'A', name: 'A', color: '#EF4444', dark: '#991B1B', label: 'A', x: 80, y: 150, w: 180, h: 140, fallen: false, fallY: 0 },
      { id: 'B', name: 'B', color: '#3B82F6', dark: '#1E40AF', label: 'B', x: 280, y: 150, w: 180, h: 140, fallen: false, fallY: 0 },
      { id: 'C', name: 'C', color: '#10B981', dark: '#065F46', label: 'C', x: 480, y: 150, w: 180, h: 140, fallen: false, fallY: 0 },
      { id: 'D', name: 'D', color: '#F59E0B', dark: '#92400E', label: 'D', x: 680, y: 150, w: 180, h: 140, fallen: false, fallY: 0 }
    ];
    this.currentArrivalOrder = [];
  }

  setupArena() {
    // Get 5 random questions from questionBank
    if (window.QuestionBank) {
      this.questions = window.QuestionBank.getRandom(this.totalQuestions);
    } else {
      this.questions = [
        {
          question: 'Welches Protokoll arbeitet auf OSI-Schicht 3?',
          options: ['IP (Internet Protocol)', 'TCP', 'HTTP', 'Ethernet'],
          correct: 0
        }
      ];
    }

    this.currentQuestionIndex = 0;
    this.resetForNewQuestion();
  }

  resetForNewQuestion() {
    this.platformState.forEach(p => {
      p.fallen = false;
      p.fallY = 0;
    });

    // Reset players to central/safe walkway or distribute
    const totalP = this.players.length;
    this.players.forEach((p, idx) => {
      p.x = 120 + (idx * ((this.width - 240) / Math.max(1, totalP - 1)));
      p.y = 340; // bottom walkway
      p.vx = 0;
      p.vy = 0;
      p.alive = true;
      p.locked = false;
      p.currentPlatform = null;
      p.targetPlatform = null;
      p.botChoice = null;
      p.botDelay = 0.8 + Math.random() * 2.2;
    });

    this.currentArrivalOrder = [];
    this.phase = 'thinking';
    this.phaseTimer = this.questionDuration;

    if (window.soundEngine && window.soundEngine.playLaserWarning) {
      window.soundEngine.playLaserWarning();
    }
  }

  update(dt) {
    super.update(dt);

    // Update lava ember particles
    if (Math.random() < 0.4) {
      this.emberParticles.push({
        x: Math.random() * this.width,
        y: this.height + 10,
        vx: (Math.random() - 0.5) * 30,
        vy: -40 - Math.random() * 60,
        size: Math.random() * 3 + 1,
        life: 1.5,
        maxLife: 1.5,
        color: Math.random() < 0.5 ? '#F97316' : '#EF4444'
      });
    }

    for (let i = this.emberParticles.length - 1; i >= 0; i--) {
      const em = this.emberParticles[i];
      em.x += em.vx * dt;
      em.y += em.vy * dt;
      em.life -= dt;
      if (em.life <= 0) this.emberParticles.splice(i, 1);
    }

    if (this.phase === 'thinking') {
      this.phaseTimer -= dt;

      // In last 2 seconds, freeze player position
      if (this.phaseTimer <= 2.0) {
        this.players.forEach(p => p.locked = true);
      }

      if (this.phaseTimer <= 0) {
        this.triggerReveal();
      } else {
        this.updatePlayersMovement(dt);
      }
    } else if (this.phase === 'reveal') {
      this.phaseTimer -= dt;

      // Animate wrong platforms falling into lava
      this.platformState.forEach(p => {
        if (p.fallen) {
          p.fallY += 600 * dt;
        }
      });

      // Animate falling players
      this.players.forEach(p => {
        if (!p.alive) {
          p.y += 500 * dt;
        }
      });

      if (this.phaseTimer <= 0) {
        if (this.currentQuestionIndex + 1 < this.questions.length) {
          this.currentQuestionIndex++;
          this.resetForNewQuestion();
        } else {
          this.phase = 'game_over';
          setTimeout(() => {
            const rankings = [...this.players]
              .sort((a, b) => b.score - a.score)
              .map(p => p.slotIndex);
            this.finishGame(rankings);
          }, 1500);
        }
      }
    }
  }

  updatePlayersMovement(dt) {
    const q = this.questions[this.currentQuestionIndex];
    if (!q) return;

    this.players.forEach((p, idx) => {
      // Bot AI
      if (p.type === 'bot' && !p.locked) {
        if (p.botChoice === null) {
          if (this.questionDuration - this.phaseTimer > p.botDelay) {
            // ~80% chance of picking correct answer
            const isCorrect = Math.random() < 0.82;
            if (isCorrect) {
              p.botChoice = q.correct;
            } else {
              const wrongOptions = [0, 1, 2, 3].filter(o => o !== q.correct);
              p.botChoice = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
            }
          }
        }

        if (p.botChoice !== null) {
          const targetPlat = this.platformState[p.botChoice];
          const targetX = targetPlat.x + targetPlat.w / 2 + (idx % 2 === 0 ? -20 : 20);
          const targetY = targetPlat.y + targetPlat.h / 2;

          p.inputs.left = p.x > targetX + 8;
          p.inputs.right = p.x < targetX - 8;
          p.inputs.up = p.y > targetY + 8;
          p.inputs.down = p.y < targetY - 8;
        }
      }

      // Movement physics
      const speed = 260;
      if (!p.locked) {
        let dx = 0;
        let dy = 0;
        if (p.inputs.left) dx -= 1;
        if (p.inputs.right) dx += 1;
        if (p.inputs.up) dy -= 1;
        if (p.inputs.down) dy += 1;

        if (dx !== 0 && dy !== 0) {
          dx *= 0.7071;
          dy *= 0.7071;
        }

        p.vx = dx * speed;
        p.vy = dy * speed;

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Boundaries
        p.x = Math.max(30, Math.min(this.width - 30, p.x));
        p.y = Math.max(120, Math.min(this.height - 40, p.y));

        // Determine which platform player is standing on
        p.currentPlatform = null;
        for (let i = 0; i < this.platformState.length; i++) {
          const plat = this.platformState[i];
          if (p.x >= plat.x && p.x <= plat.x + plat.w && p.y >= plat.y && p.y <= plat.y + plat.h) {
            p.currentPlatform = i;
            if (!this.currentArrivalOrder.includes(p)) {
              this.currentArrivalOrder.push(p);
            }
            break;
          }
        }
      }
    });
  }

  triggerReveal() {
    this.phase = 'reveal';
    this.phaseTimer = 3.5;

    const q = this.questions[this.currentQuestionIndex];
    const correctPlatIndex = q.correct;

    if (window.soundEngine && window.soundEngine.playPlatformBreak) {
      window.soundEngine.playPlatformBreak();
    }

    // Collapse wrong platforms
    this.platformState.forEach((plat, idx) => {
      if (idx !== correctPlatIndex) {
        plat.fallen = true;
      }
    });

    // Check surviving players
    this.players.forEach(p => {
      if (p.currentPlatform === correctPlatIndex) {
        p.alive = true;
        // Base score + speed bonus
        const arrivalRank = this.currentArrivalOrder.indexOf(p);
        const speedBonus = arrivalRank === 0 ? 2 : (arrivalRank === 1 ? 1 : 0);
        p.score += 3 + speedBonus;

        if (this.spawnParticles) {
          this.spawnParticles(p.x, p.y, '#FBBF24', 20, 80, 0.6);
        }
      } else {
        p.alive = false;
        if (window.soundEngine && window.soundEngine.playHit) {
          window.soundEngine.playHit();
        }
      }
    });
  }

  render(ctx) {
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Lava Background
    const lavaGrad = ctx.createLinearGradient(0, this.height - 180, 0, this.height);
    lavaGrad.addColorStop(0, '#7F1D1D');
    lavaGrad.addColorStop(0.5, '#DC2626');
    lavaGrad.addColorStop(1, '#B91C1C');
    ctx.fillStyle = lavaGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Dark Arena Wall at top
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, this.width, 130);

    // Lava glow embers
    ctx.save();
    for (const em of this.emberParticles) {
      ctx.fillStyle = em.color;
      ctx.globalAlpha = em.life / em.maxLife;
      ctx.beginPath();
      ctx.arc(em.x, em.y, em.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 2. Render Platforms (A, B, C, D)
    const q = this.questions[this.currentQuestionIndex];

    this.platformState.forEach((plat, idx) => {
      const curY = plat.y + plat.fallY;
      if (curY > this.height + 100) return; // fallen off screen

      ctx.save();
      // Drop Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.roundRect(plat.x + 6, curY + 6, plat.w, plat.h, 12);
      ctx.fill();

      // Platform Base
      ctx.fillStyle = plat.dark;
      ctx.beginPath();
      ctx.roundRect(plat.x, curY + 6, plat.w, plat.h, 12);
      ctx.fill();

      // Platform Top
      ctx.fillStyle = plat.color;
      ctx.beginPath();
      ctx.roundRect(plat.x, curY, plat.w, plat.h - 6, 12);
      ctx.fill();

      // Platform Letter & Option snippet
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'black 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(plat.label, plat.x + plat.w / 2, curY + 45);

      if (q && q.options[idx]) {
        ctx.font = 'bold 11px sans-serif';
        const txt = q.options[idx];
        const truncated = txt.length > 22 ? txt.substring(0, 20) + '...' : txt;
        ctx.fillText(truncated, plat.x + plat.w / 2, curY + 80);
      }

      ctx.restore();
    });

    // 3. Bottom Safe Walkway (Start Zone)
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(40, 320, this.width - 80, 50);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 320, this.width - 80, 50);
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STARTBEREICH (Laufe auf die richtige Plattform!)', this.width / 2, 348);

    // 4. Render Players
    this.players.forEach(p => {
      this.drawPlayer(ctx, p, {
        forceDraw: true,
        state: p.alive ? (p.locked ? 'idle' : 'walk') : 'sad'
      });

      // Score overhead
      ctx.fillStyle = '#FDE047';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${p.score}P`, p.x, p.y - 24);
    });

    // 5. Quiz Arena Screen at Top (Question Banner)
    if (q) {
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(20, 10, this.width - 40, 110, 12);
      ctx.fill();
      ctx.stroke();

      // Header Tag
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`FRAGE ${this.currentQuestionIndex + 1} / ${this.totalQuestions} • [${q.topic || 'IT & Wirtschaft'}]`, 35, 28);

      // Timer display
      ctx.font = 'black 16px monospace';
      ctx.textAlign = 'right';
      const secLeft = Math.max(0, Math.ceil(this.phaseTimer));
      const isLocked = this.phaseTimer <= 2.0 && this.phase === 'thinking';
      ctx.fillStyle = isLocked ? '#EF4444' : '#FDE047';
      ctx.fillText(isLocked ? '🔒 POSITION GESPERRT!' : `⏱️ ${secLeft}s`, this.width - 35, 28);

      // Question text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';

      // Multi-line wrap
      const words = q.question.split(' ');
      let line = '';
      let lineY = 54;
      for (let w of words) {
        const testLine = line + w + ' ';
        if (ctx.measureText(testLine).width > this.width - 80) {
          ctx.fillText(line, this.width / 2, lineY);
          line = w + ' ';
          lineY += 20;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, this.width / 2, lineY);
    }
  }
}

window.QuizPlatformMinigame = QuizPlatformMinigame;
