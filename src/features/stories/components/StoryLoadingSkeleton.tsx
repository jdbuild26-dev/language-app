import { Skeleton } from "@/components/ui/skeleton";

export function StoryLessonSkeleton({ darkMode }: { darkMode: boolean }) {
  const surface = darkMode ? "bg-[#182126]" : "bg-white";
  const border = darkMode ? "border-[#3b474d]" : "border-[#dbe5e7]";
  const block = darkMode ? "bg-[#2a383e]" : "bg-[#dce8eb]";

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#101418]" : "bg-[#fbf9f7]"}`} aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading story…</span>
      <header className={`flex h-[76px] items-center border-b px-4 sm:px-6 ${surface} ${border}`}>
        <Skeleton className={`h-7 w-7 rounded-full ${block}`} />
        <Skeleton className={`mx-auto h-6 w-48 max-w-[45vw] ${block}`} />
        <Skeleton className={`h-9 w-9 rounded-xl ${block}`} />
      </header>
      <div className="flex flex-col lg:min-h-[calc(100vh-76px)] lg:flex-row">
        <aside className={`w-full shrink-0 border-b p-4 sm:p-6 lg:w-[clamp(280px,22vw,340px)] lg:border-b-0 lg:border-r ${surface} ${border}`}>
          <div className={`mb-5 flex gap-5 border-b pb-3 ${border}`}>
            <Skeleton className={`h-4 w-24 ${block}`} />
            <Skeleton className={`h-4 w-20 ${block}`} />
            <Skeleton className={`h-4 w-20 ${block}`} />
          </div>
          <Skeleton className={`h-48 w-full rounded-xl sm:h-60 ${block}`} />
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Skeleton className={`h-10 ${block}`} />
            <Skeleton className={`h-10 ${block}`} />
          </div>
          <Skeleton className={`mt-4 h-28 w-full rounded-xl ${block}`} />
        </aside>
        <main className="flex-1 p-4 sm:p-6 lg:p-10">
          <div className="space-y-6 md:space-y-8">
          {[0, 1, 2].map((item) => (
            <div key={item} className={`grid w-full md:grid-cols-2 md:gap-8 ${item % 2 === 1 ? "md:justify-items-end" : "md:justify-items-start"}`}>
              <div className={`w-full max-w-[520px] rounded-xl border p-4 ${surface} ${border} ${item % 2 === 1 ? "md:col-start-2" : "md:col-start-1"}`}>
                <Skeleton className={`mb-4 h-3 w-24 ${block}`} />
                <Skeleton className={`h-4 w-full ${block}`} />
                <Skeleton className={`mt-3 h-4 w-3/4 ${block}`} />
              </div>
            </div>
          ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export function StoryCardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading stories…</span>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <Skeleton className="h-40 w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StoryTopicSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading story topics…</span>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {[0, 1, 2].map((chip) => <Skeleton key={chip} className="h-8 w-28 rounded-lg" />)}
          </div>
        </div>
      ))}
    </div>
  );
}
