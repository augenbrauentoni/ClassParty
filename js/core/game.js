// Central Game State Machine for "Class Party"
class PartyGame {
  constructor() {
    this.state = 'LOBBY'; // LOBBY, BOARD_TURN, MINIGAME_INTRO, MINIGAME_PLAY, MINIGAME_RESULTS, GAME_OVER
    this.round = 1;
    this.maxRounds = 10;
    this.turnIndex = 0;
    this.starTileIndex = 18;
    this.isLocalMode = false;
    this.myPlayerIndex = 0;
    this.isMoving = false;
    this.minigameHistory = [];
    this.currentMinigameInstance = null;
    this.currentMinigameMeta = null;

    this.activeDoubleDice = false;
    this.activeWishSteps = null;
    this.isTeamMode = false;
    this.usedDuelsInRound = [];

    // Default 8-9 Players mapped to the 9 Custom Class Characters
    this.players = [
      {
        id: 'p0',
        slotIndex: 0,
        name: 'Der PC-Schrauber',
        playerA: 'Schrauber A',
        playerB: 'Schrauber B',
        activePartner: 0,
        isTeam: false,
        archetype: 'pc_schrauber',
        avatar: 'assets/avatars/char1_pc_schrauber.png',
        color: '#0EA5E9',
        colorName: 'Cyber-Blau',
        colorDark: '#0369A1',
        type: 'human_online',
        coins: 10,
        stars: 0,
        boardPosition: 0,
        inventory: [],
        emote: null,
        punching: false,
        minigameWins: 0
      },
      {
        id: 'p1',
        slotIndex: 1,
        name: 'Der Feuerwehrmann',
        playerA: 'Feuerwehr A',
        playerB: 'Feuerwehr B',
        activePartner: 0,
        isTeam: false,
        archetype: 'feuerwehrmann',
        avatar: 'assets/avatars/char2_feuerwehr.png',
        color: '#EF4444',
        colorName: 'Feuer-Rot',
        colorDark: '#991B1B',
        type: 'bot',
        coins: 10,
        stars: 0,
        boardPosition: 0,
        inventory: [],
        emote: null,
        punching: false,
        minigameWins: 0
      },
      {
        id: 'p2',
        slotIndex: 2,
        name: 'Der Chill-Cap-Guy',
        playerA: 'Chill A',
        playerB: 'Chill B',
        activePartner: 0,
        isTeam: false,
        archetype: 'chill_cap',
        avatar: 'assets/avatars/char3_chill_cap.png',
        color: '#10B981',
        colorName: 'Smaragd-Grün',
        colorDark: '#065F46',
        type: 'bot',
        coins: 10,
        stars: 0,
        boardPosition: 0,
        inventory: [],
        emote: null,
        punching: false,
        minigameWins: 0
      },
      {
        id: 'p3',
        slotIndex: 3,
        name: 'Der Goldketten-Flexer',
        playerA: 'Flexer A',
        playerB: 'Flexer B',
        activePartner: 0,
        isTeam: false,
        archetype: 'goldkette',
        avatar: 'assets/avatars/char4_goldkette.png',
        color: '#F59E0B',
        colorName: 'Gold-Gelb',
        colorDark: '#B45309',
        type: 'bot',
        coins: 10,
        stars: 0,
        boardPosition: 0,
        inventory: [],
        emote: null,
        punching: false,
        minigameWins: 0
      },
      {
        id: 'p4',
        slotIndex: 4,
        name: 'Die Drachen-Königin',
        playerA: 'Königin A',
        playerB: 'Königin B',
        activePartner: 0,
        isTeam: false,
        archetype: 'drachen_koenigin',
        avatar: 'assets/avatars/char5_drachen_koenigin.png',
        color: '#EC4899',
        colorName: 'Drachen-Pink',
        colorDark: '#9D174D',
        type: 'bot',
        coins: 10,
        stars: 0,
        boardPosition: 0,
        inventory: [],
        emote: null,
        punching: false,
        minigameWins: 0
      },
      {
        id: 'p5',
        slotIndex: 5,
        name: 'Der Schoko-Coder',
        playerA: 'Coder A',
        playerB: 'Coder B',
        activePartner: 0,
        isTeam: false,
        archetype: 'schoko_coder',
        avatar: 'assets/avatars/char6_schoko_coder.png',
        color: '#854D0E',
        colorName: 'Schoko-Braun',
        colorDark: '#451A03',
        type: 'bot',
        coins: 10,
        stars: 0,
        boardPosition: 0,
        inventory: [],
        emote: null,
        punching: false,
        minigameWins: 0
      },
      {
        id: 'p6',
        slotIndex: 6,
        name: 'Der Doritos- & Energy-Gamer',
        playerA: 'Doritos A',
        playerB: 'Doritos B',
        activePartner: 0,
        isTeam: false,
        archetype: 'doritos_gamer',
        avatar: 'assets/avatars/char7_doritos_gamer.png',
        color: '#F97316',
        colorName: 'Tango-Orange',
        colorDark: '#C2410C',
        type: 'bot',
        coins: 10,
        stars: 0,
        boardPosition: 0,
        inventory: [],
        emote: null,
        punching: false,
        minigameWins: 0
      },
      {
        id: 'p7',
        slotIndex: 7,
        name: 'Der entspannte Langhaar-Dude',
        playerA: 'Dude A',
        playerB: 'Dude B',
        activePartner: 0,
        isTeam: false,
        archetype: 'langhaar_dude',
        avatar: 'assets/avatars/char8_langhaar_dude.png',
        color: '#6366F1',
        colorName: 'Indigo-Violett',
        colorDark: '#4338CA',
        type: 'bot',
        coins: 10,
        stars: 0,
        boardPosition: 0,
        inventory: [],
        emote: null,
        punching: false,
        minigameWins: 0
      },
      {
        id: 'p8',
        slotIndex: 8,
        name: 'Ultra Instinct Kämpfer',
        playerA: 'Goku A',
        playerB: 'Goku B',
        activePartner: 0,
        isTeam: false,
        archetype: 'ultra_goku',
        avatar: 'assets/avatars/char9_ultra_goku.jpg',
        color: '#38BDF8',
        colorName: 'Ultra-Silber',
        colorDark: '#0284C7',
        type: 'bot',
        coins: 10,
        stars: 0,
        boardPosition: 0,
        inventory: [],
        emote: null,
        punching: false,
        minigameWins: 0
      }
    ];

    this.boardId = 'board_1';
    this.board = new window.GameBoard(this.boardId);
    this.dice = new window.DiceRoller();
    this.bot = new window.BotController(this);
    this.boardCanvas = document.getElementById('board-canvas');
    this.boardCtx = this.boardCanvas.getContext('2d');
    this.minigameCanvas = document.getElementById('minigame-canvas');

    this.animationTime = 0;
    this.lastLoopTime = performance.now();
    this.startBoardRenderLoop();
  }

  // --- LOOP & RENDERING ---

