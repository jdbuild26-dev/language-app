import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import questionnaireData from "../constants/teacherQuestionnaire.json";
import { createTeacherProfile } from "@/services/userApi";
import { useProfile } from "@/contexts/ProfileContext";
import toast from "react-hot-toast";

const QUESTIONS_PER_PAGE = 5;

export default function TeacherOnboardingPage() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { refreshProfiles } = useProfile();

    // Get language from query param or default to French
    const language = searchParams.get("lang") || "French";

    const [name, setName] = useState(user.fullName || "");
    const [experience, setExperience] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleNext = () => {
        handleSubmit();
    };

    const handleSubmit = async () => {
        if (!name || !experience) {
            toast.error("Please fill in all fields.");
            return;
        }
        try {
            setIsSubmitting(true);
            const token = await getToken();

            const profileData = {
                clerkUserId: user.id,
                name: name,
                primaryLanguage: language,
                teachingLanguages: [language],
                instructionLanguage: "English",
                experience: {
                    years: parseInt(experience) || 0,
                    studentsTaught: 0,
                    hoursTaught: 0
                },
                questionnaireResponses: {} // To be filled later
            };

            await createTeacherProfile(profileData, token);
            await refreshProfiles();

            toast.success("Teacher profile created! Welcome aboard.");
            navigate("/teacher-dashboard");
        } catch (error) {
            console.error("Failed to create teacher profile:", error);
            toast.error("Failed to create profile. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-extrabold text-white mb-2">
                        Teacher Onboarding
                    </h1>
                    <p className="text-slate-400">
                        Help us get to know you as a <span className="text-blue-400 font-bold">{language}</span> teacher.
                    </p>
                </div>

                <Card className="bg-slate-900 border-slate-800 shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-xl text-slate-100">
                            Basic Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-200">Full Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-slate-800/50 border-slate-700 text-white"
                                placeholder="Your full name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="experience" className="text-slate-200">How many years of teaching experience do you have?</Label>
                            <Input
                                id="experience"
                                type="number"
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                                className="bg-slate-800/50 border-slate-700 text-white"
                                placeholder="e.g. 5"
                            />
                        </div>
                        <p className="text-xs text-slate-500 italic">
                            * You will be able to complete your full profile and application questionnaire from your dashboard overview.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button
                            onClick={handleNext}
                            disabled={isSubmitting || !name || !experience}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20"
                        >
                            {isSubmitting ? "Creating Profile..." : "Finish Onboarding"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

// Helper function for classNames
function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}
