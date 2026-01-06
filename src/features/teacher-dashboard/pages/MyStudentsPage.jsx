import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTeacherProfile } from "@/hooks/useTeacherProfile";
import { useTeacherStudents } from "@/hooks/useTeacherStudents";
import { updateRelationshipStatus } from "@/services/vocabularyApi";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function MyStudentsPage() {
  const { profile } = useTeacherProfile();
  const {
    data: activeStudents,
    isLoading: activeLoading,
    refetch: refetchActive,
  } = useTeacherStudents("active");
  const {
    data: pendingRequests,
    isLoading: pendingLoading,
    refetch: refetchPending,
  } = useTeacherStudents("pending");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleUpdateStatus = async (relationshipId, status) => {
    try {
      await updateRelationshipStatus(relationshipId, status);
      toast({
        title: status === "active" ? "Request Approved" : "Request Rejected",
        description:
          status === "active"
            ? "Student added to your roster."
            : "Connection request rejected.",
      });
      // Refetch both lists
      refetchActive();
      refetchPending();
    } catch (error) {
      console.error("Failed to update status", error);
      toast({
        title: "Error",
        description: "Failed to update request status.",
        variant: "destructive",
      });
    }
  };

  const isLoading = activeLoading || pendingLoading;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-primary-dark">
            My Students
          </h1>
          <p className="text-gray-500 dark:text-secondary-dark mt-1">
            Manage your student roster and track their progress.
          </p>
        </div>
        <Button>Add Student</Button>
      </div>

      {/* Teacher ID Info */}
      {profile && (
        <Card className="bg-brand-blue-1/5 border-brand-blue-1/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-brand-blue-1">
                Your Teacher ID
              </p>
              <p className="text-2xl font-mono font-bold text-gray-900 dark:text-primary-dark">
                {profile.teacherId}
              </p>
              <p className="text-xs text-gray-500">
                Share this ID with students so they can link to you.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(profile.teacherId)}
            >
              Copy ID
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pending Requests */}
      {pendingRequests && pendingRequests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-primary-dark flex items-center">
            <div className="bg-orange-100 text-orange-600 p-1 rounded mr-2">
              <UserPlus className="h-5 w-5" />
            </div>
            Pending Requests
          </h2>
          <div className="grid gap-4">
            {pendingRequests.map((request) => (
              <Card
                key={request.id}
                className="border-orange-200 bg-orange-50/30"
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                      {(request.name || "S").charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {request.name || "Student"}
                      </h3>
                      <p className="text-xs text-gray-500">Requested to join</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                      onClick={() => handleUpdateStatus(request.id, "rejected")}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleUpdateStatus(request.id, "active")}
                    >
                      Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading students...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!activeStudents || activeStudents.length === 0) && (
        <div className="text-center py-12 bg-gray-50 dark:bg-card-dark rounded-lg border border-dashed border-gray-200 dark:border-subtle-dark">
          <p className="text-gray-500 dark:text-secondary-dark">
            No students connected yet.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Share your Teacher ID to get started.
          </p>
        </div>
      )}

      {/* Students List */}
      <h2 className="text-xl font-semibold">Active Students</h2>
      <div className="grid gap-4">
        {activeStudents?.map((student) => (
          <Card
            key={student.studentId}
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-brand-blue-1/10 text-brand-blue-1 flex items-center justify-center font-bold text-lg">
                  {/* Fallback initial since name might not be available yet */}
                  {(student.name || "S").charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-primary-dark">
                    {student.name || "Student"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-secondary-dark font-mono">
                    {student.studentId}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-secondary-dark uppercase tracking-wider">
                    Level
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-primary-dark">
                    {student.level || "N/A"}
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-500 dark:text-secondary-dark uppercase tracking-wider">
                    Joined
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-primary-dark">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
