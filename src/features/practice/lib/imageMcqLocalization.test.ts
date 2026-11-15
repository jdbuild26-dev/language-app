import { describe, expect, it } from "vitest";
import { readImageMcqLocales } from "./imageMcqLocalization";

describe("readImageMcqLocales", () => {
  it("prefers the CSV heading over the generic instruction", () => {
    const locales = readImageMcqLocales({
      Heading_FR: "Identifiez la scène",
      Instruction_FR: "Choisissez la bonne réponse",
      Question_FR: "Quelle description correspond ?",
      options_fr: '["Une route", "Une plage"]',
    }, {});
    expect(locales.fr.heading).toBe("Identifiez la scène");
    expect(locales.fr.question).toBe("Quelle description correspond ?");
    expect(locales.fr.options).toEqual(["Une route", "Une plage"]);
  });

  it("reads language keyed content for future languages", () => {
    const locales = readImageMcqLocales({}, {
      localized: { de: { heading: "Wähle die Beschreibung", question: "Was ist zu sehen?", options: ["Straße", "Strand"] } },
    });
    expect(locales.de.heading).toBe("Wähle die Beschreibung");
    expect(locales.de.options).toEqual(["Straße", "Strand"]);
  });
});
