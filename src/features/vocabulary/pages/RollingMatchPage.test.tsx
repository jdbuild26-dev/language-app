/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({
  states: [] as any[], refs: [] as any[], effects: [] as any[], stateIndex: 0, refIndex: 0,
  collectEffects: true, speak: vi.fn(), cancel: vi.fn(), push: vi.fn(), speaking: false,
}));
vi.mock('react', () => ({
  useState(initial: any) {
    const index = harness.stateIndex++;
    if (!(index in harness.states)) harness.states[index] = initial;
    return [harness.states[index], (next: any) => {
      harness.states[index] = typeof next === 'function' ? next(harness.states[index]) : next;
    }];
  },
  useRef(initial: any) {
    const index = harness.refIndex++;
    return harness.refs[index] ??= { current: initial };
  },
  useEffect(effect: any) { if (harness.collectEffects) harness.effects.push(effect); },
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: harness.push }) }));
vi.mock('@/components/layout/PracticeGameLayout', () => ({ default: () => null }));
vi.mock('@/hooks/useTextToSpeech', () => ({ useTextToSpeech: () => ({ speak: harness.speak, cancel: harness.cancel, isSpeaking: harness.speaking }) }));
vi.mock('@/services/vocabularyApi', () => ({ fetchMatchPairsData: vi.fn() }));
import RollingMatchPage from './RollingMatchPage';
import { fetchMatchPairsData } from '@/services/vocabularyApi';
import { availableMatchIds, type MatchBoard } from '../lib/rollingMatch';
import AudioWaveform from '@/components/ui/AudioWaveform';

function render(mode: 'words' | 'audio' = 'words', pairLimit = 30): any {
  harness.stateIndex = 0;
  harness.refIndex = 0;
  return RollingMatchPage({ mode, pairLimit });
}
function buttons(node: any): any[] {
  if (!node || typeof node !== 'object') return [];
  if (node.type === 'button') return [node];
  const children = [node.props?.children].flat(Infinity);
  return children.flatMap(buttons);
}
async function load(mode: 'words' | 'audio' = 'words', pairLimit = 30) {
  render(mode, pairLimit);
  harness.collectEffects = false;
  harness.effects.forEach(effect => effect());
  await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  return render(mode, pairLimit);
}
function clickMatch(mode: 'words' | 'audio', id: string) {
  for (const side of ['leftSlots', 'rightSlots'] as const) {
    const board = harness.states[0] as MatchBoard;
    const cardIndex = board[side].filter(Boolean).findIndex(pair => pair?.id === id);
    const offset = side === 'rightSlots' ? board.leftSlots.filter(Boolean).length : 0;
    buttons(render(mode))[offset + cardIndex].props.onClick();
  }
}

beforeEach(() => {
  vi.useFakeTimers(); vi.clearAllMocks();
  harness.states = []; harness.refs = []; harness.effects = []; harness.collectEffects = true; harness.speaking = false;
  vi.mocked(fetchMatchPairsData).mockResolvedValue(Array.from({ length: 40 }, (_, i) => ({
    id: String(i), french: `fr-${i}`, english: `en-${i}`,
  })));
});
afterEach(() => vi.useRealTimers());

it.each(['words', 'audio'] as const)('speaks both selected sides in %s mode', async mode => {
  await load(mode);
  const board = harness.states[0] as MatchBoard;
  const left = board.leftSlots[0]!;
  const right = board.rightSlots[0]!;
  buttons(render(mode))[0].props.onClick();
  buttons(render(mode))[board.leftSlots.filter(Boolean).length].props.onClick();
  if (mode === 'words') {
    expect(harness.speak).toHaveBeenCalledWith(left.french, 'fr-FR', 1);
    expect(harness.speak).toHaveBeenCalledWith(right.english, 'en-US', 1);
  } else {
    expect(harness.speak).toHaveBeenCalledWith(left.french, 'fr-FR', 0.9, expect.objectContaining({ onEnd: expect.any(Function) }));
    expect(harness.speak).toHaveBeenCalledWith(right.english, 'en-US');
  }
});

it('gives each audio card a distinct stable waveform and highlights only the playing card', async () => {
  const waveformNodes = (node: any): any[] => {
    if (!node || typeof node !== 'object') return [];
    if (node.type === AudioWaveform) return [node];
    return [node.props?.children].flat(Infinity).flatMap(waveformNodes);
  };
  await load('audio');
  const cards = waveformNodes(render('audio'));
  expect(cards).toHaveLength(6);
  expect(new Set(cards.map(card => card.props.patternKey)).size).toBe(6);
  const firstHeights = AudioWaveform(cards[0].props).props.children.map((bar: any) => bar.props.style.height);
  const secondHeights = AudioWaveform(cards[1].props).props.children.map((bar: any) => bar.props.style.height);
  expect(firstHeights).not.toEqual(secondHeights);
  expect(AudioWaveform(cards[0].props).props.children.map((bar: any) => bar.props.style.height)).toEqual(firstHeights);

  buttons(render('audio'))[0].props.onClick();
  harness.speaking = true;
  expect(waveformNodes(render('audio')).map(card => card.props.isPlaying)).toEqual([true, false, false, false, false, false]);
});

it.each(['words', 'audio'] as const)('connects %s clicks to delayed replacement and automatic completion', async mode => {
  const initial = await load(mode, 12);
  expect(buttons(initial)).toHaveLength(mode === 'words' ? 8 : 12);
  expect(initial.props.totalQuestions).toBe(12);
  while (!(render(mode).props.isGameOver)) {
    const board = harness.states[0] as MatchBoard;
    const id = availableMatchIds(board)[0];
    clickMatch(mode, id);
    expect(harness.states[0]).toBe(board);
    // Further clicks during feedback cannot consume a second pair.
    buttons(render(mode))[0].props.onClick();
    vi.advanceTimersByTime(449);
    expect(harness.states[0]).toBe(board);
    vi.advanceTimersByTime(1);
    expect((harness.states[0] as MatchBoard).matched).toBe(board.matched + 1);
  }
  const finished = render(mode);
  expect(finished.props.score).toBe(12);
  expect(finished.props.progress).toBe(100);
  expect(finished.props.showSubmitButton).toBe(false);
  expect(buttons(finished)).toHaveLength(0);
  expect(harness.speak).toHaveBeenCalled();
});

it('keeps wrong matches in place and allows retry after the error delay', async () => {
  await load();
  const board = harness.states[0] as MatchBoard;
  const left = board.leftSlots[0]!;
  const rightIndex = board.rightSlots.findIndex(pair => pair?.id !== left.id);
  buttons(render())[0].props.onClick();
  buttons(render())[4 + rightIndex].props.onClick();
  vi.advanceTimersByTime(650);
  expect(harness.states[0]).toBe(board);
  clickMatch('words', availableMatchIds(board)[0]);
  vi.advanceTimersByTime(450);
  expect((harness.states[0] as MatchBoard).matched).toBe(1);
});
