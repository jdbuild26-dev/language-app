import React, { Fragment } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", name: "English", flag: "https://flagcdn.com/w80/us.png" },
  { code: "fr", name: "French", flag: "https://flagcdn.com/w80/fr.png" },
  { code: "de", name: "German", flag: "https://flagcdn.com/w80/de.png" },
  { code: "hi", name: "Hindi", flag: "https://flagcdn.com/w80/in.png" },
  { code: "es", name: "Spanish", flag: "https://flagcdn.com/w80/es.png" },
];

export default function LanguageSelector() {
  const { learningLang, setLearningLang, knownLang, setKnownLang } = useLanguage();

  const currentLearning = LANGUAGES.find(l => l.code === learningLang) || LANGUAGES[1];
  const currentKnown = LANGUAGES.find(l => l.code === knownLang) || LANGUAGES[0];

  const Flag = ({ src, alt, className }) => (
    <img
      src={src}
      alt={alt}
      className={cn("w-6 h-6 object-cover rounded-full shadow-sm border border-white/10", className)}
    />
  );

  return (
    <div className="flex items-center gap-5">
      {/* Known Language */}
      <Menu as="div" className="relative">
        <Menu.Button className="flex flex-col items-center gap-0.5 group cursor-pointer focus:outline-none">
          <span className="text-[10px] font-extrabold text-white/70 uppercase tracking-widest group-hover:text-white transition-colors">
            Known (Via)
          </span>
          <div className="relative rounded-full p-0.5 bg-white/10 ring-2 ring-transparent group-hover:ring-white/30 transition-all">
            <Flag src={currentKnown.flag} alt={currentKnown.name} />
          </div>
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute left-1/2 -translate-x-1/2 top-full z-50 mt-2 w-48 origin-top rounded-xl bg-white dark:bg-slate-900 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 dark:border-slate-700">
            <div className="px-4 py-2 border-b border-gray-50 dark:border-slate-800">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">I speak...</span>
            </div>
            {LANGUAGES.map((lang) => (
              <Menu.Item key={lang.code}>
                {({ active }) => (
                  <button
                    onClick={() => setKnownLang(lang.code)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors",
                      active ? "bg-gray-100 dark:bg-slate-800" : "",
                      knownLang === lang.code ? "text-blue-600 dark:text-blue-400 font-bold" : "text-gray-700 dark:text-slate-300"
                    )}
                  >
                    <Flag src={lang.flag} alt={lang.name} className="w-5 h-5" />
                    <span>{lang.name}</span>
                  </button>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Transition>
      </Menu>

      <div className="h-6 w-[1px] bg-white/20" />

      {/* Learning Language */}
      <Menu as="div" className="relative">
        <Menu.Button className="flex flex-col items-center gap-0.5 group cursor-pointer focus:outline-none">
          <span className="text-[10px] font-extrabold text-white uppercase tracking-widest group-hover:text-white transition-colors">
            Learning
          </span>
          <div className="relative rounded-full p-0.5 bg-white/10 ring-2 ring-brand-yellow-3 shadow-lg group-hover:scale-105 transition-all">
            <Flag src={currentLearning.flag} alt={currentLearning.name} />
          </div>
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute left-1/2 -translate-x-1/2 top-full z-50 mt-2 w-48 origin-top rounded-xl bg-white dark:bg-slate-900 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 dark:border-slate-700">
            <div className="px-4 py-2 border-b border-gray-50 dark:border-slate-800">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">I want to learn...</span>
            </div>
            {LANGUAGES.map((lang) => (
              <Menu.Item key={lang.code}>
                {({ active }) => (
                  <button
                    onClick={() => setLearningLang(lang.code)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors",
                      active ? "bg-gray-100 dark:bg-slate-800" : "",
                      learningLang === lang.code ? "text-brand-yellow-3 font-bold" : "text-gray-700 dark:text-slate-300"
                    )}
                  >
                    <Flag src={lang.flag} alt={lang.name} className="w-5 h-5" />
                    <span>{lang.name}</span>
                  </button>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
