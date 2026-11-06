// boardManager.js - Modulare Brett-Architektur für "Class Party"
// Verwaltet Spielbretter als JSON-Konfiguration (boardId, backgroundImageUrl, tileCoordinates[], themeZones[])
// Ermöglicht das Hinzufügen weiterer Bretter ohne Änderung der Spielmechanik.

(function() {
  // Exakte relative Koordinaten (Prozentwerte X/Y von 0 bis 100) für "Spielbrett 1" (Spielfeld1.jpg)
  // Das Bild hat 4 Themenbereiche (Ägypten, Ozean, Weltraum, Stadt) und 53 physische Wegpunkte
  // (Start-Banner 0, Kacheln 1..51, Finish-Banner 52) entlang der Schlangenlinie.
  const TILE_COORDINATES_BOARD_1 = [
    // 0. START-BANNER (Ägypten - Oben Links)
    { id: 0, pctX: 7.62, pctY: 6.64, type: 'start', label: 'START', zone: 'egypt', visualText: 'START' },

    // 1..10: ÄGYPTEN (Pyramiden & Oasen-Pfad)
    { id: 1,  pctX: 8.79,  pctY: 15.56, type: 'red',      label: '-3🪙',  zone: 'egypt', visualText: '1' },
    { id: 2,  pctX: 14.65, pctY: 14.16, type: 'blue',     label: '+3🪙',  zone: 'egypt', visualText: '2' },
    { id: 3,  pctX: 20.70, pctY: 13.64, type: 'bank',     label: 'BANK',  zone: 'egypt', visualText: '3' },
    { id: 4,  pctX: 25.88, pctY: 17.66, type: 'blue',     label: '+3🪙',  zone: 'egypt', visualText: '4' },
    { id: 5,  pctX: 27.93, pctY: 26.75, type: 'event',    label: 'OASE',  zone: 'egypt', visualText: '5' },
    { id: 6,  pctX: 29.49, pctY: 36.71, type: 'red',      label: '-3🪙',  zone: 'egypt', visualText: '6a' },
    { id: 7,  pctX: 34.18, pctY: 41.61, type: 'shop',     label: 'SHOP',  zone: 'egypt', visualText: '6b' },
    { id: 8,  pctX: 39.94, pctY: 40.03, type: 'blue',     label: '+3🪙',  zone: 'egypt', visualText: '7' },
    { id: 9,  pctX: 45.02, pctY: 35.84, type: 'roulette', label: 'GLÜCK', zone: 'egypt', visualText: '8' },
    { id: 10, pctX: 49.61, pctY: 29.02, type: 'boost',    label: 'BOOST', zone: 'egypt', visualText: '9' },

    // 11..24: OZEAN (Versunkene Galeone & Korallenriff - Oben Rechts)
    { id: 11, pctX: 54.98, pctY: 21.15, type: 'blue',     label: '+3🪙',    zone: 'ocean', visualText: '10' },
    { id: 12, pctX: 60.16, pctY: 14.86, type: 'blue',     label: '+3🪙',    zone: 'ocean', visualText: '11' },
    { id: 13, pctX: 65.53, pctY: 10.84, type: 'red',      label: '-3🪙',    zone: 'ocean', visualText: '12' },
    { id: 14, pctX: 71.00, pctY: 7.87,  type: 'event',    label: 'DELFIN',  zone: 'ocean', visualText: '13' },
    { id: 15, pctX: 76.46, pctY: 6.82,  type: 'swap',     label: 'TAUSCH',  zone: 'ocean', visualText: '14' },
    { id: 16, pctX: 82.23, pctY: 7.52,  type: 'blue',     label: '+3🪙',    zone: 'ocean', visualText: '15' },
    { id: 17, pctX: 87.70, pctY: 10.49, type: 'roulette', label: 'GLÜCK',   zone: 'ocean', visualText: '16a' },
    { id: 18, pctX: 92.09, pctY: 17.13, type: 'shop',     label: 'SHOP',    zone: 'ocean', visualText: '16b' },
    { id: 19, pctX: 92.87, pctY: 26.57, type: 'duel',     label: 'DUELL',   zone: 'ocean', visualText: '17' },
    { id: 20, pctX: 89.55, pctY: 35.66, type: 'red',      label: '-3🪙',    zone: 'ocean', visualText: '18' },
    { id: 21, pctX: 83.59, pctY: 38.81, type: 'blue',     label: '+3🪙',    zone: 'ocean', visualText: '19a' },
    { id: 22, pctX: 77.44, pctY: 39.86, type: 'bank',     label: 'BANK',    zone: 'ocean', visualText: '20a' },
    { id: 23, pctX: 71.68, pctY: 42.13, type: 'event',    label: 'STRÖMUNG',zone: 'ocean', visualText: '19b' },
    { id: 24, pctX: 68.65, pctY: 50.35, type: 'boost',    label: 'BOOST',   zone: 'ocean', visualText: '20b' },

    // 25..41: WELTRAUM (Galaxie & Raketenorbit - Unten Rechts)
    { id: 25, pctX: 70.70, pctY: 57.87, type: 'red',      label: '-3🪙',  zone: 'space', visualText: '21' },
    { id: 26, pctX: 75.49, pctY: 60.14, type: 'blue',     label: '+3🪙',  zone: 'space', visualText: '22' },
    { id: 27, pctX: 80.76, pctY: 58.57, type: 'red',      label: '-3🪙',  zone: 'space', visualText: '23' },
    { id: 28, pctX: 85.94, pctY: 57.52, type: 'shop',     label: 'SHOP',  zone: 'space', visualText: '24a' },
    { id: 29, pctX: 90.43, pctY: 60.14, type: 'blue',     label: '+3🪙',  zone: 'space', visualText: '24b' },
    { id: 30, pctX: 93.55, pctY: 67.48, type: 'bowser',   label: 'CHAOS', zone: 'space', visualText: '25a' },
    { id: 31, pctX: 93.95, pctY: 76.75, type: 'roulette', label: 'GLÜCK', zone: 'space', visualText: '26a' },
    { id: 32, pctX: 91.31, pctY: 84.97, type: 'red',      label: '-3🪙',  zone: 'space', visualText: '27a' },
    { id: 33, pctX: 87.01, pctY: 89.86, type: 'event',    label: 'KOSMOS',zone: 'space', visualText: '24c' },
    { id: 34, pctX: 82.13, pctY: 90.21, type: 'red',      label: '-3🪙',  zone: 'space', visualText: '25b' },
    { id: 35, pctX: 77.64, pctY: 86.71, type: 'blue',     label: '+3🪙',  zone: 'space', visualText: '26b' },
    { id: 36, pctX: 73.44, pctY: 80.94, type: 'bank',     label: 'BANK',  zone: 'space', visualText: '27b' },
    { id: 37, pctX: 69.53, pctY: 75.35, type: 'duel',     label: 'DUELL', zone: 'space', visualText: '28' },
    { id: 38, pctX: 65.53, pctY: 71.50, type: 'blue',     label: '+3🪙',  zone: 'space', visualText: '29a' },
    { id: 39, pctX: 60.64, pctY: 69.58, type: 'red',      label: '-3🪙',  zone: 'space', visualText: '29b' },
    { id: 40, pctX: 55.47, pctY: 69.93, type: 'swap',     label: 'TAUSCH',zone: 'space', visualText: '29c' },
    { id: 41, pctX: 50.49, pctY: 72.55, type: 'boost',    label: 'BOOST', zone: 'space', visualText: '30a' },

    // 42..51: STADT (Skyline & Metropole - Unten Links)
    { id: 42, pctX: 46.09, pctY: 77.27, type: 'blue',     label: '+3🪙',  zone: 'city', visualText: '30b' },
    { id: 43, pctX: 42.38, pctY: 83.92, type: 'event',    label: 'U-BAHN',zone: 'city', visualText: '31' },
    { id: 44, pctX: 38.28, pctY: 88.46, type: 'red',      label: '-3🪙',  zone: 'city', visualText: '32' },
    { id: 45, pctX: 33.20, pctY: 88.11, type: 'shop',     label: 'SHOP',  zone: 'city', visualText: '33' },
    { id: 46, pctX: 28.61, pctY: 83.74, type: 'red',      label: '-3🪙',  zone: 'city', visualText: '34' },
    { id: 47, pctX: 24.51, pctY: 77.45, type: 'roulette', label: 'GLÜCK', zone: 'city', visualText: '35' },
    { id: 48, pctX: 19.82, pctY: 72.20, type: 'blue',     label: '+3🪙',  zone: 'city', visualText: '36' },
    { id: 49, pctX: 14.36, pctY: 70.80, type: 'duel',     label: 'DUELL', zone: 'city', visualText: '38' },
    { id: 50, pctX: 9.47,  pctY: 76.40, type: 'bank',     label: 'BANK',  zone: 'city', visualText: '39' },
    { id: 51, pctX: 8.11,  pctY: 86.54, type: 'red',      label: '-3🪙',  zone: 'city', visualText: '40' },

    // 52. FINISH-BANNER (Ziel & Runden-Durchlauf)
    { id: 52, pctX: 8.79,  pctY: 93.53, type: 'finish',   label: 'ZIEL',  zone: 'city', visualText: 'FINISH' }
  ];

  const THEME_ZONES_BOARD_1 = [
    {
      id: 'egypt',
      name: 'Ägypten (Wüste & Pyramiden)',
      color: '#F59E0B',
      tileRange: [0, 10],
      events: [
        { title: '🏜️ Geheimnis der Sphinx', desc: 'Du löst das Rätsel der Sphinx: +5 Münzen gefunden!', coins: 5 },
        { title: '🏺 Grabkammer-Fund', desc: 'Eine goldene Urne! Du ziehst +1 Wunsch-Würfel!', item: 'gold_dice' },
        { title: '🐫 Oasen-Rast', desc: 'Frisches Quellwasser erfrischt dich: +2 Felder vorwärts!', advance: 2 }
      ]
    },
    {
      id: 'ocean',
      name: 'Ozean (Schiffswrack & Riff)',
      color: '#06B6D4',
      tileRange: [11, 24],
      events: [
        { title: '🐬 Delfin-Welle', desc: 'Eine Welle freundlicher Delfine trägt dich +3 Felder vorwärts!', advance: 3 },
        { title: '🏴‍☠️ Piratenschatz', desc: 'Am Wrack geborgen: Du erhältst 7 glänzende Goldmünzen!', coins: 7 },
        { title: '🐙 Oktopus-Schutz', desc: 'Der Oktopus hüllt dich in Schutz-Tinte: +1 Schutzschild!', item: 'shield' }
      ]
    },
    {
      id: 'space',
      name: 'Weltraum (Kosmos & Sterne)',
      color: '#8B5CF6',
      tileRange: [25, 41],
      events: [
        { title: '🚀 Schwerelosigkeit', desc: 'Kosmischer Gravitations-Boost: Du schwebst +4 Felder voran!', advance: 4 },
        { title: '🪐 Planeten-Segen', desc: 'Saturnringe verleihen dir +1 Goldenen Doppel-Würfel!', item: 'double_dice' },
        { title: '☄️ Sternschnuppe', desc: 'Ein Wunsch geht in Erfüllung: +8 Münzen!', coins: 8 }
      ]
    },
    {
      id: 'city',
      name: 'Stadt (Metropole & Skyline)',
      color: '#10B981',
      tileRange: [42, 52],
      events: [
        { title: '🚇 U-Bahn-Express', desc: 'Die Grüne Linie nimmt die Express-Spur: +3 Felder!', advance: 3 },
        { title: '🏢 Wolkenkratzer-Deal', desc: 'Erfolgreicher Klassenausflug ins Penthouse: +6 Münzen!', coins: 6 },
        { title: '🎉 Straßenparade', desc: 'Eine Blaskapelle zieht vorbei: Du erhältst eine Party-Hupe!', item: 'party_horn' }
      ]
    }
  ];

  class BoardManager {
    constructor() {
      this.boards = new Map();
      this.activeBoardId = 'board_1';
      this.initDefaultBoards();
    }

    registerBoard(boardConfig) {
      if (!boardConfig || (!boardConfig.boardId && !boardConfig.id)) {
        console.error('[BoardManager] Ungültige Board-Konfiguration:', boardConfig);
        return;
      }
      const id = boardConfig.boardId || boardConfig.id;
      boardConfig.boardId = id;
      boardConfig.id = id;
      this.boards.set(id, boardConfig);
      console.log(`[BoardManager] Spielbrett "${id}" (${boardConfig.name}) erfolgreich registriert.`);
    }

    getBoard(boardId) {
      if (boardId && this.boards.has(boardId)) {
        return this.boards.get(boardId);
      }
      return this.boards.get(this.activeBoardId) || this.boards.get('board_1');
    }

    getAllBoards() {
      return Array.from(this.boards.values());
    }

    getCurrentBoard() {
      return this.getBoard(this.activeBoardId);
    }

    setCurrentBoard(boardId) {
      if (this.boards.has(boardId)) {
        this.activeBoardId = boardId;
        console.log(`[BoardManager] Aktives Spielbrett gewechselt zu: "${boardId}"`);
        return true;
      }
      console.warn(`[BoardManager] Board "${boardId}" nicht gefunden, behalte "${this.activeBoardId}"`);
      return false;
    }

    initDefaultBoards() {
      // =======================================================================
      // SPIELBRETT 1: Vier Welten (Ägypten, Ozean, Weltraum, Stadt)
      // =======================================================================
      this.registerBoard({
        boardId: 'board_1',
        name: 'Vier Welten (Spielbrett 1)',
        subtitle: 'Ägypten • Ozean • Weltraum • Stadt',
        description: '53 hochpräzise Wegpunkte entlang der Schlangenlinie von START bis FINISH.',
        backgroundImageUrl: 'assets/Spielfeld1.jpg',
        aspectRatio: 1024 / 572,
        virtualWidth: 1920,
        virtualHeight: 1072.5,
        defaultStarTileIndex: 18,
        isImageBased: true,
        tileCoordinates: TILE_COORDINATES_BOARD_1,
        themeZones: THEME_ZONES_BOARD_1
      });

      // =======================================================================
      // SPIELBRETT KLASSISCH: 5-Themen-Inseln (Canvas Procedural)
      // =======================================================================
      this.registerBoard({
        boardId: 'board_classic',
        name: '5 Inselwelten (Klassisch)',
        subtitle: 'Inselparadies • Dschungel • Geisterstadt • Schule • Wüste',
        description: '66 Felder, Gabelungen und Brücken über die prozedurale 2D-Weltkarte.',
        backgroundImageUrl: null,
        aspectRatio: 3200 / 2200,
        virtualWidth: 3200,
        virtualHeight: 2200,
        defaultStarTileIndex: 18,
        isImageBased: false,
        tileCoordinates: null, // Wird vom klassischen Canvas-Generator gerendert
        themeZones: [
          { id: 'island', name: 'Inselparadies', color: '#0EA5E9', tileRange: [0, 12] },
          { id: 'jungle', name: 'Dschungel-Tempel', color: '#10B981', tileRange: [13, 25] },
          { id: 'ghost_town', name: 'Geisterstadt', color: '#8B5CF6', tileRange: [26, 38] },
          { id: 'school', name: 'Die Schule', color: '#F59E0B', tileRange: [39, 51] },
          { id: 'desert', name: 'Pyramidenwüste', color: '#EF4444', tileRange: [52, 65] }
        ]
      });
    }
  }

  // Global Singleton (Browser & Node.js Universal)
  const globalObj = (typeof window !== 'undefined') ? window : (typeof global !== 'undefined' ? global : this);
  const managerInstance = new BoardManager();
  globalObj.BoardManager = managerInstance;
  globalObj.boardManager = managerInstance;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BoardManager, boardManager: managerInstance };
  }
})();
