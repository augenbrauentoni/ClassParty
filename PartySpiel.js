console.log('===================================================================');
console.log('  [STARTUP 1/4] PartySpiel.js wird initialisiert...');
console.log('===================================================================');

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { exec } = require('child_process');

// Load optional .env file if present
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim();
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
      console.log('  [ENV] Konfiguration aus .env Datei geladen.');
    } catch (e) {
      console.warn('  [ENV] Konnte .env nicht laden:', e.message);
    }
  }
}
loadEnv();

console.log('  [STARTUP 2/4] Express, HTTP und Socket.io Bibliotheken geladen.');

const app = express();
const server = http.createServer(app);

// CORS and Tunnel bypass headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Bypass-Tunnel-Reminder, ngrok-skip-browser-warning');
  res.setHeader('Bypass-Tunnel-Reminder', 'true');
  res.setHeader('ngrok-skip-browser-warning', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: false
  },
  transports: ['websocket', 'polling']
});

const PORT = parseInt(process.env.PORT, 10) || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));
console.log('  [STARTUP 3/4] Web-Verzeichnisse (public & root) erfolgreich eingebunden.');

// Helper to determine the host machine's local IPv4 network address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  const candidates = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (iface.address.startsWith('192.168.') || iface.address.startsWith('10.') || iface.address.startsWith('172.')) {
          return iface.address;
        }
        candidates.push(iface.address);
      }
    }
  }
  return candidates[0] || 'localhost';
}

let publicTunnelUrl = process.env.PUBLIC_URL || null;
let activeTunnelType = process.env.PUBLIC_URL ? 'custom' : 'none';

// Public Internet Tunnel (Ngrok first if token present, fallback to free Localtunnel)
async function startTunnel(port) {
  if (publicTunnelUrl) {
    console.log(`  🌐 [PUBLIC-URL] Bereits konfiguriert: ${publicTunnelUrl}`);
    if (io) io.emit('tunnel_ready', { publicTunnelUrl, tunnelType: activeTunnelType });
    return;
  }

  // 1. Try Ngrok if authtoken is present in environment or .env
  const ngrokToken = process.env.NGROK_AUTHTOKEN || process.env.NGROK_TOKEN;
  if (ngrokToken) {
    try {
      console.log('  [TUNNEL] Versuche Ngrok mit konfiguriertem Authtoken...');
      const ngrok = require('@ngrok/ngrok');
      const listener = await ngrok.forward({
        addr: port,
        authtoken: ngrokToken
      });
      const url = listener.url();
      if (url) {
        publicTunnelUrl = url;
        activeTunnelType = 'ngrok';
        console.log('===================================================================');
        console.log(`  🌐 [INTERNET-LINK AKTIV via NGROK] Spiel weltweit erreichbar!`);
        console.log(`  👉 ${publicTunnelUrl}`);
        console.log(`  (Mitschueler koennen von jedem beliebigen Handy / WLAN beitreten)`);
        console.log('===================================================================');
        if (io) {
          io.emit('tunnel_ready', { publicTunnelUrl, tunnelType: 'ngrok' });
        }
        return;
      }
    } catch (err) {
      console.log('  [TUNNEL-HINWEIS] Ngrok fehlgeschlagen (' + err.message + '). Weiche auf Localtunnel aus...');
    }
  }

  // 2. Fallback to Localtunnel (100% kostenlos ohne Login / Token)
  try {
    const localtunnel = require('localtunnel');
    console.log('  [TUNNEL] Erstelle oeffentlichen Internet-Tunnel (localtunnel)...');
    const tunnel = await localtunnel({ port });
    publicTunnelUrl = tunnel.url;
    activeTunnelType = 'localtunnel';
    console.log('===================================================================');
    console.log(`  🌐 [INTERNET-LINK AKTIV via LOCALTUNNEL] Spiel weltweit erreichbar!`);
    console.log(`  👉 ${publicTunnelUrl}`);
    console.log(`  (Mitschueler koennen von jedem beliebigen Handy / WLAN beitreten)`);
    console.log('===================================================================');

    if (io) {
      io.emit('tunnel_ready', { publicTunnelUrl, tunnelType: 'localtunnel' });
    }

    tunnel.on('close', () => {
      console.log('  [TUNNEL] Oeffentlicher Tunnel wurde beendet.');
      publicTunnelUrl = null;
      activeTunnelType = 'none';
    });

    tunnel.on('error', (err) => {
      console.log('  [TUNNEL-HINWEIS]', err.message);
    });
  } catch (err) {
    console.log('  [TUNNEL-HINWEIS] Automatischer Tunnel konnte nicht geoeffnet werden:', err.message);
  }
}

