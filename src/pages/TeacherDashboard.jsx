import { useState } from "react";
import {
  UserGroupIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  CalendarIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
  {
    id: "S-102937",
    name: "David Lee",
    email: "david@example.com",
    level: "A1",
    language: "French",
    joined: "2024-03-12",
  },
  {
    id: "S-102938",
    name: "Eva Green",
    email: "eva@example.com",
    level: "B2",
    language: "French",
    joined: "2024-03-15",
  },
];

const MOCK_GROUPS = [
  {
    id: "G-001",
    name: "A1 Beginners Morning",
    level: "A1",
    schedule: "Mon, Wed 9:00 AM",
    studentCount: 2,
    students: ["S-102934", "S-102937"],
  },
  {
    id: "G-002",
    name: "B1 Intermediate Evening",
    level: "B1",
    schedule: "Tue, Thu 6:00 PM",
    studentCount: 1,
    students: ["S-102936"],
  },
];

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("students");
  const [groups, setGroups] = useState(MOCK_GROUPS);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const handleCreateGroup = (newGroup) => {
    setGroups([...groups, { ...newGroup, id: `G-${Date.now()}` }]);
    setShowCreateGroup(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "students":
        return <StudentList />;
      case "groups":
        return (
          <GroupsView
            groups={groups}
            onCreateGroup={() => setShowCreateGroup(true)}
          />
        );
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

      {/* Modals */}
      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onCreate={handleCreateGroup}
        />
      )}
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

function GroupsView({ groups, onCreateGroup }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-primary-dark">
            My Classes
          </h1>
          <p className="text-gray-500 dark:text-secondary-dark mt-1">
            Organize students into groups for easier management.
          </p>
        </div>
        <Button onClick={onCreateGroup} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Create Class
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card
            key={group.id}
            className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-brand-blue-1"
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge variant="secondary" className="mb-2">
                  {group.level}
                </Badge>
                <span className="text-xs text-gray-400 font-mono">
                  {group.id}
                </span>
              </div>
              <CardTitle className="text-lg">{group.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-secondary-dark">
                  <UserGroupIcon className="h-4 w-4" />
                  <span>
                    {group.studentCount}{" "}
                    {group.studentCount === 1 ? "Student" : "Students"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-secondary-dark">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{group.schedule || "No schedule set"}</span>
                </div>
                <div className="pt-2 flex -space-x-2 overflow-hidden">
                  {group.students.map((studentId) => (
                    <div
                      key={studentId}
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-card-dark bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600"
                      title={studentId}
                    >
                      {/* Ideally lookup student name */}
                      {studentId.slice(0, 2)}
                    </div>
                  ))}
                  {group.students.length > 5 && (
                    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-card-dark bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                      +{group.students.length - 5}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State Action */}
        <button
          onClick={onCreateGroup}
          className="flex flex-col items-center justify-center h-full min-h-[200px] border-2 border-dashed border-gray-200 dark:border-subtle-dark rounded-xl text-gray-400 hover:text-brand-blue-1 hover:border-brand-blue-1 hover:bg-brand-blue-1/5 transition-all"
        >
          <PlusIcon className="h-10 w-10 mb-2" />
          <span className="font-medium">Create New Class</span>
        </button>
      </div>
    </div>
  );
}

function CreateGroupModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("A1");
  const [schedule, setSchedule] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);

  const toggleStudent = (id) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter((s) => s !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    onCreate({
      name,
      level,
      schedule,
      studentCount: selectedStudents.length,
      students: selectedStudents,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-subtle-dark">
          <h2 className="text-xl font-bold text-gray-900 dark:text-primary-dark">
            Create New Class
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-secondary-dark">
              Class Name
            </label>
            <Input
              placeholder="e.g., A1 Morning Batch"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-secondary-dark">
                Level
              </label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-secondary-dark">
                Schedule (Optional)
              </label>
              <Input
                placeholder="e.g., Mon/Wed 9AM"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-secondary-dark">
              Select Students ({selectedStudents.length})
            </label>
            <div className="border rounded-md max-h-40 overflow-y-auto p-2 bg-gray-50 dark:bg-elevated-2">
              {MOCK_STUDENTS.length === 0 ? (
                <p className="text-sm text-gray-400 p-2">No students found.</p>
              ) : (
                <div className="space-y-1">
                  {MOCK_STUDENTS.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => toggleStudent(student.id)}
                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                        selectedStudents.includes(student.id)
                          ? "bg-brand-blue-1/10 border border-brand-blue-1/20"
                          : "hover:bg-gray-100 dark:hover:bg-elevated-3 border border-transparent"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          selectedStudents.includes(student.id)
                            ? "bg-brand-blue-1 border-brand-blue-1"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedStudents.includes(student.id) && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-primary-dark">
                          {student.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {student.level} • {student.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name}>
              Create Class
            </Button>
          </div>
        </form>
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
