/**
 * Cheerful messages for each correct placement: a phrase plus one of her nicknames.
 * Nicknames come from a shuffle bag, so each one appears once before any repeats,
 * and the same nickname never shows twice in a row.
 */
export const NICKNAMES = [
  "Junkiri",
  "Maya",
  "Chiplekiri",
  "Mayalu",
  "Baby Kumari",
  "Bebu",
  "Babaaaaay",
] as const;

const PHRASES = [
  "Well done",
  "Nice one",
  "Spot on",
  "Brilliant",
  "Yay",
  "That's the one",
  "Perfect",
  "Look at you go",
  "So smart",
  "Wohoo",
  "Nailed it",
  "Beautiful",
];

function bag<T>(items: readonly T[]) {
  let pool: T[] = [];
  let last: T | undefined;
  return (): T => {
    if (pool.length === 0) {
      pool = [...items];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      // Don't repeat the previous pick across a refill.
      if (pool.length > 1 && pool[pool.length - 1] === last) [pool[0], pool[pool.length - 1]] = [pool[pool.length - 1], pool[0]];
    }
    last = pool.pop()!;
    return last;
  };
}

export function createPraiser() {
  const nickname = bag(NICKNAMES);
  const phrase = bag(PHRASES);
  return () => `${phrase()}, ${nickname()}!`;
}
