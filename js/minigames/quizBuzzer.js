// Minispiel 12: ⚡ Cyber-Showdown – Buzzer-Quiz (quizBuzzer.js)
// TV-Quizshow-Studio mit leuchtenden Pulten für alle Spieler/Teams
// 6 Runden – 4 Tasten: Oben=A, Rechts=B, Unten=C, Links=D
// Punkte: 1000 - (Reaktionszeit/10), Falsch: -200 Punkte

class QuizBuzzerMinigame extends window.MinigameBase {
  constructor(canvas, players, options = {}) {
    super(canvas, players, options);
    this.totalQuestions = 6;
    this.currentQuestionIndex = 0;
    this.questions = [];
    this.phase = 'question'; // 'question', 'answers_reveal', 'buzzing', 'round_result', 'game_over'
    this.phaseTimer = 0;
    this.questionStartTime = 0;
    this.playerAnswers = {}; // playerIndex -> { choice, timeMs, isCorrect, points }
  }

  setupArena() {
    if (window.QuestionBank) {
      this.questions = window.QuestionBank.getRandom(this.totalQuestions);
    } else {
      this.questions = [
        {
          question: 'Welches Protokoll dient der dynamischen IP-Adressvergabe?',
          options: ['DHCP', 'DNS', 'HTTP', 'BGP'],
          correct: 0
        }
      ];
    }

    this.currentQuestionIndex = 0;
    this.players.forEach(p => {
      p.score = 0;
    });

    this.startNewRound();
  }

  startNewRound() {
    this.playerAnswers = {};
    this.phase = 'buzzing';
    this.phaseTimer = 12.0; // 12 seconds per question
    this.questionStartTime = performance.now();

    const q = this.questions[this.currentQuestionIndex];
    if (window.soundEngine && window.soundEngine.playWesternGong) {
      window.soundEngine.playWesternGong();
    }

    // Bot timers
    this.players.forEach((p, idx) => {
      if (p.type === 'bot') {
        p.botAnswerTime = 1200 + Math.random() * 2600; // 1.2s to 3.8s
        p.hasAnswered = false;
      }
    });
  }

  handleInput(playerIndex, action, isDown) {
    if (!isDown || this.phase !== 'buzzing') return;
    if (this.playerAnswers[playerIndex]) return; // Already answered

    // Mapping: up=A (0), right=B (1), down=C (2), left=D (3)
    let choice = -1;
    if (action === 'up') choice = 0;
    else if (action === 'right') choice = 1;
    else if (action === 'down') choice = 2;
    else if (action === 'left') choice = 3;

    if (choice !== -1) {
      this.recordPlayerAnswer(playerIndex, choice);
    }
  }

  recordPlayerAnswer(playerIndex, choice) {
    if (this.playerAnswers[playerIndex]) return;

    const q = this.questions[this.currentQuestionIndex];
    const reactionTimeMs = Math.max(100, Math.floor(performance.now() - this.questionStartTime));
    const isCorrect = choice === q.correct;

    let points = 0;
    if (isCorrect) {
      points = Math.max(100, 1000 - Math.floor(reactionTimeMs / 10));
      if (window.soundEngine && window.soundEngine.playCoin) window.soundEngine.playCoin();
    } else {
      points = -200;
      if (window.soundEngine && window.soundEngine.playCoinLoss) window.soundEngine.playCoinLoss();
    }

    const player = this.players[playerIndex];
    if (player) {
      player.score += points;
    }

    this.playerAnswers[playerIndex] = {
      choice,
      timeMs: reactionTimeMs,
      isCorrect,
      points
    };

    // If all players have answered, proceed to round results early
    if (Object.keys(this.playerAnswers).length >= this.players.length) {
      this.triggerRoundResult();
    }
  }

