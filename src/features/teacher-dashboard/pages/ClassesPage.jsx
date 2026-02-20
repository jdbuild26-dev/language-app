import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UsersIcon,
  VideoCameraIcon,
  ClockIcon,
  EllipsisHorizontalIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

import { useState } from "react";
import { useClasses } from "@/hooks/useClasses";
import { useTeacherStudents } from "@/hooks/useTeacherStudents";
import { createClass, deleteClass } from "@/services/vocabularyApi";
import { useAuth } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BookPlusIcon, Trash2Icon } from "lucide-react";
import { AssignClassTaskModal } from "../components/AssignClassTaskModal";

export default function ClassesPage() {
  const { data: classes, isLoading, error } = useClasses();
  const { data: activeStudents } = useTeacherStudents("active");
  const { getToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    name: "",
    description: "",
    studentIds: [],
  });
  const [isCreating, setIsCreating] = useState(false);

  const [assignModal, setAssignModal] = useState({
    isOpen: false,
    classId: null,
    classNameLabel: "",
    studentIds: [],
  });

  const handleCreateClass = async () => {
    if (!newClass.name.trim()) {
      toast({
        title: "Error",
        description: "Class name is required.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const token = await getToken();
      await createClass(newClass, token);

      toast({ title: "Success", description: "Class created successfully." });
      setIsCreateModalOpen(false);
      setNewClass({ name: "", description: "", studentIds: [] });
      queryClient.invalidateQueries(["classes"]);
    } catch (error) {
      console.error("Failed to create class:", error);
      toast({
        title: "Error",
        description: "Failed to create class.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!confirm("Are you sure you want to delete this class?")) return;

    try {
      const token = await getToken();
      await deleteClass(classId, token);

      toast({ title: "Success", description: "Class deleted successfully." });
      queryClient.invalidateQueries(["classes"]);
    } catch (error) {
      console.error("Failed to delete class:", error);
      toast({
        title: "Error",
        description: "Failed to delete class.",
        variant: "destructive",
      });
    }
  };

  const toggleStudentSelection = (studentId) => {
    setNewClass((prev) => ({
      ...prev,
      studentIds: prev.studentIds.includes(studentId)
        ? prev.studentIds.filter((id) => id !== studentId)
        : [...prev.studentIds, studentId],
    }));
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-500">Loading classes...</div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500">Failed to load classes</div>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-primary-dark">
            My Classes
          </h1>
          <p className="text-gray-500 dark:text-secondary-dark">
            Group your students into classes.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon className="w-4 h-4 mr-2" /> Create Class
        </Button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {classes?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded border border-dashed border-gray-200">
            No classes created yet. Click "Create Class" to get started.
          </div>
        ) : (
          classes?.map((cls) => (
            <Card
              key={cls.id}
              className="hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">
                  {cls.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleDeleteClass(cls.id)}
                >
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {cls.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {cls.description}
                  </p>
                )}
                <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <UsersIcon className="w-4 h-4" />
                    {cls.studentIds?.length || 0} Students Enrolled
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t dark:border-gray-700 flex flex-col gap-2">
                  <Button
                    size="sm"
                    className="w-full gap-2 bg-brand-blue-1 text-white hover:bg-brand-blue-1/90"
                    onClick={() => {
                      setAssignModal({
                        isOpen: true,
                        classId: cls.id,
                        classNameLabel: cls.name,
                        studentIds: cls.studentIds || [],
                      });
                    }}
                  >
                    <BookPlusIcon className="w-4 h-4" />
                    Assign Task
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
            <DialogDescription>
              Group your students together to quickly assign them tasks.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newClass.name}
                onChange={(e) =>
                  setNewClass({ ...newClass, name: e.target.value })
                }
                className="col-span-3"
                placeholder="e.g. Intensive French B2"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="desc" className="text-right">
                Description
              </Label>
              <Textarea
                id="desc"
                value={newClass.description}
                onChange={(e) =>
                  setNewClass({ ...newClass, description: e.target.value })
                }
                className="col-span-3"
                placeholder="Optional description"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4 mt-2">
              <Label className="text-right pt-2">Students</Label>
              <div className="col-span-3 border rounded-md p-2 h-40 overflow-y-auto bg-gray-50">
                {activeStudents?.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No active students to add.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {activeStudents?.map((student) => (
                      <label
                        key={student.studentId}
                        className="flex items-center space-x-2 p-1 hover:bg-white rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={newClass.studentIds.includes(
                            student.studentId,
                          )}
                          onChange={() =>
                            toggleStudentSelection(student.studentId)
                          }
                          className="rounded border-gray-300 text-brand-blue-1 focus:ring-brand-blue-1"
                        />
                        <span className="text-sm">
                          {student.name || student.studentId}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateClass}
              disabled={isCreating || !newClass.name.trim()}
            >
              {isCreating ? "Creating..." : "Create Class"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AssignClassTaskModal
        isOpen={assignModal.isOpen}
        onClose={() => setAssignModal({ ...assignModal, isOpen: false })}
        classId={assignModal.classId}
        classNameLabel={assignModal.classNameLabel}
        studentIds={assignModal.studentIds}
      />
    </div>
  );
}
