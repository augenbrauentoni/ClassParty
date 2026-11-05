// Bot AI Controller & Algorithms for Board & Minigames
class BotController {
  constructor(game) {
    this.game = game;
  }

  // --- BOARD PHASE ---

  handleTurn(playerIndex) {
    const player = this.game.players[playerIndex];
    if (!player || player.type !== 'bot') return;

    // Natural delay before rolling
    setTimeout(() => {
      if (this.game.state === 'BOARD_TURN' && this.game.turnIndex === playerIndex && !this.game.isMoving) {
        this.game.executeDiceRoll();
      }
    }, 1100);
  }

  chooseForkBranch(currentTileId, starTileId) {
    if (currentTileId === 10) {
      if (starTileId >= 16 && starTileId <= 18) return 1;
      return Math.random() < 0.5 ? 1 : 0;
    } else if (currentTileId === 24) {
      if (starTileId >= 28 && starTileId <= 30) return 1;
      return Math.random() < 0.5 ? 1 : 0;
    } else if (currentTileId === 42) {
      if (starTileId >= 48 && starTileId <= 54) return 1;
      return Math.random() < 0.5 ? 1 : 0;
    }
    return Math.random() < 0.5 ? 1 : 0;
  }

  shouldBuyStar(player) {
    return player.coins >= 20;
  }

  // --- MINIGAME 4: PLATFORM JUMPER AI ---
  static updatePlatformJumperBot(bot, platforms, lavaY, dt) {
    // Find standing platform
    let currentPlat = null;
    platforms.forEach(p => {
      if (bot.y + 18 >= p.y && bot.y + 18 <= p.y + 14 && bot.x >= p.x - 10 && bot.x <= p.x + p.w + 10) {
        currentPlat = p;
      }
    });

    // Danger: if standing on crumbling platform with low timer or close to lava, jump ASAP!
    const dangerLava = bot.y > lavaY - 140;
    const dangerCrumble = currentPlat && currentPlat.crumbling && currentPlat.crumbleTimer < 0.8;

    // Search for next best higher platform
    let targetPlat = null;
    let minScore = Infinity;

    platforms.forEach(p => {
      if (p === currentPlat) return;
      if (p.crumbled) return;

      const dy = bot.y - p.y;
      // Must be above bot, within reachable vertical jump (~140px)
      if (dy > 15 && dy < 160) {
        const dx = Math.abs((p.x + p.w / 2) - bot.x);
        if (dx < 260) {
          const score = dy * 0.8 + dx * 0.5 + (p.crumbling ? 60 : 0);
          if (score < minScore) {
            minScore = score;
            targetPlat = p;
          }
        }
      }
    });

    if (targetPlat) {
      const targetCenterX = targetPlat.x + targetPlat.w / 2;
      bot.inputs.left = bot.x > targetCenterX + 8;
      bot.inputs.right = bot.x < targetCenterX - 8;

      // Jump when aligned or approaching
      if (bot.onGround && (Math.abs(bot.x - targetCenterX) < 140 || dangerCrumble || dangerLava)) {
        bot.inputs.action = true;
        bot.inputs.up = true;
      } else {
        bot.inputs.action = false;
        bot.inputs.up = false;
      }
    } else {
      // Fallback: keep moving away from lava or jump upwards
      if (dangerLava && bot.onGround) {
        bot.inputs.action = true;
        bot.inputs.up = true;
      } else {
        bot.inputs.action = false;
        bot.inputs.up = false;
      }
      bot.inputs.left = bot.x > 500;
      bot.inputs.right = bot.x <= 500;
    }
  }

