
import { useNavigate } from "react-router-dom";
import { Briefcase, ArrowRight, Gavel, Stethoscope, DraftingCompass, ChefHat } from "lucide-react";

const professions = [
    {
        id: 1,
        title: "Lawyer",
        slug: "lawyer",
        level: "C1",
        description: "Discuss contract clauses and legal implications.",
        icon: Gavel,
        color: "text-slate-600",
        bg: "bg-slate-100 dark:bg-slate-800",
        scenario: {
            aiRole: "Senior Partner",
            userRole: "Junior Associate",
            aiPrompt: "You are a senior lawyer explaining a complex contract clause.",
        }
    },
    {
        id: 2,
        title: "Doctor",
        slug: "doctor",
        level: "B2",
        description: "Take a patient history and discuss diagnosis.",
        icon: Stethoscope,
        color: "text-emerald-500",
        bg: "bg-emerald-100 dark:bg-emerald-900/20",
        scenario: {
            aiRole: "Patient",
            userRole: "Doctor",
            aiPrompt: "You are a patient describing ambiguous symptoms.",
        }
    },
    {
        id: 3,
        title: "Architect",
        slug: "architect",
        level: "B2",
        description: "Present design concepts to a client.",
        icon: DraftingCompass,
        color: "text-orange-500",
        bg: "bg-orange-100 dark:bg-orange-900/20",
        scenario: {
            aiRole: "Client",
            userRole: "Architect",
            aiPrompt: "You are a demanding client reviewing house plans.",
        }
    },
    {
        id: 4,
        title: "Chef",
        slug: "chef",
        level: "B1",
        description: "Coordinate kitchen staff during dinner service.",
        icon: ChefHat,
        color: "text-amber-500",
        bg: "bg-amber-100 dark:bg-amber-900/20",
        scenario: {
            aiRole: "Sous Chef",
            userRole: "Head Chef",
            aiPrompt: "You are a sous chef reporting on prep status and problems.",
        }
    }
];

export default function ProfessionContent() {
    const navigate = useNavigate();

    const handleStartProfession = (profession) => {
        const scenario = {
            title: profession.title,
            level: profession.level,
            formality: "formal",
            mode: "profession",
            ...profession.scenario,
            icon: "💼"
        };

        navigate(`/ai-practice/scenarios/chats/${profession.slug}/chat`, {
            state: { scenario }
        });
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Professions
                </h2>
                <p className="text-gray-500 dark:text-slate-400">
                    Master technical vocabulary and professional etiquette.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {professions.map((prof) => (
                    <div
                        key={prof.id}
                        onClick={() => handleStartProfession(prof)}
                        className="group relative bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl p-5 hover:shadow-lg cursor-pointer transition-all hover:-translate-y-1"
                    >
                        <div className={`w-12 h-12 rounded-xl ${prof.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <prof.icon className={`w-6 h-6 ${prof.color}`} />
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            {prof.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 h-10">
                            {prof.description}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                            <span className="px-2 py-0.5 bg-gray-50 dark:bg-slate-800 text-gray-500 text-xs font-semibold rounded border border-gray-200 dark:border-slate-700">
                                {prof.level}
                            </span>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
