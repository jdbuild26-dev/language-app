import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPublicProfile } from "@/services/userApi";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Loader2,
    Trophy,
    Flame,
    BookOpen,
    Globe,
    ArrowLeft,
    Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export default function PublicProfilePage() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadProfile() {
            try {
                setLoading(true);
                const data = await getPublicProfile(username);
                setProfile(data);
            } catch (err) {
                console.error("Error loading public profile:", err);
                setError(err.message || "Profile not found or private.");
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, [username]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
                <Loader2 className="h-8 w-8 animate-spin text-brand-blue-1" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-bg p-4 text-center">
                <div className="bg-white dark:bg-card-dark p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 dark:border-subtle-dark">
                    <div className="h-16 w-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Globe className="h-8 w-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-primary-dark mb-2">Profile Not Found</h1>
                    <p className="text-gray-500 dark:text-secondary-dark mb-6">
                        The profile you are looking for is either private or does not exist.
                    </p>
                    <Button
                        onClick={() => navigate("/")}
                        className="w-full bg-brand-blue-1 hover:bg-brand-blue-2"
                    >
                        Go Back Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Navigation */}
                <div className="flex justify-between items-center">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="text-slate-400 hover:text-brand-blue-1 hover:bg-slate-800/50"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleShare}
                        className="border-brand-blue-1/20 text-brand-blue-1 hover:bg-brand-blue-1/10"
                    >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Profile
                    </Button>
                </div>

                {/* Hero Section */}
                <div className="relative bg-[#0f172a] rounded-3xl p-8 shadow-2xl border border-slate-800 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-blue-1 to-transparent opacity-50" />

                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative">
                            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-brand-blue-1 to-brand-purple-1 p-1 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                                <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center text-4xl font-bold text-brand-blue-1">
                                    {profile.name?.charAt(0) || "U"}
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-brand-yellow-2 text-white p-2 rounded-full shadow-lg">
                                <Trophy className="h-5 w-5" />
                            </div>
                        </div>

                        <div className="text-center md:text-left space-y-2">
                            <h1 className="text-4xl font-black text-white tracking-tight">
                                {profile.name}
                            </h1>
                            <p className="text-brand-blue-1 font-semibold text-lg">
                                @{profile.username}
                            </p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                                <span className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-bold border border-blue-500/20">
                                    {profile.targetLanguage || "French"} Learner
                                </span>
                                <span className="px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-sm font-bold border border-purple-500/20">
                                    Level {profile.stats?.level || "A1"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatsCard
                        icon={<Flame className="h-6 w-6 text-orange-500" />}
                        label="Day Streak"
                        value={profile.stats?.streak || 0}
                        color="orange"
                    />
                    <StatsCard
                        icon={<Trophy className="h-6 w-6 text-yellow-500" />}
                        label="Total Points"
                        value={profile.stats?.totalPoints?.toLocaleString() || 0}
                        color="yellow"
                    />
                    <StatsCard
                        icon={<BookOpen className="h-6 w-6 text-blue-500" />}
                        label="Completed Tasks"
                        value={profile.stats?.completedExercises || 0}
                        color="blue"
                    />
                </div>

                {/* Level Progress */}
                <Card className="border-slate-800 shadow-xl bg-[#0f172a] overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-white">Current Milestone</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm text-slate-400">Proficiency Level</p>
                                <h3 className="text-2xl font-black text-white">Level {profile.stats?.level || "A1"}</h3>
                            </div>
                            <p className="text-brand-blue-1 font-bold">In Progress</p>
                        </div>
                        <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                            <div
                                className="h-full bg-gradient-to-r from-brand-blue-1 to-brand-purple-1 rounded-full w-[65%] transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                            />
                        </div>
                        <p className="text-xs text-center text-slate-500">Keep practicing to reach Level {getNextLevel(profile.stats?.level || "A1")}!</p>
                    </CardContent>
                </Card>

                {/* Achievement Badges */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white px-2">Achievements</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(idx => (
                            <div key={idx} className="bg-slate-900/50 p-6 rounded-2xl flex flex-col items-center gap-3 border border-slate-800/50 opacity-30 grayscale">
                                <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center">
                                    <Sparkles className="h-6 w-6 text-slate-600" />
                                </div>
                                <div className="h-2 w-16 bg-slate-800 rounded" />
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-sm text-slate-500 italic">More achievements coming soon...</p>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ icon, label, value, color }) {
    const colorMap = {
        orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
        yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    };

    return (
        <div className="bg-[#0f172a] p-6 rounded-2xl shadow-lg border border-slate-800 hover:border-brand-blue-1/50 transition-all duration-300 group">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl border ${colorMap[color]} group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{label}</p>
                    <p className="text-2xl font-black text-white">{value}</p>
                </div>
            </div>
        </div>
    );
}

function getNextLevel(current) {
    const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const idx = levels.indexOf(current);
    return idx < levels.length - 1 ? levels[idx + 1] : "Expert";
}

function Sparkles({ className }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
    );
}
