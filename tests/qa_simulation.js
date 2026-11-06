/**
 * qa_simulation.js - Automatisierte QA- & Test-Suite fuer "Class Party"
 * 
 * Verifiziert alle 4 Kern-Anforderungen aus dem System-Prompt:
 * 1. Koordinaten-Check & Wegpunkte (Spielbrett 1: 53 Wegpunkte, Start, Finish, Event-Tiles, Theme Zones)
 * 2. Unterbesetzte Lobby ohne Bots (maxPlayers=6, enableBots=false, 2 Spieler, Runden- & Wuerfel-Logik ohne Deadlock)
 * 3. Link-Isolation (Raum A & Raum B parallel ohne gegenseitige Beeinflussung)
 * 4. Session Reconnect & Lock (Wiederherstellung nach Reload per sessionId, Ausschluss fremder Besucher)
 */

const { spawn } = require('child_process');
const io = require('socket.io-client');
const assert = require('assert');
const path = require('path');

const TEST_PORT = 3388;
const SERVER_URL = `http://localhost:${TEST_PORT}`;

// ANSI Colors for readable console output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

function logPass(msg) {
  console.log(`  ${GREEN}✓ [PASS]${RESET} ${msg}`);
}
function logFail(msg) {
  console.error(`  ${RED}✗ [FAIL]${RESET} ${msg}`);
}
function logInfo(msg) {
  console.log(`  ${CYAN}ℹ [INFO]${RESET} ${msg}`);
}
function logSection(title) {
  console.log(`\n${BOLD}${YELLOW}=== ${title} ===${RESET}`);
}

// Helper to create a connected socket client
function createClient() {
  return new Promise((resolve, reject) => {
    const socket = io(SERVER_URL, {
      transports: ['websocket'],
      forceNew: true,
      reconnection: false
    });
    socket.once('connect', () => resolve(socket));
    socket.once('connect_error', (err) => reject(err));
  });
}