  startBoardRenderLoop() {
    const loop = (now) => {
      const dt = (now - this.lastLoopTime) / 1000;
      this.lastLoopTime = now;
      this.animationTime += dt;

      // Countdown giant head timers
      if (this.players) {
        this.players.forEach(p => {
          if (p.giantHeadTimer && p.giantHeadTimer > 0) {
            p.giantHeadTimer -= dt;
            if (p.giantHeadTimer <= 0) p.giantHeadTimer = 0;
          }
        });
      }

      if (this.state === 'BOARD_TURN') {
        this.board.render(
          this.boardCtx,
          this.players,
          this.turnIndex,
          this.starTileIndex,
          this.animationTime
        );
      }

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // --- STATE TRANSITIONS ---

  setState(newState) {
    console.log(`State transition: ${this.state} -> ${newState}`);
    this.state = newState;
    this.updateUIForState();
  }

  updateUIForState() {
    const screens = {
      lobby: document.getElementById('screen-lobby'),
      board: document.getElementById('screen-board'),
      minigameIntro: document.getElementById('screen-minigame-intro'),
      minigamePlay: document.getElementById('screen-minigame-play'),
      minigameResults: document.getElementById('screen-minigame-results'),
      gameOver: document.getElementById('screen-game-over')
    };

    // Hide all
    Object.values(screens).forEach(el => {
      if (el) el.classList.add('hidden');
    });

    // Leave game button visibility (hide on lobby, show on board/minigame)
    const leaveBtn = document.getElementById('btn-leave-game');
    if (leaveBtn) {
      if (this.state === 'LOBBY') {
        leaveBtn.classList.add('hidden');
      } else {
        leaveBtn.classList.remove('hidden');
      }
    }

    if (this.state === 'LOBBY') {
      if (screens.lobby) screens.lobby.classList.remove('hidden');
    } else if (this.state === 'BOARD_TURN') {
      if (screens.board) screens.board.classList.remove('hidden');
      this.updateHUD();
      this.checkActiveTurn();
    } else if (this.state === 'MINIGAME_INTRO') {
      if (screens.minigameIntro) screens.minigameIntro.classList.remove('hidden');
      this.showMinigameIntro();
    } else if (this.state === 'MINIGAME_PLAY') {
      if (screens.minigamePlay) screens.minigamePlay.classList.remove('hidden');
    } else if (this.state === 'MINIGAME_RESULTS') {
      if (screens.minigameResults) screens.minigameResults.classList.remove('hidden');
    } else if (this.state === 'GAME_OVER') {
      if (screens.gameOver) screens.gameOver.classList.remove('hidden');
      this.showGameOverScreen();
    }
  }

  // --- LOBBY LOGIC ---

  startLocalGame(playersConfig, rounds, isTeamMode = false) {
    this.isLocalMode = true;
    this.isTeamMode = !!isTeamMode;
    this.maxRounds = rounds || 10;
    this.round = 1;
    this.turnIndex = 0;
    this.starTileIndex = 18;

    this.players = playersConfig.map((cfg, idx) => {
      const charObj = (window.characterRegistry && cfg.charId)
        ? window.characterRegistry.getById(cfg.charId)
        : (window.characterRegistry ? window.characterRegistry.getBySlot(idx) : null);
      const basePlayer = this.players[idx] || {};

      return {
        ...basePlayer,
        id: `p${idx}`,
        slotIndex: idx,
        name: cfg.name || (charObj ? charObj.name : (isTeamMode ? `Team ${basePlayer.colorName || idx + 1}` : `Spieler ${idx + 1}`)),
        playerA: cfg.playerA || `Spieler ${idx + 1}A`,
        playerB: cfg.playerB || `Spieler ${idx + 1}B`,
        activePartner: 0,
        isTeam: !!isTeamMode,
        archetype: charObj ? charObj.id : (basePlayer.archetype || 'pc_schrauber'),
        avatar: charObj ? charObj.avatar : (basePlayer.avatar || 'assets/avatars/char1_pc_schrauber.png'),
        color: charObj ? charObj.color : (basePlayer.color || '#EF4444'),
        colorName: charObj ? charObj.colorName : (basePlayer.colorName || 'Rot'),
        colorDark: charObj ? charObj.colorDark : (basePlayer.colorDark || '#991B1B'),
        type: cfg.type || (idx <= 1 ? 'human_local' : 'bot'),
        coins: 10,
        stars: 0,
        boardPosition: 0,
        inventory: [],
        emote: null,
        punching: false,
        minigameWins: 0
      };
    });

    this.setState('BOARD_TURN');
  }

  syncWithRoom(room, myIndex) {
    if (room.boardId && this.boardId !== room.boardId) {
      this.boardId = room.boardId;
      if (this.board && this.board.loadBoard) {
        this.board.loadBoard(this.boardId);
      }
    }
    this.round = room.round;
    this.maxRounds = room.maxRounds;
    this.turnIndex = room.turnIndex;
    this.starTileIndex = room.starTileIndex;
    this.players = (room.players || []).map((p, idx) => {
      const charObj = window.characterRegistry
        ? (p.archetype ? window.characterRegistry.getById(p.archetype) : window.characterRegistry.getBySlot(idx))
        : null;
      return {
        ...p,
        archetype: p.archetype || (charObj ? charObj.id : 'pc_schrauber'),
        avatar: p.avatar || (charObj ? charObj.avatar : '')
      };
    });
    if (typeof myIndex === 'number') {
      this.myPlayerIndex = myIndex;
    }
    this.setState(room.state);
  }

  // --- BOARD TURN LOGIC ---

  setPlayerEmote(player, emote) {
    if (!player) return;
    player.emote = emote;
    setTimeout(() => {
      if (player && player.emote === emote) player.emote = null;
    }, 2800);
  }

  addItem(playerIndex, itemKey) {
    const player = this.players[playerIndex];
    if (!player) return false;
    if (!player.inventory) player.inventory = [];
    if (player.inventory.length >= 2) {
      this.showToast(`${player.name}s Inventar ist voll (max. 2 Items)!`);
      return false;
    }
    player.inventory.push(itemKey);
    this.updateHUD();
    return true;
  }

  useItem(playerIndex, itemKey) {
    const player = this.players[playerIndex];
    if (!player || !player.inventory) return;
    const idx = player.inventory.indexOf(itemKey);
    if (idx === -1) return;
    player.inventory.splice(idx, 1);

    if (window.soundEngine) window.soundEngine.playItemUse();

    if (itemKey === 'double_dice') {
      this.activeDoubleDice = true;
      this.showToast(`🎲 ${player.name} aktiviert den Goldenen Doppel-Würfel!`);
      if (!this.isLocalMode && window.networkManager) {
        window.networkManager.sendPartyItemEffect(playerIndex, 'double_dice');
      }
    } else if (itemKey === 'shield') {
      player.hasShield = true;
      if (window.soundEngine && window.soundEngine.playShieldBlock) window.soundEngine.playShieldBlock();
      this.showToast(`🛡️ ${player.name} aktiviert ein Schutzschild gegen Klau & Bowser!`);
      if (!this.isLocalMode && window.networkManager) {
        window.networkManager.sendPartyItemEffect(playerIndex, 'shield');
      }
    } else if (itemKey === 'gold_dice') {
      this.showWishDiceSelection(playerIndex);
    } else if (itemKey === 'warp_pipe') {
      const others = this.players.map((_, i) => i).filter(i => i !== playerIndex);
      const targetIdx = others[Math.floor(Math.random() * others.length)];
      const target = this.players[targetIdx];
      const myPos = player.boardPosition;
      player.boardPosition = target.boardPosition;
      target.boardPosition = myPos;
      if (window.soundEngine) window.soundEngine.playSwap();
      this.showToast(`🧪 Warp-Röhre! ${player.name} tauscht Platz mit ${target.name}!`);
      if (!this.isLocalMode && window.networkManager) {
        window.networkManager.sendPartyItemEffect(playerIndex, 'warp_pipe', { targetIdx, myPos, targetPos: target.boardPosition });
      }
    } else if (itemKey === 'cursed_dice') {
      const opponents = this.players.filter((_, i) => i !== playerIndex);
      opponents.sort((a, b) => b.coins - a.coins);
      const target = opponents[0];
      if (target) {
        target.cursed = true;
        this.showToast(`⚡ Fluch auf ${target.name}! Nächster Wurf: maximal 3 Felder!`);
        if (!this.isLocalMode && window.networkManager) {
          window.networkManager.sendPartyItemEffect(playerIndex, 'cursed_dice', { targetName: target.name });
        }
      }
    } else if (itemKey === 'confetti_cannon') {
      this.triggerConfettiEffect();
      if (window.soundEngine && window.soundEngine.playConfettiPop) window.soundEngine.playConfettiPop();
      this.showToast(`🎉 KONFETTI-PARTY! ${player.name} lässt es krachen!`);
      if (!this.isLocalMode && window.networkManager) {
        window.networkManager.sendPartyItemEffect(playerIndex, 'confetti_cannon');
      }
    } else if (itemKey === 'party_horn') {
      this.triggerScreenShake(20);
      if (window.soundEngine && window.soundEngine.playPartyHorn) window.soundEngine.playPartyHorn();
      this.showToast(`📯 TÖÖÖÖT! ${player.name} hupt die ganze Klasse wach!`);
      if (!this.isLocalMode && window.networkManager) {
        window.networkManager.sendPartyItemEffect(playerIndex, 'party_horn');
      }
    } else if (itemKey === 'giant_head') {
      player.giantHeadTimer = 25;
      if (window.soundEngine && window.soundEngine.playGiantSound) window.soundEngine.playGiantSound();
      this.showToast(`🍄 RIESEN-KOPF! ${player.name} wächst für 25s über sich hinaus!`);
      if (!this.isLocalMode && window.networkManager) {
        window.networkManager.sendPartyItemEffect(playerIndex, 'giant_head', { duration: 25 });
      }
    } else if (itemKey === 'disco_dance') {
      this.triggerDiscoParty(7.0);
      if (window.soundEngine && window.soundEngine.playDiscoMusic) window.soundEngine.playDiscoMusic();
      this.showToast(`🪩 DISCO FEVER! ${player.name} startet eine Tanzpause für alle!`);
      if (!this.isLocalMode && window.networkManager) {
        window.networkManager.sendPartyItemEffect(playerIndex, 'disco_dance', { duration: 7 });
      }
    }
    this.updateHUD();
    this.checkActiveTurn();
  }

  showWishDiceSelection(playerIndex) {
    const modal = document.getElementById('wish-dice-modal');
    if (!modal) return;
    modal.classList.remove('hidden');

    const buttons = modal.querySelectorAll('button[data-steps]');
    buttons.forEach(btn => {
      btn.onclick = () => {
        const steps = parseInt(btn.dataset.steps, 10) || 5;
        this.activeWishSteps = steps;
        modal.classList.add('hidden');
        const player = this.players[playerIndex];
        this.showToast(`⭐ ${player ? player.name : 'Spieler'} wählt genau ${steps} Schritte für den nächsten Wurf!`);
        this.checkActiveTurn();
      };
    });

    const closeBtn = document.getElementById('btn-cancel-wish-dice') || document.getElementById('btn-close-wish-dice');
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.classList.add('hidden');
      };
    }
  }

