import type { WriteDocumentsEvaluation } from "../hooks/useWriteDocumentsEvaluation";

export function DocumentCorrectionTable({ grammar }: { grammar: WriteDocumentsEvaluation["grammar_analysis"] }) {
  const { correction_table: corrections, register_suggestions: suggestions } = grammar;
  if (!corrections.length && !suggestions.length) {
    return <p className="mt-5 text-emerald-700 dark:text-emerald-300">No language corrections or register suggestions.</p>;
  }

  return (
    <div className="mt-5 overflow-x-auto border-y border-slate-200 dark:border-slate-700">
      <table className="w-full min-w-[36rem] text-left text-base leading-7 text-slate-800 dark:text-slate-200">
        <thead className="bg-slate-50 text-sm dark:bg-slate-800">
          <tr>
            {["No.", "Learner wording", "Correction & explanation", "Alternative suggestions"].map(label => (
              <th key={label} scope="col" className="px-4 py-3">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {corrections.map(row => (
            <DocumentCorrectionRow key={row.number} row={row} number={row.number} corrected={row.corrected} />
          ))}
          {suggestions.map((row, index) => <DocumentCorrectionRow key={`register-${index}`} row={row} />)}
        </tbody>
      </table>
    </div>
  );
}

function DocumentCorrectionRow({ row, number, corrected }: {
  row: WriteDocumentsEvaluation["grammar_analysis"]["register_suggestions"][number];
  number?: number;
  corrected?: string;
}) {
  return (
    <tr className="align-top">
      <td className="px-4 py-4 font-semibold tabular-nums text-blue-700 dark:text-blue-300">{number ?? ""}</td>
      <td className="whitespace-pre-wrap break-words px-4 py-4">
        {corrected !== undefined && row.original
          ? <span className="text-red-600 dark:text-red-400">{row.original}</span>
          : row.original || "Insertion"}
      </td>
      <td className="whitespace-pre-wrap break-words px-4 py-4">
        {corrected
          ? <strong className="block text-emerald-700 dark:text-emerald-400">{corrected}</strong>
          : <strong className="block">{corrected === undefined ? "Register suggestion" : "Remove this text"}</strong>}
        {row.explanation}
      </td>
      <td className="space-y-2 break-words px-4 py-4">
        {row.alternatives.map((item, index) => <p key={index}>{item.text} ({item.translation})</p>)}
      </td>
    </tr>
  );
}
