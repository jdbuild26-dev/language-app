const CHARACTERS: Record<string, string[]> = {
  fr: ["é", "è", "ê", "ë", "à", "â", "ç", "î", "ï", "ô", "ù", "û", "ü", "œ"],
  es: ["á", "é", "í", "ó", "ú", "ü", "ñ", "¿", "¡"],
  de: ["ä", "ö", "ü", "ß"],
  it: ["à", "è", "é", "ì", "í", "ò", "ó", "ù", "ú"],
  pt: ["á", "à", "â", "ã", "ç", "é", "ê", "í", "ó", "ô", "õ", "ú"],
};

const LANGUAGE_NAMES: Record<string, string> = {
  fr: "French", es: "Spanish", de: "German", it: "Italian", pt: "Portuguese",
};

export function getSpecialCharacters(language: string): string[] {
  return CHARACTERS[language.toLowerCase().split("-")[0]] || [];
}

export function getSpecialCharacterLanguageName(language: string): string {
  const code = language.toLowerCase().split("-")[0];
  return LANGUAGE_NAMES[code] || code.toUpperCase();
}

export function getSpecialCharacterLanguages(): { code: string; name: string }[] {
  return Object.keys(CHARACTERS).map(code => ({ code, name: LANGUAGE_NAMES[code] }));
}
