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
import { createClassAssignment } from "@/services/vocabularyApi";
import { useClasses } from "@/hooks/useClasses";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/contexts/ProfileContext";
import { Loader2, Calendar, ClipboardCheck } from "lucide-react";

interface GlobalAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseType: "vocabulary" | "grammar" | "practice" | string;
  exerciseSlug: string;
  exerciseTitle: string;
}

export function GlobalAssignModal({
  isOpen,
  onClose,
  exerciseType,
  exerciseSlug,
  exerciseTitle,
}: GlobalAssignModalProps) {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const { role } = useProfile();
  const { data: classes, isLoading: isLoadingClasses } = useClasses();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    classId: "",
    dueDate: "",
  });

  // Pre-fill title with exercise name
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        title: `Practice: ${exerciseTitle}`,
        classId: classes?.[0]?.id || "",
      }));
    }
  }, [isOpen, exerciseTitle, classes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (role?.toLowerCase() !== "teacher") {
      toast({ title: "Error", description: "Only teachers can assign tasks.", variant: "destructive" });
      return;
    }

    if (!formData.title || !formData.classId) {
       toast({ title: "Error", description: "Please select a class and provide a title.", variant: "destructive" });
       return;
    }

    const selectedClass = classes?.find((c: any) => c.id === formData.classId);
    if (!selectedClass || !selectedClass.studentIds?.length) {
      toast({ title: "Error", description: "This class has no students.", variant: "destructive" });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await getToken();

      const payload = {
        studentIds: selectedClass.studentIds,
        type: exerciseType,
        slug: exerciseSlug,
        title: formData.title,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      };

      await createClassAssignment(payload, formData.classId, token);

      toast({
        title: "Task Assigned",
        description: `Successfully assigned "${exerciseTitle}" to ${selectedClass.name}.`,
        variant: "default"
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

  const DialogHeaderAny = DialogHeader as any;
  const DialogTitleAny = DialogTitle as any;
  const DialogDescriptionAny = DialogDescription as any;
  const DialogFooterAny = DialogFooter as any;
  const DialogContentAny = DialogContent as any;
  const LabelAny = Label as any;
  const InputAny = Input as any;
  const SelectAny = Select as any;
  const SelectTriggerAny = SelectTrigger as any;
  const SelectContentAny = SelectContent as any;
  const SelectItemAny = SelectItem as any;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContentAny className="sm:max-w-[425px] bg-[#020617] text-white border-slate-800 shadow-2xl rounded-2xl">
        <DialogHeaderAny>
          <DialogTitleAny className="text-xl font-bold flex items-center gap-2">
            <div className="p-2 bg-sky-500/20 rounded-lg">
              <ClipboardCheck className="h-5 w-5 text-sky-400" />
            </div>
            Assign to Class
          </DialogTitleAny>
          <DialogDescriptionAny className="text-slate-400">
            Assign <span className="text-white font-medium">"{exerciseTitle}"</span> to your students.
          </DialogDescriptionAny>
        </DialogHeaderAny>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {/* Assignment Title */}
          <div className="space-y-2">
            <LabelAny htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Assignment Title
            </LabelAny>
            <InputAny
              id="title"
              placeholder="e.g., Weekend Practice"
              value={formData.title}
              onChange={(e: any) => setFormData({ ...formData, title: e.target.value })}
              className="bg-slate-900 border-slate-800 text-white focus:ring-sky-500 h-11 rounded-xl"
              required
            />
          </div>

          {/* Class Selection */}
          <div className="space-y-2">
            <LabelAny className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Select Class
            </LabelAny>
            <SelectAny
              value={formData.classId}
              onValueChange={(val: string) => setFormData({ ...formData, classId: val })}
              disabled={isLoadingClasses || !classes?.length}
            >
              <SelectTriggerAny className="bg-slate-900 border-slate-800 text-white h-11 rounded-xl">
                {isLoadingClasses ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SelectValue placeholder={classes?.length ? "Select a class" : "No classes found"} />
                )}
              </SelectTriggerAny>
              <SelectContentAny className="bg-slate-900 border-slate-700 text-white">
                {classes?.map((c: any) => (
                  <SelectItemAny key={c.id} value={c.id}>
                    {c.name} ({c.studentIds?.length || 0} students)
                  </SelectItemAny>
                ))}
              </SelectContentAny>
            </SelectAny>
            {!isLoadingClasses && !classes?.length && (
              <p className="text-xs text-amber-500">You need to create a class first.</p>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <LabelAny htmlFor="dueDate" className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Due Date (Optional)
            </LabelAny>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              <InputAny
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e: any) => setFormData({ ...formData, dueDate: e.target.value })}
                className="bg-slate-900 border-slate-800 text-white pl-10 h-11 rounded-xl [color-scheme:dark]"
              />
            </div>
          </div>

          <DialogFooterAny className="pt-4 flex flex-row gap-2 sm:gap-0">
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
              disabled={isSubmitting || isLoadingClasses || !formData.classId || !classes?.length}
              className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-sky-500/20 transition-all active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign Now"
              )}
            </Button>
          </DialogFooterAny>
        </form>
      </DialogContentAny>
    </Dialog>
  );
}
