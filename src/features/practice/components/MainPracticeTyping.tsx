"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { enablePracticeTyping } from "../lib/practiceTyping";
import PracticeCharacterPicker from "./PracticeCharacterPicker";

export default function MainPracticeTyping({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (rootRef.current) return enablePracticeTyping(rootRef.current);
  }, []);
  return (
    <div ref={rootRef} data-main-practice className="contents">
      {children}
      {pathname && pathname !== "/practice/select-topic" && (
        <PracticeCharacterPicker key={pathname} rootRef={rootRef} />
      )}
    </div>
  );
}
