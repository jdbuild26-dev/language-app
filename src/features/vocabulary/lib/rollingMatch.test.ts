import { describe, expect, it } from 'vitest';
import { availableMatchIds, completeMatch, createMatchBoard, type MatchBoard, type MatchPair } from './rollingMatch';

const pairs = (count: number): MatchPair[] => Array.from({ length: count }, (_, i) => ({
  id: String(i), french: `fr-${i}`, english: `en-${i}`,
}));
function seeded(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
const ids = (cards: (MatchPair | null)[]) => cards.flatMap(card => card ? [card.id] : []);

it('starts with four cards on each side and two or three available matches', () => {
  const overlaps = new Set<number>();
  for (let seed = 1; seed <= 60; seed++) {
    const board = createMatchBoard(pairs(60), { random: seeded(seed) });
    expect(board.pairs).toHaveLength(30);
    expect(ids(board.leftSlots)).toHaveLength(4);
    expect(ids(board.rightSlots)).toHaveLength(4);
    const matches = availableMatchIds(board).length;
    expect([2, 3]).toContain(matches);
    overlaps.add(matches);
  }
  expect(overlaps.size).toBe(2);
});

it('supports a custom pool limit and excludes empty or ambiguous cards', () => {
  const data = [...pairs(40),
    { id: 'duplicate-left', french: ' FR-0 ', english: 'other' },
    { id: 'duplicate-right', french: 'other', english: ' EN-1 ' },
    { id: '0', french: 'new', english: 'new' },
    { id: 'empty', french: ' ', english: 'empty' },
  ];
  const board = createMatchBoard(data, { pairLimit: 50 });
  expect(board.pairs).toHaveLength(40);
  expect(createMatchBoard(data, { pairLimit: 12 }).pairs).toHaveLength(12);
  expect(() => createMatchBoard([])).toThrow('No matching words');
  expect(() => createMatchBoard(data, { visibleCount: 0 })).toThrow();
});

it('does not consume cards or progress for a pair that is not available', () => {
  const board = createMatchBoard(pairs(30));
  expect(completeMatch(board, 'missing')).toBe(board);
  const next = completeMatch(board, availableMatchIds(board)[0]);
  expect(completeMatch(next, availableMatchIds(board)[0])).toBe(next);
});

it('avoids introducing a matching pair into both replacement slots when alternatives are playable', () => {
  for (let seed = 1; seed < 50; seed++) {
    const random = seeded(seed);
    const board = createMatchBoard(pairs(30), { random });
    const id = availableMatchIds(board)[0];
    const leftIndex = board.leftSlots.findIndex(pair => pair?.id === id);
    const rightIndex = board.rightSlots.findIndex(pair => pair?.id === id);
    const next = completeMatch(board, id, random);
    expect(next.leftSlots[leftIndex]?.id).not.toBe(next.rightSlots[rightIndex]?.id);
  }
});

function assertBoard(board: MatchBoard, completed: Set<string>, slotCount: number) {
  expect(board.leftSlots).toHaveLength(slotCount);
  expect(board.rightSlots).toHaveLength(slotCount);
  const left = [...ids(board.leftSlots), ...ids(board.unseenLeft)];
  const right = [...ids(board.rightSlots), ...ids(board.unseenRight)];
  const remaining = board.pairs.map(pair => pair.id).filter(id => !completed.has(id)).sort();
  // Exact membership checks detect repeated, dropped, or orphaned counterparts.
  expect([...left].sort()).toEqual(remaining);
  expect([...right].sort()).toEqual(remaining);
  expect(board.matched).toBe(completed.size);
  if (remaining.length) expect(availableMatchIds(board).length).toBeGreaterThan(0);
  for (const card of board.leftSlots) {
    if (card && !ids(board.rightSlots).includes(card.id)) {
      expect(board.matched - board.leftEntered[card.id]).toBeLessThanOrEqual(slotCount + 2);
    }
  }
  for (const card of board.rightSlots) {
    if (card && !ids(board.leftSlots).includes(card.id)) {
      expect(board.matched - board.rightEntered[card.id]).toBeLessThanOrEqual(slotCount + 2);
    }
  }
}

describe.each([4, 6])('%i visible cards (word and audio modes)', (visibleCount) => {
  it('finishes every pool without dead ends, reappearing cards, or stranded counterparts', () => {
    for (const size of [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 29, 30, 31, 60]) {
      for (let seed = 1; seed <= 20; seed++) {
        const random = seeded(seed);
        let board = createMatchBoard(pairs(size), { visibleCount, random });
        const completed = new Set<string>();
        assertBoard(board, completed, visibleCount);
        while (completed.size < board.pairs.length) {
          const available = availableMatchIds(board);
          // Vary learner behaviour: topmost, bottommost, and random matching.
          const index = seed % 3 === 0 ? 0 : seed % 3 === 1 ? available.length - 1 : Math.floor(random() * available.length);
          const id = available[index];
          const previous = JSON.stringify(board);
          const next = completeMatch(board, id, random);
          expect(JSON.stringify(board)).toBe(previous);
          completed.add(id);
          board = next;
          assertBoard(board, completed, visibleCount);
        }
        expect(ids(board.leftSlots)).toEqual([]);
        expect(ids(board.rightSlots)).toEqual([]);
        expect(board.unseenLeft).toEqual([]);
        expect(board.unseenRight).toEqual([]);
      }
    }
  }, 20000);
});