  updateHUD() {
    // Round Counter
    const roundEl = document.getElementById('hud-round-indicator');
    if (roundEl) roundEl.textContent = `Runde ${this.round} / ${this.maxRounds}`;

    // Player Cards
    const container = document.getElementById('hud-players-container');
    if (!container) return;

    container.innerHTML = '';
    this.players.forEach((p, idx) => {
      const isActive = idx === this.turnIndex && this.state === 'BOARD_TURN';
      const card = document.createElement('div');
      card.className = `flex items-center gap-2 px-2.5 py-1.5 rounded-xl border-2 transition-all duration-300 ${
        isActive
          ? 'bg-slate-800/95 border-yellow-400 ring-2 ring-yellow-400/50 scale-105 shadow-lg z-10'
          : 'bg-slate-900/80 border-slate-700 opacity-90'
      }`;

      // Inventory icons
      const itemIcons = {
        double_dice: '🎲',
        shield: '🛡️',
        gold_dice: '⭐',
        warp_pipe: '🧪',
        cursed_dice: '⚡',
        confetti_cannon: '🎉',
        party_horn: '📯',
        giant_head: '🍄',
        disco_dance: '🪩'
      };
      const invHtml = (p.inventory && p.inventory.length > 0)
        ? `<div class="flex gap-1 text-[10px]" title="Inventar">${p.inventory.map(k => itemIcons[k] || '🎒').join(' ')}</div>`
        : '';

      const isTeam = p.isTeam || this.isTeamMode;
      const currentPartnerName = isTeam
        ? (p.activePartner === 0 ? p.playerA : p.playerB)
        : null;

      card.innerHTML = `
        <div class="relative w-9 h-9 rounded-xl border-2 overflow-hidden flex-shrink-0 shadow-md bg-slate-950 flex items-center justify-center" style="border-color: ${p.color}">
          ${p.avatar ? `<img src="${p.avatar}" alt="${p.name}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><div class="w-full h-full hidden items-center justify-center font-bold text-white text-xs" style="background-color: ${p.color}">P${idx + 1}</div>` : `<span class="font-bold text-white text-xs">P${idx + 1}</span>`}
          <span class="absolute -bottom-1 -right-1 text-[8px] px-1 rounded-full font-black text-white bg-slate-900 border" style="border-color: ${p.color}">P${idx + 1}</span>
        </div>
        <div class="flex flex-col min-w-[70px]">
          <div class="flex items-center gap-1">
            <span class="font-bold text-xs text-white truncate max-w-[110px]" title="${p.name}">${p.name}</span>
            ${p.type === 'bot' ? '<span class="text-[9px] px-1 py-0.2 rounded bg-slate-700 text-slate-300">BOT</span>' : ''}
            ${invHtml}
          </div>
          ${currentPartnerName ? `<div class="text-[10px] font-semibold text-purple-300 truncate max-w-[110px]">👤 ${currentPartnerName}</div>` : ''}
          <div class="flex items-center gap-2 text-[11px] font-semibold">
            <span class="text-amber-400">⭐ ${p.stars}</span>
            <span class="text-yellow-300">🪙 ${p.coins}</span>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  checkActiveTurn() {
    const activePlayer = this.players[this.turnIndex];
    const turnBanner = document.getElementById('hud-turn-banner');
    const rollBtn = document.getElementById('btn-roll-dice');
    const itemsContainer = document.getElementById('hud-items-container');

    if (!activePlayer) return;

    const isMyTurnOnline = !this.isLocalMode && this.turnIndex === this.myPlayerIndex && activePlayer.type === 'human_online';
    const isMyTurnLocal = this.isLocalMode && activePlayer.type === 'human_local';

    const isTeam = activePlayer.isTeam || this.isTeamMode;
    const activePartnerName = isTeam
      ? (activePlayer.activePartner === 0 ? activePlayer.playerA : activePlayer.playerB)
      : activePlayer.name;

    if (turnBanner) {
      if (isMyTurnOnline || isMyTurnLocal) {
        const whoText = isTeam ? `${activePartnerName} (${activePlayer.name})` : activePlayer.name;
        turnBanner.innerHTML = `<span class="text-yellow-300 animate-pulse font-bold">Du bist am Zug, ${whoText}!</span> Würfle jetzt!`;
      } else if (activePlayer.type === 'bot') {
        const whoText = isTeam ? `${activePartnerName} (${activePlayer.name})` : activePlayer.name;
        turnBanner.innerHTML = `<span class="text-slate-300">${whoText} (Bot) überlegt...</span>`;
      } else {
        const whoText = isTeam ? `${activePartnerName} (${activePlayer.name})` : activePlayer.name;
        turnBanner.innerHTML = `<span class="text-slate-300">${whoText} ist am Zug...</span>`;
      }
    }

    // Render clickable item chips for human turn
    if (itemsContainer) {
      itemsContainer.innerHTML = '';
      if ((isMyTurnOnline || isMyTurnLocal) && !this.isMoving && activePlayer.inventory && activePlayer.inventory.length > 0) {
        activePlayer.inventory.forEach(itemKey => {
          const itemLabels = {
            double_dice: '🎲 2x Würfel',
            shield: '🛡️ Schutzschild',
            gold_dice: '⭐ Wunsch-Würfel',
            warp_pipe: '🧪 Warp-Röhre',
            cursed_dice: '⚡ Fluch-Würfel',
            confetti_cannon: '🎉 Konfetti',
            party_horn: '📯 Party-Hupe',
            giant_head: '🍄 Riesen-Kopf',
            disco_dance: '🪩 Disco-Fieber'
          };
          const chip = document.createElement('button');
          chip.className = 'px-2.5 py-1 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs border border-indigo-400 shadow transition active:scale-95 flex items-center gap-1';
          chip.textContent = itemLabels[itemKey] || itemKey;
          chip.title = 'Item jetzt einsetzen';
          chip.onclick = () => {
            this.useItem(this.turnIndex, itemKey);
          };
          itemsContainer.appendChild(chip);
        });
      }
    }

    if (rollBtn) {
      if ((isMyTurnOnline || isMyTurnLocal) && !this.isMoving) {
        rollBtn.classList.remove('hidden');
        rollBtn.disabled = false;
      } else {
        rollBtn.classList.add('hidden');
      }
    }

    // Trigger Bot if applicable
    if (activePlayer.type === 'bot' && !this.isMoving) {
      if (this.isLocalMode || window.networkManager.isHost) {
        // Bot item use (50% chance if holding item)
        if (activePlayer.inventory && activePlayer.inventory.length > 0 && Math.random() < 0.5) {
          const itm = activePlayer.inventory[0];
          setTimeout(() => this.useItem(this.turnIndex, itm), 500);
        }
        this.bot.handleTurn(this.turnIndex);
      }
    }
  }

  executeDiceRoll() {
    if (this.isMoving || this.dice.isRolling) return;

    const activePlayer = this.players[this.turnIndex];
    if (activePlayer) {
      // Punching fist animation against dice block!
      activePlayer.punching = true;
      activePlayer.animating = true;
      setTimeout(() => {
        if (activePlayer) activePlayer.punching = false;
      }, 550);
    }

    if (!this.isLocalMode) {
      if (this.activeWishSteps) {
        const forced = this.activeWishSteps;
        this.activeWishSteps = null;
        window.networkManager.rollDice(forced);
      } else if (this.activeDoubleDice) {
        this.activeDoubleDice = false;
        const roll1 = Math.floor(Math.random() * 10) + 1;
        const roll2 = Math.floor(Math.random() * 10) + 1;
        window.networkManager.rollDice(roll1 + roll2);
      } else {
        window.networkManager.rollDice();
      }
    } else {
      let roll = Math.floor(Math.random() * 10) + 1;
      if (this.activeWishSteps) {
        roll = this.activeWishSteps;
        this.activeWishSteps = null;
        this.showToast(`⭐ WUNSCH-WÜRFEL: Exakt ${roll} gewürfelt!`);
      } else if (this.activeDoubleDice) {
        this.activeDoubleDice = false;
        const roll2 = Math.floor(Math.random() * 10) + 1;
        roll += roll2;
        this.showToast(`🎲 DOPPEL-WÜRFEL: ${roll} gewürfelt!`);
      } else if (activePlayer && activePlayer.cursed) {
        activePlayer.cursed = false;
        roll = Math.floor(Math.random() * 3) + 1;
        this.showToast(`⚡ Fluch aktiv: Nur ${roll} gewürfelt!`);
      }
      this.handleDiceRollResult(this.turnIndex, roll);
    }
  }

  handleDiceRollResult(turnIdx, rollValue) {
    const rollModal = document.getElementById('dice-roll-modal');
    const diceNumber = document.getElementById('dice-number-display');
    const rollBtn = document.getElementById('btn-roll-dice');

    if (rollBtn) rollBtn.disabled = true;
    if (rollModal) rollModal.classList.remove('hidden');

    this.dice.roll(
      rollValue,
      (val) => {
        if (diceNumber) diceNumber.textContent = val;
      },
      (finalVal) => {
        setTimeout(() => {
          if (rollModal) rollModal.classList.add('hidden');
          this.movePlayerSteps(turnIdx, finalVal);
        }, 600);
      }
    );
  }

  movePlayerSteps(playerIndex, totalSteps) {
    this.isMoving = true;
    const player = this.players[playerIndex];
    let remainingSteps = totalSteps;

    const doNextStep = () => {
      if (remainingSteps <= 0) {
        this.isMoving = false;
        this.handleTileLanding(playerIndex);
        return;
      }

      const currentTile = player.boardPosition;

      // Check if current tile is a fork
      if (this.board.isFork(currentTile)) {
        this.promptBranchChoice(playerIndex, (branchIndex) => {
          const nextTile = this.board.getNextTile(currentTile, branchIndex);
          this.animateStep(player, currentTile, nextTile, () => {
            remainingSteps--;

            // Passing Bank check: if passing over Bank before reaching destination
            if (remainingSteps > 0) {
              const tileObj = this.board.getTile(nextTile);
              if (tileObj && tileObj.type === 'bank') {
                const fee = Math.min(2, player.coins);
                if (fee > 0) {
                  player.coins -= fee;
                  this.board.jackpotCoins += fee;
                  if (window.soundEngine) window.soundEngine.playCoinLoss();
                  this.showToast(`🏦 ${player.name} zahlt ${fee}🪙 in den Jackpot! (${this.board.jackpotCoins}🪙 gesamt)`);
                  this.updateHUD();
                }
              }
            }

            this.checkStarPassage(playerIndex, nextTile, () => {
              doNextStep();
            });
          });
        });
      } else {
        const nextTile = this.board.getNextTile(currentTile, 0);
        this.animateStep(player, currentTile, nextTile, () => {
          remainingSteps--;

          // Passing Bank check: if passing over Bank before reaching destination
          if (remainingSteps > 0) {
            const tileObj = this.board.getTile(nextTile);
            if (tileObj && tileObj.type === 'bank') {
              const fee = Math.min(2, player.coins);
              if (fee > 0) {
                player.coins -= fee;
                this.board.jackpotCoins += fee;
                if (window.soundEngine) window.soundEngine.playCoinLoss();
                this.showToast(`🏦 ${player.name} zahlt ${fee}🪙 in den Jackpot! (${this.board.jackpotCoins}🪙 gesamt)`);
                this.updateHUD();
              }
            }
          }

          this.checkStarPassage(playerIndex, nextTile, () => {
            doNextStep();
          });
        });
      }
    };

    doNextStep();
  }

  animateStep(player, fromTile, toTile, onDone) {
    player.animating = true;
    player.animFrom = fromTile;
    player.animTo = toTile;
    player.animProgress = 0;

    if (window.soundEngine) window.soundEngine.playStep();

    const duration = 280; // ms per hop
    const start = performance.now();

    const stepFrame = (now) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      player.animProgress = t;

      if (t < 1) {
        requestAnimationFrame(stepFrame);
      } else {
        player.animating = false;
        player.boardPosition = toTile;

        // Dust particle effect on step landing
        const arrivedTile = this.board.getTile(toTile);
        if (arrivedTile && this.board.spawnParticles) {
          this.board.spawnParticles(arrivedTile.x, arrivedTile.y + 14, '#CBD5E1', 6, 35, 0.35);
        }

        if (!this.isLocalMode && window.networkManager.isHost) {
          window.networkManager.sendMoveStep(player.slotIndex, toTile);
        }
        onDone();
      }
    };

    requestAnimationFrame(stepFrame);
  }

  promptBranchChoice(playerIndex, onChoice) {
    const player = this.players[playerIndex];

    if (player.type === 'bot') {
      const chosen = this.bot.chooseForkBranch(player.boardPosition, this.starTileIndex);
      onChoice(chosen);
      return;
    }

    const isLocal = this.isLocalMode;
    const isMe = !isLocal && this.myPlayerIndex === playerIndex;

    if (isLocal || isMe) {
      const modal = document.getElementById('branch-modal');
      const btnCoast = document.getElementById('btn-branch-coast');
      const btnShortcut = document.getElementById('btn-branch-shortcut');
      const modalTitle = document.getElementById('branch-modal-title');
      const modalDesc = document.getElementById('branch-modal-desc');
      const btnATitle = document.getElementById('btn-branch-a-title');
      const btnASub = document.getElementById('btn-branch-a-sub');
      const btnBTitle = document.getElementById('btn-branch-b-title');
      const btnBSub = document.getElementById('btn-branch-b-sub');

      const meta = this.board.getForkMetadata(player.boardPosition);
      if (modalTitle && meta) modalTitle.textContent = meta.title;
      if (btnATitle && meta && meta.branchA) btnATitle.textContent = meta.branchA.text;
      if (btnASub && meta && meta.branchA) btnASub.textContent = meta.branchA.sub;
      if (btnBTitle && meta && meta.branchB) btnBTitle.textContent = meta.branchB.text;
      if (btnBSub && meta && meta.branchB) btnBSub.textContent = meta.branchB.sub;

      if (modal && btnCoast && btnShortcut) {
        modal.classList.remove('hidden');

        const handlerA = () => {
          modal.classList.add('hidden');
          btnCoast.removeEventListener('click', handlerA);
          btnShortcut.removeEventListener('click', handlerB);
          onChoice(0);
        };
        const handlerB = () => {
          modal.classList.add('hidden');
          btnCoast.removeEventListener('click', handlerA);
          btnShortcut.removeEventListener('click', handlerB);
          onChoice(1);
        };

        btnCoast.addEventListener('click', handlerA);
        btnShortcut.addEventListener('click', handlerB);
      } else {
        onChoice(0);
      }
    } else {
      // Remote player chooses - default fallback
      onChoice(0);
    }
  }

  checkStarPassage(playerIndex, tileIndex, onComplete) {
    if (tileIndex !== this.starTileIndex) {
      return onComplete();
    }

    const player = this.players[playerIndex];
    if (player.coins < 20) {
      this.showToast(`${player.name} hat nicht genug Münzen für den Stern (kostet 20🪙).`);
      return onComplete();
    }

    // Player can afford Star!
    if (player.type === 'bot') {
      if (this.bot.shouldBuyStar(player)) {
        this.performBuyStar(playerIndex);
      }
      onComplete();
      return;
    }

    const isLocal = this.isLocalMode;
    const isMe = !isLocal && this.myPlayerIndex === playerIndex;

    if (isLocal || isMe) {
      const modal = document.getElementById('star-modal');
      const btnYes = document.getElementById('btn-star-yes');
      const btnNo = document.getElementById('btn-star-no');

      if (modal && btnYes && btnNo) {
        modal.classList.remove('hidden');

        const handleYes = () => {
          modal.classList.add('hidden');
          btnYes.removeEventListener('click', handleYes);
          btnNo.removeEventListener('click', handleNo);
          this.performBuyStar(playerIndex);
          onComplete();
        };

        const handleNo = () => {
          modal.classList.add('hidden');
          btnYes.removeEventListener('click', handleYes);
          btnNo.removeEventListener('click', handleNo);
          onComplete();
        };

        btnYes.addEventListener('click', handleYes);
        btnNo.addEventListener('click', handleNo);
      } else {
        this.performBuyStar(playerIndex);
        onComplete();
      }
    } else {
      onComplete();
    }
  }

  performBuyStar(playerIndex) {
    const player = this.players[playerIndex];
    if (!player || player.coins < 20) return;

    player.coins -= 20;
    player.stars += 1;
    this.setPlayerEmote(player, 'cheer');

    // Pick new random star tile
    const newStarTile = this.board.getRandomStarTile(this.starTileIndex);
    this.starTileIndex = newStarTile;

    if (window.soundEngine) window.soundEngine.playStar();
    this.showToast(`⭐ ${player.name} KAUFT EINEN STERN FÜR 20 MÜNZEN! ⭐`);
    this.updateHUD();

    if (!this.isLocalMode && window.networkManager.isHost) {
      window.networkManager.sendBuyStar(playerIndex, newStarTile);
    }
  }

  syncBoardToPeers(eventMessage) {
    if (!this.isLocalMode && window.networkManager) {
      window.networkManager.syncBoardState({
        players: this.players,
        starTileIndex: this.starTileIndex,
        jackpotCoins: this.board.jackpotCoins,
        eventMessage
      });
    }
  }

  handleTileLanding(playerIndex) {
    const player = this.players[playerIndex];
    const tile = this.board.getTile(player.boardPosition);
    let coinDelta = 0;

    if (!tile) {
      this.completeTurn(playerIndex, 0);
      return;
    }

    if (tile.type === 'blue') {
      coinDelta = 3;
      player.coins += coinDelta;
      this.setPlayerEmote(player, 'cheer');
      if (window.soundEngine) window.soundEngine.playCoin();
      this.showFloatingText(player, '+3 🪙', '#3B82F6');
      if (this.board.spawnParticles) this.board.spawnParticles(tile.x, tile.y, '#60A5FA', 16, 60, 0.45);
    } else if (tile.type === 'red') {
      coinDelta = -3;
      player.coins = Math.max(0, player.coins - 3);
      this.setPlayerEmote(player, 'sad');
      if (window.soundEngine) window.soundEngine.playCoinLoss();
      this.showFloatingText(player, '-3 🪙', '#EF4444');
      if (this.board.spawnParticles) this.board.spawnParticles(tile.x, tile.y, '#F87171', 16, 60, 0.45);
    } else if (tile.type === 'bank') {
      // Jackpot tile landed on: win all accumulated jackpot coins!
      const wonJackpot = this.board.jackpotCoins || 10;
      player.coins += wonJackpot;
      this.board.jackpotCoins = 10; // reset
      this.setPlayerEmote(player, 'cheer');
      if (window.soundEngine) window.soundEngine.playJackpot();
      if (this.board.spawnParticles) this.board.spawnParticles(tile.x, tile.y, '#FBBF24', 40, 130, 0.85);
      this.showToast(`💰 JACKPOT! ${player.name} räumt ${wonJackpot} Münzen ab!`);
      this.updateHUD();
      setTimeout(() => {
        this.completeTurn(playerIndex, wonJackpot);
      }, 1500);
      return;
    } else if (tile.type === 'boost') {
      // Rocket boost tile: mini-roll 1-5 and advance immediately
      const boostSteps = Math.floor(Math.random() * 5) + 1;
      this.setPlayerEmote(player, 'cheer');
      if (window.soundEngine) window.soundEngine.playBoost();
      if (this.board.spawnParticles) this.board.spawnParticles(tile.x, tile.y, '#F97316', 30, 110, 0.75);
      this.showToast(`🚀 BOOST! ${player.name} zischt +${boostSteps} Felder vorwärts!`);
      this.updateHUD();
      setTimeout(() => {
        this.movePlayerSteps(playerIndex, boostSteps);
      }, 1000);
      return;
    } else if (tile.type === 'swap') {
      // Swap positions with a random opponent
      const opponents = [0, 1, 2, 3].filter(i => i !== playerIndex);
      const targetIdx = opponents[Math.floor(Math.random() * opponents.length)];
      const targetPlayer = this.players[targetIdx];

      const myPos = player.boardPosition;
      const targetPos = targetPlayer.boardPosition;
      player.boardPosition = targetPos;
      targetPlayer.boardPosition = myPos;

      if (window.soundEngine) window.soundEngine.playSwap();
      const myTile = this.board.getTile(targetPos);
      const targetTile = this.board.getTile(myPos);
      if (myTile && this.board.spawnParticles) this.board.spawnParticles(myTile.x, myTile.y, '#C084FC', 25, 90, 0.65);
      if (targetTile && this.board.spawnParticles) this.board.spawnParticles(targetTile.x, targetTile.y, '#C084FC', 25, 90, 0.65);

      this.showToast(`🔄 TAUSCH! ${player.name} tauscht Platz mit ${targetPlayer.name}!`);
      this.updateHUD();
      setTimeout(() => {
        this.completeTurn(playerIndex, 0);
      }, 1600);
      return;
    } else if (tile.type === 'roulette') {
      this.triggerRoulette(playerIndex);
      return;
    } else if (tile.type === 'boo') {
      this.triggerBoo(playerIndex);
      return;
    } else if (tile.type === 'bowser') {
      this.triggerBowser(playerIndex);
      return;
    } else if (tile.type === 'duel') {
      this.triggerDuel(playerIndex);
      return;
    } else if (tile.type === 'shop') {
      this.triggerShop(playerIndex);
      return;
    } else if (tile.type === 'event') {
      this.triggerBiomeEvent(playerIndex, player.boardPosition);
      return;
    } else if (tile.type === 'start') {
      coinDelta = 5;
      player.coins += coinDelta;
      this.setPlayerEmote(player, 'cheer');
      if (window.soundEngine) window.soundEngine.playCoin();
      this.showFloatingText(player, '+5 🪙 START!', '#8B5CF6');
      if (this.board.spawnParticles) this.board.spawnParticles(tile.x, tile.y, '#A78BFA', 20, 80, 0.5);
    } else if (tile.type === 'finish') {
      coinDelta = 10;
      player.coins += coinDelta;
      this.setPlayerEmote(player, 'cheer');
      if (window.soundEngine) window.soundEngine.playCoin();
      this.showFloatingText(player, '+10 🪙 ZIEL!', '#EAB308');
      if (this.board.spawnParticles) this.board.spawnParticles(tile.x, tile.y, '#FACC15', 30, 100, 0.7);
      this.showToast(`🏁 ZIEL-DURCHLAUF! ${player.name} erhält +10🪙 Runden-Bonus!`);
    }

    this.updateHUD();
    setTimeout(() => {
      this.completeTurn(playerIndex, coinDelta);
    }, 1200);
  }

  triggerRoulette(playerIndex) {
    const player = this.players[playerIndex];
    const modal = document.getElementById('roulette-modal');
    const canvas = document.getElementById('roulette-wheel-canvas');
    const resultDisplay = document.getElementById('roulette-result-display');
    const stopBtn = document.getElementById('btn-stop-roulette');

    if (!modal || !canvas) {
      this.completeTurn(playerIndex, 0);
      return;
    }

    modal.classList.remove('hidden');
    if (resultDisplay) resultDisplay.textContent = 'Dreht sich... Drücke STOPPEN!';
    if (stopBtn) {
      stopBtn.disabled = false;
      stopBtn.textContent = '🛑 JETZT STOPPEN! [SPACE]';
    }

    const segments = [
      { label: '+15 🪙', color: '#F59E0B', sub: 'Münz-Regen!' },
      { label: '⭐ Stern-Warp', color: '#3B82F6', sub: 'Direkt zum Stern!' },
      { label: '🦹 +10 Dieb', color: '#8B5CF6', sub: 'Münzen von Mitspielern klauen!' },
      { label: '⚡ Blitz (-5)', color: '#EF4444', sub: 'Alle Gegner verlieren 5🪙!' }
    ];

    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 6;

    let angle = 0;
    let speed = 0.22;
    let isStopping = false;
    let animId = null;
    let spinSoundInterval = null;

    if (window.soundEngine) {
      window.soundEngine.playRouletteSpin();
      spinSoundInterval = setInterval(() => {
        if (!isStopping && window.soundEngine) window.soundEngine.playRouletteSpin();
      }, 160);
    }

    const drawWheel = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const arc = (Math.PI * 2) / segments.length;

      for (let i = 0; i < segments.length; i++) {
        const segAngle = angle + i * arc;
        ctx.beginPath();
        ctx.fillStyle = segments[i].color;
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, segAngle, segAngle + arc);
        ctx.lineTo(cx, cy);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(segAngle + arc / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 13px sans-serif';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(segments[i].label, r - 12, 5);
        ctx.restore();
      }

      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#1E293B';
      ctx.fill();
      ctx.strokeStyle = '#FCD34D';
      ctx.lineWidth = 3;
      ctx.stroke();
    };

    const spin = () => {
      angle = (angle + speed) % (Math.PI * 2);
      drawWheel();

      if (isStopping) {
        speed *= 0.94;
        if (speed < 0.005) {
          cancelAnimationFrame(animId);
          if (spinSoundInterval) clearInterval(spinSoundInterval);
          finishSpin();
          return;
        }
      }
      animId = requestAnimationFrame(spin);
    };

    const finishSpin = () => {
      if (window.soundEngine) window.soundEngine.playRouletteStop();

      const pointerAngle = (3 * Math.PI / 2);
      const normalized = ((pointerAngle - angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      const arc = (Math.PI * 2) / segments.length;
      const chosenIndex = Math.floor(normalized / arc) % segments.length;
      const outcome = segments[chosenIndex];

      if (resultDisplay) {
        resultDisplay.textContent = `🎯 ${outcome.label} — ${outcome.sub}`;
      }

      if (chosenIndex === 0) {
        player.coins += 15;
        this.setPlayerEmote(player, 'cheer');
      } else if (chosenIndex === 1) {
        player.boardPosition = this.starTileIndex;
        this.setPlayerEmote(player, 'cheer');
        if (window.soundEngine) window.soundEngine.playSwap();
      } else if (chosenIndex === 2) {
        let stolenTotal = 0;
        this.players.forEach((p, idx) => {
          if (idx !== playerIndex) {
            const stealAmount = Math.min(3, p.coins);
            p.coins -= stealAmount;
            stolenTotal += stealAmount;
            this.setPlayerEmote(p, 'sad');
          }
        });
        player.coins += stolenTotal;
        this.setPlayerEmote(player, 'cheer');
      } else if (chosenIndex === 3) {
        this.players.forEach((p, idx) => {
          if (idx !== playerIndex) {
            p.coins = Math.max(0, p.coins - 5);
            this.setPlayerEmote(p, 'sad');
          }
        });
        if (window.soundEngine) window.soundEngine.playCoinLoss();
      }

      this.updateHUD();
      this.syncBoardToPeers(`🎰 Glücksrad: ${player.name} gewinnt ${outcome.label}!`);

      setTimeout(() => {
        modal.classList.add('hidden');
        this.completeTurn(playerIndex, 0);
      }, 2400);
    };

    const stopSpin = () => {
      if (isStopping) return;
      isStopping = true;
      if (stopBtn) {
        stopBtn.disabled = true;
        stopBtn.textContent = 'Verlangsamt...';
      }
    };

    if (stopBtn) stopBtn.onclick = stopSpin;

    const isBot = player.type === 'bot';
    if (isBot) {
      setTimeout(stopSpin, 1200 + Math.random() * 800);
    }

    spin();
  }

  triggerBoo(playerIndex) {
    const player = this.players[playerIndex];
    const modal = document.getElementById('boo-modal');
    const optionsContainer = document.getElementById('boo-options-container');
    const targetsContainer = document.getElementById('boo-targets-container');
    const targetsList = document.getElementById('boo-targets-list');
    const btnCoins = document.getElementById('btn-boo-steal-coins');
    const btnStar = document.getElementById('btn-boo-steal-star');
    const btnCancel = document.getElementById('btn-boo-cancel');

    if (!modal) {
      this.completeTurn(playerIndex, 0);
      return;
    }

    if (window.soundEngine) window.soundEngine.playBooLaugh();

    modal.classList.remove('hidden');
    if (optionsContainer) optionsContainer.classList.remove('hidden');
    if (targetsContainer) targetsContainer.classList.add('hidden');

    const canAffordStar = player.coins >= 30;
    if (btnStar) {
      if (canAffordStar) {
        btnStar.classList.remove('opacity-40', 'pointer-events-none');
      } else {
        btnStar.classList.add('opacity-40', 'pointer-events-none');
      }
    }

    let selectedAction = null;

    const showVictimSelection = (mode) => {
      selectedAction = mode;
      if (optionsContainer) optionsContainer.classList.add('hidden');
      if (targetsContainer) targetsContainer.classList.remove('hidden');
      if (targetsList) {
        targetsList.innerHTML = '';
        this.players.forEach((p, idx) => {
          if (idx === playerIndex) return;
          const btn = document.createElement('button');
          btn.className = 'p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 flex flex-col items-center gap-1 transition';
          btn.innerHTML = `
            <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs" style="background-color: ${p.color}">
              P${idx + 1}
            </div>
            <span class="font-bold text-xs text-white truncate max-w-full">${p.name}</span>
            <div class="flex items-center gap-1.5 text-[11px] font-semibold">
              <span class="text-amber-400">⭐${p.stars}</span>
              <span class="text-yellow-300">🪙${p.coins}</span>
            </div>
          `;
          btn.onclick = () => executeBooSteal(idx);
          targetsList.appendChild(btn);
        });
      }
    };

    const executeBooSteal = (victimIndex) => {
      const victim = this.players[victimIndex];
      if (!victim) return;

      if (victim.hasShield) {
        victim.hasShield = false;
        if (window.soundEngine && window.soundEngine.playShieldBlock) {
          window.soundEngine.playShieldBlock();
        }
        this.showToast(`🛡️ SCHUTZSCHILD! ${victim.name} wehrt Boo komplett ab!`);
        this.setPlayerEmote(victim, 'cheer');
        this.setPlayerEmote(player, 'sad');
        this.updateHUD();
        this.syncBoardToPeers(`🛡️ ${victim.name} hat Boo mit Schutzschild abgewehrt!`);
        setTimeout(() => {
          modal.classList.add('hidden');
          this.completeTurn(playerIndex, 0);
        }, 2000);
        return;
      }

      if (window.soundEngine) window.soundEngine.playBooLaugh();

      if (selectedAction === 'star') {
        if (player.coins >= 30 && victim.stars > 0) {
          player.coins -= 30;
          victim.stars -= 1;
          player.stars += 1;
          this.setPlayerEmote(player, 'cheer');
          this.setPlayerEmote(victim, 'sad');
          this.showToast(`👻 BOO STIEHLT EINEN STERN von ${victim.name} für ${player.name}!`);
        } else {
          const amount = Math.min(victim.coins, Math.floor(Math.random() * 6) + 5);
          victim.coins -= amount;
          player.coins += amount;
          this.setPlayerEmote(player, 'cheer');
          this.setPlayerEmote(victim, 'sad');
          this.showToast(`👻 ${victim.name} hatte keine Sterne! Boo stiehlt ${amount}🪙!`);
        }
      } else {
        const amount = Math.min(victim.coins, Math.floor(Math.random() * 6) + 5);
        victim.coins -= amount;
        player.coins += amount;
        this.setPlayerEmote(player, 'cheer');
        this.setPlayerEmote(victim, 'sad');
        this.showToast(`👻 Boo stiehlt ${amount}🪙 von ${victim.name}!`);
      }

      this.updateHUD();
      this.syncBoardToPeers(`👻 Boo-Klau auf ${victim.name}!`);

      setTimeout(() => {
        modal.classList.add('hidden');
        this.completeTurn(playerIndex, 0);
      }, 2000);
    };

    if (btnCoins) btnCoins.onclick = () => showVictimSelection('coins');
    if (btnStar) btnStar.onclick = () => showVictimSelection('star');
    if (btnCancel) {
      btnCancel.onclick = () => {
        modal.classList.add('hidden');
        this.completeTurn(playerIndex, 0);
      };
    }

    if (player.type === 'bot') {
      setTimeout(() => {
        const opponents = this.players
          .map((p, idx) => ({ player: p, idx }))
          .filter(o => o.idx !== playerIndex);

        const starRivals = opponents.filter(o => o.player.stars > 0);
        if (canAffordStar && starRivals.length > 0) {
          starRivals.sort((a, b) => b.player.stars - a.player.stars);
          selectedAction = 'star';
          executeBooSteal(starRivals[0].idx);
        } else {
          opponents.sort((a, b) => b.player.coins - a.player.coins);
          selectedAction = 'coins';
          executeBooSteal(opponents[0].idx);
        }
      }, 1300);
    }
  }

  triggerBowser(playerIndex) {
    const player = this.players[playerIndex];
    const modal = document.getElementById('bowser-modal');
    const titleEl = document.getElementById('bowser-event-title');
    const descEl = document.getElementById('bowser-event-desc');
    const iconEl = document.getElementById('bowser-event-icon');
    const okBtn = document.getElementById('btn-bowser-ok');

    if (!modal) {
      this.completeTurn(playerIndex, 0);
      return;
    }

    modal.classList.remove('hidden');
    this.setPlayerEmote(player, 'sad');
    if (window.soundEngine) window.soundEngine.playBowserRoar();

    if (okBtn) okBtn.classList.add('hidden');
    if (titleEl) titleEl.textContent = 'Bowser-Rad dreht sich...';
    if (descEl) descEl.textContent = 'Welches Unheil droht der Runde?!';

    const bowserEvents = [
      {
        icon: '⚖️',
        title: 'Münz-Kommunismus!',
        desc: 'Bowser wirft alle Münzen in einen Topf und teilt sie absolut gleichmäßig auf alle 4 Spieler auf!',
        run: () => {
          const totalCoins = this.players.reduce((sum, p) => sum + p.coins, 0);
          const split = Math.floor(totalCoins / 4);
          this.players.forEach(p => {
            p.coins = split;
          });
          if (window.soundEngine) window.soundEngine.playJackpot();
        }
      },
      {
        icon: '⭐💨',
        title: 'Sternen-Flucht!',
        desc: 'Bowser brüllt und verscheucht den Stern ans andere Ende des Bretts! (Und stiehlt 1 Stern, falls vorhanden)',
        run: () => {
          this.starTileIndex = this.board.getRandomStarTile(this.starTileIndex);
          if (player.stars > 0) player.stars -= 1;
          if (window.soundEngine) window.soundEngine.playCoinLoss();
        }
      },
      {
        icon: '🔥',
        title: '10-Münzen Chaos-Steuer!',
        desc: 'Jeder Spieler muss 10 Münzen Chaos-Steuer an Bowser entrichten!',
        run: () => {
          this.players.forEach(p => {
            if (p.hasShield) {
              p.hasShield = false;
              if (window.soundEngine && window.soundEngine.playShieldBlock) window.soundEngine.playShieldBlock();
              this.showToast(`🛡️ ${p.name}s Schutzschild blockiert Bowsers Steuer!`);
              return;
            }
            p.coins = Math.max(0, p.coins - 10);
            this.setPlayerEmote(p, 'sad');
          });
          if (window.soundEngine) window.soundEngine.playCoinLoss();
        }
      }
    ];

    let shuffleTicks = 0;
    const interval = setInterval(() => {
      shuffleTicks++;
      const tempEv = bowserEvents[shuffleTicks % bowserEvents.length];
      if (iconEl) iconEl.textContent = tempEv.icon;
      if (titleEl) titleEl.textContent = tempEv.title;

      if (shuffleTicks >= 12) {
        clearInterval(interval);
        const finalEv = bowserEvents[Math.floor(Math.random() * bowserEvents.length)];
        if (iconEl) iconEl.textContent = finalEv.icon;
        if (titleEl) titleEl.textContent = finalEv.title;
        if (descEl) descEl.textContent = finalEv.desc;

        finalEv.run();
        this.updateHUD();
        this.syncBoardToPeers(`👹 Bowser: ${finalEv.title}`);

        if (okBtn) {
          okBtn.classList.remove('hidden');
          okBtn.onclick = () => {
            modal.classList.add('hidden');
            this.completeTurn(playerIndex, 0);
          };
        }

        if (player.type === 'bot') {
          setTimeout(() => {
            modal.classList.add('hidden');
            this.completeTurn(playerIndex, 0);
          }, 2600);
        }
      }
    }, 110);
  }

  triggerDuel(playerIndex) {
    const player = this.players[playerIndex];
    const opponents = this.players.map((_, i) => i).filter(i => i !== playerIndex);
    if (opponents.length === 0) {
      this.completeTurn(playerIndex, 0);
      return;
    }
    const opponentIdx = opponents[Math.floor(Math.random() * opponents.length)];
    const opponent = this.players[opponentIdx];

    const wagerType = (player.stars > 0 && opponent.stars > 0 && Math.random() < 0.25) ? 'stars' : 'coins';
    const wagerAmount = Math.max(5, Math.min(10, Math.min(player.coins, opponent.coins)));

    if (window.DuelEngine) {
      if (!this.duelEngine) {
        this.duelEngine = new window.DuelEngine(this);
      }
      this.duelEngine.startSeries(playerIndex, opponentIdx, { type: wagerType, amount: wagerAmount }, () => {
        this.completeTurn(playerIndex, 0);
      });
      return;
    }

    const modal = document.getElementById('duel-modal');
    const p1Avatar = document.getElementById('duel-p1-avatar');
    const p1Name = document.getElementById('duel-p1-name');
    const p2Avatar = document.getElementById('duel-p2-avatar');
    const p2Name = document.getElementById('duel-p2-name');
    const statusText = document.getElementById('duel-status-text');
    const triggerBadge = document.getElementById('duel-trigger-badge');
    const strikeBtn = document.getElementById('btn-duel-strike');
    const winnerBanner = document.getElementById('duel-winner-banner');

    if (!modal) {
      this.completeTurn(playerIndex, 0);
      return;
    }

    if (window.soundEngine) window.soundEngine.playSwordClash();

    const pot = wagerAmount * 2;

    modal.classList.remove('hidden');
    if (winnerBanner) {
      winnerBanner.classList.add('hidden');
      winnerBanner.textContent = '';
    }
    if (strikeBtn) strikeBtn.classList.add('hidden');
    if (statusText) statusText.textContent = `Einsatz: ${wagerAmount}🪙 pro Spieler (Gesamtpot: ${pot}🪙)`;

    if (p1Avatar) {
      p1Avatar.style.backgroundColor = player.color;
      p1Avatar.textContent = `P${playerIndex + 1}`;
    }
    if (p1Name) p1Name.textContent = player.name;

    if (p2Avatar) {
      p2Avatar.style.backgroundColor = opponent.color;
      p2Avatar.textContent = `P${opponentIdx + 1}`;
    }
    if (p2Name) p2Name.textContent = opponent.name;

    let duelState = 'countdown';
    let count = 3;
    if (triggerBadge) triggerBadge.textContent = count;

    const countInterval = setInterval(() => {
      count--;
      if (count > 0) {
        if (triggerBadge) triggerBadge.textContent = count;
        if (window.soundEngine) window.soundEngine.playCountdown(count);
      } else {
        clearInterval(countInterval);
        duelState = 'waiting';
        if (triggerBadge) triggerBadge.textContent = '...';
        if (statusText) statusText.textContent = 'Achtung... gleich zuschlagen!';

        const delay = 1000 + Math.random() * 1400;
        setTimeout(() => {
          if (duelState === 'finished') return;
          duelState = 'active';
          if (triggerBadge) {
            triggerBadge.textContent = '🔥 JETZT! 🔥';
            triggerBadge.classList.add('text-red-500', 'animate-pulse');
          }
          if (strikeBtn) strikeBtn.classList.remove('hidden');
          if (window.soundEngine) window.soundEngine.playHit();

          const botTime = 380 + Math.random() * 300;
          setTimeout(() => {
            if (duelState === 'active') {
              resolveDuel(opponentIdx);
            }
          }, botTime);
        }, delay);
      }
    }, 800);

    const resolveDuel = (winnerIdx) => {
      if (duelState === 'finished') return;
      duelState = 'finished';

      if (strikeBtn) strikeBtn.classList.add('hidden');

      const loserIdx = winnerIdx === playerIndex ? opponentIdx : playerIndex;
      const winner = this.players[winnerIdx];
      const loser = this.players[loserIdx];

      loser.coins = Math.max(0, loser.coins - wager);
      winner.coins += wager;

      this.setPlayerEmote(winner, 'cheer');
      this.setPlayerEmote(loser, 'sad');
      if (window.soundEngine) window.soundEngine.playWinFanfare();

      if (winnerBanner) {
        winnerBanner.textContent = `🏆 ${winner.name} gewinnt das Duell (+${pot}🪙 Pot)!`;
        winnerBanner.classList.remove('hidden');
      }

      this.updateHUD();
      this.syncBoardToPeers(`⚔️ Duell-Sieg für ${winner.name} (+${pot}🪙)!`);

      setTimeout(() => {
        modal.classList.add('hidden');
        this.completeTurn(playerIndex, 0);
      }, 2400);
    };

    if (strikeBtn) {
      strikeBtn.onclick = () => {
        if (duelState === 'waiting') {
          if (window.soundEngine) window.soundEngine.playMisfire();
          resolveDuel(opponentIdx);
        } else if (duelState === 'active') {
          resolveDuel(playerIndex);
        }
      };
    }
  }

  triggerShop(playerIndex) {
    const player = this.players[playerIndex];
    const modal = document.getElementById('shop-modal');
    const closeBtn = document.getElementById('btn-close-shop');

    if (!modal) {
      this.completeTurn(playerIndex, 0);
      return;
    }

    if (window.soundEngine) window.soundEngine.playItemBuy();
    modal.classList.remove('hidden');

    const itemCosts = {
      double_dice: 10,
      shield: 8,
      gold_dice: 12,
      warp_pipe: 12,
      cursed_dice: 7,
      confetti_cannon: 5,
      party_horn: 4,
      giant_head: 6,
      disco_dance: 5
    };

    const updateButtons = () => {
      const invFull = player.inventory && player.inventory.length >= 2;
      document.querySelectorAll('#shop-modal .btn-buy-item').forEach(btn => {
        const itemKey = btn.dataset.item;
        const cost = itemCosts[itemKey] || 10;
        const canAfford = player.coins >= cost && !invFull;

        if (canAfford) {
          btn.disabled = false;
          btn.classList.remove('opacity-40', 'pointer-events-none');
        } else {
          btn.disabled = true;
          btn.classList.add('opacity-40', 'pointer-events-none');
        }
      });
    };

    updateButtons();

    document.querySelectorAll('#shop-modal .btn-buy-item').forEach(btn => {
      btn.onclick = () => {
        const itemKey = btn.dataset.item;
        const cost = itemCosts[itemKey] || 10;
        if (player.coins >= cost && (!player.inventory || player.inventory.length < 2)) {
          player.coins -= cost;
          this.addItem(playerIndex, itemKey);
          if (window.soundEngine) window.soundEngine.playItemBuy();
          this.showToast(`🛒 ${player.name} hat ${itemKey} gekauft!`);
          this.updateHUD();
          updateButtons();
          this.syncBoardToPeers(`🛒 ${player.name} kauft Item ${itemKey}`);
        }
      };
    });

    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.classList.add('hidden');
        this.completeTurn(playerIndex, 0);
      };
    }

    if (player.type === 'bot') {
      setTimeout(() => {
        if (!player.inventory || player.inventory.length < 2) {
          const affordable = Object.keys(itemCosts).filter(k => player.coins >= itemCosts[k]);
          if (affordable.length > 0) {
            const chosen = affordable[Math.floor(Math.random() * affordable.length)];
            player.coins -= itemCosts[chosen];
            this.addItem(playerIndex, chosen);
            if (window.soundEngine) window.soundEngine.playItemBuy();
            this.showToast(`🛒 ${player.name} (Bot) kauft ein Item!`);
            this.updateHUD();
          }
        }
        modal.classList.add('hidden');
        this.completeTurn(playerIndex, 0);
      }, 1500);
    }
  }

  triggerBiomeEvent(playerIndex, tileIndex) {
    const player = this.players[playerIndex];
    const biomeEv = this.board.getBiomeEvent(tileIndex);
    const modal = document.getElementById('event-modal');
    const titleEl = document.getElementById('event-title');
    const descEl = document.getElementById('event-desc');
    const iconEl = document.getElementById('event-icon');
    const box = document.getElementById('event-interactive-box');

    if (window.soundEngine) window.soundEngine.playEvent();

    const biomeIcons = {
      egypt: '🏜️',
      ocean: '🐬',
      space: '🚀',
      city: '🏙️',
      island: '🐬',
      jungle: '🌴',
      ghost_town: '👻',
      school: '🏫',
      desert: '🏜️'
    };

    if (iconEl) iconEl.textContent = biomeIcons[biomeEv.biome] || '🗺️';
    if (titleEl) titleEl.textContent = biomeEv.title;
    if (descEl) descEl.textContent = `${player.name}: ${biomeEv.desc}`;
    if (box) box.innerHTML = '';
    if (modal) modal.classList.remove('hidden');

    let moveForward = 0;
    let moveBackward = 0;

    if (biomeEv.coins) {
      player.coins += biomeEv.coins;
      this.setPlayerEmote(player, 'cheer');
      if (window.soundEngine) window.soundEngine.playCoin();
      this.showFloatingText(player, `+${biomeEv.coins} 🪙`, '#F59E0B');
    } else if (biomeEv.advance) {
      moveForward = biomeEv.advance;
      this.setPlayerEmote(player, 'cheer');
      if (window.soundEngine) window.soundEngine.playBoost();
    } else if (biomeEv.item) {
      this.addItem(playerIndex, biomeEv.item);
      this.setPlayerEmote(player, 'cheer');
    } else if (biomeEv.effect === 'dolphin_wave') {
      moveForward = biomeEv.advance || 5;
      this.setPlayerEmote(player, 'cheer');
      if (window.soundEngine) window.soundEngine.playBoost();
    } else if (biomeEv.effect === 'liana_swing') {
      moveForward = biomeEv.advance || 4;
      this.setPlayerEmote(player, 'cheer');
      if (window.soundEngine) window.soundEngine.playBoost();
    } else if (biomeEv.effect === 'plant_bite') {
      player.coins = Math.max(0, player.coins - (biomeEv.damage || 5));
      this.setPlayerEmote(player, 'sad');
      if (window.soundEngine) window.soundEngine.playCoinLoss();
    } else if (biomeEv.effect === 'ghost_spook') {
      const opponents = this.players.filter((_, idx) => idx !== playerIndex);
      opponents.sort((a, b) => b.coins - a.coins);
      const target = opponents[0];
      if (target && target.coins > 0) {
        const stolen = Math.min(4, target.coins);
        target.coins -= stolen;
        player.coins += stolen;
        this.setPlayerEmote(player, 'cheer');
        this.setPlayerEmote(target, 'sad');
        if (descEl) descEl.textContent = `👻 Ein Geist stiehlt ${stolen}🪙 von ${target.name} und schenkt sie ${player.name}!`;
      } else {
        player.coins += 4;
        this.setPlayerEmote(player, 'cheer');
      }
      if (window.soundEngine) window.soundEngine.playBooLaugh();
    } else if (biomeEv.effect === 'pharaoh_treasure') {
      player.coins += (biomeEv.coins || 15);
      this.setPlayerEmote(player, 'cheer');
      if (window.soundEngine) window.soundEngine.playJackpot();
    } else if (biomeEv.effect === 'quicksand') {
      moveBackward = biomeEv.retreat || 4;
      this.setPlayerEmote(player, 'sad');
      if (window.soundEngine) window.soundEngine.playCoinLoss();
    } else if (biomeEv.effect === 'surprise_quiz') {
      const q = window.QuestionBank ? window.QuestionBank.getRandom(1)[0] : {
        question: 'Welches Protokoll sorgt für dynamische IP-Zuweisung?',
        options: ['DHCP', 'DNS', 'HTTP', 'SMTP'],
        correct: 0,
        explanation: 'DHCP weist automatisch Netzwerkkonfigurationen zu.'
      };

      if (descEl) descEl.textContent = `${player.name}: Beantworte diese Frage für +12🪙! (Falsch: -5🪙)`;

      if (box) {
        box.innerHTML = `
          <div class="flex flex-col gap-2 w-full text-left">
            <div class="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white">${q.question}</div>
            <div class="grid grid-cols-2 gap-2" id="quiz-event-options">
              ${q.options.map((opt, i) => `
                <button class="btn-event-quiz-opt p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-white transition active:scale-95 text-left" data-opt="${i}">
                  <span class="text-amber-400 font-bold">${['A', 'B', 'C', 'D'][i]}:</span> ${opt}
                </button>
              `).join('')}
            </div>
            <div id="quiz-event-feedback" class="text-xs font-bold text-center min-h-[18px]"></div>
          </div>
        `;

        let resolvedQuiz = false;
        const answerQuiz = (chosenOpt) => {
          if (resolvedQuiz) return;
          resolvedQuiz = true;
          const fb = document.getElementById('quiz-event-feedback');
          const isCorrect = chosenOpt === q.correct;
          if (isCorrect) {
            player.coins += 12;
            this.setPlayerEmote(player, 'cheer');
            if (fb) {
              fb.textContent = `🎉 Richtig (Note 1)! +12🪙 erhalten!`;
              fb.className = 'text-xs font-bold text-emerald-400 text-center animate-bounce';
            }
            if (window.soundEngine) window.soundEngine.playWinFanfare();
          } else {
            player.coins = Math.max(0, player.coins - 5);
            this.setPlayerEmote(player, 'sad');
            if (fb) {
              fb.textContent = `❌ Falsch (Nachsitzen)! Richtige Antwort: ${q.options[q.correct]} (-5🪙)`;
              fb.className = 'text-xs font-bold text-red-400 text-center';
            }
            if (window.soundEngine) window.soundEngine.playCoinLoss();
          }
          this.updateHUD();
          this.syncBoardToPeers(`📝 Quiz auf Feld #${tileIndex}: ${player.name} hat ${isCorrect ? 'bestanden (+12🪙)' : 'verfehlt (-5🪙)'}!`);

          setTimeout(() => {
            if (modal) modal.classList.add('hidden');
            this.completeTurn(playerIndex, 0);
          }, 1800);
        };

        box.querySelectorAll('.btn-event-quiz-opt').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const opt = parseInt(e.currentTarget.dataset.opt, 10);
            answerQuiz(opt);
          });
        });

