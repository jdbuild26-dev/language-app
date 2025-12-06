import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldCheckIcon,
  BoltIcon,
  DevicePhoneMobileIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-white dark:bg-body-dark">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-blue-3/40 via-transparent to-transparent opacity-50 dark:opacity-20"></div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-body-dark to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in space-y-8">
            <div className="inline-flex items-center rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-sm font-medium text-gray-600 dark:text-slate-300 shadow-sm mb-4">
              <span className="flex h-2 w-2 rounded-full bg-brand-blue-1 mr-2"></span>
              v1.0 is now live
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-primary-dark">
              Master New Languages <br className="hidden sm:block" />
              <span className="text-brand-blue-1">With Confidence</span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-500 dark:text-secondary-dark max-w-3xl mx-auto leading-relaxed font-light">
              The smartest way to learn. Interactive lessons, real-time progress
              tracking, and a supportive community to help you reach fluency
              faster.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <SignedOut>
                <Link to="/sign-up">
                  <Button
                    size="lg"
                    className="rounded-full px-8 py-6 text-lg font-bold bg-brand-blue-1 hover:bg-brand-blue-2 shadow-lg shadow-brand-blue-1/20 transition-all hover:scale-105"
                  >
                    Start Learning Free
                  </Button>
                </Link>
                <Link to="/sign-in">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="rounded-full px-8 py-6 text-lg font-medium text-gray-600 dark:text-secondary-dark hover:bg-gray-50 dark:hover:bg-elevated-2 hover:text-gray-900 dark:hover:text-primary-dark"
                  >
                    Sign In
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    className="rounded-full px-8 py-6 text-lg font-bold bg-brand-blue-1 hover:bg-brand-blue-2 shadow-lg shadow-brand-blue-1/20 transition-all hover:scale-105 gap-2"
                  >
                    Go to Dashboard
                    <ArrowRightIcon className="w-5 h-5" />
                  </Button>
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50/50 dark:bg-elevated-2 border-t border-gray-100 dark:border-subtle-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-primary-dark mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-lg text-gray-500 dark:text-secondary-dark max-w-2xl mx-auto">
              We provide the tools and environment for effective language
              acquisition.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-gray-100 dark:border-slate-700 dark:bg-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-8">
                <div className="h-12 w-12 rounded-xl bg-brand-blue-3/30 dark:bg-sky-900/30 flex items-center justify-center text-brand-blue-1 dark:text-sky-400 mb-6">
                  <ShieldCheckIcon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Scientific Method
                </h3>
                <p className="text-gray-500 dark:text-slate-400 leading-relaxed">
                  Our curriculum is designed by linguists to ensure long-term
                  retention and practical usage skills.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-gray-100 dark:border-slate-700 dark:bg-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-8">
                <div className="h-12 w-12 rounded-xl bg-brand-yellow-1 dark:bg-yellow-900/30 flex items-center justify-center text-brand-yellow-3 dark:text-yellow-400 border border-brand-yellow-2 dark:border-yellow-700 mb-6">
                  <BoltIcon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Rapid Progress
                </h3>
                <p className="text-gray-500 dark:text-slate-400 leading-relaxed">
                  Track your daily streaks and see measurable improvements in
                  your speaking and listening abilities.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-gray-100 dark:border-slate-700 dark:bg-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-8">
                <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                  <DevicePhoneMobileIcon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Learn Anywhere
                </h3>
                <p className="text-gray-500 dark:text-slate-400 leading-relaxed">
                  Seamlessly switch between devices. Your progress is
                  syncronized instantly across mobile and desktop.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-r from-sky-500 to-cyan-400 p-8 sm:p-16 text-center shadow-2xl shadow-brand-blue-1/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">
                Ready to start your journey?
              </h2>
              <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
                Join over 10,000 learners mastering new languages today.
              </p>
              <SignedOut>
                <Link to="/sign-up">
                  <Button
                    size="lg"
                    className="rounded-full px-10 py-7 bg-white text-brand-blue-1 hover:bg-white/90 font-bold text-lg shadow-xl border-none"
                  >
                    Create Free Account
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    className="rounded-full px-10 py-7 bg-white text-brand-blue-1 hover:bg-white/90 font-bold text-lg shadow-xl border-none"
                  >
                    Continue Learning
                  </Button>
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
