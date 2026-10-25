import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import PracticeOptionCard from "./PracticeOptionCard";

it("exposes selection state and locks all submitted options", () => {
  for (const props of [{}, { selected: true }, { submitted: true, correct: true }, { submitted: true, selected: true }, { submitted: true }]) {
    const button = PracticeOptionCard({ ...props, children: "Chat" });
    expect(button.props.type).toBe("button");
    expect(button.props["aria-pressed"]).toBe(Boolean(props.selected));
    expect(button.props.disabled).toBe(Boolean(props.submitted));
  }
  const onSelect = vi.fn();
  PracticeOptionCard({ children: "Chat", onSelect }).props.onClick();
  PracticeOptionCard({ children: "Chat", onSelect, submitted: true }).props.onClick();
  expect(onSelect).toHaveBeenCalledOnce();
});

it("keeps translation available as a separate button after selection is locked", () => {
  const html = renderToStaticMarkup(<PracticeOptionCard submitted action={<button type="button">Translate</button>}>Chat</PracticeOptionCard>);
  expect(html).toMatch(/disabled=""/);
  expect(html.indexOf('</button>')).toBeLessThan(html.indexOf('>Translate</button>'));
});