  // --- MINIGAME 5: MEMORY TILES AI ---
  static updateMemoryTilesBot(bot, grid, targetSymbol, memorizedAccuracy = 0.75) {
    if (!bot.chosenTargetTile || bot.targetRoundSymbol !== targetSymbol) {
      bot.targetRoundSymbol = targetSymbol;
      const correctTiles = grid.filter(t => t.symbol === targetSymbol);

      // Check accuracy roll
      if (Math.random() < memorizedAccuracy && correctTiles.length > 0) {
        // Pick one of the correct tiles
        bot.chosenTargetTile = correctTiles[Math.floor(Math.random() * correctTiles.length)];
      } else {
        // Guesses random tile
        bot.chosenTargetTile = grid[Math.floor(Math.random() * grid.length)];
      }
    }

    if (bot.chosenTargetTile) {
      const tx = bot.chosenTargetTile.x + bot.chosenTargetTile.size / 2;
      const ty = bot.chosenTargetTile.y + bot.chosenTargetTile.size / 2;

      bot.inputs.left = bot.x > tx + 6;
      bot.inputs.right = bot.x < tx - 6;
      bot.inputs.up = bot.y > ty + 6;
      bot.inputs.down = bot.y < ty - 6;
    }
  }

  // --- MINIGAME 6: BUTTON MASHER AI ---
  static updateButtonMasherBot(bot, dt) {
    bot.mashTimer = (bot.mashTimer || 0) + dt;

    // Target rate: ~5.5 to 7.0 taps per second (interval: 0.14 - 0.18s)
    if (!bot.mashInterval) {
      bot.mashInterval = 0.14 + Math.random() * 0.04;
    }

    if (bot.mashTimer >= bot.mashInterval) {
      bot.mashTimer = 0;
      bot.mashInterval = 0.14 + (Math.random() - 0.5) * 0.03; // natural jitter
      return true; // Single keydown stroke!
    }
    return false;
  }

  // --- MINIGAME 7: TANK BATTLE AI ---
  static updateTankBattleBot(bot, idx, players, obstacles, bullets, dt) {
    // 1. Bullet Avoidance
    let dangerBullet = null;
    let minBulletDist = Infinity;
    bullets.forEach(b => {
      if (b.ownerIndex === idx) return;
      const dist = Math.hypot(b.x - bot.x, b.y - bot.y);
      if (dist < 140) {
        // Check if moving towards bot
        const toBotX = bot.x - b.x;
        const toBotY = bot.y - b.y;
        const dot = b.vx * toBotX + b.vy * toBotY;
        if (dot > 0 && dist < minBulletDist) {
          minBulletDist = dist;
          dangerBullet = b;
        }
      }
    });

    if (dangerBullet) {
      // Move perpendicular to incoming bullet
      const perpX = -dangerBullet.vy;
      const perpY = dangerBullet.vx;
      bot.inputs.left = perpX < 0;
      bot.inputs.right = perpX > 0;
      bot.inputs.up = perpY < 0;
      bot.inputs.down = perpY > 0;
      bot.inputs.action = false;
      return;
    }

    // 2. Find nearest alive enemy
    let nearestEnemy = null;
    let minEnemyDist = Infinity;
    players.forEach((p, i) => {
      if (i === idx || !p.alive) return;
      const d = Math.hypot(p.x - bot.x, p.y - bot.y);
      if (d < minEnemyDist) {
        minEnemyDist = d;
        nearestEnemy = p;
      }
    });

    if (nearestEnemy) {
      const dx = nearestEnemy.x - bot.x;
      const dy = nearestEnemy.y - bot.y;

      // Navigate towards enemy
      bot.inputs.left = dx < -25;
      bot.inputs.right = dx > 25;
      bot.inputs.up = dy < -25;
      bot.inputs.down = dy > 25;

      // Check line of sight (axis aligned or roughly aligned)
      const isAlignedX = Math.abs(dx) < 40 && Math.abs(dy) < 450;
      const isAlignedY = Math.abs(dy) < 40 && Math.abs(dx) < 450;

      // Shoot when aligned and cooldown ready
      if (bot.shootCooldown <= 0 && (isAlignedX || isAlignedY || Math.random() < 0.08)) {
        bot.inputs.action = true;
      } else {
        bot.inputs.action = false;
      }
    } else {
      bot.inputs.left = false;
      bot.inputs.right = false;
      bot.inputs.up = false;
      bot.inputs.down = false;
      bot.inputs.action = false;
    }
  }

