// ============================================================================
// Minigame 13: Antigravitations-Arena (Antigravity Arena)
// Ausfhrliche, syntaxfehlerfreie Physik- & Multiplayer-Implementierung
// ============================================================================

class AntigravityMinigame extends MinigameBase {
  constructor(canvas, players, options = {}) {
    super(canvas, players, options);

    this.totalDuration = 35; // 35 Sekunden Rundenzeit
    this.timeRemaining = this.totalDuration;
    this.seed = options.seed || Math.floor(Math.random() * 1000000);

    // --- Gravitations-Zustand ---
    this.gravityInverted = false;    // false = Normal (Boden), true = Antigravitation (Decke)
    this.gravityScale = 1.0;         // Interpolierter Faktor (+1.0 bis -1.0)
    this.targetGravityScale = 1.0;   // Ziel-Faktor
    this.transitionSpeed = 4.0;      // Geschwindigkeit des stufenlosen Wechsels

    // Physik-Konstanten
    this.nominalGravity = 920;       // Grundbeschleunigung in px/s
    this.jumpSpeed = 520;            // Sprungkraft in px/s
    this.moveSpeed = 240;            // Laufgeschwindigkeit in px/s

    // Automatischer Schwerkraft-Zyklus (Host/Lokal steuert alle ~7 Sekunden einen Flip)
    this.flipInterval = 7.0;
    this.flipTimer = this.flipInterval;
    this.warningTime = 2.0;          // Vorwarnung 2 Sekunden vor Schwerkraft-Umkehr

    // Arena-Elemente
    this.platforms = [];
    this.orbs = [];                  // Schwerkraft-Kristalle (+10 Pkt)
    this.hazards = [];               // Laser/Plasma-Gefahren (-5 Pkt + Stun)
    this.orbSpawnTimer = 0;
    this.ambientParticles = [];
    this.screenShake = 0;
  }

  // Pseudozufall mit Seed fr synchrone Plattformen/Orbs im Multiplayer
  seededRandom() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  setupArena() {
    this.timeRemaining = this.totalDuration;
    this.gravityInverted = false;
    this.gravityScale = 1.0;
    this.targetGravityScale = 1.0;
    this.flipTimer = this.flipInterval;
    this.ambientParticles = [];
    this.screenShake = 0;

    // Arena-Abmessungen
    const w = this.width;
    const h = this.height;

    // Plattform-Layout: Ausgewogene Hhen fr Sprnge vom Boden ODER von der Decke
    this.platforms = [
      // Untere Ebene
      { x: w * 0.10, y: h * 0.68, w: w * 0.22, h: 18, color: '#475569' },
      { x: w * 0.68, y: h * 0.68, w: w * 0.22, h: 18, color: '#475569' },
      // Mittlere Ebene
      { x: w * 0.35, y: h * 0.50, w: w * 0.30, h: 20, color: '#64748b' },
      // Obere Ebene (leicht von der Decke erreichbar bei Antigravitation)
      { x: w * 0.12, y: h * 0.32, w: w * 0.22, h: 18, color: '#475569' },
      { x: w * 0.66, y: h * 0.32, w: w * 0.22, h: 18, color: '#475569' }
    ];

    // Horizontale Gefahren-Strahlen (oszillieren links-rechts)
    this.hazards = [
      { x: w * 0.5, y: h * 0.40, radius: 15, vx: 110, minX: w * 0.2, maxX: w * 0.8 },
      { x: w * 0.5, y: h * 0.60, radius: 15, vx: -110, minX: w * 0.2, maxX: w * 0.8 }
    ];

    // Spieler-Initialisierung (bis zu 8 Spieler / 4 2er-Teams)
    const spacing = Math.min(95, (w - 160) / Math.max(1, this.players.length));
    this.players.forEach((p, idx) => {
      p.x = 80 + idx * spacing;
      p.y = h - 50;
      p.vx = 0;
      p.vy = 0;
      p.radius = 18;
      p.onGround = true;
      p.alive = true;
      p.score = 0;
      p.stunTimer = 0;
      p.visualAngle = 0; // Rotation beim Deckensturz (0 = aufrecht, Math.PI = auf dem Kopf)
    });

    // Erste Welle Schwerkraft-Orbs spawnen
    this.orbs = [];
    for (let i = 0; i < 6; i++) {
      this.spawnOrb();
    }

    // Falls Socket vorhanden, auf zentrale Gravitations-Synchronisation hren
    if (window.networkManager && window.networkManager.on) {
      this.gravitySyncHandler = (data) => {
        if (typeof data.gravityInverted === 'boolean') {
          this.applyGravityState(data.gravityInverted, data.duration || 0.5);
        }
      };
      window.networkManager.on('gravity_changed', this.gravitySyncHandler);
    }
  }

