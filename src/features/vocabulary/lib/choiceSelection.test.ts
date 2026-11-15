import { describe, expect, it } from "vitest";
import { selectChoice } from "./choiceSelection";

const ces = { text: "Ces" };
const ce = { text: "Ce" };

describe("selectChoice", () => {
  it("replaces the selected option in a single-answer question", () => {
    expect(selectChoice([ces], ce, 1)).toEqual([ce]);
  });

  it("lets multi-answer questions toggle choices within their limit", () => {
    expect(selectChoice([ces], ce, 2)).toEqual([ces, ce]);
    expect(selectChoice([ces, ce], ces, 2)).toEqual([ce]);
  });
});
