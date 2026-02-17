import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BriefcaseIcon,
  MapPinIcon,
  StarIcon,
  ClockIcon,
  AcademicCapIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

export default function TeacherProfilePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Header */}
      <Card className="border-none shadow-md bg-white dark:bg-card-dark overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-brand-blue-1 to-brand-blue-2"></div>
        <CardContent className="relative pt-0 px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 mb-6 gap-6">
            <div className="w-24 h-24 rounded-full border-4 border-white dark:border-card-dark shadow-md bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
              <img
                src="https://github.com/shadcn.png"
                alt="Teacher"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <span className="hidden w-full h-full items-center justify-center text-2xl font-bold text-gray-500">
                TC
              </span>
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-primary-dark">
                  Sarah Wilson
                </h1>
                <Badge
                  variant="secondary"
                  className="bg-brand-blue-1/10 text-brand-blue-1"
                >
                  Verified Teacher
                </Badge>
              </div>
              <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-2 text-sm">
                <MapPinIcon className="w-4 h-4" /> London, UK
                <span className="mx-1">•</span>
                <ClockIcon className="w-4 h-4" /> 10:00 AM Local Time
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">Edit Profile</Button>
              <Button>Availability</Button>
            </div>
          </div>

          {/* Bio & Stats Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-primary-dark mb-2">
                  About Me
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Certified ESL teacher with over 8 years of experience helping
                  students achieve fluency. Specializing in Business English and
                  exam preparation (IELTS/TOEFL). I believe in an immersive
                  teaching style that focuses on real-world conversation and
                  practical usage.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Languages
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">English (Native)</Badge>
                    <Badge variant="outline">French (B2)</Badge>
                    <Badge variant="outline">Spanish (A2)</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Specializations
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">Business</Badge>
                    <Badge variant="outline">IELTS</Badge>
                    <Badge variant="outline">Grammar</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Column */}
            <div className="space-y-4">
              <Card className="bg-gray-50 dark:bg-gray-800/50 border-none">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-brand-blue-1">
                    <UserGroupIcon className="w-6 h-6" />{" "}
                    {/* Reusing UserGroupIcon from heroicons/react/24/outline - import needed if not global */}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      124
                    </p>
                    <p className="text-xs text-gray-500">Total Students</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 dark:bg-gray-800/50 border-none">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600">
                    <StarIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      4.9/5
                    </p>
                    <p className="text-xs text-gray-500">Average Rating</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 dark:bg-gray-800/50 border-none">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                    <AcademicCapIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      1,500+
                    </p>
                    <p className="text-xs text-gray-500">Hours Taught</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
