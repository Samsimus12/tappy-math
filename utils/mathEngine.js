// Generate all true equations for a given target and operation set
function makeCorrectEquations(target, operations) {
  const eqs = [];

  if (operations.includes('add')) {
    for (let a = 1; a < target; a++) {
      const b = target - a;
      if (b >= 1) eqs.push(`${a} + ${b}`);
    }
  }

  if (operations.includes('sub')) {
    for (let b = 1; b <= 20; b++) {
      const a = target + b;
      if (a <= 200) eqs.push(`${a} − ${b}`);
    }
  }

  if (operations.includes('mul')) {
    for (let a = 2; a <= target; a++) {
      if (target % a === 0) {
        const b = target / a;
        if (b >= 2) eqs.push(`${a} × ${b}`);
      }
    }
  }

  if (operations.includes('div')) {
    for (let b = 2; b <= 15; b++) {
      const dividend = target * b;
      if (dividend <= 300) eqs.push(`${dividend} ÷ ${b}`);
    }
  }

  return [...new Set(eqs)];
}

function shuffle(arr) {
  return arr.slice().sort(() => Math.random() - 0.5);
}

export function generateTarget(config) {
  const { targetMin, targetMax } = config;
  return Math.floor(Math.random() * (targetMax - targetMin + 1)) + targetMin;
}

export function buildEquationPool(target, config) {
  const { maxCorrect, distractors: distCount, operations } = config;

  // Select correct equations
  const allCorrect = shuffle(makeCorrectEquations(target, operations));
  const correct = allCorrect.slice(0, maxCorrect);

  // Build distractor set from nearby wrong targets
  const correctSet = new Set(allCorrect);
  const distractorSet = new Set();

  for (let offset = 1; offset <= 20 && distractorSet.size < distCount * 2; offset++) {
    for (const sign of [-1, 1]) {
      const wrongTarget = target + sign * offset;
      if (wrongTarget < 1 || wrongTarget > 350) continue;
      const eqs = makeCorrectEquations(wrongTarget, operations);
      for (const eq of eqs) {
        if (!correctSet.has(eq)) distractorSet.add(eq);
      }
    }
  }

  const distractors = shuffle([...distractorSet]).slice(0, distCount);

  return { correct, distractors };
}
