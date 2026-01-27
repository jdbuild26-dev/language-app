
import { useNavigate } from "react-router-dom";
import { Target, ArrowRight, MapPin, ShoppingBag, Calendar, Plane } from "lucide-react";

const missions = [
    {
        id: 1,
        title: "Find a Rental Apartment",
        slug: "rent-apartment",
        level: "B1",
        objective: "Negotiate rent and lease terms with a landlord.",
        description: "You are looking for an apartment in Paris. Discuss amenities, price, and move-in date.",
        icon: MapPin,
        color: "text-blue-500",
        bg: "bg-blue-100 dark:bg-blue-900/20",
        scenario: {
            aiRole: "Landlord",
            userRole: "Tenant",
            aiPrompt: "You are a Parisian landlord renting out a studio apartment.",
        }
    },
    {
        id: 2,
        title: "Return a Defective Item",
        slug: "return-item",
        level: "A2",
        objective: "Explain the defect and get a refund or exchange.",
        description: "You bought a toaster that doesn't work. The shop assistant is hesitant.",
        icon: ShoppingBag,
        color: "text-red-500",
        bg: "bg-red-100 dark:bg-red-900/20",
        scenario: {
            aiRole: "Shop Assistant",
            userRole: "Customer",
            aiPrompt: "You are a shop assistant. You need to verify the defect and check receipt.",
        }
    },
    {
        id: 3,
        title: "Change Flight Booking",
        slug: "change-flight",
        level: "B2",
        objective: "Change your flight to a different date without paying high fees.",
        description: "Something came up and you need to fly tomorrow instead of today.",
        icon: Plane,
        color: "text-sky-500",
        bg: "bg-sky-100 dark:bg-sky-900/20",
        scenario: {
            aiRole: "Airline Agent",
            userRole: "Traveler",
            aiPrompt: "You are an airline customer service agent. Check availability and fees.",
        }
    },
    {
        id: 4,
        title: "Book a Doctor's Appointment",
        slug: "doctor-appointment",
        level: "A2",
        objective: "Describe your symptoms and find a suitable time slot.",
        description: "You have a bad headache and need to see a doctor soon.",
        icon: Calendar,
        color: "text-green-500",
        bg: "bg-green-100 dark:bg-green-900/20",
        scenario: {
            aiRole: "Receptionist",
            userRole: "Patient",
            aiPrompt: "You are a doctor's receptionist. Ask for symptoms and check schedule.",
        }
    }
];

export default function MissionsContent() {
    const navigate = useNavigate();

    const handleStartMission = (mission) => {
        const scenario = {
            title: mission.title,
            level: mission.level,
            formality: "formal", // Missions usually formal
            mode: "mission",
            objective: mission.objective,
            ...mission.scenario,
            icon: "🎯"
        };

        navigate(`/ai-practice/scenarios/chats/${mission.slug}/chat`, {
            state: { scenario }
        });
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Missions
                </h2>
                <p className="text-gray-500 dark:text-slate-400">
                    Goal-oriented tasks properly solve real-world problems.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {missions.map((mission) => (
                    <div
                        key={mission.id}
                        onClick={() => handleStartMission(mission)}
                        className="group relative bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl p-5 hover:shadow-md cursor-pointer transition-all border-l-4 border-l-transparent hover:border-l-indigo-500"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className={`p-2.5 rounded-lg ${mission.bg}`}>
                                <mission.icon className={`w-6 h-6 ${mission.color}`} />
                            </div>
                            <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-xs font-semibold rounded-md">
                                {mission.level}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">
                            {mission.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mb-3 line-clamp-2">
                            {mission.description}
                        </p>

                        <div className="flex items-center text-xs font-medium text-gray-500 dark:text-slate-500">
                            <Target className="w-3.5 h-3.5 mr-1" />
                            Goal: {mission.objective}
                        </div>

                        <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                            <ArrowRight className="w-5 h-5 text-indigo-500" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