// REST API for connected clients to discover host network endpoints
app.get('/api/server-info', (req, res) => {
  const activePort = server.address() ? server.address().port : (parseInt(process.env.PORT, 10) || 3000);
  const localIp = getLocalIp();
  res.json({
    localIp,
    port: activePort,
    publicTunnelUrl,
    tunnelType: activeTunnelType,
    localUrl: `http://${localIp}:${activePort}`,
    localhostUrl: `http://localhost:${activePort}`
  });
});

// Room store
// roomId -> { id, hostId, state, round, maxRounds, turnIndex, players: [...], starTileIndex, minigameHistory: [] }
const rooms = new Map();

// Helper to generate 4-character room codes
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const PLAYER_COLORS = [
  { name: 'Rot', hex: '#EF4444', dark: '#991B1B', light: '#FCA5A5' },
  { name: 'Blau', hex: '#3B82F6', dark: '#1E40AF', light: '#93C5FD' },
  { name: 'Grün', hex: '#10B981', dark: '#065F46', light: '#6EE7B7' },
  { name: 'Gelb', hex: '#F59E0B', dark: '#92400E', light: '#FDE68A' },
  { name: 'Lila', hex: '#8B5CF6', dark: '#5B21B6', light: '#DDD6FE' },
  { name: 'Orange', hex: '#F97316', dark: '#9A3412', light: '#FFEDD5' },
  { name: 'Cyan', hex: '#06B6D4', dark: '#0E7490', light: '#CFFAFE' },
  { name: 'Pink', hex: '#EC4899', dark: '#9D174D', light: '#FCE7F3' }
];

const DEFAULT_ARCHETYPES = [
  { id: 'pc_schrauber', avatar: '/assets/avatars/char1_pc_schrauber.png' },
  { id: 'feuerwehrmann', avatar: '/assets/avatars/char2_feuerwehr.png' },
  { id: 'chill_cap', avatar: '/assets/avatars/char3_chill_cap.png' },
  { id: 'goldkette', avatar: '/assets/avatars/char4_goldkette.png' },
  { id: 'drachen_koenigin', avatar: '/assets/avatars/char5_drachen_koenigin.png' },
  { id: 'schoko_coder', avatar: '/assets/avatars/char6_schoko_coder.png' },
  { id: 'doritos_gamer', avatar: '/assets/avatars/char7_doritos_gamer.png' },
  { id: 'langhaar_dude', avatar: '/assets/avatars/char8_langhaar_dude.png' },
  { id: 'ultra_goku', avatar: '/assets/avatars/char9_ultra_goku.jpg' }
];

