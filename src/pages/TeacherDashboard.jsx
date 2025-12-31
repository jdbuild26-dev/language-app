import { useState } from "react";
import {
  UserGroupIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MOCK_STUDENTS = [
  {
    id: "S-102934",
    name: "Alice Johnson",
    email: "alice@example.com",
    level: "A1",
    language: "French",
    joined: "2024-01-15",
  },
  {
    id: "S-102935",
    name: "Bob Smith",
    email: "bob@example.com",
    level: "A2",
    language: "French",
    joined: "2024-02-01",
  },
  {
    id: "S-102936",
    name: "Charlie Brown",
    email: "charlie@example.com",
    level: "B1",
    language: "French",
    joined: "2024-03-10",
  },
];

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("students");

  const renderContent = () => {
    switch (activeTab) {
      case "students":
        return <StudentList />;
      case "groups":
        return <Placeholder title="Groups / Classrooms" />;
      case "tasks":
        return <Placeholder title="Task Assignments" />;
      case "schedule":
        return <Placeholder title="Schedule" />;
      default:
        return <StudentList />;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-body-dark">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-card-dark border-r border-gray-200 dark:border-subtle-dark hidden md:block">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-primary-dark flex items-center gap-2">
            <AcademicCapIcon className="h-6 w-6 text-brand-blue-1" />
            Teacher Ops
          </h2>
        </div>
        <nav className="px-4 space-y-1">
          <NavItem
            icon={UserGroupIcon}
            label="Students"
            isActive={activeTab === "students"}
            onClick={() => setActiveTab("students")}
          />
          <NavItem
            icon={AcademicCapIcon}
            label="Groups"
            isActive={activeTab === "groups"}
            onClick={() => setActiveTab("groups")}
          />
          <NavItem
            icon={ClipboardDocumentCheckIcon}
            label="Tasks"
            isActive={activeTab === "tasks"}
            onClick={() => setActiveTab("tasks")}
          />
          <NavItem
            icon={CalendarIcon}
            label="Schedule"
            isActive={activeTab === "schedule"}
            onClick={() => setActiveTab("schedule")}
          />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? "bg-brand-blue-1/10 text-brand-blue-1"
          : "text-gray-600 dark:text-secondary-dark hover:bg-gray-100 dark:hover:bg-elevated-2"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}

function StudentList() {
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

      <div className="grid gap-4">
        {MOCK_STUDENTS.map((student) => (
          <Card key={student.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-brand-blue-1/10 text-brand-blue-1 flex items-center justify-center font-bold text-lg">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-primary-dark">
                    {student.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-secondary-dark font-mono">
                    {student.id}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-secondary-dark uppercase tracking-wider">
                    Level
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-primary-dark">
                    {student.level}
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-500 dark:text-secondary-dark uppercase tracking-wider">
                    Language
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-primary-dark">
                    {student.language}
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

function Placeholder({ title }) {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-primary-dark">
        {title}
      </h2>
      <p className="text-gray-500 dark:text-secondary-dark mt-2">
        This feature is coming soon.
      </p>
    </div>
  );
}
