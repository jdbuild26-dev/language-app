import * as React from "react";

export interface PracticeOptionsProps {
  options?: string[];
  selectedOption?: number | null;
  correctIndex?: number;
  selectedIndices?: number[];
  correctIndices?: number[];
  showFeedback?: boolean;
  onSelect?: (index: number) => void;
  className?: string;
  itemClassName?: string;
  showCheckIcon?: boolean;
  renderLabel?: (option: string, index: number) => React.ReactNode;
  renderSuffix?: (option: string, index: number) => React.ReactNode;
  renderAction?: (option: string, index: number) => React.ReactNode;
}

declare const PracticeOptions: React.FC<PracticeOptionsProps>;

export default PracticeOptions;
