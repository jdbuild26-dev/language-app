import { chartColor, type AnalysisChart } from "../lib/writeAnalysisChart";

function Pie({ values }: { values: number[] }) {
  const slices = values.map((value, index) => {
    const start = values.slice(0, index).reduce((total, previous) => total + previous, 0);
    const angle = (start + value / 2) * Math.PI / 50;
    return { start, end: start + value, value, color: chartColor(index), x: 50 - 31 * Math.sin(angle), y: 50 - 31 * Math.cos(angle) };
  });
  const stops = slices.slice().reverse().map(({ color, start, end }) => `${color} ${100 - end}% ${100 - start}%`).join(", ");
  return <div className="relative aspect-square w-full max-w-64 rounded-full shadow-lg" style={{ background: `conic-gradient(${stops})` }}>
    {slices.map(({ value, x, y }, index) => value > 0 && <span key={index} className="absolute -translate-x-1/2 -translate-y-1/2 rounded bg-slate-900 px-1.5 py-0.5 text-xs font-semibold text-white sm:text-sm" style={{ left: `${x}%`, top: `${y}%` }}>{value}%</span>)}
  </div>;
}

export default function WriteAnalysisChart({ chart, labels }: { chart: AnalysisChart; labels: string[] }) {
  const names = chart.categories.map((category, index) => labels[index] || category);
  return <div className="w-full shrink-0 px-2 py-4">
    <div aria-hidden="true">
      {chart.kind === "pie" ? (
        <div className="rounded-xl bg-slate-50 px-2 py-4 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {chart.series.map(({ year, values }, index) => <div key={year} className="contents">
              {index > 0 && chart.series.length === 2 && <span className="text-xl font-bold text-rose-500 sm:text-3xl">→</span>}
              <div className="flex w-[calc(50%-1.75rem)] min-w-0 flex-col items-center gap-3">
                <h3 className="text-xl font-semibold sm:text-2xl">{year}</h3>
                <Pie values={values} />
              </div>
            </div>)}
          </div>
          <div className="mx-auto mt-4 flex w-fit flex-wrap justify-center gap-x-4 gap-y-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold dark:bg-slate-800">
            {chart.categories.map((category, index) => <span key={category} className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-sm" style={{ background: chartColor(index) }} />{index + 1}
            </span>)}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap justify-center gap-4 text-sm font-semibold">
            {chart.series.map(({ year }, index) => <span key={year} className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-sm" style={{ background: chartColor(index) }} />{year}
            </span>)}
          </div>
          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2">
            <div className="relative h-52 w-9 text-right text-xs tabular-nums">
              {[100, 75, 50, 25, 0].map(tick => <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ top: `${100 - tick}%` }}>{tick}%</span>)}
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-52">
                {[0, 25, 50, 75, 100].map(tick => <div key={tick} className="absolute inset-x-0 border-t border-slate-200 dark:border-slate-700" style={{ top: `${tick}%` }} />)}
              </div>
              <div className="relative flex justify-around gap-2">
                {names.map((name, category) => <div key={name} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                  <div className="flex h-52 w-full items-end justify-center gap-1">
                    {chart.series.map(({ year, values }, index) => <div key={year} className="relative w-full max-w-10 rounded-t-sm" style={{ height: `${values[category]}%`, background: chartColor(index) }}>
                      <span className="absolute left-1/2 top-1 -translate-x-1/2 text-[10px] font-semibold text-slate-950 sm:text-xs" style={index === 0 ? { color: "white" } : undefined}>{values[category]}%</span>
                    </div>)}
                  </div>
                  <span className="text-sm font-semibold">{category + 1}</span>
                </div>)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
    <table className="sr-only">
      <caption>Chart values (%)</caption>
      <thead><tr><th scope="col">Category</th>{chart.series.map(({ year }) => <th scope="col" key={year}>{year}</th>)}</tr></thead>
      <tbody>{names.map((name, index) => <tr key={name}><th scope="row">{name}</th>{chart.series.map(({ year, values }) => <td key={year}>{values[index]}%</td>)}</tr>)}</tbody>
    </table>
  </div>;
}
