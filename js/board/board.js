// board.js - Modular GameBoard for "Class Party"
// Unterstützt modulare Boards über den BoardManager:
// - Spielbrett 1 ("board_1"): Vier Welten (Ägypten, Ozean, Weltraum, Stadt) mit 53 Wegpunkten
// - Spielbrett Klassisch ("board_classic"): 5 Inselwelten mit prozeduralem Canvas-Terrain

(function() {
  class GameBoard {
    constructor(boardId = 'board_1') {
      this.jackpotCoins = 10;
      this.particles = [];
      this.loadedImages = {};
      this.setupCameraListenersDone = false;

      // Smart-Kamera System
      this.camera = {
        x: 960,
        y: 536,
        zoom: 0.72,
        targetX: 960,
        targetY: 536,
        targetZoom: 0.72,
        isOverview: true,
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        lastCamX: 0,
        lastCamY: 0
      };

      this.loadBoard(boardId);
    }

    // =========================================================================
    // 1. MODULARE BRETT-INITIALISIERUNG ÜBER BOARDMANAGER
    // =========================================================================
    loadBoard(boardId) {
      const bm = window.BoardManager;
      const config = bm ? bm.getBoard(boardId) : null;

      if (!config) {
        console.warn(`[GameBoard] Konfiguration für "${boardId}" nicht gefunden, verwende Fallback.`);
        this.boardConfig = {
          boardId: 'board_1',
          name: 'Vier Welten',
          virtualWidth: 1920,
          virtualHeight: 1072.5,
          isImageBased: true,
          backgroundImageUrl: 'assets/Spielfeld1.jpg',
          tileCoordinates: []
        };
      } else {
        this.boardConfig = config;
      }

      this.width = this.boardConfig.virtualWidth || 1920;
      this.height = this.boardConfig.virtualHeight || 1072.5;
      this.starTileIndex = this.boardConfig.defaultStarTileIndex || 18;

      if (this.boardConfig.isImageBased && this.boardConfig.backgroundImageUrl) {
        this.initImageBasedBoard(this.boardConfig);
      } else {
        this.initClassicProceduralBoard();
      }

      // Initialisiere Kamera auf Mitte des Brettes
      this.camera.x = this.width / 2;
      this.camera.y = this.height / 2;
      this.camera.targetX = this.width / 2;
      this.camera.targetY = this.height / 2;
      this.camera.isOverview = true;
    }

    initImageBasedBoard(config) {
      // Preload Hintergrundbild
      if (!this.loadedImages[config.backgroundImageUrl]) {
        const img = new Image();
        img.src = config.backgroundImageUrl;
        img.onload = () => {
          this.bgImageLoaded = true;
        };
        this.loadedImages[config.backgroundImageUrl] = img;
      }
      this.bgImage = this.loadedImages[config.backgroundImageUrl];

      // Mappe relative Prozentkoordinaten (0..100) auf virtuelle Pixelkoordinaten
      const rawCoords = config.tileCoordinates || [];
      const totalTiles = rawCoords.length;

      this.tiles = rawCoords.map((t, idx) => {
        const x = Math.round((t.pctX / 100) * this.width);
        const y = Math.round((t.pctY / 100) * this.height);
        // Schlangenlinie schließt sich am Ziel wieder zur Startrunde zusammen
        const next = [(t.id + 1) % totalTiles];

        return {
          id: t.id !== undefined ? t.id : idx,
          x,
          y,
          pctX: t.pctX,
          pctY: t.pctY,
          type: t.type || 'blue',
          label: t.label || '',
          zone: t.zone || 'egypt',
          visualText: t.visualText || `${idx + 1}`,
          next
        };
      });

      console.log(`[GameBoard] Spielbrett "${config.boardId}" geladen: ${this.tiles.length} Wegpunkte aktiv.`);
    }

    initClassicProceduralBoard() {
      // Klassisches 66-Felder Insel-Brett (Fallback für Classic-Modus)
      const rawTiles = [
        // Inselparadies (0..12)
        { id: 0,  x: 280,  y: 680, type: 'start', label: 'START' },
        { id: 1,  x: 390,  y: 620, type: 'blue' },
        { id: 2,  x: 500,  y: 560, type: 'blue' },
        { id: 3,  x: 610,  y: 510, type: 'event', label: 'DELFIN' },
        { id: 4,  x: 720,  y: 470, type: 'shop',  label: 'SHOP' },
        { id: 5,  x: 830,  y: 440, type: 'blue' },
        { id: 6,  x: 940,  y: 430, type: 'roulette', label: 'GLÜCK' },
        { id: 7,  x: 890,  y: 330, type: 'red' },
        { id: 8,  x: 770,  y: 280, type: 'bank',  label: 'BANK' },
        { id: 9,  x: 640,  y: 270, type: 'blue' },
        { id: 10, x: 520,  y: 300, type: 'fork',  label: 'GABELUNG 1' },
        { id: 11, x: 410,  y: 370, type: 'duel',  label: 'DUELL' },
        { id: 12, x: 330,  y: 470, type: 'boost', label: 'BOOST' },
        // Dschungel (13..25)
        { id: 13, x: 1250, y: 380, type: 'blue', label: 'BRÜCKE' },
        { id: 14, x: 1450, y: 380, type: 'blue' },
        { id: 15, x: 1600, y: 400, type: 'event', label: 'DSCHUNGEL' },
        { id: 16, x: 1730, y: 360, type: 'shop',  label: 'SHOP' },
        { id: 17, x: 1870, y: 330, type: 'blue' },
        { id: 18, x: 2010, y: 340, type: 'swap',  label: 'TAUSCH' },
        { id: 19, x: 2130, y: 390, type: 'red' },
        { id: 20, x: 2210, y: 480, type: 'roulette', label: 'GLÜCK' },
        { id: 21, x: 2160, y: 590, type: 'duel',  label: 'DUELL' },
        { id: 22, x: 2040, y: 640, type: 'bank',  label: 'BANK' },
        { id: 23, x: 1910, y: 650, type: 'fork',  label: 'GABELUNG 2' },
        { id: 24, x: 1770, y: 620, type: 'boost', label: 'BOOST' },
        { id: 25, x: 1640, y: 540, type: 'blue' },
        // Geisterstadt (26..38)
        { id: 26, x: 2420, y: 800,  type: 'blue', label: 'VIADUKT' },
        { id: 27, x: 2560, y: 920,  type: 'blue' },
        { id: 28, x: 2670, y: 1020, type: 'boo',   label: 'BOO' },
        { id: 29, x: 2780, y: 1100, type: 'red' },
        { id: 30, x: 2840, y: 1220, type: 'event', label: 'SPUK' },
        { id: 31, x: 2820, y: 1350, type: 'shop',  label: 'SHOP' },
        { id: 32, x: 2730, y: 1450, type: 'blue' },
        { id: 33, x: 2610, y: 1510, type: 'bowser', label: 'CHAOS' },
        { id: 34, x: 2480, y: 1490, type: 'blue' },
        { id: 35, x: 2380, y: 1400, type: 'roulette', label: 'GLÜCK' },
        { id: 36, x: 2360, y: 1270, type: 'swap',  label: 'TAUSCH' },
        { id: 37, x: 2410, y: 1150, type: 'fork',  label: 'GABELUNG 3' },
        { id: 38, x: 2510, y: 1090, type: 'duel',  label: 'DUELL' },
        // Schule (39..51)
        { id: 39, x: 2260, y: 1680, type: 'bank',  label: 'BANK' },
        { id: 40, x: 2110, y: 1720, type: 'blue',  label: 'SCHULE' },
        { id: 41, x: 1980, y: 1720, type: 'event', label: 'TEST' },
        { id: 42, x: 1850, y: 1680, type: 'boost', label: 'BOOST' },
        { id: 43, x: 1720, y: 1630, type: 'shop',  label: 'SHOP' },
        { id: 44, x: 1600, y: 1590, type: 'roulette', label: 'GLÜCK' },
        { id: 45, x: 1520, y: 1490, type: 'blue' },
        { id: 46, x: 1570, y: 1380, type: 'red' },
        { id: 47, x: 1690, y: 1330, type: 'duel',  label: 'DUELL' },
        { id: 48, x: 1820, y: 1350, type: 'fork',  label: 'GABELUNG 4' },
        { id: 49, x: 1940, y: 1410, type: 'blue' },
        { id: 50, x: 2010, y: 1510, type: 'event', label: 'TEST' },
        { id: 51, x: 1960, y: 1610, type: 'bank',  label: 'BANK' },
        // Pyramidenwüste (52..65)
        { id: 52, x: 1320, y: 1650, type: 'blue',  label: 'OASEN-WEG' },
        { id: 53, x: 1140, y: 1650, type: 'blue',  label: 'WÜSTE' },
        { id: 54, x: 990,  y: 1670, type: 'bowser', label: 'CHAOS' },
        { id: 55, x: 860,  y: 1720, type: 'shop',  label: 'SHOP' },
        { id: 56, x: 730,  y: 1760, type: 'duel',  label: 'DUELL' },
        { id: 57, x: 600,  y: 1770, type: 'event', label: 'PHARAO' },
        { id: 58, x: 470,  y: 1740, type: 'boost', label: 'BOOST' },
        { id: 59, x: 380,  y: 1650, type: 'roulette', label: 'GLÜCK' },
        { id: 60, x: 350,  y: 1520, type: 'boo',   label: 'GEIST' },
        { id: 61, x: 400,  y: 1400, type: 'red' },
        { id: 62, x: 500,  y: 1330, type: 'swap',  label: 'TAUSCH' },
        { id: 63, x: 630,  y: 1310, type: 'event', label: 'OASE' },
        { id: 64, x: 740,  y: 1360, type: 'bank',  label: 'BANK' },
        { id: 65, x: 800,  y: 1470, type: 'blue',  label: 'DAMM' }
      ];

      this.tiles = rawTiles.map(t => {
        let next = [];
        if (t.id === 65) next = [0];
        else if (t.id === 10) next = [11, 13];
        else if (t.id === 23) next = [24, 26];
        else if (t.id === 37) next = [38, 39];
        else if (t.id === 48) next = [49, 52];
        else next = [t.id + 1];

        return { ...t, next, visualText: `${t.id + 1}` };
      });
    }

    // =========================================================================
    // 2. WEGE- & NAVIGATIONSLOGIK
    // =========================================================================
    getTile(id) {
      if (!this.tiles || this.tiles.length === 0) return null;
      return this.tiles[id] || this.tiles[0];
    }

    getNextTile(currentId, branchIndex = 0) {
      const tile = this.getTile(currentId);
      if (!tile || !tile.next || tile.next.length === 0) return (currentId + 1) % this.tiles.length;
      return tile.next[branchIndex] !== undefined ? tile.next[branchIndex] : tile.next[0];
    }

    isFork(tileId) {
      const tile = this.getTile(tileId);
      return tile && tile.next && tile.next.length > 1;
    }

    getForkMetadata(tileId) {
      if (tileId === 10) {
        return {
          title: 'Gabelung 1: Inselstrand oder Dschungelbrücke?',
          branchA: { text: 'Insel-Strandpfad', sub: 'Bleibe auf der Sonnen-Insel (Duell & Boost)' },
          branchB: { text: 'Große Hängebrücke', sub: 'Überquere das Meer zum Dschungel-Tempel' }
        };
      }
      if (tileId === 23) {
        return {
          title: 'Gabelung 2: Dschungel-Pfad oder Viadukt zur Geisterstadt?',
          branchA: { text: 'Tempel-Plateau', sub: 'Tiefer in den Regenwald (Boost-Feld)' },
          branchB: { text: 'Schlucht-Viadukt', sub: 'Direkter Weg zur düsteren Geisterstadt' }
        };
      }
      if (tileId === 37) {
        return {
          title: 'Gabelung 3: Saloon-Hinterhof oder Schulweg?',
          branchA: { text: 'Spukhaus-Weg', sub: 'Vorbei an Saloon & Duell-Platz' },
          branchB: { text: 'Weg zur Schule', sub: 'Richtung Schulhof & IT-Klassenzimmer' }
        };
      }
      if (tileId === 48) {
        return {
          title: 'Gabelung 4: Große Pause oder Aufbruch zur Wüste?',
          branchA: { text: 'Schulhof-Runde', sub: 'Überraschungs-Test & Bank' },
          branchB: { text: 'Oasen-Sanddamm', sub: 'Hinaus in die Pyramidenwüste' }
        };
      }
      return {
        title: 'Weg-Entscheidung',
        branchA: { text: 'Pfad A', sub: 'Hauptweg' },
        branchB: { text: 'Pfad B', sub: 'Alternative' }
      };
    }

    getRandomStarTile(excludeIndex = -1) {
      if (!this.tiles || this.tiles.length === 0) return 18;
      const validTiles = this.tiles
        .map((t, idx) => idx)
        .filter(idx => {
          const t = this.tiles[idx];
          return idx !== excludeIndex && t.type !== 'start' && t.type !== 'finish' && t.type !== 'fork' && t.type !== 'bowser';
        });
      if (validTiles.length === 0) return 18;
      return validTiles[Math.floor(Math.random() * validTiles.length)];
    }

    getBiome(tileIndex) {
      const tile = this.getTile(tileIndex);
      if (tile && tile.zone) return tile.zone;
      if (tileIndex <= 10) return 'egypt';
      if (tileIndex <= 24) return 'ocean';
      if (tileIndex <= 41) return 'space';
      return 'city';
    }

    getBiomeEvent(tileIndex) {
      const biomeId = this.getBiome(tileIndex);
      const zones = (this.boardConfig && this.boardConfig.themeZones) || [];
      const zoneObj = zones.find(z => z.id === biomeId);

      if (zoneObj && zoneObj.events && zoneObj.events.length > 0) {
        const ev = zoneObj.events[Math.floor(Math.random() * zoneObj.events.length)];
        return {
          biome: biomeId,
          title: ev.title,
          desc: ev.desc,
          coins: ev.coins,
          advance: ev.advance,
          item: ev.item
        };
      }

      // Default Fallback Events
      if (biomeId === 'egypt') {
        return {
          biome: biomeId,
          title: '🏜️ Geheimnis der Sphinx',
          desc: 'Ein uralter Goldschatz wird im Sand freigelegt: Du erhältst +5 Münzen!',
          coins: 5
        };
      } else if (biomeId === 'ocean') {
        return {
          biome: biomeId,
          title: '🐬 Delfin-Welle',
          desc: 'Eine Welle freundlicher Delfine trägt dich +3 Felder vorwärts!',
          advance: 3
        };
      } else if (biomeId === 'space') {
        return {
          biome: biomeId,
          title: '🚀 Kosmischer Antrieb',
          desc: 'Kosmischer Rückenwind: Du erhältst einen Wunsch-Würfel!',
          item: 'gold_dice'
        };
      } else {
        return {
          biome: biomeId,
          title: '🚇 City-Rush & U-Bahn',
          desc: 'Du nimmst die Abkürzung und springst +3 Felder vorwärts!',
          advance: 3
        };
      }
    }

    // =========================================================================
    // 3. KAMERA & INTERAKTIVITÄT
    // =========================================================================
    setupCameraListeners(canvas) {
      if (this.setupCameraListenersDone) return;
      this.setupCameraListenersDone = true;

      canvas.addEventListener('mousedown', (e) => {
        this.camera.isDragging = true;
        this.camera.dragStartX = e.clientX;
        this.camera.dragStartY = e.clientY;
        this.camera.lastCamX = this.camera.targetX;
        this.camera.lastCamY = this.camera.targetY;
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.camera.isDragging) return;
        const dx = (e.clientX - this.camera.dragStartX) / this.camera.zoom;
        const dy = (e.clientY - this.camera.dragStartY) / this.camera.zoom;
        this.camera.targetX = this.camera.lastCamX - dx;
        this.camera.targetY = this.camera.lastCamY - dy;
        this.camera.isOverview = false;
      });

      window.addEventListener('mouseup', () => {
        this.camera.isDragging = false;
      });

      // Mausrad Zoom
      canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomDelta = e.deltaY < 0 ? 0.1 : -0.1;
        this.camera.targetZoom = Math.max(0.35, Math.min(2.5, this.camera.targetZoom + zoomDelta));
        this.camera.isOverview = false;
      }, { passive: false });

      // Tastatur-Shortcuts
      window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'm' || e.key === 'M') {
          this.toggleOverview();
        }
      });
    }

    toggleOverview(canvas) {
      this.camera.isOverview = !this.camera.isOverview;
      if (this.camera.isOverview) {
        this.camera.targetX = this.width / 2;
        this.camera.targetY = this.height / 2;
        const cWidth = canvas ? canvas.width : 1400;
        const cHeight = canvas ? canvas.height : 880;
        this.camera.targetZoom = Math.min(cWidth / this.width, cHeight / this.height) * 0.95;
      } else {
        this.camera.targetZoom = 1.15;
      }
    }

    centerOnPlayer(player) {
      if (!player) return;
      const tile = this.getTile(player.boardPosition);
      if (tile) {
        this.camera.targetX = tile.x;
        this.camera.targetY = tile.y - 20;
        this.camera.targetZoom = 1.15;
        this.camera.isOverview = false;
      }
    }

    updateCamera(activePlayer, canvas) {
      if (!this.camera.isDragging && !this.camera.isOverview && activePlayer) {
        const tile = this.getTile(activePlayer.boardPosition);
        if (tile) {
          this.camera.targetX = tile.x;
          this.camera.targetY = tile.y - 20;
        }
      }

      if (this.camera.isOverview && canvas) {
        const fitZoom = Math.min(canvas.width / this.width, canvas.height / this.height) * 0.96;
        this.camera.targetZoom = fitZoom;
        this.camera.targetX = this.width / 2;
        this.camera.targetY = this.height / 2;
      }

      const lerpSpeed = 0.09;
      this.camera.x += (this.camera.targetX - this.camera.x) * lerpSpeed;
      this.camera.y += (this.camera.targetY - this.camera.y) * lerpSpeed;
      this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * lerpSpeed;
    }

    // =========================================================================
    // 4. RENDERING: HINTERGRUNDBILD, WEGPUNKTE, FIGUREN & EFFEKTE
    // =========================================================================
    render(ctx, players, turnIndex, starTileIndex, time = 0) {
      const canvas = ctx.canvas;
      this.setupCameraListeners(canvas);

      const activePlayer = players && players[turnIndex];
      this.updateCamera(activePlayer, canvas);

      ctx.save();
      // Leere dunkle Spielfläche
      ctx.fillStyle = '#050814';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Kamera-Transformation
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(this.camera.zoom, this.camera.zoom);
      ctx.translate(-this.camera.x, -this.camera.y);

      if (this.boardConfig && this.boardConfig.isImageBased) {
        // --- 1. BILD-BASIERTES BRETT (SPIELBRETT 1) ---
        this.drawImageBoard(ctx, time);
        this.drawImageBoardWaypoints(ctx, starTileIndex, time);
      } else {
        // --- 2. KLASSISCHES PROZEDURALES BRETT ---
        this.drawDeepOcean(ctx, time);
        this.drawThemedIslands(ctx, time);
        this.drawBridges(ctx, time);
        this.drawPathWithArrows(ctx, time);
        this.drawClassicTiles(ctx, starTileIndex, time);
      }

      // 3. Schwebender Stern
      this.drawFloatingStar(ctx, starTileIndex, time);

      // 4. Partikel-Effekte
      this.drawParticles(ctx);

      // 5. Spielerfiguren mit weicher Sprung-Animation
      this.drawPlayers(ctx, players, turnIndex, time);

      ctx.restore();
    }

    drawImageBoard(ctx, time) {
      if (this.bgImage && this.bgImage.complete && this.bgImage.naturalWidth > 0) {
        // Sanfter Schatten unter dem Brett
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 15;
        ctx.drawImage(this.bgImage, 0, 0, this.width, this.height);
        ctx.restore();

        // Eleganter Leuchtrahmen um das Spielbrett
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, this.width, this.height);
      } else {
        // Schicker Fallback-Gradient während des Ladens
        const grad = ctx.createLinearGradient(0, 0, this.width, this.height);
        grad.addColorStop(0, '#1E1B4B');
        grad.addColorStop(0.5, '#0F172A');
        grad.addColorStop(1, '#022C22');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.fillStyle = '#FDE047';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Lade Spielbrett 1 (Vier Welten)...', this.width / 2, this.height / 2);
      }
    }

    drawImageBoardWaypoints(ctx, starTileIndex, time) {
      if (!this.tiles || this.tiles.length === 0) return;

      // 1. Verbindungs-Leuchtlinie entlang der Schlangenlinie
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < this.tiles.length; i++) {
        const t = this.tiles[i];
        if (i === 0) ctx.moveTo(t.x, t.y);
        else ctx.lineTo(t.x, t.y);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 6;
      ctx.setLineDash([8, 12]);
      ctx.lineDashOffset = -time * 24;
      ctx.stroke();
      ctx.restore();

      // 2. Dezente interaktive Wegpunkt-Markierungen & Auren
      const tileRadius = 26;
      const typeIcons = {
        start: '🚩',
        finish: '🏆',
        blue: '🪙',
        red: '🛑',
        shop: '🛒',
        bank: '🏦',
        roulette: '🎰',
        duel: '⚔️',
        boost: '🚀',
        swap: '🔄',
        bowser: '😈',
        event: '⭐'
      };

      const typeGlowColors = {
        start: 'rgba(168, 85, 247, 0.55)',
        finish: 'rgba(234, 179, 8, 0.85)',
        blue: 'rgba(59, 130, 246, 0.45)',
        red: 'rgba(239, 68, 68, 0.45)',
        shop: 'rgba(16, 185, 129, 0.55)',
        bank: 'rgba(245, 158, 11, 0.55)',
        roulette: 'rgba(234, 179, 8, 0.55)',
        duel: 'rgba(217, 70, 239, 0.55)',
        boost: 'rgba(249, 115, 22, 0.55)',
        swap: 'rgba(192, 132, 252, 0.55)',
        bowser: 'rgba(220, 38, 38, 0.65)',
        event: 'rgba(14, 165, 233, 0.55)'
      };

      this.tiles.forEach((t, idx) => {
        const isStar = idx === starTileIndex;
        const glowCol = isStar ? 'rgba(250, 204, 21, 0.9)' : (typeGlowColors[t.type] || 'rgba(255, 255, 255, 0.3)');

        ctx.save();
        ctx.translate(t.x, t.y);

        // Sanfte pulsierende Umrandung
        const pulse = Math.sin(time * 3 + idx * 0.4) * 3;
        ctx.beginPath();
        ctx.arc(0, 0, tileRadius + pulse, 0, Math.PI * 2);
        ctx.strokeStyle = glowCol;
        ctx.lineWidth = isStar ? 4 : 2;
        ctx.shadowColor = glowCol;
        ctx.shadowBlur = isStar ? 16 : 8;
        ctx.stroke();

        // Kleines Aktions-Icon über dem Feld (nur für Spezialfelder)
        if (t.type !== 'blue' && t.type !== 'red') {
          const icon = typeIcons[t.type] || '⭐';
          ctx.font = '14px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(icon, 0, -tileRadius - 10);
        }

        ctx.restore();
      });
    }

    // =========================================================================
    // 5. SCHWEBENDER 3D-STERN
    // =========================================================================
    drawFloatingStar(ctx, starTileIndex, time) {
      const tile = this.getTile(starTileIndex);
      if (!tile) return;

      const floatY = Math.sin(time * 3.5) * 12;
      const sx = tile.x;
      const sy = tile.y - 48 + floatY;

      ctx.save();

      // Goldene Boden-Aura auf dem Zielfeld
      const auraGrad = ctx.createRadialGradient(tile.x, tile.y, 4, tile.x, tile.y, 42);
      auraGrad.addColorStop(0, 'rgba(250, 204, 21, 0.85)');
      auraGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
      auraGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.ellipse(tile.x, tile.y + 4, 38, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Strahlende Licht-Säule
      ctx.fillStyle = 'rgba(253, 224, 71, 0.15)';
      ctx.beginPath();
      ctx.moveTo(tile.x - 18, tile.y);
      ctx.lineTo(sx - 24, sy);
      ctx.lineTo(sx + 24, sy);
      ctx.lineTo(tile.x + 18, tile.y);
      ctx.closePath();
      ctx.fill();

      // Schwebender Stern (3D Rotations-Effekt)
      ctx.translate(sx, sy);
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 24;

      const scaleX = Math.cos(time * 2.2);
      ctx.scale(scaleX, 1);

      ctx.font = '36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⭐', 0, 0);

      ctx.restore();

      // Preis-Badge "20 🪙" unter dem Stern
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.beginPath();
      ctx.roundRect(sx - 34, sy + 28, 68, 20, 8);
      ctx.fill();
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#FDE047';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('20 🪙', sx, sy + 38);
      ctx.restore();
    }

    // =========================================================================
    // 6. SPIELFIGUREN MIT WEICHER SPRUNG-ANIMATION (HOP-ARC)
    // =========================================================================
    drawPlayers(ctx, players, turnIndex, time) {
      if (!players || players.length === 0) return;

      players.forEach((p, idx) => {
        const curTile = this.getTile(p.boardPosition);
        if (!curTile) return;

        let px = curTile.x;
        let py = curTile.y;

        // Schrittweise Sprung-Interpolation während des Zugs!
        if (p.animating && p.animFrom !== undefined && p.animTo !== undefined) {
          const fromTile = this.getTile(p.animFrom);
          const toTile = this.getTile(p.animTo);
          if (fromTile && toTile) {
            const prog = Math.min(1, Math.max(0, p.animProgress || 0));
            // Hüpfparabel (Hop-Arc): bis zu 38px in die Höhe springen
            const hopHeight = Math.sin(prog * Math.PI) * 38;
            px = fromTile.x + (toTile.x - fromTile.x) * prog;
            py = fromTile.y + (toTile.y - fromTile.y) * prog - hopHeight;
          }
        } else {
          // Versatz wenn mehrere Spieler auf demselben Feld stehen
          const sameTilePlayers = players.filter(other => other.boardPosition === p.boardPosition && !other.animating);
          if (sameTilePlayers.length > 1) {
            const indexOnTile = sameTilePlayers.indexOf(p);
            const angle = (indexOnTile / sameTilePlayers.length) * Math.PI * 2;
            const radius = 24;
            px += Math.cos(angle) * radius;
            py += Math.sin(angle) * radius;
          }
        }

        const isMoving = p.animating || false;
        const isActive = idx === turnIndex;
        const isLeader = players.every(o => o.stars <= p.stars);
        const isGiant = (p.giantHeadTimer && p.giantHeadTimer > 0);

        // Aktiver Spieler Puls-Aura
        if (isActive && !isMoving) {
          ctx.save();
          ctx.beginPath();
          const pPulse = Math.sin(time * 5) * 5;
          ctx.arc(px, py, 32 + pPulse, 0, Math.PI * 2);
          ctx.strokeStyle = '#FACC15';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#EAB308';
          ctx.shadowBlur = 14;
          ctx.stroke();
          ctx.restore();
        }

        // Sternen-Schutzschild Rendering (rotierende Energie-Aura)
        if (p.hasShield) {
          ctx.save();
          ctx.translate(px, py - 6);
          ctx.rotate(time * 3);
          ctx.beginPath();
          ctx.arc(0, 0, 32, 0, Math.PI * 2);
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#0284C7';
          ctx.shadowBlur = 15;
          ctx.stroke();

          ctx.fillStyle = '#FDE047';
          for (let s = 0; s < 3; s++) {
            const starAngle = (s / 3) * Math.PI * 2;
            const sx = Math.cos(starAngle) * 32;
            const sy = Math.sin(starAngle) * 32;
            ctx.beginPath();
            ctx.arc(sx, sy, 4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        if (window.CharacterRenderer) {
          window.CharacterRenderer.drawCharacter(ctx, px, py - (isGiant ? 20 : 6), p.archetype || idx, {
            scale: isGiant ? 2.4 : 1.25,
            isMoving,
            punching: p.punching || false,
            state: p.emote || (isMoving ? 'walk' : 'idle'),
            isLeader,
            isActive,
            animTime: time
          });
        }
      });
    }

    // =========================================================================
    // 7. PARTIKEL-SYSTEM
    // =========================================================================
    spawnParticles(x, y, color, count = 12, speed = 80, life = 0.5) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = (Math.random() * 0.7 + 0.3) * speed;
        this.particles.push({
          x, y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          color,
          size: Math.random() * 4 + 2,
          life,
          maxLife: life
        });
      }
    }

    drawParticles(ctx) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx * 0.016;
        p.y += p.vy * 0.016;
        p.life -= 0.016;
        if (p.life <= 0) {
          this.particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    }

    // =========================================================================
    // 8. KLASSISCHE FALLBACK-ROUTINEN (FÜR 5-INSELN BOARD)
    // =========================================================================
    drawDeepOcean(ctx, time) {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 120;
      for (let x = 0; x < this.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.height);
        ctx.stroke();
      }
      for (let y = 0; y < this.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.width, y);
        ctx.stroke();
      }
    }

    drawThemedIslands(ctx, time) {
      const islands = [
        { name: 'Inselparadies', cx: 620, cy: 520, rx: 520, ry: 400, color: '#0EA5E9', border: '#38BDF8' },
        { name: 'Dschungel-Tempel', cx: 1850, cy: 480, rx: 500, ry: 380, color: '#059669', border: '#34D399' },
        { name: 'Geisterstadt', cx: 2600, cy: 1150, rx: 480, ry: 480, color: '#6D28D9', border: '#A78BFA' },
        { name: 'Die Schule', cx: 1750, cy: 1680, rx: 540, ry: 420, color: '#D97706', border: '#FBBF24' },
        { name: 'Pyramidenwüste', cx: 650, cy: 1600, rx: 550, ry: 420, color: '#DC2626', border: '#F87171' }
      ];
      islands.forEach(isl => {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(isl.cx, isl.cy, isl.rx, isl.ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = isl.color + '22';
        ctx.fill();
        ctx.strokeStyle = isl.border + '66';
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.restore();
      });
    }

    drawBridges(ctx, time) {
      const bridges = [
        { p1: { x: 940, y: 430 }, p2: { x: 1250, y: 380 } },
        { p1: { x: 2160, y: 590 }, p2: { x: 2420, y: 800 } },
        { p1: { x: 2510, y: 1090 }, p2: { x: 2260, y: 1680 } },
        { p1: { x: 1520, y: 1490 }, p2: { x: 1320, y: 1650 } },
        { p1: { x: 800, y: 1470 }, p2: { x: 280, y: 680 } }
      ];
      bridges.forEach(b => {
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(b.p1.x, b.p1.y);
        ctx.lineTo(b.p2.x, b.p2.y);
        ctx.stroke();
      });
    }

    drawPathWithArrows(ctx, time) {
      ctx.save();
      this.tiles.forEach(t => {
        if (!t.next) return;
        t.next.forEach(nId => {
          const nextTile = this.getTile(nId);
          if (!nextTile) return;
          ctx.beginPath();
          ctx.moveTo(t.x, t.y);
          ctx.lineTo(nextTile.x, nextTile.y);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.lineWidth = 4;
          ctx.stroke();
        });
      });
      ctx.restore();
    }

    drawClassicTiles(ctx, starTileIndex, time) {
      const tileSize = 68;
      this.tiles.forEach((t, idx) => {
        const isStar = idx === starTileIndex;
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.beginPath();
        ctx.roundRect(-tileSize / 2, -tileSize / 2, tileSize, tileSize, 16);
        ctx.fillStyle = isStar ? '#FBBF24' : (t.type === 'blue' ? '#3B82F6' : (t.type === 'red' ? '#EF4444' : '#10B981'));
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.label || `${idx + 1}`, 0, 0);
        ctx.restore();
      });
    }
  }

  window.GameBoard = GameBoard;
})();
