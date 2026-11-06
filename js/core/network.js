// ===================================================================
// DUAL-NETWORK ADAPTER: PeerJS WebRTC P2P (Serverless) + Socket.io Relay
// Ermöglicht 100% serverloses Hosten auf GitHub Pages, Netlify & Vercel
// sowie nahtlosen Betrieb über lokalen Node.js Server
// ===================================================================

const P2P_PLAYER_COLORS = [
  { name: 'Rot', hex: '#EF4444', dark: '#991B1B', light: '#FCA5A5' },
  { name: 'Blau', hex: '#3B82F6', dark: '#1E40AF', light: '#93C5FD' },
  { name: 'Grün', hex: '#10B981', dark: '#065F46', light: '#6EE7B7' },
  { name: 'Gelb', hex: '#F59E0B', dark: '#92400E', light: '#FDE68A' },
  { name: 'Lila', hex: '#8B5CF6', dark: '#5B21B6', light: '#DDD6FE' },
  { name: 'Orange', hex: '#F97316', dark: '#9A3412', light: '#FFEDD5' },
  { name: 'Cyan', hex: '#06B6D4', dark: '#0E7490', light: '#CFFAFE' },
  { name: 'Pink', hex: '#EC4899', dark: '#9D174D', light: '#FCE7F3' }
];

const P2P_DEFAULT_ARCHETYPES = [
  { id: 'pc_schrauber', avatar: 'assets/avatars/char1_pc_schrauber.png' },
  { id: 'feuerwehrmann', avatar: 'assets/avatars/char2_feuerwehr.png' },
  { id: 'chill_cap', avatar: 'assets/avatars/char3_chill_cap.png' },
  { id: 'goldkette', avatar: 'assets/avatars/char4_goldkette.png' },
  { id: 'drachen_koenigin', avatar: 'assets/avatars/char5_drachen_koenigin.png' },
  { id: 'schoko_coder', avatar: 'assets/avatars/char6_schoko_coder.png' },
  { id: 'doritos_gamer', avatar: 'assets/avatars/char7_doritos_gamer.png' },
  { id: 'langhaar_dude', avatar: 'assets/avatars/char8_langhaar_dude.png' },
  { id: 'ultra_goku', avatar: 'assets/avatars/char9_ultra_goku.jpg' }
];

const PEERJS_ICE_CONFIG = {
  debug: 1,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ]
  }
};

class NetworkManager {
  constructor() {
    this.socket = null;
    this.peer = null;
    this.peerConnections = []; // Host: Liste aller verbundenen Peers
    this.hostConn = null; // Client: Verbindung zum Host
    this.networkType = 'peerjs'; // 'peerjs' (Serverless) oder 'socket'
    this.roomId = null;
    this.myPlayerIndex = 0;
    this.isHost = true;
    this.isLocalMode = false;
    this.callbacks = {};
    this.p2pRoom = null; // Host hält den autoritativen Spielzustand
    this.lastHostParams = null;
  }

  init() {
    // 1. Prüfe, ob die Seite auf statischem Cloud-Hosting läuft (GitHub Pages, Netlify, Vercel, file://)
    const host = window.location.hostname || '';
    const isStaticDeploy = window.location.protocol === 'file:' ||
      host.endsWith('github.io') ||
      host.endsWith('netlify.app') ||
      host.endsWith('vercel.app') ||
      host.endsWith('pages.dev');

    if (isStaticDeploy) {
      console.log('🌐 [STATIC-DEPLOY] Reine Web-Architektur erkannt -> PeerJS WebRTC P2P ist Standard.');
      this.networkType = 'peerjs';
      this.updateNetworkBadge('🟢 P2P WebRTC Cloud (100% Serverless)');
      return;
    }

    // 2. Falls lokal oder auf Cloud-Server (Render.com), Socket.io dynamisch mit der Host-Domain verbinden
    if (typeof io !== 'undefined') {
      try {
        const socketTargetUrl = (typeof window !== 'undefined' && window.location && window.location.origin)
          ? window.location.origin
          : undefined;

        this.socket = io(socketTargetUrl, {
          timeout: 6000,
          reconnection: true,
          reconnectionAttempts: 8,
          reconnectionDelay: 1000,
          transports: ['websocket', 'polling'],
          extraHeaders: {
            'Bypass-Tunnel-Reminder': 'true',
            'ngrok-skip-browser-warning': 'true'
          }
        });
        this.setupSocketListeners();
      } catch (e) {
        console.warn('Socket.io konnte nicht initialisiert werden, weiche auf PeerJS WebRTC aus.', e);
        this.networkType = 'peerjs';
        this.updateNetworkBadge('🟢 P2P WebRTC Cloud (100% Serverless)');
      }
    } else {
      this.networkType = 'peerjs';
      this.updateNetworkBadge('🟢 P2P WebRTC Cloud (100% Serverless)');
    }
  }

  updateNetworkBadge(text) {
    const badge = document.getElementById('badge-network-mode');
    if (badge) badge.textContent = text;
  }

  on(event, callback) {
    this.callbacks[event] = callback;
  }