        if (player.type === 'bot') {
          setTimeout(() => {
            if (!resolvedQuiz) {
              const isCorrect = Math.random() < 0.75;
              const chosen = isCorrect ? q.correct : ((q.correct + 1) % 4);
              answerQuiz(chosen);
            }
          }, 1400);
        }
      }
      return; // Async completion
    }

    this.updateHUD();
    this.syncBoardToPeers(`🗺️ ${player.name} löst Biome-Event aus: ${biomeEv.title}`);

    setTimeout(() => {
      if (modal) modal.classList.add('hidden');
      if (moveForward > 0) {
        this.movePlayerSteps(playerIndex, moveForward);
      } else if (moveBackward > 0) {
        player.boardPosition = (player.boardPosition - moveBackward + 66) % 66;
        this.updateHUD();
        this.completeTurn(playerIndex, 0);
      } else {
        this.completeTurn(playerIndex, 0);
      }
    }, 2400);
  }

  triggerRandomEvent(playerIndex) {
    this.triggerBiomeEvent(playerIndex, this.players[playerIndex].boardPosition);
  }

  completeTurn(playerIndex, coinDelta) {
    if (!this.isLocalMode) {
      window.networkManager.sendTurnCompleted(playerIndex, coinDelta, this.players[playerIndex].boardPosition);
      return;
    }

    // Local mode advancement (up to total players)
    if (this.turnIndex < this.players.length - 1) {
      this.turnIndex += 1;
      this.updateHUD();
      this.checkActiveTurn();
    } else {
      // Round completed! Start Minigame
      this.turnIndex = 0;
      this.startMinigameSequence();
    }
  }

  showMinigameIntro() {
    if (this.currentMinigameMeta) {
      const meta = this.currentMinigameMeta;
      const titleEl = document.getElementById('intro-game-title');
      const descEl = document.getElementById('intro-game-desc');
      const controlsOnlineEl = document.getElementById('intro-controls-online');
      const controlsLocalEl = document.getElementById('intro-controls-local');
      const goalEl = document.getElementById('intro-goal');
      const iconEl = document.getElementById('intro-icon');
      const actionLabel = document.getElementById('intro-action-label');
      const tipsEl = document.getElementById('intro-tip-text') || document.getElementById('intro-tips');
      const readyStatus = document.getElementById('intro-ready-status');

      if (titleEl) titleEl.textContent = `${meta.name} (${meta.subtitle || ''})`;
      if (descEl) descEl.textContent = meta.description;
      if (controlsOnlineEl) controlsOnlineEl.textContent = meta.controls.online;
      if (controlsLocalEl) controlsLocalEl.textContent = meta.controls.local;
      if (goalEl) goalEl.textContent = meta.controls.goal || meta.description;
      if (iconEl) iconEl.textContent = meta.icon;
      if (actionLabel) {
        actionLabel.textContent = meta.actionLabel || (meta.controls && meta.controls.action) || 'Springen / Aktion';
      }
      if (tipsEl) {
        tipsEl.textContent = meta.tip || 'Tipp: Bleibe in Bewegung, reagiere blitzschnell und sammle Punkte!';
      }
      if (readyStatus) {
        readyStatus.textContent = '⏳ Bereit machen... Klicke "Ich bin bereit!" oder drücke [LEERTASTE]';
      }
    }
  }

  // --- MINIGAME SEQUENCE ---

  startMinigameSequence() {
    // Pick random minigame (all 13 minigames fully playable)
    const available = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    let nextGameId;
    const recent = this.minigameHistory.slice(-2);
    do {
      nextGameId = available[Math.floor(Math.random() * available.length)];
    } while (recent.includes(nextGameId) && available.length > 2);

    const seed = Math.floor(Math.random() * 1000000);
    this.minigameHistory.push(nextGameId);
    this.currentMinigameMeta = window.minigameRegistry.get(nextGameId);
    this.currentMinigameSeed = seed;

    this.setState('MINIGAME_INTRO');
    this.prepareMinigame(nextGameId, seed);
  }

  prepareMinigame(gameId, seed) {
    const meta = window.minigameRegistry.get(gameId);
    this.currentMinigameMeta = meta;
    this.currentMinigameSeed = seed || Math.floor(Math.random() * 1000000);

    this.showMinigameIntro();
    this.startMinigameCountdown();
  }

  startMinigameCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }

    const countdownEl = document.getElementById('intro-countdown-timer');
    let count = 7;
    if (countdownEl) countdownEl.textContent = count;

    if (window.soundEngine) window.soundEngine.playCountdown(count);

    // Instant start button
    const btnStartNow = document.getElementById('btn-start-minigame-now');
    if (btnStartNow) {
      btnStartNow.onclick = () => {
        const readyStatus = document.getElementById('intro-ready-status');
        if (readyStatus) readyStatus.textContent = '✅ Du bist BEREIT! Spiel startet...';
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
        }
        this.launchMinigame();
      };
    }

    this.countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        if (countdownEl) countdownEl.textContent = count;
        if (window.soundEngine) window.soundEngine.playCountdown(count);
      } else if (count === 0) {
        if (countdownEl) countdownEl.textContent = 'LOS!';
        if (window.soundEngine) window.soundEngine.playCountdown('GO');
      } else {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
        this.launchMinigame();
      }
    }, 1000);
  }

  launchMinigame() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }

    if (this.currentMinigameInstance) {
      try {
        this.currentMinigameInstance.stop();
      } catch (e) {
        console.warn('Error stopping previous minigame instance', e);
      }
      this.currentMinigameInstance = null;
    }

    this.setState('MINIGAME_PLAY');

    // Instantiate active minigame
    this.currentMinigameInstance = this.currentMinigameMeta.create(
      this.minigameCanvas,
      this.players,
      {
        seed: this.currentMinigameSeed,
        isHost: this.isLocalMode || (window.networkManager && window.networkManager.isHost),
        isLocalMode: this.isLocalMode,
        onEnd: (rankings) => this.handleMinigameFinished(rankings)
      }
    );

    this.currentMinigameInstance.init();
    this.currentMinigameInstance.start();
  }

  testMinigameDirectly(gameId) {
    const testModal = document.getElementById('test-minigame-modal');
    if (testModal) testModal.classList.add('hidden');

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }

    if (this.currentMinigameInstance) {
      try {
        this.currentMinigameInstance.stop();
      } catch (e) {}
      this.currentMinigameInstance = null;
    }

    this.isLocalMode = true;
    if (!this.players || this.players.length === 0) {
      this.players = [
        { id: 'p0', slotIndex: 0, name: 'Spieler 1 (Rot)', color: '#EF4444', colorName: 'Rot', colorDark: '#991B1B', type: 'human_local', coins: 10, stars: 0, boardPosition: 0, minigameWins: 0 },
        { id: 'p1', slotIndex: 1, name: 'Spieler 2 (Blau)', color: '#3B82F6', colorName: 'Blau', colorDark: '#1E40AF', type: 'human_local', coins: 10, stars: 0, boardPosition: 0, minigameWins: 0 },
        { id: 'p2', slotIndex: 2, name: 'Spieler 3 (Grün)', color: '#10B981', colorName: 'Grün', colorDark: '#065F46', type: 'bot', coins: 10, stars: 0, boardPosition: 0, minigameWins: 0 },
        { id: 'p3', slotIndex: 3, name: 'Spieler 4 (Gelb)', color: '#F59E0B', colorName: 'Gelb', colorDark: '#92400E', type: 'bot', coins: 10, stars: 0, boardPosition: 0, minigameWins: 0 }
      ];
    }

    const meta = window.minigameRegistry.get(gameId);
    if (!meta) {
      console.error(`Minigame ${gameId} not found in registry!`);
      return;
    }

    this.currentMinigameMeta = meta;
    this.currentMinigameSeed = Math.floor(Math.random() * 1000000);
    this.setState('MINIGAME_INTRO');
    this.prepareMinigame(gameId, this.currentMinigameSeed);
  }

  handleMinigameFinished(rankings) {
    if (this.currentMinigameInstance) {
      this.currentMinigameInstance.stop();
    }

    if (!this.isLocalMode) {
      window.networkManager.sendMinigameFinished(rankings);
      return;
    }

    // Local mode reward calculation (scaled for up to 8 players)
    const REWARDS = [15, 10, 7, 5, 3, 2, 1, 0];
    const results = rankings.map((pIdx, rank) => {
      const reward = REWARDS[rank] !== undefined ? REWARDS[rank] : 0;
      const player = this.players[pIdx];
      player.coins += reward;
      if (rank === 0) player.minigameWins += 1;
      return {
        playerIndex: pIdx,
        rank: rank + 1,
        reward,
        player
      };
    });

    this.showMinigameResults(results);
  }

  showMinigameResults(results) {
    this.setState('MINIGAME_RESULTS');

    if (window.soundEngine) window.soundEngine.playWinFanfare();

    const podiumContainer = document.getElementById('results-podium-container');
    if (podiumContainer) {
      podiumContainer.innerHTML = '';

      const rankIcons = ['🥇 1. Platz', '🥈 2. Platz', '🥉 3. Platz', '4. Platz', '5. Platz', '6. Platz', '7. Platz', '8. Platz'];

      results.forEach((res) => {
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700';

        const rankLabel = rankIcons[res.rank - 1] || `${res.rank}. Platz`;

        row.innerHTML = `
          <div class="flex items-center gap-3">
            <span class="font-bold text-sm text-yellow-400">${rankLabel}</span>
            <div class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-xs" style="background-color: ${res.player.color}">
              P${res.playerIndex + 1}
            </div>
            <span class="font-semibold text-sm text-white">${res.player.name}</span>
          </div>
          <div class="font-bold text-base text-amber-300">
            +${res.reward} 🪙 <span class="text-xs text-slate-400">(${res.player.coins} gesamt)</span>
          </div>
        `;
        podiumContainer.appendChild(row);
      });
    }

    const nextBtn = document.getElementById('btn-next-from-results');
    if (nextBtn) {
      nextBtn.onclick = () => {
        if (!this.isLocalMode) {
          window.networkManager.proceedToBoard();
        } else {
          this.advanceToNextRound();
        }
      };
    }
  }

  advanceToNextRound() {
    if (this.round >= this.maxRounds) {
      this.setState('GAME_OVER');
    } else {
      this.round += 1;
      this.turnIndex = 0;
      // Alternate team partner every round (Round 1 = Partner A (0), Round 2 = Partner B (1))
      this.players.forEach(p => {
        p.activePartner = (this.round - 1) % 2;
      });
      this.usedDuelsInRound = [];
      this.setState('BOARD_TURN');
    }
  }

  // --- GAME OVER ---

  showGameOverScreen() {
    if (window.soundEngine) window.soundEngine.playStar();

    // Sort players by Stars descending, then Coins descending
    const sorted = [...this.players].sort((a, b) => {
      if (b.stars !== a.stars) return b.stars - a.stars;
      return b.coins - a.coins;
    });

    const winner = sorted[0];
    const winnerNameEl = document.getElementById('game-over-winner-name');
    if (winnerNameEl) {
      winnerNameEl.textContent = `${winner.name} GEWINNT DIE CLASS PARTY!`;
      winnerNameEl.style.color = winner.color;
    }

    const tableEl = document.getElementById('game-over-rankings');
    if (tableEl) {
      tableEl.innerHTML = '';
      const medals = ['👑 1. SIEGER', '🥈 2. PLATZ', '🥉 3. PLATZ', '4. PLATZ', '5. PLATZ', '6. PLATZ', '7. PLATZ', '8. PLATZ'];
      sorted.forEach((p, idx) => {
        const row = document.createElement('div');
        row.className = `flex items-center justify-between p-3.5 rounded-xl border ${
          idx === 0 ? 'bg-yellow-950/40 border-yellow-400 ring-2 ring-yellow-400' : 'bg-slate-800/80 border-slate-700'
        }`;

        const medalText = medals[idx] || `${idx + 1}. PLATZ`;

        row.innerHTML = `
          <div class="flex items-center gap-3">
            <span class="font-bold text-sm text-yellow-400">${medalText}</span>
            <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm" style="background-color: ${p.color}">
              P${p.slotIndex + 1}
            </div>
            <span class="font-bold text-white text-base">${p.name}</span>
          </div>
          <div class="flex items-center gap-4 text-base font-bold">
            <span class="text-amber-400">⭐ ${p.stars} Sterne</span>
            <span class="text-yellow-300">🪙 ${p.coins} Münzen</span>
          </div>
        `;
        tableEl.appendChild(row);
      });
    }

    const restartBtn = document.getElementById('btn-play-again');
    if (restartBtn) {
      restartBtn.onclick = () => {
        if (!this.isLocalMode) {
          window.networkManager.restartGame();
        } else {
          this.setState('LOBBY');
        }
      };
    }
  }

  // --- UI HELPERS ---

  showToast(msg) {
    const toast = document.getElementById('hud-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove('hidden');
    toast.classList.add('animate-bounce');
    setTimeout(() => {
      toast.classList.add('hidden');
      toast.classList.remove('animate-bounce');
    }, 2800);
  }

  showFloatingText(player, text, color) {
    const tile = this.board.getTile(player.boardPosition);
    if (!tile) return;
    this.showToast(`${player.name}: ${text}`);
  }

  // --- PARTY GAG ITEMS & VISUAL EFFECTS ---

  triggerConfettiEffect() {
    const canvas = document.getElementById('party-confetti-canvas');
    if (!canvas) return;
    canvas.classList.remove('hidden');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    const colors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#eab308', '#f97316'];
    const particles = [];
    const count = 140;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 80,
        w: 8 + Math.random() * 10,
        h: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 6,
        vy: 3 + Math.random() * 5,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        tilt: Math.random() * 10,
        tiltAngle: Math.random() * Math.PI
      });
    }

    const startTime = performance.now();
    const duration = 3500;

    const animate = (now) => {
      const elapsed = now - startTime;
      if (elapsed > duration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.classList.add('hidden');
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const alpha = elapsed > duration - 600 ? (duration - elapsed) / 600 : 1;
      ctx.globalAlpha = Math.max(0, alpha);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vRot;
        p.tiltAngle += 0.08;
        p.tilt = Math.sin(p.tiltAngle) * 12;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h + p.tilt * 0.3);
        ctx.restore();
      });
      ctx.globalAlpha = 1.0;

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  triggerScreenShake(intensity = 18) {
    const el = document.body;
    if (!el) return;
    const start = performance.now();
    const duration = 650;

    const shake = (now) => {
      const elapsed = now - start;
      if (elapsed > duration) {
        el.style.transform = '';
        return;
      }
      const progress = 1 - (elapsed / duration);
      const curIntensity = intensity * progress;
      const dx = (Math.random() - 0.5) * curIntensity * 2;
      const dy = (Math.random() - 0.5) * curIntensity * 2;
      const rot = (Math.random() - 0.5) * 1.5 * progress;
      el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
      requestAnimationFrame(shake);
    };
    requestAnimationFrame(shake);
  }

  triggerDiscoParty(duration = 7.0) {
    let discoOverlay = document.getElementById('party-disco-overlay');
    if (!discoOverlay) {
      discoOverlay = document.createElement('div');
      discoOverlay.id = 'party-disco-overlay';
      discoOverlay.className = 'fixed inset-0 pointer-events-none z-[180] mix-blend-color-dodge transition-colors duration-200';
      document.body.appendChild(discoOverlay);
    }

    discoOverlay.classList.remove('hidden');
    const colors = [
      'rgba(239, 68, 68, 0.45)',
      'rgba(59, 130, 246, 0.45)',
      'rgba(16, 185, 129, 0.45)',
      'rgba(245, 158, 11, 0.45)',
      'rgba(236, 72, 153, 0.45)',
      'rgba(139, 92, 246, 0.45)'
    ];
    let idx = 0;
    const interval = setInterval(() => {
      if (discoOverlay) {
        discoOverlay.style.backgroundColor = colors[idx % colors.length];
        idx++;
      }
    }, 220);

    setTimeout(() => {
      clearInterval(interval);
      if (discoOverlay) {
        discoOverlay.style.backgroundColor = 'transparent';
        discoOverlay.classList.add('hidden');
      }
    }, duration * 1000);
  }

  // --- DISCONNECT & LEAVE MANAGEMENT ---

  leaveGame() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    if (this.currentMinigameInstance) {
      try {
        this.currentMinigameInstance.stop();
      } catch (e) {
        console.warn('Error stopping minigame instance on leave', e);
      }
      this.currentMinigameInstance = null;
    }
    if (!this.isLocalMode && window.networkManager) {
      window.networkManager.sendLeaveRoom();
    }
    this.setState('LOBBY');
    this.showToast('🚪 Du hast das Spiel verlassen. Zurück in der Lobby.');
  }

  handlePlayerLeft(data) {
    if (!data) return;
    const leftIdx = data.leftPlayerIndex;
    const leftPlayer = this.players[leftIdx];
    if (leftPlayer) {
      this.showToast(`🚪 ${leftPlayer.name} hat das Spiel verlassen.`);
      leftPlayer.type = 'bot';
      leftPlayer.isBot = true;
      leftPlayer.name = `${leftPlayer.name} (Bot)`;
    }

    if (typeof data.turnIndex === 'number') {
      this.turnIndex = data.turnIndex;
    }

    if (data.state && data.state !== this.state) {
      this.setState(data.state);
    }

    if (this.currentMinigameInstance && typeof this.currentMinigameInstance.onPlayerLeft === 'function') {
      try {
        this.currentMinigameInstance.onPlayerLeft(leftIdx);
      } catch (e) {
        console.warn('Error notifying minigame of left player', e);
      }
    }

    this.updateHUD();
    if (this.state === 'BOARD_TURN') {
      this.checkActiveTurn();
    }
  }

  handleNewHost(data) {
    if (!data) return;
    if (window.networkManager) {
      window.networkManager.isHost = (data.newHostId === window.networkManager.socket?.id);
    }
    const hostPlayer = this.players[data.hostIndex];
    const name = hostPlayer ? hostPlayer.name : 'Ein Mitspieler';
    this.showToast(`👑 ${name} ist jetzt der Spielleiter (Host)!`);
    this.checkActiveTurn();
  }

  handlePartyItemEffect(data) {
    if (!data) return;
    const { playerIndex, itemKey, effectData } = data;
    const player = this.players[playerIndex];
    const name = player ? player.name : `Spieler ${playerIndex + 1}`;

    if (itemKey === 'confetti_cannon') {
      this.triggerConfettiEffect();
      if (window.soundEngine && window.soundEngine.playConfettiPop) window.soundEngine.playConfettiPop();
      this.showToast(`🎉 ${name} zündet die Konfetti-Kanone!`);
    } else if (itemKey === 'party_horn') {
      this.triggerScreenShake(20);
      if (window.soundEngine && window.soundEngine.playPartyHorn) window.soundEngine.playPartyHorn();
      this.showToast(`📯 ${name} betätigt die Party-Hupe!`);
    } else if (itemKey === 'giant_head') {
      if (player) player.giantHeadTimer = (effectData && effectData.duration) || 25;
      if (window.soundEngine && window.soundEngine.playGiantSound) window.soundEngine.playGiantSound();
      this.showToast(`🍄 ${name} hat jetzt einen Riesen-Kopf!`);
    } else if (itemKey === 'disco_dance') {
      this.triggerDiscoParty((effectData && effectData.duration) || 7.0);
      if (window.soundEngine && window.soundEngine.playDiscoMusic) window.soundEngine.playDiscoMusic();
      this.showToast(`🪩 ${name} hat den Disco-Modus gezündet!`);
    } else if (itemKey === 'shield') {
      if (player) player.hasShield = true;
      if (window.soundEngine && window.soundEngine.playShieldBlock) window.soundEngine.playShieldBlock();
      this.showToast(`🛡️ ${name} aktiviert ein Schutzschild!`);
    } else if (itemKey === 'double_dice') {
      this.showToast(`🎲 ${name} aktiviert den Doppel-Würfel!`);
    }
    this.updateHUD();
  }
}

window.PartyGame = PartyGame;
window.partyGame = new PartyGame();
