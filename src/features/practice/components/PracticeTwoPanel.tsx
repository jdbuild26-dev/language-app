import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PanelRatio = "equal" | "three-two" | "two-one" | "seven-three";

const columnClasses: Record<PanelRatio, string> = {
  equal: "md:grid-cols-2",
  "three-two": "md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]",
  "two-one": "md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]",
  "seven-three": "md:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]",
};

type PracticeTwoPanelProps = {
  children: ReactNode;
  ratio?: PanelRatio;
  className?: string;
};

export default function PracticeTwoPanel({ children, ratio = "equal", className }: PracticeTwoPanelProps) {
  return (
    <div className={cn(
      "practice-two-panel-shell mx-auto flex min-h-0 w-full flex-none flex-col gap-3 p-3 md:grid md:flex-1 md:auto-rows-[minmax(0,1fr)] md:items-stretch md:overflow-hidden",
      columnClasses[ratio],
      className,
    )}>
      {children}
    </div>
  );
}
