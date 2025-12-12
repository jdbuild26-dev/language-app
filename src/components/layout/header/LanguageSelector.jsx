import { FlagUKSVG, FlagSpainSVG } from "./NavbarIcons";

export default function LanguageSelector() {
  return (
    <div className="flex items-center gap-5">
      <div className="flex flex-col items-center gap-0.5 group cursor-pointer">
        <span className="text-[10px] font-extrabold text-white/70 uppercase tracking-widest group-hover:text-white transition-colors">
          Known
        </span>
        <div className="relative rounded-full p-0.5 ring-2 ring-transparent group-hover:ring-white/30 transition-all">
          <FlagUKSVG />
        </div>
      </div>
      <div className="flex flex-col items-center gap-0.5 group cursor-pointer">
        <span className="text-[10px] font-extrabold text-white uppercase tracking-widest group-hover:text-white transition-colors">
          Learning
        </span>
        <div className="relative rounded-full p-0.5 ring-2 ring-brand-yellow-3 shadow-lg group-hover:scale-105 transition-all">
          <FlagSpainSVG />
        </div>
      </div>
    </div>
  );
}
