import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@clerk/clerk-react";
import { createAssignments, getTaskOptions } from "@/services/assignmentsApi";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search } from "lucide-react";

export function AssignTaskModal({ isOpen, onClose, studentId, studentName }) {
    const { getToken } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingOptions, setIsLoadingOptions] = useState(true);
    const [taskOptions, setTaskOptions] = useState({
        vocabulary: [],
        practice: [],
        grammar: []
    });

    const [formData, setFormData] = useState({
        title: "",
        type: "vocabulary",
        slug: "",
        dueDate: "",
    });

    useEffect(() => {
        if (!isOpen) return;

        async function fetchOptions() {
            try {
                setIsLoadingOptions(true);
                const token = await getToken();
                const data = await getTaskOptions(token);
                setTaskOptions(data.categories);

                // Set default slug based on what's available
                if (data.categories.vocabulary?.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        slug: data.categories.vocabulary[0].id
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch task options:", error);
                toast({
                    title: "Error",
                    description: "Failed to load exercise list.",
                    variant: "destructive",
                });
            } finally {
                setIsLoadingOptions(false);
            }
        }

        fetchOptions();
    }, [isOpen, getToken]);

    const handleTypeChange = (value) => {
        const firstSlug = taskOptions[value]?.[0]?.id || "";
        setFormData({
            ...formData,
            type: value,
            slug: firstSlug,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.slug) return;

        try {
            setIsSubmitting(true);
            const token = await getToken();

            const payload = {
                studentIds: [studentId],
                type: formData.type,
                slug: formData.slug,
                title: formData.title,
                dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
            };

            await createAssignments(payload, token);

            toast({
                title: "Task Assigned",
                description: `Successfully assigned "${formData.title}" to ${studentName}.`,
            });
            onClose();
        } catch (error) {
            console.error("Assignment error:", error);
            toast({
                title: "Error",
                description: "Failed to assign task. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentSlugs = taskOptions[formData.type] || [];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-[#020617] text-white border-slate-800 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                        <div className="p-2 bg-brand-blue-1/20 rounded-lg">
                            <Search className="h-5 w-5 text-brand-blue-1" />
                        </div>
                        Assign Task to {studentName}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                            Task Title
                        </Label>
                        <Input
                            id="title"
                            placeholder="e.g., Week 1 Vocabulary Practice"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="bg-slate-900 border-slate-800 text-white focus:ring-brand-blue-1 focus:border-brand-blue-1 h-11"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                Category
                            </Label>
                            <Select
                                value={formData.type}
                                onValueChange={handleTypeChange}
                                disabled={isLoadingOptions}
                            >
                                <SelectTrigger className="bg-slate-900 border-slate-800 text-white h-11">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800 text-white border-slate-700">
                                    <SelectItem value="vocabulary">Vocabulary</SelectItem>
                                    <SelectItem value="grammar">Grammar</SelectItem>
                                    <SelectItem value="practice">Practice</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                Exercise
                            </Label>
                            <Select
                                value={formData.slug}
                                onValueChange={(value) => setFormData({ ...formData, slug: value })}
                                disabled={isLoadingOptions || currentSlugs.length === 0}
                            >
                                <SelectTrigger className="bg-slate-900 border-slate-800 text-white h-11">
                                    {isLoadingOptions ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <SelectValue placeholder="Select Exercise" />
                                    )}
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800 text-white border-slate-700 max-h-60">
                                    {currentSlugs.map((opt) => (
                                        <SelectItem key={opt.id} value={opt.id}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                    {currentSlugs.length === 0 && !isLoadingOptions && (
                                        <div className="p-2 text-xs text-slate-500 text-center">No options avail.</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dueDate" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                            Due Date (Optional)
                        </Label>
                        <Input
                            id="dueDate"
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className="bg-slate-900 border-slate-800 text-white h-11 [color-scheme:dark]"
                        />
                    </div>

                    <DialogFooter className="pt-4 gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="text-slate-400 hover:text-white hover:bg-slate-800/50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || isLoadingOptions || !formData.slug}
                            className="bg-brand-blue-1 hover:bg-brand-blue-2 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-brand-blue-1/20 transition-all active:scale-95"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Assigning...
                                </>
                            ) : (
                                "Assign to Student"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
