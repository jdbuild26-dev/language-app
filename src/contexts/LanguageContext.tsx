"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useProfile } from "@/contexts/ProfileContext";

interface LanguageContextType {
    learningLang: string;
    setLearningLang: (lang: string) => void;
    knownLang: string;
    setKnownLang: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const { activeProfile } = useProfile();

    // Default values
    const [learningLang, setLearningLang] = useState("fr");
    const [knownLang, setKnownLang] = useState("en");

    // Hydrate from localStorage on client
    useEffect(() => {
        const stored = localStorage.getItem("learning_lang");
        if (stored) setLearningLang(stored);
        const storedKnown = localStorage.getItem("known_lang");
        if (storedKnown) setKnownLang(storedKnown);
    }, []);

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
