import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { checkOnboardingStatus } from "../services/userApi";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
    const { isLoaded, user } = useUser();
    const { getToken } = useAuth();

    const [profiles, setProfiles] = useState([]);
    const [activeProfile, setActiveProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshProfiles = useCallback(async () => {
        if (!user) {
            setProfiles([]);
            setActiveProfile(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const token = await getToken();
            const status = await checkOnboardingStatus(token);

            if (status.isComplete && status.profiles) {
                setProfiles(status.profiles);

                // Try to restore from localStorage
                const savedProfileId = localStorage.getItem("active_profile_id");
                const restored = status.profiles.find(p => p.id === savedProfileId);

                if (restored) {
                    setActiveProfile(restored);
                } else {
                    // Default to first profile
                    setActiveProfile(status.profiles[0]);
                }
            } else {
                setProfiles([]);
                setActiveProfile(null);
            }
        } catch (error) {
            console.error("Error fetching profiles:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user, getToken]);

    useEffect(() => {
        if (isLoaded) {
            refreshProfiles();
        }
    }, [isLoaded, user, refreshProfiles]);

    const switchProfile = (profile) => {
        setActiveProfile(profile);
        localStorage.setItem("active_profile_id", profile.id);

        // Also update legacy language context if needed
        const lang = profile.language || profile.primaryLanguage;
        if (lang) {
            localStorage.setItem("learning_lang", lang.toLowerCase().substring(0, 2));
        }
    };

    const value = {
        profiles,
        activeProfile,
        isLoading,
        switchProfile,
        refreshProfiles,
        role: activeProfile?.role || null,
        language: activeProfile?.language || null,
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfile must be used within a ProfileProvider");
    }
    return context;
};
