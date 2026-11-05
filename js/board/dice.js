// Animated 1-10 Dice System for "Class Party"
class DiceRoller {
  constructor() {
    this.isRolling = false;
    this.currentValue = 1;
  }

  roll(finalValue, onTick, onComplete) {
    if (this.isRolling) return;
    this.isRolling = true;

    let ticks = 0;
    const totalTicks = 18;
    let delay = 50;

    const step = () => {
      ticks++;
      // Random value between 1 and 10 during the roll
      this.currentValue = Math.floor(Math.random() * 10) + 1;

      if (window.soundEngine) {
        window.soundEngine.playDiceRoll();
      }

      if (onTick) onTick(this.currentValue);

      if (ticks >= totalTicks) {
        this.currentValue = finalValue;
        this.isRolling = false;
        if (window.soundEngine) {
          window.soundEngine.playDiceStop();
        }
        if (onTick) onTick(finalValue);
        if (onComplete) onComplete(finalValue);
      } else {
        // Exponentially increase delay towards the end for suspense
        delay += 12;
        setTimeout(step, delay);
      }
    };

    setTimeout(step, delay);
  }
}

window.DiceRoller = DiceRoller;
