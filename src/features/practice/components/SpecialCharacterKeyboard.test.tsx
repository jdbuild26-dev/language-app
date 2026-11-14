import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import SpecialCharacterKeyboard from "./SpecialCharacterKeyboard";

it("selects the learning language and renders its character buttons", () => {
  const french = renderToStaticMarkup(<SpecialCharacterKeyboard learningLanguage="fr" onInsert={() => {}} />);
  const spanish = renderToStaticMarkup(<SpecialCharacterKeyboard learningLanguage="es" onInsert={() => {}} />);

  expect(french).toContain('<option value="fr" selected="">French</option>');
  expect(french).toContain('aria-label="Insert é"');
  expect(spanish).toContain('<option value="es" selected="">Spanish</option>');
  expect(spanish).toContain('aria-label="Insert ñ"');
  expect(spanish).not.toContain('aria-label="Insert ç"');
});
