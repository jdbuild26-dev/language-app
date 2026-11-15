import { beforeEach, expect, it, vi } from "vitest";
import { enablePracticeTyping } from "./practiceTyping";

// The document and native input are the browser boundary for this interaction.
class Element {
  hidden = false;
  constructor(public tag = "body") {}
  getClientRects() { return this.hidden ? [] : [{}]; }
  matches() { return this.tag === "input" || this.tag === "textarea"; }
  closest(selector: string) {
    if (selector.includes('[inert]')) return null;
    return selector.split(",").some(part => part.trim() === this.tag) ? this : null;
  }
}
class Input extends Element {
  private text = "";
  get value() { return this.text; }
  set value(value: string) { this.text = value; }
  disabled = false;
  readOnly = false;
  maxLength = -1;
  selectionStart = 0;
  selectionEnd = 0;
  dispatchEvent = vi.fn();
  focus = vi.fn(() => { doc.activeElement = this; });
  setSelectionRange(start: number, end: number) { this.selectionStart = start; this.selectionEnd = end; }
  constructor() { super("textarea"); }
}
let fields: Input[], dialogs: Element[];
let listeners: Map<string, (event: unknown) => void>;
let frames: Map<number, FrameRequestCallback>;
let doc: { activeElement: Element; defaultView: unknown; addEventListener: unknown; removeEventListener: unknown; querySelectorAll: unknown };
let root: HTMLElement;
beforeEach(() => {
  fields = [new Input()]; dialogs = []; listeners = new Map(); frames = new Map();
  let frameId = 0;
  doc = {
    activeElement: new Element(),
    defaultView: {
      Element, HTMLElement: Element, HTMLInputElement: Input, HTMLTextAreaElement: Input, Event,
      requestAnimationFrame: (callback: FrameRequestCallback) => { frames.set(++frameId, callback); return frameId; },
      cancelAnimationFrame: (id: number) => frames.delete(id),
    },
    addEventListener: (name: string, listener: (event: unknown) => void) => listeners.set(name, listener),
    removeEventListener: (name: string) => listeners.delete(name),
    querySelectorAll: () => dialogs,
  };
  root = { ownerDocument: doc, contains: (field: Input) => fields.includes(field), querySelectorAll: () => fields } as unknown as HTMLElement;
});
function type(key: string, options = {}) {
  const event = {
    key, target: new Element(), defaultPrevented: false, isComposing: false,
    ctrlKey: false, metaKey: false, altKey: false,
    preventDefault() { this.defaultPrevented = true; }, ...options,
  };
  listeners.get("keydown")?.(event);
  return event;
}

it("focuses the answer and preserves the first character through a native input event", () => {
  enablePracticeTyping(root);
  const event = type("é");
  expect(fields[0].value).toBe("é");
  expect(doc.activeElement).toBe(fields[0]);
  expect(fields[0].selectionStart).toBe(1);
  expect(fields[0].dispatchEvent.mock.calls[0][0]).toMatchObject({ type: "input", bubbles: true });
  expect(event.defaultPrevented).toBe(true);
});

it("replaces the saved selection in the most recently focused answer", () => {
  fields.push(new Input());
  fields[1].value = "Bonjour";
  fields[1].setSelectionRange(2, 4);
  enablePracticeTyping(root);
  listeners.get("focusin")?.({ target: fields[1] });
  type("x");
  expect(fields[1].value).toBe("Boxour");
  expect(fields[0].value).toBe("");
});

it("chooses the first empty editable answer when no previous answer was focused", () => {
  fields[0].value = "filled";
  fields.push(new Input());
  enablePracticeTyping(root); type("a");
  expect(fields[0].value).toBe("filled");
  expect(fields[1].value).toBe("a");
});

it("preserves shortcuts, composition, editable controls, and Space activation", () => {
  enablePracticeTyping(root);
  for (const options of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }, { isComposing: true },
    { defaultPrevented: true }, { target: new Element("input") }, { target: new Element("textarea") },
    { target: new Element("select") }]) {
    expect(type("a", options).defaultPrevented).toBe(options.defaultPrevented || false);
  }
  expect(type(" ", { target: new Element("button") }).defaultPrevented).toBe(false);
  expect(type("Enter").defaultPrevented).toBe(false);
  expect(fields[0].value).toBe("");
});

it("does not redirect while a modal is open or when only submitted/hidden fields remain", () => {
  enablePracticeTyping(root);
  dialogs.push(new Element("dialog"));
  expect(type("a").defaultPrevented).toBe(false);
  dialogs = [];
  fields[0].readOnly = true;
  expect(type("a").defaultPrevented).toBe(false);
  fields[0].readOnly = false; fields[0].disabled = true;
  expect(type("a").defaultPrevented).toBe(false);
  fields[0].disabled = false; fields[0].hidden = true;
  expect(type("a").defaultPrevented).toBe(false);
  expect(fields[0].value).toBe("");
});

it("enforces the character limit while allowing replacement of selected text", () => {
  fields[0].value = "chat"; fields[0].maxLength = 4;
  fields[0].setSelectionRange(4, 4);
  enablePracticeTyping(root); type("x");
  expect(fields[0].value).toBe("chat");
  fields[0].setSelectionRange(0, 1); type("r");
  expect(fields[0].value).toBe("rhat");
});

it("removes listeners and pending caret work on exit", () => {
  const stop = enablePracticeTyping(root);
  type("a"); stop(); type("b");
  expect(fields[0].value).toBe("a");
  expect(listeners.size).toBe(0);
  expect(frames.size).toBe(0);
});

it("does not move the caret backwards when another character arrives before the next frame", () => {
  enablePracticeTyping(root); type("a");
  fields[0].value = "ab";
  fields[0].setSelectionRange(2, 2);
  [...frames.values()].forEach(callback => callback(16));
  expect(fields[0].selectionStart).toBe(2);
  expect(fields[0].value).toBe("ab");
});

it("replaces a segmented cell's character when its focus handler selects the cell", () => {
  fields[0].value = "a"; fields[0].maxLength = 1;
  fields[0].setSelectionRange(1, 1);
  fields[0].focus.mockImplementation(() => {
    doc.activeElement = fields[0]; fields[0].setSelectionRange(0, 1);
  });
  enablePracticeTyping(root); type("é");
  expect(fields[0].value).toBe("é");
});
