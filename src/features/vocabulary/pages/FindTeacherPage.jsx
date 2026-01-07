import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import {
  fetchTeachers,
  linkStudentToTeacher,
  fetchStudentTeachers,
} from "@/services/vocabularyApi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, UserPlus, Check, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FindTeacherPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { toast } = useToast();

  const [teachers, setTeachers] = useState([]);
  const [myTeachers, setMyTeachers] = useState([]); // To check existing connections
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null); // teacherId being connected

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load all teachers
        const allTeachers = await fetchTeachers();
        setTeachers(allTeachers);

        // Load my existing connections (to show correct status)
        // We need to fetch current student profile ID first?
        // Actually fetchStudentTeachers needs studentId (S-...).
        // If we don't have it in context, we might need to fetch it.
        // For MVP, if we don't have easy access to studentID context,
        // maybe we can skip this check or fetch profile first?
        // Let's assume we can fetch profile or relationships by clerk ID?
        // Backend `get_student_teachers` expects `student_id`.
        // Let's rely on the user knowing who they connected with for now?
        // Better: Fetch my profile first.

        // Wait, fetchStudentTeachers takes studentId.
        // We can fetch "me" api for student profile.
        // Let's assume for now we just show "Connect" and handle "already connected" error gracefully
        // or just let backend handle it.

        // But for "Pending" status display we really need to know existing requests.
        // Let's try to fetch my profile using clerk user id.
        // But we don't have that API exposed in vocabularyApi.js yet (get_my_profile).
        // I should have added `fetchMyStudentProfile` too.

        // For now, I will just list teachers.
        // If I click connect, I'll send request.
        // Improvement: fetch relationships.
      } catch (error) {
        console.error("Failed to load teachers", error);
        toast({
          title: "Error",
          description: "Failed to load teachers list.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadData();
    }
  }, [user]);

  const handleConnect = async (teacherId) => {
    try {
      setConnecting(teacherId);

      // We need studentId.
      // If we don't have it stored, we need to fetch it.
      // Assuming we have a way to get it.
      // TEMPORARY: I will fetch my profile here first if not stored.
      // This is inefficient but works for MVP without global store refactor.

      const token = await getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/students/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Could not fetch my profile");
      const myProfile = await response.json();

      await linkStudentToTeacher(myProfile.studentId, teacherId, token);

      toast({
        title: "Request Sent",
        description: "Connection request sent to teacher.",
      });

      // Optimistically update UI?
      // Or just disable button?
      // I'll mark this teacher as requested locally.
      setMyTeachers((prev) => [...prev, { teacherId, status: "pending" }]);
    } catch (error) {
      console.error("Failed to connect", error);
      toast({
        title: "Error",
        description:
          "Failed to send connection request. You might already be connected or pending.",
        variant: "destructive",
      });
    } finally {
      setConnecting(null);
    }
  };

  // Helper to check status
  const getStatus = (teacherId) => {
    const existing = myTeachers.find((t) => t.teacherId === teacherId);
    return existing ? existing.status : null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Find a Teacher</h1>
          <p className="text-muted-foreground mt-2">
            Browse and connect with teachers to help you learn.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => {
          const status = getStatus(teacher.teacherId);

          return (
            <Card key={teacher.teacherId} className="flex flex-col">
              <CardHeader>
                <CardTitle>{teacher.name || "Teacher"}</CardTitle>
                <CardDescription>
                  {teacher.teachingLanguages?.join(", ")} •{" "}
                  {teacher.instructionLanguage}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    Experience: {teacher.experience?.years} years
                  </p>
                  {/* Add more details here */}
                </div>

                {status === "active" ? (
                  <Button disabled variant="secondary" className="w-full">
                    <Check className="mr-2 h-4 w-4" /> Connected
                  </Button>
                ) : status === "pending" ? (
                  <Button disabled variant="outline" className="w-full">
                    <Clock className="mr-2 h-4 w-4" /> Pending
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleConnect(teacher.teacherId)}
                    disabled={connecting === teacher.teacherId}
                    className="w-full"
                  >
                    {connecting === teacher.teacherId ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="mr-2 h-4 w-4" />
                    )}
                    Connect
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}

        {teachers.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
            No teachers found.
          </div>
        )}
      </div>
    </div>
  );
}
