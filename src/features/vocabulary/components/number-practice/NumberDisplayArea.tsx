export default function NumberDisplayArea({ number }: { number: number | null }) {
  return (
    <div className="mx-auto grid min-h-[4.5rem] min-w-[9rem] max-w-full place-items-center rounded-lg border border-slate-200 bg-white px-5 py-2 text-center dark:border-slate-700 dark:bg-slate-900 sm:min-w-[14.5rem]">
      {number === null ? (
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Enter a number to begin</span>
      ) : (
        <span className="text-[clamp(1.75rem,3.5vw,3rem)] font-black leading-tight tracking-tight text-slate-800 dark:text-slate-100">
          {String(number).replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f")}
        </span>
      )}
    </div>
  );
}
