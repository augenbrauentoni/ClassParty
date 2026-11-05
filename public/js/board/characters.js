// characters.js - Die 9 Klassen-Charaktere für "Class Party"
// Profilbilder (Avatar) + Große 2D-Spielfiguren (70x90px Canvas-Sprites)
// Dynamische Erweiterung für eigene Uploads

(function() {
  // Definition der 9 individuellen Klassen-Charaktere
  const DEFAULT_CHARACTERS = [
    {
      id: 'pc_schrauber',
      name: 'Der PC-Schrauber',
      title: 'Hardware-Enthusiast',
      originalFile: 'Generiertes Bild 1 (2).png',
      avatar: 'assets/avatars/char1_pc_schrauber.png',
      color: '#0EA5E9',
      colorName: 'Cyber-Blau',
      colorDark: '#0369A1',
      description: 'Dunkle Haare, Brille, Gaming-Headset, petrolblauer Hoodie, Jogginghose & Badelatschen – trägt einen leuchtenden RGB-Gaming-PC!',
      quote: '„Hast du schon neu gestartet? Der Airflow ist perfekt!“',
      aura: 'rgb',
      defaultSlot: 0
    },
    {
      id: 'feuerwehrmann',
      name: 'Der Feuerwehrmann',
      title: 'Einsatzleiter & Lebensretter',
      originalFile: 'Generiertes Bild 1 (3).png',
      avatar: 'assets/avatars/char2_feuerwehr.png',
      color: '#EF4444',
      colorName: 'Feuer-Rot',
      colorDark: '#991B1B',
      description: 'Roter Feuerwehrhelm mit Reflektorstreifen, Brille, Dreitagebart, Gehörschutz & schwarz-gelbe Einsatzuniform.',
      quote: '„Wasser marsch! Brandherd auf Feld 12 gelöscht!“',
      aura: 'fire',
      defaultSlot: 1
    },
    {
      id: 'chill_cap',
      name: 'Der Chill-Cap-Guy',
      title: 'Tiefenentspannter Zocker',
      originalFile: 'Generiertes Bild 1 (5).png',
      avatar: 'assets/avatars/char3_chill_cap.png',
      color: '#10B981',
      colorName: 'Smaragd-Grün',
      colorDark: '#065F46',
      description: 'Schwarze Baseball-Cap, Schnurrbart & Stoppelbart, Ohrring, entspannter Blick und dunkelgrüner Hoodie.',
      quote: '„Immer mit der Ruhe, der nächste Wurf sitzt locker.“',
      aura: 'chill',
      defaultSlot: 2
    },
    {
      id: 'goldkette',
      name: 'Der Goldketten-Flexer',
      title: 'Gym & Crypto Boss',
      originalFile: 'Generiertes Bild 1 (6).png',
      avatar: 'assets/avatars/char4_goldkette.png',
      color: '#F59E0B',
      colorName: 'Gold-Gelb',
      colorDark: '#B45309',
      description: 'Headset, Vollbart, oberkörperfrei mit riesiger goldener Dollar-Kette ($), Gold-Uhr, Trainingshose & Bizeps-Pose!',
      quote: '„No pain, no coins! Heute wird nur geglänzt!“',
      aura: 'gold',
      defaultSlot: 3
    },
    {
      id: 'drachen_koenigin',
      name: 'Die Drachen-Königin',
      title: 'Herrscherin der 7 Reiche',
      originalFile: 'Generiertes Bild 1 (7).png',
      avatar: 'assets/avatars/char5_drachen_koenigin.png',
      color: '#EC4899',
      colorName: 'Drachen-Pink',
      colorDark: '#9D174D',
      description: 'Goldene Krone, geflochtene blonde Zöpfe, blaues Headset, Pelz-Gewand, kleiner roter Drache & rosa Einhorn-Hausschuhe!',
      quote: '„Dracarys! ...und wo ist mein verschütteter Bierkrug?!“',
      aura: 'magic',
      defaultSlot: 4
    },
    {
      id: 'schoko_coder',
      name: 'Der Schoko-Coder',
      title: 'Zucker- & Code-Junkie',
      originalFile: 'Generiertes Bild 1.png',
      avatar: 'assets/avatars/char6_schoko_coder.png',
      color: '#854D0E',
      colorName: 'Schoko-Braun',
      colorDark: '#451A03',
      description: 'Schokoflecken im Gesicht, schwarzer </>-Hoodie, Namensschild, Arme vollgepackt mit Snickers, Twix, KitKat, Bueno & Bounty!',
      quote: '„Ohne Zucker kein Syntax-Highlighter! *mampf*“',
      aura: 'sweet',
      defaultSlot: 5
    },
    {
      id: 'doritos_gamer',
      name: 'Der Doritos- & Energy-Gamer',
      title: 'LAN-Party Legende',
      originalFile: 'Generiertes Bild 2 (1).png',
      avatar: 'assets/avatars/char7_doritos_gamer.png',
      color: '#F97316',
      colorName: 'Tango-Orange',
      colorDark: '#C2410C',
      description: 'Blonde Locken, dünner Schnurrbart, rote Doritos-Tüte unterm Arm, Energy-Drink in der Hand & Adiletten mit weißen Socken.',
      quote: '„120 FPS, 3 Dosen Energy und die Nacht gehört mir!“',
      aura: 'neon',
      defaultSlot: 6
    },
    {
      id: 'langhaar_dude',
      name: 'Der entspannte Langhaar-Dude',
      title: 'Chill-Vibe Philosoph',
      originalFile: 'Generiertes Bild 2.png',
      avatar: 'assets/avatars/char8_langhaar_dude.png',
      color: '#6366F1',
      colorName: 'Indigo-Violett',
      colorDark: '#4338CA',
      description: 'Schulterlange dunkle Locken, Vollbart, grauer Cardigan über weißem T-Shirt mit Kette, weite Hose & Badelatschen.',
      quote: '„Alles fließt. Der Stern kommt schon zu uns, Bruder.“',
      aura: 'wave',
      defaultSlot: 7
    },
    {
      id: 'ultra_goku',
      name: 'Ultra Instinct Kämpfer',
      title: 'Göttlicher Saiyajin',
      originalFile: 'SonGokuUltra.jfif',
      avatar: 'assets/avatars/char9_ultra_goku.jpg',
      color: '#38BDF8',
      colorName: 'Ultra-Silber',
      colorDark: '#0284C7',
      description: 'Silber-weiße stachelige Anime-Haare, leuchtende blau-weiße Energie-Aura, muskulöser Körper & orange Kampfhose!',
      quote: '„Mein Körper weicht deinen Fallen ganz von alleine aus!“',
      aura: 'ultra_instinct',
      defaultSlot: 8
    }
  ];

  // Character Registry Manager
  class CharacterRegistry {
    constructor() {
      this.characters = JSON.parse(JSON.stringify(DEFAULT_CHARACTERS));
      this.loadedImages = new Map();
      this.loadAllImages();
    }

    getAll() {
      return this.characters;
    }

    getById(id) {
      return this.characters.find(c => c.id === id) || this.characters[0];
    }

    getBySlot(slotIndex) {
      const idx = slotIndex % this.characters.length;
      return this.characters[idx] || this.characters[0];
    }

    loadAllImages() {
      this.characters.forEach(char => {
        if (char.avatar && !this.loadedImages.has(char.id)) {
          const img = new Image();
          img.src = char.avatar;
          img.onload = () => {
            this.loadedImages.set(char.id, img);
          };
          img.onerror = () => {
            console.warn(`Could not load avatar image for ${char.id} at ${char.avatar}`);
          };
        }
      });
    }

    getImage(charId) {
      return this.loadedImages.get(charId) || null;
    }

    /**
     * Fügt dynamisch einen neuen Klassen-Charakter hinzu (z. B. per Drag & Drop / Upload)
     */
    addCustomCharacter(customData) {
      const newId = 'custom_' + Date.now();
      const newChar = {
        id: newId,
        name: customData.name || `Klassen-Mitglied ${this.characters.length + 1}`,
        title: customData.title || 'Neuer Herausforderer',
        avatar: customData.avatarDataUrl,
        color: customData.color || '#A855F7',
        colorName: customData.colorName || 'Custom-Lila',
        colorDark: customData.colorDark || '#6B21A8',
        description: customData.description || 'Individuell hochgeladenes Klassen-Mitglied.',
        quote: customData.quote || '„Ich bin auch am Start!“',
        aura: 'custom',
        defaultSlot: this.characters.length
      };

      this.characters.push(newChar);

      if (customData.avatarDataUrl) {
        const img = new Image();
        img.src = customData.avatarDataUrl;
        img.onload = () => {
          this.loadedImages.set(newId, img);
        };
      }

      // Speichere benutzerdefinierte Charaktere in localStorage
      this.persistCustomCharacters();
      return newChar;
    }

    persistCustomCharacters() {
      try {
        const customs = this.characters.filter(c => c.id.startsWith('custom_'));
        localStorage.setItem('classParty_custom_characters', JSON.stringify(customs));
      } catch (e) {
        console.warn('Could not persist custom characters to localStorage', e);
      }
    }

    loadPersistedCustoms() {
      try {
        const stored = localStorage.getItem('classParty_custom_characters');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            parsed.forEach(c => {
              if (!this.characters.find(x => x.id === c.id)) {
                this.characters.push(c);
                if (c.avatar) {
                  const img = new Image();
                  img.src = c.avatar;
                  img.onload = () => this.loadedImages.set(c.id, img);
                }
              }
            });
          }
        }
      } catch (e) {}
    }
  }

  window.characterRegistry = new CharacterRegistry();
  window.characterRegistry.loadPersistedCustoms();

  // =========================================================================
  // CharacterRenderer - Großes 2D Rendering (Mindestens 70x90 Pixel)
  // Unterstützt sowohl Bild-Darstellung mit Auren & Schatten als auch Prozedural
  // =========================================================================
  class CharacterRenderer {
    /**
     * Zeichnet die Figur auf dem Canvas
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} x - Fußpunkt X
     * @param {number} y - Fußpunkt Y
     * @param {number|string} characterOrSlot - SlotIndex oder Character-ID
     * @param {object} opts - { scale, lookX, lookY, isMoving, isJumping, punching, state, animTime, isLeader, isActive }
     */
    static drawCharacter(ctx, x, y, characterOrSlot = 0, opts = {}) {
      ctx.save();
      const registry = window.characterRegistry;
      const charObj = typeof characterOrSlot === 'string'
        ? registry.getById(characterOrSlot)
        : registry.getBySlot(characterOrSlot);

      const scale = opts.scale !== undefined ? opts.scale : 1.0;
      const time = opts.animTime !== undefined ? opts.animTime : (performance.now() / 1000);
      const state = opts.state || (opts.isMoving ? 'walk' : 'idle');
      const isLeader = opts.isLeader || false;
      const isActive = opts.isActive || false;

      // Bobbing, Schritt-Schwung & Sprung
      const breath = Math.sin(time * 4) * 2;
      const walkBob = (opts.isMoving || state === 'walk') ? Math.abs(Math.sin(time * 12)) * 6 : 0;
      const jumpOffset = (opts.isJumping || state === 'jump') ? -24 : 0;
      const cheerBob = (state === 'cheer') ? Math.abs(Math.sin(time * 8)) * 8 : 0;
      const sadDroop = (state === 'sad') ? 4 : 0;

      const totalY = y - walkBob + jumpOffset - cheerBob + sadDroop;

      // Große Maße: 72x94 Pixel Mindestgröße
      const charW = 74 * scale;
      const charH = 96 * scale;

      // 1. Weicher Bodenschatten
      ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
      ctx.beginPath();
      const shadowW = (opts.isJumping ? 22 : 34) * scale;
      const shadowH = (opts.isJumping ? 7 : 11) * scale;
      ctx.ellipse(x, y + 10 * scale, shadowW, shadowH, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Spezial-Auren & Partikel je nach Charakter
      CharacterRenderer.drawCharacterAura(ctx, x, totalY - charH * 0.45, charObj, time, scale);

      // 3. Highlight-Ring für aktiven Spieler
      if (isActive) {
        ctx.save();
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#FACC15';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.ellipse(x, y + 10 * scale, (shadowW + 8), (shadowH + 4), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 4. Zeichnen der Figur (Bild oder Prozedural)
      const img = registry.getImage(charObj.id);

      ctx.save();
      ctx.translate(x, totalY);

      // Neigung beim Laufen
      if (opts.isMoving || state === 'walk') {
        const lean = Math.sin(time * 12) * 0.08;
        ctx.rotate(lean);
      }

      // Schlag-Geste beim Würfeln
      if (opts.punching) {
        ctx.translate(0, -12);
      }

      if (img && img.complete && img.naturalWidth > 0) {
        CharacterRenderer.drawImageSprite(ctx, img, charW, charH, charObj, opts);
      } else {
        CharacterRenderer.drawProceduralFigure(ctx, charObj, charW, charH, breath, opts);
      }
      ctx.restore();

      // 5. Kronen-Symbol für Führenden
      if (isLeader) {
        ctx.save();
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👑', x, totalY - charH - 6);
        ctx.restore();
      }

      // 6. Jubel-Sternchen
      if (state === 'cheer') {
        CharacterRenderer.drawSparkle(ctx, x - 26, totalY - charH * 0.7 + Math.sin(time * 6) * 4, '#FDE047');
        CharacterRenderer.drawSparkle(ctx, x + 26, totalY - charH * 0.8 + Math.cos(time * 6) * 4, '#FDE047');
      }

      ctx.restore();
    }

    /**
     * Spezialeffekte / Auren für die 9 Charaktere
     */
    static drawCharacterAura(ctx, cx, cy, charObj, time, scale) {
      ctx.save();

      // Ultra Instinct: Blau-weiße göttliche Energie-Aura
      if (charObj.id === 'ultra_goku') {
        const radius = (48 + Math.sin(time * 8) * 6) * scale;
        const grad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
        grad.addColorStop(0.35, 'rgba(56, 189, 248, 0.45)');
        grad.addColorStop(0.7, 'rgba(30, 58, 138, 0.25)');
        grad.addColorStop(1, 'rgba(14, 165, 233, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Elektro-Funken
        for (let i = 0; i < 4; i++) {
          const angle = time * 3 + (i * Math.PI / 2);
          const dist = radius * 0.75;
          const sx = cx + Math.cos(angle) * dist;
          const sy = cy + Math.sin(angle) * dist;
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + Math.sin(time * 12 + i) * 6, sy + Math.cos(time * 12 + i) * 6);
          ctx.stroke();
        }
      }

      // Goldketten-Flexer: Glanz-Aura
      else if (charObj.id === 'goldkette') {
        const radius = (40 + Math.sin(time * 5) * 4) * scale;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
        grad.addColorStop(0.6, 'rgba(245, 158, 11, 0.15)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // PC-Schrauber: RGB Cyber-Glow
      else if (charObj.id === 'pc_schrauber') {
        const hue = (time * 120) % 360;
        const radius = 38 * scale;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, `hsla(${hue}, 100%, 65%, 0.3)`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Drachen-Königin: Rosa Zaubernebel & Feuerhauch
      else if (charObj.id === 'drachen_koenigin') {
        const radius = 42 * scale;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, 'rgba(236, 72, 153, 0.3)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    /**
     * Zeichnet das tatsächliche Profilbild/Ganzkörperbild als detailreichen Sprite
     */
    static drawImageSprite(ctx, img, charW, charH, charObj, opts) {
      // Abgerundete Standfigur mit dezentem 3D-Rahmen
      const w = charW;
      const h = charH;
      const x = -w / 2;
      const y = -h;

      ctx.save();
      // Clip-Bereich mit weichen Ecken für professionellen Spiele-Look
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 14);
      ctx.clip();

      // Zeichne das Charakterbild
      ctx.drawImage(img, x, y, w, h);

      // Dezenter Glanz-Overlay
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
      grad.addColorStop(0.5, 'transparent');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w, h);
      ctx.restore();

      // Bunte Umrandung in Spielerfarbe
      ctx.save();
      ctx.strokeStyle = charObj.color || '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 14);
      ctx.stroke();

      // Kleiner Charakter-Tag unten
      ctx.fillStyle = charObj.colorDark || '#1E293B';
      ctx.beginPath();
      ctx.roundRect(x + 4, y + h - 16, w - 8, 14, 5);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const shortName = charObj.name.replace('Der ', '').replace('Die ', '');
      ctx.fillText(shortName.substring(0, 12), 0, y + h - 9);

      ctx.restore();
    }

    /**
     * Prozeduraler Vektor-Fallback, falls Bild noch geladen wird
     */
    static drawProceduralFigure(ctx, charObj, charW, charH, breath, opts) {
      const w = charW;
      const h = charH;
      const x = -w / 2;
      const y = -h;

      ctx.save();
      ctx.fillStyle = charObj.colorDark || '#334155';
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 14);
      ctx.fill();

      ctx.fillStyle = charObj.color || '#64748B';
      ctx.beginPath();
      ctx.arc(0, y + 30, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(charObj.name, 0, y + h / 2);
      ctx.restore();
    }

    static drawSparkle(ctx, x, y, color) {
      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 6, y);
      ctx.lineTo(x + 6, y);
      ctx.moveTo(x, y - 6);
      ctx.lineTo(x, y + 6);
      ctx.stroke();
      ctx.restore();
    }
  }

  window.CharacterRenderer = CharacterRenderer;
})();