  spawnOrb() {
    if (this.orbs.length >= 10) return;
    const w = this.width;
    const h = this.height;

    // Orbs verteilen sich sowohl in Bodennhe, Decken-Nhe als auch Plattformhhe
    const x = 70 + this.seededRandom() * (w - 140);
    const y = 60 + this.seededRandom() * (h - 120);

    this.orbs.push({
      x,
      y,
      baseY: y,
      bobOffset: this.seededRandom() * Math.PI * 2,
      radius: 12,
      points: 10,
      sparkleTimer: 0
    });
  }

  /**
   * Setzt den Gravitationszustand zentral und lst Animationen aus
   */
  applyGravityState(inverted, duration = 0.5) {
    if (this.gravityInverted === inverted) return;
    this.gravityInverted = inverted;

    // VORZEICHEN-KONVENTION:
    // +1.0 = Normale Schwerkraft (Vektor zeigt nach unten in +Y)
    // -1.0 = Antigravitation (Vektor zeigt nach oben zur Decke in -Y)
    this.targetGravityScale = inverted ? -1.0 : 1.0;
    this.transitionSpeed = duration > 0 ? (1.0 / duration) * 2.0 : 9999.0;
    this.screenShake = 12; // Sprbarer visueller Ruck beim Umschalten

    // Schwerkraft-Welle Partikeleffekt
    const spawnY = inverted ? this.height - 30 : 30;
    const color = inverted ? '#A855F7' : '#38BDF8';
    this.spawnParticles(this.width / 2, spawnY, color, 30, 260, 0.7);

    if (window.soundEngine && window.soundEngine.playWhoosh) {
      window.soundEngine.playWhoosh();
    }
  }

