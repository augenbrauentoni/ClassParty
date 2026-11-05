// duelEngine.js - Best-of-3 Duell-Serie (1v1 oder Team vs. Team)
// 5 abwechslungsreiche Mikro-Minispiele (5-8 Sekunden)
// Anti-Wiederholungs-Sperre (usedDuelsInRound)

(function() {
  const MICRO_DUELS = [
    { id: 'quiz', name: '⚡ Schnell-Quiz', desc: 'Wer drückt zuerst die richtige Antwort?' },
    { id: 'pumper', name: '🎈 Turbo-Pumper (6s)', desc: 'Hämmer so oft wie möglich auf [SPACE] / Klick!' },
    { id: 'sniper', name: '🎯 Scharfschütze (5s)', desc: 'Stoppe das Fadenkreuz genau in der Mitte!' },
    { id: 'code', name: '🔢 Code-Knacker (7s)', desc: 'Tippe die 5 Pfeiltasten fehlerfrei ein!' },
    { id: 'blade', name: '⚔️ Klingen-Konter (6s)', desc: 'Reagiere im Moment des Schlags!' }
  ];

  class DuelEngine {
    constructor(game) {
      this.game = game;
      this.p1 = null;
      this.p2 = null;
      this.p1Idx = 0;
      this.p2Idx = 1;
      this.wagerType = 'coins'; // 'coins' or 'stars'
      this.wagerAmount = 10;
      this.p1Score = 0;
      this.p2Score = 0;
      this.currentRound = 1;
      this.activeMicroGame = null;
      this.onFinishCallback = null;
      this.microGameTimer = null;
      this.microGameAnim = null;
    }

    startSeries(p1Idx, p2Idx, wagerConfig, onFinish) {
      this.p1Idx = p1Idx;
      this.p2Idx = p2Idx;
      this.p1 = this.game.players[p1Idx];
      this.p2 = this.game.players[p2Idx];
      this.wagerType = wagerConfig.type || 'coins';
      this.wagerAmount = wagerConfig.amount || 10;
      this.p1Score = 0;
      this.p2Score = 0;
      this.currentRound = 1;
      this.onFinishCallback = onFinish;

      if (!this.game.usedDuelsInRound) {
        this.game.usedDuelsInRound = [];
      }

      this.showDuelModal();
      this.startNextRound();
    }

    getNextMicroGame() {
      let pool = MICRO_DUELS.filter(d => !this.game.usedDuelsInRound.includes(d.id));
      if (pool.length === 0) {
        // Reset pool if all were used
        this.game.usedDuelsInRound = [];
        pool = [...MICRO_DUELS];
      }
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      this.game.usedDuelsInRound.push(chosen.id);
      return chosen;
    }

    showDuelModal() {
      const modal = document.getElementById('duel-modal');
      if (!modal) return;
      modal.classList.remove('hidden');

      const descEl = document.getElementById('duel-desc');
      if (descEl) {
        const wagerTxt = this.wagerType === 'stars'
          ? `Einsatz: 1 STERN pro Spieler (Sieger erhält den Stern!)`
          : `Einsatz: ${this.wagerAmount}🪙 pro Spieler (Gesamtpot: ${this.wagerAmount * 2}🪙)!`;
        descEl.innerHTML = `<span class="font-bold text-yellow-300">BEST-OF-3 DUELL:</span> ${wagerTxt}`;
      }

      // P1 Avatar & Name
      const p1Avatar = document.getElementById('duel-p1-avatar');
      const p1Name = document.getElementById('duel-p1-name');
      if (p1Avatar) {
        p1Avatar.style.backgroundColor = this.p1.color;
        p1Avatar.textContent = `P${this.p1Idx + 1}`;
      }
      if (p1Name) p1Name.textContent = this.p1.name;

      // P2 Avatar & Name
      const p2Avatar = document.getElementById('duel-p2-avatar');
      const p2Name = document.getElementById('duel-p2-name');
      if (p2Avatar) {
        p2Avatar.style.backgroundColor = this.p2.color;
        p2Avatar.textContent = `P${this.p2Idx + 1}`;
      }
      if (p2Name) p2Name.textContent = this.p2.name;

      this.updateScoreboardUI();
    }

    updateScoreboardUI() {
      const banner = document.getElementById('duel-winner-banner');
      if (banner) {
        banner.classList.remove('hidden');
        banner.innerHTML = `
          <div class="flex items-center justify-center gap-6 text-sm font-bold my-1">
            <span style="color: ${this.p1.color}">${this.p1.name}: ${'⭐'.repeat(this.p1Score)}${'⚪'.repeat(2 - this.p1Score)}</span>
            <span class="text-slate-400">| Runde ${this.currentRound} |</span>
            <span style="color: ${this.p2.color}">${this.p2.name}: ${'⭐'.repeat(this.p2Score)}${'⚪'.repeat(2 - this.p2Score)}</span>
          </div>
        `;
      }
    }

    startNextRound() {
      if (this.p1Score >= 2 || this.p2Score >= 2) {
        this.finishSeries();
        return;
      }

      const micro = this.getNextMicroGame();
      this.activeMicroGame = micro;
      this.updateScoreboardUI();

      const arena = document.getElementById('duel-arena-box');
      if (!arena) return;

      arena.innerHTML = `
        <div class="flex flex-col items-center gap-2 w-full">
          <span class="text-xs uppercase tracking-widest font-black text-amber-400">Runde ${this.currentRound} von max. 3</span>
          <h4 class="text-xl font-black text-white">${micro.name}</h4>
          <p class="text-xs text-slate-300">${micro.desc}</p>
          <div id="micro-game-container" class="w-full mt-2 flex flex-col items-center justify-center min-h-[140px]">
            <div id="micro-countdown" class="text-4xl font-black text-yellow-300 animate-bounce">3</div>
          </div>
        </div>
      `;

      if (window.soundEngine && window.soundEngine.playCountdown) {
        window.soundEngine.playCountdown(3);
      }

      let count = 3;
      const countEl = document.getElementById('micro-countdown');
      const countInterval = setInterval(() => {
        count--;
        if (count > 0) {
          if (countEl) countEl.textContent = count;
          if (window.soundEngine && window.soundEngine.playCountdown) window.soundEngine.playCountdown(count);
        } else {
          clearInterval(countInterval);
          this.launchMicroGame(micro.id);
        }
      }, 750);
    }

    launchMicroGame(type) {
      const container = document.getElementById('micro-game-container');
      if (!container) return;

      if (type === 'quiz') this.runMicroQuiz(container);
      else if (type === 'pumper') this.runMicroPumper(container);
      else if (type === 'sniper') this.runMicroSniper(container);
      else if (type === 'code') this.runMicroCode(container);
      else if (type === 'blade') this.runMicroBlade(container);
    }

    // 1. ⚡ Schnell-Quiz Mikro-Duell
    runMicroQuiz(container) {
      const q = window.QuestionBank ? window.QuestionBank.getRandom(1)[0] : {
        question: 'Welches Protokoll dient dem Web-Browsing?',
        options: ['HTTPS', 'FTP', 'SSH', 'SMTP'],
        correct: 0
      };

      container.innerHTML = `
        <div class="w-full flex flex-col items-center gap-2">
          <p class="text-xs font-bold text-white max-w-sm text-center">${q.question}</p>
          <div class="grid grid-cols-2 gap-2 w-full mt-1">
            ${q.options.map((opt, i) => `
              <button class="btn-micro-quiz-opt p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-white transition active:scale-95 text-left" data-opt="${i}">
                <span class="text-amber-400 font-mono">[${['A', 'B', 'C', 'D'][i]}]</span> ${opt}
              </button>
            `).join('')}
          </div>
        </div>
      `;

      let answered = false;
      const resolveChoice = (winnerIdx) => {
        if (answered) return;
        answered = true;
        this.recordRoundWin(winnerIdx);
      };

      // Button clicks
      container.querySelectorAll('.btn-micro-quiz-opt').forEach(btn => {
        btn.onclick = () => {
          const opt = parseInt(btn.dataset.opt, 10);
          if (opt === q.correct) {
            btn.classList.add('bg-emerald-600');
            resolveChoice(this.p1Idx);
          } else {
            btn.classList.add('bg-red-600');
            resolveChoice(this.p2Idx);
          }
        };
      });

      // Bot P2 timer
      const botDelay = 1200 + Math.random() * 1500;
      setTimeout(() => {
        if (!answered) {
          const isCorrect = Math.random() < 0.8;
          resolveChoice(isCorrect ? this.p2Idx : this.p1Idx);
        }
      }, botDelay);
    }

    // 2. 🎈 Turbo-Pumper Mikro-Duell (6s)
    runMicroPumper(container) {
      let p1Pumps = 0;
      let p2Pumps = 0;
      let timeLeft = 6.0;

      container.innerHTML = `
        <div class="w-full flex flex-col items-center gap-2">
          <div class="flex items-center justify-between w-full px-4 text-xs font-bold">
            <span style="color: ${this.p1.color}">${this.p1.name}: <span id="p1-pump-val">0</span> 🎈</span>
            <span class="text-yellow-400 font-mono text-sm" id="pump-timer">6.0s</span>
            <span style="color: ${this.p2.color}">${this.p2.name}: <span id="p2-pump-val">0</span> 🎈</span>
          </div>
          <!-- Progress bars -->
          <div class="w-full grid grid-cols-2 gap-2 px-2">
            <div class="w-full bg-slate-800 rounded-full h-4 overflow-hidden border border-slate-700">
              <div id="p1-pump-bar" class="h-full bg-red-500 transition-all duration-75" style="width: 0%"></div>
            </div>
            <div class="w-full bg-slate-800 rounded-full h-4 overflow-hidden border border-slate-700">
              <div id="p2-pump-bar" class="h-full bg-blue-500 transition-all duration-75" style="width: 0%"></div>
            </div>
          </div>
          <button id="btn-pump-action" class="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-black text-sm shadow active:scale-95 transition mt-2">
            💨 PUMPEN! [SPACE / KLICK]
          </button>
        </div>
      `;

      const p1Val = document.getElementById('p1-pump-val');
      const p2Val = document.getElementById('p2-pump-val');
      const p1Bar = document.getElementById('p1-pump-bar');
      const p2Bar = document.getElementById('p2-pump-bar');
      const timerEl = document.getElementById('pump-timer');
      const btnPump = document.getElementById('btn-pump-action');

      const doPump = (playerIdx) => {
        if (playerIdx === this.p1Idx) {
          p1Pumps++;
          if (p1Val) p1Val.textContent = p1Pumps;
          if (p1Bar) p1Bar.style.width = Math.min(100, p1Pumps * 4) + '%';
        } else {
          p2Pumps++;
          if (p2Val) p2Val.textContent = p2Pumps;
          if (p2Bar) p2Bar.style.width = Math.min(100, p2Pumps * 4) + '%';
        }
        if (window.soundEngine && window.soundEngine.playPumpHiss) window.soundEngine.playPumpHiss();
      };

      if (btnPump) btnPump.onclick = () => doPump(this.p1Idx);

      // Bot P2 pumping loop (average 4.5 pumps per second)
      const botInterval = setInterval(() => {
        if (timeLeft <= 0) return;
        if (Math.random() < 0.65) {
          doPump(this.p2Idx);
        }
      }, 160);

      const loop = setInterval(() => {
        timeLeft -= 0.1;
        if (timerEl) timerEl.textContent = Math.max(0, timeLeft).toFixed(1) + 's';

        if (timeLeft <= 0) {
          clearInterval(loop);
          clearInterval(botInterval);
          if (window.soundEngine && window.soundEngine.playBalloonPop) window.soundEngine.playBalloonPop();

          const winner = p1Pumps >= p2Pumps ? this.p1Idx : this.p2Idx;
          this.recordRoundWin(winner);
        }
      }, 100);
    }

    // 3. 🎯 Scharfschütze Mikro-Duell (5s)
    runMicroSniper(container) {
      container.innerHTML = `
        <div class="w-full flex flex-col items-center gap-2">
          <p class="text-xs text-slate-300">Stoppe das Fadenkreuz im 🎯 Bullseye!</p>
          <div class="relative w-full max-w-xs h-14 bg-slate-950 rounded-2xl border-2 border-slate-700 flex items-center justify-center overflow-hidden my-1">
            <!-- Center Bullseye -->
            <div class="w-10 h-full bg-emerald-500/40 border-x-2 border-emerald-400 flex items-center justify-center font-bold text-emerald-300 text-xs">🎯</div>
            <!-- Wandering Reticle -->
            <div id="sniper-reticle" class="absolute top-0 bottom-0 w-4 bg-red-500 shadow-lg shadow-red-500/50 rounded-sm"></div>
          </div>
          <button id="btn-sniper-shoot" class="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm transition active:scale-95 shadow">
            💥 FEUER! [SPACE]
          </button>
        </div>
      `;

      const reticle = document.getElementById('sniper-reticle');
      const shootBtn = document.getElementById('btn-sniper-shoot');
      let pos = 0;
      let dir = 1;
      let isShot = false;
      let p1Accuracy = 0;
      let p2Accuracy = 0;

      const anim = () => {
        if (isShot) return;
        pos += dir * 4.5;
        if (pos > 130) { pos = 130; dir = -1; }
        if (pos < -130) { pos = -130; dir = 1; }
        if (reticle) reticle.style.transform = `translateX(${pos}px)`;
        requestAnimationFrame(anim);
      };
      requestAnimationFrame(anim);

      const shoot = () => {
        if (isShot) return;
        isShot = true;
        if (window.soundEngine && window.soundEngine.playWesternShot) window.soundEngine.playWesternShot();

        p1Accuracy = Math.max(0, 100 - Math.abs(pos) * 0.8);
        // Bot P2 gets random accuracy 65% - 95%
        p2Accuracy = 65 + Math.random() * 30;

        const winner = p1Accuracy >= p2Accuracy ? this.p1Idx : this.p2Idx;
        this.recordRoundWin(winner);
      };

      if (shootBtn) shootBtn.onclick = shoot;

      setTimeout(() => {
        if (!isShot) shoot();
      }, 4800);
    }

    // 4. 🔢 Code-Knacker Mikro-Duell (7s)
    runMicroCode(container) {
      const arrows = ['⬆️', '➡️', '⬇️', '⬅️'];
      const keyCodes = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
      const sequence = [];
      for (let i = 0; i < 5; i++) {
        sequence.push(Math.floor(Math.random() * 4));
      }

      let p1Step = 0;
      let p2Step = 0;
      let finished = false;

      container.innerHTML = `
        <div class="w-full flex flex-col items-center gap-2">
          <p class="text-xs text-slate-300">Tippe die 5 Pfeiltasten der Reihe nach!</p>
          <div id="code-sequence-box" class="flex gap-2.5 my-1">
            ${sequence.map((codeIdx, i) => `
              <div id="code-slot-${i}" class="w-10 h-10 rounded-xl bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-xl font-bold text-white transition-all">
                ${arrows[codeIdx]}
              </div>
            `).join('')}
          </div>
          <!-- Clickable fallback buttons for mobile/mouse -->
          <div class="grid grid-cols-4 gap-2 w-full mt-1">
            ${arrows.map((arr, i) => `
              <button class="btn-micro-code-key py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-lg font-bold text-white transition active:scale-95" data-key="${i}">
                ${arr}
              </button>
            `).join('')}
          </div>
        </div>
      `;

      const advanceCode = (playerIdx, inputIdx) => {
        if (finished) return;
        if (playerIdx === this.p1Idx) {
          if (inputIdx === sequence[p1Step]) {
            const slot = document.getElementById(`code-slot-${p1Step}`);
            if (slot) {
              slot.classList.remove('bg-slate-800', 'border-slate-600');
              slot.classList.add('bg-emerald-600', 'border-emerald-400');
            }
            p1Step++;
            if (window.soundEngine && window.soundEngine.playCoin) window.soundEngine.playCoin();
            if (p1Step >= 5) {
              finished = true;
              this.recordRoundWin(this.p1Idx);
            }
          } else {
            if (window.soundEngine && window.soundEngine.playMisfire) window.soundEngine.playMisfire();
          }
        }
      };

      container.querySelectorAll('.btn-micro-code-key').forEach(btn => {
        btn.onclick = () => {
          advanceCode(this.p1Idx, parseInt(btn.dataset.key, 10));
        };
      });

      // Bot P2 enters step every 0.6s - 0.9s
      const botInterval = setInterval(() => {
        if (finished) {
          clearInterval(botInterval);
          return;
        }
        p2Step++;
        if (p2Step >= 5) {
          finished = true;
          clearInterval(botInterval);
          this.recordRoundWin(this.p2Idx);
        }
      }, 700 + Math.random() * 250);
    }

    // 5. ⚔️ Klingen-Konter Mikro-Duell (6s)
    runMicroBlade(container) {
      container.innerHTML = `
        <div class="w-full flex flex-col items-center gap-2">
          <p class="text-xs text-slate-300">Warte auf das Signal „🔥 KONTER!“ und schlage zu!</p>
          <div id="blade-signal-box" class="w-full py-4 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center font-black text-2xl text-slate-500 font-mono my-1">
            Bereitmachen...
          </div>
          <button id="btn-blade-strike" class="hidden w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-black text-sm shadow transition active:scale-95">
            ⚔️ JETZT KONTERN! [SPACE]
          </button>
        </div>
      `;

      const signalBox = document.getElementById('blade-signal-box');
      const strikeBtn = document.getElementById('btn-blade-strike');
      let isReady = false;
      let resolved = false;

      const randomDelay = 1200 + Math.random() * 2000;
      setTimeout(() => {
        if (resolved) return;
        isReady = true;
        if (signalBox) {
          signalBox.textContent = '🔥 KONTER! 🔥';
          signalBox.classList.remove('text-slate-500');
          signalBox.classList.add('text-red-500', 'animate-pulse');
        }
        if (strikeBtn) strikeBtn.classList.remove('hidden');
        if (window.soundEngine && window.soundEngine.playSwordClash) window.soundEngine.playSwordClash();

        // Bot reaction: 380 - 650 ms
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            this.recordRoundWin(this.p2Idx);
          }
        }, 400 + Math.random() * 260);
      }, randomDelay);

      if (strikeBtn) {
        strikeBtn.onclick = () => {
          if (!isReady) {
            // Early strike penalty
            resolved = true;
            this.recordRoundWin(this.p2Idx);
          } else if (!resolved) {
            resolved = true;
            this.recordRoundWin(this.p1Idx);
          }
        };
      }
    }

    recordRoundWin(winnerIdx) {
      if (winnerIdx === this.p1Idx) this.p1Score++;
      else this.p2Score++;

      const winner = this.game.players[winnerIdx];
      const arena = document.getElementById('duel-arena-box');
      if (arena) {
        arena.innerHTML = `
          <div class="flex flex-col items-center gap-2 py-4 animate-in zoom-in-95">
            <span class="text-3xl">🏆</span>
            <span class="text-lg font-black text-yellow-300">Rundensieg für ${winner.name}!</span>
            <p class="text-xs text-slate-400">Spielstand: ${this.p1.name} ${this.p1Score} : ${this.p2Score} ${this.p2.name}</p>
          </div>
        `;
      }

      if (window.soundEngine && window.soundEngine.playCoin) window.soundEngine.playCoin();
      this.updateScoreboardUI();

      this.currentRound++;
      setTimeout(() => {
        this.startNextRound();
      }, 1600);
    }

    finishSeries() {
      const overallWinnerIdx = this.p1Score >= 2 ? this.p1Idx : this.p2Idx;
      const overallLoserIdx = overallWinnerIdx === this.p1Idx ? this.p2Idx : this.p1Idx;
      const winner = this.game.players[overallWinnerIdx];
      const loser = this.game.players[overallLoserIdx];

      // Apply wager
      if (this.wagerType === 'stars') {
        if (loser.stars > 0) {
          loser.stars -= 1;
          winner.stars += 1;
        }
      } else {
        const transfer = Math.min(this.wagerAmount, loser.coins);
        loser.coins = Math.max(0, loser.coins - transfer);
        winner.coins += transfer;
      }

      this.game.setPlayerEmote(winner, 'cheer');
      this.game.setPlayerEmote(loser, 'sad');
      if (window.soundEngine && window.soundEngine.playWinFanfare) window.soundEngine.playWinFanfare();

      const arena = document.getElementById('duel-arena-box');
      if (arena) {
        arena.innerHTML = `
          <div class="flex flex-col items-center gap-3 py-6 animate-in zoom-in-95">
            <span class="text-5xl animate-bounce">👑</span>
            <h3 class="text-2xl font-black text-amber-300">${winner.name} GEWINNT DIE DUELL-SERIE!</h3>
            <p class="text-sm font-bold text-white">Endstand: ${this.p1Score} : ${this.p2Score}</p>
            <div class="text-xs font-semibold text-yellow-400 mt-1">
              ${this.wagerType === 'stars' ? '+1 STERN übertragen!' : `+${this.wagerAmount * 2}🪙 Pott abgeräumt!`}
            </div>
          </div>
        `;
      }

      this.game.updateHUD();
      this.game.syncBoardToPeers(`⚔️ Duell-Sieg für ${winner.name} (${this.p1Score}:${this.p2Score})!`);

      setTimeout(() => {
        const modal = document.getElementById('duel-modal');
        if (modal) modal.classList.add('hidden');
        if (this.onFinishCallback) this.onFinishCallback(overallWinnerIdx);
      }, 2800);
    }
  }

  window.DuelEngine = DuelEngine;
})();
