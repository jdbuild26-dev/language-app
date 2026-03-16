import { cn } from "@/lib/utils";

const languages = [
  { name: "English", flag: "🇺🇸", learners: "26M" },
  { name: "Spanish", flag: "🇪🇸", learners: "22M" },
  { name: "French", flag: "🇫🇷", learners: "15M" },
  { name: "Japanese", flag: "🇯🇵", learners: "4M" },
  { name: "German", flag: "🇩🇪", learners: "4M" },
  { name: "Italian", flag: "🇮🇹", learners: "2M" },
  { name: "Korean", flag: "🇰🇷", learners: "1M" },
  { name: "Chinese", flag: "🇨🇳", learners: "3M" },
  { name: "Russian", flag: "🇷🇺", learners: "1M" },
  { name: "Arabic", flag: "🇸🇦", learners: "1M" },
  { name: "Portuguese", flag: "🇧🇷", learners: "2M" },
  { name: "Turkish", flag: "🇹🇷", learners: "2M" },
  { name: "Dutch", flag: "🇳🇱", learners: "500K" },
  { name: "Polish", flag: "🇵🇱", learners: "500K" },
];

const Marquee = ({
  className,
  reverse,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}) => {
  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
              "animate-marquee flex-row": !vertical,
              "animate-marquee-vertical flex-col": vertical,
              "group-hover:[animation-play-state:paused]": pauseOnHover,
              "[animation-direction:reverse]": reverse,
            })}
          >
            {children}
          </div>
        ))}
    </div>
  );
};

const LanguageCard = ({ name, flag, learners }) => {
  return (
    <div
      className={cn(
        "relative flex h-14 w-auto cursor-pointer items-center gap-3 overflow-hidden rounded-full border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-5 py-2 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-brand-blue-1/30 dark:hover:border-slate-600"
      )}
    >
      <span className="text-2xl drop-shadow-sm filter">{flag}</span>
      <div className="flex flex-col justify-center">
        <span className="text-sm font-bold text-gray-900 dark:text-white leading-none">
          {name}
        </span>
        <span className="text-[10px] font-medium text-gray-500 dark:text-slate-400">
          {learners} learners
        </span>
      </div>
    </div>
  );
};

export function LanguageMarquee() {
  const firstRow = languages.slice(0, Math.ceil(languages.length / 2));
  const secondRow = languages.slice(Math.ceil(languages.length / 2));

  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-background py-10 scale-90 sm:scale-100">
      <div className="mb-6 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-brand-blue-1 dark:text-sky-400 mb-2">
          I want to learn
        </p>
      </div>

      <Marquee pauseOnHover className="[--duration:50s]">
        {firstRow.map((lang) => (
          <LanguageCard key={lang.name} {...lang} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:50s] mt-4 sm:mt-0">
        {secondRow.map((lang) => (
          <LanguageCard key={lang.name} {...lang} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-body-dark"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-body-dark"></div>
    </div>
  );
}