  update(dt) {
    if (!this.isRunning) return;

    this.timeRemaining -= dt;
    if (this.timeRemaining <= 0) {
      this.resolveMatch();
      return;
    }

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 30);
    }

    // --- 1. SCHWERKRAFT-TIMER & SYNCHRONISATION ---
    this.flipTimer -= dt;

    // Nur der Host (oder im lokalen Modus) stt den Wechsel autoritativ an
    if (this.isHost || this.isLocalMode) {
      if (this.flipTimer <= 0) {
        this.flipTimer = this.flipInterval;
        const nextState = !this.gravityInverted;

        if (window.networkManager && !this.isLocalMode) {
          window.networkManager.sendGravityTrigger(null, nextState, 0.5);
        } else {
          this.applyGravityState(nextState, 0.5);
        }
      }
    }

    // Stufenlose Interpolation des Gravitationsfaktors (-1.0 <-> +1.0)
    if (Math.abs(this.gravityScale - this.targetGravityScale) > 0.001) {
      const step = this.transitionSpeed * dt;
      this.gravityScale += (this.targetGravityScale - this.gravityScale) * Math.min(1.0, step);
    } else {
      this.gravityScale = this.targetGravityScale;
    }

    // Berechnete effektive Schwerkraft (Vorzeichen bestimmt Richtung!)
    // Positiv (+) = Zieht nach unten in Richtung Boden
    // Negativ (-) = Zieht nach oben in Richtung Decke
    const effectiveGravity = this.nominalGravity * this.gravityScale;

    // --- 2. ORB SPAWNING & ANIMATION ---
    this.orbSpawnTimer -= dt;
    if (this.orbSpawnTimer <= 0) {
      this.orbSpawnTimer = 2.2;
      this.spawnOrb();
    }

    const now = performance.now() / 1000;
    this.orbs.forEach(orb => {
      orb.y = orb.baseY + Math.sin(now * 3 + orb.bobOffset) * 6;
    });

    // --- 3. GEFAHREN-BEWEGUNG (Hazards) ---
    this.hazards.forEach(h => {
      h.x += h.vx * dt;
      if (h.x <= h.minX || h.x >= h.maxX) {
        h.vx *= -1; // Abprallen
      }
    });

    // --- 4. SPIELER-PHYSIK & STEUERUNG (8 SPIELER) ---
    const ceilingLimit = 22;             // Deckenkante oben
    const floorLimit = this.height - 22; // Bodenkante unten

    this.players.forEach((p, idx) => {
      if (!p.alive) return;

      // Stun Timer (nach Kollision mit Laser/Gefahr)
      if (p.stunTimer > 0) {
        p.stunTimer -= dt;
        p.vx *= 0.85; // Schnelles Abbremsen bei Betubung
        return;
      }

      // Bot-Steuerung
      if (p.type === 'bot') {
        if (window.BotController && window.BotController.updateAntigravityBot) {
          window.BotController.updateAntigravityBot(p, this.platforms, this.orbs, this.gravityInverted, dt);
        } else {
          this.updateBotFallback(p, dt);
        }
      }

      // --- A. Horizontale Bewegung ---
      let moveDir = 0;
      if (p.inputs.left) moveDir -= 1;
      if (p.inputs.right) moveDir += 1;
      p.vx = moveDir * this.moveSpeed;

      // --- B. Sprung-Logik mit Vorzeichen-Invertierung ---
      const wantsJump = p.inputs.up || p.inputs.action;

      if (wantsJump && p.onGround) {
        if (!this.gravityInverted) {
          // NORMALFALL:
          // Spielfigur steht auf Boden/Plattform und springt NACH OBEN.
          // Vektor vy erhlt einen NEGATIVEN Impuls (im Canvas ist -Y nach oben!).
          p.vy = -this.jumpSpeed;
        } else {
          // ANTIGRAVITATION:
          // Spielfigur haftet an der Decke und springt NACH UNTEN.
          // Vektor vy erhlt einen POSITIVEN Impuls (im Canvas ist +Y nach unten!).
          p.vy = +this.jumpSpeed;
        }

        p.onGround = false;
        if (window.soundEngine && window.soundEngine.playJump) {
          window.soundEngine.playJump();
        }

        // Sprung-Partikel am Absprungort
        const particleY = !this.gravityInverted ? p.y + p.radius : p.y - p.radius;
        this.spawnParticles(p.x, particleY, '#E2E8F0', 8, 70, 0.3);
      }

      // --- C. Schwerkraft-Beschleunigung auf Geschwindigkeitsvektor vy anwenden ---
      // effectiveGravity ist negativ bei Antigravitation -> vy sinkt kontinuierlich (fllt nach oben)
      p.vy += effectiveGravity * dt;

      // Maximale Fallgeschwindigkeit dmpfen (Terminal Velocity)
      const terminalVelocity = 850;
      p.vy = Math.max(-terminalVelocity, Math.min(terminalVelocity, p.vy));

      // --- D. Positions-Vorausberechnung ---
      let nextX = p.x + p.vx * dt;
      let nextY = p.y + p.vy * dt;

      // Horizontale Banden-Begrenzung
      nextX = Math.max(p.radius, Math.min(this.width - p.radius, nextX));

      // --- E. Kollisions-Abfrage (Decke vs. Boden vs. Plattformen) ---
      let landed = false;

      if (!this.gravityInverted) {
        // ========================================================
        // 1. NORMAL-MODUS: Bodenkante (unten) ist Referenz
        // ========================================================

        // Bildschirm-Boden erreicht?
        if (nextY >= floorLimit) {
          nextY = floorLimit;
          p.vy = 0; // Vertikalen Fallimpuls zurcksetzen
          landed = true;
        }

        // Plattformen testen (nur wenn Spielfigur nach unten fllt: vy >= 0)
        if (!landed && p.vy >= 0) {
          for (const plat of this.platforms) {
            const footPrev = p.y + p.radius;
            const footNext = nextY + p.radius;

            // Hat der Fu die Oberkante der Plattform im aktuellen Schritt durchquert?
            if (footPrev <= plat.y + 6 && footNext >= plat.y) {
              if (nextX + p.radius * 0.6 >= plat.x && nextX - p.radius * 0.6 <= plat.x + plat.w) {
                nextY = plat.y - p.radius;
                p.vy = 0;
                landed = true;
                break;
              }
            }
          }
        }

        // Decken-Kontakt im Normalmodus (Kopf stt oben an)
        if (nextY - p.radius <= ceilingLimit) {
          nextY = ceilingLimit + p.radius;
          if (p.vy < 0) p.vy = 0; // Aufwrtsimpuls stoppen
        }

      } else {
        // ========================================================
        // 2. ANTIGRAVITATION: Decke (oben) ist der NEUE BODEN!
        // ========================================================

        // Bildschirm-Decke erreicht? (Spielfigur fllt nach oben in -Y)
        if (nextY <= ceilingLimit) {
          nextY = ceilingLimit;
          p.vy = 0; // Vertikalen Steigimpuls an der Decke stoppen
          landed = true; // Steht sicher an der Decke!
        }

        // Plattform-Unterseiten testen (nur wenn Spielfigur nach oben fllt: vy <= 0)
        if (!landed && p.vy <= 0) {
          for (const plat of this.platforms) {
            const headPrev = p.y - p.radius;
            const headNext = nextY - p.radius;
            const platBottom = plat.y + plat.h;

            // Hat der Kopf die Unterkante der Plattform durchquert?
            if (headPrev >= platBottom - 6 && headNext <= platBottom) {
              if (nextX + p.radius * 0.6 >= plat.x && nextX - p.radius * 0.6 <= plat.x + plat.w) {
                nextY = platBottom + p.radius;
                p.vy = 0;
                landed = true; // Haftet an der Plattform-Unterseite
                break;
              }
            }
          }
        }

        // Boden-Kontakt bei Antigravitation (Kopf stt unten an)
        if (nextY + p.radius >= floorLimit) {
          nextY = floorLimit - p.radius;
          if (p.vy > 0) p.vy = 0; // Abwrtsimpuls stoppen
        }
      }

      // Bodenkontakt aktualisieren
      p.onGround = landed;

      // Position bernehmen
      p.x = nextX;
      p.y = nextY;

      // --- F. Visuelle Drehung sanft interpolieren ---
      // Wenn Schwerkraft kippt, dreht sich die Spielfigur um 180 Grad
      const targetAngle = this.gravityScale < 0 ? Math.PI : 0;
      p.visualAngle += (targetAngle - p.visualAngle) * Math.min(1.0, dt * 10);

      // --- G. Einsammeln von Orbs ---
      for (let oIdx = this.orbs.length - 1; oIdx >= 0; oIdx--) {
        const orb = this.orbs[oIdx];
        const dist = Math.hypot(p.x - orb.x, p.y - orb.y);
        if (dist < p.radius + orb.radius) {
          p.score += orb.points;
          this.spawnParticles(orb.x, orb.y, '#FBBF24', 14, 120, 0.45);
          if (window.soundEngine && window.soundEngine.playCoin) {
            window.soundEngine.playCoin();
          }
          this.orbs.splice(oIdx, 1);
        }
      }

      // --- H. Kollision mit Gefahrenstrahlen ---
      this.hazards.forEach(hz => {
        const dist = Math.hypot(p.x - hz.x, p.y - hz.y);
        if (dist < p.radius + hz.radius) {
          p.score = Math.max(0, p.score - 5);
          p.stunTimer = 1.0; // 1 Sekunde Schock-Lhmung
          p.vx = (p.x < hz.x ? -180 : 180);
          p.vy = (!this.gravityInverted ? -220 : 220);
          this.spawnParticles(p.x, p.y, '#EF4444', 16, 140, 0.5);
          if (window.soundEngine && window.soundEngine.playStun) {
            window.soundEngine.playStun();
          }
        }
      });
    });

    // --- 5. HINTERGRUND-PARTIKEL DRIFT ---
    this.updateAmbientParticles(dt);
    this.updateParticles(dt);
  }

  updateAmbientParticles(dt) {
    // Schwebeteilchen driften gem aktueller Schwerkraft
    if (this.ambientParticles.length < 35 && Math.random() < 0.4) {
      this.ambientParticles.push({
        x: Math.random() * this.width,
        y: this.gravityScale < 0 ? this.height + 5 : -5,
        speed: (Math.random() * 60 + 40),
        size: Math.random() * 3 + 1,
        color: this.gravityScale < 0 ? '#C084FC' : '#38BDF8',
        life: 5.0
      });
    }

    for (let i = this.ambientParticles.length - 1; i >= 0; i--) {
      const ap = this.ambientParticles[i];
      // Vertikaler Drift je nach Schwerkraft-Vorzeichen
      ap.y += (this.gravityScale < 0 ? -1 : 1) * ap.speed * dt;
      ap.life -= dt;
      if (ap.life <= 0 || ap.y < -10 || ap.y > this.height + 10) {
        this.ambientParticles.splice(i, 1);
      }
    }
  }

  updateBotFallback(bot, dt) {
    // 1. Suche nach dem nchsten Orb
    let nearestOrb = null;
    let minDist = Infinity;
    this.orbs.forEach(o => {
      const d = Math.hypot(o.x - bot.x, o.y - bot.y);
      if (d < minDist) {
        minDist = d;
        nearestOrb = o;
      }
    });

    if (nearestOrb) {
      bot.inputs.left = nearestOrb.x < bot.x - 10;
      bot.inputs.right = nearestOrb.x > bot.x + 10;

      // Vertikale Sprung-Entscheidung:
      // Im Normalfall nach oben springen, wenn Orb hher liegt
      // Im Antigravitations-Fall nach unten springen, wenn Orb tiefer liegt
      if (!this.gravityInverted) {
        bot.inputs.up = (nearestOrb.y < bot.y - 30) && bot.onGround;
      } else {
        bot.inputs.up = (nearestOrb.y > bot.y + 30) && bot.onGround;
      }
    } else {
      bot.inputs.left = false;
      bot.inputs.right = false;
      bot.inputs.up = false;
    }
  }

  resolveMatch() {
    // Wenn Teams aktiv sind, Team-Punkte berechnen oder Einzel-Rankings erstellen
    const sorted = [...this.players]
      .map((p, idx) => ({ idx, score: p.score }))
      .sort((a, b) => b.score - a.score);

    const rankings = sorted.map(s => s.idx);
    this.finishGame(rankings);
  }

  stop() {
    super.stop();
    if (window.networkManager && window.networkManager.callbacks) {
      delete window.networkManager.callbacks['gravity_changed'];
    }
  }

  // --- RENDERING ---
  render(ctx) {
    ctx.save();

    // Screen Shake anwenden
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Dynamischer Kosmischer Hintergrund (Farbverlauf tnt sich je nach Gravitation)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    if (this.gravityScale < 0) {
      // Mystisches Antigravitations-Lila
      bgGrad.addColorStop(0, '#2E1065');
      bgGrad.addColorStop(1, '#0F172A');
    } else {
      // Klassisches Gravitations-Blau/Slate
      bgGrad.addColorStop(0, '#0F172A');
      bgGrad.addColorStop(1, '#0284C7');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Schwebende Raum-Partikel rendern
    this.ambientParticles.forEach(ap => {
      ctx.fillStyle = ap.color;
      ctx.beginPath();
      ctx.arc(ap.x, ap.y, ap.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Decken- und Bodenbalken (Aktive Gravitationszone leuchtet!)
    const isAnti = this.gravityScale < 0;

    // Decke
    ctx.fillStyle = isAnti ? '#9333EA' : '#334155';
    ctx.shadowColor = isAnti ? '#C084FC' : 'transparent';
    ctx.shadowBlur = isAnti ? 18 : 0;
    ctx.fillRect(0, 0, this.width, 22);

    // Boden
    ctx.fillStyle = !isAnti ? '#0284C7' : '#334155';
    ctx.shadowColor = !isAnti ? '#38BDF8' : 'transparent';
    ctx.shadowBlur = !isAnti ? 18 : 0;
    ctx.fillRect(0, this.height - 22, this.width, 22);
    ctx.shadowBlur = 0; // Reset Shadow

    // 4. Plattformen
    this.platforms.forEach(plat => {
      ctx.fillStyle = plat.color;
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

      // Kanten-Glow
      ctx.fillStyle = isAnti ? '#A855F7' : '#38BDF8';
      // Bei Antigravitation leuchtet die Unterseite der Plattform, sonst die Oberseite!
      const glowY = isAnti ? plat.y + plat.h - 3 : plat.y;
      ctx.fillRect(plat.x, glowY, plat.w, 3);
    });

    // 5. Schwerkraft-Orbs (+10 Pkt)
    this.orbs.forEach(orb => {
      ctx.save();
      ctx.translate(orb.x, orb.y);

      // Pulsierender Auren-Ring
      ctx.beginPath();
      ctx.arc(0, 0, orb.radius + 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
      ctx.fill();

      // Kristall-Kern
      ctx.beginPath();
      ctx.arc(0, 0, orb.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#F59E0B';
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 10;
      ctx.fill();

      // Glanzlicht
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(-3, -3, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // 6. Gefahren-Laser (Hazards)
    this.hazards.forEach(h => {
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.beginPath();
      ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#EF4444';
      ctx.shadowColor = '#F87171';
      ctx.shadowBlur = 12;
      ctx.fill();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    });

    // 7. Spieler rendern (mit flssiger 180-Spiegelung)
    this.players.forEach((p, idx) => {
      if (!p.alive) return;

      ctx.save();
      ctx.translate(p.x, p.y);

      // Echte geometrische Rotation basierend auf visualAngle
      ctx.rotate(p.visualAngle);

      // Bei Stun leicht zittern
      if (p.stunTimer > 0) {
        ctx.translate((Math.random() - 0.5) * 4, 0);
      }

      // Spieler mit Standard-Archetypen zeichnen
      this.drawPlayer(ctx, { ...p, x: 0, y: 0 }, {
        radius: p.radius,
        isJumping: !p.onGround
      });

      ctx.restore();

      // Score-Badge ber dem Kopf des Spielers
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      const scoreBadgeY = p.visualAngle > Math.PI / 2 ? p.y + p.radius + 14 : p.y - p.radius - 8;
      ctx.fillText(`${p.score} Pkt`, p.x, scoreBadgeY);
    });

    // 8. Partikel rendern
    this.renderParticles(ctx);

    // 9. HUD-Anzeige (Gravitations-Richtung & Vorwarnung)
    ctx.save();
    ctx.textAlign = 'center';

    // Runden-Timer oben zentriert
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`⏱️ ${Math.ceil(this.timeRemaining)}s`, this.width / 2, 45);

    // Gravitations-Statusindikator
    const statusText = isAnti 
      ? '⬆️ ANTIGRAVITATION AKTIV (Decke = Boden)' 
      : '⬇️ NORMALE SCHWERKRAFT (Boden = Boden)';
    const statusColor = isAnti ? '#C084FC' : '#38BDF8';

    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = statusColor;
    ctx.fillText(statusText, this.width / 2, 70);

    // Vorwarnungs-Countdown, wenn die Schwerkraft bald umkippt
    if (this.flipTimer <= this.warningTime) {
      const flash = Math.sin(performance.now() / 100) > 0 ? '#EF4444' : '#FCD34D';
      ctx.fillStyle = flash;
      ctx.font = 'black 16px sans-serif';
      ctx.fillText(`⚠️ SCHWERKRAFT-WECHSEL IN: ${this.flipTimer.toFixed(1)}s!`, this.width / 2, 95);
    }

    ctx.restore();
    ctx.restore(); // Shake restore
  }
}

window.AntigravityMinigame = AntigravityMinigame;