  update(dt) {
    super.update(dt);

    if (this.phase === 'buzzing') {
      this.phaseTimer -= dt;
      const elapsedMs = performance.now() - this.questionStartTime;

      // Update Bots
      const q = this.questions[this.currentQuestionIndex];
      this.players.forEach((p, idx) => {
        if (p.type === 'bot' && !this.playerAnswers[idx] && q) {
          if (elapsedMs >= p.botAnswerTime) {
            // ~80% chance of correct answer
            const isCorrect = Math.random() < 0.82;
            let choice = q.correct;
            if (!isCorrect) {
              const wrongOnes = [0, 1, 2, 3].filter(c => c !== q.correct);
              choice = wrongOnes[Math.floor(Math.random() * wrongOnes.length)];
            }
            this.recordPlayerAnswer(idx, choice);
          }
        }
      });

      if (this.phaseTimer <= 0) {
        this.triggerRoundResult();
      }
    } else if (this.phase === 'round_result') {
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0) {
        if (this.currentQuestionIndex + 1 < this.questions.length) {
          this.currentQuestionIndex++;
          this.startNewRound();
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

  triggerRoundResult() {
    this.phase = 'round_result';
    this.phaseTimer = 3.5; // Show result for 3.5s

    if (window.soundEngine && window.soundEngine.playLaserZap) {
      window.soundEngine.playLaserZap();
    }
  }

  render(ctx) {
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Cyber TV Studio Background
    const bgGrad = ctx.createRadialGradient(this.width / 2, this.height / 2, 100, this.width / 2, this.height / 2, this.width / 1.2);
    bgGrad.addColorStop(0, '#1E1B4B');
    bgGrad.addColorStop(0.6, '#0F172A');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Neon floor grid
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 260);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 260; y < this.height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    const q = this.questions[this.currentQuestionIndex];

    // 2. Question Screen at Top
    if (q) {
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = '#6366F1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(30, 10, this.width - 60, 95, 14);
      ctx.fill();
      ctx.stroke();

      // Category Tag
      ctx.fillStyle = '#818CF8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`⚡ CYBER-SHOWDOWN • FRAGE ${this.currentQuestionIndex + 1} / ${this.totalQuestions} • [${q.topic || 'IT'}]`, 45, 28);

      // Countdown
      ctx.font = 'black 16px monospace';
      ctx.textAlign = 'right';
      const sec = Math.max(0, Math.ceil(this.phaseTimer));
      ctx.fillStyle = this.phase === 'round_result' ? '#10B981' : (sec <= 3 ? '#EF4444' : '#FDE047');
      ctx.fillText(this.phase === 'round_result' ? 'AUFLÖSUNG' : `⏱️ ${sec}s`, this.width - 45, 28);

      // Question Text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';

      const words = q.question.split(' ');
      let line = '';
      let lineY = 52;
      for (let w of words) {
        const testLine = line + w + ' ';
        if (ctx.measureText(testLine).width > this.width - 100) {
          ctx.fillText(line, this.width / 2, lineY);
          line = w + ' ';
          lineY += 18;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, this.width / 2, lineY);

      // 3. Four Buzzers / Options Display (2x2 Grid)
      const optKeys = [
        { label: 'A', key: '⬆️ [OBEN]', color: '#EF4444', dark: '#991B1B', x: 40, y: 115, w: (this.width - 100) / 2, h: 58 },
        { label: 'B', key: '➡️ [RECHTS]', color: '#3B82F6', dark: '#1E40AF', x: 60 + (this.width - 100) / 2, y: 115, w: (this.width - 100) / 2, h: 58 },
        { label: 'C', key: '⬇️ [UNTEN]', color: '#10B981', dark: '#065F46', x: 40, y: 180, w: (this.width - 100) / 2, h: 58 },
        { label: 'D', key: '⬅️ [LINKS]', color: '#F59E0B', dark: '#92400E', x: 60 + (this.width - 100) / 2, y: 180, w: (this.width - 100) / 2, h: 58 }
      ];

      optKeys.forEach((opt, idx) => {
        const isCorrectChoice = idx === q.correct;
        const showResult = this.phase === 'round_result';

        ctx.save();
        ctx.fillStyle = showResult ? (isCorrectChoice ? '#065F46' : '#1E293B') : opt.dark;
        ctx.strokeStyle = showResult ? (isCorrectChoice ? '#34D399' : '#334155') : opt.color;
        ctx.lineWidth = showResult && isCorrectChoice ? 3.5 : 2;

        ctx.beginPath();
        ctx.roundRect(opt.x, opt.y, opt.w, opt.h, 10);
        ctx.fill();
        ctx.stroke();

        // Option letter badge
        ctx.fillStyle = opt.color;
        ctx.beginPath();
        ctx.roundRect(opt.x + 8, opt.y + 8, 30, 42, 6);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'black 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(opt.label, opt.x + 23, opt.y + 28);
        ctx.font = 'bold 9px monospace';
        ctx.fillText(opt.key.split(' ')[0], opt.x + 23, opt.y + 44);

        // Option text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'left';
        const txt = q.options[idx] || '';
        const displayTxt = txt.length > 38 ? txt.substring(0, 36) + '...' : txt;
        ctx.fillText(displayTxt, opt.x + 46, opt.y + 34);

        if (showResult && isCorrectChoice) {
          ctx.fillStyle = '#34D399';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText('✅ RICHTIG!', opt.x + opt.w - 12, opt.y + 34);
        }

        ctx.restore();
      });
    }

    // 4. Podiums & Players at the Bottom (supports up to 8 slots)
    const totalP = this.players.length;
    const podiumSpacing = (this.width - 40) / totalP;

    this.players.forEach((p, idx) => {
      const px = 30 + idx * podiumSpacing + podiumSpacing / 2;
      const py = 310;
      const ans = this.playerAnswers[idx];

      // Draw Podium
      ctx.save();
      const isWinner = ans && ans.isCorrect;
      const isLoser = ans && !ans.isCorrect;

      ctx.fillStyle = isWinner ? '#065F46' : (isLoser ? '#7F1D1D' : '#1E293B');
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(px - 22, py + 15, 44, 45, 6);
      ctx.fill();
      ctx.stroke();

      // Podium Lamp / Buzzer
      ctx.fillStyle = ans ? (ans.isCorrect ? '#10B981' : '#EF4444') : '#475569';
      ctx.beginPath();
      ctx.arc(px, py + 15, 6, 0, Math.PI * 2);
      ctx.fill();

      // Render Player Character
      p.x = px;
      p.y = py;
      this.drawPlayer(ctx, p, {
        forceDraw: true,
        state: ans ? (ans.isCorrect ? 'cheer' : 'sad') : 'idle'
      });

      // Score / Answer Badge
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${p.score}P`, px, py + 48);

      if (ans) {
        ctx.fillStyle = ans.isCorrect ? '#34D399' : '#F87171';
        ctx.font = 'black 11px sans-serif';
        const labelMap = ['A', 'B', 'C', 'D'];
        ctx.fillText(`[${labelMap[ans.choice]}] ${ans.points > 0 ? '+' + ans.points : ans.points}`, px, py - 26);
      }

      ctx.restore();
    });
  }
}

window.QuizBuzzerMinigame = QuizBuzzerMinigame;
