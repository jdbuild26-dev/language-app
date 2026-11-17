"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_PRACTICE_NUMBER } from "@/features/vocabulary/utils/numberToFrench";
import { cn } from "@/lib/utils";

export type NumberSettings = {
  mode: "range" | "exact";
  from: string;
  to: string;
  exact: string;
};

function numberInput(value: string): string {
  return value.replace(/[^0-9]/g, "").slice(0, String(MAX_PRACTICE_NUMBER).length);
}

export default function NumberInputControls({
  settings,
  onChange,
  onRandomize,
  disabled,
}: {
  settings: NumberSettings;
  onChange: (update: Partial<NumberSettings>) => void;
  onRandomize: () => void;
  disabled: boolean;
}) {
  const inputClass = "h-9 min-w-0 text-center tabular-nums focus-visible:ring-sky-500";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (settings.mode === "range" && !disabled) onRandomize();
      }}
      className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm [container-type:inline-size] dark:border-slate-700 dark:bg-slate-900 2xl:rounded-full"
    >
      <fieldset disabled={disabled} className="flex min-w-0 flex-col gap-2 [@container(min-width:35rem)]:flex-row [@container(min-width:35rem)]:items-center">
        <div role="group" aria-label="Number mode" className="flex shrink-0 gap-1 self-start rounded-full bg-slate-100 p-1 dark:bg-slate-800 [@container(min-width:35rem)]:self-center">
          {([{ mode: "range", label: "Range" }, { mode: "exact", label: "Exact" }] as const).map(({ mode, label }) => (
            <button
              key={mode}
              type="button"
              aria-pressed={settings.mode === mode}
              onClick={() => onChange({ mode })}
              className={cn(
                "rounded-full px-3 py-1 text-sm font-bold text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 dark:text-slate-300",
                settings.mode === mode && "bg-white !text-sky-700 shadow-sm dark:bg-slate-900 dark:!text-sky-300",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {settings.mode === "range" ? (
          <div className="grid min-w-0 flex-1 grid-cols-2 items-end gap-2 [@container(min-width:21rem)]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] [@container(min-width:26rem)]:items-center">
            {([{ field: "from", label: "From", placeholder: "0" }, { field: "to", label: "To", placeholder: "9999" }] as const).map(({ field, label, placeholder }) => (
              <label key={field} className="flex min-w-0 flex-col gap-1 text-sm font-semibold text-slate-600 dark:text-slate-300 [@container(min-width:26rem)]:flex-row [@container(min-width:26rem)]:items-center [@container(min-width:26rem)]:gap-2">
                {label}
                <Input inputMode="numeric" value={settings[field]} placeholder={placeholder}
                  onChange={(event) => onChange({ [field]: numberInput(event.target.value) })} className={inputClass} />
              </label>
            ))}
            <Button type="submit" className="col-span-2 h-9 rounded-full bg-sky-600 px-4 font-bold text-white hover:bg-sky-700 [@container(min-width:21rem)]:col-span-1 2xl:px-6">
              Randomize
            </Button>
          </div>
        ) : (
          <label className="flex min-w-0 flex-1 items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            Number
            <Input inputMode="numeric" value={settings.exact} placeholder="Enter a number"
              onChange={(event) => onChange({ exact: numberInput(event.target.value) })} className={inputClass} />
          </label>
        )}
      </fieldset>
    </form>
  );
}
