(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/hooks/useExerciseTimer.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useExerciseTimer",
    ()=>useExerciseTimer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
const useExerciseTimer = ({ duration = 20, mode = "timer", onExpire, isPaused = false })=>{
    _s();
    const [timeLeft, setTimeLeft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(mode === "timer" ? duration : 0);
    const [isExpired, setIsExpired] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Ref to access current state inside interval closure if needed,
    // though dependency array usually handles this.
    // Using ref for onExpire to avoid re-setting interval if callback changes
    const onExpireRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(onExpire);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useExerciseTimer.useEffect": ()=>{
            onExpireRef.current = onExpire;
        }
    }["useExerciseTimer.useEffect"], [
        onExpire
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useExerciseTimer.useEffect": ()=>{
            if (isPaused || isExpired) return;
            const interval = setInterval({
                "useExerciseTimer.useEffect.interval": ()=>{
                    setTimeLeft({
                        "useExerciseTimer.useEffect.interval": (prev)=>{
                            if (mode === "stopwatch") {
                                return prev + 1;
                            } else {
                                // Timer mode
                                if (prev <= 1) {
                                    clearInterval(interval);
                                    setIsExpired(true);
                                    if (onExpireRef.current) {
                                        onExpireRef.current();
                                    }
                                    return 0;
                                }
                                return prev - 1;
                            }
                        }
                    }["useExerciseTimer.useEffect.interval"]);
                }
            }["useExerciseTimer.useEffect.interval"], 1000);
            return ({
                "useExerciseTimer.useEffect": ()=>clearInterval(interval)
            })["useExerciseTimer.useEffect"];
        }
    }["useExerciseTimer.useEffect"], [
        isPaused,
        isExpired,
        mode
    ]);
    // Reset function
    const resetTimer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useExerciseTimer.useCallback[resetTimer]": ()=>{
            setTimeLeft(mode === "timer" ? duration : 0);
            setIsExpired(false);
        }
    }["useExerciseTimer.useCallback[resetTimer]"], [
        duration,
        mode
    ]);
    // Format time as MM:SS
    const formatTime = (seconds)=>{
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };
    return {
        time: timeLeft,
        timerString: formatTime(timeLeft),
        resetTimer,
        isExpired
    };
};
_s(useExerciseTimer, "KF/b+FnHllnTpxmpT4ddmzzfIb4=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/ProgressBar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProgressBar",
    ()=>ProgressBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
function ProgressBar({ current, total, className, label }) {
    const percentage = Math.min(100, Math.max(0, current / total * 100));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-full max-w-md mx-auto flex flex-col gap-2", className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between text-sm font-medium text-gray-500 dark:text-gray-400",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/ProgressBar.tsx",
                        lineNumber: 12,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            current,
                            " / ",
                            total
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ui/ProgressBar.tsx",
                        lineNumber: 13,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/ProgressBar.tsx",
                lineNumber: 11,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-2.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-full bg-sky-500 rounded-full transition-all duration-300 ease-out",
                    style: {
                        width: `${percentage}%`
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/ui/ProgressBar.tsx",
                    lineNumber: 18,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/ui/ProgressBar.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/ProgressBar.tsx",
        lineNumber: 8,
        columnNumber: 5
    }, this);
}
_c = ProgressBar;
var _c;
__turbopack_context__.k.register(_c, "ProgressBar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/services/assignmentsApi.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "completeAssignment",
    ()=>completeAssignment,
    "createAssignments",
    ()=>createAssignments,
    "getMyAssignments",
    ()=>getMyAssignments,
    "getStudentAssignments",
    ()=>getStudentAssignments,
    "getTaskOptions",
    ()=>getTaskOptions,
    "getTeacherAssignments",
    ()=>getTeacherAssignments
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const API_URL = ("TURBOPACK compile-time value", "https://language-backend-v8sy.onrender.com") || "http://localhost:8000";
async function createAssignments(assignmentData, token) {
    const response = await fetch(`${API_URL}/api/teachers/assign`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(assignmentData)
    });
    if (!response.ok) {
        throw new Error("Failed to create assignments");
    }
    return response.json();
}
async function getMyAssignments(token, status = null, source = null, classId = null) {
    let url = `${API_URL}/api/students/me/assignments`;
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (source) params.append("source", source);
    if (classId) params.append("class_id", classId);
    if (params.toString()) {
        url += `?${params.toString()}`;
    }
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch assignments");
    }
    return response.json();
}
async function getStudentAssignments(studentId, token) {
    const response = await fetch(`${API_URL}/api/teachers/students/${studentId}/assignments`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch student assignments");
    }
    return response.json();
}
async function completeAssignment(assignmentId, score, metadata = {}, token) {
    const response = await fetch(`${API_URL}/api/assignments/${assignmentId}/complete`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            score,
            metadata
        })
    });
    if (!response.ok) {
        throw new Error("Failed to complete assignment");
    }
    return response.json();
}
async function getTeacherAssignments(token) {
    const response = await fetch(`${API_URL}/api/teachers/assignments`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch teacher assignments");
    }
    return response.json();
}
async function getTaskOptions(token) {
    const response = await fetch(`${API_URL}/api/assignments/task-options`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch task options");
    }
    return response.json();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/layout/PracticeGameLayout.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PracticeGameLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$languages$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Languages$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/languages.js [app-client] (ecmascript) <export default as Languages>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-client] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$ProgressBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/ProgressBar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$chunk$2d$XE3Y43DU$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@clerk/react/dist/chunk-XE3Y43DU.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$assignmentsApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/assignmentsApi.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