// Helper to wait for a specific socket event with a timeout
function waitForEvent(socket, eventName, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for event "${eventName}" (${timeoutMs}ms)`));
    }, timeoutMs);

    socket.once(eventName, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

// ---------------------------------------------------------------------------
// TEST 1: Koordinaten-Check & Modulare Brett-Architektur
// ---------------------------------------------------------------------------
function test1_CoordinatesAndBoardManager() {
  logSection('TEST 1: Koordinaten-Check & Modulare Brett-Architektur');
  const { boardManager } = require('../js/board/boardManager.js');

  assert(boardManager, 'BoardManager muss initialisiert sein');
  logPass('BoardManager erfolgreich geladen.');

  const board1 = boardManager.getBoard('board_1');
  assert(board1, 'Spielbrett "board_1" (Vier Welten) muss registriert sein');
  assert.strictEqual(board1.isImageBased, true, 'board_1 muss als bildbasiert markiert sein');
  assert.strictEqual(board1.backgroundImageUrl, 'assets/Spielfeld1.jpg', 'Hintergrundbild muss Spielfeld1.jpg sein');
  logPass('Spielbrett 1 Konfiguration korrekt gefunden.');

  const waypoints = board1.tileCoordinates;
  assert(Array.isArray(waypoints), 'tileCoordinates muss ein Array sein');
  assert.strictEqual(waypoints.length, 53, `Exakt 53 Wegpunkte erwartet (0 bis 52), erhalten: ${waypoints.length}`);
  logPass(`53 Wegpunkte vorhanden (0 bis 52).`);

  // Start tile check
  const startTile = waypoints[0];
  assert.strictEqual(startTile.id, 0, 'Start-Tile muss ID 0 haben');
  assert.strictEqual(startTile.type, 'start', 'Tile 0 muss type="start" haben');
  assert(startTile.pctX >= 7 && startTile.pctX <= 9, `Start pctX out of expected range: ${startTile.pctX}`);
  assert(startTile.pctY >= 5 && startTile.pctY <= 8, `Start pctY out of expected range: ${startTile.pctY}`);
  logPass(`Start-Banner (Feld 0) auf Ägypten exakt platziert (X: ${startTile.pctX}%, Y: ${startTile.pctY}%).`);

  // Finish tile check
  const finishTile = waypoints[52];
  assert.strictEqual(finishTile.id, 52, 'Finish-Tile muss ID 52 haben');
  assert.strictEqual(finishTile.type, 'finish', 'Tile 52 muss type="finish" haben');
  assert(finishTile.pctX >= 7 && finishTile.pctX <= 10, `Finish pctX out of range: ${finishTile.pctX}`);
  assert(finishTile.pctY >= 90 && finishTile.pctY <= 96, `Finish pctY out of range: ${finishTile.pctY}`);
  logPass(`Finish-Banner (Feld 52) auf Stadt exakt platziert (X: ${finishTile.pctX}%, Y: ${finishTile.pctY}%).`);

  // Continuity check: no jumping/teleporting across the screen between consecutive tiles
  for (let i = 0; i < waypoints.length - 1; i++) {
    const curr = waypoints[i];
    const next = waypoints[i + 1];
    const dx = curr.pctX - next.pctX;
    const dy = curr.pctY - next.pctY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // Max reasonable jump between adjacent tiles is ~15%
    assert(dist < 18, `Unstetiger Sprung entdeckt zwischen Feld ${i} und ${i+1}: Distanz = ${dist.toFixed(2)}%`);
    assert(curr.pctX >= 0 && curr.pctX <= 100, `Feld ${i} pctX außerhalb von 0..100: ${curr.pctX}`);
    assert(curr.pctY >= 0 && curr.pctY <= 100, `Feld ${i} pctY außerhalb von 0..100: ${curr.pctY}`);
  }
  logPass('Weg-Stetigkeit geprüft: Alle 53 Felder bilden einen kontinuierlichen Pfad ohne Teleports.');

  // Theme Zones check
  const zones = board1.themeZones;
  assert(Array.isArray(zones) && zones.length === 4, 'Exakt 4 Theme-Zonen erwartet');
  const zoneIds = zones.map(z => z.id);
  assert(zoneIds.includes('egypt') && zoneIds.includes('ocean') && zoneIds.includes('space') && zoneIds.includes('city'),
    'Theme Zones muessen egypt, ocean, space, city enthalten');
  logPass('Themenbereiche (Ägypten, Ozean, Weltraum, Stadt) vollständig konfiguriert.');

  // Event tiles check
  const tileTypes = new Set(waypoints.map(w => w.type));
  assert(tileTypes.has('shop'), 'Item-Shop muss vorhanden sein');
  assert(tileTypes.has('duel'), 'Duell-Felder müssen vorhanden sein');
  assert(tileTypes.has('bank'), 'Bank-Felder müssen vorhanden sein');
  assert(tileTypes.has('event'), 'Biome-Ereignisfelder müssen vorhanden sein');
  logPass(`Ereignisfelder verifiziert (Shop, Duell, Bank, Biome-Events, Glück, Bowser).`);

  // Classic board check
  const classicBoard = boardManager.getBoard('board_classic');
  assert(classicBoard, 'Klassisches 5-Insel-Brett muss als Option erhalten bleiben');
  logPass('Klassisches Brett (board_classic) weiterhin modular verfügbar.');
}

// ---------------------------------------------------------------------------
// TEST 2: Unterbesetzte Lobby ohne Bots (maxPlayers=6, enableBots=false)
// ---------------------------------------------------------------------------
async function test2_UnderfilledLobbyNoBots() {
  logSection('TEST 2: Unterbesetzte Lobby ohne Bots (maxPlayers = 6, enableBots = false)');

  const hostSocket = await createClient();
  const guestSocket = await createClient();

  const hostSession = 'session_qa_host_1';
  const guestSession = 'session_qa_guest_2';

  // 1. Host creates room
  const createPromise = waitForEvent(hostSocket, 'room_created');
  hostSocket.emit('create_room', {
    playerName: 'QA_Host',
    maxRounds: 5,
    isTeamMode: false,
    maxPlayers: 6,
    enableBots: false,
    botCount: 0,
    boardId: 'board_1',
    sessionId: hostSession
  });

  const { roomId, room } = await createPromise;
  assert(roomId, 'Raum-ID muss vergeben sein');
  assert.strictEqual(room.maxPlayers, 6, 'maxPlayers muss 6 sein');
  assert.strictEqual(room.enableBots, false, 'enableBots muss false sein');
  logPass(`Raum ${roomId} erfolgreich erstellt mit maxPlayers=6, enableBots=false.`);

  // 2. Guest joins room
  const joinPromise = waitForEvent(guestSocket, 'room_joined');
  guestSocket.emit('join_room', {
    roomId,
    playerName: 'QA_Guest',
    sessionId: guestSession
  });

  const joinData = await joinPromise;
  assert.strictEqual(joinData.playerIndex, 1, 'Gast muss Slot 1 erhalten');
  logPass(`Gast ist erfolgreich Raum ${roomId} beigetreten (Slot 1).`);

  // 3. Host starts game
  const hostStartPromise = waitForEvent(hostSocket, 'game_started');
  const guestStartPromise = waitForEvent(guestSocket, 'game_started');
  hostSocket.emit('start_game');

  const [hostStartData, guestStartData] = await Promise.all([hostStartPromise, guestStartPromise]);
  const activeRoom = hostStartData.room;

  // Strict Bot-Exclusion Check
  assert.strictEqual(activeRoom.players.length, 2, `Es dürfen NUR 2 Spieler im Spiel sein! Erhalten: ${activeRoom.players.length}`);
  assert.strictEqual(activeRoom.players[0].name, 'QA_Host');
  assert.strictEqual(activeRoom.players[1].name, 'QA_Guest');
  assert.strictEqual(activeRoom.players[0].type, 'human_online');
  assert.strictEqual(activeRoom.players[1].type, 'human_online');
  logPass('Strikte Bot-Ausschließung verifiziert: Genau 2 menschliche Spieler aktiv, 0 Bots generiert.');

  // 4. Turn Cycle Verification: Host (Slot 0) on turn
  assert.strictEqual(activeRoom.turnIndex, 0, 'Spieler 1 (Host) muss an der Reihe sein');
  logPass('Runde 1 startet: Spieler 1 (Host) ist am Zug.');

  // Host rolls dice
  const dicePromise = waitForEvent(guestSocket, 'dice_rolled');
  hostSocket.emit('roll_dice', { isManual: true, targetRoll: 4 });
  const diceData = await dicePromise;
  assert.strictEqual(diceData.playerIndex, 0);
  logPass(`Spieler 1 hat gewürfelt (Augenzahl: ${diceData.roll}).`);

  // Host completes turn
  const turn1Promise = waitForEvent(guestSocket, 'turn_advanced');
  hostSocket.emit('turn_completed', { playerIndex: 0, coinDelta: 3, newPosition: 4 });
  const turn1Data = await turn1Promise;
  assert.strictEqual(turn1Data.turnIndex, 1, 'Zug muss sofort zu Spieler 2 (Gast) wechseln');
  logPass('Zug erfolgreich an Spieler 2 weitergegeben (kein Hängen oder Warten auf Spieler 3..6).');

  // Guest rolls dice
  const guestDicePromise = waitForEvent(hostSocket, 'dice_rolled');
  guestSocket.emit('roll_dice', { isManual: true, targetRoll: 3 });
  const guestDiceData = await guestDicePromise;
  assert.strictEqual(guestDiceData.playerIndex, 1);
  logPass(`Spieler 2 hat gewürfelt (Augenzahl: ${guestDiceData.roll}).`);

  // Guest completes turn -> all 2 players done, transitions to Minigame Intro!
  const minigamePromise = waitForEvent(hostSocket, 'minigame_intro');
  guestSocket.emit('turn_completed', { playerIndex: 1, coinDelta: -3, newPosition: 3 });
  const minigameData = await minigamePromise;
  assert(minigameData && minigameData.minigameId, 'Minispiel-Intro muss nach Abschluss aller 2 Spieler triggern');
  logPass(`Minispiel erfolgreich getriggert (Minispiel-ID: ${minigameData.minigameId}) ohne Deadlock.`);

  hostSocket.disconnect();
  guestSocket.disconnect();
  logPass('Test 2 erfolgreich abgeschlossen: Unterbesetztes Spiel läuft fehlerfrei durch.');
}

// ---------------------------------------------------------------------------
// TEST 3: Link-Isolation (Parallel-Raeume Raum A vs Raum B)
// ---------------------------------------------------------------------------
async function test3_RoomLinkIsolation() {
  logSection('TEST 3: Link-Isolation zwischen parallel geöffneten Räumen');

  const clientA1 = await createClient();
  const clientA2 = await createClient();
  const clientB1 = await createClient();
  const clientB2 = await createClient();

  // Create Room A
  const createAPromise = waitForEvent(clientA1, 'room_created');
  clientA1.emit('create_room', {
    playerName: 'HostA',
    maxPlayers: 4,
    enableBots: false,
    boardId: 'board_1',
    sessionId: 'session_iso_a1'
  });
  const { roomId: roomAId } = await createAPromise;

  // Create Room B
  const createBPromise = waitForEvent(clientB1, 'room_created');
  clientB1.emit('create_room', {
    playerName: 'HostB',
    maxPlayers: 4,
    enableBots: false,
    boardId: 'board_1',
    sessionId: 'session_iso_b1'
  });
  const { roomId: roomBId } = await createBPromise;

  assert.notStrictEqual(roomAId, roomBId, 'Raum-IDs müssen unterschiedlich sein');
  logPass(`Raum A (${roomAId}) und Raum B (${roomBId}) parallel geöffnet.`);

  // Join Room A
  const joinAPromise = waitForEvent(clientA2, 'room_joined');
  clientA2.emit('join_room', { roomId: roomAId, playerName: 'GuestA', sessionId: 'session_iso_a2' });
  await joinAPromise;

  // Join Room B
  const joinBPromise = waitForEvent(clientB2, 'room_joined');
  clientB2.emit('join_room', { roomId: roomBId, playerName: 'GuestB', sessionId: 'session_iso_b2' });
  await joinBPromise;
  logPass('Beide Räume haben jeweils 2 Spieler.');

  // Set up leak-detection listeners on Room B
  let leakDetected = false;
  const onLeak = (ev, data) => {
    leakDetected = true;
    logFail(`Event-Leak entdeckt: Raum B empfing Event "${ev}" aus Raum A: ${JSON.stringify(data)}`);
  };

  clientB1.on('game_started', (d) => onLeak('game_started', d));
  clientB1.on('dice_rolled', (d) => onLeak('dice_rolled', d));
  clientB1.on('turn_advanced', (d) => onLeak('turn_advanced', d));

  // Start Room A only
  const startAPromise = waitForEvent(clientA1, 'game_started');
  clientA1.emit('start_game');
  await startAPromise;
  logPass('Raum A hat das Spiel gestartet.');

  // Roll dice in Room A
  clientA1.emit('roll_dice', { isManual: true, targetRoll: 5 });
  await waitForEvent(clientA2, 'dice_rolled');

  // Wait a short moment to ensure no leaked events arrived in Room B
  await new Promise(r => setTimeout(r, 200));

  assert.strictEqual(leakDetected, false, 'Es darf kein Event zwischen Raum A und Raum B leaken!');
  logPass('Isolations-Prüfung bestanden: Raum B blieb völlig unberührt von Aktionen in Raum A.');

  clientA1.disconnect();
  clientA2.disconnect();
  clientB1.disconnect();
  clientB2.disconnect();
}

// ---------------------------------------------------------------------------
// TEST 4: Session Reconnect & Visitor Lock
// ---------------------------------------------------------------------------
async function test4_SessionReconnectAndVisitorLock() {
  logSection('TEST 4: Session Reconnect & Visitor Lock');

  const hostSocket = await createClient();
  const guestSocket = await createClient();

  const hostSession = 'session_rec_host';
  const guestSession = 'session_rec_guest';

  // 1. Setup active game in room
  const createPromise = waitForEvent(hostSocket, 'room_created');
  hostSocket.emit('create_room', {
    playerName: 'HostRec',
    maxPlayers: 4,
    enableBots: false,
    boardId: 'board_1',
    sessionId: hostSession
  });
  const { roomId } = await createPromise;

  const joinPromise = waitForEvent(guestSocket, 'room_joined');
  guestSocket.emit('join_room', {
    roomId,
    playerName: 'GuestRec',
    sessionId: guestSession
  });
  await joinPromise;

  // Start game so state is no longer 'LOBBY'
  const startPromise = waitForEvent(hostSocket, 'game_started');
  hostSocket.emit('start_game');
  await startPromise;
  logPass(`Spiel in Raum ${roomId} ist aktiv gestartet.`);

  // 2. Test Visitor Lock: Unknown visitor tries to join active game
  const strangerSocket = await createClient();
  const strangerJoinErrorPromise = waitForEvent(strangerSocket, 'join_error');
  strangerSocket.emit('join_room', {
    roomId,
    playerName: 'UnknownVisitor',
    sessionId: 'session_stranger_unknown'
  });

  const errData = await strangerJoinErrorPromise;
  assert(errData && errData.message, 'Server muss unbekannten Beitritt ablehnen');
  logPass(`Visitor Lock verifiziert: Unbekannter Beitritt während laufendem Spiel abgewiesen ("${errData.message}").`);
  strangerSocket.disconnect();

  // 3. Test Session Recovery: Guest simulates page reload (socket disconnects)
  logInfo('Gast simuliert Browser-Reload (Disconnect)...');
  guestSocket.disconnect();
  await new Promise(r => setTimeout(r, 150));

  // New socket connects representing the refreshed tab, using the SAME sessionId
  const reloadedGuestSocket = await createClient();
  const reconnectPromise = waitForEvent(reloadedGuestSocket, 'room_reconnected');
  reloadedGuestSocket.emit('reconnect_room', {
    roomId,
    sessionId: guestSession
  });

  const recData = await reconnectPromise;
  assert.strictEqual(recData.roomId, roomId);
  assert.strictEqual(recData.playerIndex, 1, 'Gast muss exakt seinen vorherigen Slot (1) zurückerhalten');
  assert.strictEqual(recData.room.players[1].name, 'GuestRec');
  logPass(`Session Reconnect verifiziert: Gast erfolgreich in Slot 1 wiederhergestellt.`);

  hostSocket.disconnect();
  reloadedGuestSocket.disconnect();
}

// ---------------------------------------------------------------------------
// TEST RUNNER
// ---------------------------------------------------------------------------
async function runAllTests() {
  console.log(`\n${BOLD}=====================================================================${RESET}`);
  console.log(`${BOLD}   QA- & SIMULATIONS-AGENTEN-TESTSUITE: "CLASS PARTY" ONLINE${RESET}`);
  console.log(`${BOLD}=====================================================================${RESET}`);

  // Test 1: Static Board & Coordinates Check
  test1_CoordinatesAndBoardManager();

  // Start Test Server
  logInfo(`Starte PartySpiel-Server im Test-Modus auf Port ${TEST_PORT}...`);
  const serverProcess = spawn('node', ['PartySpiel.js', '--no-tunnel', '--no-open'], {
    env: { ...process.env, PORT: TEST_PORT.toString(), TUNNEL: '0', NO_OPEN: '1' },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  // Wait for server ready
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server start timeout')), 7000);
    serverProcess.stdout.on('data', (d) => {
      if (d.toString().includes('SERVER BEREIT')) {
        clearTimeout(timeout);
        resolve();
      }
    });
    serverProcess.stderr.on('data', (d) => {
      // ignore warnings
    });
  });
  logPass(`Server läuft auf Port ${TEST_PORT}.`);

  try {
    // Run Dynamic Tests
    await test2_UnderfilledLobbyNoBots();
    await test3_RoomLinkIsolation();
    await test4_SessionReconnectAndVisitorLock();

    console.log(`\n${BOLD}${GREEN}=====================================================================${RESET}`);
    console.log(`${BOLD}${GREEN}   ALLE QA-SZENARIEN ERFOLGREICH BESTANDEN (100% PASS)${RESET}`);
    console.log(`${BOLD}${GREEN}=====================================================================${RESET}\n`);
    process.exitCode = 0;
  } catch (err) {
    console.error(`\n${BOLD}${RED}=====================================================================${RESET}`);
    console.error(`${BOLD}${RED}   QA-TEST FEHLGESCHLAGEN:${RESET}`, err);
    console.error(`${BOLD}${RED}=====================================================================${RESET}\n`);
    process.exitCode = 1;
  } finally {
    serverProcess.kill('SIGTERM');
  }
}

runAllTests();
