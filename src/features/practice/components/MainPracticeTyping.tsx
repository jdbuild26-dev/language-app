"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { enablePracticeTyping } from "../lib/practiceTyping";

export default function MainPracticeTyping({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (rootRef.current) return enablePracticeTyping(rootRef.current);
  }, []);
  return <div ref={rootRef} data-main-practice className="contents">{children}</div>;
}
