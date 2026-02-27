/**
 * Converts a number (0–9999) to its French word representation,
 * returning an array of word-bank tokens.
 *
 * Tokens match the word bank: zéro, un, deux, trois, quatre, cinq, six, sept,
 * huit, neuf, dix, onze, douze, treize, quatorze, quinze, seize,
 * vingt, trente, quarante, cinquante, soixante, quatre-vingt,
 * cent, mille, et, -
 */

const UNITS = [
  "zéro",
  "un",
  "deux",
  "trois",
  "quatre",
  "cinq",
  "six",
  "sept",
  "huit",
  "neuf",
  "dix",
  "onze",
  "douze",
  "treize",
  "quatorze",
  "quinze",
  "seize",
];

/**
 * Convert a number 0-99 to an array of French word-bank tokens.
 */
function tensToTokens(n) {
  if (n === 0) return [];
  if (n <= 16) return [UNITS[n]];

  if (n <= 19) {
    // 17 = dix - sept, 18 = dix - huit, 19 = dix - neuf
    return ["dix", "-", UNITS[n - 10]];
  }

  if (n <= 29) {
    if (n === 20) return ["vingt"];
    if (n === 21) return ["vingt", "et", "un"];
    return ["vingt", "-", UNITS[n - 20]];
  }

  if (n <= 39) {
    if (n === 30) return ["trente"];
    if (n === 31) return ["trente", "et", "un"];
    return ["trente", "-", UNITS[n - 30]];
  }

  if (n <= 49) {
    if (n === 40) return ["quarante"];
    if (n === 41) return ["quarante", "et", "un"];
    return ["quarante", "-", UNITS[n - 40]];
  }

  if (n <= 59) {
    if (n === 50) return ["cinquante"];
    if (n === 51) return ["cinquante", "et", "un"];
    return ["cinquante", "-", UNITS[n - 50]];
  }

  if (n <= 69) {
    if (n === 60) return ["soixante"];
    if (n === 61) return ["soixante", "et", "un"];
    return ["soixante", "-", UNITS[n - 60]];
  }

  // 70-79: soixante-dix, soixante et onze, soixante-douze ...
  if (n <= 79) {
    if (n === 70) return ["soixante", "-", "dix"];
    if (n === 71) return ["soixante", "et", "onze"];
    // 72-76 → soixante - douze/treize/quatorze/quinze/seize
    if (n <= 76) return ["soixante", "-", UNITS[n - 60]];
    // 77 = soixante - dix - sept, 78 = soixante - dix - huit, 79 = soixante - dix - neuf
    return ["soixante", "-", "dix", "-", UNITS[n - 70]];
  }

  // 80-89: quatre-vingt(s), quatre-vingt-un ...
  if (n <= 89) {
    if (n === 80) return ["quatre-vingt"];
    return ["quatre-vingt", "-", UNITS[n - 80]];
  }

  // 90-99: quatre-vingt-dix, quatre-vingt-onze ...
  if (n <= 99) {
    if (n === 90) return ["quatre-vingt", "-", "dix"];
    if (n <= 96) return ["quatre-vingt", "-", UNITS[n - 80]];
    // 97-99
    return ["quatre-vingt", "-", "dix", "-", UNITS[n - 90]];
  }

  return [];
}

/**
 * Convert a number 0-999 to an array of French word-bank tokens.
 */
function hundredsToTokens(n) {
  if (n === 0) return [];
  if (n < 100) return tensToTokens(n);

  const h = Math.floor(n / 100);
  const remainder = n % 100;

  const tokens = [];

  if (h === 1) {
    tokens.push("cent");
  } else {
    tokens.push(UNITS[h], "cent");
  }

  if (remainder > 0) {
    tokens.push(...tensToTokens(remainder));
  }

  return tokens;
}

/**
 * Convert a number (0–9999) to an array of French word-bank tokens.
 * @param {number} n - Integer between 0 and 9999
 * @returns {string[]} Array of word tokens
 */
export function numberToFrenchTokens(n) {
  if (n < 0 || n > 9999 || !Number.isInteger(n)) return [];
  if (n === 0) return ["zéro"];

  const thousands = Math.floor(n / 1000);
  const remainder = n % 1000;

  const tokens = [];

  if (thousands === 1) {
    tokens.push("mille");
  } else if (thousands >= 2) {
    tokens.push(UNITS[thousands], "mille");
  }

  if (remainder > 0) {
    tokens.push(...hundredsToTokens(remainder));
  }

  return tokens;
}

/**
 * Convert a number to its French string representation (tokens joined by spaces).
 * @param {number} n
 * @returns {string}
 */
export function numberToFrench(n) {
  return numberToFrenchTokens(n).join(" ");
}
