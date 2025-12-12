import {
  HandRaisedIcon,
  UserGroupIcon,
  ChatBubbleBottomCenterTextIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const communityFeatures = [
  {
    title: "Supportive Community",
    description: "Learn together and get feedback from other fluent speakers.",
    icon: UserGroupIcon,
    color: "bg-brand-yellow-2",
  },
  {
    title: "Expert Feedback",
    description: "Get corrections and tips from certified language tutors.",
    icon: ChatBubbleBottomCenterTextIcon,
    color: "bg-brand-blue-1",
  },
  {
    title: "Daily Motivation",
    description: "Join challenges and keep your streak alive with friends.",
    icon: SparklesIcon,
    color: "bg-green-400",
  },
];

export function CommunitySection() {
  return (
    <section className="pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {communityFeatures.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 p-8 text-center transition-all hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-lg border border-slate-100 dark:border-slate-700"
            >
              {/* Illustration Area */}
              <div className="relative mx-auto mb-6 h-48 w-48">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-40 w-40 rounded-full bg-blue-100/50 dark:bg-blue-900/20 blur-xl"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Abstract shapes */}
                    <div
                      className={`absolute -left-8 top-2 h-24 w-16 -rotate-12 rounded-2xl ${feature.color} opacity-90 shadow-sm transition-transform group-hover:-translate-y-2 group-hover:-rotate-12 duration-500`}
                    ></div>
                    <div className="absolute -right-8 top-4 h-24 w-16 rotate-12 rounded-2xl bg-slate-400/30 dark:bg-slate-600/50 opacity-90 shadow-sm transition-transform group-hover:-translate-y-2 group-hover:rotate-12 duration-500"></div>

                    {/* Sparkles */}
                    <div className="absolute -top-6 left-0 right-0 flex justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 duration-300">
                      <span className="block h-2 w-1 bg-brand-blue-1 rounded-full animate-bounce delay-75"></span>
                      <span className="block h-3 w-1 bg-brand-blue-1 rounded-full animate-bounce"></span>
                      <span className="block h-2 w-1 bg-brand-blue-1 rounded-full animate-bounce delay-150"></span>
                    </div>

                    {/* Central Icon */}
                    <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-3xl bg-white dark:bg-slate-700 shadow-md transform rotate-3 group-hover:rotate-0 transition-all duration-500">
                      <feature.icon className="h-10 w-10 text-brand-blue-1 dark:text-sky-400" />
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                {feature.title}
              </h3>

              <p className="text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
