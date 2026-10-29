import confetti from 'canvas-confetti';

export function triggerDoseTakenCelebration() {
  // Dual-cannon burst
  const count = 120;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#10b981', '#06b6d4', '#3b82f6'],
  });

  fire(0.2, {
    spread: 60,
    colors: ['#a855f7', '#ec4899', '#f59e0b'],
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    colors: ['#10b981', '#ffffff', '#0284c7'],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}
