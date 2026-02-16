import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

const MOCK_ASSIGNMENTS = [
  {
    id: 1,
    title: "Past Tense Verbs Practice",
    description: "Complete the exercises on irregular verbs in the past tense.",
    dueDate: "2026-02-20",
    assignedBy: "Mr. Thompson",
    status: "pending",
    type: "grammar",
  },
  {
    id: 2,
    title: "French Revolution Vocabulary",
    description: "Learn the core vocabulary related to the history lesson.",
    dueDate: "2026-02-18",
    assignedBy: "Ms. Dubois",
    status: "overdue",
    type: "vocabulary",
  },
  {
    id: 3,
    title: "Conversation: Ordering Coffee",
    description: "Record yourself ordering a coffee in French.",
    dueDate: "2026-02-15",
    assignedBy: "Mr. Thompson",
    status: "completed",
    type: "speaking",
  },
  {
    id: 4,
    title: "Essay: My Summer Vacation",
    description: "Write a 200-word essay about your last summer trip.",
    dueDate: "2026-02-25",
    assignedBy: "Ms. Dubois",
    status: "pending",
    type: "writing",
  },
];

export default function AssignmentsPage() {
  const [filter, setFilter] = useState("all");

  const filteredAssignments = MOCK_ASSIGNMENTS.filter((assignment) => {
    if (filter === "all") return true;
    return assignment.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "overdue":
        return "text-red-600 bg-red-50 border-red-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="w-4 h-4" />;
      case "overdue":
        return <ExclamationCircleIcon className="w-4 h-4" />;
      case "pending":
        return <ClockIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-primary-dark">
            Assignments
          </h1>
          <p className="text-gray-500 dark:text-secondary-dark">
            Track your homework and tasks assigned by your teachers.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex p-1 bg-gray-100 dark:bg-card-dark rounded-lg">
          {["all", "pending", "completed", "overdue"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-all ${
                filter === status
                  ? "bg-white dark:bg-elevated-2 text-brand-blue-1 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:text-secondary-dark dark:hover:text-primary-dark"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment) => (
            <Card
              key={assignment.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-brand-blue-1/10 text-brand-blue-1 rounded-lg mt-1">
                      <BookOpenIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-primary-dark">
                        {assignment.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-secondary-dark mb-2">
                        {assignment.description}
                      </p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center gap-1 text-gray-500">
                          <span className="font-medium">Due:</span>{" "}
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <span className="font-medium">Teacher:</span>{" "}
                          {assignment.assignedBy}
                        </span>
                        <span className="uppercase text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                          {assignment.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        assignment.status,
                      )}`}
                    >
                      {getStatusIcon(assignment.status)}
                      <span className="capitalize">{assignment.status}</span>
                    </div>
                    <Button size="sm" className="ml-auto md:ml-0">
                      View Task
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-card-dark rounded-lg border border-dashed border-gray-200 dark:border-subtle-dark">
            <BookOpenIcon className="w-12 h-12 mx-auto text-gray-300" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-primary-dark">
              No assignments found
            </h3>
            <p className="text-gray-500 dark:text-secondary-dark mt-1">
              You don't have any {filter !== "all" ? filter : ""} assignments
              right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
