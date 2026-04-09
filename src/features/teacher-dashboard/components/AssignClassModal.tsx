"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { useAuth } from "@clerk/nextjs";
import { getTaskOptions } from "@/services/assignmentsApi";
import { createClassAssignment } from "@/services/vocabularyApi";
import { useClasses } from "@/hooks/useClasses";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Calendar } from "lucide-react";

interface AssignClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AssignClassModal({ isOpen, onClose }: AssignClassModalProps) {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const { data: classes, isLoading: isLoadingClasses } = useClasses();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [taskOptions, setTaskOptions] = useState<Record<string, any[]>>({
    vocabulary: [],
    practice: [],
    grammar: [],
  });

  const [formData, setFormData] = useState({
    title: "",
    classId: "",
    type: "vocabulary",
    slug: "",
    dueDate: "",
  });

  // Load exercise options
  useEffect(() => {
    if (!isOpen) return;
    async function fetchOptions() {
      try {
        setIsLoadingOptions(true);
        const token = await getToken();
        const data = await getTaskOptions(token);
        setTaskOptions(data.categories);
        const firstSlug = data.categories.vocabulary?.[0]?.id || "";
        setFormData((prev) => ({ ...prev, slug: firstSlug }));
      } catch {
        toast({ title: "Error", description: "Failed to load exercise list.", variant: "destructive" });
      } finally {
        setIsLoadingOptions(false);
      }
    }
    fetchOptions();
  }, [isOpen, getToken]);

  // Pre-select first class when loaded
  useEffect(() => {
    if (classes?.length && !formData.classId) {
      setFormData((prev) => ({ ...prev, classId: classes[0].id }));
    }
  }, [classes]);

  const handleTypeChange = (value: string) => {
    const firstSlug = taskOptions[value]?.[0]?.id || "";
    setFormData((prev) => ({ ...prev, type: value, slug: firstSlug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.classId) return;

    const selectedClass = classes?.find((c: any) => c.id === formData.classId);
    if (!selectedClass?.studentIds?.length) {
      toast({ title: "Error", description: "This class has no students.", variant: "destructive" });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await getToken();
      await createClassAssignment(
        {
          studentIds: selectedClass.studentIds,
          type: formData.type,
          slug: formData.slug,
          title: formData.title,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        },
        formData.classId,
        token,
      );
      toast({
        title: "Class Assigned",
        description: `"${formData.title}" assigned to ${selectedClass.name} (${selectedClass.studentIds.length} students).`,
      });
      onClose();
    } catch {
      toast({ title: "Error", description: "Failed to assign task.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSlugs = taskOptions[formData.type] || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] bg-[#020617] text-white border-slate-800 shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black flex items-center gap-2">
            <div className="p-2 bg-sky-500/20 rounded-lg">
              <Users className="h-5 w-5 text-sky-400" />
            </div>
            Assign to Class
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Assign an exercise to all students in a class at once.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Assignment Title
            </Label>
            <Input
              placeholder="e.g., Week 3 Grammar Practice"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-slate-900 border-slate-800 text-white h-11 rounded-xl"
              required
            />
          </div>

          {/* Class */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Class
            </Label>
            <Select
              value={formData.classId}
              onValueChange={(v) => setFormData({ ...formData, classId: v })}
              disabled={isLoadingClasses || !classes?.length}
            >
              <SelectTrigger className="bg-slate-900 border-slate-800 text-white h-11 rounded-xl">
                {isLoadingClasses ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SelectValue placeholder={classes?.length ? "Select a class" : "No classes found"} />
                )}
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-white">
                {classes?.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.studentIds?.length || 0} students)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isLoadingClasses && !classes?.length && (
              <p className="text-xs text-amber-500">Create a class first in the Classes tab.</p>
            )}
          </div>

          {/* Category + Exercise */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Category
              </Label>
              <Select value={formData.type} onValueChange={handleTypeChange} disabled={isLoadingOptions}>
                <SelectTrigger className="bg-slate-900 border-slate-800 text-white h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                  <SelectItem value="vocabulary">Vocabulary</SelectItem>
                  <SelectItem value="grammar">Grammar</SelectItem>
                  <SelectItem value="practice">Practice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Exercise
              </Label>
              <Select
                value={formData.slug}
                onValueChange={(v) => setFormData({ ...formData, slug: v })}
                disabled={isLoadingOptions || !currentSlugs.length}
              >
                <SelectTrigger className="bg-slate-900 border-slate-800 text-white h-11 rounded-xl">
                  {isLoadingOptions ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SelectValue placeholder="Select" />
                  )}
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white max-h-60">
                  {currentSlugs.map((opt: any) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Due Date (Optional)
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="bg-slate-900 border-slate-800 text-white pl-10 h-11 rounded-xl [color-scheme:dark]"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 flex flex-row gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoadingOptions || !formData.slug || !formData.classId || !classes?.length}
              className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold h-11 rounded-xl shadow-lg shadow-sky-500/20"
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Assigning...</>
              ) : (
                "Assign to Class"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
