import { describe, expect, it } from "vitest";
import { readReorderTitles } from "./reorderTitles";

describe("Reading Reorder titles", () => {
  it("reads the titles supplied in the backend's localized content", () => {
    expect(readReorderTitles({ content: {
      localized: { fr: { title: " Un mot de passe " }, en: { title: "A password" } },
      title_fr: "",
    } })).toEqual({ title_fr: "Un mot de passe", title_en: "A password", title: "" });
  });

  it("recognizes imported ROS context titles and leaves missing titles empty", () => {
    expect(readReorderTitles({ "Context Title_FR": "La visite" }))
      .toEqual({ title_fr: "La visite", title_en: "", title: "" });
    expect(readReorderTitles({ content: {} }))
      .toEqual({ title_fr: "", title_en: "", title: "" });
  });
});
