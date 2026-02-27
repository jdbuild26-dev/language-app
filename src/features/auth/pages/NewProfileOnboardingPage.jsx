import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AcademicCapIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const LANGUAGES = [
    { id: "french", name: "French", flag: "🇫🇷" },
    { id: "german", name: "German", flag: "🇩🇪" },
    { id: "spanish", name: "Spanish", flag: "🇪🇸" },
    { id: "italian", name: "Italian", flag: "🇮🇹" },
    { id: "portuguese", name: "Portuguese", flag: "🇵🇹" }
];

export default function NewProfileOnboardingPage() {
    const { user } = useUser();
    const navigate = useNavigate();
    const [selectedLang, setSelectedLang] = useState("");
    const [selectedRole, setSelectedRole] = useState("student");

    const handleProceed = () => {
        if (!selectedLang) {
            toast.error("Please select a language first.");
            return;
        }

        const langName = LANGUAGES.find(l => l.id === selectedLang)?.name;

        if (selectedRole === "teacher") {
            navigate(`/onboarding/teacher?lang=${langName}`);
        } else {
            navigate(`/onboarding/student?lang=${langName}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
                        Start a New Journey
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Select your target language and role to get started.
                        Each language has its own dedicated profile and progress.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Language Selection */}
                    <div className="md:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/20 text-blue-400 text-xs border border-blue-600/30">1</span>
                            Pick a Language
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.id}
                                    onClick={() => setSelectedLang(lang.id)}
                                    className={cn(
                                        "relative group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300",
                                        selectedLang === lang.id
                                            ? "bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.15)]"
                                            : "bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
                                    )}
                                >
                                    <span className="text-4xl group-hover:scale-110 transition-transform">{lang.flag}</span>
                                    <span className={cn(
                                        "font-bold text-sm uppercase tracking-wide",
                                        selectedLang === lang.id ? "text-blue-400" : "text-slate-400"
                                    )}>
                                        {lang.name}
                                    </span>
                                    {selectedLang === lang.id && (
                                        <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1 shadow-lg animate-in zoom-in">
                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/20 text-blue-400 text-xs border border-blue-600/30">2</span>
                            Choose Your Role
                        </h2>
                        <RadioGroup
                            value={selectedRole}
                            onValueChange={setSelectedRole}
                            className="space-y-4"
                        >
                            <div className="relative">
                                <RadioGroupItem value="student" id="role-student" className="sr-only" />
                                <Label
                                    htmlFor="role-student"
                                    className={cn(
                                        "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300",
                                        selectedRole === "student"
                                            ? "bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20"
                                            : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                                    )}
                                >
                                    <UserCircleIcon className="h-8 w-8" />
                                    <div className="text-center">
                                        <p className="font-bold">Student</p>
                                        <p className="text-[10px] opacity-70 uppercase tracking-tighter">I want to learn</p>
                                    </div>
                                </Label>
                            </div>
                            <div className="relative">
                                <RadioGroupItem value="teacher" id="role-teacher" className="sr-only" />
                                <Label
                                    htmlFor="role-teacher"
                                    className={cn(
                                        "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300",
                                        selectedRole === "teacher"
                                            ? "bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-600/20"
                                            : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                                    )}
                                >
                                    <AcademicCapIcon className="h-8 w-8" />
                                    <div className="text-center">
                                        <p className="font-bold">Teacher</p>
                                        <p className="text-[10px] opacity-70 uppercase tracking-tighter">I want to teach</p>
                                    </div>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>

                <div className="mt-16 flex flex-col items-center gap-6">
                    <Button
                        size="lg"
                        onClick={handleProceed}
                        disabled={!selectedLang}
                        className={cn(
                            "w-full max-w-sm h-14 rounded-full font-extrabold text-lg shadow-2xl transition-all active:scale-95",
                            selectedLang
                                ? "bg-white text-slate-900 hover:bg-slate-100"
                                : "bg-slate-800 text-slate-500 cursor-not-allowed"
                        )}
                    >
                        Create My {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Profile
                    </Button>
                    <p className="text-slate-500 text-xs italic">
                        * Creating a new profile may require verification or payment (coming soon).
                    </p>
                </div>
            </div>
        </div>
    );
}
