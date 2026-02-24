import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight,
    ArrowLeft,
    Loader2,
    Sparkles,
    Target,
    BookOpen,
    Trophy,
    Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function TagTopicSelectionPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get("type");
    const nextTarget = searchParams.get("next");
    const levelFromUrl = searchParams.get("level") || "A1";

    const [loading, setLoading] = useState(true);
    const [tags, setTags] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!type) {
            navigate("/practice");
            return;
        }

        const fetchTags = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/api/tag-topics/possible?question_type=${type}&level=${levelFromUrl}`);
                if (!response.ok) throw new Error("Failed to fetch topics");
                const data = await response.json();
                setTags(data.tags || []);
            } catch (err) {
                console.error("Error fetching tags:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTags();
    }, [type, levelFromUrl, navigate]);

    const handleTopicSelect = (tag) => {
        // Navigate to the next page with the selected tag as a filter
        const url = new URL(nextTarget, window.location.origin);
        url.searchParams.set("tag", tag.slug);
        navigate(url.pathname + url.search);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-500 font-medium animate-pulse">Curating available topics...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="rounded-full bg-white dark:bg-slate-800 shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                            Choose your focus
                            <Sparkles className="h-6 w-6 text-amber-400" />
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Select a specific area of <span className="text-blue-600 dark:text-blue-400 font-semibold">{type.split('_').join(' ').toUpperCase()}</span> to practice.
                        </p>
                    </div>
                </div>

                {tags.length === 0 ? (
                    <Card className="p-12 text-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border-dashed border-2">
                        <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No specific topics found</h3>
                        <p className="text-slate-500 mt-2 mb-6">This exercise type covers a broad range of general skills.</p>
                        <Button onClick={() => navigate(nextTarget)} className="rounded-full px-8">
                            Proceed to General Practice
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence>
                            {tags.map((tag, index) => (
                                <motion.div
                                    key={tag.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Card
                                        onClick={() => handleTopicSelect(tag)}
                                        className="p-5 cursor-pointer bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all group overflow-hidden relative"
                                    >
                                        {/* Decorative background element */}
                                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Target className="h-24 w-24 rotate-12" />
                                        </div>

                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                                        {levelFromUrl}
                                                    </Badge>
                                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                        {tag.slug.split('/')[1] || 'General'}
                                                    </span>
                                                </div>

                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {tag.name_en}
                                                </h3>

                                                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                    <Zap className="h-3 w-3 text-amber-500" />
                                                    Master this topic to boost your level
                                                </p>
                                            </div>

                                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <ChevronRight className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Info Box */}
                <div className="mt-12 p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 flex gap-4 items-start">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl">
                        <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-900 dark:text-blue-100">Why choose a topic?</h4>
                        <p className="text-sm text-blue-700/70 dark:text-blue-300/60 mt-1 leading-relaxed">
                            Targeted practice helps you bridge specific knowledge gaps faster. Focused exercises are weighted higher in your proficiency score.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
