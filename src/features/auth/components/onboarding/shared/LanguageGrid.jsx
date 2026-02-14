import React from "react";
import LanguageFlagCard from "./LanguageFlagCard";

/**
 * LanguageGrid — two-section grid layout: "Most Popular" + "All Languages".
 * Used in Steps 2, 3, 4 with different selection behavior.
 */
const LanguageGrid = ({
  languages,
  popularLanguages,
  selected,
  onSelect,
  maxSelections = 1,
}) => {
  const popular = languages.filter((l) => popularLanguages.includes(l.name));
  const allLangs = languages; // show all, including popular ones in the full grid

  const handleSelect = (lang) => {
    if (maxSelections === 1) {
      // Single select — replace
      onSelect([lang]);
    } else {
      // Multi-select — toggle
      const isSelected = selected.includes(lang);
      if (isSelected) {
        onSelect(selected.filter((s) => s !== lang));
      } else if (selected.length < maxSelections) {
        onSelect([...selected, lang]);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Most Popular Section */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Most Popular
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {popular.map((lang) => (
            <LanguageFlagCard
              key={`popular-${lang.name}`}
              language={lang.name}
              flag={lang.flag}
              selected={selected.includes(lang.name)}
              onClick={() => handleSelect(lang.name)}
            />
          ))}
        </div>
      </div>

      {/* All Languages Section */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          All Languages
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {allLangs.map((lang) => (
            <LanguageFlagCard
              key={`all-${lang.name}`}
              language={lang.name}
              flag={lang.flag}
              selected={selected.includes(lang.name)}
              onClick={() => handleSelect(lang.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageGrid;