  emit(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event](data);
    }
  }

  setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.networkType = 'socket';
      const isCloud = window.location.hostname && !['localhost', '127.0.0.1'].includes(window.location.hostname);
      console.log('✅ Verbunden über Node.js Socket.io Server', isCloud ? `(Cloud Online: ${window.location.origin})` : '(Lokal)');
      this.updateNetworkBadge(isCloud ? '🌐 Cloud Online (Render)' : '🟢 Socket.io Server aktiv');
    });

    this.socket.on('connect_error', () => {
      console.log('ℹ️ Kein Socket.io Server erreichbar -> PeerJS WebRTC P2P einsatzbereit.');
      this.networkType = 'peerjs';
      this.updateNetworkBadge('🟢 P2P WebRTC Cloud (100% Serverless)');
    });

    const events = [
      'room_created', 'room_joined', 'room_reconnected', 'player_reconnected', 'start_error', 'reconnect_failed',
      'join_error', 'room_updated',
      'game_started', 'dice_rolled', 'player_moved', 'star_bought',
      'turn_advanced', 'minigame_intro', 'minigame_action_sync',
      'minigame_state_sync', 'minigame_results', 'new_round_started',
      'game_over', 'game_restarted', 'player_left', 'item_used',
      'roulette_spun', 'boo_stolen', 'bowser_chaos', 'duel_resolved',
      'biome_event_triggered', 'board_state_synced', 'gravity_changed',
      'party_item_effect', 'new_host', 'tunnel_ready'
    ];

    events.forEach(ev => {
      this.socket.on(ev, (data) => {
        if (ev === 'room_created') {
          this.roomId = data.roomId;
          this.myPlayerIndex = data.playerIndex;
          this.isHost = true;
          if (data.roomId) {
            localStorage.setItem('class_party_active_room', data.roomId);
          }
        } else if (ev === 'room_joined' || ev === 'room_reconnected') {
          this.roomId = data.roomId;
          this.myPlayerIndex = data.playerIndex;
          this.isHost = (data.playerIndex === 0);
          if (data.roomId) {
            localStorage.setItem('class_party_active_room', data.roomId);
          }
        }
        this.emit(ev, data);
      });
    });
  }

  // ===================================================================
  // 🌟 PEERJS WEBRTC P2P MULTIPLAYER ENGINE (100% BROWSERBASIERT) 🌟
  // ===================================================================

  createP2PPlayers(isTeamMode, playerName, archetype, avatar, playerA, playerB) {
    return P2P_PLAYER_COLORS.map((col, idx) => ({
      id: `player_${idx}`,
      slotIndex: idx,
      name: isTeamMode ? `Team ${col.name}` : (idx === 0 ? (playerName || 'Spieler 1') : `Spieler ${idx + 1}`),
      playerA: isTeamMode ? (idx === 0 ? (playerA || playerName || 'Spieler 1A') : `Spieler ${idx + 1}A`) : (idx === 0 ? (playerName || 'Spieler 1') : `Spieler ${idx + 1}`),
      playerB: isTeamMode ? (idx === 0 ? (playerB || 'Spieler 1B') : `Spieler ${idx + 1}B`) : '',
      activePartner: 0,
      isTeam: !!isTeamMode,
      archetype: idx === 0 ? (archetype || P2P_DEFAULT_ARCHETYPES[0].id) : P2P_DEFAULT_ARCHETYPES[idx % P2P_DEFAULT_ARCHETYPES.length].id,
      avatar: idx === 0 ? (avatar || P2P_DEFAULT_ARCHETYPES[0].avatar) : P2P_DEFAULT_ARCHETYPES[idx % P2P_DEFAULT_ARCHETYPES.length].avatar,
      color: col.hex,
      colorName: col.name,
      colorDark: col.dark,
      colorLight: col.light,
      type: idx === 0 ? 'human_online' : 'bot',
      peerConnected: idx === 0,
      coins: 10,
      stars: 0,
      boardPosition: 0,
      inventory: [],
      isReady: idx === 0,
      minigameWins: 0
    }));
  }

  initPeerJSHost(roomId, playerName, maxRounds, isTeamMode = false, playerA = null, playerB = null, archetype = null, avatar = null) {
    if (typeof Peer === 'undefined') {
      alert('PeerJS konnte nicht geladen werden. Bitte Internetverbindung prüfen.');
      return;
    }
    this.networkType = 'peerjs';
    this.roomId = roomId;
    this.isHost = true;
    this.myPlayerIndex = 0;
    this.peerConnections = [];
    this.lastHostParams = { roomId, playerName, maxRounds, isTeamMode, playerA, playerB, archetype, avatar };

    const peerId = 'CLASSPARTY_' + roomId;
    try {
      if (this.peer) {
        try { this.peer.destroy(); } catch (e) {}
      }
      this.peer = new Peer(peerId, PEERJS_ICE_CONFIG);
    } catch (e) {
      this.peer = new Peer(null, PEERJS_ICE_CONFIG);
    }

    const teamActive = !!isTeamMode;
    const players = this.createP2PPlayers(teamActive, playerName, archetype, avatar, playerA, playerB);

    this.p2pRoom = {
      id: roomId,
      hostId: peerId,
      state: 'LOBBY',
      round: 1,
      maxRounds: Math.min(Math.max(1, parseInt(maxRounds, 10) || 10), 50),
      turnIndex: 0,
      isTeamMode: teamActive,
      players: players,
      starTileIndex: 36,
      minigameHistory: [],
      currentMinigame: null,
      gravityInverted: false,
      jackpotCoins: 0,
      mode: 'p2p'
    };

    this.peer.on('open', (id) => {
      console.log('🎉 [P2P-HOST] Raum erfolgreich eröffnet! Peer-ID:', id);
      this.updateNetworkBadge('🟢 P2P WebRTC Cloud (100% Serverless)');
      this.emit('room_created', {
        roomId,
        playerIndex: 0,
        room: this.p2pRoom
      });
    });

    this.peer.on('connection', (conn) => {
      console.log('🤝 [P2P-HOST] Neuer Mitschüler verbindet sich:', conn.peer);
      this.peerConnections.push(conn);

      conn.on('data', (msg) => {
        this.handlePeerJSHostMessage(conn, msg);
      });

      conn.on('close', () => {
        this.handleP2PPeerDisconnect(conn);
      });

      conn.on('error', (err) => {
        console.warn('Peer connection error:', err);
        this.handleP2PPeerDisconnect(conn);
      });
    });

    this.peer.on('error', (err) => {
      console.warn('P2P Host Error:', err);
      if (err.type === 'unavailable-id') {
        // Raum-Code war belegt -> sofort neuen generieren
        const newCode = this.generateRoomCode();
        this.initPeerJSHost(newCode, playerName, maxRounds, isTeamMode, playerA, playerB, archetype, avatar);
      } else {
        this.emit('join_error', { message: 'Peer-Fehler: ' + (err.message || err.type) });
      }
    });
  }

  handlePeerJSHostMessage(conn, msg) {
    if (!msg || !this.p2pRoom) return;
    const { action, payload } = msg;

    switch (action) {
      case 'join_request': {
        if (this.p2pRoom.state !== 'LOBBY') {
          conn.send({ event: 'join_error', data: { message: 'Das Spiel in diesem Raum hat bereits begonnen.' } });
          return;
        }

        // Finde ersten freien Bot-Slot
        let assigned = -1;
        for (let i = 1; i < this.p2pRoom.players.length; i++) {
          if (this.p2pRoom.players[i].type === 'bot' || !this.p2pRoom.players[i].peerConnected) {
            assigned = i;
            break;
          }
        }

        if (assigned === -1) {
          conn.send({ event: 'join_error', data: { message: 'Der Raum ist bereits voll (max. 8 Spieler / 16 Schüler).' } });
          return;
        }

        conn.assignedSlot = assigned;
        const p = this.p2pRoom.players[assigned];
        p.type = 'human_online';
        p.peerConnected = true;
        if (payload.playerName) {
          if (this.p2pRoom.isTeamMode) {
            p.playerA = payload.playerName;
          } else {
            p.name = payload.playerName;
            p.playerA = payload.playerName;
          }
        }
        if (payload.archetype) p.archetype = payload.archetype;
        if (payload.avatar) p.avatar = payload.avatar;

        conn.send({
          event: 'room_joined',
          data: {
            roomId: this.roomId,
            playerIndex: assigned,
            room: this.p2pRoom
          }
        });

        this.broadcastP2P('room_updated', { room: this.p2pRoom });
        this.emit('room_updated', { room: this.p2pRoom });
        break;
      }

      case 'select_avatar': {
        const slot = (typeof payload.playerIndex === 'number') ? payload.playerIndex : conn.assignedSlot;
        if (slot >= 0 && slot < this.p2pRoom.players.length) {
          const p = this.p2pRoom.players[slot];
          if (payload.avatar) p.avatar = payload.avatar;
          if (payload.archetype) p.archetype = payload.archetype;
          this.broadcastP2P('room_updated', { room: this.p2pRoom });
          this.emit('room_updated', { room: this.p2pRoom });
        }
        break;
      }

      case 'roll_dice': {
        const roll = (typeof payload.forcedRoll === 'number') ? payload.forcedRoll : (Math.floor(Math.random() * 10) + 1);
        const data = { turnIndex: this.p2pRoom.turnIndex, roll };
        this.broadcastP2P('dice_rolled', data);
        this.emit('dice_rolled', data);
        break;
      }

      case 'player_move_step': {
        const pIdx = parseInt(payload.playerIndex, 10);
        const nTile = parseInt(payload.newTileIndex, 10);
        if (!isNaN(pIdx) && pIdx >= 0 && pIdx < this.p2pRoom.players.length && !isNaN(nTile)) {
          this.p2pRoom.players[pIdx].boardPosition = nTile;
          const data = { playerIndex: pIdx, newTileIndex: nTile };
          this.broadcastP2P('player_moved', data);
          this.emit('player_moved', data);
        }
        break;
      }

      case 'buy_star': {
        const pIdx = parseInt(payload.playerIndex, 10);
        const sTile = parseInt(payload.newStarTileIndex, 10);
        if (!isNaN(pIdx) && pIdx >= 0 && pIdx < this.p2pRoom.players.length) {
          const p = this.p2pRoom.players[pIdx];
          if (p && p.coins >= 20) {
            p.coins -= 20;
            p.stars += 1;
            if (!isNaN(sTile)) this.p2pRoom.starTileIndex = sTile;
            const data = {
              playerIndex: pIdx,
              newCoins: p.coins,
              newStars: p.stars,
              newStarTileIndex: this.p2pRoom.starTileIndex
            };
            this.broadcastP2P('star_bought', data);
            this.emit('star_bought', data);
          }
        }
        break;
      }

      case 'sync_board_state': {
        if (Array.isArray(payload.players)) {
          payload.players.forEach((p, i) => {
            if (this.p2pRoom.players[i]) {
              if (p.coins !== undefined) this.p2pRoom.players[i].coins = Number(p.coins);
              if (p.stars !== undefined) this.p2pRoom.players[i].stars = Number(p.stars);
              if (p.boardPosition !== undefined) this.p2pRoom.players[i].boardPosition = Number(p.boardPosition);
              if (p.inventory) this.p2pRoom.players[i].inventory = p.inventory;
              if (p.avatar) this.p2pRoom.players[i].avatar = p.avatar;
              if (p.archetype) this.p2pRoom.players[i].archetype = p.archetype;
            }
          });
        }
        if (payload.starTileIndex !== undefined && payload.starTileIndex !== null) {
          this.p2pRoom.starTileIndex = parseInt(payload.starTileIndex, 10);
        }
        if (payload.jackpotCoins !== undefined && payload.jackpotCoins !== null) {
          this.p2pRoom.jackpotCoins = parseInt(payload.jackpotCoins, 10);
        }
        this.broadcastP2P('board_state_synced', {
          players: this.p2pRoom.players,
          starTileIndex: this.p2pRoom.starTileIndex,
          jackpotCoins: this.p2pRoom.jackpotCoins,
          eventMessage: payload.eventMessage
        });
        this.emit('board_state_synced', {
          players: this.p2pRoom.players,
          starTileIndex: this.p2pRoom.starTileIndex,
          jackpotCoins: this.p2pRoom.jackpotCoins,
          eventMessage: payload.eventMessage
        });
        break;
      }

      case 'turn_completed': {
        const pIdx = parseInt(payload.playerIndex, 10);
        if (!isNaN(pIdx) && pIdx >= 0 && pIdx < this.p2pRoom.players.length) {
          const p = this.p2pRoom.players[pIdx];
          if (p) {
            if (payload.coinDelta) p.coins = Math.max(0, p.coins + Number(payload.coinDelta));
            if (payload.newPosition !== undefined) p.boardPosition = parseInt(payload.newPosition, 10);
          }
        }

        if (this.p2pRoom.turnIndex < this.p2pRoom.players.length - 1) {
          this.p2pRoom.turnIndex += 1;
          const data = { turnIndex: this.p2pRoom.turnIndex, players: this.p2pRoom.players };
          this.broadcastP2P('turn_advanced', data);
          this.emit('turn_advanced', data);
        } else {
          // Alle Spieler haben gewürfelt -> Minispiel Runde startet!
          this.p2pRoom.turnIndex = 0;
          this.p2pRoom.state = 'MINIGAME_INTRO';
          const totalAvailable = 13;
          let minigameId;
          const recent = this.p2pRoom.minigameHistory.slice(-2);
          do {
            minigameId = Math.floor(Math.random() * totalAvailable) + 1;
          } while (recent.includes(minigameId) && totalAvailable > 2);

          const seed = Math.floor(Math.random() * 1000000);
          this.p2pRoom.minigameHistory.push(minigameId);
          this.p2pRoom.currentMinigame = { id: minigameId, seed };

          const introData = {
            minigameId,
            seed,
            round: this.p2pRoom.round,
            maxRounds: this.p2pRoom.maxRounds,
            players: this.p2pRoom.players
          };
          this.broadcastP2P('minigame_intro', introData);
          this.emit('minigame_intro', introData);
        }
        break;
      }

      case 'minigame_action_sync': {
        this.broadcastP2P('minigame_action_sync', payload, conn);
        this.emit('minigame_action_sync', payload);
        break;
      }

      case 'minigame_state_sync': {
        this.broadcastP2P('minigame_state_sync', payload, conn);
        this.emit('minigame_state_sync', payload);
        break;
      }

      case 'party_item_used': {
        const effectData = {
          playerIndex: payload.playerIndex !== undefined ? payload.playerIndex : conn.assignedSlot,
          itemKey: payload.itemKey,
          effectData: payload.effectData || {},
          serverTime: Date.now()
        };
        this.broadcastP2P('party_item_effect', effectData);
        this.emit('party_item_effect', effectData);
        break;
      }

      case 'trigger_antigravity': {
        this.p2pRoom.gravityInverted = !this.p2pRoom.gravityInverted;
        const dur = parseFloat(payload.duration) || 0.6;
        const gData = {
          gravityInverted: this.p2pRoom.gravityInverted,
          duration: dur,
          serverTime: Date.now()
        };
        this.broadcastP2P('gravity_changed', gData);
        this.emit('gravity_changed', gData);
        break;
      }

      case 'leave_room': {
        this.handleP2PPeerDisconnect(conn);
        break;
      }

      default: {
        this.broadcastP2P(action, payload, conn);
        this.emit(action, payload);
        break;
      }
    }
  }

  handleP2PPeerDisconnect(conn) {
    const slotIdx = conn.assignedSlot;
    this.peerConnections = this.peerConnections.filter(c => c !== conn);
    if (slotIdx === undefined || slotIdx === null || !this.p2pRoom) return;

    const player = this.p2pRoom.players[slotIdx];
    if (!player) return;

    const pName = player.name;
    console.log(`🔌 [P2P-DISCONNECT] Spieler an Slot ${slotIdx} (${pName}) hat die Verbindung beendet.`);

    if (this.p2pRoom.state === 'LOBBY') {
      // In der Lobby: Slot wieder für beitretende Mitschüler freigeben
      player.type = 'bot';
      player.peerConnected = false;
      player.name = this.p2pRoom.isTeamMode ? `Team ${player.colorName}` : `Spieler ${slotIdx + 1}`;
      this.broadcastP2P('room_updated', { room: this.p2pRoom });
      this.emit('room_updated', { room: this.p2pRoom });
    } else {
      // Während des Spiels: Zum Bot machen, Punkte/Sterne behalten, Partie läuft stabil weiter!
      player.type = 'bot';
      player.peerConnected = false;
      const leftData = {
        leftPlayerIndex: slotIdx,
        playerName: pName,
        turnIndex: this.p2pRoom.turnIndex,
        state: this.p2pRoom.state,
        room: this.p2pRoom
      };
      this.broadcastP2P('player_left', leftData);
      this.emit('player_left', leftData);

      // Falls dieser Spieler gerade am Zug war: Automatisch Bot ausführen
      if (this.p2pRoom.state === 'BOARD_TURN' && this.p2pRoom.turnIndex === slotIdx) {
        if (window.partyGame && window.partyGame.checkActiveTurn) {
          setTimeout(() => {
            window.partyGame.checkActiveTurn();
          }, 600);
        }
      }
    }
  }

  initPeerJSClient(roomId, playerName, archetype = null, avatar = null) {
    if (typeof Peer === 'undefined') {
      alert('PeerJS konnte nicht geladen werden. Bitte Internetverbindung prüfen.');
      return;
    }
    this.networkType = 'peerjs';
    this.roomId = roomId;
    this.isHost = false;

    if (this.peer) {
      try { this.peer.destroy(); } catch (e) {}
    }
    this.peer = new Peer(null, PEERJS_ICE_CONFIG);

    this.peer.on('open', () => {
      const targetPeerId = 'CLASSPARTY_' + roomId;
      console.log(`🔗 [P2P-CLIENT] Verbinde mit Raum-Host [${targetPeerId}]...`);
      const conn = this.peer.connect(targetPeerId, { reliable: true });
      this.hostConn = conn;

      conn.on('open', () => {
        console.log('✅ [P2P-CLIENT] Erfolgreich mit Host verbunden!');
        conn.send({
          action: 'join_request',
          payload: { playerName, archetype, avatar }
        });
      });

      conn.on('data', (msg) => {
        if (msg.event) {
          if (msg.event === 'room_joined') {
            this.myPlayerIndex = msg.data.playerIndex;
            this.isHost = false;
          }
          this.emit(msg.event, msg.data);
        }
      });

      conn.on('close', () => {
        console.warn('⚠️ [P2P-CLIENT] Verbindung zum Host getrennt.');
        if (window.partyGame && window.partyGame.showToast) {
          window.partyGame.showToast('⚠️ Verbindung zum Spielleiter verloren.');
        }
      });

      conn.on('error', (err) => {
        this.emit('join_error', { message: 'Verbindung zu Raum ' + roomId + ' fehlgeschlagen.' });
      });
    });

    this.peer.on('error', (err) => {
      console.warn('P2P Client Error:', err);
      if (err.type === 'peer-unavailable') {
        this.emit('join_error', { message: `Raum [${roomId}] existiert nicht oder der Host ist offline.` });
      } else {
        this.emit('join_error', { message: 'Verbindungsfehler: ' + (err.message || err.type) });
      }
    });
  }

  broadcastP2P(event, data, excludeConn = null) {
    this.peerConnections.forEach(conn => {
      if (conn !== excludeConn && conn.open) {
        try {
          conn.send({ event, data });
        } catch (e) {
          console.warn('Fehler beim P2P-Broadcast', e);
        }
      }
    });
  }

  // ===================================================================
  // 🎮 ACTIONS (Öffentliche Methoden für game.js & main.js) 🎮
  // ===================================================================

  getSessionId() {
    let sid = localStorage.getItem('class_party_session_id');
    if (!sid) {
      sid = 'cp_sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      localStorage.setItem('class_party_session_id', sid);
    }
    return sid;
  }

  createRoom(playerName, maxRounds, isTeamMode = false, playerA = null, playerB = null, archetype = null, avatar = null, maxPlayers = 4, enableBots = true, botCount = 0, boardId = 'board_1') {
    this.isLocalMode = false;
    const roomCode = this.generateRoomCode();
    this.roomId = roomCode;
    const sessionId = this.getSessionId();

    if (this.socket && this.socket.connected) {
      this.networkType = 'socket';
      this.socket.emit('create_room', { playerName, maxRounds, isTeamMode, playerA, playerB, archetype, avatar, sessionId, maxPlayers, enableBots, botCount, boardId });
    } else {
      // 100% Serverless P2P Host
      this.networkType = 'peerjs';
      this.initPeerJSHost(roomCode, playerName, maxRounds, isTeamMode, playerA, playerB, archetype, avatar);
      if (this.p2pRoom) {
        this.p2pRoom.maxPlayers = maxPlayers;
        this.p2pRoom.enableBots = enableBots;
        this.p2pRoom.botCount = botCount;
        this.p2pRoom.boardId = boardId;
      }
    }
  }

  joinRoom(roomId, playerName, archetype = null, avatar = null) {
    this.isLocalMode = false;
    const code = (roomId || '').trim().toUpperCase();
    this.roomId = code;
    const sessionId = this.getSessionId();

    if (this.socket && this.socket.connected) {
      this.networkType = 'socket';
      this.socket.emit('join_room', { roomId: code, playerName, archetype, avatar, sessionId });
    } else {
      // 100% Serverless P2P Client
      this.networkType = 'peerjs';
      this.initPeerJSClient(code, playerName, archetype, avatar);
    }
  }

  reconnectRoom(roomId) {
    const code = (roomId || '').trim().toUpperCase();
    const sessionId = this.getSessionId();
    if (!code || !sessionId) return;
    this.roomId = code;

    const doReconnect = () => {
      this.networkType = 'socket';
      this.socket.emit('reconnect_room', { roomId: code, sessionId });
    };

    if (this.socket && this.socket.connected) {
      doReconnect();
    } else if (this.socket) {
      this.socket.once('connect', doReconnect);
    }
  }

  updateLobbySettings(settings = {}) {
    if (this.isLocalMode) return;
    if (this.socket && this.socket.connected) {
      this.socket.emit('update_lobby_settings', settings);
    } else if (this.p2pRoom && this.isHost) {
      Object.assign(this.p2pRoom, settings);
      this.broadcastP2P('room_updated', { room: this.p2pRoom });
      this.emit('room_updated', { room: this.p2pRoom });
    }
  }

  sendSelectAvatar(avatar, archetype, charName = null) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('select_avatar', { avatar, archetype, charName });
    } else if (this.isHost && this.p2pRoom) {
      const p = this.p2pRoom.players[this.myPlayerIndex];
      if (p) {
        if (avatar) p.avatar = avatar;
        if (archetype) p.archetype = archetype;
        this.broadcastP2P('room_updated', { room: this.p2pRoom });
        this.emit('room_updated', { room: this.p2pRoom });
      }
    } else if (this.hostConn && this.hostConn.open) {
      this.hostConn.send({
        action: 'select_avatar',
        payload: { avatar, archetype, charName, playerIndex: this.myPlayerIndex }
      });
    }
  }

  sendUpdateSlotAvatar(slotIndex, avatar, archetype) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('update_slot_avatar', { slotIndex, avatar, archetype });
    } else if (this.isHost && this.p2pRoom) {
      if (this.p2pRoom.players[slotIndex]) {
        if (avatar) this.p2pRoom.players[slotIndex].avatar = avatar;
        if (archetype) this.p2pRoom.players[slotIndex].archetype = archetype;
        this.broadcastP2P('room_updated', { room: this.p2pRoom });
        this.emit('room_updated', { room: this.p2pRoom });
      }
    }
  }

  updateSlot(slotIndex, type, name) {
    if (this.isLocalMode) return;
    if (this.socket && this.socket.connected) {
      this.socket.emit('update_slot', { slotIndex, type, name });
    } else if (this.p2pRoom && this.isHost) {
      if (this.p2pRoom.players[slotIndex]) {
        if (type) this.p2pRoom.players[slotIndex].type = type;
        if (name) this.p2pRoom.players[slotIndex].name = name;
        this.broadcastP2P('room_updated', { room: this.p2pRoom });
        this.emit('room_updated', { room: this.p2pRoom });
      }
    }
  }

  updateSettings(maxRounds) {
    if (this.isLocalMode) return;
    if (this.socket && this.socket.connected) {
      this.socket.emit('update_settings', { maxRounds });
    } else if (this.p2pRoom && this.isHost) {
      this.p2pRoom.maxRounds = maxRounds;
      this.broadcastP2P('room_updated', { room: this.p2pRoom });
      this.emit('room_updated', { room: this.p2pRoom });
    }
  }

  toggleTeamMode(isTeamMode) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('toggle_team_mode', { isTeamMode });
    } else if (this.isHost && this.p2pRoom) {
      this.p2pRoom.isTeamMode = !!isTeamMode;
      this.p2pRoom.players.forEach((p, idx) => {
        p.isTeam = this.p2pRoom.isTeamMode;
        if (this.p2pRoom.isTeamMode) {
          if (!p.playerA) p.playerA = p.name;
          if (!p.playerB) p.playerB = `Spieler ${idx + 1}B`;
          p.name = `Team ${p.colorName}`;
        } else {
          p.name = p.playerA || `Spieler ${idx + 1}`;
        }
      });
      this.broadcastP2P('room_updated', { room: this.p2pRoom });
      this.emit('room_updated', { room: this.p2pRoom });
    }
  }

  startGame() {
    if (this.isLocalMode) return;
    if (this.socket && this.socket.connected) {
      this.socket.emit('start_game');
    } else if (this.p2pRoom && this.isHost) {
      const humanPlayers = this.p2pRoom.players.filter(p => p.type === 'human_online');

      if (this.p2pRoom.enableBots === false) {
        if (humanPlayers.length < 2) {
          this.emit('start_error', { message: 'Mindestens 2 menschliche Spieler erforderlich (oder aktiviere Bots).' });
          return;
        }
        this.p2pRoom.players = humanPlayers;
      } else {
        const maxSlots = this.p2pRoom.maxPlayers || 4;
        const desiredBots = (this.p2pRoom.botCount !== undefined)
          ? Math.min(this.p2pRoom.botCount, maxSlots - humanPlayers.length)
          : (maxSlots - humanPlayers.length);
        const botsToAdd = Math.max(0, desiredBots);
        const existingBots = this.p2pRoom.players.filter(p => p.type === 'bot').slice(0, botsToAdd);
        this.p2pRoom.players = [...humanPlayers, ...existingBots];
      }

      this.p2pRoom.players.forEach((p, idx) => {
        p.slotIndex = idx;
        p.id = `player_${idx}`;
      });

      this.p2pRoom.state = 'BOARD_TURN';
      this.p2pRoom.round = 1;
      this.p2pRoom.turnIndex = 0;
      this.broadcastP2P('game_started', { room: this.p2pRoom });
      this.emit('game_started', { room: this.p2pRoom });
    }
  }

  rollDice(forcedRoll = null) {
    if (this.isLocalMode) return;
    if (this.socket && this.socket.connected) {
      this.socket.emit('roll_dice', { forcedRoll });
    } else {
      if (this.isHost && this.p2pRoom) {
        const roll = (typeof forcedRoll === 'number') ? forcedRoll : (Math.floor(Math.random() * 10) + 1);
        const data = { turnIndex: this.p2pRoom.turnIndex, roll };
        this.broadcastP2P('dice_rolled', data);
        this.emit('dice_rolled', data);
      } else if (this.hostConn && this.hostConn.open) {
        this.hostConn.send({ action: 'roll_dice', payload: { forcedRoll } });
      }
    }
  }

  sendMoveStep(playerIndex, newTileIndex) {
    if (this.isLocalMode) return;
    if (this.socket && this.socket.connected) {
      this.socket.emit('player_move_step', { playerIndex, newTileIndex });
    } else {
      if (this.isHost && this.p2pRoom) {
        this.p2pRoom.players[playerIndex].boardPosition = newTileIndex;
        const data = { playerIndex, newTileIndex };
        this.broadcastP2P('player_moved', data);
        this.emit('player_moved', data);
      } else if (this.hostConn && this.hostConn.open) {
        this.hostConn.send({ action: 'player_move_step', payload: { playerIndex, newTileIndex } });
      }
    }
  }

  sendBuyStar(playerIndex, newStarTileIndex) {
    if (this.isLocalMode) return;
    if (this.socket && this.socket.connected) {
      this.socket.emit('buy_star', { playerIndex, newStarTileIndex });
    } else {
      if (this.isHost && this.p2pRoom) {
        const p = this.p2pRoom.players[playerIndex];
        if (p && p.coins >= 20) {
          p.coins -= 20;
          p.stars += 1;
          if (newStarTileIndex !== undefined) this.p2pRoom.starTileIndex = newStarTileIndex;
          const data = { playerIndex, newCoins: p.coins, newStars: p.stars, newStarTileIndex: this.p2pRoom.starTileIndex };
          this.broadcastP2P('star_bought', data);
          this.emit('star_bought', data);
        }
      } else if (this.hostConn && this.hostConn.open) {
        this.hostConn.send({ action: 'buy_star', payload: { playerIndex, newStarTileIndex } });
      }
    }
  }

  syncBoardState(stateData) {
    if (this.isLocalMode) return;
    if (this.socket && this.socket.connected) {
      this.socket.emit('sync_board_state', stateData);
    } else {
      if (this.isHost && this.p2pRoom) {
        if (Array.isArray(stateData.players)) {
          stateData.players.forEach((p, i) => {
            if (this.p2pRoom.players[i]) {
              if (p.coins !== undefined) this.p2pRoom.players[i].coins = Number(p.coins);
              if (p.stars !== undefined) this.p2pRoom.players[i].stars = Number(p.stars);
              if (p.boardPosition !== undefined) this.p2pRoom.players[i].boardPosition = Number(p.boardPosition);
              if (p.inventory) this.p2pRoom.players[i].inventory = p.inventory;
            }
          });
        }
        if (stateData.starTileIndex !== undefined && stateData.starTileIndex !== null) {
          this.p2pRoom.starTileIndex = stateData.starTileIndex;
        }
        if (stateData.jackpotCoins !== undefined && stateData.jackpotCoins !== null) {
          this.p2pRoom.jackpotCoins = stateData.jackpotCoins;
        }
        this.broadcastP2P('board_state_synced', {
          players: this.p2pRoom.players,
          starTileIndex: this.p2pRoom.starTileIndex,
          jackpotCoins: this.p2pRoom.jackpotCoins,
          eventMessage: stateData.eventMessage
        });
        this.emit('board_state_synced', {
          players: this.p2pRoom.players,
          starTileIndex: this.p2pRoom.starTileIndex,
          jackpotCoins: this.p2pRoom.jackpotCoins,
          eventMessage: stateData.eventMessage
        });
      } else if (this.hostConn && this.hostConn.open) {
        this.hostConn.send({ action: 'sync_board_state', payload: stateData });
      }
    }
  }

  sendTurnCompleted(playerIndex, coinDelta, newPosition) {
    if (this.isLocalMode) return;
    if (this.socket && this.socket.connected) {
      this.socket.emit('turn_completed', { playerIndex, coinDelta, newPosition });
    } else if (this.isHost && this.p2pRoom) {
      if (this.p2pRoom.players[playerIndex]) {
        if (coinDelta) this.p2pRoom.players[playerIndex].coins = Math.max(0, this.p2pRoom.players[playerIndex].coins + Number(coinDelta));
        if (newPosition !== undefined) this.p2pRoom.players[playerIndex].boardPosition = parseInt(newPosition, 10);
      }

      if (this.p2pRoom.turnIndex < this.p2pRoom.players.length - 1) {
        this.p2pRoom.turnIndex += 1;
        const data = { turnIndex: this.p2pRoom.turnIndex, players: this.p2pRoom.players };
        this.broadcastP2P('turn_advanced', data);
        this.emit('turn_advanced', data);
      } else {
        this.p2pRoom.turnIndex = 0;
        this.p2pRoom.state = 'MINIGAME_INTRO';
        const totalAvailable = 13;
        let nextId;
        const recent = this.p2pRoom.minigameHistory.slice(-2);
        do {
          nextId = Math.floor(Math.random() * totalAvailable) + 1;
        } while (recent.includes(nextId) && totalAvailable > 2);

        const seed = Math.floor(Math.random() * 1000000);
        this.p2pRoom.minigameHistory.push(nextId);
        this.p2pRoom.currentMinigame = { id: nextId, seed };

        const introData = {
          minigameId: nextId,
          seed,
          round: this.p2pRoom.round,
          maxRounds: this.p2pRoom.maxRounds,
          players: this.p2pRoom.players
        };
        this.broadcastP2P('minigame_intro', introData);
        this.emit('minigame_intro', introData);
      }
    } else if (this.hostConn && this.hostConn.open) {
      this.hostConn.send({ action: 'turn_completed', payload: { playerIndex, coinDelta, newPosition } });
    }
  }

  sendMinigameAction(playerIndex, input, state) {
    if (this.isLocalMode) return;
    if (this.socket && this.socket.connected) {
      this.socket.emit('minigame_action', { playerIndex, input, state });
    } else {
      if (this.isHost) {
        this.broadcastP2P('minigame_action_sync', { playerIndex, input, state });
      } else if (this.hostConn && this.hostConn.open) {
        this.hostConn.send({ action: 'minigame_action_sync', payload: { playerIndex, input, state } });
      }
    }
  }

  sendMinigameFinished(rankings) {
    if (this.isLocalMode) return;
    if (this.socket && this.socket.connected) {
      this.socket.emit('minigame_finished', { rankings });
    } else if (this.isHost && this.p2pRoom) {
      const REWARDS = [15, 10, 7, 5, 3, 2, 1, 0];
      const results = rankings.map((pIdx, rank) => {
        const reward = REWARDS[rank] || 0;
        const player = this.p2pRoom.players[pIdx];
        if (player) {
          player.coins += reward;
          if (rank === 0) player.minigameWins += 1;
        }
        return { playerIndex: pIdx, rank: rank + 1, reward, player };
      });
      const data = { results, players: this.p2pRoom.players };
      this.broadcastP2P('minigame_results', data);
      this.emit('minigame_results', data);
    }
  }

  sendGravityTrigger(roomId, forceState, duration = 0.5) {
    if (this.isLocalMode) return;
    if (this.socket && this.socket.connected) {
      this.socket.emit('trigger_antigravity', { roomId: roomId || this.roomId, forceState, duration });
    } else if (this.isHost && this.p2pRoom) {
      this.p2pRoom.gravityInverted = (typeof forceState === 'boolean') ? forceState : !this.p2pRoom.gravityInverted;
      const data = { gravityInverted: this.p2pRoom.gravityInverted, duration, serverTime: Date.now() };
      this.broadcastP2P('gravity_changed', data);
      this.emit('gravity_changed', data);
    } else if (this.hostConn && this.hostConn.open) {
      this.hostConn.send({ action: 'trigger_antigravity', payload: { forceState, duration } });
    }
  }

  sendPartyItemEffect(playerIndex, itemKey, effectData = {}) {
    if (this.isLocalMode) return;
    if (this.socket && this.socket.connected) {
      this.socket.emit('party_item_used', { playerIndex, itemKey, effectData });
    } else if (this.isHost) {
      const data = { playerIndex, itemKey, effectData, serverTime: Date.now() };
      this.broadcastP2P('party_item_effect', data);
      this.emit('party_item_effect', data);
    } else if (this.hostConn && this.hostConn.open) {
      this.hostConn.send({ action: 'party_item_used', payload: { playerIndex, itemKey, effectData } });
    }
  }

  sendLeaveRoom() {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave_room');
    } else if (this.hostConn) {
      try {
        this.hostConn.send({ action: 'leave_room' });
        this.hostConn.close();
      } catch (e) {}
    }
  }

  proceedToBoard() {
    if (this.isLocalMode) return;
    if (this.socket && this.socket.connected) {
      this.socket.emit('proceed_to_board');
    } else if (this.isHost && this.p2pRoom) {
      if (this.p2pRoom.round >= this.p2pRoom.maxRounds) {
        this.p2pRoom.state = 'GAME_OVER';
        const data = { players: this.p2pRoom.players, roundsPlayed: this.p2pRoom.round };
        this.broadcastP2P('game_over', data);
        this.emit('game_over', data);
      } else {
        this.p2pRoom.round += 1;
        this.p2pRoom.turnIndex = 0;
        this.p2pRoom.state = 'BOARD_TURN';
        if (this.p2pRoom.isTeamMode) {
          this.p2pRoom.players.forEach(p => {
            p.activePartner = (this.p2pRoom.round % 2);
          });
        }
        const data = {
          round: this.p2pRoom.round,
          maxRounds: this.p2pRoom.maxRounds,
          players: this.p2pRoom.players
        };
        this.broadcastP2P('new_round_started', data);
        this.emit('new_round_started', data);
      }
    }
  }

  restartGame() {
    if (this.isLocalMode) return;
    if (this.socket && this.socket.connected) {
      this.socket.emit('restart_game');
    } else if (this.isHost && this.p2pRoom) {
      this.p2pRoom.round = 1;
      this.p2pRoom.turnIndex = 0;
      this.p2pRoom.state = 'BOARD_TURN';
      this.p2pRoom.players.forEach(p => {
        p.coins = 10;
        p.stars = 0;
        p.boardPosition = 0;
      });
      this.broadcastP2P('game_restarted', { room: this.p2pRoom });
      this.emit('game_restarted', { room: this.p2pRoom });
    }
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

window.networkManager = new NetworkManager();