  // --- MINIGAME 8: RED LIGHT GREEN LIGHT AI ---
  static updateRedLightBot(bot, lightState, dt) {
    if (lightState === 'GREEN') {
      bot.inputs.right = true;
      bot.inputs.action = Math.random() < 0.35; // occasional sprint boost
    } else if (lightState === 'WARN') {
      if (bot.botMistake) {
        // Late reaction: keep running for a fraction
        bot.inputs.right = true;
        bot.inputs.action = false;
      } else {
        // Brake cleanly
        bot.inputs.right = false;
        bot.inputs.action = false;
      }
    } else if (lightState === 'RED') {
      // Complete freeze!
      bot.inputs.right = false;
      bot.inputs.action = false;
      bot.inputs.left = false;
      bot.inputs.up = false;
      bot.inputs.down = false;
    }
  }

  // --- MINIGAME 9: PAINT THE FLOOR AI ---
  static updatePaintTheFloorBot(bot, idx, grid, powerups, dt) {
    // 1. Prioritize nearby paint bomb powerup
    if (powerups && powerups.length > 0) {
      let nearestBomb = null;
      let minBombDist = Infinity;
      powerups.forEach(b => {
        const d = Math.hypot(b.x - bot.x, b.y - bot.y);
        if (d < minBombDist) {
          minBombDist = d;
          nearestBomb = b;
        }
      });

      if (nearestBomb) {
        bot.inputs.left = nearestBomb.x < bot.x - 8;
        bot.inputs.right = nearestBomb.x > bot.x + 8;
        bot.inputs.up = nearestBomb.y < bot.y - 8;
        bot.inputs.down = nearestBomb.y > bot.y + 8;
        return;
      }
    }

    // 2. Otherwise seek nearest unpainted or opponent tile
    let bestTile = null;
    let minScore = Infinity;

    grid.forEach(t => {
      if (t.owner === idx) return; // Already painted by this bot
      const cx = t.x + t.w / 2;
      const cy = t.y + t.h / 2;
      const d = Math.hypot(cx - bot.x, cy - bot.y);
      if (d < minScore) {
        minScore = d;
        bestTile = t;
      }
    });

    if (bestTile) {
      const cx = bestTile.x + bestTile.w / 2;
      const cy = bestTile.y + bestTile.h / 2;
      bot.inputs.left = cx < bot.x - 8;
      bot.inputs.right = cx > bot.x + 8;
      bot.inputs.up = cy < bot.y - 8;
      bot.inputs.down = cy > bot.y + 8;
    } else {
      // Wander
      bot.inputs.left = bot.x > 800;
      bot.inputs.right = bot.x < 200;
      bot.inputs.up = bot.y > 500;
      bot.inputs.down = bot.y < 200;
    }
  }

  // --- MINIGAME 13: ANTIGRAVITATION AI ---
  static updateAntigravityBot(bot, platforms, orbs, isInverted, dt) {
    // 1. Suche nach dem nächstgelegenen Schwerkraft-Orb
    let nearestOrb = null;
    let minDist = Infinity;

    orbs.forEach(orb => {
      const d = Math.hypot(orb.x - bot.x, orb.y - bot.y);
      if (d < minDist) {
        minDist = d;
        nearestOrb = orb;
      }
    });

    if (nearestOrb) {
      // Horizontale Navigation zum Kristall
      bot.inputs.left = nearestOrb.x < bot.x - 12;
      bot.inputs.right = nearestOrb.x > bot.x + 12;

      // Invertierte Sprung-Entscheidung:
      if (!isInverted) {
        // Normalmodus: Nach oben springen (-Y), wenn Kristall höher liegt
        const wantsJumpUp = nearestOrb.y < bot.y - 40;
        bot.inputs.up = wantsJumpUp && bot.onGround;
        bot.inputs.action = bot.inputs.up;
      } else {
        // Antigravitation: Von der Decke nach unten springen (+Y), wenn Kristall tiefer liegt
        const wantsJumpDown = nearestOrb.y > bot.y + 40;
        bot.inputs.up = wantsJumpDown && bot.onGround;
        bot.inputs.action = bot.inputs.up;
      }
    } else {
      bot.inputs.left = false;
      bot.inputs.right = false;
      bot.inputs.up = false;
      bot.inputs.action = false;
    }
  }
}

window.BotController = BotController;