function createDefaultPlayers(isTeamMode = false) {
  return PLAYER_COLORS.map((col, idx) => ({
    id: `player_${idx}`,
    slotIndex: idx,
    name: isTeamMode ? `Team ${col.name}` : `Spieler ${idx + 1}`,
    playerA: isTeamMode ? `Spieler ${idx + 1}A` : `Spieler ${idx + 1}`,
    playerB: isTeamMode ? `Spieler ${idx + 1}B` : '',
    activePartner: 0, // 0 = Partner A, 1 = Partner B (alternates each round)
    isTeam: isTeamMode,
    archetype: DEFAULT_ARCHETYPES[idx % DEFAULT_ARCHETYPES.length].id,
    avatar: DEFAULT_ARCHETYPES[idx % DEFAULT_ARCHETYPES.length].avatar,
    color: col.hex,
    colorName: col.name,
    colorDark: col.dark,
    colorLight: col.light,
    type: idx === 0 ? 'human_online' : 'bot', // Slot 0 is host, others start as bot
    socketId: null,
    coins: 10,
    stars: 0,
    boardPosition: 0,
    inventory: [],
    isReady: idx === 0,
    minigameWins: 0
  }));
}

io.on('connection', (socket) => {
  let currentRoomId = null;

  // Immediately notify client of public internet tunnel if available
  if (publicTunnelUrl) {
    socket.emit('tunnel_ready', { publicTunnelUrl, tunnelType: activeTunnelType });
  }

  socket.on('create_room', ({ playerName, maxRounds, isTeamMode, playerA, playerB, archetype, avatar }) => {
    let roomId = generateRoomCode();
    while (rooms.has(roomId)) {
      roomId = generateRoomCode();
    }

    const teamActive = !!isTeamMode;
    const players = createDefaultPlayers(teamActive);
    if (teamActive) {
      players[0].name = `Team ${players[0].colorName}`;
      players[0].playerA = playerA || playerName || 'Spieler 1A';
      players[0].playerB = playerB || 'Spieler 1B';
    } else {
      players[0].name = playerName || 'Spieler 1';
      players[0].playerA = players[0].name;
    }
    if (archetype) players[0].archetype = archetype;
    if (avatar) players[0].avatar = avatar;
    players[0].socketId = socket.id;
    players[0].type = 'human_online';
    players[0].isReady = true;

    const parsedRounds = parseInt(maxRounds, 10);
    const validRounds = (!isNaN(parsedRounds) && parsedRounds > 0) ? Math.min(parsedRounds, 50) : 10;

    const room = {
      id: roomId,
      hostId: socket.id,
      state: 'LOBBY', // LOBBY, BOARD_TURN, MINIGAME_INTRO, MINIGAME_PLAY, MINIGAME_RESULTS, GAME_OVER
      round: 1,
      maxRounds: validRounds,
      turnIndex: 0,
      isTeamMode: teamActive,
      players: players,
      starTileIndex: 36, // Initial star location
      minigameHistory: [],
      currentMinigame: null,
      gravityInverted: false,
      mode: 'online'
    };

    rooms.set(roomId, room);
    currentRoomId = roomId;
    socket.join(roomId);

    socket.emit('room_created', {
      roomId,
      playerIndex: 0,
      room
    });
  });

  socket.on('join_room', ({ roomId, playerName, archetype, avatar }) => {
    const code = (roomId || '').trim().toUpperCase();
    const room = rooms.get(code);

    if (!room) {
      return socket.emit('join_error', { message: `Raum ${code} existiert nicht.` });
    }
    if (room.state !== 'LOBBY') {
      return socket.emit('join_error', { message: 'Das Spiel in diesem Raum hat bereits begonnen.' });
    }

    // Find first available slot (human or bot that isn't connected)
    let assignedIndex = -1;
    for (let i = 1; i < room.players.length; i++) {
      if (room.players[i].type === 'bot' || !room.players[i].socketId) {
        assignedIndex = i;
        break;
      }
    }

    if (assignedIndex === -1) {
      return socket.emit('join_error', { message: 'Der Raum ist bereits voll (max. 8 Slots / bis zu 16 Spieler).' });
    }

    if (room.isTeamMode) {
      room.players[assignedIndex].name = `Team ${room.players[assignedIndex].colorName}`;
      room.players[assignedIndex].playerA = playerName || `Spieler ${assignedIndex + 1}A`;
      room.players[assignedIndex].playerB = `Spieler ${assignedIndex + 1}B`;
    } else {
      room.players[assignedIndex].name = playerName || `Spieler ${assignedIndex + 1}`;
      room.players[assignedIndex].playerA = room.players[assignedIndex].name;
    }
    if (archetype) room.players[assignedIndex].archetype = archetype;
    if (avatar) room.players[assignedIndex].avatar = avatar;
    room.players[assignedIndex].socketId = socket.id;
    room.players[assignedIndex].type = 'human_online';
    room.players[assignedIndex].isReady = true;

    currentRoomId = code;
    socket.join(code);

    socket.emit('room_joined', {
      roomId: code,
      playerIndex: assignedIndex,
      room
    });

    io.to(code).emit('room_updated', { room });
  });

  socket.on('toggle_team_mode', ({ isTeamMode }) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.hostId !== socket.id || room.state !== 'LOBBY') return;

    room.isTeamMode = !!isTeamMode;
    room.players.forEach((p, idx) => {
      p.isTeam = room.isTeamMode;
      if (room.isTeamMode) {
        if (!p.playerA) p.playerA = p.name;
        if (!p.playerB) p.playerB = `Spieler ${idx + 1}B`;
        p.name = `Team ${p.colorName}`;
      } else {
        p.name = p.playerA || `Spieler ${idx + 1}`;
      }
    });

    io.to(currentRoomId).emit('room_updated', { room });
  });

  // Spieler wählt im Lobby-Bildschirm seinen Klassen-Avatar
  socket.on('select_avatar', ({ archetype, avatar, charName }) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.state !== 'LOBBY') return;

    const player = room.players.find(p => p.socketId === socket.id);
    if (player) {
      if (archetype) player.archetype = archetype;
      if (avatar) player.avatar = avatar;
      io.to(currentRoomId).emit('room_updated', { room });
    }
  });

  // Host kann auch Bot-Avatare oder Slots konfigurieren
  socket.on('update_slot_avatar', ({ slotIndex, archetype, avatar }) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.hostId !== socket.id || room.state !== 'LOBBY') return;

    const sIdx = parseInt(slotIndex, 10);
    if (!isNaN(sIdx) && sIdx >= 0 && sIdx < room.players.length) {
      if (archetype) room.players[sIdx].archetype = archetype;
      if (avatar) room.players[sIdx].avatar = avatar;
      io.to(currentRoomId).emit('room_updated', { room });
    }
  });

  socket.on('update_slot', ({ slotIndex, type, name, playerA, playerB, archetype, avatar }) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.hostId !== socket.id || room.state !== 'LOBBY') return;

    const sIdx = parseInt(slotIndex, 10);
    if (isNaN(sIdx) || sIdx < 0 || sIdx >= room.players.length || sIdx === 0) return; // host slot is fixed

    if (type) room.players[sIdx].type = type;
    if (name) room.players[sIdx].name = name;
    if (playerA) room.players[sIdx].playerA = playerA;
    if (playerB) room.players[sIdx].playerB = playerB;
    if (archetype) room.players[sIdx].archetype = archetype;
    if (avatar) room.players[sIdx].avatar = avatar;
    if (type === 'bot') {
      room.players[sIdx].socketId = null;
      room.players[sIdx].isReady = true;
    }

    io.to(currentRoomId).emit('room_updated', { room });
  });

  socket.on('update_settings', ({ maxRounds }) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.hostId !== socket.id || room.state !== 'LOBBY') return;

    const parsed = parseInt(maxRounds, 10);
    if (!isNaN(parsed) && parsed > 0) {
      room.maxRounds = Math.max(1, Math.min(50, parsed));
      io.to(currentRoomId).emit('room_updated', { room });
    }
  });

  socket.on('start_game', () => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.hostId !== socket.id || room.state !== 'LOBBY') return;

    room.state = 'BOARD_TURN';
    room.round = 1;
    room.turnIndex = 0;
    io.to(currentRoomId).emit('game_started', { room });
  });

  // Turn: Dice Roll
  socket.on('roll_dice', (data = {}) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.state !== 'BOARD_TURN') return;

    const activePlayer = room.players[room.turnIndex];
    // Check if sender is active player or host (for bot turns)
    const isPlayer = activePlayer.socketId === socket.id;
    const isHostForBot = room.hostId === socket.id && activePlayer.type === 'bot';

    if (!isPlayer && !isHostForBot) return;

    let roll = Math.floor(Math.random() * 10) + 1; // 1-10
    if (data && data.forcedRoll !== undefined) {
      const fRoll = parseInt(data.forcedRoll, 10);
      if (!isNaN(fRoll) && fRoll >= 1 && fRoll <= 20) {
        roll = fRoll;
      }
    }
    io.to(currentRoomId).emit('dice_rolled', {
      turnIndex: room.turnIndex,
      roll
    });
  });

  // Player position update / move step sync
  socket.on('player_move_step', ({ playerIndex, newTileIndex }) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    const pIdx = parseInt(playerIndex, 10);
    const nTile = parseInt(newTileIndex, 10);
    if (!isNaN(pIdx) && pIdx >= 0 && pIdx < room.players.length && !isNaN(nTile)) {
      room.players[pIdx].boardPosition = nTile;
      io.to(currentRoomId).emit('player_moved', { playerIndex: pIdx, newTileIndex: nTile });
    }
  });

  // Buy Star
  socket.on('buy_star', ({ playerIndex, newStarTileIndex }) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    const pIdx = parseInt(playerIndex, 10);
    const sTile = parseInt(newStarTileIndex, 10);
    if (isNaN(pIdx) || pIdx < 0 || pIdx >= room.players.length) return;

    const player = room.players[pIdx];
    if (player && player.coins >= 20) {
      player.coins -= 20;
      player.stars += 1;
      if (!isNaN(sTile)) room.starTileIndex = sTile;

      io.to(currentRoomId).emit('star_bought', {
        playerIndex: pIdx,
        newCoins: player.coins,
        newStars: player.stars,
        newStarTileIndex: room.starTileIndex
      });
    }
  });

  // Board state sync across all players (for action tiles, shop, boo, bowser, duel, items)
  socket.on('sync_board_state', ({ players, starTileIndex, jackpotCoins, eventMessage }) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    if (Array.isArray(players)) {
      players.forEach((p, i) => {
        if (room.players[i]) {
          if (p.coins !== undefined && !isNaN(Number(p.coins))) room.players[i].coins = Number(p.coins);
          if (p.stars !== undefined && !isNaN(Number(p.stars))) room.players[i].stars = Number(p.stars);
          if (p.boardPosition !== undefined && !isNaN(Number(p.boardPosition))) room.players[i].boardPosition = Number(p.boardPosition);
          if (p.inventory) room.players[i].inventory = p.inventory;
          if (p.emote) room.players[i].emote = p.emote;
          if (p.archetype) room.players[i].archetype = p.archetype;
          if (p.avatar) room.players[i].avatar = p.avatar;
          if (p.activePartner !== undefined) room.players[i].activePartner = p.activePartner;
        }
      });
    }
    if (starTileIndex !== undefined && starTileIndex !== null && !isNaN(parseInt(starTileIndex, 10))) {
      room.starTileIndex = parseInt(starTileIndex, 10);
    }
    if (jackpotCoins !== undefined && jackpotCoins !== null && !isNaN(parseInt(jackpotCoins, 10))) {
      room.jackpotCoins = parseInt(jackpotCoins, 10);
    }

    socket.to(currentRoomId).emit('board_state_synced', {
      players: room.players,
      starTileIndex: room.starTileIndex,
      jackpotCoins: room.jackpotCoins,
      eventMessage
    });
  });

  // End of player turn on board
  socket.on('turn_completed', ({ playerIndex, coinDelta, newPosition }) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.state !== 'BOARD_TURN') return;

    const pIdx = parseInt(playerIndex, 10);
    if (!isNaN(pIdx) && pIdx >= 0 && pIdx < room.players.length) {
      const player = room.players[pIdx];
      if (player) {
        const cDelta = Number(coinDelta);
        if (!isNaN(cDelta)) {
          player.coins = Math.max(0, player.coins + cDelta);
        }
        const pos = parseInt(newPosition, 10);
        if (!isNaN(pos)) {
          player.boardPosition = pos;
        }
      }
    }

    // Check if all players have completed their turns in this round
    if (room.turnIndex < room.players.length - 1) {
      room.turnIndex += 1;
      io.to(currentRoomId).emit('turn_advanced', {
        turnIndex: room.turnIndex,
        players: room.players
      });
    } else {
      // All players have moved! Transition to Minigame Intro!
      room.turnIndex = 0;
      room.state = 'MINIGAME_INTRO';

      // Pick minigame (available: 1 to 13 fully playable)
      const totalAvailable = 13;
      let minigameId;
      const recent = room.minigameHistory.slice(-2);
      do {
        minigameId = Math.floor(Math.random() * totalAvailable) + 1;
      } while (recent.includes(minigameId) && totalAvailable > 2);

      const seed = Math.floor(Math.random() * 1000000);
      room.minigameHistory.push(minigameId);
      room.currentMinigame = { id: minigameId, seed };

      io.to(currentRoomId).emit('minigame_intro', {
        minigameId,
        seed,
        round: room.round,
        maxRounds: room.maxRounds,
        players: room.players
      });
    }
  });

  // Minigame real-time controls sync
  socket.on('minigame_action', ({ playerIndex, input, state }) => {
    if (!currentRoomId) return;
    const pIdx = parseInt(playerIndex, 10);
    socket.to(currentRoomId).emit('minigame_action_sync', {
      playerIndex: isNaN(pIdx) ? playerIndex : pIdx,
      input,
      state
    });
  });

  // Minigame Host Game Loop state sync (for authorative physics in online mode)
  socket.on('minigame_state_sync', (stateData) => {
    if (!currentRoomId) return;
    socket.to(currentRoomId).emit('minigame_state_sync', stateData);
  });

  // Antigravity central state management & event sync
  socket.on('trigger_antigravity', ({ roomId, forceState, duration }) => {
    const targetRoomId = roomId || currentRoomId;
    if (!targetRoomId) return;
    const room = rooms.get(targetRoomId);
    if (!room) return;

    if (room.gravityInverted === undefined) {
      room.gravityInverted = false;
    }

    const nextInverted = (typeof forceState === 'boolean') ? forceState : !room.gravityInverted;
    room.gravityInverted = nextInverted;
    const dur = parseFloat(duration);

    io.to(targetRoomId).emit('gravity_changed', {
      gravityInverted: room.gravityInverted,
      duration: (!isNaN(dur) && dur > 0) ? dur : 0.6,
      serverTime: Date.now()
    });
  });

  // Party Item & Gag effect synchronization (Confetti, Horn, Giant Head, Disco)
  socket.on('party_item_used', ({ playerIndex, itemKey, effectData }) => {
    if (!currentRoomId) return;
    const pIdx = parseInt(playerIndex, 10);
    io.to(currentRoomId).emit('party_item_effect', {
      playerIndex: isNaN(pIdx) ? playerIndex : pIdx,
      itemKey,
      effectData,
      serverTime: Date.now()
    });
  });

  // Minigame results
  socket.on('minigame_finished', ({ rankings }) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.state !== 'MINIGAME_INTRO' && room.state !== 'MINIGAME_PLAY') return;

    room.state = 'MINIGAME_RESULTS';
    // Award coins up to 8 places: 1st: +15, 2nd: +10, 3rd: +7, 4th: +5, 5th: +3, 6th: +2, 7th: +1, 8th: 0
    const REWARDS = [15, 10, 7, 5, 3, 2, 1, 0];
    const results = rankings.map((pIdx, rank) => {
      const reward = REWARDS[rank] || 0;
      const player = room.players[pIdx];
      if (player) {
        player.coins += reward;
        if (rank === 0) player.minigameWins += 1;
      }
      return {
        playerIndex: pIdx,
        rank: rank + 1,
        reward,
        player
      };
    });

    io.to(currentRoomId).emit('minigame_results', {
      results,
      players: room.players
    });
  });

  // Next round / Game Over check
  socket.on('proceed_to_board', () => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.hostId !== socket.id) return;

    if (room.round >= room.maxRounds) {
      room.state = 'GAME_OVER';
      io.to(currentRoomId).emit('game_over', {
        players: room.players,
        roundsPlayed: room.round
      });
    } else {
      room.round += 1;
      room.turnIndex = 0;
      room.state = 'BOARD_TURN';

      // If team mode is active, alternate the active partner each round (Round 1 = A, Round 2 = B)
      if (room.isTeamMode) {
        room.players.forEach(p => {
          p.activePartner = (room.round % 2);
        });
      }

      io.to(currentRoomId).emit('new_round_started', {
        round: room.round,
        maxRounds: room.maxRounds,
        players: room.players
      });
    }
  });

  // Play again / Restart
  socket.on('restart_game', () => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.hostId !== socket.id) return;

    room.state = 'LOBBY';
    room.round = 1;
    room.turnIndex = 0;
    room.players.forEach(p => {
      p.coins = 10;
      p.stars = 0;
      p.boardPosition = 0;
      p.minigameWins = 0;
    });

    io.to(currentRoomId).emit('game_restarted', { room });
  });

  // Helper for safe and graceful player departure
  function handlePlayerDeparture(leavingSocket, roomId, isVoluntary = false) {
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room) return;

    const playerIndex = room.players.findIndex(p => p.socketId === leavingSocket.id);
    if (playerIndex === -1) return;

    const player = room.players[playerIndex];
    player.socketId = null;

    console.log(`[DEPARTURE] Spieler ${player.name} (Slot ${playerIndex}) verlässt Raum ${roomId} (${isVoluntary ? 'Freiwillig über Button' : 'Tab geschlossen / Disconnect'}).`);

    if (room.state === 'LOBBY') {
      player.type = 'bot';
      player.isReady = false;
      io.to(roomId).emit('player_left', {
        playerIndex,
        isVoluntary,
        room
      });
    } else {
      // Game running: convert slot to bot so match proceeds seamlessly
      player.type = 'bot';

      // Check if this player was currently on turn on the board
      const wasOnTurn = (room.state === 'BOARD_TURN' && room.turnIndex === playerIndex);

      io.to(roomId).emit('player_left', {
        playerIndex,
        isVoluntary,
        wasOnTurn,
        room
      });

      // If they were on turn, advance turn or trigger next phase so the board never hangs!
      if (wasOnTurn) {
        if (room.turnIndex < room.players.length - 1) {
          room.turnIndex += 1;
          io.to(roomId).emit('turn_advanced', {
            turnIndex: room.turnIndex,
            players: room.players
          });
        } else {
          // All players done in this round -> transition to Minigame Intro
          room.turnIndex = 0;
          room.state = 'MINIGAME_INTRO';
          const totalAvailable = 13;
          let minigameId;
          const recent = room.minigameHistory.slice(-2);
          do {
            minigameId = Math.floor(Math.random() * totalAvailable) + 1;
          } while (recent.includes(minigameId) && totalAvailable > 2);
          const seed = Math.floor(Math.random() * 1000000);
          room.minigameHistory.push(minigameId);
          room.currentMinigame = { id: minigameId, seed };
          io.to(roomId).emit('minigame_intro', {
            minigameId,
            seed,
            round: room.round,
            maxRounds: room.maxRounds,
            players: room.players
          });
        }
      }
    }

    // Host migration if leaving player was host
    if (room.hostId === leavingSocket.id) {
      const nextHuman = room.players.find(p => p.socketId && p.socketId !== leavingSocket.id);
      if (nextHuman) {
        room.hostId = nextHuman.socketId;
        io.to(roomId).emit('new_host', { 
          hostId: room.hostId,
          playerIndex: nextHuman.slotIndex
        });
        console.log(`[HOST MIGRATION] Neuer Host in Raum ${roomId} ist Slot ${nextHuman.slotIndex} (${nextHuman.name})`);
      } else {
        // No connected humans left, cleanup room
        console.log(`[CLEANUP] Keine menschlichen Spieler mehr in Raum ${roomId}, Raum wird geschlossen.`);
        rooms.delete(roomId);
      }
    }
  }

  // Voluntary leave button from UI
  socket.on('leave_room', () => {
    if (currentRoomId) {
      handlePlayerDeparture(socket, currentRoomId, true);
      socket.leave(currentRoomId);
      currentRoomId = null;
    }
  });

  // Browser tab closed or network disconnect
  socket.on('disconnect', () => {
    if (currentRoomId) {
      handlePlayerDeparture(socket, currentRoomId, false);
      currentRoomId = null;
    }
  });
});

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const MAX_PORT_ATTEMPTS = 50;
let attempts = 0;

