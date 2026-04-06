/**
 * Word-level inline diff renderer.
 * Compares `original` and `corrected` strings word-by-word using
 * a simple LCS (longest common subsequence) approach, then renders:
 *  - unchanged words: plain text
 *  - removed words:   <span class="line-through opacity-60">word</span>
 *  - added words:     <span class="text-emerald-300 font-semibold">word</span>
 */

type DiffOp = { type: "keep" | "remove" | "add"; word: string };

function lcs(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp;
}

function buildDiff(original: string, corrected: string): DiffOp[] {
  const a = original.trim().split(/\s+/);
  const b = corrected.trim().split(/\s+/);
  const dp = lcs(a, b);

  const ops: DiffOp[] = [];
  let i = a.length;
  let j = b.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      ops.unshift({ type: "keep", word: a[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.unshift({ type: "add", word: b[j - 1] });
      j--;
    } else {
      ops.unshift({ type: "remove", word: a[i - 1] });
      i--;
    }
  }

  return ops;
}

interface InlineDiffProps {
  original: string;
  corrected: string;
  /** Tailwind class for removed words. Defaults to "line-through opacity-60" */
  removeClass?: string;
  /** Tailwind class for added words. Defaults to "text-emerald-300 font-semibold" */
  addClass?: string;
}

export function InlineDiff({
  original,
  corrected,
  removeClass = "line-through opacity-60",
  addClass = "text-emerald-300 font-semibold",
}: InlineDiffProps) {
  const ops = buildDiff(original, corrected);

  return (
    <>
      {ops.map((op, i) => {
        if (op.type === "keep") {
          return <span key={i}>{op.word} </span>;
        }
        if (op.type === "remove") {
          return <span key={i} className={removeClass}>{op.word} </span>;
        }
        // add
        return <span key={i} className={addClass}>{op.word} </span>;
      })}
    </>
  );
}
