// Minigame Registry & Metadata for "Class Party"
class MinigameRegistry {
  constructor() {
    this.games = new Map();
    this.registerDefaults();
  }

  register(id, meta) {
    this.games.set(id, meta);
  }

  get(id) {
    if (this.games.has(id)) return this.games.get(id);
    const num = parseInt(id, 10);
    if (!isNaN(num) && this.games.has(num)) return this.games.get(num);
    const aliasMap = {
      bombTag: 1,
      meteorDodge: 2,
      coinShower: 3,
      platformJumper: 4,
      memoryTiles: 5,
      buttonMasher: 6,
      tankBattle: 7,
      redLightGreenLight: 8,
      paintTheFloor: 9,
      quickReaction: 10,
      quizPlatform: 11,
      quizBuzzer: 12,
      antigravity: 13,
      antigravityRun: 13
    };
    if (aliasMap[id]) return this.games.get(aliasMap[id]);
    return null;
  }

  getAll() {
    return Array.from(this.games.values());
  }

  registerDefaults() {
    // 1. Bomb Tag
    this.register(1, {
      id: 1,
      name: 'Heiße Kartoffel',
      subtitle: 'Bomb Tag',
      icon: '💣',
      description: 'Laufe vor dem Spieler mit der Bombe weg! Wenn du die Bombe hast, berühre einen Mitspieler, um sie loszuwerden, bevor sie explodiert!',
      controls: {
        online: 'WASD oder Pfeiltasten = Laufen',
        local: 'P1: WASD | P2: Pfeiltasten | P3: IJKL | P4: Numpad 8456',
        goal: 'Überlebe als Letzter!'
      },
      create: (canvas, players, options) => new window.BombTagMinigame(canvas, players, options)
    });

    // 2. Meteor Dodge
    this.register(2, {
      id: 2,
      name: 'Meteor-Hagel',
      subtitle: 'Meteor Dodge',
      icon: '☄️',
      description: 'Weiche den herabstürzenden Meteoren aus! Achte auf die Warnkreise am Boden. Nutze deine Aktionstaste für einen schnellen Ausweich-Sprint!',
      controls: {
        online: 'A / D (oder Links / Rechts) = Bewegen | LEERTASTE = Dash',
        local: 'P1: A/D + Leertaste | P2: Links/Rechts + Enter | P3: J/L + U | P4: Numpad 4/6 + 0',
        goal: 'Nicht getroffen werden!'
      },
      create: (canvas, players, options) => new window.MeteorDodgeMinigame(canvas, players, options)
    });

    // 3. Coin Shower
    this.register(3, {
      id: 3,
      name: 'Münzregen',
      subtitle: 'Coin Shower',
      icon: '🪙',
      description: 'Sammle so viele Münzen (1-2 Pkt) und Goldsäcke (5 Pkt) wie möglich! Pass auf die Stachelfallen auf, die dir Punkte abziehen und dich betäuben!',
      controls: {
        online: 'WASD oder Pfeiltasten = Laufen',
        local: 'P1: WASD | P2: Pfeiltasten | P3: IJKL | P4: Numpad 8456',
        goal: 'Erziele die höchste Punktzahl in 30 Sekunden!'
      },
      create: (canvas, players, options) => new window.CoinShowerMinigame(canvas, players, options)
    });

    // 4. Platform Jumper (Lava-Turm)
    this.register(4, {
      id: 4,
      name: 'Lava-Turm',
      subtitle: 'Platform Jumper',
      icon: '🌋',
      description: 'Die Lava steigt unaufhaltsam von unten! Springe von Plattform zu Plattform immer höher und pass auf brüchige Plattformen auf.',
      controls: {
        online: 'A / D (oder Links / Rechts) = Laufen | LEERTASTE oder W = Springen',
        local: 'P1: A/D + Space/W | P2: Links/Rechts + Enter/PfeilHoch | P3: J/L + U/I | P4: Numpad 4/6 + 0/8',
        goal: 'Erklimme den Turm und überlebe die Lava!'
      },
      create: (canvas, players, options) => new window.PlatformJumperMinigame(canvas, players, options)
    });

    // 5. Memory Tiles (Boden-Merkspiel)
    this.register(5, {
      id: 5,
      name: 'Boden-Merkspiel',
      subtitle: 'Memory Tiles',
      icon: '🧠',
      description: '4 Symbole werden kurz angezeigt. Laufe schnell auf die passende Bodenplatte im 4x4-Raster, bevor die falschen Platten in den Abgrund stürzen! Schubsen erlaubt!',
      controls: {
        online: 'WASD oder Pfeiltasten = Laufen',
        local: 'P1: WASD | P2: Pfeiltasten | P3: IJKL | P4: Numpad 8456',
        goal: 'Finde immer das richtige Symbol und behalte deine 3 Herzen!'
      },
      create: (canvas, players, options) => new window.MemoryTilesMinigame(canvas, players, options)
    });

    // 6. Button Masher (Ballon-Pumpen)
    this.register(6, {
      id: 6,
      name: 'Ballon-Pumpen',
      subtitle: 'Button Masher',
      icon: '🎈',
      description: 'Hämmer so schnell wie möglich auf deine Aktionstaste! Jeder Einzeldruck pumpt Luft hinein. Wer bringt seinen Ballon zuerst zum Platzen?',
      controls: {
        online: 'LEERTASTE oder Enter so schnell wie möglich tippen (kein Gedrückthalten!)',
        local: 'P1: Leertaste | P2: Enter | P3: U-Taste | P4: Numpad 0 (oder Y)',
        goal: 'Bringe den Ballon zuerst zum Platzen!'
      },
      create: (canvas, players, options) => new window.ButtonMasherMinigame(canvas, players, options)
    });

    // 7. Tank Battle (Panzer-Duell)
    this.register(7, {
      id: 7,
      name: 'Panzer-Duell',
      subtitle: 'Tank Battle',
      icon: '🛡️',
      description: 'Steuere deinen Panzer durch das Labyrinth, zerstöre Holzkisten und nutze Steinwände für Abprallschüsse (Ricochet). Jeder hat 3 Trefferpunkte!',
      controls: {
        online: 'WASD / Pfeiltasten = Fahren/Zielen | LEERTASTE = Schießen',
        local: 'P1: WASD+Space | P2: Pfeile+Enter | P3: IJKL+U | P4: Numpad 8456+0',
        goal: 'Schalte alle gegnerischen Panzer aus!'
      },
      create: (canvas, players, options) => new window.TankBattleMinigame(canvas, players, options)
    });

    // 8. Red Light, Green Light (Ochs am Berg)
    this.register(8, {
      id: 8,
      name: 'Ochs am Berg',
      subtitle: 'Red Light, Green Light',
      icon: '👁️',
      description: 'Renne vorwärts bei GRÜN! Bei WARNUNG (Gelb) sofort abbremsen. Wer sich bei ROT noch bewegt, wird vom Wächter-Laser geschockt und zurückgesetzt!',
      controls: {
        online: 'D / PfeilRechts oder LEERTASTE = Vorwärts rennen',
        local: 'P1: D/Space | P2: PfeilRechts/Enter | P3: L/U | P4: Numpad 6/0',
        goal: 'Erreiche als Erster die Ziellinie!'
      },
      create: (canvas, players, options) => new window.RedLightGreenLightMinigame(canvas, players, options)
    });

    // 9. Paint the Floor (Gebiete färben)
    this.register(9, {
      id: 9,
      name: 'Gebiete färben',
      subtitle: 'Paint the Floor',
      icon: '🎨',
      description: 'Laufe mit deiner Farbrolle über das 16x12-Raster, um Fliesen in deiner Farbe einzufärben. Sammle Farbbomben ein für eine 3x3-Flächenexplosion!',
      controls: {
        online: 'WASD oder Pfeiltasten = Laufen',
        local: 'P1: WASD | P2: Pfeiltasten | P3: IJKL | P4: Numpad 8456',
        goal: 'Besitze nach 30 Sekunden die meisten farbigen Fliesen!'
      },
      create: (canvas, players, options) => new window.PaintTheFloorMinigame(canvas, players, options)
    });

    // 10. Quick Reaction (Schnellschuss)
    this.register(10, {
      id: 10,
      name: 'Schnellschuss',
      subtitle: 'Quick Reaction',
      icon: '🤠',
      description: 'Western-Duell! Warten auf das Signal „JETZT!“. Wer nach dem Signal am schnellsten seine Aktionstaste drückt, gewinnt. Wer zu früh drückt, erleidet einen Fehlstart!',
      controls: {
        online: 'LEERTASTE oder Enter genau im richtigen Moment drücken!',
        local: 'P1: Leertaste | P2: Enter | P3: U-Taste | P4: Numpad 0 (oder Y)',
        goal: 'Reagiere am schnellsten nach dem Signal (in ms)!'
      },
      create: (canvas, players, options) => new window.QuickReactionMinigame(canvas, players, options)
    });

    // 11. IT- & Wirtschafts-Plattform-Quiz (Quiz Platform)
    this.register(11, {
      id: 11,
      name: 'Plattform-Quiz',
      subtitle: 'IT & Wirtschaft',
      icon: '🧠',
      description: 'Laufe auf die Plattform mit der richtigen Antwort (A=Rot, B=Blau, C=Grün, D=Gelb), bevor die Zeit abläuft! Die falschen Plattformen stürzen in die Lava!',
      controls: {
        online: 'WASD oder Pfeiltasten = Laufen (Position wird 2s vor Ablauf gesperrt!)',
        local: 'P1: WASD | P2: Pfeiltasten | P3: IJKL | P4: Numpad 8456',
        goal: 'Beantworte 5 Fachfragen richtig und bleibe auf der Plattform stehen!'
      },
      create: (canvas, players, options) => new window.QuizPlatformMinigame(canvas, players, options)
    });

    // 12. Cyber-Showdown – Buzzer-Quiz (Quiz Buzzer)
    this.register(12, {
      id: 12,
      name: 'Cyber-Showdown',
      subtitle: 'Buzzer-Quiz',
      icon: '⚡',
      description: 'TV-Quizshow-Studio! Drücke so schnell wie möglich die richtige Buzzer-Taste: Oben=A, Rechts=B, Unten=C, Links=D. Richtig gibt Tempo-Punkte, Falsch gibt -200 Punkte!',
      controls: {
        online: 'Richtungstasten: ⬆️ = A | ➡️ = B | ⬇️ = C | ⬅️ = D',
        local: 'P1-P8: Eigene Steuerung oder Pfeiltasten (Oben=A, Rechts=B, Unten=C, Links=D)',
        goal: 'Buzzer am schnellsten für die meisten Punkte in 6 Runden!'
      },
      create: (canvas, players, options) => new window.QuizBuzzerMinigame(canvas, players, options)
    });

    // 13. Antigravitation (Antigravity Arena)
    this.register(13, {
      id: 13,
      name: 'Antigravitation',
      subtitle: 'Antigravity Arena',
      icon: '🌀',
      description: 'Achtung: Die Schwerkraft kippt regelmäßig um! Falle physikalisch korrekt an die Decke oder den Boden. Springe von der Decke nach unten, weiche Gefahren aus und sammle Schwerkraft-Kristalle!',
      controls: {
        online: 'A / D (oder Links / Rechts) = Laufen | W oder LEERTASTE = Springen (am Boden nach oben, an Decke nach unten!)',
        local: 'P1: A/D + Space/W | P2: Links/Rechts + Enter/Up | P3: J/L + U/I | P4: Numpad 4/6 + 0/8',
        goal: 'Sammle die meisten Schwerkraft-Kristalle in 35 Sekunden!'
      },
      create: (canvas, players, options) => new window.AntigravityMinigame(canvas, players, options)
    });
  }
}

window.minigameRegistry = new MinigameRegistry();
