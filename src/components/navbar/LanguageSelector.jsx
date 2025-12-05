import { FlagUKSVG, FlagSpainSVG } from "./NavbarIcons";

export default function LanguageSelector() {
  return (
    <div className="flex items-center gap-5">
      <div className="flex flex-col items-center gap-1 group cursor-pointer">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-600 transition-colors">
          Known
        </span>
        <div className="relative rounded-full p-0.5 ring-2 ring-gray-100 group-hover:ring-brand-blue-2 transition-all">
          <FlagUKSVG />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1 group cursor-pointer">
        <span className="text-[10px] font-bold text-brand-blue-1 uppercase tracking-wider group-hover:text-brand-blue-2 transition-colors">
          Learning
        </span>
        <div className="relative rounded-full p-0.5 ring-2 ring-brand-yellow-2 shadow-sm group-hover:ring-brand-yellow-3 transition-all scale-110">
          <FlagSpainSVG />
        </div>
      </div>
    </div>
  );
}
