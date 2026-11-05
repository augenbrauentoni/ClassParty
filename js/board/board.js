// board.js - Großes 5-Themen-Inseln Spielbrett für "Class Party"
// 3200 x 2200 Pixel virtuelle Weltkarte mit Smart-Kamera, Zoom & Schwenk
// 5 klar getrennte Themen-Inseln über Brücken verbunden (66 Felder, 65x65px groß)

(function() {
  class GameBoard {
    constructor() {
      // Große virtuelle Weltkarte
      this.width = 3200;
      this.height = 2200;
      this.starTileIndex = 18;
      this.jackpotCoins = 10;
      this.particles = [];

      // Smart-Kamera System
      this.camera = {
        x: 600,
        y: 600,
        zoom: 0.95,
        targetX: 600,
        targetY: 600,
        targetZoom: 0.95,
        isOverview: false,
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        lastCamX: 0,
        lastCamY: 0
      };

      this.initTiles();
      this.setupCameraListenersDone = false;
    }

    // =========================================================================
    // 1. WEGE- & FELDER-ARCHITEKTUR (66 Felder, min. 65x65 Pixel, 5 Inseln)
    // =========================================================================
    initTiles() {
      // Insel-Zentren (im Uhrzeigersinn angeordnet):
      // 1. Inselparadies: Oben-Links (~600, 520)
      // 2. Dschungel-Tempel: Oben-Mitte/Rechts (~1800, 480)
      // 3. Geisterstadt: Rechts/Mitte-Rechts (~2600, 1150)
      // 4. Schule: Unten-Mitte (~1750, 1680)
      // 5. Pyramidenwüste: Unten-Links (~650, 1600)

      const rawTiles = [
        // =====================================================================
        // 1. INSELPARADIES (Felder 0 bis 12) - Oben-Links
        // =====================================================================
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

        // GROSSE BRÜCKE 1: Insel -> Dschungel
        // =====================================================================
        // 2. DSCHUNGEL-TEMPEL (Felder 13 bis 25) - Oben-Mitte
        // =====================================================================
        { id: 13, x: 1250, y: 380, type: 'blue', label: 'BRÜCKE' },
        { id: 14, x: 1450, y: 380, type: 'blue' },
        { id: 15, x: 1600, y: 400, type: 'event', label: 'DSCHUNGEL' },
        { id: 16, x: 1730, y: 360, type: 'shop',  label: 'SHOP' },
        { id: 17, x: 1870, y: 330, type: 'blue' },
        { id: 18, x: 2010, y: 340, type: 'swap',  label: 'TAUSCH' }, // Initialer Stern
        { id: 19, x: 2130, y: 390, type: 'red' },
        { id: 20, x: 2210, y: 480, type: 'roulette', label: 'GLÜCK' },
        { id: 21, x: 2160, y: 590, type: 'duel',  label: 'DUELL' },
        { id: 22, x: 2040, y: 640, type: 'bank',  label: 'BANK' },
        { id: 23, x: 1910, y: 650, type: 'fork',  label: 'GABELUNG 2' },
        { id: 24, x: 1770, y: 620, type: 'boost', label: 'BOOST' },
        { id: 25, x: 1640, y: 540, type: 'blue' },

        // GROSSE BRÜCKE 2: Dschungel -> Geisterstadt
        // =====================================================================
        // 3. GEISTERSTADT (Felder 26 bis 38) - Rechts
        // =====================================================================
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

        // GROSSE BRÜCKE 3: Geisterstadt -> Schule
        // =====================================================================
        // 4. DIE SCHULE (Felder 39 bis 51) - Unten-Mitte
        // =====================================================================
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

        // GROSSE BRÜCKE 4: Schule -> Pyramidenwüste
        // =====================================================================
        // 5. PYRAMIDENWÜSTE (Felder 52 bis 65) - Unten-Links
        // =====================================================================
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
        { id: 65, x: 800,  y: 1470, type: 'blue',  label: 'DAMM' } // Führt zurück zu 0!
      ];

      // Verbindungsgraph
      this.tiles = rawTiles.map(t => {
        let next = [];
        if (t.id === 65) {
          next = [0]; // Schleifenschluss zur Startinsel!
        } else if (t.id === 10) {
          next = [11, 13]; // Gabelung 1: Insel-Rundweg vs. Brücke zu Dschungel
        } else if (t.id === 23) {
          next = [24, 26]; // Gabelung 2: Tempel-Innenhof vs. Viadukt zu Geisterstadt
        } else if (t.id === 37) {
          next = [38, 39]; // Gabelung 3: Saloon vs. Bohlenweg zu Schule
        } else if (t.id === 48) {
          next = [49, 52]; // Gabelung 4: Schulhof vs. Oasenbrücke zu Pyramiden
        } else {
          next = [t.id + 1];
        }

        return {
          ...t,
          next
        };
      });
    }

    getTile(id) {
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
      const validTiles = this.tiles
        .map((t, idx) => idx)
        .filter(idx => {
          const t = this.tiles[idx];
          return idx !== excludeIndex && t.type !== 'start' && t.type !== 'fork' && t.type !== 'bowser';
        });
      return validTiles[Math.floor(Math.random() * validTiles.length)];
    }

    getBiome(tileIndex) {
      if (tileIndex <= 12) return 'island';
      if (tileIndex <= 25) return 'jungle';
      if (tileIndex <= 38) return 'ghost_town';
      if (tileIndex <= 51) return 'school';
      return 'desert';
    }

    getBiomeEvent(tileIndex) {
      const biome = this.getBiome(tileIndex);
      if (biome === 'island') {
        return {
          biome,
          title: '🐬 Delfin-Welle!',
          desc: 'Eine freundliche Delfin-Welle trägt dich 5 Felder vorwärts zum nächsten Strandabschnitt!',
          effect: 'dolphin_wave',
          advance: 5
        };
      } else if (biome === 'jungle') {
        const isLiana = Math.random() < 0.65;
        if (isLiana) {
          return {
            biome,
            title: '🌿 Lianen-Schwung!',
            desc: 'Du ergreifst eine dicke Liane und schwingst 4 Felder weit über die Baumkronen!',
            effect: 'liana_swing',
            advance: 4
          };
        } else {
          return {
            biome,
            title: '🌺 Fleischfressende Pflanze!',
            desc: 'Schnapp! Eine Riesenblüte schnappt nach dir und kostet dich 5 Münzen!',
            effect: 'plant_bite',
            damage: 5
          };
        }
      } else if (biome === 'ghost_town') {
        return {
          biome,
          title: '👻 Geister-Spuk!',
          desc: 'Ein schwebendes Gespenst spukt durch die Geisterstadt und stiehlt 4 Münzen von einem Mitspieler!',
          effect: 'ghost_spook'
        };
      } else if (biome === 'school') {
        return {
          biome,
          title: '📝 Überraschungs-Test!',
          desc: 'Der Lehrer ruft: „Kurztest!“. Beantworte die Fachfrage richtig für +12🪙 (Note 1) oder kassiere -5🪙!',
          effect: 'surprise_quiz'
        };
      } else {
        const isTreasure = Math.random() < 0.6;
        if (isTreasure) {
          return {
            biome,
            title: '👑 Pharaonen-Schatz!',
            desc: 'Du entdeckst eine geheime Grabkammer voller Gold! Du erhältst +15 Münzen!',
            effect: 'pharaoh_treasure',
            coins: 15
          };
        } else {
          return {
            biome,
            title: '🌪️ Treibsand-Wirbel!',
            desc: 'Ein tückischer Treibsand-Trichter zieht dich 4 Felder zurück!',
            effect: 'quicksand',
            retreat: 4
          };
        }
      }
    }

    // =========================================================================
    // 2. SMART-KAMERA (Smooth Zoom, Follow Player, Drag & Pan, Overview Mode M)
    // =========================================================================
    setupCameraListeners(canvas) {
      if (this.setupCameraListenersDone || !canvas) return;
      this.setupCameraListenersDone = true;

      // 1. Mouse Drag & Pan
      canvas.addEventListener('mousedown', (e) => {
        this.camera.isDragging = true;
        this.camera.dragStartX = e.clientX;
        this.camera.dragStartY = e.clientY;
        this.camera.lastCamX = this.camera.targetX;
        this.camera.lastCamY = this.camera.targetY;
        canvas.style.cursor = 'grabbing';
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.camera.isDragging) return;
        const dx = (e.clientX - this.camera.dragStartX) / this.camera.zoom;
        const dy = (e.clientY - this.camera.dragStartY) / this.camera.zoom;
        this.camera.targetX = Math.max(400, Math.min(this.width - 400, this.camera.lastCamX - dx));
        this.camera.targetY = Math.max(300, Math.min(this.height - 300, this.camera.lastCamY - dy));
      });

      window.addEventListener('mouseup', () => {
        if (this.camera.isDragging) {
          this.camera.isDragging = false;
          if (canvas) canvas.style.cursor = 'grab';
        }
      });

      // 2. Mouse Wheel Zoom (0.42 bis 2.0)
      canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.12 : 0.89;
        const newZoom = Math.max(0.42, Math.min(2.1, this.camera.targetZoom * factor));
        this.camera.targetZoom = newZoom;
        this.camera.isOverview = false;
      }, { passive: false });

      // 3. Tastatur: M = Gesamtübersicht toggle
      window.addEventListener('keydown', (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
        if (e.code === 'KeyM') {
          this.toggleOverviewMode(canvas);
        }
      });

      canvas.style.cursor = 'grab';
    }

    toggleOverviewMode(canvas) {
      this.camera.isOverview = !this.camera.isOverview;
      if (this.camera.isOverview) {
        // Übersicht über alle 5 Inseln
        this.camera.targetX = this.width / 2;
        this.camera.targetY = this.height / 2;
        this.camera.targetZoom = 0.44;
      } else {
        // Zurück zum Fokus
        this.camera.targetZoom = 1.05;
      }
    }

    centerOnPlayer(player) {
      if (!player) return;
      const tile = this.getTile(player.boardPosition);
      if (tile) {
        this.camera.targetX = tile.x;
        this.camera.targetY = tile.y - 40;
        if (this.camera.isOverview) {
          this.camera.targetZoom = 1.05;
          this.camera.isOverview = false;
        }
      }
    }

    updateCamera(activePlayer, dt = 0.016) {
      // Wenn nicht vom User per Maus gezogen und nicht in Gesamtübersicht, folge dem aktiven Spieler
      if (!this.camera.isDragging && !this.camera.isOverview && activePlayer) {
        const tile = this.getTile(activePlayer.boardPosition);
        if (tile) {
          this.camera.targetX = tile.x;
          this.camera.targetY = tile.y - 40;
        }
      }

      // Butterweiche Kamera-Interpolation (Lerp)
      const lerpSpeed = 0.085;
      this.camera.x += (this.camera.targetX - this.camera.x) * lerpSpeed;
      this.camera.y += (this.camera.targetY - this.camera.y) * lerpSpeed;
      this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * lerpSpeed;
    }

    // =========================================================================
    // 3. RENDERING: DIE 5 THEMEN-INSELN, BRÜCKEN, GROSSE FELDER & FIGUREN
    // =========================================================================
    render(ctx, players, turnIndex, starTileIndex, time = 0) {
      const canvas = ctx.canvas;
      this.setupCameraListeners(canvas);

      // Aktualisiere Kamera
      const activePlayer = players && players[turnIndex];
      this.updateCamera(activePlayer);

      ctx.save();
      // Hintergrund / Ozean
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Kamera-Transformation
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(this.camera.zoom, this.camera.zoom);
      ctx.translate(-this.camera.x, -this.camera.y);

      // 1. Großes Wasser-/Hintergrund-Gitter
      this.drawDeepOcean(ctx, time);

      // 2. Die 5 großen Themen-Inseln zeichnen
      this.drawThemedIslands(ctx, time);

      // 3. Große Verbindungsbrücken zwischen den Inseln
      this.drawBridges(ctx, time);

      // 4. Pfad-Linien mit leuchtenden Richtungspfeilen
      this.drawPathWithArrows(ctx, time);

      // 5. Große 65x65px Spielfelder
      this.drawTiles(ctx, starTileIndex, time);

      // 6. Schwebender Sternblock
      this.drawFloatingStar(ctx, starTileIndex, time);

      // 7. Partikel-Effekte
      this.drawParticles(ctx);

      // 8. Große Spielfiguren (70x90px)
      this.drawPlayers(ctx, players, turnIndex, time);

      ctx.restore();

      // 9. Screen-Space Overlays (Kamera-Controls & Minimap)
      this.drawScreenHUD(ctx, canvas, players, turnIndex);
    }

    // Ozean mit leichten Wellenmustern
    drawDeepOcean(ctx, time) {
      ctx.save();
      const grad = ctx.createRadialGradient(1600, 1100, 200, 1600, 1100, 2200);
      grad.addColorStop(0, '#0F2744');
      grad.addColorStop(0.6, '#0B1A2F');
      grad.addColorStop(1, '#050D18');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Dezente animierte Lichtkaustik auf dem Wasser
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 2.5;
      for (let y = 100; y < this.height; y += 140) {
        ctx.beginPath();
        for (let x = 0; x < this.width; x += 120) {
          const cy = y + Math.sin(x * 0.01 + time * 1.5 + y) * 14;
          if (x === 0) ctx.moveTo(x, cy);
          else ctx.lineTo(x, cy);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    // Die 5 klar getrennten Themen-Inseln
    drawThemedIslands(ctx, time) {
      // 1. Inselparadies (Oben-Links, X: 160 bis 1100, Y: 140 bis 840)
      this.drawIslandPlateau(ctx, 160, 150, 940, 700, '#0284C7', '#38BDF8', '#FDE047', '🏝️ INSELPARADIES', () => {
        // Stranddetails, Palmen & Leuchtturm
        this.drawLighthouse(ctx, 300, 220, time);
        this.drawPalmTree(ctx, 750, 480, 1.4);
        this.drawPalmTree(ctx, 920, 240, 1.2);
        this.drawPalmTree(ctx, 420, 680, 1.3);
      });

      // 2. Dschungel-Tempel (Oben-Mitte/Rechts, X: 1350 bis 2350, Y: 180 bis 820)
      this.drawIslandPlateau(ctx, 1350, 180, 1000, 640, '#064E3B', '#059669', '#10B981', '🌴 DSCHUNGEL-TEMPEL', () => {
        // Wasserfall & Tempelruinen
        this.drawWaterfall(ctx, 1750, 220, time);
        this.drawStoneRuins(ctx, 2150, 260);
        this.drawJungleTrees(ctx, 1420, 250);
        this.drawJungleTrees(ctx, 2280, 620);
      });

      // 3. Geisterstadt (Rechts, X: 2220 bis 2980, Y: 860 bis 1640)
      this.drawIslandPlateau(ctx, 2220, 860, 760, 780, '#2E1065', '#581C87', '#9333EA', '👻 GEISTERSTADT', () => {
        // Saloon, Grabsteine & Nebel
        this.drawSaloon(ctx, 2600, 950);
        this.drawGravestones(ctx, 2800, 1380);
        this.drawLanterns(ctx, 2350, 1050, time);
        this.drawGhostMist(ctx, 2550, 1250, time);
      });

      // 4. Die Schule (Unten-Mitte, X: 1400 bis 2300, Y: 1220 bis 1860)
      this.drawIslandPlateau(ctx, 1400, 1220, 900, 660, '#1E293B', '#334155', '#38BDF8', '🏫 DIE SCHULE (IT-CAMPUS)', () => {
        // Schulgebäude, Schultafel & Server-Rack
        this.drawClassroom(ctx, 1750, 1480, time);
        this.drawSchoolyard(ctx, 2100, 1380);
      });

      // 5. Pyramidenwüste (Unten-Links, X: 220 bis 1200, Y: 1180 bis 1900)
      this.drawIslandPlateau(ctx, 220, 1180, 980, 720, '#78350F', '#B45309', '#FBBF24', '🏜️ PYRAMIDENWÜSTE', () => {
        // Stufenpyramiden, Sphinx & Oase
        this.drawPyramids(ctx, 500, 1450);
        this.drawSphinx(ctx, 860, 1320);
        this.drawOasis(ctx, 680, 1600, time);
      });
    }

    drawIslandPlateau(ctx, x, y, w, h, darkColor, midColor, lightColor, title, drawDecor) {
      ctx.save();
      // Äußerer Riff-/Küstenschatten
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.roundRect(x - 20, y - 10, w + 40, h + 50, 48);
      ctx.fill();

      // Sand-/Klippensockel
      ctx.fillStyle = darkColor;
      ctx.beginPath();
      ctx.roundRect(x - 12, y - 6, w + 24, h + 36, 42);
      ctx.fill();

      // Haupt-Plateau
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      grad.addColorStop(0, lightColor);
      grad.addColorStop(0.15, midColor);
      grad.addColorStop(1, darkColor);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 38);
      ctx.fill();

      // Glänzender 3D-Kantenrand
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Insel-Banner
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.beginPath();
      ctx.roundRect(x + 28, y + 16, 320, 42, 12);
      ctx.fill();
      ctx.strokeStyle = lightColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 16px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(title, x + 44, y + 38);

      // Zusätzliche Dekoration
      if (drawDecor) drawDecor();

      ctx.restore();
    }

    // Große Brücken zwischen den Inseln
    drawBridges(ctx, time) {
      ctx.save();
      const bridges = [
        // 1. Insel -> Dschungel (Feld 10/12 -> 13/14)
        { x1: 960, y1: 410, x2: 1350, y2: 380, label: 'KÜSTEN-HÄNGEBRÜCKE', color: '#B45309' },
        // 2. Dschungel -> Geisterstadt (Feld 23 -> 26)
        { x1: 2210, y1: 670, x2: 2420, y2: 800, label: 'SCHLUCHT-VIADUKT', color: '#475569' },
        // 3. Geisterstadt -> Schule (Feld 37 -> 39)
        { x1: 2360, y1: 1480, x2: 2260, y2: 1680, label: 'BOHLENWEG', color: '#334155' },
        // 4. Schule -> Pyramidenwüste (Feld 48/51 -> 52/53)
        { x1: 1520, y1: 1650, x2: 1320, y2: 1650, label: 'SANDSTEIN-DAMM', color: '#D97706' },
        // 5. Pyramidenwüste -> Insel (Feld 65 -> 0)
        { x1: 520, y1: 1180, x2: 320, y2: 780, label: 'GROSSER INSEL-DAMM', color: '#0284C7' }
      ];

      bridges.forEach(b => {
        // Brücken-Balken
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 36;
        ctx.beginPath();
        ctx.moveTo(b.x1, b.y1 + 8);
        ctx.lineTo(b.x2, b.y2 + 8);
        ctx.stroke();

        ctx.strokeStyle = b.color;
        ctx.lineWidth = 32;
        ctx.beginPath();
        ctx.moveTo(b.x1, b.y1);
        ctx.lineTo(b.x2, b.y2);
        ctx.stroke();

        // Holzplanken-Muster
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 12]);
        ctx.beginPath();
        ctx.moveTo(b.x1, b.y1);
        ctx.lineTo(b.x2, b.y2);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      ctx.restore();
    }

    // Leuchtende Richtungspfeile auf dem Pfad
    drawPathWithArrows(ctx, time) {
      ctx.save();

      // 1. Dicker Basispfad
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 26;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      this.tiles.forEach(t => {
        if (t.next) {
          t.next.forEach(nId => {
            const nextT = this.getTile(nId);
            if (nextT) {
              ctx.moveTo(t.x, t.y);
              ctx.lineTo(nextT.x, nextT.y);
            }
          });
        }
      });
      ctx.stroke();

      // 2. Goldene Pfad-Kanten
      ctx.strokeStyle = '#FCD34D';
      ctx.lineWidth = 6;
      ctx.stroke();

      // 3. Animierte, leuchtende Richtungspfeile zwischen den Feldern
      this.tiles.forEach(t => {
        if (t.next) {
          t.next.forEach(nId => {
            const nextT = this.getTile(nId);
            if (!nextT) return;

            const dx = nextT.x - t.x;
            const dy = nextT.y - t.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 40) return;

            const angle = Math.atan2(dy, dx);
            // Animierter Pfeil wandert auf der Strecke
            const tOffset = ((time * 0.8) % 1.0);
            const arrowX = t.x + dx * tOffset;
            const arrowY = t.y + dy * tOffset;

            ctx.save();
            ctx.translate(arrowX, arrowY);
            ctx.rotate(angle);
            ctx.fillStyle = '#FDE047';
            ctx.shadowColor = '#FACC15';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(-8, -8);
            ctx.lineTo(-4, 0);
            ctx.lineTo(-8, 8);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          });
        }
      });

      ctx.restore();
    }

    // =========================================================================
    // 4. DIE 65x65 PIXEL GROSSEN FELDER (Mit 3D-Look & Nummerierung 1..66)
    // =========================================================================
    drawTiles(ctx, starTileIndex, time) {
      const tileSize = 68; // Große Kacheln!

      this.tiles.forEach((t, idx) => {
        const isStar = idx === starTileIndex;
        ctx.save();
        ctx.translate(t.x, t.y);

        // Bodenschatten der Kachel
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.roundRect(-tileSize / 2 + 4, -tileSize / 2 + 8, tileSize, tileSize, 18);
        ctx.fill();

        // Kachelfarben & Icons je nach Feld-Typ
        let gradTop = '#3B82F6';
        let gradBottom = '#1D4ED8';
        let borderColor = '#93C5FD';
        let icon = '🪙';
        let subText = '+3';

        if (t.type === 'start') {
          gradTop = '#8B5CF6';
          gradBottom = '#5B21B6';
          borderColor = '#C4B5FD';
          icon = '🏁';
          subText = 'START';
        } else if (t.type === 'blue') {
          gradTop = '#38BDF8';
          gradBottom = '#0284C7';
          borderColor = '#BAE6FD';
          icon = '🪙';
          subText = '+3';
        } else if (t.type === 'red') {
          gradTop = '#F87171';
          gradBottom = '#DC2626';
          borderColor = '#FECACA';
          icon = '💥';
          subText = '-3';
        } else if (t.type === 'bank') {
          gradTop = '#FBBF24';
          gradBottom = '#D97706';
          borderColor = '#FDE68A';
          icon = '🏦';
          subText = `${this.jackpotCoins}🪙`;
        } else if (t.type === 'boost') {
          gradTop = '#FB923C';
          gradBottom = '#EA580C';
          borderColor = '#FFEDD5';
          icon = '🚀';
          subText = 'BOOST';
        } else if (t.type === 'swap') {
          gradTop = '#C084FC';
          gradBottom = '#9333EA';
          borderColor = '#F3E8FF';
          icon = '🔄';
          subText = 'TAUSCH';
        } else if (t.type === 'roulette') {
          gradTop = '#F59E0B';
          gradBottom = '#B45309';
          borderColor = '#FEF3C7';
          icon = '🎰';
          subText = 'GLÜCK';
        } else if (t.type === 'boo') {
          gradTop = '#6B7280';
          gradBottom = '#374151';
          borderColor = '#E5E7EB';
          icon = '👻';
          subText = 'BOO';
        } else if (t.type === 'bowser') {
          gradTop = '#B91C1C';
          gradBottom = '#7F1D1D';
          borderColor = '#FCA5A5';
          icon = '👹';
          subText = 'CHAOS';
        } else if (t.type === 'duel') {
          gradTop = '#EF4444';
          gradBottom = '#991B1B';
          borderColor = '#FECDD3';
          icon = '⚔️';
          subText = 'DUELL';
        } else if (t.type === 'shop') {
          gradTop = '#34D399';
          gradBottom = '#059669';
          borderColor = '#D1FAE5';
          icon = '🛒';
          subText = 'SHOP';
        } else if (t.type === 'event') {
          gradTop = '#10B981';
          gradBottom = '#047857';
          borderColor = '#A7F3D0';
          icon = '❓';
          subText = 'EVENT';
        } else if (t.type === 'fork') {
          gradTop = '#F59E0B';
          gradBottom = '#B45309';
          borderColor = '#FDE68A';
          icon = '🔀';
          subText = 'GABEL';
        }

        // Kachel-Körper
        const grad = ctx.createLinearGradient(0, -tileSize / 2, 0, tileSize / 2);
        grad.addColorStop(0, gradTop);
        grad.addColorStop(1, gradBottom);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(-tileSize / 2, -tileSize / 2, tileSize, tileSize, 18);
        ctx.fill();

        // 3D Kantenrahmen
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Glanz-Effekt
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.beginPath();
        ctx.roundRect(-tileSize / 2 + 4, -tileSize / 2 + 4, tileSize - 8, tileSize * 0.4, 12);
        ctx.fill();

        // Kachel Icon & Subtext
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, 0, -6);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 11px sans-serif';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(subText, 0, 19);

        // Dezente Feld-Nummerierung (1 bis 66)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(-tileSize / 2 - 4, -tileSize / 2 - 4, 22, 16, 6);
        ctx.fill();
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px sans-serif';
        ctx.shadowBlur = 0;
        ctx.fillText(`${idx + 1}`, -tileSize / 2 + 7, -tileSize / 2 + 4);

        ctx.restore();
      });
    }

    // Schwebender Sternblock
    drawFloatingStar(ctx, starTileIndex, time) {
      const tile = this.getTile(starTileIndex);
      if (!tile) return;

      const starBob = Math.sin(time * 3.5) * 12;
      const sx = tile.x;
      const sy = tile.y - 75 + starBob;

      ctx.save();
      // Sternen-Glow
      const glow = ctx.createRadialGradient(sx, sy, 5, sx, sy, 60);
      glow.addColorStop(0, 'rgba(253, 224, 71, 0.9)');
      glow.addColorStop(0.5, 'rgba(234, 179, 8, 0.4)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(sx, sy, 60, 0, Math.PI * 2);
      ctx.fill();

      // Riesiger Goldener Stern
      ctx.font = '54px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#FACC15';
      ctx.shadowBlur = 18;
      ctx.fillText('⭐', sx, sy);

      // Preisschild: 20🪙
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.roundRect(sx - 36, sy + 32, 72, 22, 8);
      ctx.fill();
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#FDE047';
      ctx.font = 'bold 12px sans-serif';
      ctx.shadowBlur = 0;
      ctx.fillText('20 🪙', sx, sy + 43);

      ctx.restore();
    }

    // Große Spielfiguren (70x90 Pixel)
    drawPlayers(ctx, players, turnIndex, time) {
      if (!players || players.length === 0) return;

      players.forEach((p, idx) => {
        const tile = this.getTile(p.boardPosition);
        if (!tile) return;

        // Versatz wenn mehrere Spieler auf demselben Feld stehen
        const sameTilePlayers = players.filter(other => other.boardPosition === p.boardPosition);
        let px = tile.x;
        let py = tile.y;

        if (sameTilePlayers.length > 1) {
          const indexOnTile = sameTilePlayers.indexOf(p);
          const angle = (indexOnTile / sameTilePlayers.length) * Math.PI * 2;
          const radius = 32;
          px = tile.x + Math.cos(angle) * radius;
          py = tile.y + Math.sin(angle) * radius;
        }

        const isMoving = p.animating || false;
        const isActive = idx === turnIndex;
        const isLeader = players.every(o => o.stars <= p.stars);
        const isGiant = (p.giantHeadTimer && p.giantHeadTimer > 0);

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

          // Schild-Partikel-Sterne
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
            scale: isGiant ? 2.4 : 1.25, // Riesenkopf-Zauber!
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

    // Partikel-System
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
    // 5. SCREEN-SPACE HUD (Kamera-Controls Pill & Minimap)
    // =========================================================================
    drawScreenHUD(ctx, canvas, players, turnIndex) {
      ctx.save();

      // 1. Kamera-Controls Pill (Unten-Rechts)
      const pillW = 260;
      const pillH = 44;
      const pillX = canvas.width - pillW - 20;
      const pillY = canvas.height - pillH - 20;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const zoomText = `🔍 Zoom: ${Math.round(this.camera.zoom * 100)}% | [M] Karte`;
      ctx.fillText(zoomText, pillX + pillW / 2, pillY + pillH / 2);

      // 2. Minimap (Oben-Rechts)
      const mmW = 190;
      const mmH = 130;
      const mmX = canvas.width - mmW - 20;
      const mmY = 20;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(mmX, mmY, mmW, mmH, 12);
      ctx.fill();
      ctx.stroke();

      const scaleX = mmW / this.width;
      const scaleY = mmH / this.height;

      // Minimap Kacheln
      this.tiles.forEach(t => {
        ctx.fillStyle = t.id === this.starTileIndex ? '#FACC15' : '#64748B';
        ctx.beginPath();
        ctx.arc(mmX + t.x * scaleX, mmY + t.y * scaleY, t.id === this.starTileIndex ? 3.5 : 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Minimap Spieler
      if (players) {
        players.forEach((p, idx) => {
          const tile = this.getTile(p.boardPosition);
          ctx.fillStyle = p.color || '#EF4444';
          ctx.beginPath();
          ctx.arc(mmX + tile.x * scaleX, mmY + tile.y * scaleY, idx === turnIndex ? 4.5 : 3, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      ctx.restore();
    }

    // Deko-Helfer für die 5 Welten
    drawLighthouse(ctx, x, y, time) {
      ctx.save();
      // Lichtstrahl
      const beamAngle = time * 1.5;
      const grad = ctx.createRadialGradient(x, y - 50, 5, x, y - 50, 160);
      grad.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x, y - 50);
      ctx.arc(x, y - 50, 160, beamAngle - 0.35, beamAngle + 0.35);
      ctx.closePath();
      ctx.fill();

      // Turm
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(x - 14, y - 50, 28, 50);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x - 14, y - 38, 28, 12);
      ctx.fillRect(x - 14, y - 14, 28, 12);
      ctx.restore();
    }

    drawPalmTree(ctx, x, y, s = 1.0) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(s, s);
      ctx.fillStyle = '#78350F';
      ctx.fillRect(-5, -45, 10, 45);
      ctx.fillStyle = '#16A34A';
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * 22, -45 + Math.sin(a) * 12, 22, 9, a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    drawWaterfall(ctx, x, y, time) {
      ctx.save();
      ctx.fillStyle = '#065F46';
      ctx.fillRect(x - 30, y - 40, 60, 40);
      ctx.fillStyle = '#38BDF8';
      const flow = (time * 60) % 20;
      ctx.fillRect(x - 20, y - 40 + flow, 40, 45);
      ctx.restore();
    }

    drawStoneRuins(ctx, x, y) {
      ctx.save();
      ctx.fillStyle = '#334155';
      ctx.fillRect(x - 35, y - 50, 70, 50);
      ctx.fillStyle = '#64748B';
      ctx.fillRect(x - 25, y - 40, 50, 40);
      ctx.restore();
    }

    drawJungleTrees(ctx, x, y) {
      this.drawPalmTree(ctx, x, y, 1.2);
    }

    drawSaloon(ctx, x, y) {
      ctx.save();
      ctx.fillStyle = '#451A03';
      ctx.fillRect(x - 45, y - 60, 90, 60);
      ctx.fillStyle = '#D97706';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('SALOON', x, y - 40);
      ctx.restore();
    }

    drawGravestones(ctx, x, y) {
      ctx.save();
      ctx.fillStyle = '#64748B';
      ctx.beginPath();
      ctx.arc(x, y - 20, 14, Math.PI, 0);
      ctx.lineTo(x + 14, y);
      ctx.lineTo(x - 14, y);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    drawLanterns(ctx, x, y, time) {
      ctx.save();
      const flicker = Math.sin(time * 14) * 0.15 + 0.85;
      ctx.fillStyle = `rgba(251, 191, 36, ${flicker})`;
      ctx.beginPath();
      ctx.arc(x, y - 25, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawGhostMist(ctx, x, y, time) {
      ctx.save();
      ctx.fillStyle = 'rgba(168, 85, 247, 0.12)';
      const mistX = x + Math.sin(time * 1.2) * 40;
      ctx.beginPath();
      ctx.arc(mistX, y, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawClassroom(ctx, x, y, time) {
      ctx.save();
      // Tafel mit Netzwerk-Diagramm
      ctx.fillStyle = '#064E3B';
      ctx.fillRect(x - 60, y - 55, 120, 55);
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 3;
      ctx.strokeRect(x - 60, y - 55, 120, 55);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('192.168.1.0/24', x, y - 35);
      ctx.fillText('VLAN 10 | DMZ', x, y - 18);
      ctx.restore();
    }

    drawSchoolyard(ctx, x, y) {
      ctx.save();
      ctx.fillStyle = '#475569';
      ctx.fillRect(x - 30, y - 40, 60, 40);
      ctx.restore();
    }

    drawPyramids(ctx, x, y) {
      ctx.save();
      // Große Stufenpyramide
      ctx.fillStyle = '#D97706';
      ctx.beginPath();
      ctx.moveTo(x, y - 75);
      ctx.lineTo(x - 70, y);
      ctx.lineTo(x + 70, y);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(x, y - 75);
      ctx.lineTo(x, y);
      ctx.lineTo(x + 70, y);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    drawSphinx(ctx, x, y) {
      ctx.save();
      ctx.fillStyle = '#B45309';
      ctx.fillRect(x - 30, y - 35, 60, 35);
      ctx.beginPath();
      ctx.arc(x, y - 45, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawOasis(ctx, x, y, time) {
      ctx.save();
      ctx.fillStyle = '#0284C7';
      ctx.beginPath();
      ctx.ellipse(x, y, 40, 25, 0, 0, Math.PI * 2);
      ctx.fill();
      this.drawPalmTree(ctx, x + 25, y, 0.9);
      ctx.restore();
    }
  }

  window.GameBoard = GameBoard;
})();