function startServer(port) {
  server.removeAllListeners('error');
  server.removeAllListeners('listening');

  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      attempts++;
      if (attempts < MAX_PORT_ATTEMPTS) {
        console.log(`  [PORT-INFO] Port ${port} ist belegt. Weiche automatisch auf Port ${port + 1} aus...`);
        startServer(port + 1);
      } else {
        console.error(`  [FEHLER] Konnte keinen freien Port zwischen ${DEFAULT_PORT} und ${port} finden.`);
        process.exit(1);
      }
    } else {
      console.error('  [FEHLER] Unerwarteter Server-Fehler beim Starten:', err);
      process.exit(1);
    }
  });

  server.once('listening', () => {
    const activePort = server.address().port;
    const localIp = getLocalIp();
    const urlLocalhost = `http://localhost:${activePort}`;
    const urlNetwork = `http://${localIp}:${activePort}`;

    console.log('===================================================================');
    console.log(`  [SERVER BEREIT] Das Spiel laeuft einwandfrei!`);
    console.log(`  👉 Auf diesem PC (Host):    ${urlLocalhost}`);
    console.log(`  👉 Im selben WLAN / Hotspot: ${urlNetwork}`);
    console.log('===================================================================');
    console.log('  (Konsolenfenster waehrend des Spiels bitte geoeffnet lassen)');
    console.log('  Beenden mit: STRG + C im Konsolenfenster.\n');

    const isExplicitNoTunnel = process.argv.includes('--no-tunnel') || process.argv.includes('--local') || process.env.TUNNEL === '0';
    if (!isExplicitNoTunnel) {
      startTunnel(activePort);
    } else {
      console.log('  [INFO] Offline/Lokal-Modus gewaehlt (--no-tunnel). Kein Internet-Tunnel aktiv.');
    }

    openBrowser(urlLocalhost);
  });

  // Explicitly listen on 0.0.0.0 to accept connections from local network & tunnels
  server.listen(port, '0.0.0.0');
}

function openBrowser(url) {
  let cmd = '';
  switch (process.platform) {
    case 'win32':
      cmd = `start "" "${url}"`;
      break;
    case 'darwin':
      cmd = `open "${url}"`;
      break;
    default:
      cmd = `xdg-open "${url}"`;
      break;
  }

  exec(cmd, (error) => {
    if (error) {
      console.log(`  [HINWEIS] Browser konnte nicht automatisch geoeffnet werden. Bitte oeffne manuell: ${url}`);
    }
  });
}

console.log(`  [STARTUP 4/4] Binde Server an 0.0.0.0:${DEFAULT_PORT}...`);
startServer(DEFAULT_PORT);