/**
 * Inner component that uses useSearchParams — must be wrapped in Suspense.
 */ function AssignmentSubmitter({ isGameOver, score, totalQuestions, questionType }) {
    _s();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const { getToken } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$chunk$2d$XE3Y43DU$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useAuth"])();
    const hasSubmitted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const [isSubmittingResult, setIsSubmittingResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const assignmentId = searchParams.get("assignmentId");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AssignmentSubmitter.useEffect": ()=>{
            if (isGameOver && assignmentId && !hasSubmitted.current) {
                const submitResult = {
                    "AssignmentSubmitter.useEffect.submitResult": async ()=>{
                        try {
                            hasSubmitted.current = true;
                            setIsSubmittingResult(true);
                            const token = await getToken();
                            const percentage = totalQuestions > 0 ? Math.round(score / totalQuestions * 100) : 0;
                            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$assignmentsApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["completeAssignment"])(assignmentId, percentage, {
                                rawScore: score,
                                total: totalQuestions,
                                type: questionType
                            }, token);
                            console.log("✅ Assignment auto-completed:", assignmentId);
                        } catch (error) {
                            console.error("❌ Failed to auto-complete assignment:", error);
                            hasSubmitted.current = false;
                        } finally{
                            setIsSubmittingResult(false);
                        }
                    }
                }["AssignmentSubmitter.useEffect.submitResult"];
                submitResult();
            }
        }
    }["AssignmentSubmitter.useEffect"], [
        isGameOver,
        assignmentId,
        score,
        totalQuestions,
        getToken,
        questionType
    ]);
    if (!assignmentId) return null;
    return isSubmittingResult ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mb-6 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium",
        children: "Saving results..."
    }, void 0, false, {
        fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
        lineNumber: 56,
        columnNumber: 5
    }, this) : isGameOver ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mb-6 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 rounded-full text-green-700 dark:text-green-300 text-sm font-medium animate-in fade-in slide-in-from-top-2",
        children: "Assignment progress saved! ✅"
    }, void 0, false, {
        fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
        lineNumber: 60,
        columnNumber: 5
    }, this) : null;
}
_s(AssignmentSubmitter, "KwJlGzt5noWHIlNQ4dcGe35P6I0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$chunk$2d$XE3Y43DU$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useAuth"]
    ];
});
_c = AssignmentSubmitter;
function PracticeGameLayout({ questionType, questionTypeFr, questionTypeEn, instructionFr, instructionEn, localizedInstruction, progress, isGameOver, score, totalQuestions, onExit, onNext, onRestart, isSubmitEnabled = true, showSubmitButton = true, submitLabel = "Submit", timerValue, currentQuestionIndex, showFeedback = false, isCorrect = false, feedbackMessage = "", correctAnswer = "", customEndGameContent = null, children }) {
    _s1();
    const [showTranslation, setShowTranslation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    if (isGameOver) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center justify-center min-h-screen p-4 text-center animate-in zoom-in duration-300",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-4xl",
                        children: "🏆"
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                        lineNumber: 101,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                    lineNumber: 100,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "text-3xl font-bold text-gray-900 dark:text-white mb-2",
                    children: "Quiz Complete!"
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                    lineNumber: 103,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xl text-gray-600 dark:text-gray-300 mb-8",
                    children: [
                        "You scored ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "font-bold text-blue-600",
                            children: score
                        }, void 0, false, {
                            fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                            lineNumber: 107,
                            columnNumber: 22
                        }, this),
                        " ",
                        "out of ",
                        totalQuestions
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                    lineNumber: 106,
                    columnNumber: 9
                }, this),
                customEndGameContent,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: null,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AssignmentSubmitter, {
                        isGameOver: isGameOver,
                        score: score,
                        totalQuestions: totalQuestions,
                        questionType: questionType
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                        lineNumber: 114,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                    lineNumber: 113,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "outline",
                            size: "lg",
                            onClick: onExit,
                            children: "Back to Menu"
                        }, void 0, false, {
                            fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                            lineNumber: 123,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: onRestart,
                            size: "lg",
                            className: "gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                                    lineNumber: 135,
                                    columnNumber: 13
                                }, this),
                                "Try Again"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                            lineNumber: 130,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                    lineNumber: 122,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
            lineNumber: 99,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-screen max-h-screen bg-white dark:bg-slate-950 overflow-hidden font-sans",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "pt-8 md:pt-12 pb-4 md:pb-6 px-4 text-center border-b-[1px] border-red-100 dark:border-red-900/30 shrink-0 relative bg-white dark:bg-slate-950 z-10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col items-center justify-center gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight",
                                    children: showTranslation ? instructionEn || instructionFr || localizedInstruction : localizedInstruction || instructionFr || instructionEn
                                }, void 0, false, {
                                    fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                                    lineNumber: 150,
                                    columnNumber: 13
                                }, this),
                                (instructionFr && instructionEn || localizedInstruction && instructionEn) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: "ghost",
                                    size: "icon",
                                    onClick: ()=>setShowTranslation(!showTranslation),
                                    className: "rounded-full w-8 h-8 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors",
                                    title: "Translate",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$languages$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Languages$3e$__["Languages"], {
                                        className: "w-5 h-5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                                        lineNumber: 165,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                                    lineNumber: 158,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                            lineNumber: 149,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-full max-w-sm mt-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$ProgressBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProgressBar"], {
                                current: currentQuestionIndex !== undefined ? currentQuestionIndex : Math.round(progress / 100 * totalQuestions),
                                total: totalQuestions,
                                label: "Questions"
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                                lineNumber: 174,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                            lineNumber: 173,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                    lineNumber: 148,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                lineNumber: 146,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex flex-col items-center justify-start p-6 overflow-y-auto w-full max-w-[95%] mx-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full h-full flex flex-col justify-start items-center pt-8",
                    children: children
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                    lineNumber: 189,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                lineNumber: 188,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("py-4 md:py-6 px-4 md:px-8 border-t-[1px] shrink-0 flex items-center justify-between w-full z-10 transition-colors duration-300", showFeedback ? isCorrect ? "bg-green-100 dark:bg-green-900/30 border-green-500" : "bg-red-100 dark:bg-red-900/30 border-red-500" : "bg-white dark:bg-slate-950 border-red-100 dark:border-red-900/30"),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-4 flex-1",
                        children: showFeedback ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                            children: [
                                isCorrect ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                    className: "w-8 h-8 text-green-600 dark:text-green-400 shrink-0"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                                    lineNumber: 209,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                    className: "w-8 h-8 text-red-600 dark:text-red-400 shrink-0"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                                    lineNumber: 211,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-lg md:text-xl font-bold leading-tight", isCorrect ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"),
                                            children: feedbackMessage
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                                            lineNumber: 214,
                                            columnNumber: 17
                                        }, this),
                                        !isCorrect && correctAnswer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-red-700 dark:text-red-300 text-sm font-medium",
                                            children: [
                                                "Correct Answer: ",
                                                correctAnswer
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                                            lineNumber: 225,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                                    lineNumber: 213,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                            lineNumber: 207,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-xl md:text-3xl font-bold font-mono tracking-wider min-w-[60px] md:min-w-[80px] transition-colors", // Timer Styling default
                            "text-gray-800 dark:text-gray-200"),
                            children: timerValue || ""
                        }, void 0, false, {
                            fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                            lineNumber: 232,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                        lineNumber: 205,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "shrink-0 ml-4",
                        children: showSubmitButton && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onNext,
                            disabled: !isSubmitEnabled,
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("px-6 md:px-8 py-3 md:py-6 text-base md:text-lg font-bold rounded-xl uppercase tracking-wider shadow-lg transition-transform active:scale-95 min-w-[120px] md:min-w-[140px]", showFeedback ? isCorrect ? "bg-green-600 hover:bg-green-700 text-white border-b-4 border-green-700 active:border-b-0" : "bg-red-600 hover:bg-red-700 text-white border-b-4 border-red-700 active:border-b-0" : !isSubmitEnabled ? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-400" : "bg-sky-400 hover:bg-sky-500 text-white border-b-4 border-sky-500 active:border-b-0"),
                            children: submitLabel
                        }, void 0, false, {
                            fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                            lineNumber: 247,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                        lineNumber: 245,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
                lineNumber: 194,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/PracticeGameLayout.tsx",
        lineNumber: 144,
        columnNumber: 5
    }, this);
}
_s1(PracticeGameLayout, "coeOdSCMt23k8/juKMOyOX0ZfrI=");
_c1 = PracticeGameLayout;
var _c, _c1;
__turbopack_context__.k.register(_c, "AssignmentSubmitter");
__turbopack_context__.k.register(_c1, "PracticeGameLayout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/services/vocabularyApi.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkApiHealth",
    ()=>checkApiHealth,
    "createClass",
    ()=>createClass,
    "createClassAssignment",
    ()=>createClassAssignment,
    "deleteClass",
    ()=>deleteClass,
    "deleteRelationship",
    ()=>deleteRelationship,
    "fetchAllTopics",
    ()=>fetchAllTopics,
    "fetchAvailableCategories",
    ()=>fetchAvailableCategories,
    "fetchAvailableLevels",
    ()=>fetchAvailableLevels,
    "fetchAvailableQuestionTypes",
    ()=>fetchAvailableQuestionTypes,
    "fetchCategoriesByLevel",
    ()=>fetchCategoriesByLevel,
    "fetchClassDetails",
    ()=>fetchClassDetails,
    "fetchClasses",
    ()=>fetchClasses,
    "fetchCompletePassageData",
    ()=>fetchCompletePassageData,
    "fetchDictationImageData",
    ()=>fetchDictationImageData,
    "fetchFriends",
    ()=>fetchFriends,
    "fetchLearningQueue",
    ()=>fetchLearningQueue,
    "fetchLessonWords",
    ()=>fetchLessonWords,
    "fetchMatchPairsData",
    ()=>fetchMatchPairsData,
    "fetchPracticeQuestions",
    ()=>fetchPracticeQuestions,
    "fetchRepeatSentenceData",
    ()=>fetchRepeatSentenceData,
    "fetchSrsDue",
    ()=>fetchSrsDue,
    "fetchStudentClasses",
    ()=>fetchStudentClasses,
    "fetchStudentTeachers",
    ()=>fetchStudentTeachers,
    "fetchSummaryCompletionData",
    ()=>fetchSummaryCompletionData,
    "fetchTeacherStudents",
    ()=>fetchTeacherStudents,
    "fetchTeachers",
    ()=>fetchTeachers,
    "fetchVocabulary",
    ()=>fetchVocabulary,
    "fetchWhatDoYouSeeData",
    ()=>fetchWhatDoYouSeeData,
    "fetchWriteAnalysisData",
    ()=>fetchWriteAnalysisData,
    "fetchWritingDocuments",
    ()=>fetchWritingDocuments,
    "linkStudentToTeacher",
    ()=>linkStudentToTeacher,
    "rateSrsCard",
    ()=>rateSrsCard,
    "requestConnection",
    ()=>requestConnection,
    "saveUserProgress",
    ()=>saveUserProgress,
    "searchProfiles",
    ()=>searchProfiles,
    "updateClass",
    ()=>updateClass,
    "updateRelationshipStatus",
    ()=>updateRelationshipStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const API_BASE_URL = ("TURBOPACK compile-time value", "https://language-backend-v8sy.onrender.com") || "https://language-api-mine.onrender.com";
// Toggle to force CSV mock data instead of API calls
const USE_MOCK_CSV_DATA = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_USE_MOCK_CSV_DATA === "true" || ("TURBOPACK compile-time value", "object") !== "undefined" && localStorage.getItem("USE_MOCK_CSV_DATA") === "true";
/**
 * Fetch vocabulary with optional filtering
 */ const CSV_TRANSFORMERS = {
    audio_to_audio: (row)=>({
            external_id: row.ExerciseID || `audio_to_audio_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                Audio: row["Audio"] ? row["Audio"].startsWith("[") || row["Audio"].startsWith("{") ? JSON.parse(row["Audio"]) : row["Audio"] : "",
                Option1: row["Option1"] ? row["Option1"].startsWith("[") || row["Option1"].startsWith("{") ? JSON.parse(row["Option1"]) : row["Option1"] : "",
                Option1_EN: row["Option1_EN"] ? row["Option1_EN"].startsWith("[") || row["Option1_EN"].startsWith("{") ? JSON.parse(row["Option1_EN"]) : row["Option1_EN"] : "",
                Option2: row["Option2"] ? row["Option2"].startsWith("[") || row["Option2"].startsWith("{") ? JSON.parse(row["Option2"]) : row["Option2"] : "",
                Option2_EN: row["Option2_EN"] ? row["Option2_EN"].startsWith("[") || row["Option2_EN"].startsWith("{") ? JSON.parse(row["Option2_EN"]) : row["Option2_EN"] : "",
                Option3: row["Option3"] ? row["Option3"].startsWith("[") || row["Option3"].startsWith("{") ? JSON.parse(row["Option3"]) : row["Option3"] : "",
                Option3_EN: row["Option3_EN"] ? row["Option3_EN"].startsWith("[") || row["Option3_EN"].startsWith("{") ? JSON.parse(row["Option3_EN"]) : row["Option3_EN"] : "",
                Option4: row["Option4"] ? row["Option4"].startsWith("[") || row["Option4"].startsWith("{") ? JSON.parse(row["Option4"]) : row["Option4"] : "",
                Option4_EN: row["Option4_EN"] ? row["Option4_EN"].startsWith("[") || row["Option4_EN"].startsWith("{") ? JSON.parse(row["Option4_EN"]) : row["Option4_EN"] : "",
                CorrectAnswer: row["CorrectAnswer"] ? row["CorrectAnswer"].startsWith("[") || row["CorrectAnswer"].startsWith("{") ? JSON.parse(row["CorrectAnswer"]) : row["CorrectAnswer"] : "",
                CompleteSentence: row["CompleteSentence"] ? row["CompleteSentence"].startsWith("[") || row["CompleteSentence"].startsWith("{") ? JSON.parse(row["CompleteSentence"]) : row["CompleteSentence"] : "",
                SentenceWithBlank: row["SentenceWithBlank"] ? row["SentenceWithBlank"].startsWith("[") || row["SentenceWithBlank"].startsWith("{") ? JSON.parse(row["SentenceWithBlank"]) : row["SentenceWithBlank"] : ""
            },
            evaluation: {
                correctAnswer: row["eval_correctAnswer"] ? row["eval_correctAnswer"].startsWith("[") || row["eval_correctAnswer"].startsWith("{") ? JSON.parse(row["eval_correctAnswer"]) : row["eval_correctAnswer"] : ""
            }
        }),
    "B5_Fill blanks_Audio": (row)=>({
            external_id: row.ExerciseID || `B5_Fill blanks_Audio_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                Audio: row["Audio"] ? row["Audio"].startsWith("[") || row["Audio"].startsWith("{") ? JSON.parse(row["Audio"]) : row["Audio"] : "",
                Option1: row["Option1"] ? row["Option1"].startsWith("[") || row["Option1"].startsWith("{") ? JSON.parse(row["Option1"]) : row["Option1"] : "",
                Option2: row["Option2"] ? row["Option2"].startsWith("[") || row["Option2"].startsWith("{") ? JSON.parse(row["Option2"]) : row["Option2"] : "",
                Option3: row["Option3"] ? row["Option3"].startsWith("[") || row["Option3"].startsWith("{") ? JSON.parse(row["Option3"]) : row["Option3"] : "",
                Option4: row["Option4"] ? row["Option4"].startsWith("[") || row["Option4"].startsWith("{") ? JSON.parse(row["Option4"]) : row["Option4"] : "",
                CorrectAnswer: row["CorrectAnswer"] ? row["CorrectAnswer"].startsWith("[") || row["CorrectAnswer"].startsWith("{") ? JSON.parse(row["CorrectAnswer"]) : row["CorrectAnswer"] : "",
                CompleteSentence: row["CompleteSentence"] ? row["CompleteSentence"].startsWith("[") || row["CompleteSentence"].startsWith("{") ? JSON.parse(row["CompleteSentence"]) : row["CompleteSentence"] : "",
                SentenceWithBlank: row["SentenceWithBlank"] ? row["SentenceWithBlank"].startsWith("[") || row["SentenceWithBlank"].startsWith("{") ? JSON.parse(row["SentenceWithBlank"]) : row["SentenceWithBlank"] : ""
            },
            evaluation: {
                correctAnswer: row["eval_correctAnswer"] ? row["eval_correctAnswer"].startsWith("[") || row["eval_correctAnswer"].startsWith("{") ? JSON.parse(row["eval_correctAnswer"]) : row["eval_correctAnswer"] : ""
            }
        }),
    b5_fill_blanks_audio: (row)=>({
            external_id: row.ExerciseID || `b5_fill_blanks_audio_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                Audio: row["Audio"] ? row["Audio"].startsWith("[") || row["Audio"].startsWith("{") ? JSON.parse(row["Audio"]) : row["Audio"] : "",
                Option1: row["Option1"] ? row["Option1"].startsWith("[") || row["Option1"].startsWith("{") ? JSON.parse(row["Option1"]) : row["Option1"] : "",
                Option2: row["Option2"] ? row["Option2"].startsWith("[") || row["Option2"].startsWith("{") ? JSON.parse(row["Option2"]) : row["Option2"] : "",
                Option3: row["Option3"] ? row["Option3"].startsWith("[") || row["Option3"].startsWith("{") ? JSON.parse(row["Option3"]) : row["Option3"] : "",
                Option4: row["Option4"] ? row["Option4"].startsWith("[") || row["Option4"].startsWith("{") ? JSON.parse(row["Option4"]) : row["Option4"] : "",
                CorrectAnswer: row["CorrectAnswer"] ? row["CorrectAnswer"].startsWith("[") || row["CorrectAnswer"].startsWith("{") ? JSON.parse(row["CorrectAnswer"]) : row["CorrectAnswer"] : "",
                CompleteSentence: row["CompleteSentence"] ? row["CompleteSentence"].startsWith("[") || row["CompleteSentence"].startsWith("{") ? JSON.parse(row["CompleteSentence"]) : row["CompleteSentence"] : "",
                SentenceWithBlank: row["SentenceWithBlank"] ? row["SentenceWithBlank"].startsWith("[") || row["SentenceWithBlank"].startsWith("{") ? JSON.parse(row["SentenceWithBlank"]) : row["SentenceWithBlank"] : ""
            },
            evaluation: {
                correctAnswer: row["eval_correctAnswer"] ? row["eval_correctAnswer"].startsWith("[") || row["eval_correctAnswer"].startsWith("{") ? JSON.parse(row["eval_correctAnswer"]) : row["eval_correctAnswer"] : ""
            }
        }),
    choose_options: (row)=>({
            external_id: row.ExerciseID || `choose_options_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                Option1: row["Option1"] ? row["Option1"].startsWith("[") || row["Option1"].startsWith("{") ? JSON.parse(row["Option1"]) : row["Option1"] : "",
                Option1_EN: row["Option1_EN"] ? row["Option1_EN"].startsWith("[") || row["Option1_EN"].startsWith("{") ? JSON.parse(row["Option1_EN"]) : row["Option1_EN"] : "",
                Option2: row["Option2"] ? row["Option2"].startsWith("[") || row["Option2"].startsWith("{") ? JSON.parse(row["Option2"]) : row["Option2"] : "",
                Option2_EN: row["Option2_EN"] ? row["Option2_EN"].startsWith("[") || row["Option2_EN"].startsWith("{") ? JSON.parse(row["Option2_EN"]) : row["Option2_EN"] : "",
                Option3: row["Option3"] ? row["Option3"].startsWith("[") || row["Option3"].startsWith("{") ? JSON.parse(row["Option3"]) : row["Option3"] : "",
                Option3_EN: row["Option3_EN"] ? row["Option3_EN"].startsWith("[") || row["Option3_EN"].startsWith("{") ? JSON.parse(row["Option3_EN"]) : row["Option3_EN"] : "",
                Option4: row["Option4"] ? row["Option4"].startsWith("[") || row["Option4"].startsWith("{") ? JSON.parse(row["Option4"]) : row["Option4"] : "",
                Option4_EN: row["Option4_EN"] ? row["Option4_EN"].startsWith("[") || row["Option4_EN"].startsWith("{") ? JSON.parse(row["Option4_EN"]) : row["Option4_EN"] : "",
                options: row["options"] ? row["options"].startsWith("[") || row["options"].startsWith("{") ? JSON.parse(row["options"]) : row["options"] : "",
                Question: row["Question"] ? row["Question"].startsWith("[") || row["Question"].startsWith("{") ? JSON.parse(row["Question"]) : row["Question"] : "",
                question: row["question"] ? row["question"].startsWith("[") || row["question"].startsWith("{") ? JSON.parse(row["question"]) : row["question"] : "",
                correctAnswer: row["correctAnswer"] ? row["correctAnswer"].startsWith("[") || row["correctAnswer"].startsWith("{") ? JSON.parse(row["correctAnswer"]) : row["correctAnswer"] : "",
                ShuffleOptions: row["ShuffleOptions"] ? row["ShuffleOptions"].startsWith("[") || row["ShuffleOptions"].startsWith("{") ? JSON.parse(row["ShuffleOptions"]) : row["ShuffleOptions"] : "",
                "Complete sentence": row["Complete sentence"] ? row["Complete sentence"].startsWith("[") || row["Complete sentence"].startsWith("{") ? JSON.parse(row["Complete sentence"]) : row["Complete sentence"] : "",
                CorrectOptionIndex: row["CorrectOptionIndex"] ? row["CorrectOptionIndex"].startsWith("[") || row["CorrectOptionIndex"].startsWith("{") ? JSON.parse(row["CorrectOptionIndex"]) : row["CorrectOptionIndex"] : ""
            },
            evaluation: {
                BlankIndex: row["eval_BlankIndex"] ? row["eval_BlankIndex"].startsWith("[") || row["eval_BlankIndex"].startsWith("{") ? JSON.parse(row["eval_BlankIndex"]) : row["eval_BlankIndex"] : "",
                CorrectAnswer: row["eval_CorrectAnswer"] ? row["eval_CorrectAnswer"].startsWith("[") || row["eval_CorrectAnswer"].startsWith("{") ? JSON.parse(row["eval_CorrectAnswer"]) : row["eval_CorrectAnswer"] : "",
                "Correct Explanation_EN": row["eval_Correct Explanation_EN"] ? row["eval_Correct Explanation_EN"].startsWith("[") || row["eval_Correct Explanation_EN"].startsWith("{") ? JSON.parse(row["eval_Correct Explanation_EN"]) : row["eval_Correct Explanation_EN"] : ""
            }
        }),
    complete_passage_dropdown: (row)=>({
            external_id: row.ExerciseID || `complete_passage_dropdown_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                fullText: row["fullText"] ? row["fullText"].startsWith("[") || row["fullText"].startsWith("{") ? JSON.parse(row["fullText"]) : row["fullText"] : "",
                passageSegments: row["passageSegments"] ? row["passageSegments"].startsWith("[") || row["passageSegments"].startsWith("{") ? JSON.parse(row["passageSegments"]) : row["passageSegments"] : ""
            },
            evaluation: {
                blanksData: row["eval_blanksData"] ? row["eval_blanksData"].startsWith("[") || row["eval_blanksData"].startsWith("{") ? JSON.parse(row["eval_blanksData"]) : row["eval_blanksData"] : ""
            }
        }),
    correct_spelling: (row)=>({
            external_id: row.ExerciseID || `correct_spelling_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                hint: row["hint"] ? row["hint"].startsWith("[") || row["hint"].startsWith("{") ? JSON.parse(row["hint"]) : row["hint"] : "",
                correctText: row["correctText"] ? row["correctText"].startsWith("[") || row["correctText"].startsWith("{") ? JSON.parse(row["correctText"]) : row["correctText"] : "",
                incorrectText: row["incorrectText"] ? row["incorrectText"].startsWith("[") || row["incorrectText"].startsWith("{") ? JSON.parse(row["incorrectText"]) : row["incorrectText"] : "",
                englishTranslation: row["englishTranslation"] ? row["englishTranslation"].startsWith("[") || row["englishTranslation"].startsWith("{") ? JSON.parse(row["englishTranslation"]) : row["englishTranslation"] : ""
            },
            evaluation: {
                errorCount: row["eval_errorCount"] ? row["eval_errorCount"].startsWith("[") || row["eval_errorCount"].startsWith("{") ? JSON.parse(row["eval_errorCount"]) : row["eval_errorCount"] : "",
                correctAnswer: row["eval_correctAnswer"] ? row["eval_correctAnswer"].startsWith("[") || row["eval_correctAnswer"].startsWith("{") ? JSON.parse(row["eval_correctAnswer"]) : row["eval_correctAnswer"] : ""
            }
        }),
    diagram_mapping: (row)=>({
            external_id: row.ExerciseID || `diagram_mapping_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                title: row["title"] ? row["title"].startsWith("[") || row["title"].startsWith("{") ? JSON.parse(row["title"]) : row["title"] : "",
                options: row["options"] ? row["options"].startsWith("[") || row["options"].startsWith("{") ? JSON.parse(row["options"]) : row["options"] : "",
                imagePath: row["imagePath"] ? row["imagePath"].startsWith("[") || row["imagePath"].startsWith("{") ? JSON.parse(row["imagePath"]) : row["imagePath"] : "",
                questions: row["questions"] ? row["questions"].startsWith("[") || row["questions"].startsWith("{") ? JSON.parse(row["questions"]) : row["questions"] : "",
                paragraphs: row["paragraphs"] ? row["paragraphs"].startsWith("[") || row["paragraphs"].startsWith("{") ? JSON.parse(row["paragraphs"]) : row["paragraphs"] : ""
            }
        }),
    dictation_image: (row)=>({
            external_id: row.ExerciseID || `dictation_image_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                Image: row["Image"] ? row["Image"].startsWith("[") || row["Image"].startsWith("{") ? JSON.parse(row["Image"]) : row["Image"] : "",
                Question_EN: row["Question_EN"] ? row["Question_EN"].startsWith("[") || row["Question_EN"].startsWith("{") ? JSON.parse(row["Question_EN"]) : row["Question_EN"] : "",
                Question_FR: row["Question_FR"] ? row["Question_FR"].startsWith("[") || row["Question_FR"].startsWith("{") ? JSON.parse(row["Question_FR"]) : row["Question_FR"] : "",
                CaseSensitive: row["CaseSensitive"] ? row["CaseSensitive"].startsWith("[") || row["CaseSensitive"].startsWith("{") ? JSON.parse(row["CaseSensitive"]) : row["CaseSensitive"] : "",
                MaxCharacters: row["MaxCharacters"] ? row["MaxCharacters"].startsWith("[") || row["MaxCharacters"].startsWith("{") ? JSON.parse(row["MaxCharacters"]) : row["MaxCharacters"] : "",
                MinCharacters: row["MinCharacters"] ? row["MinCharacters"].startsWith("[") || row["MinCharacters"].startsWith("{") ? JSON.parse(row["MinCharacters"]) : row["MinCharacters"] : ""
            },
            evaluation: {
                CorrectAnswer: row["eval_CorrectAnswer"] ? row["eval_CorrectAnswer"].startsWith("[") || row["eval_CorrectAnswer"].startsWith("{") ? JSON.parse(row["eval_CorrectAnswer"]) : row["eval_CorrectAnswer"] : ""
            }
        }),
    fill_blanks: (row)=>({
            external_id: row.ExerciseID || `fill_blanks_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                wordBank: row["wordBank"] ? row["wordBank"].startsWith("[") || row["wordBank"].startsWith("{") ? JSON.parse(row["wordBank"]) : row["wordBank"] : "",
                sentenceWithBlank: row["sentenceWithBlank"] ? row["sentenceWithBlank"].startsWith("[") || row["sentenceWithBlank"].startsWith("{") ? JSON.parse(row["sentenceWithBlank"]) : row["sentenceWithBlank"] : "",
                englishTranslation: row["englishTranslation"] ? row["englishTranslation"].startsWith("[") || row["englishTranslation"].startsWith("{") ? JSON.parse(row["englishTranslation"]) : row["englishTranslation"] : ""
            },
            evaluation: {
                correctAnswer: row["eval_correctAnswer"] ? row["eval_correctAnswer"].startsWith("[") || row["eval_correctAnswer"].startsWith("{") ? JSON.parse(row["eval_correctAnswer"]) : row["eval_correctAnswer"] : ""
            }
        }),
    fill_blanks_options: (row)=>({
            external_id: row.ExerciseID || `fill_blanks_options_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                options: row["options"] ? row["options"].startsWith("[") || row["options"].startsWith("{") ? JSON.parse(row["options"]) : row["options"] : "",
                sentence: row["sentence"] ? row["sentence"].startsWith("[") || row["sentence"].startsWith("{") ? JSON.parse(row["sentence"]) : row["sentence"] : ""
            },
            evaluation: {
                translation: row["eval_translation"] ? row["eval_translation"].startsWith("[") || row["eval_translation"].startsWith("{") ? JSON.parse(row["eval_translation"]) : row["eval_translation"] : "",
                correctIndex: row["eval_correctIndex"] ? row["eval_correctIndex"].startsWith("[") || row["eval_correctIndex"].startsWith("{") ? JSON.parse(row["eval_correctIndex"]) : row["eval_correctIndex"] : ""
            }
        }),
    fill_blank_typed: (row)=>({
            external_id: row.ExerciseID || `fill_blank_typed_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                Question: row["Question"] ? row["Question"].startsWith("[") || row["Question"].startsWith("{") ? JSON.parse(row["Question"]) : row["Question"] : "",
                ShuffleOptions: row["ShuffleOptions"] ? row["ShuffleOptions"].startsWith("[") || row["ShuffleOptions"].startsWith("{") ? JSON.parse(row["ShuffleOptions"]) : row["ShuffleOptions"] : "",
                sentenceWithBlank: row["sentenceWithBlank"] ? row["sentenceWithBlank"].startsWith("[") || row["sentenceWithBlank"].startsWith("{") ? JSON.parse(row["sentenceWithBlank"]) : row["sentenceWithBlank"] : ""
            },
            evaluation: {
                BlankIndex: row["eval_BlankIndex"] ? row["eval_BlankIndex"].startsWith("[") || row["eval_BlankIndex"].startsWith("{") ? JSON.parse(row["eval_BlankIndex"]) : row["eval_BlankIndex"] : "",
                CorrectAnswer: row["eval_CorrectAnswer"] ? row["eval_CorrectAnswer"].startsWith("[") || row["eval_CorrectAnswer"].startsWith("{") ? JSON.parse(row["eval_CorrectAnswer"]) : row["eval_CorrectAnswer"] : "",
                correctAnswer: row["eval_correctAnswer"] ? row["eval_correctAnswer"].startsWith("[") || row["eval_correctAnswer"].startsWith("{") ? JSON.parse(row["eval_correctAnswer"]) : row["eval_correctAnswer"] : "",
                CorrectExplanation_EN: row["eval_CorrectExplanation_EN"] ? row["eval_CorrectExplanation_EN"].startsWith("[") || row["eval_CorrectExplanation_EN"].startsWith("{") ? JSON.parse(row["eval_CorrectExplanation_EN"]) : row["eval_CorrectExplanation_EN"] : ""
            }
        }),
    four_options: (row)=>({
            external_id: row.ExerciseID || `four_options_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                options: row["options"] ? row["options"].startsWith("[") || row["options"].startsWith("{") ? JSON.parse(row["options"]) : row["options"] : "",
                question: row["question"] ? row["question"].startsWith("[") || row["question"].startsWith("{") ? JSON.parse(row["question"]) : row["question"] : "",
                sentence: row["sentence"] ? row["sentence"].startsWith("[") || row["sentence"].startsWith("{") ? JSON.parse(row["sentence"]) : row["sentence"] : ""
            },
            evaluation: {
                translation: row["eval_translation"] ? row["eval_translation"].startsWith("[") || row["eval_translation"].startsWith("{") ? JSON.parse(row["eval_translation"]) : row["eval_translation"] : "",
                correctIndex: row["eval_correctIndex"] ? row["eval_correctIndex"].startsWith("[") || row["eval_correctIndex"].startsWith("{") ? JSON.parse(row["eval_correctIndex"]) : row["eval_correctIndex"] : ""
            }
        }),
    grammar_find_error: (row)=>({
            external_id: row.ExerciseID || `grammar_find_error_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                correct_text: row["correct_text"] ? row["correct_text"].startsWith("[") || row["correct_text"].startsWith("{") ? JSON.parse(row["correct_text"]) : row["correct_text"] : "",
                sentence_parts: row["sentence_parts"] ? row["sentence_parts"].startsWith("[") || row["sentence_parts"].startsWith("{") ? JSON.parse(row["sentence_parts"]) : row["sentence_parts"] : ""
            },
            evaluation: {
                error_index: row["eval_error_index"] ? row["eval_error_index"].startsWith("[") || row["eval_error_index"].startsWith("{") ? JSON.parse(row["eval_error_index"]) : row["eval_error_index"] : ""
            }
        }),
    grammar_reorder: (row)=>({
            external_id: row.ExerciseID || `grammar_reorder_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                sentence: row["sentence"] ? row["sentence"].startsWith("[") || row["sentence"].startsWith("{") ? JSON.parse(row["sentence"]) : row["sentence"] : ""
            },
            evaluation: {
                translation: row["eval_translation"] ? row["eval_translation"].startsWith("[") || row["eval_translation"].startsWith("{") ? JSON.parse(row["eval_translation"]) : row["eval_translation"] : ""
            }
        }),
    grammar_rewrite: (row)=>({
            external_id: row.ExerciseID || `grammar_rewrite_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                sentence: row["sentence"] ? row["sentence"].startsWith("[") || row["sentence"].startsWith("{") ? JSON.parse(row["sentence"]) : row["sentence"] : ""
            },
            evaluation: {
                answer: row["eval_answer"] ? row["eval_answer"].startsWith("[") || row["eval_answer"].startsWith("{") ? JSON.parse(row["eval_answer"]) : row["eval_answer"] : ""
            }
        }),
    grammar_transformation: (row)=>({
            external_id: row.ExerciseID || `grammar_transformation_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                sentence: row["sentence"] ? row["sentence"].startsWith("[") || row["sentence"].startsWith("{") ? JSON.parse(row["sentence"]) : row["sentence"] : ""
            },
            evaluation: {
                answer: row["eval_answer"] ? row["eval_answer"].startsWith("[") || row["eval_answer"].startsWith("{") ? JSON.parse(row["eval_answer"]) : row["eval_answer"] : "",
                translation: row["eval_translation"] ? row["eval_translation"].startsWith("[") || row["eval_translation"].startsWith("{") ? JSON.parse(row["eval_translation"]) : row["eval_translation"] : ""
            }
        }),
    group_words: (row)=>({
            external_id: row.ExerciseID || `group_words_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                theme: row["theme"] ? row["theme"].startsWith("[") || row["theme"].startsWith("{") ? JSON.parse(row["theme"]) : row["theme"] : "",
                otherWords: row["otherWords"] ? row["otherWords"].startsWith("[") || row["otherWords"].startsWith("{") ? JSON.parse(row["otherWords"]) : row["otherWords"] : "",
                explanation: row["explanation"] ? row["explanation"].startsWith("[") || row["explanation"].startsWith("{") ? JSON.parse(row["explanation"]) : row["explanation"] : "",
                correctGroup: row["correctGroup"] ? row["correctGroup"].startsWith("[") || row["correctGroup"].startsWith("{") ? JSON.parse(row["correctGroup"]) : row["correctGroup"] : "",
                correctGroup_EN: row["correctGroup_EN"] ? row["correctGroup_EN"].startsWith("[") || row["correctGroup_EN"].startsWith("{") ? JSON.parse(row["correctGroup_EN"]) : row["correctGroup_EN"] : "",
                otherWords_EN: row["otherWords_EN"] ? row["otherWords_EN"].startsWith("[") || row["otherWords_EN"].startsWith("{") ? JSON.parse(row["otherWords_EN"]) : row["otherWords_EN"] : ""
            },
            evaluation: {
                correctGroup: row["eval_correctGroup"] ? row["eval_correctGroup"].startsWith("[") || row["eval_correctGroup"].startsWith("{") ? JSON.parse(row["eval_correctGroup"]) : row["eval_correctGroup"] : ""
            }
        }),
    highlight_text: (row)=>({
            external_id: row.ExerciseID || `highlight_text_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                title: row["title"] ? row["title"].startsWith("[") || row["title"].startsWith("{") ? JSON.parse(row["title"]) : row["title"] : "",
                passage: row["passage"] ? row["passage"].startsWith("[") || row["passage"].startsWith("{") ? JSON.parse(row["passage"]) : row["passage"] : "",
                question: row["question"] ? row["question"].startsWith("[") || row["question"].startsWith("{") ? JSON.parse(row["question"]) : row["question"] : "",
                questionTitle: row["questionTitle"] ? row["questionTitle"].startsWith("[") || row["questionTitle"].startsWith("{") ? JSON.parse(row["questionTitle"]) : row["questionTitle"] : ""
            },
            evaluation: {
                requiredCore: row["eval_requiredCore"] ? row["eval_requiredCore"].startsWith("[") || row["eval_requiredCore"].startsWith("{") ? JSON.parse(row["eval_requiredCore"]) : row["eval_requiredCore"] : "",
                correctAnswer: row["eval_correctAnswer"] ? row["eval_correctAnswer"].startsWith("[") || row["eval_correctAnswer"].startsWith("{") ? JSON.parse(row["eval_correctAnswer"]) : row["eval_correctAnswer"] : "",
                acceptableBoundary: row["eval_acceptableBoundary"] ? row["eval_acceptableBoundary"].startsWith("[") || row["eval_acceptableBoundary"].startsWith("{") ? JSON.parse(row["eval_acceptableBoundary"]) : row["eval_acceptableBoundary"] : ""
            }
        }),
    highlight_word: (row)=>({
            external_id: row.ExerciseID || `highlight_word_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                passage: row["passage"] ? row["passage"].startsWith("[") || row["passage"].startsWith("{") ? JSON.parse(row["passage"]) : row["passage"] : "",
                question: row["question"] ? row["question"].startsWith("[") || row["question"].startsWith("{") ? JSON.parse(row["question"]) : row["question"] : ""
            },
            evaluation: {
                correctWord: row["eval_correctWord"] ? row["eval_correctWord"].startsWith("[") || row["eval_correctWord"].startsWith("{") ? JSON.parse(row["eval_correctWord"]) : row["eval_correctWord"] : ""
            }
        }),
    image_labelling: (row)=>({
            external_id: row.ExerciseID || `image_labelling_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                image: row["image"] ? row["image"].startsWith("[") || row["image"].startsWith("{") ? JSON.parse(row["image"]) : row["image"] : "",
                items: row["items"] ? row["items"].startsWith("[") || row["items"].startsWith("{") ? JSON.parse(row["items"]) : row["items"] : "",
                title: row["title"] ? row["title"].startsWith("[") || row["title"].startsWith("{") ? JSON.parse(row["title"]) : row["title"] : ""
            }
        }),
    image_mcq: (row)=>({
            external_id: row.ExerciseID || `image_mcq_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                options: row["options"] ? row["options"].startsWith("[") || row["options"].startsWith("{") ? JSON.parse(row["options"]) : row["options"] : "",
                imageAlt: row["imageAlt"] ? row["imageAlt"].startsWith("[") || row["imageAlt"].startsWith("{") ? JSON.parse(row["imageAlt"]) : row["imageAlt"] : "",
                question: row["question"] ? row["question"].startsWith("[") || row["question"].startsWith("{") ? JSON.parse(row["question"]) : row["question"] : "",
                imageEmoji: row["imageEmoji"] ? row["imageEmoji"].startsWith("[") || row["imageEmoji"].startsWith("{") ? JSON.parse(row["imageEmoji"]) : row["imageEmoji"] : "",
                englishOptions: row["englishOptions"] ? row["englishOptions"].startsWith("[") || row["englishOptions"].startsWith("{") ? JSON.parse(row["englishOptions"]) : row["englishOptions"] : ""
            },
            evaluation: {
                correctIndex: row["eval_correctIndex"] ? row["eval_correctIndex"].startsWith("[") || row["eval_correctIndex"].startsWith("{") ? JSON.parse(row["eval_correctIndex"]) : row["eval_correctIndex"] : ""
            }
        }),
    is_french_word: (row)=>({
            external_id: row.ExerciseID || `is_french_word_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                word: row["word"] ? row["word"].startsWith("[") || row["word"].startsWith("{") ? JSON.parse(row["word"]) : row["word"] : "",
                isFrench: row["isFrench"] ? row["isFrench"].startsWith("[") || row["isFrench"].startsWith("{") ? JSON.parse(row["isFrench"]) : row["isFrench"] : "",
                correctAnswer: row["correctAnswer"] ? row["correctAnswer"].startsWith("[") || row["correctAnswer"].startsWith("{") ? JSON.parse(row["correctAnswer"]) : row["correctAnswer"] : ""
            },
            evaluation: {
                correctAnswer: row["eval_correctAnswer"] ? row["eval_correctAnswer"].startsWith("[") || row["eval_correctAnswer"].startsWith("{") ? JSON.parse(row["eval_correctAnswer"]) : row["eval_correctAnswer"] : ""
            }
        }),
    listening_conversation: (row)=>({
            external_id: row.ExerciseID || `listening_conversation_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                title: row["title"] ? row["title"].startsWith("[") || row["title"].startsWith("{") ? JSON.parse(row["title"]) : row["title"] : "",
                scenario: row["scenario"] ? row["scenario"].startsWith("[") || row["scenario"].startsWith("{") ? JSON.parse(row["scenario"]) : row["scenario"] : "",
                exchanges: row["exchanges"] ? row["exchanges"].startsWith("[") || row["exchanges"].startsWith("{") ? JSON.parse(row["exchanges"]) : row["exchanges"] : ""
            }
        }),
    listen_bubble: (row)=>({
            external_id: row.ExerciseID || `listen_bubble_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                sentence: row["sentence"] ? row["sentence"].startsWith("[") || row["sentence"].startsWith("{") ? JSON.parse(row["sentence"]) : row["sentence"] : "",
                audioText: row["audioText"] ? row["audioText"].startsWith("[") || row["audioText"].startsWith("{") ? JSON.parse(row["audioText"]) : row["audioText"] : "",
                translation: row["translation"] ? row["translation"].startsWith("[") || row["translation"].startsWith("{") ? JSON.parse(row["translation"]) : row["translation"] : ""
            }
        }),
    listen_fill_blanks: (row)=>({
            external_id: row.ExerciseID || `listen_fill_blanks_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                blanks: row["blanks"] ? row["blanks"].startsWith("[") || row["blanks"].startsWith("{") ? JSON.parse(row["blanks"]) : row["blanks"] : "",
                audioText: row["audioText"] ? row["audioText"].startsWith("[") || row["audioText"].startsWith("{") ? JSON.parse(row["audioText"]) : row["audioText"] : "",
                displayParts: row["displayParts"] ? row["displayParts"].startsWith("[") || row["displayParts"].startsWith("{") ? JSON.parse(row["displayParts"]) : row["displayParts"] : ""
            }
        }),
    listen_interactive: (row)=>({
            external_id: row.ExerciseID || `listen_interactive_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                context: row["context"] ? row["context"].startsWith("[") || row["context"].startsWith("{") ? JSON.parse(row["context"]) : row["context"] : "",
                exchanges: row["exchanges"] ? row["exchanges"].startsWith("[") || row["exchanges"].startsWith("{") ? JSON.parse(row["exchanges"]) : row["exchanges"] : "",
                timeLimitSeconds: row["timeLimitSeconds"] ? row["timeLimitSeconds"].startsWith("[") || row["timeLimitSeconds"].startsWith("{") ? JSON.parse(row["timeLimitSeconds"]) : row["timeLimitSeconds"] : ""
            }
        }),
    listen_order: (row)=>({
            external_id: row.ExerciseID || `listen_order_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                correctOrder: row["correctOrder"] ? row["correctOrder"].startsWith("[") || row["correctOrder"].startsWith("{") ? JSON.parse(row["correctOrder"]) : row["correctOrder"] : ""
            }
        }),
    listen_passage: (row)=>({
            external_id: row.ExerciseID || `listen_passage_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                questions: row["questions"] ? row["questions"].startsWith("[") || row["questions"].startsWith("{") ? JSON.parse(row["questions"]) : row["questions"] : "",
                passageText: row["passageText"] ? row["passageText"].startsWith("[") || row["passageText"].startsWith("{") ? JSON.parse(row["passageText"]) : row["passageText"] : ""
            }
        }),
    listen_phonetics: (row)=>({
            external_id: row.ExerciseID || `listen_phonetics_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                Audio: row["Audio"] ? row["Audio"].startsWith("[") || row["Audio"].startsWith("{") ? JSON.parse(row["Audio"]) : row["Audio"] : "",
                audio: row["audio"] ? row["audio"].startsWith("[") || row["audio"].startsWith("{") ? JSON.parse(row["audio"]) : row["audio"] : "",
                Option1: row["Option1"] ? row["Option1"].startsWith("[") || row["Option1"].startsWith("{") ? JSON.parse(row["Option1"]) : row["Option1"] : "",
                Option2: row["Option2"] ? row["Option2"].startsWith("[") || row["Option2"].startsWith("{") ? JSON.parse(row["Option2"]) : row["Option2"] : "",
                Option3: row["Option3"] ? row["Option3"].startsWith("[") || row["Option3"].startsWith("{") ? JSON.parse(row["Option3"]) : row["Option3"] : "",
                Option4: row["Option4"] ? row["Option4"].startsWith("[") || row["Option4"].startsWith("{") ? JSON.parse(row["Option4"]) : row["Option4"] : "",
                options: row["options"] ? row["options"].startsWith("[") || row["options"].startsWith("{") ? JSON.parse(row["options"]) : row["options"] : "",
                question: row["question"] ? row["question"].startsWith("[") || row["question"].startsWith("{") ? JSON.parse(row["question"]) : row["question"] : "",
                ShuffleOptions: row["ShuffleOptions"] ? row["ShuffleOptions"].startsWith("[") || row["ShuffleOptions"].startsWith("{") ? JSON.parse(row["ShuffleOptions"]) : row["ShuffleOptions"] : "",
                CorrectOptionIndex: row["CorrectOptionIndex"] ? row["CorrectOptionIndex"].startsWith("[") || row["CorrectOptionIndex"].startsWith("{") ? JSON.parse(row["CorrectOptionIndex"]) : row["CorrectOptionIndex"] : ""
            },
            evaluation: {
                BlankIndex: row["eval_BlankIndex"] ? row["eval_BlankIndex"].startsWith("[") || row["eval_BlankIndex"].startsWith("{") ? JSON.parse(row["eval_BlankIndex"]) : row["eval_BlankIndex"] : "",
                CorrectAnswer: row["eval_CorrectAnswer"] ? row["eval_CorrectAnswer"].startsWith("[") || row["eval_CorrectAnswer"].startsWith("{") ? JSON.parse(row["eval_CorrectAnswer"]) : row["eval_CorrectAnswer"] : "",
                correctAnswer: row["eval_correctAnswer"] ? row["eval_correctAnswer"].startsWith("[") || row["eval_correctAnswer"].startsWith("{") ? JSON.parse(row["eval_correctAnswer"]) : row["eval_correctAnswer"] : "",
                "Correct Explanation_EN": row["eval_Correct Explanation_EN"] ? row["eval_Correct Explanation_EN"].startsWith("[") || row["eval_Correct Explanation_EN"].startsWith("{") ? JSON.parse(row["eval_Correct Explanation_EN"]) : row["eval_Correct Explanation_EN"] : ""
            }
        }),
    listen_select: (row)=>({
            external_id: row.ExerciseID || `listen_select_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || ""
        }),
    listen_type: (row)=>({
            external_id: row.ExerciseID || `listen_type_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                hint: row["hint"] ? row["hint"].startsWith("[") || row["hint"].startsWith("{") ? JSON.parse(row["hint"]) : row["hint"] : "",
                audioText: row["audioText"] ? row["audioText"].startsWith("[") || row["audioText"].startsWith("{") ? JSON.parse(row["audioText"]) : row["audioText"] : "",
                englishText: row["englishText"] ? row["englishText"].startsWith("[") || row["englishText"].startsWith("{") ? JSON.parse(row["englishText"]) : row["englishText"] : ""
            }
        }),
    match_desc_game: (row)=>({
            external_id: row.ExerciseID || `match_desc_game_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                images: row["images"] ? row["images"].startsWith("[") || row["images"].startsWith("{") ? JSON.parse(row["images"]) : row["images"] : "",
                description: row["description"] ? row["description"].startsWith("[") || row["description"].startsWith("{") ? JSON.parse(row["description"]) : row["description"] : ""
            }
        }),
    match_pairs: (row)=>({
            external_id: row.ExerciseID || `match_pairs_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                pairs: row["pairs"] ? row["pairs"].startsWith("[") || row["pairs"].startsWith("{") ? JSON.parse(row["pairs"]) : row["pairs"] : "",
                pairMode: row["pairMode"] ? row["pairMode"].startsWith("[") || row["pairMode"].startsWith("{") ? JSON.parse(row["pairMode"]) : row["pairMode"] : ""
            }
        }),
    match_sentence_ending: (row)=>({
            external_id: row.ExerciseID || `match_sentence_ending_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                options: row["options"] ? row["options"].startsWith("[") || row["options"].startsWith("{") ? JSON.parse(row["options"]) : row["options"] : "",
                questions: row["questions"] ? row["questions"].startsWith("[") || row["questions"].startsWith("{") ? JSON.parse(row["questions"]) : row["questions"] : "",
                passageTitle: row["passageTitle"] ? row["passageTitle"].startsWith("[") || row["passageTitle"].startsWith("{") ? JSON.parse(row["passageTitle"]) : row["passageTitle"] : "",
                passageContent: row["passageContent"] ? row["passageContent"].startsWith("[") || row["passageContent"].startsWith("{") ? JSON.parse(row["passageContent"]) : row["passageContent"] : "",
                passageSubtitle: row["passageSubtitle"] ? row["passageSubtitle"].startsWith("[") || row["passageSubtitle"].startsWith("{") ? JSON.parse(row["passageSubtitle"]) : row["passageSubtitle"] : ""
            }
        }),
    odd_one_out: (row)=>({
            external_id: row.ExerciseID || `odd_one_out_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                words: row["words"] ? row["words"].startsWith("[") || row["words"].startsWith("{") ? JSON.parse(row["words"]) : row["words"] : "",
                Option1_EN: row["Option1_EN"] ? row["Option1_EN"].startsWith("[") || row["Option1_EN"].startsWith("{") ? JSON.parse(row["Option1_EN"]) : row["Option1_EN"] : "",
                Option2_EN: row["Option2_EN"] ? row["Option2_EN"].startsWith("[") || row["Option2_EN"].startsWith("{") ? JSON.parse(row["Option2_EN"]) : row["Option2_EN"] : "",
                Option3_EN: row["Option3_EN"] ? row["Option3_EN"].startsWith("[") || row["Option3_EN"].startsWith("{") ? JSON.parse(row["Option3_EN"]) : row["Option3_EN"] : "",
                Option4_EN: row["Option4_EN"] ? row["Option4_EN"].startsWith("[") || row["Option4_EN"].startsWith("{") ? JSON.parse(row["Option4_EN"]) : row["Option4_EN"] : "",
                reason: row["reason"] ? row["reason"].startsWith("[") || row["reason"].startsWith("{") ? JSON.parse(row["reason"]) : row["reason"] : "",
                correctAnswer: row["correctAnswer"] ? row["correctAnswer"].startsWith("[") || row["correctAnswer"].startsWith("{") ? JSON.parse(row["correctAnswer"]) : row["correctAnswer"] : ""
            },
            evaluation: {
                reason: row["eval_reason"] ? row["eval_reason"].startsWith("[") || row["eval_reason"].startsWith("{") ? JSON.parse(row["eval_reason"]) : row["eval_reason"] : "",
                correctAnswer: row["eval_correctAnswer"] ? row["eval_correctAnswer"].startsWith("[") || row["eval_correctAnswer"].startsWith("{") ? JSON.parse(row["eval_correctAnswer"]) : row["eval_correctAnswer"] : ""
            }
        }),
    odd_one_out_fr: (row)=>({
            external_id: row.ExerciseID || `odd_one_out_fr_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                id: row["id"] ? row["id"].startsWith("[") || row["id"].startsWith("{") ? JSON.parse(row["id"]) : row["id"] : "",
                words: row["words"] ? row["words"].startsWith("[") || row["words"].startsWith("{") ? JSON.parse(row["words"]) : row["words"] : "",
                correctAnswer: row["correctAnswer"] ? row["correctAnswer"].startsWith("[") || row["correctAnswer"].startsWith("{") ? JSON.parse(row["correctAnswer"]) : row["correctAnswer"] : "",
                reason: row["reason"] ? row["reason"].startsWith("[") || row["reason"].startsWith("{") ? JSON.parse(row["reason"]) : row["reason"] : "",
                instructionFr: row["instructionFr"] ? row["instructionFr"].startsWith("[") || row["instructionFr"].startsWith("{") ? JSON.parse(row["instructionFr"]) : row["instructionFr"] : "",
                instructionEn: row["instructionEn"] ? row["instructionEn"].startsWith("[") || row["instructionEn"].startsWith("{") ? JSON.parse(row["instructionEn"]) : row["instructionEn"] : "",
                words_EN: row["words_EN"] ? row["words_EN"].startsWith("[") || row["words_EN"].startsWith("{") ? JSON.parse(row["words_EN"]) : row["words_EN"] : ""
            }
        }),
    passage_mcq: (row)=>({
            external_id: row.ExerciseID || `passage_mcq_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                options: row["options"] ? row["options"].startsWith("[") || row["options"].startsWith("{") ? JSON.parse(row["options"]) : row["options"] : "",
                passage: row["passage"] ? row["passage"].startsWith("[") || row["passage"].startsWith("{") ? JSON.parse(row["passage"]) : row["passage"] : "",
                question: row["question"] ? row["question"].startsWith("[") || row["question"].startsWith("{") ? JSON.parse(row["question"]) : row["question"] : ""
            },
            evaluation: {
                correctIndex: row["eval_correctIndex"] ? row["eval_correctIndex"].startsWith("[") || row["eval_correctIndex"].startsWith("{") ? JSON.parse(row["eval_correctIndex"]) : row["eval_correctIndex"] : ""
            }
        }),
    phonetics__what_do_you_hear: (row)=>({
            external_id: row.ExerciseID || `phonetics__what_do_you_hear_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                AudioID: row["AudioID"] ? row["AudioID"].startsWith("[") || row["AudioID"].startsWith("{") ? JSON.parse(row["AudioID"]) : row["AudioID"] : "",
                Option1: row["Option1"] ? row["Option1"].startsWith("[") || row["Option1"].startsWith("{") ? JSON.parse(row["Option1"]) : row["Option1"] : "",
                Option1_EN: row["Option1_EN"] ? row["Option1_EN"].startsWith("[") || row["Option1_EN"].startsWith("{") ? JSON.parse(row["Option1_EN"]) : row["Option1_EN"] : "",
                Option2: row["Option2"] ? row["Option2"].startsWith("[") || row["Option2"].startsWith("{") ? JSON.parse(row["Option2"]) : row["Option2"] : "",
                Option2_EN: row["Option2_EN"] ? row["Option2_EN"].startsWith("[") || row["Option2_EN"].startsWith("{") ? JSON.parse(row["Option2_EN"]) : row["Option2_EN"] : "",
                Option3: row["Option3"] ? row["Option3"].startsWith("[") || row["Option3"].startsWith("{") ? JSON.parse(row["Option3"]) : row["Option3"] : "",
                Option3_EN: row["Option3_EN"] ? row["Option3_EN"].startsWith("[") || row["Option3_EN"].startsWith("{") ? JSON.parse(row["Option3_EN"]) : row["Option3_EN"] : "",
                Option4: row["Option4"] ? row["Option4"].startsWith("[") || row["Option4"].startsWith("{") ? JSON.parse(row["Option4"]) : row["Option4"] : "",
                Option4_EN: row["Option4_EN"] ? row["Option4_EN"].startsWith("[") || row["Option4_EN"].startsWith("{") ? JSON.parse(row["Option4_EN"]) : row["Option4_EN"] : "",
                Option5: row["Option5"] ? row["Option5"].startsWith("[") || row["Option5"].startsWith("{") ? JSON.parse(row["Option5"]) : row["Option5"] : "",
                Option6: row["Option6"] ? row["Option6"].startsWith("[") || row["Option6"].startsWith("{") ? JSON.parse(row["Option6"]) : row["Option6"] : "",
                Question: row["Question"] ? row["Question"].startsWith("[") || row["Question"].startsWith("{") ? JSON.parse(row["Question"]) : row["Question"] : "",
                CorrectAnswers: row["CorrectAnswers"] ? row["CorrectAnswers"].startsWith("[") || row["CorrectAnswers"].startsWith("{") ? JSON.parse(row["CorrectAnswers"]) : row["CorrectAnswers"] : "",
                CorrectOptionIndexes: row["CorrectOptionIndexes"] ? row["CorrectOptionIndexes"].startsWith("[") || row["CorrectOptionIndexes"].startsWith("{") ? JSON.parse(row["CorrectOptionIndexes"]) : row["CorrectOptionIndexes"] : ""
            },
            evaluation: {
                correctAnswers: row["eval_correctAnswers"] ? row["eval_correctAnswers"].startsWith("[") || row["eval_correctAnswers"].startsWith("{") ? JSON.parse(row["eval_correctAnswers"]) : row["eval_correctAnswers"] : "",
                correctOptionIndexes: row["eval_correctOptionIndexes"] ? row["eval_correctOptionIndexes"].startsWith("[") || row["eval_correctOptionIndexes"].startsWith("{") ? JSON.parse(row["eval_correctOptionIndexes"]) : row["eval_correctOptionIndexes"] : ""
            }
        }),
    reading_conversation: (row)=>({
            external_id: row.ExerciseID || `reading_conversation_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                context: row["context"] ? row["context"].startsWith("[") || row["context"].startsWith("{") ? JSON.parse(row["context"]) : row["context"] : "",
                options: row["options"] ? row["options"].startsWith("[") || row["options"].startsWith("{") ? JSON.parse(row["options"]) : row["options"] : "",
                messages: row["messages"] ? row["messages"].startsWith("[") || row["messages"].startsWith("{") ? JSON.parse(row["messages"]) : row["messages"] : "",
                nextMessage: row["nextMessage"] ? row["nextMessage"].startsWith("[") || row["nextMessage"].startsWith("{") ? JSON.parse(row["nextMessage"]) : row["nextMessage"] : "",
                currentPrompt: row["currentPrompt"] ? row["currentPrompt"].startsWith("[") || row["currentPrompt"].startsWith("{") ? JSON.parse(row["currentPrompt"]) : row["currentPrompt"] : ""
            },
            evaluation: {
                correctIndex: row["eval_correctIndex"] ? row["eval_correctIndex"].startsWith("[") || row["eval_correctIndex"].startsWith("{") ? JSON.parse(row["eval_correctIndex"]) : row["eval_correctIndex"] : ""
            }
        }),
    reorder_sentences: (row)=>({
            external_id: row.ExerciseID || `reorder_sentences_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            evaluation: {
                correctOrder: row["eval_correctOrder"] ? row["eval_correctOrder"].startsWith("[") || row["eval_correctOrder"].startsWith("{") ? JSON.parse(row["eval_correctOrder"]) : row["eval_correctOrder"] : ""
            }
        }),
    repeat_sentence: (row)=>({
            external_id: row.ExerciseID || `repeat_sentence_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                Question: row["Question"] ? row["Question"].startsWith("[") || row["Question"].startsWith("{") ? JSON.parse(row["Question"]) : row["Question"] : "",
                BlankIndex: row["BlankIndex"] ? row["BlankIndex"].startsWith("[") || row["BlankIndex"].startsWith("{") ? JSON.parse(row["BlankIndex"]) : row["BlankIndex"] : "",
                "Complete Sentence": row["Complete Sentence"] ? row["Complete Sentence"].startsWith("[") || row["Complete Sentence"].startsWith("{") ? JSON.parse(row["Complete Sentence"]) : row["Complete Sentence"] : "",
                "Sentence With Blank": row["Sentence With Blank"] ? row["Sentence With Blank"].startsWith("[") || row["Sentence With Blank"].startsWith("{") ? JSON.parse(row["Sentence With Blank"]) : row["Sentence With Blank"] : ""
            },
            evaluation: {
                CorrectAnswer: row["eval_CorrectAnswer"] ? row["eval_CorrectAnswer"].startsWith("[") || row["eval_CorrectAnswer"].startsWith("{") ? JSON.parse(row["eval_CorrectAnswer"]) : row["eval_CorrectAnswer"] : "",
                CorrectExplanation_EN: row["eval_CorrectExplanation_EN"] ? row["eval_CorrectExplanation_EN"].startsWith("[") || row["eval_CorrectExplanation_EN"].startsWith("{") ? JSON.parse(row["eval_CorrectExplanation_EN"]) : row["eval_CorrectExplanation_EN"] : ""
            }
        }),
    sentence_completion: (row)=>({
            external_id: row.ExerciseID || `sentence_completion_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                options: row["options"] ? row["options"].startsWith("[") || row["options"].startsWith("{") ? JSON.parse(row["options"]) : row["options"] : "",
                passageAfter: row["passageAfter"] ? row["passageAfter"].startsWith("[") || row["passageAfter"].startsWith("{") ? JSON.parse(row["passageAfter"]) : row["passageAfter"] : "",
                passageBefore: row["passageBefore"] ? row["passageBefore"].startsWith("[") || row["passageBefore"].startsWith("{") ? JSON.parse(row["passageBefore"]) : row["passageBefore"] : ""
            },
            evaluation: {
                correctIndex: row["eval_correctIndex"] ? row["eval_correctIndex"].startsWith("[") || row["eval_correctIndex"].startsWith("{") ? JSON.parse(row["eval_correctIndex"]) : row["eval_correctIndex"] : ""
            }
        }),
    speak_image: (row)=>({
            external_id: row.ExerciseID || `speak_image_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                Image: row["Image"] ? row["Image"].startsWith("[") || row["Image"].startsWith("{") ? JSON.parse(row["Image"]) : row["Image"] : "",
                Prompt: row["Prompt"] ? row["Prompt"].startsWith("[") || row["Prompt"].startsWith("{") ? JSON.parse(row["Prompt"]) : row["Prompt"] : "",
                Description: row["Description"] ? row["Description"].startsWith("[") || row["Description"].startsWith("{") ? JSON.parse(row["Description"]) : row["Description"] : ""
            }
        }),
    speak_interactive: (row)=>({
            external_id: row.ExerciseID || `speak_interactive_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                Prompt: row["Prompt"] ? row["Prompt"].startsWith("[") || row["Prompt"].startsWith("{") ? JSON.parse(row["Prompt"]) : row["Prompt"] : "",
                Context: row["Context"] ? row["Context"].startsWith("[") || row["Context"].startsWith("{") ? JSON.parse(row["Context"]) : row["Context"] : "",
                Description: row["Description"] ? row["Description"].startsWith("[") || row["Description"].startsWith("{") ? JSON.parse(row["Description"]) : row["Description"] : ""
            }
        }),
    speak_topic: (row)=>({
            external_id: row.ExerciseID || `speak_topic_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                Topic: row["Topic"] ? row["Topic"].startsWith("[") || row["Topic"].startsWith("{") ? JSON.parse(row["Topic"]) : row["Topic"] : "",
                Prompt: row["Prompt"] ? row["Prompt"].startsWith("[") || row["Prompt"].startsWith("{") ? JSON.parse(row["Prompt"]) : row["Prompt"] : ""
            }
        }),
    speak_translate: (row)=>({
            external_id: row.ExerciseID || `speak_translate_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                Question: row["Question"] ? row["Question"].startsWith("[") || row["Question"].startsWith("{") ? JSON.parse(row["Question"]) : row["Question"] : ""
            },
            evaluation: {
                Answer: row["eval_Answer"] ? row["eval_Answer"].startsWith("[") || row["eval_Answer"].startsWith("{") ? JSON.parse(row["eval_Answer"]) : row["eval_Answer"] : ""
            }
        }),
    summary_completion: (row)=>({
            external_id: row.ExerciseID || `summary_completion_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                fullText: row["fullText"] ? row["fullText"].startsWith("[") || row["fullText"].startsWith("{") ? JSON.parse(row["fullText"]) : row["fullText"] : "",
                passageSegments: row["passageSegments"] ? row["passageSegments"].startsWith("[") || row["passageSegments"].startsWith("{") ? JSON.parse(row["passageSegments"]) : row["passageSegments"] : ""
            },
            evaluation: {
                blanksData: row["eval_blanksData"] ? row["eval_blanksData"].startsWith("[") || row["eval_blanksData"].startsWith("{") ? JSON.parse(row["eval_blanksData"]) : row["eval_blanksData"] : ""
            }
        }),
    three_options: (row)=>({
            external_id: row.ExerciseID || `three_options_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                options: row["options"] ? row["options"].startsWith("[") || row["options"].startsWith("{") ? JSON.parse(row["options"]) : row["options"] : "",
                question: row["question"] ? row["question"].startsWith("[") || row["question"].startsWith("{") ? JSON.parse(row["question"]) : row["question"] : "",
                sentence: row["sentence"] ? row["sentence"].startsWith("[") || row["sentence"].startsWith("{") ? JSON.parse(row["sentence"]) : row["sentence"] : ""
            },
            evaluation: {
                translation: row["eval_translation"] ? row["eval_translation"].startsWith("[") || row["eval_translation"].startsWith("{") ? JSON.parse(row["eval_translation"]) : row["eval_translation"] : "",
                correctIndex: row["eval_correctIndex"] ? row["eval_correctIndex"].startsWith("[") || row["eval_correctIndex"].startsWith("{") ? JSON.parse(row["eval_correctIndex"]) : row["eval_correctIndex"] : ""
            }
        }),
    translate_bubbles: (row)=>({
            external_id: row.ExerciseID || `translate_bubbles_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                BubbleTokens: row["BubbleTokens"] ? row["BubbleTokens"].startsWith("[") || row["BubbleTokens"].startsWith("{") ? JSON.parse(row["BubbleTokens"]) : row["BubbleTokens"] : "",
                SourceAudioID: row["SourceAudioID"] ? row["SourceAudioID"].startsWith("[") || row["SourceAudioID"].startsWith("{") ? JSON.parse(row["SourceAudioID"]) : row["SourceAudioID"] : "",
                ShuffleBubbles: row["ShuffleBubbles"] ? row["ShuffleBubbles"].startsWith("[") || row["ShuffleBubbles"].startsWith("{") ? JSON.parse(row["ShuffleBubbles"]) : row["ShuffleBubbles"] : "",
                SourceLanguage: row["SourceLanguage"] ? row["SourceLanguage"].startsWith("[") || row["SourceLanguage"].startsWith("{") ? JSON.parse(row["SourceLanguage"]) : row["SourceLanguage"] : "",
                SourceSentence: row["SourceSentence"] ? row["SourceSentence"].startsWith("[") || row["SourceSentence"].startsWith("{") ? JSON.parse(row["SourceSentence"]) : row["SourceSentence"] : "",
                TargetLanguage: row["TargetLanguage"] ? row["TargetLanguage"].startsWith("[") || row["TargetLanguage"].startsWith("{") ? JSON.parse(row["TargetLanguage"]) : row["TargetLanguage"] : "",
                TargetSentence: row["TargetSentence"] ? row["TargetSentence"].startsWith("[") || row["TargetSentence"].startsWith("{") ? JSON.parse(row["TargetSentence"]) : row["TargetSentence"] : ""
            },
            evaluation: {
                CorrectTokenOrder: row["eval_CorrectTokenOrder"] ? row["eval_CorrectTokenOrder"].startsWith("[") || row["eval_CorrectTokenOrder"].startsWith("{") ? JSON.parse(row["eval_CorrectTokenOrder"]) : row["eval_CorrectTokenOrder"] : "",
                AcceptableTranslations: row["eval_AcceptableTranslations"] ? row["eval_AcceptableTranslations"].startsWith("[") || row["eval_AcceptableTranslations"].startsWith("{") ? JSON.parse(row["eval_AcceptableTranslations"]) : row["eval_AcceptableTranslations"] : "",
                AllowMultipleSolutions: row["eval_AllowMultipleSolutions"] ? row["eval_AllowMultipleSolutions"].startsWith("[") || row["eval_AllowMultipleSolutions"].startsWith("{") ? JSON.parse(row["eval_AllowMultipleSolutions"]) : row["eval_AllowMultipleSolutions"] : ""
            }
        }),
    translate_typed: (row)=>({
            external_id: row.ExerciseID || `translate_typed_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                sourceText: row["sourceText"] ? row["sourceText"].startsWith("[") || row["sourceText"].startsWith("{") ? JSON.parse(row["sourceText"]) : row["sourceText"] : "",
                correctAnswer: row["correctAnswer"] ? row["correctAnswer"].startsWith("[") || row["correctAnswer"].startsWith("{") ? JSON.parse(row["correctAnswer"]) : row["correctAnswer"] : ""
            },
            evaluation: {
                acceptableAnswers: row["eval_acceptableAnswers"] ? row["eval_acceptableAnswers"].startsWith("[") || row["eval_acceptableAnswers"].startsWith("{") ? JSON.parse(row["eval_acceptableAnswers"]) : row["eval_acceptableAnswers"] : ""
            }
        }),
    true_false: (row)=>({
            external_id: row.ExerciseID || `true_false_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                passage: row["passage"] ? row["passage"].startsWith("[") || row["passage"].startsWith("{") ? JSON.parse(row["passage"]) : row["passage"] : "",
                statement: row["statement"] ? row["statement"].startsWith("[") || row["statement"].startsWith("{") ? JSON.parse(row["statement"]) : row["statement"] : ""
            },
            evaluation: {
                answer: row["eval_answer"] ? row["eval_answer"].startsWith("[") || row["eval_answer"].startsWith("{") ? JSON.parse(row["eval_answer"]) : row["eval_answer"] : ""
            }
        }),
    two_options: (row)=>({
            external_id: row.ExerciseID || `two_options_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                options: row["options"] ? row["options"].startsWith("[") || row["options"].startsWith("{") ? JSON.parse(row["options"]) : row["options"] : "",
                question: row["question"] ? row["question"].startsWith("[") || row["question"].startsWith("{") ? JSON.parse(row["question"]) : row["question"] : "",
                sentence: row["sentence"] ? row["sentence"].startsWith("[") || row["sentence"].startsWith("{") ? JSON.parse(row["sentence"]) : row["sentence"] : ""
            },
            evaluation: {
                translation: row["eval_translation"] ? row["eval_translation"].startsWith("[") || row["eval_translation"].startsWith("{") ? JSON.parse(row["eval_translation"]) : row["eval_translation"] : "",
                correctIndex: row["eval_correctIndex"] ? row["eval_correctIndex"].startsWith("[") || row["eval_correctIndex"].startsWith("{") ? JSON.parse(row["eval_correctIndex"]) : row["eval_correctIndex"] : ""
            }
        }),
    vocab_typing_blanks: (row)=>({
            external_id: row.ExerciseID || `vocab_typing_blanks_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                hints: row["hints"] ? row["hints"].startsWith("[") || row["hints"].startsWith("{") ? JSON.parse(row["hints"]) : row["hints"] : "",
                blanks: row["blanks"] ? row["blanks"].startsWith("[") || row["blanks"].startsWith("{") ? JSON.parse(row["blanks"]) : row["blanks"] : "",
                fullText: row["fullText"] ? row["fullText"].startsWith("[") || row["fullText"].startsWith("{") ? JSON.parse(row["fullText"]) : row["fullText"] : "",
                displayParts: row["displayParts"] ? row["displayParts"].startsWith("[") || row["displayParts"].startsWith("{") ? JSON.parse(row["displayParts"]) : row["displayParts"] : "",
                SentenceWithBlank: row["SentenceWithBlank"] ? row["SentenceWithBlank"].startsWith("[") || row["SentenceWithBlank"].startsWith("{") ? JSON.parse(row["SentenceWithBlank"]) : row["SentenceWithBlank"] : ""
            },
            evaluation: {
                CorrectAnswer: row["eval_CorrectAnswer"] ? row["eval_CorrectAnswer"].startsWith("[") || row["eval_CorrectAnswer"].startsWith("{") ? JSON.parse(row["eval_CorrectAnswer"]) : row["eval_CorrectAnswer"] : ""
            }
        }),
    write_documents: (row)=>({
            external_id: row.ExerciseID || `write_documents_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                subject: row["subject"] ? row["subject"].startsWith("[") || row["subject"].startsWith("{") ? JSON.parse(row["subject"]) : row["subject"] : "",
                minWords: row["minWords"] ? row["minWords"].startsWith("[") || row["minWords"].startsWith("{") ? JSON.parse(row["minWords"]) : row["minWords"] : "",
                scenario: row["scenario"] ? row["scenario"].startsWith("[") || row["scenario"].startsWith("{") ? JSON.parse(row["scenario"]) : row["scenario"] : "",
                template: row["template"] ? row["template"].startsWith("[") || row["template"].startsWith("{") ? JSON.parse(row["template"]) : row["template"] : "",
                recipient: row["recipient"] ? row["recipient"].startsWith("[") || row["recipient"].startsWith("{") ? JSON.parse(row["recipient"]) : row["recipient"] : "",
                documentType: row["documentType"] ? row["documentType"].startsWith("[") || row["documentType"].startsWith("{") ? JSON.parse(row["documentType"]) : row["documentType"] : ""
            },
            evaluation: {
                sampleAnswer: row["eval_sampleAnswer"] ? row["eval_sampleAnswer"].startsWith("[") || row["eval_sampleAnswer"].startsWith("{") ? JSON.parse(row["eval_sampleAnswer"]) : row["eval_sampleAnswer"] : ""
            }
        }),
    write_fill_blanks: (row)=>({
            external_id: row.ExerciseID || `write_fill_blanks_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                title: row["title"] ? row["title"].startsWith("[") || row["title"].startsWith("{") ? JSON.parse(row["title"]) : row["title"] : "",
                passage: row["passage"] ? row["passage"].startsWith("[") || row["passage"].startsWith("{") ? JSON.parse(row["passage"]) : row["passage"] : "",
                targetWords: row["targetWords"] ? row["targetWords"].startsWith("[") || row["targetWords"].startsWith("{") ? JSON.parse(row["targetWords"]) : row["targetWords"] : "",
                englishTranslation: row["englishTranslation"] ? row["englishTranslation"].startsWith("[") || row["englishTranslation"].startsWith("{") ? JSON.parse(row["englishTranslation"]) : row["englishTranslation"] : ""
            }
        }),
    write_image: (row)=>({
            external_id: row.ExerciseID || `write_image_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                hint: row["hint"] ? row["hint"].startsWith("[") || row["hint"].startsWith("{") ? JSON.parse(row["hint"]) : row["hint"] : "",
                imageUrl: row["imageUrl"] ? row["imageUrl"].startsWith("[") || row["imageUrl"].startsWith("{") ? JSON.parse(row["imageUrl"]) : row["imageUrl"] : "",
                question: row["question"] ? row["question"].startsWith("[") || row["question"].startsWith("{") ? JSON.parse(row["question"]) : row["question"] : ""
            },
            evaluation: {
                sampleAnswer: row["eval_sampleAnswer"] ? row["eval_sampleAnswer"].startsWith("[") || row["eval_sampleAnswer"].startsWith("{") ? JSON.parse(row["eval_sampleAnswer"]) : row["eval_sampleAnswer"] : ""
            }
        }),
    write_topic: (row)=>({
            external_id: row.ExerciseID || `write_topic_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                hints: row["hints"] ? row["hints"].startsWith("[") || row["hints"].startsWith("{") ? JSON.parse(row["hints"]) : row["hints"] : "",
                topic: row["topic"] ? row["topic"].startsWith("[") || row["topic"].startsWith("{") ? JSON.parse(row["topic"]) : row["topic"] : "",
                prompt: row["prompt"] ? row["prompt"].startsWith("[") || row["prompt"].startsWith("{") ? JSON.parse(row["prompt"]) : row["prompt"] : "",
                minWords: row["minWords"] ? row["minWords"].startsWith("[") || row["minWords"].startsWith("{") ? JSON.parse(row["minWords"]) : row["minWords"] : "",
                englishTopic: row["englishTopic"] ? row["englishTopic"].startsWith("[") || row["englishTopic"].startsWith("{") ? JSON.parse(row["englishTopic"]) : row["englishTopic"] : "",
                sampleAnswer: row["sampleAnswer"] ? row["sampleAnswer"].startsWith("[") || row["sampleAnswer"].startsWith("{") ? JSON.parse(row["sampleAnswer"]) : row["sampleAnswer"] : "",
                timeLimitSeconds: row["timeLimitSeconds"] ? row["timeLimitSeconds"].startsWith("[") || row["timeLimitSeconds"].startsWith("{") ? JSON.parse(row["timeLimitSeconds"]) : row["timeLimitSeconds"] : ""
            }
        }),
    writing_conversation: (row)=>({
            external_id: row.ExerciseID || `writing_conversation_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                title: row["title"] ? row["title"].startsWith("[") || row["title"].startsWith("{") ? JSON.parse(row["title"]) : row["title"] : "",
                scenario: row["scenario"] ? row["scenario"].startsWith("[") || row["scenario"].startsWith("{") ? JSON.parse(row["scenario"]) : row["scenario"] : "",
                exchanges: row["exchanges"] ? row["exchanges"].startsWith("[") || row["exchanges"].startsWith("{") ? JSON.parse(row["exchanges"]) : row["exchanges"] : ""
            }
        }),
    highlight_word: (row)=>({
            external_id: row.ExerciseID || `highlight_word_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                passage: row["passage"] || row["sentence"] || "",
                question: row["question"] || "",
                eval_correctWord: row["eval_correctWord"] || ""
            }
        })
};
async function fetchVocabulary({ level, category, subCategory, limit, learningLang, knownLang } = {}) {
    const params = new URLSearchParams();
    if (level) params.append("level", level);
    if (category) params.append("category", category);
    if (limit) params.append("limit", limit);
    if (learningLang) params.append("learning_lang", learningLang);
    if (knownLang) params.append("known_lang", knownLang);
    // Handle subCategory array
    if (subCategory && Array.isArray(subCategory)) {
        subCategory.forEach((sc)=>params.append("sub_category", sc));
    } else if (subCategory) {
        params.append("sub_category", subCategory);
    }
    const url = `${API_BASE_URL}/api/vocabulary${params.toString() ? "?" + params : ""}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Failed to fetch vocabulary");
    }
    return response.json();
}
async function fetchLessonWords(lessonId, { level, wordsPerLesson = 10, learningLang, knownLang } = {}) {
    const params = new URLSearchParams();
    params.append("words_per_lesson", wordsPerLesson);
    if (level) params.append("level", level);
    if (learningLang) params.append("learning_lang", learningLang);
    if (knownLang) params.append("known_lang", knownLang);
    const response = await fetch(`${API_BASE_URL}/api/vocabulary/lesson/${lessonId}?${params}`);
    if (!response.ok) {
        throw new Error("Failed to fetch lesson");
    }
    return response.json();
}
async function fetchAvailableLevels() {
    const response = await fetch(`${API_BASE_URL}/api/vocabulary/levels`);
    if (!response.ok) {
        throw new Error("Failed to fetch levels");
    }
    return response.json();
}
async function fetchAvailableCategories() {
    const response = await fetch(`${API_BASE_URL}/api/vocabulary/categories`);
    if (!response.ok) {
        throw new Error("Failed to fetch categories");
    }
    return response.json();
}
async function fetchCategoriesByLevel(level) {
    const params = new URLSearchParams();
    if (level) params.append("level", level);
    const response = await fetch(`${API_BASE_URL}/api/vocabulary/categories-by-level?${params}`);
    if (!response.ok) {
        throw new Error("Failed to fetch categories by level");
    }
    return response.json();
}
async function fetchAllTopics() {
    const response = await fetch(`${API_BASE_URL}/api/vocabulary/topics`);
    if (!response.ok) {
        throw new Error("Failed to fetch topics");
    }
    return response.json();
}
async function checkApiHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return response.ok;
    } catch  {
        return false;
    }
}
async function saveUserProgress(progressData, token) {
    const response = await fetch(`${API_BASE_URL}/api/progress/save`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(progressData)
    });
    if (!response.ok) {
        throw new Error("Failed to save progress");
    }
    return response.json();
}
async function fetchTeachers({ limit = 20, skip = 0 } = {}) {
    const response = await fetch(`${API_BASE_URL}/api/teachers?limit=${limit}&skip=${skip}`);
    if (!response.ok) {
        throw new Error("Failed to fetch teachers");
    }
    return response.json();
}
async function requestConnection(data, token) {
    const response = await fetch(`${API_BASE_URL}/api/relationships/link`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to send connection request");
    }
    return response.json();
}
async function searchProfiles(query, token) {
    const response = await fetch(`${API_BASE_URL}/api/profiles/search?q=${encodeURIComponent(query)}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Search failed");
    }
    return response.json();
}
async function fetchFriends(token) {
    const response = await fetch(`${API_BASE_URL}/api/relationships/friends`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch friends");
    }
    return response.json();
}
async function linkStudentToTeacher(studentId, teacherId, token) {
    return requestConnection({
        studentId,
        teacherId,
        type: "teacher"
    }, token);
}
async function fetchTeacherStudents(teacherId, status, token) {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    const response = await fetch(`${API_BASE_URL}/api/relationships/teacher/${teacherId}/students?${params}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch students");
    }
    return response.json();
}
async function updateRelationshipStatus(relationshipId, status, token) {
    const response = await fetch(`${API_BASE_URL}/api/relationships/${relationshipId}/status`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            status
        })
    });
    if (!response.ok) {
        throw new Error("Failed to update status");
    }
    return response.json();
}
async function fetchStudentTeachers(studentId, status, token) {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    const response = await fetch(`${API_BASE_URL}/api/relationships/student/${studentId}/teachers?${params}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch teachers");
    }
    return response.json();
}
async function deleteRelationship(relationshipId, token) {
    const response = await fetch(`${API_BASE_URL}/api/relationships/${relationshipId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to delete relationship");
    }
    return true;
}
async function fetchPracticeQuestions(sheetName, { limit, learningLang, knownLang } = {}) {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit);
    if (learningLang) params.append("learning_lang", learningLang);
    if (knownLang) params.append("known_lang", knownLang);
    const normalizedSheetName = sheetName.toLowerCase().replace(/ /g, "_");
    const transformer = CSV_TRANSFORMERS[normalizedSheetName];
    // If CSV override is enabled, try loading from CSV straight away
    if (USE_MOCK_CSV_DATA && transformer) {
        console.log(`[vocabularyApi] 🧪 Mock CSV Mode active. Bypassing API for ${sheetName}`);
        try {
            const Papa = await __turbopack_context__.A("[project]/node_modules/papaparse/papaparse.min.js [app-client] (ecmascript, async loader)");
            const csvResponse = await fetch(`/mock-data/csv/${normalizedSheetName}.csv`);
            if (!csvResponse.ok) {
                throw new Error(`Fallback CSV not found for ${sheetName}`);
            }
            const csvText = await csvResponse.text();
            return new Promise((resolve, reject)=>{
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results)=>{
                        try {
                            const transformedData = results.data.map((row)=>{
                                const newRow = {
                                    ...row
                                };
                                for(const key in newRow){
                                    if (typeof newRow[key] === "string" && (newRow[key].startsWith("[") || newRow[key].startsWith("{"))) {
                                        try {
                                            newRow[key] = JSON.parse(newRow[key]);
                                        } catch (e) {}
                                    }
                                }
                                return newRow;
                            });
                            // Mock structure expects flat data array from this endpoint usually internally mapped to { data: [] }
                            resolve({
                                data: transformedData
                            });
                        } catch (err) {
                            reject(err);
                        }
                    },
                    error: (err)=>reject(err)
                });
            });
        } catch (err) {
            console.error(`[vocabularyApi] Mock CSV failed for ${sheetName}:`, err);
        // Fallback to API if CSV fails despite override
        }
    }
    const url = `${API_BASE_URL}/api/practice/${encodeURIComponent(sheetName)}?${params}`;
    console.log(`[vocabularyApi] Fetching Practice Questions:`, {
        sheetName,
        url,
        base: API_BASE_URL,
        params: params.toString()
    });
    const response = await fetch(url);
    if (response.status === 404) {
        if (transformer) {
            console.warn(`[vocabularyApi] API 404 for ${sheetName}, falling back to CSV: ${normalizedSheetName}.csv`);
            try {
                const Papa = await __turbopack_context__.A("[project]/node_modules/papaparse/papaparse.min.js [app-client] (ecmascript, async loader)");
                const csvResponse = await fetch(`/mock-data/csv/${normalizedSheetName}.csv`);
                if (!csvResponse.ok) {
                    throw new Error(`Failed to fetch fallback CSV: ${normalizedSheetName}.csv`);
                }
                const csvText = await csvResponse.text();
                return new Promise((resolve, reject)=>{
                    Papa.parse(csvText, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results)=>{
                            try {
                                const transformedData = results.data.map((row)=>{
                                    const newRow = {
                                        ...row
                                    };
                                    for(const key in newRow){
                                        if (typeof newRow[key] === "string" && (newRow[key].startsWith("[") || newRow[key].startsWith("{"))) {
                                            try {
                                                newRow[key] = JSON.parse(newRow[key]);
                                            } catch (e) {}
                                        }
                                    }
                                    return newRow;
                                });
                                resolve({
                                    data: transformedData
                                });
                            } catch (err) {
                                reject(err);
                            }
                        },
                        error: (err)=>reject(err)
                    });
                });
            } catch (err) {
                console.error(`[vocabularyApi] Fallback failed for ${sheetName}:`, err);
                throw new Error(`Failed to fetch practice questions for ${sheetName}`);
            }
        }
    }
    if (!response.ok) {
        console.error(`[vocabularyApi] API Error for ${sheetName}: Status ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch practice questions for ${sheetName}`);
    }
    return response.json();
}
async function fetchMatchPairsData(level) {
    const url = `${API_BASE_URL}/api/practice/match-pairs${level ? `?level=${level}` : ""}`;
    const response = await fetch(url);
    if (response.status === 404) {
        console.warn(`[vocabularyApi] API 404 for match-pairs, falling back to CSV: match_pairs.csv`);
        try {
            const Papa = await __turbopack_context__.A("[project]/node_modules/papaparse/papaparse.min.js [app-client] (ecmascript, async loader)");
            const csvResponse = await fetch(`/mock-data/csv/match_pairs.csv`);
            if (!csvResponse.ok) {
                throw new Error(`Failed to fetch fallback CSV: match_pairs.csv`);
            }
            const csvText = await csvResponse.text();
            return new Promise((resolve, reject)=>{
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results)=>{
                        try {
                            // Transform CSV data to expected format
                            const transformedData = results.data.map((row)=>({
                                    id: Math.random().toString(36).substr(2, 9),
                                    french: row["Word - French"],
                                    english: row["English word"],
                                    image: row["Image"] ? `/mock-data/images/${row["Image"]}` : null,
                                    instructionFr: "Associez les paires",
                                    instructionEn: "Match the pairs",
                                    level: row["Level"]
                                }))// Filter by level if requested and level column exists
                            .filter((item)=>!level || !item.level || item.level === level);
                            resolve(transformedData);
                        } catch (err) {
                            reject(err);
                        }
                    },
                    error: (err)=>reject(err)
                });
            });
        } catch (err) {
            console.error(`[vocabularyApi] Fallback failed for match-pairs:`, err);
            throw new Error("Failed to fetch match pairs");
        }
    }
    if (!response.ok) throw new Error("Failed to fetch match pairs");
    return response.json();
}
async function fetchRepeatSentenceData(level) {
    const url = `${API_BASE_URL}/api/practice/repeat-sentence${level ? `?level=${level}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch repeat sentence");
    return response.json();
}
async function fetchWhatDoYouSeeData() {
    const response = await fetch(`${API_BASE_URL}/api/practice/what-do-you-see`);
    if (!response.ok) throw new Error("Failed to fetch what do you see");
    return response.json();
}
async function fetchDictationImageData() {
    const response = await fetch(`${API_BASE_URL}/api/practice/dictation-image`);
    if (!response.ok) throw new Error("Failed to fetch dictation image");
    return response.json();
}
async function fetchLearningQueue({ userId, dailyLimitReviews, dailyLimitNew, level, category, learningLang, knownLang } = {}) {
    const params = new URLSearchParams();
    if (userId) params.append("user_id", userId);
    if (dailyLimitReviews) params.append("daily_limit_reviews", dailyLimitReviews);
    if (dailyLimitNew) params.append("daily_limit_new", dailyLimitNew);
    if (level) params.append("level", level);
    if (category) params.append("category", category);
    if (learningLang) params.append("learning_lang", learningLang);
    if (knownLang) params.append("known_lang", knownLang);
    console.log(`[vocabularyApi] Fetching queue with params: ${params.toString()}`);
    const response = await fetch(`${API_BASE_URL}/api/vocabulary/learn?${params}`);
    if (!response.ok) {
        throw new Error("Failed to fetch learning queue");
    }
    return response.json();
}
async function fetchCompletePassageData({ learningLang, knownLang } = {}) {
    const params = new URLSearchParams();
    if (learningLang) params.append("learning_lang", learningLang);
    if (knownLang) params.append("known_lang", knownLang);
    const response = await fetch(`${API_BASE_URL}/api/practice/complete_passage_dropdown?${params}`);
    if (!response.ok) throw new Error("Failed to fetch complete passage data");
    const result = await response.json();
    return result.data || result;
}
async function fetchSummaryCompletionData({ learningLang, knownLang } = {}) {
    const params = new URLSearchParams();
    if (learningLang) params.append("learning_lang", learningLang);
    if (knownLang) params.append("known_lang", knownLang);
    const response = await fetch(`${API_BASE_URL}/api/practice/summary_completion?${params}`);
    if (!response.ok) throw new Error("Failed to fetch summary completion data");
    const result = await response.json();
    return result.data || result;
}
async function fetchWritingDocuments(level) {
    const url = `${API_BASE_URL}/api/practice/write_documents${level ? `?level=${level}` : ""}`;
    console.log(`[vocabularyApi] Fetching writing documents from: ${url}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch writing documents");
    const result = await response.json();
    return result.data || result;
}
async function fetchWriteAnalysisData() {
    const response = await fetch(`${API_BASE_URL}/api/practice/write_analysis`);
    if (!response.ok) throw new Error("Failed to fetch writing analysis data");
    const result = await response.json();
    return result.data || result;
}
async function fetchClasses(token) {
    const response = await fetch(`${API_BASE_URL}/api/teachers/classes`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch classes");
    }
    return response.json();
}
async function fetchStudentClasses(studentId, token) {
    const response = await fetch(`${API_BASE_URL}/api/students/classes?student_id=${studentId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch student classes");
    }
    return response.json();
}
async function createClass(classData, token) {
    const response = await fetch(`${API_BASE_URL}/api/teachers/classes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(classData)
    });
    if (!response.ok) {
        throw new Error("Failed to create class");
    }
    return response.json();
}
async function fetchClassDetails(classId, token) {
    const response = await fetch(`${API_BASE_URL}/api/teachers/classes/${classId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch class details");
    }
    return response.json();
}
async function updateClass(classId, updateData, token) {
    const response = await fetch(`${API_BASE_URL}/api/teachers/classes/${classId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
    });
    if (!response.ok) {
        throw new Error("Failed to update class");
    }
    return response.json();
}
async function deleteClass(classId, token) {
    const response = await fetch(`${API_BASE_URL}/api/teachers/classes/${classId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to delete class");
    }
    return response.json();
}
async function createClassAssignment(assignmentData, classId, token) {
    const url = `${API_BASE_URL}/api/teachers/assign${classId ? `?class_id=${classId}` : ""}`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(assignmentData)
    });
    if (!response.ok) {
        throw new Error("Failed to create class assignment");
    }
    return response.json();
}
async function fetchAvailableQuestionTypes(level, language) {
    if (!level || level === "all") return null;
    try {
        const res = await fetch(`${API_BASE_URL}/api/tag-topics/available-types?level=${level}&language=${language}`);
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data.slugs) ? data.slugs : null;
    } catch (err) {
        console.error("fetchAvailableQuestionTypes error:", err);
        return null;
    }
}
async function rateSrsCard({ vocabId, rating }, token) {
    if (!vocabId || !token) return null;
    try {
        const res = await fetch(`${API_BASE_URL}/api/srs/rate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                vocabId,
                rating
            })
        });
        if (!res.ok) return null;
        return res.json();
    } catch (err) {
        console.error("rateSrsCard error:", err);
        return null;
    }
}
async function fetchSrsDue({ category, level } = {}, token) {
    if (!token) return [];
    try {
        const params = new URLSearchParams();
        if (category) params.append("category", category);
        if (level && level !== "All") params.append("level", level);
        const res = await fetch(`${API_BASE_URL}/api/srs/due${params.toString() ? "?" + params : ""}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.dueIds || [];
    } catch (err) {
        console.error("fetchSrsDue error:", err);
        return [];
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/utils/feedbackMessages.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCorrectMessage",
    ()=>getCorrectMessage,
    "getFeedbackMessage",
    ()=>getFeedbackMessage,
    "getIncorrectMessage",
    ()=>getIncorrectMessage
]);
/**
 * Utility for generating varied feedback messages
 * Mimics Duolingo's encouraging and varied feedback system
 */ const correctMessages = [
    "Great job!",
    "Excellent!",
    "Perfect!",
    "Nice work!",
    "Well done!",
    "Fantastic!",
    "Amazing!",
    "You got it!",
    "Brilliant!",
    "Outstanding!"
];
const incorrectMessages = [
    "Incorrect",
    "Not quite",
    "Try again",
    "Almost there",
    "Keep trying",
    "Not this time"
];
function getCorrectMessage() {
    return correctMessages[Math.floor(Math.random() * correctMessages.length)];
}
function getIncorrectMessage() {
    return incorrectMessages[Math.floor(Math.random() * incorrectMessages.length)];
}
function getFeedbackMessage(isCorrect) {
    return isCorrect ? getCorrectMessage() : getIncorrectMessage();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/features/vocabulary/pages/HighlightWordGamePage.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HighlightWordGamePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useExerciseTimer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useExerciseTimer.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$PracticeGameLayout$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/layout/PracticeGameLayout.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$vocabularyApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/vocabularyApi.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$feedbackMessages$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/feedbackMessages.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
// Normalize curly/typographic apostrophes so comparisons are quote-agnostic
const normalizeApostrophe = (str)=>str.replace(/[\u2018\u2019\u201A\u201B\u02BC\u02C8`]/g, "'");
;
;
;
;
;
;
;
function HighlightWordGamePage() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [questions, setQuestions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [currentIndex, setCurrentIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    // Single-select state
    const [selectedWordIndex, setSelectedWordIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Multi-select state
    const [selectedWordIndices, setSelectedWordIndices] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [isAnswered, setIsAnswered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [score, setScore] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isGameOver, setIsGameOver] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [showFeedback, setShowFeedback] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isCorrect, setIsCorrect] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [feedbackMessage, setFeedbackMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HighlightWordGamePage.useEffect": ()=>{
            loadQuestions();
        }
    }["HighlightWordGamePage.useEffect"], []);
    const loadQuestions = async ()=>{
        try {
            setLoading(true);
            const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$vocabularyApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchPracticeQuestions"])("highlight_word");
            if (response && response.data && response.data.length > 0) {
                const formattedQuestions = response.data.filter((q)=>(q.passage || q.sentence || q.Sentence) && (q.passage || q.sentence || q.Sentence) !== "None").map((q)=>{
                    const rawAnswer = q.correctWord || q.correctAnswer || q.CorrectAnswer || q.Answer || q.eval_correctWord || "";
                    // Support pipe-separated or space-separated multi-answers: "chat|chien" or "une pomme"
                    const correctWords = rawAnswer.split(/[| ]+/).map((w)=>normalizeApostrophe(w.trim().toLowerCase())).filter(Boolean);
                    return {
                        ...q,
                        sentence: q.passage || q.sentence || q.Sentence || q["Complete sentence"] || "",
                        correctWord: correctWords[0] ?? "",
                        correctWords,
                        isMultiSelect: correctWords.length > 1,
                        prompt: (q.question || q.instructionEn || q.Instruction_EN || q.Question_EN || "")?.trim()
                    };
                });
                setQuestions(formattedQuestions);
            } else {
                console.error("[HighlightWord] ❌ No valid questions received");
                setQuestions([]);
            }
        } catch (error) {
            console.error("[HighlightWord] ❌ Failed to load:", error);
            setQuestions([]);
        } finally{
            setLoading(false);
        }
    };
    const { timerString, resetTimer } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useExerciseTimer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useExerciseTimer"])({
        duration: 30,
        mode: "timer",
        onExpire: {
            "HighlightWordGamePage.useExerciseTimer": ()=>{
                if (!isAnswered && !isGameOver && !showFeedback) {
                    const hasSelection = currentItem?.isMultiSelect ? selectedWordIndices.size > 0 : selectedWordIndex !== null;
                    if (!hasSelection) {
                        setIsAnswered(true);
                        setIsCorrect(false);
                        setFeedbackMessage("Time's up!");
                        setShowFeedback(true);
                    } else {
                        handleCheck();
                    }
                }
            }
        }["HighlightWordGamePage.useExerciseTimer"],
        isPaused: loading || isGameOver || isAnswered || showFeedback
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HighlightWordGamePage.useEffect": ()=>{
            resetTimer();
        }
    }["HighlightWordGamePage.useEffect"], [
        currentIndex,
        resetTimer
    ]);
    const currentItem = questions[currentIndex];
    const words = currentItem ? currentItem.sentence.split(" ") : [];
    // ── Single-select handler ──────────────────────────────────────────────
    const handleWordClick = (index)=>{
        if (isAnswered) return;
        if (currentItem.isMultiSelect) {
            // Toggle in multi-select set
            setSelectedWordIndices((prev)=>{
                const next = new Set(prev);
                if (next.has(index)) {
                    next.delete(index);
                } else {
                    // Restrict to max number of correct words
                    if (next.size < currentItem.correctWords.length) {
                        next.add(index);
                    }
                }
                return next;
            });
        } else {
            setSelectedWordIndex(index);
        }
    };
    // ── Check answer ───────────────────────────────────────────────────────
    const handleCheck = ()=>{
        if (currentItem.isMultiSelect) {
            if (selectedWordIndices.size === 0) return;
            setIsAnswered(true);
            // Collect the clean text of every selected word (normalize apostrophes + strip punctuation)
            const cleanWord = (w)=>normalizeApostrophe(w).replace(/[.,!?;:]/g, "").toLowerCase();
            const selectedClean = [
                ...selectedWordIndices
            ].map((i)=>cleanWord(words[i]));
            // Every correct word must be selected, and no extra words
            const targets = currentItem.correctWords; // already normalized during load
            const allFound = targets.every((t)=>selectedClean.includes(t));
            const noExtras = selectedClean.every((s)=>targets.includes(s));
            const correct = allFound && noExtras;
            setIsCorrect(correct);
            setFeedbackMessage((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$feedbackMessages$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFeedbackMessage"])(correct));
            setShowFeedback(true);
            if (correct) setScore((prev)=>prev + 1);
        } else {
            if (selectedWordIndex === null) return;
            setIsAnswered(true);
            const selectedWord = words[selectedWordIndex];
            const cleanWord = normalizeApostrophe(selectedWord).replace(/[.,!?;:]/g, "").toLowerCase();
            const cleanTarget = normalizeApostrophe(currentItem.correctWord).toLowerCase();
            const correct = cleanWord === cleanTarget;
            setIsCorrect(correct);
            setFeedbackMessage((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$feedbackMessages$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFeedbackMessage"])(correct));
            setShowFeedback(true);
            if (correct) setScore((prev)=>prev + 1);
        }
    };
    const handleNext = ()=>{
        if (!isAnswered) {
            handleCheck();
            return;
        }
        setShowFeedback(false);
        if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev)=>prev + 1);
            setSelectedWordIndex(null);
            setSelectedWordIndices(new Set());
            setIsAnswered(false);
            resetTimer();
        } else {
            setIsGameOver(true);
        }
    };
    const progress = questions.length > 0 ? (currentIndex + 1) / questions.length * 100 : 0;
    // ── Submit enabled guard ───────────────────────────────────────────────
    const isSubmitEnabled = currentItem?.isMultiSelect ? selectedWordIndices.size > 0 : selectedWordIndex !== null;
    // ── Correct answer display string ──────────────────────────────────────
    const correctAnswerDisplay = !isCorrect ? currentItem?.isMultiSelect ? currentItem.correctWords.join(" • ") : currentItem?.correctWord : null;
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                className: "animate-spin text-blue-500 w-8 h-8"
            }, void 0, false, {
                fileName: "[project]/src/features/vocabulary/pages/HighlightWordGamePage.tsx",
                lineNumber: 229,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/features/vocabulary/pages/HighlightWordGamePage.tsx",
            lineNumber: 228,
            columnNumber: 7
        }, this);
    }
    if (questions.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center justify-center min-h-screen text-red-500",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xl font-bold",
                    children: "No questions found"
                }, void 0, false, {
                    fileName: "[project]/src/features/vocabulary/pages/HighlightWordGamePage.tsx",
                    lineNumber: 237,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    className: "mt-4",
                    variant: "outline",
                    onClick: ()=>router.push("/vocabulary/practice"),
                    children: "Back to Practice"
                }, void 0, false, {
                    fileName: "[project]/src/features/vocabulary/pages/HighlightWordGamePage.tsx",
                    lineNumber: 238,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/features/vocabulary/pages/HighlightWordGamePage.tsx",
            lineNumber: 236,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$PracticeGameLayout$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            questionType: currentItem?.QuestionType,
            instructionFr: currentItem?.Instruction_FR,
            instructionEn: currentItem?.Instruction_EN,
            progress: progress,
            currentQuestionIndex: currentIndex,
            isGameOver: isGameOver,
            score: score,
            totalQuestions: questions.length,
            onExit: ()=>router.push("/vocabulary/practice"),
            onNext: handleNext,
            onRestart: ()=>window.location.reload(),
            isSubmitEnabled: isSubmitEnabled,
            showSubmitButton: true,
            submitLabel: showFeedback ? currentIndex + 1 === questions.length ? "FINISH" : "CONTINUE" : isAnswered ? "Next" : "Submit",
            timerValue: timerString,
            showFeedback: showFeedback,
            isCorrect: isCorrect,
            correctAnswer: correctAnswerDisplay,
            feedbackMessage: feedbackMessage,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center justify-center w-full max-w-5xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-6 text-center w-full",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2",
                                children: currentItem?.prompt
                            }, void 0, false, {
                                fileName: "[project]/src/features/vocabulary/pages/HighlightWordGamePage.tsx",
                                lineNumber: 283,
                                columnNumber: 13
                            }, this),
                            currentItem?.isMultiSelect && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-gray-500 dark:text-gray-400",
                                children: [
                                    "Select all ",
                                    currentItem.correctWords.length,
                                    " correct words",
                                    selectedWordIndices.size > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ml-2 font-semibold text-blue-500",
                                        children: [
                                            "(",
                                            selectedWordIndices.size,
                                            " selected)"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/features/vocabulary/pages/HighlightWordGamePage.tsx",
                                        lineNumber: 290,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/features/vocabulary/pages/HighlightWordGamePage.tsx",
                                lineNumber: 287,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/features/vocabulary/pages/HighlightWordGamePage.tsx",
                        lineNumber: 282,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap justify-center gap-3 text-lg md:text-xl font-medium leading-relaxed max-w-4xl mx-auto",
                        children: words.map((word, index)=>{
                            const cleanWord = normalizeApostrophe(word).replace(/[.,!?;:]/g, "").toLowerCase();
                            let styles = "bg-transparent text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg px-2 py-1 cursor-pointer transition-all border border-transparent";
                            if (isAnswered) {
                                const isTarget = currentItem.isMultiSelect ? currentItem.correctWords.includes(cleanWord) : cleanWord === normalizeApostrophe(currentItem.correctWord).toLowerCase();
                                const wasSelected = currentItem.isMultiSelect ? selectedWordIndices.has(index) : selectedWordIndex === index;
                                if (isTarget) {
                                    styles = "bg-green-100 text-green-800 ring-2 ring-green-400 rounded-lg px-2 py-1 shadow-sm";
                                } else if (wasSelected) {
                                    styles = "bg-red-100 text-red-800 ring-2 ring-red-400 rounded-lg px-2 py-1 opacity-80";
                                } else {
                                    styles = "text-gray-400 dark:text-gray-600 rounded-lg px-2 py-1 opacity-50";
                                }
                            } else {
                                // Pre-answer selection highlights
                                const isSelected = currentItem?.isMultiSelect ? selectedWordIndices.has(index) : selectedWordIndex === index;
                                if (isSelected) {
                                    styles = "bg-blue-100 text-blue-800 ring-2 ring-blue-300 rounded-lg px-2 py-1 shadow-sm";
                                }
                            }
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                onClick: ()=>handleWordClick(index),
                                className: styles,
                                children: word
                            }, index, false, {
                                fileName: "[project]/src/features/vocabulary/pages/HighlightWordGamePage.tsx",
                                lineNumber: 341,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/features/vocabulary/pages/HighlightWordGamePage.tsx",
                        lineNumber: 299,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/features/vocabulary/pages/HighlightWordGamePage.tsx",
                lineNumber: 280,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/features/vocabulary/pages/HighlightWordGamePage.tsx",
            lineNumber: 251,
            columnNumber: 7
        }, this)
    }, void 0, false);
}
_s(HighlightWordGamePage, "5QT67FZ1G4oFqeT8rjimXnf3VGM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useExerciseTimer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useExerciseTimer"]
    ];
});
_c = HighlightWordGamePage;
var _c;
__turbopack_context__.k.register(_c, "HighlightWordGamePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_b9b798d0._.js.map