import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCheckbox } from "@/components/ui/checkbox"; // Assuming standard Shadcn checkbox if available, else standard input
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

const MOCK_ASSIGNMENTS = [
  {
    id: 1,
    title: "Past Tense Worksheet",
    class: "Beginner French",
    due: "Today",
    status: "pending",
    submissions: "12/15",
  },
  {
    id: 2,
    title: "Business Email Draft",
    class: "Intermediate Business",
    due: "Tomorrow",
    status: "pending",
    submissions: "5/8",
  },
  {
    id: 3,
    title: "Vocabulary Quiz 4",
    class: "IELTS Prep",
    due: "Feb 15",
    status: "completed",
    submissions: "8/8",
  },
  {
    id: 4,
    title: "Essay: Climate Change",
    class: "IELTS Prep",
    due: "Feb 10",
    status: "overdue",
    submissions: "6/8",
  },
];

export default function AssignmentsPage() {
  const [filter, setFilter] = useState("all");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-primary-dark">
            Assignments
          </h1>
          <p className="text-gray-500 dark:text-secondary-dark">
            Track and grade student submissions.
          </p>
        </div>
        <Button>
          <ClipboardDocumentCheckIcon className="w-4 h-4 mr-2" /> New Assignment
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4">
        {MOCK_ASSIGNMENTS.map((assign) => (
          <Card
            key={assign.id}
            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
          >
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className={`p-2 rounded-full hidden sm:block ${
                    assign.status === "completed"
                      ? "bg-green-100 text-green-600"
                      : assign.status === "overdue"
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <ClipboardDocumentCheckIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-primary-dark">
                    {assign.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span>{assign.class}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" /> Due: {assign.due}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {assign.submissions} Submitted
                  </p>
                  <p className="text-xs text-gray-500">
                    {assign.status === "completed"
                      ? "Grading Complete"
                      : "Grading In Progress"}
                  </p>
                </div>
                <Button
                  variant={
                    assign.status === "completed" ? "secondary" : "default"
                  }
                  size="sm"
                >
                  {assign.status === "completed" ? (
                    <>
                      <CheckCircleIcon className="w-4 h-4 mr-2" /> Done
                    </>
                  ) : (
                    "Mark as Done"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
