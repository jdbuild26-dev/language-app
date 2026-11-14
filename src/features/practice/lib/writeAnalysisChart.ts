export type AnalysisChart = {
  kind: "pie" | "bar";
  categories: string[];
  series: { year: string; values: number[] }[];
};

const colors = ["#a73d6b", "#ff8b73", "#f84472", "#ffe19e", "#57a7c6", "#8b7dce", "#59a690", "#c2864d"];

export function chartColor(index: number) {
  return colors[index % colors.length];
}
