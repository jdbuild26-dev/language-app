import { expect, it } from "vitest";
import { readFillBlanksPassageTitle } from "./fillBlanksTitle";

it("uses a stored CSV passage title instead of a generic legacy title", () => {
  const content = {
    title_fr: "Passage",
    localized: { fr: { title: "Faire des courses au supermarché" } },
  };
  expect(readFillBlanksPassageTitle({}, content, "fr")).toBe("Faire des courses au supermarché");
  expect(readFillBlanksPassageTitle({ "Passage Title_FR": "Le marché" }, content, "fr")).toBe("Le marché");
});
