import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useProfile } from "@/contexts/ProfileContext";
import {
    searchProfiles,
    requestConnection,
    fetchFriends,
    fetchTeacherStudents,
    fetchStudentTeachers,
    updateRelationshipStatus
} from "@/services/vocabularyApi";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    UserGroupIcon,
    UserPlusIcon,
    MagnifyingGlassIcon,
    CheckIcon,
    XMarkIcon,
    ClockIcon,
    AcademicCapIcon
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function FriendsPage() {
    const { getToken } = useAuth();
    const { activeProfile } = useProfile();
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Connection types for the request modal
    const [selectedUser, setSelectedUser] = useState(null);
    const [showRequestModal, setShowRequestModal] = useState(false);

    useEffect(() => {
        fetchSocialData();
    }, [getToken, activeProfile]);

    const fetchSocialData = async () => {
        if (!activeProfile) return;
        try {
            setIsLoading(true);
            const token = await getToken();

            // 1. Fetch Friends (Type: 'friend', Status: 'active')
            const friendsData = await fetchFriends(token);
            setFriends(friendsData);

            // 2. Fetch Pending Requests
            // We need to fetch from both teacher and student perspectives
            let requests = [];
            if (activeProfile.role === 'student') {
                const studentReqs = await fetchStudentTeachers(activeProfile.profileId, "pending", token);
                requests = studentReqs.map(r => ({ ...r, perspective: 'sent' }));
            } else {
                const teacherReqs = await fetchTeacherStudents(activeProfile.profileId, "pending", token);
                requests = teacherReqs.map(r => ({ ...r, perspective: 'received' }));
            }

            // Note: This needs the backend to return 'type' in those fetchers, which it now does.
            setPendingRequests(requests);

        } catch (error) {
            console.error("Failed to fetch social data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            setIsSearching(true);
            const token = await getToken();
            const results = await searchProfiles(searchQuery, token);
            setSearchResults(results);
        } catch (error) {
            toast.error("Search failed");
        } finally {
            setIsSearching(false);
        }
    };

    const handleRequestClick = (user) => {
        setSelectedUser(user);
        setShowRequestModal(true);
    };

    const sendRequest = async (roleType, language = null) => {
        try {
            const token = await getToken();

            // Logic: sender is current active profile, receiver is the selectedUser role
            // But we need a profile ID for the receiver.
            // selectedUser.roles has the list of profiles for that person.

            const targetRole = selectedUser.roles.find(r =>
                r.type === roleType && (language ? r.language === language : true)
            );

            if (!targetRole) {
                toast.error("Target role not found");
                return;
            }

            await requestConnection({
                studentId: activeProfile.profileId,
                teacherId: targetRole.profileId, // Using teacherId field as generic receiverId in backend
                type: roleType,
                language: language
            }, token);

            toast.success("Connection request sent!");
            setShowRequestModal(false);
            setSearchResults([]);
            setSearchQuery("");
            fetchSocialData();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleResponse = async (reqId, status) => {
        try {
            const token = await getToken();
            await updateRelationshipStatus(reqId, status, token);
            toast.success(status === 'active' ? "Request accepted!" : "Request declined");
            fetchSocialData();
        } catch (error) {
            toast.error("Action failed");
        }
    };

    if (isLoading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-blue-1" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Friends & Connections</h1>
                <p className="text-slate-400 text-sm">Find people to connect with as friends or teachers.</p>
            </div>

            {/* Search Section */}
            <section className="space-y-4">
                <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <Input
                            placeholder="Search by username (e.g., coolboy54)..."
                            className="pl-10 bg-[#0f172a] border-slate-800 text-white h-12 rounded-xl focus:ring-brand-blue-1"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="bg-brand-blue-1 hover:bg-brand-blue-2 h-12 px-8 rounded-xl font-bold" disabled={isSearching}>
                        {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : "Search"}
                    </Button>
                </form>

                {searchResults.length > 0 && (
                    <div className="grid gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                        {searchResults.map((user) => (
                            <Card key={user.clerkUserId} className="bg-slate-900/50 border-brand-blue-1/30 shadow-lg shadow-brand-blue-1/5 overflow-hidden">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-brand-blue-1 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                            {user.username?.[0]?.toUpperCase() || "U"}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-white tracking-tight">{user.name || "User"}</h3>
                                            <p className="text-brand-blue-1 font-bold text-sm">@{user.username}</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleRequestClick(user)}
                                        className="bg-brand-blue-1 hover:bg-brand-blue-2 text-white font-black uppercase tracking-widest text-xs px-6 py-2 rounded-xl"
                                    >
                                        Connect
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            {/* Requests Section */}
            {pendingRequests.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <ClockIcon className="h-4 w-4" />
                        Pending Requests
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {pendingRequests.map((req) => (
                            <Card key={req.id} className="bg-[#0f172a] border-slate-800 border-l-4 border-l-brand-blue-1">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
                                            {req.type === 'teacher' ? <AcademicCapIcon className="h-5 w-5 text-brand-blue-1" /> : <UserGroupIcon className="h-5 w-5 text-indigo-400" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white max-w-[150px] truncate">{req.name || "User"}</p>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">
                                                {req.type === 'friend' ? 'Friend' : `Teacher - ${req.language || 'General'}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {req.perspective === 'received' ? (
                                            <>
                                                <Button
                                                    onClick={() => handleResponse(req.id, 'active')}
                                                    size="sm"
                                                    className="h-8 w-8 p-0 bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white rounded-lg border border-green-500/30"
                                                >
                                                    <CheckIcon className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => handleResponse(req.id, 'rejected')}
                                                    size="sm"
                                                    className="h-8 w-8 p-0 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-lg border border-red-500/30"
                                                >
                                                    <XMarkIcon className="h-4 w-4" />
                                                </Button>
                                            </>
                                        ) : (
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Sent</span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Friends List */}
            <section className="space-y-4">
                <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <UserGroupIcon className="h-4 w-4" />
                    My Friends
                </h2>

                {friends.length === 0 ? (
                    <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
                        <UserGroupIcon className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white">No friends yet</h3>
                        <p className="text-slate-500 mt-2 text-sm">Search for usernames to start adding friends!</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {friends.map((friend) => (
                            <Card key={friend.id} className="bg-[#0f172a] border-slate-800 hover:border-brand-blue-1/50 transition-all duration-300">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                        <span className="text-indigo-400 font-black text-lg">{friend.username?.[0]?.toUpperCase() || "F"}</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{friend.name || friend.username}</p>
                                        <p className="text-xs text-slate-500">@{friend.username}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            {/* Request Modal (Manual implementation since we don't have a shared Modal component easily available without imports) */}
            {showRequestModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 space-y-6">
                            <div className="text-center">
                                <div className="h-20 w-20 bg-brand-blue-1/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-blue-1/30">
                                    <UserPlusIcon className="h-10 w-10 text-brand-blue-1" />
                                </div>
                                <h2 className="text-2xl font-black text-white">Connection Type</h2>
                                <p className="text-slate-400 text-sm mt-2">How would you like to connect with <span className="text-brand-blue-1 font-bold">@{selectedUser.username}</span>?</p>
                            </div>

                            <div className="grid gap-3">
                                {selectedUser.roles.map((role, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => sendRequest(role.type, role.language)}
                                        className="w-full flex items-center justify-between p-5 rounded-2xl bg-slate-800/40 border border-slate-700 hover:border-brand-blue-1 hover:bg-brand-blue-1/10 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-brand-blue-1/20 transition-colors">
                                                {role.type === 'friend' ? <UserGroupIcon className="h-5 w-5 text-indigo-400" /> : <AcademicCapIcon className="h-5 w-5 text-brand-blue-1" />}
                                            </div>
                                            <span className="font-bold text-white">{role.label}</span>
                                        </div>
                                        <ChevronRightIcon className="h-5 w-5 text-slate-600 group-hover:text-brand-blue-1" />
                                    </button>
                                ))}
                            </div>

                            <Button
                                variant="ghost"
                                className="w-full text-slate-500 hover:text-white mt-4 font-bold"
                                onClick={() => setShowRequestModal(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ChevronRightIcon helper since it's used in modal
function ChevronRightIcon(props) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
    );
}
