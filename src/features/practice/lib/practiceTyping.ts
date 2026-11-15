const answerSelector = 'textarea[placeholder="|"], input[placeholder="|"]:not([type]), input[type="text"][placeholder="|"], input[type="text"][data-practice-answer]';
const editableSelector = 'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="combobox"], [role="listbox"], [role="menu"], [role="dialog"], [role="alertdialog"]';

/** Redirect printable typing to this Main Practice screen's available answer field. */
export function enablePracticeTyping(root: HTMLElement): () => void {
  const doc = root.ownerDocument;
  const view = doc.defaultView;
  if (!view) return () => {};
  let lastAnswer: HTMLInputElement | HTMLTextAreaElement | null = null;
  const frames = new Set<number>();
  const available = (field: HTMLInputElement | HTMLTextAreaElement) =>
    root.contains(field) && !field.disabled && !field.readOnly && field.getClientRects().length > 0
    && !field.closest('[inert], [aria-hidden="true"], fieldset[disabled]');
  const rememberAnswer = (event: FocusEvent) => {
    const target = event.target;
    if (target instanceof view.HTMLElement && target.matches(answerSelector)) {
      lastAnswer = target as HTMLInputElement | HTMLTextAreaElement;
    }
  };
  const handleTyping = (event: KeyboardEvent) => {
    const target = event.target instanceof view.Element ? event.target : null;
    if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey || event.altKey
      || event.key.length !== 1 || target?.closest(editableSelector)
      || (event.key === " " && target?.closest('button, [role="button"], a[href], [role="link"]'))
      || [...doc.querySelectorAll<HTMLElement>('[aria-modal="true"], dialog[open], [role="dialog"], [role="alertdialog"]')].some(dialog => dialog.getClientRects().length > 0)) return;

    const fields = [...root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(answerSelector)].filter(available);
    const field = lastAnswer && available(lastAnswer) ? lastAnswer : fields.find(input => !input.value) || fields[0];
    if (!field) return;
    event.preventDefault();
    field.focus({ preventScroll: true });
    const start = field.selectionStart ?? field.value.length;
    const end = field.selectionEnd ?? start;
    const next = field.value.slice(0, start) + event.key + field.value.slice(end);
    if (field.maxLength >= 0 && next.length > field.maxLength) return;

    // Use the native setter so React's controlled onChange sees the first character.
    const prototype = field instanceof view.HTMLTextAreaElement ? view.HTMLTextAreaElement.prototype : view.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(field, next);
    field.dispatchEvent(new view.Event("input", { bubbles: true }));
    const caret = start + event.key.length;
    field.setSelectionRange(caret, caret);
    const frame = view.requestAnimationFrame(() => {
      frames.delete(frame);
      if (available(field) && doc.activeElement === field && field.value === next) field.setSelectionRange(caret, caret);
    });
    frames.add(frame);
  };
  doc.addEventListener("focusin", rememberAnswer);
  doc.addEventListener("keydown", handleTyping);
  return () => {
    doc.removeEventListener("focusin", rememberAnswer);
    doc.removeEventListener("keydown", handleTyping);
    frames.forEach(frame => view.cancelAnimationFrame(frame));
  };
}
