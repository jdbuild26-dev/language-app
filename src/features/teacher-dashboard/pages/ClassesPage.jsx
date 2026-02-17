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

const MOCK_CLASSES = [
  {
    id: 1,
    name: "Beginner French - Group A",
    level: "A1",
    students: 5,
    schedule: "Mon, Wed 10:00 AM",
    nextSession: "Today, 10:00 AM",
    link: "https://meet.google.com/abc-defg-hij",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: 2,
    name: "Intermediate Business English",
    level: "B2",
    students: 3,
    schedule: "Tue, Thu 2:00 PM",
    nextSession: "Tomorrow, 2:00 PM",
    link: "https://meet.google.com/xyz-uvwx-yz",
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: 3,
    name: "IELTS Preparation",
    level: "Advanced",
    students: 8,
    schedule: "Fri 9:00 AM",
    nextSession: "Fri, Feb 20",
    link: "https://meet.google.com/lmn-opqr-stu",
    color: "bg-green-100 text-green-700",
  },
];

export default function ClassesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-primary-dark">
            My Classes
          </h1>
          <p className="text-gray-500 dark:text-secondary-dark">
            Manage your class groups and schedules.
          </p>
        </div>
        <Button>
          <PlusIcon className="w-4 h-4 mr-2" /> Create Class
        </Button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_CLASSES.map((cls) => (
          <Card key={cls.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Badge variant="secondary" className={cls.color}>
                {cls.level}
              </Badge>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500" />
              </Button>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">{cls.name}</CardTitle>
              <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" />
                  {cls.schedule}
                </div>
                <div className="flex items-center gap-2">
                  <UsersIcon className="w-4 h-4" />
                  {cls.students} Students Enrolled
                </div>
              </div>

              <div className="mt-6 pt-4 border-t dark:border-gray-700 flex justify-between items-center">
                <div className="flex -space-x-2 overflow-hidden">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 ring-2 ring-white dark:bg-gray-800 dark:ring-gray-800"
                    >
                      <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">
                        ST
                      </span>
                    </div>
                  ))}
                  {cls.students > 3 && (
                    <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] ring-2 ring-white dark:ring-gray-800">
                      +{cls.students - 3}
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => window.open(cls.link, "_blank")}
                >
                  <VideoCameraIcon className="w-4 h-4" />
                  Join Meet
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
