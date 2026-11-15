import { describe, expect, it } from "vitest";
import { diagramAnswer, diagramAnswerTranslation, readDiagramLocales } from "./diagramLocalization";

describe("diagram localization", () => {
  it("uses the stored counterpart for a selected distractor", () => {
    const locales = readDiagramLocales({}, { distractors_fr: ["rivière"], distractors_en: ["river."] });
    expect(diagramAnswerTranslation("rivière", [], "fr", "en", locales)).toBe("river.");
    expect(diagramAnswerTranslation("river.", [], "en", "fr", locales)).toBe("rivière");
  });
  it("uses the CSV passage title even when a stored localized title repeats the heading", () => {
    const locales = readDiagramLocales({}, {
      heading_fr: "Étiquetez le diagramme",
      passage_title_fr: "Passage piéton",
      title_fr: "Étiquetez le diagramme",
      localized: {
        fr: { heading: "Étiquetez le diagramme", title: "Étiquetez le diagramme" },
      },
    });
    expect(locales.fr.heading).toBe("Étiquetez le diagramme");
    expect(locales.fr.title).toBe("Passage piéton");
  });

  it("reads future language columns without a French or English branch", () => {
    const locales = readDiagramLocales({
      Heading_DE: "Beschrifte das Diagramm",
      "Passage Title_DE": "Der Sturm",
      Question_DE: "Ordne die Zahlen zu",
      answers_de: '["Blitz","Straße"]',
    }, {});
    expect(locales.de.heading).toBe("Beschrifte das Diagramm");
    expect(locales.de.title).toBe("Der Sturm");
    expect(locales.de.answers).toEqual(["Blitz", "Straße"]);
  });

  it("uses language keyed answers and translations", () => {
    const questions = [{ correct_by_lang: { de: "Blitz", es: "relámpago" } }];
    expect(diagramAnswer(questions[0], "de")).toBe("Blitz");
    expect(diagramAnswerTranslation("Blitz", questions, "de", "es")).toBe("relámpago");
  });
});
