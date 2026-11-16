const UNITS = [
  "zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit",
  "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize",
];
const TENS = ["vingt", "trente", "quarante", "cinquante", "soixante"];

export const MAX_PRACTICE_NUMBER = 99_999_999;
export const NUMBER_WORD_GROUPS = [
  UNITS.slice(0, 9),
  UNITS.slice(9),
  [...TENS, "quatre-vingt", "quatre-vingts"],
  ["cent", "cents", "mille", "million", "millions"],
  ["et", "-"],
];

function tensToTokens(n: number, beforeMille: boolean): string[] {
  if (n === 0) return [];
  if (n <= 16) return [UNITS[n]];
  if (n < 20) return ["dix", "-", UNITS[n - 10]];

  if (n < 70) {
    const ten = TENS[Math.floor(n / 10) - 2];
    const unit = n % 10;
    if (unit === 0) return [ten];
    return [ten, unit === 1 ? "et" : "-", UNITS[unit]];
  }

  if (n === 71) return ["soixante", "et", "onze"];
  if (n < 80) return ["soixante", "-", ...tensToTokens(n - 60, false)];
  if (n === 80) return [beforeMille ? "quatre-vingt" : "quatre-vingts"];

  return ["quatre-vingt", "-", ...tensToTokens(n - 80, false)];
}

function hundredsToTokens(n: number, beforeMille = false): string[] {
  if (n < 100) return tensToTokens(n, beforeMille);

  const hundreds = Math.floor(n / 100);
  const remainder = n % 100;
  const cent = hundreds > 1 && remainder === 0 && !beforeMille ? "cents" : "cent";
  const prefix = hundreds === 1 ? [cent] : [UNITS[hundreds], cent];
  return [...prefix, ...tensToTokens(remainder, beforeMille)];
}

export function numberToFrenchTokens(n: number): string[] {
  if (!Number.isInteger(n) || n < 0 || n > MAX_PRACTICE_NUMBER) return [];
  if (n === 0) return [UNITS[0]];

  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1_000);
  const tokens: string[] = [];

  if (millions > 0) {
    tokens.push(...hundredsToTokens(millions), millions === 1 ? "million" : "millions");
  }

  if (thousands > 0) {
    if (thousands > 1) tokens.push(...hundredsToTokens(thousands, true));
    tokens.push("mille");
  }

  return [...tokens, ...hundredsToTokens(n % 1_000)];
}

export function numberToFrench(n: number): string {
  return numberToFrenchTokens(n).join(" ").replace(/ - /g, "-");
}
