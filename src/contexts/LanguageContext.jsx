import React, { createContext, useContext, useState, useEffect } from "react";
import { useProfile } from "./ProfileContext";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const { activeProfile } = useProfile();

    // Default values
    const [learningLang, setLearningLang] = useState(
        localStorage.getItem("learning_lang") || "fr"
    );
    const [knownLang, setKnownLang] = useState(
        localStorage.getItem("known_lang") || "en"
    );

    // Sync with active profile if available
    useEffect(() => {
        if (activeProfile && activeProfile.language) {
            // Map common names to ISO codes if necessary, or use as is
            const code = activeProfile.language.toLowerCase().substring(0, 2);
            setLearningLang(code);
        }
    }, [activeProfile]);

    // Persistent storage
    useEffect(() => {
        localStorage.setItem("learning_lang", learningLang);
        localStorage.setItem("known_lang", knownLang);
    }, [learningLang, knownLang]);

    const value = {
        learningLang,
        setLearningLang,
        knownLang,
        setKnownLang,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
