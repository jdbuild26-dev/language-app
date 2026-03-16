const colors = {
  sky: "bg-sky-100 text-sky-600 dark:bg-sky-900/20 dark:text-sky-300",
  orange:
    "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-300",
  teal: "bg-teal-100 text-teal-600 dark:bg-teal-900/20 dark:text-teal-300",
};

const iconBg = {
  sky: "bg-sky-200 dark:bg-sky-800",
  orange: "bg-orange-200 dark:bg-orange-800",
  teal: "bg-teal-200 dark:bg-teal-800",
};

export default function ActionCard({ icon: Icon, label, color }) {
  return (
    <button
      className={`group relative aspect-[4/5] ${colors[color]} rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:shadow-xl hover:-translate-y-1 transition-all`}
    >
      <div
        className={`w-16 h-16 ${iconBg[color]} rounded-full flex items-center justify-center`}
      >
        <Icon className="w-8 h-8" />
      </div>
      <span className="font-semibold">{label}</span>
    </button>
  );
}
