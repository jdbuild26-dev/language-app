"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useProfile } from "@/contexts/ProfileContext";

interface LanguageContextType {
    languagesReady: boolean;
    learningLang: string;
    setLearningLang: (lang: string) => void;
    knownLang: string;
    setKnownLang: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_CODES: Record<string, string> = {
    en: "en",
    english: "en",
    fr: "fr",
    french: "fr",
    français: "fr",
    francais: "fr",
    es: "es",
    spanish: "es",
    español: "es",
    espanol: "es",
    de: "de",
    german: "de",
    deutsch: "de",
};

function languageCode(value: unknown, fallback: string): string {
    if (typeof value !== "string") return fallback;
    return LANGUAGE_CODES[value.trim().toLowerCase()] || fallback;
}

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const { activeProfile, isLoading: profileLoading } = useProfile();
    const [hasHydrated, setHasHydrated] = useState(false);
    const [appliedProfile, setAppliedProfile] = useState<unknown>(null);

    // Default values
    const [learningLang, setLearningLang] = useState("fr");
    const [knownLang, setKnownLang] = useState("en");

    // Hydrate from localStorage on client
    useEffect(() => {
        const stored = localStorage.getItem("learning_lang");
        if (stored) setLearningLang(stored);
        const storedKnown = localStorage.getItem("known_lang");
        if (storedKnown) setKnownLang(storedKnown);
        setHasHydrated(true);
    }, []);

    // The active profile is authoritative. Older profiles may not have a
    // support-language field, so English remains the compatibility default.
    useEffect(() => {
        if (!activeProfile) {
            setAppliedProfile(null);
            return;
        }

        const profile = activeProfile as Record<string, any>;
        const questionnaire = profile.questionnaireResponses || {};
        const savedLearningLanguage =
            profile.language || profile.primaryLanguage || profile.targetLanguage;
        const savedSupportLanguage =
            profile.instructionLanguage ||
            profile.translationLanguage ||
            questionnaire.instructionLanguage ||
            questionnaire.translationLanguage;

        setLearningLang(languageCode(savedLearningLanguage, "fr"));
        setKnownLang(languageCode(savedSupportLanguage, "en"));
        setAppliedProfile(activeProfile);
    }, [activeProfile]);

    const languagesReady = hasHydrated && !profileLoading && appliedProfile === activeProfile;

    // Persistent storage
    useEffect(() => {
        if (!languagesReady) return;
        localStorage.setItem("learning_lang", learningLang);
        localStorage.setItem("known_lang", knownLang);
    }, [languagesReady, learningLang, knownLang]);

    const value = {
        languagesReady,
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
