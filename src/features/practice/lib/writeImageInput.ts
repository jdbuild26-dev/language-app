export function imageSamples(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).slice(0, 2)
    : [];
}

export function imageCharacterLimit(value: unknown): number {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? Math.min(value, 5000) : 1000;
}

export function insertImageAccent(text: string, start: number, end: number, accent: string, limit: number): string {
  const result = text.slice(0, start) + accent + text.slice(end);
  return result.length <= limit ? result : text;
}

// A reset invalidates results even when the transport ignores cancellation.
export class ImageEvaluationRequestGate {
  private active: AbortController | null = null;

  begin(): AbortController | null {
    if (this.active) return null;
    this.active = new AbortController();
    return this.active;
  }

  isCurrent(request: AbortController): boolean {
    return this.active === request && !request.signal.aborted;
  }

  finish(request: AbortController): void {
    if (this.active === request) this.active = null;
  }

  reset(): void {
    this.active?.abort();
    this.active = null;
  }
}
