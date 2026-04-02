import * as React from "react";

export interface CustomSelectProps {
  options?: string[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
  feedbackMode?: boolean;
  correctValue?: string;
  className?: string;
}

declare const CustomSelect: React.FC<CustomSelectProps>;

export default CustomSelect;
