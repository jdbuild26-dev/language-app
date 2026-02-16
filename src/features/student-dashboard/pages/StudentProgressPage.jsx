import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
// import PageTabs from "@/components/ui/PageTabs";
import {
  ChartBarIcon,
  CheckCircleIcon,
  BoltIcon,
  CodeBracketIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";

const MOCK_VOCAB_DATA = [
  { name: "Week 1", score: 65, completed: 12 },
  { name: "Week 2", score: 72, completed: 15 },
  { name: "Week 3", score: 80, completed: 18 },
  { name: "Week 4", score: 85, completed: 22 },
];

const MOCK_GRAMMAR_DATA = [
  { name: "Nouns", score: 80, completed: 5 },
  { name: "Verbs", score: 65, completed: 8 },
  { name: "Adjectives", score: 90, completed: 4 },
  { name: "Tenses", score: 55, completed: 6 },
];

const MOCK_PRACTICE_DATA = [
  { name: "Reading", score: 75, completed: 10 },
  { name: "Writing", score: 60, completed: 8 },
  { name: "Listening", score: 85, completed: 12 },
  { name: "Speaking", score: 70, completed: 5 },
];

export default function StudentProgressPage() {
  const [activeTab, setActiveTab] = useState("vocabulary");

  const renderChart = (data, type) => {
    if (type === "bar") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="score" fill="#8884d8" name="Avg. Score (%)" />
            <Bar
              dataKey="completed"
              fill="#82ca9d"
              name="Exercises Completed"
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
            name="Score Trend"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const getTabData = () => {
    switch (activeTab) {
      case "vocabulary":
        return {
          title: "Vocabulary Progress",
          description: "Track your word mastery over time.",
          data: MOCK_VOCAB_DATA,
          chartType: "line",
          icon: <BookOpenIcon className="w-6 h-6 text-brand-blue-1" />,
          stats: [
            { label: "Words Learned", value: "350", change: "+45 this week" },
            { label: "Mastery Level", value: "B1", change: "Intermediate" },
          ],
        };
      case "grammar":
        return {
          title: "Grammar Proficiency",
          description: "See your strengths and weaknesses in grammar.",
          data: MOCK_GRAMMAR_DATA,
          chartType: "bar",
          icon: <BoltIcon className="w-6 h-6 text-purple-600" />,
          stats: [
            { label: "Topics Covered", value: "12/20", change: "60% Complete" },
            {
              label: "Avg. Accuracy",
              value: "72%",
              change: "+5% vs last month",
            },
          ],
        };
      case "practice":
        return {
          title: "Skill Practice",
          description:
            "Overview of your reading, writing, listening, and speaking skills.",
          data: MOCK_PRACTICE_DATA,
          chartType: "bar",
          icon: <CodeBracketIcon className="w-6 h-6 text-green-600" />,
          stats: [
            { label: "Hours Practiced", value: "24h", change: "Total time" },
            { label: "Best Skill", value: "Listening", change: "85% Avg" },
          ],
        };
      default:
        return {};
    }
  };

  const { title, description, data, chartType, icon, stats } = getTabData();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-primary-dark">
            Progress Report
          </h1>
          <p className="text-gray-500 dark:text-secondary-dark">
            Analyze your learning journey with detailed metrics.
          </p>
        </div>
      </div>

      <div className="flex border-b border-gray-200 dark:border-slate-700 mb-6">
        {[
          {
            id: "vocabulary",
            label: "Vocabulary",
            icon: BookOpenIcon,
          },
          {
            id: "grammar",
            label: "Grammar",
            icon: BoltIcon,
          },
          {
            id: "practice",
            label: "Practice",
            icon: CodeBracketIcon,
          },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 py-4 text-sm font-semibold transition-colors rounded-t-lg flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-1
                ${
                  isActive
                    ? "text-brand-blue-1 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 border-t-2 border-t-brand-blue-1 border-x border-gray-200 dark:border-slate-600 border-b-transparent -mb-px"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 border border-transparent"
                }
              `}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6">
        {/* Stats Row */}
        <div className="grid sm:grid-cols-2 gap-4">
          {stats.map((stat, idx) => (
            <Card key={idx}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.label}
                </CardTitle>
                {icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-primary-dark">
                  {stat.value}
                </div>
                <p className="text-xs text-brand-blue-1 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart Card */}
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="pl-0 sm:pl-6 pr-6 pt-6">
            {renderChart(data, chartType)}
          </CardContent>
        </Card>

        {/* Recent Activity List (Mock) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-3 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-primary-dark">
                        Completed {activeTab} exercise
                      </p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <span className="font-semibold text-sm text-green-600">
                    +10pts
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
