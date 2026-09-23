/** Only strike-through and bold markers are interpreted; all model text stays escaped. */
export function CorrectionText({ text }: { text: string }) {
  return <>{text.split(/(~~[\s\S]*?~~|\*\*[\s\S]*?\*\*)/g).map((part, index) => {
    if (part.startsWith("~~") && part.endsWith("~~")) {
      return <del key={index} className="text-red-700 dark:text-red-300">{part.slice(2, -2)}</del>;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-semibold text-emerald-700 dark:text-emerald-300">{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  })}</>;
}
