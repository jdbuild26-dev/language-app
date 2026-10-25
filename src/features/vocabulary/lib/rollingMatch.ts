export type MatchPair = { id: string; french: string; english: string };
type Random = () => number;

export type MatchBoard = {
  pairs: MatchPair[];
  leftSlots: (MatchPair | null)[];
  rightSlots: (MatchPair | null)[];
  unseenLeft: MatchPair[];
  unseenRight: MatchPair[];
  leftEntered: Record<string, number>;
  rightEntered: Record<string, number>;
  matched: number;
};

function shuffle<T>(items: readonly T[], random: Random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const normalize = (text: string) => text.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase();

export function createMatchBoard(
  data: MatchPair[],
  { visibleCount = 4, pairLimit = 30, random = Math.random }: {
    visibleCount?: number; pairLimit?: number; random?: Random;
  } = {},
): MatchBoard {
  if (!Number.isInteger(visibleCount) || visibleCount < 1 || !Number.isInteger(pairLimit) || pairLimit < 1) {
    throw new Error('Matching requires a positive slot count and pair limit.');
  }
  const ids = new Set<string>();
  const french = new Set<string>();
  const english = new Set<string>();
  // Repeated labels would give learners multiple visually valid answers.
  const usable = data.filter(pair => {
    if (!pair.id || !pair.french?.trim() || !pair.english?.trim()) return false;
    const left = normalize(pair.french);
    const right = normalize(pair.english);
    if (ids.has(pair.id) || french.has(left) || english.has(right)) return false;
    ids.add(pair.id); french.add(left); english.add(right);
    return true;
  });
  const pairs = shuffle(usable, random).slice(0, pairLimit);
  if (!pairs.length) throw new Error('No matching words are available.');
  const count = Math.min(visibleCount, pairs.length);
  // Small pools necessarily have more overlap. Larger pools start with 2-3 matches.
  const overlap = Math.max(2 * count - pairs.length, Math.min(count, 2 + Math.floor(random() * 2)));
  const left = pairs.slice(0, count);
  const right = [...pairs.slice(0, overlap), ...pairs.slice(count, 2 * count - overlap)];
  const leftIds = new Set(left.map(pair => pair.id));
  const rightIds = new Set(right.map(pair => pair.id));
  const pad = (cards: MatchPair[]) => Array.from({ length: visibleCount }, (_, i) => cards[i] ?? null);
  return {
    pairs,
    leftSlots: pad(shuffle(left, random)), rightSlots: pad(shuffle(right, random)),
    unseenLeft: shuffle(pairs.filter(pair => !leftIds.has(pair.id)), random),
    unseenRight: shuffle(pairs.filter(pair => !rightIds.has(pair.id)), random),
    leftEntered: Object.fromEntries(left.map(pair => [pair.id, 0])),
    rightEntered: Object.fromEntries(right.map(pair => [pair.id, 0])),
    matched: 0,
  };
}

export function availableMatchIds(board: Pick<MatchBoard, 'leftSlots' | 'rightSlots'>): string[] {
  const right = new Set(board.rightSlots.flatMap(pair => pair ? [pair.id] : []));
  return board.leftSlots.flatMap(pair => pair && right.has(pair.id) ? [pair.id] : []);
}

/** Advance both sides atomically; every card is dealt exactly once per side. */
export function completeMatch(board: MatchBoard, id: string, random: Random = Math.random): MatchBoard {
  if (!availableMatchIds(board).includes(id)) return board;
  const leftIndex = board.leftSlots.findIndex(pair => pair?.id === id);
  const rightIndex = board.rightSlots.findIndex(pair => pair?.id === id);
  const matched = board.matched + 1;
  const leftSlots = board.leftSlots.map(pair => pair?.id === id ? null : pair);
  const rightSlots = board.rightSlots.map(pair => pair?.id === id ? null : pair);
  const leftIds = new Set(leftSlots.flatMap(pair => pair ? [pair.id] : []));
  const rightIds = new Set(rightSlots.flatMap(pair => pair ? [pair.id] : []));
  const existingMatches = availableMatchIds({ leftSlots, rightSlots }).length;
  const leftChoices = board.unseenLeft.length ? board.unseenLeft : [null];
  const rightChoices = board.unseenRight.length ? board.unseenRight : [null];
  type Candidate = { left: MatchPair | null; right: MatchPair | null; score: number[] };
  const candidates: Candidate[] = [];
  for (const left of leftChoices) {
    for (const right of rightChoices) {
      const matches = existingMatches + Number(!!left && rightIds.has(left.id))
        + Number(!!right && leftIds.has(right.id)) + Number(!!left && left.id === right?.id);
      if (!matches && matched < board.pairs.length) continue;
      const leftWait = left && rightIds.has(left.id) ? matched - board.rightEntered[left.id] : 0;
      const rightWait = right && leftIds.has(right.id) ? matched - board.leftEntered[right.id] : 0;
      candidates.push({ left, right, score: [
        // Once a card has waited three matches, its counterpart takes priority.
        (leftWait >= 3 ? leftWait : 0) + (rightWait >= 3 ? rightWait : 0),
        -Math.abs(matches - 2),
        leftWait + rightWait,
      ] });
    }
  }
  // Introduce a ready-made pair only if there is no other playable replacement.
  const independent = candidates.filter(({ left, right }) => !left || !right || left.id !== right.id);
  const playable = independent.length ? independent : candidates;
  if (!playable.length) throw new Error('No playable matching replacement is available.');
  const compare = (a: number[], b: number[]) => {
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i];
    return 0;
  };
  let best = [playable[0]];
  for (const candidate of playable.slice(1)) {
    const order = compare(candidate.score, best[0].score);
    if (order > 0) best = [candidate];
    else if (order === 0) best.push(candidate);
  }
  const { left, right } = best[Math.floor(random() * best.length)];
  leftSlots[leftIndex] = left;
  rightSlots[rightIndex] = right;
  return {
    ...board, leftSlots, rightSlots, matched,
    unseenLeft: board.unseenLeft.filter(pair => pair.id !== left?.id),
    unseenRight: board.unseenRight.filter(pair => pair.id !== right?.id),
    leftEntered: left ? { ...board.leftEntered, [left.id]: matched } : board.leftEntered,
    rightEntered: right ? { ...board.rightEntered, [right.id]: matched } : board.rightEntered,
  };
}
