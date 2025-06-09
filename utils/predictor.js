export function generateAviatorMultiplier() {
    const rand = Math.random();
    if (rand < 0.5) return (1.00 + Math.random() * 1.5).toFixed(2);
    if (rand < 0.8) return (2.5 + Math.random() * 2.0).toFixed(2);
    if (rand < 0.95) return (5.0 + Math.random() * 5.0).toFixed(2);
    return (10.0 + Math.random() * 50).toFixed(2);
  }
  