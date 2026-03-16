module.exports = [
"[project]/src/hooks/useStudentProfile.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useStudentProfile",
    ()=>useStudentProfile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$ProfileContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/ProfileContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$userApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/userApi.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$chunk$2d$XE3Y43DU$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@clerk/react/dist/chunk-XE3Y43DU.mjs [app-ssr] (ecmascript) <locals>");
"use client";
;
;
;
function useStudentProfile() {
    const { activeProfile, profiles, isLoading, refreshProfiles } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$ProfileContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useProfile"])();
    const { getToken } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$chunk$2d$XE3Y43DU$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useAuth"])();
    const isStudent = activeProfile?.role === "student";
    const needsOnboarding = profiles.length === 0;
    const updatePrivacy = async (privacyData)=>{
        const token = await getToken();
        return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$userApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updatePrivacySettings"])(privacyData, token);
    };
    const checkUsername = async (username)=>{
        const token = await getToken();
        return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$userApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["checkUsernameAvailability"])(username, token);
    };
    return {
        needsOnboarding,
        profile: isStudent ? activeProfile : null,
        isLoading,
        refreshProfile: refreshProfiles,
        updatePrivacy,
        checkUsername
    };
}
}),
"[project]/src/hooks/useTeacherProfile.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useTeacherProfile",
    ()=>useTeacherProfile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$ProfileContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/ProfileContext.tsx [app-ssr] (ecmascript)");
"use client";
;
function useTeacherProfile() {
    const { activeProfile, profiles, isLoading, refreshProfiles } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$ProfileContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useProfile"])();
    const isTeacher = activeProfile?.role === "teacher";
    const needsOnboarding = profiles.filter((p)=>p.role === "teacher").length === 0;
    return {
        needsOnboarding,
        profile: isTeacher ? activeProfile : null,
        isLoading,
        refreshProfile: refreshProfiles
    };
}
}),
"[project]/src/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
}),
"[project]/src/components/ui/button.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/90",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline"
        },
        size: {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
const Button = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, variant, size, asChild = false, ...props }, ref)=>{
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Slot"] : "button";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/button.tsx",
        lineNumber: 39,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
});
Button.displayName = "Button";
;
}),
"[project]/src/components/ui/card.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card,
    "CardContent",
    ()=>CardContent,
    "CardDescription",
    ()=>CardDescription,
    "CardFooter",
    ()=>CardFooter,
    "CardHeader",
    ()=>CardHeader,
    "CardTitle",
    ()=>CardTitle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
const Card = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("rounded-xl border bg-card text-card-foreground shadow", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 5,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
Card.displayName = "Card";
const CardHeader = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex flex-col space-y-1.5 p-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 17,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
CardHeader.displayName = "CardHeader";
const CardTitle = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("font-semibold leading-none tracking-tight", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 26,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
CardTitle.displayName = "CardTitle";
const CardDescription = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-sm text-muted-foreground", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 35,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
CardDescription.displayName = "CardDescription";
const CardContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("p-6 pt-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 44,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
CardContent.displayName = "CardContent";
const CardFooter = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex items-center p-6 pt-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 49,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
CardFooter.displayName = "CardFooter";
;
}),
"[project]/src/features/auth/components/TeacherOnboardingModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TeacherOnboardingModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@clerk/react/node_modules/@clerk/shared/dist/runtime/react/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$chunk$2d$XE3Y43DU$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@clerk/react/dist/chunk-XE3Y43DU.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$CheckCircleIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircleIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/CheckCircleIcon.js [app-ssr] (ecmascript) <export default as CheckCircleIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ArrowRightIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRightIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/ArrowRightIcon.js [app-ssr] (ecmascript) <export default as ArrowRightIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ArrowLeftIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeftIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/ArrowLeftIcon.js [app-ssr] (ecmascript) <export default as ArrowLeftIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$LanguageIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LanguageIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/LanguageIcon.js [app-ssr] (ecmascript) <export default as LanguageIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$BriefcaseIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BriefcaseIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/BriefcaseIcon.js [app-ssr] (ecmascript) <export default as BriefcaseIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$UserGroupIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UserGroupIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/UserGroupIcon.js [app-ssr] (ecmascript) <export default as UserGroupIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ClockIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ClockIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/ClockIcon.js [app-ssr] (ecmascript) <export default as ClockIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$userApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/userApi.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
const STEPS = {
    TEACHING_LANG: 1,
    INSTRUCT_LANG: 2,
    EXPERIENCE: 3,
    COMPLETING: 4
};
function TeacherOnboardingModal({ onComplete }) {
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUser"])();
    const { getToken } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$chunk$2d$XE3Y43DU$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useAuth"])();
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(STEPS.TEACHING_LANG);
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        teachingLanguages: [],
        instructionLanguage: "",
        experience: {
            years: 0,
            studentsTaught: 0,
            hoursTaught: 0
        }
    });
    const [isSubmitting, setIsSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // --- Handlers ---
    const handleNext = ()=>{
        if (step === STEPS.TEACHING_LANG && formData.teachingLanguages.length > 0) setStep(STEPS.INSTRUCT_LANG);
        else if (step === STEPS.INSTRUCT_LANG && formData.instructionLanguage) setStep(STEPS.EXPERIENCE);
        else if (step === STEPS.EXPERIENCE) {
            submitProfile(formData);
        }
    };
    const handleBack = ()=>{
        if (step === STEPS.INSTRUCT_LANG) setStep(STEPS.TEACHING_LANG);
        else if (step === STEPS.EXPERIENCE) setStep(STEPS.INSTRUCT_LANG);
    };
    const submitProfile = async (data)=>{
        if (!user) return;
        setIsSubmitting(true);
        setStep(STEPS.COMPLETING);
        try {
            const profileData = {
                clerkUserId: user.id,
                name: user.fullName || user.firstName,
                ...data
            };
            const token = await getToken();
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$userApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createTeacherProfile"])(profileData, token);
            setTimeout(()=>{
                onComplete();
            }, 1500);
        } catch (err) {
            console.error("Submission failed", err);
            setIsSubmitting(false);
        // Handle error (maybe show toast)
        }
    };
    // --- Step Rendering Helpers ---
    const SelectCard = ({ selected, onClick, title, icon: Icon, description })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
            onClick: onClick,
            className: `cursor-pointer p-6 transition-all border-2 hover:border-brand-blue-1/50 ${selected ? "border-brand-blue-1 bg-brand-blue-3/10" : "border-transparent bg-gray-50 dark:bg-card-dark"}`,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-4",
                children: [
                    Icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                        className: `h-8 w-8 ${selected ? "text-brand-blue-1" : "text-gray-400"}`
                    }, void 0, false, {
                        fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                        lineNumber: 101,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: `font-semibold text-lg ${selected ? "text-brand-blue-1" : "text-gray-900 dark:text-gray-100"}`,
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                lineNumber: 108,
                                columnNumber: 11
                            }, this),
                            description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-gray-500",
                                children: description
                            }, void 0, false, {
                                fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                lineNumber: 118,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                        lineNumber: 107,
                        columnNumber: 9
                    }, this),
                    selected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$CheckCircleIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircleIcon$3e$__["CheckCircleIcon"], {
                        className: "h-6 w-6 text-brand-blue-1 ml-auto"
                    }, void 0, false, {
                        fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                        lineNumber: 122,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                lineNumber: 99,
                columnNumber: 7
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
            lineNumber: 91,
            columnNumber: 5
        }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[9999] bg-white dark:bg-body-dark overflow-y-auto",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen flex flex-col max-w-4xl mx-auto px-4 py-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                className: "h-full bg-brand-blue-1",
                                initial: {
                                    width: 0
                                },
                                animate: {
                                    width: `${step / 4 * 100}%`
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                lineNumber: 134,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                            lineNumber: 133,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-between mt-2 text-sm text-gray-500",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        "Step ",
                                        step > 3 ? 3 : step,
                                        " of 3"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                    lineNumber: 141,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "Setting up your teacher profile"
                                }, void 0, false, {
                                    fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                    lineNumber: 142,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                            lineNumber: 140,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                    lineNumber: 132,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 flex flex-col justify-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                        mode: "wait",
                        children: [
                            step === STEPS.TEACHING_LANG && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                initial: {
                                    opacity: 0,
                                    x: 20
                                },
                                animate: {
                                    opacity: 1,
                                    x: 0
                                },
                                exit: {
                                    opacity: 0,
                                    x: -20
                                },
                                className: "space-y-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white",
                                        children: "Which language(s) do you teach?"
                                    }, void 0, false, {
                                        fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                        lineNumber: 158,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid md:grid-cols-2 gap-4",
                                        children: [
                                            "French",
                                            "German",
                                            "Spanish",
                                            "English"
                                        ].map((lang)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SelectCard, {
                                                title: lang,
                                                selected: formData.teachingLanguages.includes(lang),
                                                onClick: ()=>{
                                                    const newLangs = formData.teachingLanguages.includes(lang) ? formData.teachingLanguages.filter((l)=>l !== lang) : [
                                                        ...formData.teachingLanguages,
                                                        lang
                                                    ];
                                                    setFormData({
                                                        ...formData,
                                                        teachingLanguages: newLangs
                                                    });
                                                },
                                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$LanguageIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LanguageIcon$3e$__["LanguageIcon"]
                                            }, lang, false, {
                                                fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                                lineNumber: 163,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                        lineNumber: 161,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, "step1", true, {
                                fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                lineNumber: 151,
                                columnNumber: 15
                            }, this),
                            step === STEPS.INSTRUCT_LANG && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                initial: {
                                    opacity: 0,
                                    x: 20
                                },
                                animate: {
                                    opacity: 1,
                                    x: 0
                                },
                                exit: {
                                    opacity: 0,
                                    x: -20
                                },
                                className: "space-y-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white",
                                        children: "Preferred language of instruction?"
                                    }, void 0, false, {
                                        fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                        lineNumber: 194,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid md:grid-cols-2 gap-4",
                                        children: [
                                            "English",
                                            "Hindi",
                                            "French",
                                            "German",
                                            "Spanish"
                                        ].map((lang)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SelectCard, {
                                                title: lang,
                                                selected: formData.instructionLanguage === lang,
                                                onClick: ()=>setFormData({
                                                        ...formData,
                                                        instructionLanguage: lang
                                                    }),
                                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$LanguageIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LanguageIcon$3e$__["LanguageIcon"]
                                            }, lang, false, {
                                                fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                                lineNumber: 200,
                                                columnNumber: 23
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                        lineNumber: 197,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, "step2", true, {
                                fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                lineNumber: 187,
                                columnNumber: 15
                            }, this),
                            step === STEPS.EXPERIENCE && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                initial: {
                                    opacity: 0,
                                    x: 20
                                },
                                animate: {
                                    opacity: 1,
                                    x: 0
                                },
                                exit: {
                                    opacity: 0,
                                    x: -20
                                },
                                className: "space-y-6 max-w-xl mx-auto w-full",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white",
                                        children: "Tell us about your experience"
                                    }, void 0, false, {
                                        fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                        lineNumber: 227,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$BriefcaseIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BriefcaseIcon$3e$__["BriefcaseIcon"], {
                                                                className: "h-4 w-4"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                                                lineNumber: 233,
                                                                columnNumber: 23
                                                            }, this),
                                                            "Years of Experience"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                                        lineNumber: 232,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        min: "0",
                                                        className: "w-full p-3 rounded-lg border border-gray-200 dark:bg-card-dark dark:border-gray-700",
                                                        value: formData.experience.years,
                                                        onChange: (e)=>setFormData({
                                                                ...formData,
                                                                experience: {
                                                                    ...formData.experience,
                                                                    years: parseInt(e.target.value) || 0
                                                                }
                                                            })
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                                        lineNumber: 236,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                                lineNumber: 231,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$UserGroupIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UserGroupIcon$3e$__["UserGroupIcon"], {
                                                                className: "h-4 w-4"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                                                lineNumber: 255,
                                                                columnNumber: 23
                                                            }, this),
                                                            "Approx. Students Taught"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                                        lineNumber: 254,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        min: "0",
                                                        className: "w-full p-3 rounded-lg border border-gray-200 dark:bg-card-dark dark:border-gray-700",
                                                        value: formData.experience.studentsTaught,
                                                        onChange: (e)=>setFormData({
                                                                ...formData,
                                                                experience: {
                                                                    ...formData.experience,
                                                                    studentsTaught: parseInt(e.target.value) || 0
                                                                }
                                                            })
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                                        lineNumber: 258,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                                lineNumber: 253,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ClockIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ClockIcon$3e$__["ClockIcon"], {
                                                                className: "h-4 w-4"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                                                lineNumber: 277,
                                                                columnNumber: 23
                                                            }, this),
                                                            "Approx. Teaching Hours"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                                        lineNumber: 276,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        min: "0",
                                                        className: "w-full p-3 rounded-lg border border-gray-200 dark:bg-card-dark dark:border-gray-700",
                                                        value: formData.experience.hoursTaught,
                                                        onChange: (e)=>setFormData({
                                                                ...formData,
                                                                experience: {
                                                                    ...formData.experience,
                                                                    hoursTaught: parseInt(e.target.value) || 0
                                                                }
                                                            })
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                                        lineNumber: 280,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                                lineNumber: 275,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                        lineNumber: 230,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, "step3", true, {
                                fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                lineNumber: 220,
                                columnNumber: 15
                            }, this),
                            step === STEPS.COMPLETING && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                initial: {
                                    opacity: 0
                                },
                                animate: {
                                    opacity: 1
                                },
                                className: "text-center py-20",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-blue-1 mb-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                        lineNumber: 308,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-2xl font-bold text-gray-900 dark:text-white",
                                        children: "Creating your teacher profile..."
                                    }, void 0, false, {
                                        fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                        lineNumber: 309,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, "completing", true, {
                                fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                lineNumber: 302,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                        lineNumber: 148,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                    lineNumber: 147,
                    columnNumber: 9
                }, this),
                step !== STEPS.COMPLETING && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-8 flex justify-between pt-6 border-t border-gray-100 dark:border-gray-800",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "ghost",
                            onClick: handleBack,
                            disabled: step === STEPS.TEACHING_LANG,
                            className: `${step === STEPS.TEACHING_LANG ? "invisible" : ""}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ArrowLeftIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeftIcon$3e$__["ArrowLeftIcon"], {
                                    className: "h-4 w-4 mr-2"
                                }, void 0, false, {
                                    fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                    lineNumber: 326,
                                    columnNumber: 15
                                }, this),
                                "Back"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                            lineNumber: 320,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: handleNext,
                            disabled: step === STEPS.TEACHING_LANG && formData.teachingLanguages.length === 0 || step === STEPS.INSTRUCT_LANG && !formData.instructionLanguage,
                            className: "bg-brand-blue-1 hover:bg-brand-blue-2",
                            children: [
                                step === STEPS.EXPERIENCE ? "Finish Setup" : "Next Step",
                                step !== STEPS.EXPERIENCE && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ArrowRightIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRightIcon$3e$__["ArrowRightIcon"], {
                                    className: "h-4 w-4 ml-2"
                                }, void 0, false, {
                                    fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                                    lineNumber: 341,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                            lineNumber: 330,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
                    lineNumber: 319,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
            lineNumber: 130,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/features/auth/components/TeacherOnboardingModal.tsx",
        lineNumber: 129,
        columnNumber: 5
    }, this), document.body);
}
}),
"[project]/src/components/ui/input.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Input",
    ()=>Input
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
const Input = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, type, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/input.tsx",
        lineNumber: 6,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
});
Input.displayName = "Input";
;
}),
"[project]/src/services/vocabularyApi.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
const API_BASE_URL = ("TURBOPACK compile-time value", "http://localhost:8000") || "https://language-api-mine.onrender.com";
// Toggle to force CSV mock data instead of API calls
const USE_MOCK_CSV_DATA = process.env.NEXT_PUBLIC_USE_MOCK_CSV_DATA === "true" || ("TURBOPACK compile-time value", "undefined") !== "undefined" && localStorage.getItem("USE_MOCK_CSV_DATA") === "true";
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
            const Papa = await __turbopack_context__.A("[project]/node_modules/papaparse/papaparse.js [app-ssr] (ecmascript, async loader)");
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
                const Papa = await __turbopack_context__.A("[project]/node_modules/papaparse/papaparse.js [app-ssr] (ecmascript, async loader)");
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
            const Papa = await __turbopack_context__.A("[project]/node_modules/papaparse/papaparse.js [app-ssr] (ecmascript, async loader)");
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
}),
"[project]/src/hooks/useStudentTeachers.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useStudentTeachers",
    ()=>useStudentTeachers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$chunk$2d$XE3Y43DU$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@clerk/react/dist/chunk-XE3Y43DU.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useStudentProfile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useStudentProfile.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$vocabularyApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/vocabularyApi.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function useStudentTeachers() {
    const { profile } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useStudentProfile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStudentProfile"])();
    const { getToken } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$chunk$2d$XE3Y43DU$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useAuth"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "student-teachers",
            profile?.studentId
        ],
        queryFn: async ()=>{
            const token = await getToken();
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$vocabularyApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchStudentTeachers"])(profile?.studentId, null, token);
        },
        enabled: !!profile?.studentId
    });
}
}),
"[project]/src/components/shared/ConnectTeacher.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ConnectTeacher
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$chunk$2d$XE3Y43DU$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@clerk/react/dist/chunk-XE3Y43DU.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/input.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$UserPlusIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UserPlusIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/UserPlusIcon.js [app-ssr] (ecmascript) <export default as UserPlusIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$CheckCircleIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircleIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/CheckCircleIcon.js [app-ssr] (ecmascript) <export default as CheckCircleIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ExclamationCircleIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExclamationCircleIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/ExclamationCircleIcon.js [app-ssr] (ecmascript) <export default as ExclamationCircleIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$AcademicCapIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AcademicCapIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/AcademicCapIcon.js [app-ssr] (ecmascript) <export default as AcademicCapIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ClockIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ClockIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/ClockIcon.js [app-ssr] (ecmascript) <export default as ClockIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$TrashIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrashIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/TrashIcon.js [app-ssr] (ecmascript) <export default as TrashIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useStudentProfile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useStudentProfile.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useStudentTeachers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useStudentTeachers.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$vocabularyApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/vocabularyApi.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
;
function ConnectTeacher() {
    const { profile } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useStudentProfile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStudentProfile"])();
    const { data: teachers, isLoading: isLoadingTeachers, refetch: refetchTeachers } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useStudentTeachers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStudentTeachers"])();
    const [teacherId, setTeacherId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("idle"); // idle, loading, success, error
    const [errorMessage, setErrorMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    const { getToken } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$chunk$2d$XE3Y43DU$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useAuth"])();
    const mutation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: async ()=>{
            const token = await getToken();
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$vocabularyApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["linkStudentToTeacher"])(profile.profileId, teacherId, token);
        },
        onSuccess: ()=>{
            setStatus("success");
            setTeacherId("");
            refetchTeachers(); // Refresh the list of teachers
            setTimeout(()=>setStatus("idle"), 3000);
        },
        onError: (error)=>{
            setStatus("error");
            setErrorMessage(error.message);
        }
    });
    const handleSubmit = (e)=>{
        e.preventDefault();
        if (!teacherId || !profile?.profileId) return;
        setStatus("loading");
        mutation.mutate();
    };
    const handleDelete = async (relationshipId)=>{
        if (!confirm("Are you sure you want to remove this connection?")) return;
        try {
            const token = await window.Clerk.session.getToken();
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$vocabularyApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deleteRelationship"])(relationshipId, token);
            refetchTeachers();
        } catch (error) {
            console.error("Failed to delete", error);
            alert("Failed to remove connection");
        }
    };
    if (!profile) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
        className: "border-gray-100 dark:border-subtle-dark shadow-sm h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                        className: "flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-primary-dark",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$UserPlusIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UserPlusIcon$3e$__["UserPlusIcon"], {
                                className: "h-5 w-5 text-brand-blue-1"
                            }, void 0, false, {
                                fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                                lineNumber: 87,
                                columnNumber: 11
                            }, this),
                            "Classroom Connection"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                        lineNumber: 86,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardDescription"], {
                        children: "Connect with your teacher to join their virtual classroom."
                    }, void 0, false, {
                        fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                        lineNumber: 90,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                lineNumber: 85,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                className: "space-y-6",
                children: [
                    teachers && teachers.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                children: "Your Teachers"
                            }, void 0, false, {
                                fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                                lineNumber: 98,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: teachers.map((teacher)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3 p-3 bg-brand-blue-3/10 rounded-lg border border-brand-blue-3/20",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-2 bg-white dark:bg-card-dark rounded-full shadow-sm",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$AcademicCapIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AcademicCapIcon$3e$__["AcademicCapIcon"], {
                                                    className: "h-4 w-4 text-brand-blue-1"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                                                    lineNumber: 108,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                                                lineNumber: 107,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm font-semibold text-gray-900 dark:text-primary-dark",
                                                        children: [
                                                            "Teacher ",
                                                            teacher.teacherId
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                                                        lineNumber: 111,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-gray-500 dark:text-secondary-dark",
                                                        children: [
                                                            "Connected since",
                                                            " ",
                                                            new Date(teacher.createdAt).toLocaleDateString()
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                                                        lineNumber: 114,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                                                lineNumber: 110,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    teacher.status === "pending" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ClockIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ClockIcon$3e$__["ClockIcon"], {
                                                                className: "h-3 w-3"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                                                                lineNumber: 122,
                                                                columnNumber: 25
                                                            }, this),
                                                            "Pending"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                                                        lineNumber: 121,
                                                        columnNumber: 23
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
                                                        children: "Active"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                                                        lineNumber: 126,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                        variant: "ghost",
                                                        size: "icon",
                                                        className: "h-7 w-7 text-gray-400 hover:text-red-500",
                                                        onClick: ()=>handleDelete(teacher.id),
                                                        title: "Remove connection",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$TrashIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrashIcon$3e$__["TrashIcon"], {
                                                            className: "h-4 w-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                                                            lineNumber: 137,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                                                        lineNumber: 130,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                                                lineNumber: 119,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, teacher.teacherId, true, {
                                        fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                                        lineNumber: 103,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                                lineNumber: 101,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                        lineNumber: 97,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                children: teachers && teachers.length > 0 ? "Connect Another Teacher" : "Connect with a Teacher"
                            }, void 0, false, {
                                fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                                lineNumber: 148,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                onSubmit: handleSubmit,
                                className: "flex flex-col sm:flex-row gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                            placeholder: "Enter Teacher ID (e.g. T-123456)",
                                            value: teacherId,
                                            onChange: (e)=>setTeacherId(e.target.value),
                                            disabled: status === "loading" || status === "success"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                                            lineNumber: 158,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                                        lineNumber: 157,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                        type: "submit",
                                        disabled: !teacherId || status === "loading" || status === "success",
                                        children: status === "loading" ? "Connecting..." : "Connect"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                                        lineNumber: 165,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                                lineNumber: 153,
                                columnNumber: 11
                            }, this),
                            status === "success" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-3 flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 p-2 rounded-md",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$CheckCircleIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircleIcon$3e$__["CheckCircleIcon"], {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                                        lineNumber: 177,
                                        columnNumber: 15
                                    }, this),
                                    "Successfully connected to teacher!"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                                lineNumber: 176,
                                columnNumber: 13
                            }, this),
                            status === "error" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-2 rounded-md",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ExclamationCircleIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExclamationCircleIcon$3e$__["ExclamationCircleIcon"], {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                                        lineNumber: 184,
                                        columnNumber: 15
                                    }, this),
                                    errorMessage
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                                lineNumber: 183,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                        lineNumber: 147,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
                lineNumber: 94,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/shared/ConnectTeacher.tsx",
        lineNumber: 84,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/dashboard/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProfilePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@clerk/react/node_modules/@clerk/shared/dist/runtime/react/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useStudentProfile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useStudentProfile.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useTeacherProfile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useTeacherProfile.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$auth$2f$components$2f$TeacherOnboardingModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/auth/components/TeacherOnboardingModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$shared$2f$ConnectTeacher$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/shared/ConnectTeacher.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$UserIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UserIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/UserIcon.js [app-ssr] (ecmascript) <export default as UserIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ShieldCheckIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheckIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/ShieldCheckIcon.js [app-ssr] (ecmascript) <export default as ShieldCheckIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ClockIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ClockIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/ClockIcon.js [app-ssr] (ecmascript) <export default as ClockIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$Cog6ToothIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Cog6ToothIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/Cog6ToothIcon.js [app-ssr] (ecmascript) <export default as Cog6ToothIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$PencilSquareIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PencilSquareIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/PencilSquareIcon.js [app-ssr] (ecmascript) <export default as PencilSquareIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$UserGroupIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UserGroupIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/UserGroupIcon.js [app-ssr] (ecmascript) <export default as UserGroupIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$CreditCardIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCardIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/CreditCardIcon.js [app-ssr] (ecmascript) <export default as CreditCardIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$SparklesIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SparklesIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/SparklesIcon.js [app-ssr] (ecmascript) <export default as SparklesIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$GlobeAltIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GlobeAltIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/GlobeAltIcon.js [app-ssr] (ecmascript) <export default as GlobeAltIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$LinkIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LinkIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/LinkIcon.js [app-ssr] (ecmascript) <export default as LinkIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$CheckIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/CheckIcon.js [app-ssr] (ecmascript) <export default as CheckIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$FingerPrintIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FingerPrintIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/FingerPrintIcon.js [app-ssr] (ecmascript) <export default as FingerPrintIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-hot-toast/dist/index.mjs [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
function ProfilePage() {
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUser"])();
    const isTeacherUser = user?.publicMetadata?.is_teacher === true;
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const { profile, updatePrivacy, checkUsername } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useStudentProfile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStudentProfile"])();
    const { profile: teacherProfile, needsOnboarding: needsTeacherOnboarding, refreshProfile: refreshTeacherProfile } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useTeacherProfile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTeacherProfile"])();
    const [showTeacherOnboarding, setShowTeacherOnboarding] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Privacy State
    const [isPublic, setIsPublic] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(profile?.isPublic || false);
    const [username, setUsername] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(profile?.username || "");
    const [isCheckingUsername, setIsCheckingUsername] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [usernameStatus, setUsernameStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null); // 'available', 'taken', 'invalid'
    const [isUpdatingPrivacy, setIsUpdatingPrivacy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Update local state when profile loads
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (profile) {
            setIsPublic(profile.isPublic);
            setUsername(profile.username || "");
        }
    }, [
        profile
    ]);
    const handleUsernameChange = async (e)=>{
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
        setUsername(value);
        if (value.length < 3) {
            setUsernameStatus(null);
            return;
        }
        setIsCheckingUsername(true);
        try {
            const res = await checkUsername(value);
            if (res.available) {
                setUsernameStatus("available");
            } else {
                setUsernameStatus("taken");
            }
        } catch (err) {
            console.error(err);
        } finally{
            setIsCheckingUsername(false);
        }
    };
    const handleSavePrivacy = async ()=>{
        if (isPublic && (!username || username.length < 3)) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error("Please set a valid username for your public profile");
            return;
        }
        setIsUpdatingPrivacy(true);
        try {
            await updatePrivacy({
                isPublic,
                username
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Privacy settings updated!");
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error("Failed to update privacy settings");
        } finally{
            setIsUpdatingPrivacy(false);
        }
    };
    const copyProfileLink = ()=>{
        const url = `${window.location.origin}/profile/${profile.username}`;
        navigator.clipboard.writeText(url);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Profile link copied!");
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-8 animate-fade-in",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-3xl font-bold tracking-tight text-gray-900 dark:text-primary-dark",
                        children: [
                            "Welcome back,",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-brand-blue-1",
                                children: user?.firstName || "User"
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 117,
                                columnNumber: 11
                            }, this),
                            "! 👋"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 115,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-lg text-gray-500 dark:text-secondary-dark",
                        children: "Manage your account and subscription details here."
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 120,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/dashboard/page.tsx",
                lineNumber: 114,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid md:grid-cols-2 lg:grid-cols-4 gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                        className: "border-brand-yellow-2/30 bg-brand-yellow-1/5 shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                                className: "flex flex-row items-center justify-between space-y-0 pb-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                                        className: "text-sm font-medium text-brand-yellow-3",
                                        children: "Tokens Pending"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 130,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-4 w-4 text-brand-yellow-2",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$SparklesIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SparklesIcon$3e$__["SparklesIcon"], {}, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/page.tsx",
                                            lineNumber: 134,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 133,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 129,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-2xl font-bold text-gray-900 dark:text-primary-dark",
                                        children: profile?.stats?.tokens ?? 0
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 138,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-gray-500 mt-1",
                                        children: "Available for AI practice"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 141,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 137,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 128,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                        className: "border-brand-purple-2/30 bg-purple-50 dark:bg-purple-900/10 shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                                className: "flex flex-row items-center justify-between space-y-0 pb-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                                        className: "text-sm font-medium text-purple-700 dark:text-purple-300",
                                        children: "Subscription"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 150,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-4 w-4 text-purple-500",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$CreditCardIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCardIcon$3e$__["CreditCardIcon"], {}, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/page.tsx",
                                            lineNumber: 154,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 153,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 149,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-2xl font-bold text-gray-900 dark:text-primary-dark capitalize",
                                        children: profile?.pricingPlan ? profile.pricingPlan.replace("-", " ") : "Free Plan"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 158,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-green-600 mt-1",
                                        children: "Active • Expires Mar 2026"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 163,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 157,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 148,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                        className: "border-gray-100 dark:border-subtle-dark dark:bg-card-dark shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                                className: "flex flex-row items-center justify-between space-y-0 pb-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                                        className: "text-sm font-medium text-gray-600 dark:text-muted-dark",
                                        children: "Account Status"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 172,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-4 w-4 text-green-500",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ShieldCheckIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheckIcon$3e$__["ShieldCheckIcon"], {}, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/page.tsx",
                                            lineNumber: 176,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 175,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 171,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-2xl font-bold text-gray-900 dark:text-primary-dark",
                                        children: user?.primaryEmailAddress?.verification?.status === "verified" ? "Verified" : "Unverified"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 180,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-gray-400 dark:text-secondary-dark mt-1",
                                        children: "Student Account"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 185,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 179,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 170,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                        className: "border-gray-100 dark:border-subtle-dark dark:bg-card-dark shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                                className: "flex flex-row items-center justify-between space-y-0 pb-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                                        className: "text-sm font-medium text-gray-600 dark:text-muted-dark",
                                        children: "Last Login"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 194,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-4 w-4 text-blue-500",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ClockIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ClockIcon$3e$__["ClockIcon"], {}, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/page.tsx",
                                            lineNumber: 198,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 197,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 193,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-2xl font-bold text-gray-900 dark:text-primary-dark",
                                        children: "Today"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 202,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-gray-400 dark:text-secondary-dark mt-1",
                                        children: new Date().toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 205,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 201,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 192,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/dashboard/page.tsx",
                lineNumber: 126,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                className: "border-gray-100 dark:border-subtle-dark shadow-lg bg-white dark:bg-card-dark overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue-1 to-brand-blue-2"
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 217,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-between items-start",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                                            className: "text-2xl font-bold text-gray-900 dark:text-primary-dark",
                                            children: "Personal Details"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/page.tsx",
                                            lineNumber: 221,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardDescription"], {
                                            children: "Your profile information visible to teachers"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/page.tsx",
                                            lineNumber: 224,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/dashboard/page.tsx",
                                    lineNumber: 220,
                                    columnNumber: 13
                                }, this),
                                profile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 bg-brand-blue-1/10 text-brand-blue-1 px-3 py-1 rounded-full text-sm font-semibold",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "uppercase",
                                            children: profile.targetLanguage
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/page.tsx",
                                            lineNumber: 230,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-gray-300",
                                            children: "|"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/page.tsx",
                                            lineNumber: 231,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: profile.level
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/page.tsx",
                                            lineNumber: 232,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/dashboard/page.tsx",
                                    lineNumber: 229,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/dashboard/page.tsx",
                            lineNumber: 219,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 218,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                        className: "space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center space-x-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: user?.imageUrl,
                                                alt: "Profile",
                                                className: "w-20 h-20 rounded-full ring-4 ring-gray-50 border-2 border-white shadow-sm"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/page.tsx",
                                                lineNumber: 240,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute bottom-1 right-1 h-5 w-5 rounded-full bg-green-400 border-2 border-white"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/page.tsx",
                                                lineNumber: 245,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 239,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xl font-bold text-gray-900 dark:text-primary-dark",
                                                children: user?.fullName || "User"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/page.tsx",
                                                lineNumber: 248,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 text-gray-500 dark:text-secondary-dark",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$UserIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UserIcon$3e$__["UserIcon"], {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                                        lineNumber: 252,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm",
                                                        children: user?.primaryEmailAddress?.emailAddress
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                                        lineNumber: 253,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/dashboard/page.tsx",
                                                lineNumber: 251,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-2 text-sm text-gray-500 dark:text-secondary-dark flex gap-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "📞 +1 (555) 123-4567"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                                        lineNumber: 259,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "📍 New York, USA"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                                        lineNumber: 260,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "🕒 GMT-5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                                        lineNumber: 261,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/dashboard/page.tsx",
                                                lineNumber: 258,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 247,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 238,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-subtle-dark",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-3",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-muted-dark",
                                                    children: "Student ID"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/page.tsx",
                                                    lineNumber: 269,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "font-mono text-xs bg-gray-50 dark:bg-elevated-2 p-2 rounded-md text-gray-600 dark:text-secondary-dark break-all border border-gray-100 dark:border-subtle-dark",
                                                    children: profile?.profileId || "N/A"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/page.tsx",
                                                    lineNumber: 272,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/dashboard/page.tsx",
                                            lineNumber: 268,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 267,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-muted-dark",
                                                children: "Member Since"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/page.tsx",
                                                lineNumber: 278,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-medium text-gray-700 dark:text-primary-dark",
                                                children: user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric"
                                                }) : "N/A"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/page.tsx",
                                                lineNumber: 281,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 277,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 266,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 237,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/dashboard/page.tsx",
                lineNumber: 216,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$shared$2f$ConnectTeacher$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/app/dashboard/page.tsx",
                lineNumber: 296,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                className: "border-gray-100 dark:border-subtle-dark shadow-lg bg-white dark:bg-card-dark",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 mb-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$GlobeAltIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GlobeAltIcon$3e$__["GlobeAltIcon"], {
                                        className: "h-6 w-6 text-brand-blue-1"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 302,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                                        className: "text-xl font-bold text-gray-900 dark:text-primary-dark",
                                        children: "Privacy & Sharing"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 303,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 301,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardDescription"], {
                                children: "Control how others see your progress. Make your profile public to share your achievements."
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 307,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 300,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                        className: "space-y-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col md:flex-row gap-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 space-y-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-elevated-2 border border-gray-100 dark:border-subtle-dark",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-0.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm font-semibold text-gray-900 dark:text-primary-dark",
                                                            children: "Public Profile"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/dashboard/page.tsx",
                                                            lineNumber: 318,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-gray-500 dark:text-secondary-dark",
                                                            children: "Allow anyone with the link to see your stats"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/dashboard/page.tsx",
                                                            lineNumber: 321,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/dashboard/page.tsx",
                                                    lineNumber: 317,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>setIsPublic(!isPublic),
                                                    className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent ${isPublic ? "bg-brand-blue-1" : "bg-gray-200"}`,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublic ? "translate-x-6" : "translate-x-1"}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                                        lineNumber: 329,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/page.tsx",
                                                    lineNumber: 325,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/dashboard/page.tsx",
                                            lineNumber: 316,
                                            columnNumber: 15
                                        }, this),
                                        isPublic && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-2 animate-in fade-in slide-in-from-top-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-muted-dark",
                                                    children: "Your Profile Username"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/page.tsx",
                                                    lineNumber: 337,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "relative",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$FingerPrintIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FingerPrintIcon$3e$__["FingerPrintIcon"], {
                                                                className: "h-4 w-4 text-gray-400"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/dashboard/page.tsx",
                                                                lineNumber: 342,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/dashboard/page.tsx",
                                                            lineNumber: 341,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            value: username,
                                                            onChange: handleUsernameChange,
                                                            placeholder: "choose_a_username",
                                                            className: `block w-full pl-10 pr-10 py-2 sm:text-sm border rounded-lg bg-white dark:bg-card-dark focus:ring-brand-blue-1 focus:border-brand-blue-1 ${usernameStatus === "taken" ? "border-red-300" : usernameStatus === "available" ? "border-green-300" : "border-gray-200 dark:border-subtle-dark"}`
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/dashboard/page.tsx",
                                                            lineNumber: 344,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "absolute inset-y-0 right-0 pr-3 flex items-center",
                                                            children: isCheckingUsername ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "h-4 w-4 border-2 border-brand-blue-1 border-t-transparent rounded-full animate-spin"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/dashboard/page.tsx",
                                                                lineNumber: 358,
                                                                columnNumber: 25
                                                            }, this) : usernameStatus === "available" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$CheckIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckIcon$3e$__["CheckIcon"], {
                                                                className: "h-4 w-4 text-green-500"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/dashboard/page.tsx",
                                                                lineNumber: 360,
                                                                columnNumber: 25
                                                            }, this) : usernameStatus === "taken" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[10px] text-red-500 font-bold",
                                                                children: "TAKEN"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/dashboard/page.tsx",
                                                                lineNumber: 362,
                                                                columnNumber: 25
                                                            }, this) : null
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/dashboard/page.tsx",
                                                            lineNumber: 356,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/dashboard/page.tsx",
                                                    lineNumber: 340,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] text-gray-500",
                                                    children: "Only letters, numbers, and underscores allowed."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/page.tsx",
                                                    lineNumber: 368,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/dashboard/page.tsx",
                                            lineNumber: 336,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/dashboard/page.tsx",
                                    lineNumber: 315,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "md:w-72 flex flex-col gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                            onClick: handleSavePrivacy,
                                            disabled: isUpdatingPrivacy || isPublic && usernameStatus === "taken",
                                            className: "w-full bg-brand-blue-1 hover:bg-brand-blue-2 text-white h-11",
                                            children: [
                                                isUpdatingPrivacy ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/page.tsx",
                                                    lineNumber: 385,
                                                    columnNumber: 19
                                                }, this) : null,
                                                "Save Settings"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/dashboard/page.tsx",
                                            lineNumber: 377,
                                            columnNumber: 15
                                        }, this),
                                        profile?.username && profile?.isPublic && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "outline",
                                            onClick: copyProfileLink,
                                            className: "w-full h-11 border-brand-blue-1/20 hover:bg-brand-blue-1/5 text-brand-blue-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$LinkIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LinkIcon$3e$__["LinkIcon"], {
                                                    className: "h-4 w-4 mr-2"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/page.tsx",
                                                    lineNumber: 396,
                                                    columnNumber: 19
                                                }, this),
                                                "Copy Profile Link"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/dashboard/page.tsx",
                                            lineNumber: 391,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/dashboard/page.tsx",
                                    lineNumber: 376,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/dashboard/page.tsx",
                            lineNumber: 313,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 312,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/dashboard/page.tsx",
                lineNumber: 299,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-bold text-gray-900 dark:text-primary-dark",
                        children: "Quick Actions"
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 407,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "outline",
                                className: "h-auto p-6 flex flex-col items-start gap-4 hover:border-brand-blue-1 hover:bg-brand-blue-3/10 transition-all border-dashed dark:border-subtle-dark dark:hover:border-accent-primary",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-2 rounded-full bg-brand-blue-3/30 text-brand-blue-1",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$PencilSquareIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PencilSquareIcon$3e$__["PencilSquareIcon"], {
                                            className: "h-6 w-6"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/page.tsx",
                                            lineNumber: 416,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 415,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-left",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "font-semibold text-gray-900 dark:text-primary-dark",
                                                children: "Edit Profile"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/page.tsx",
                                                lineNumber: 419,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-gray-500 dark:text-secondary-dark mt-1",
                                                children: "Update your personal details"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/page.tsx",
                                                lineNumber: 422,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 418,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 411,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "outline",
                                className: "h-auto p-6 flex flex-col items-start gap-4 hover:border-brand-blue-1 hover:bg-brand-blue-3/10 transition-all border-dashed dark:border-subtle-dark dark:hover:border-accent-primary",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-2 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$Cog6ToothIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Cog6ToothIcon$3e$__["Cog6ToothIcon"], {
                                            className: "h-6 w-6"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/page.tsx",
                                            lineNumber: 433,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 432,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-left",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "font-semibold text-gray-900 dark:text-primary-dark",
                                                children: "Settings"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/page.tsx",
                                                lineNumber: 436,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-gray-500 dark:text-secondary-dark mt-1",
                                                children: "Manage account preferences"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/page.tsx",
                                                lineNumber: 439,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 435,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 428,
                                columnNumber: 11
                            }, this),
                            isTeacherUser && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "outline",
                                onClick: ()=>{
                                    if (needsTeacherOnboarding) {
                                        setShowTeacherOnboarding(true);
                                    } else {
                                        router.push("/teacher-dashboard");
                                    }
                                },
                                className: "h-auto p-6 flex flex-col items-start gap-4 hover:border-brand-blue-1 hover:bg-brand-blue-3/10 transition-all border-dashed dark:border-subtle-dark dark:hover:border-accent-primary",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-2 rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$UserGroupIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UserGroupIcon$3e$__["UserGroupIcon"], {
                                            className: "h-6 w-6"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/page.tsx",
                                            lineNumber: 459,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 458,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-left",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "font-semibold text-gray-900 dark:text-primary-dark",
                                                children: needsTeacherOnboarding ? "Become a Teacher" : "Teacher Dashboard"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/page.tsx",
                                                lineNumber: 462,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-gray-500 dark:text-secondary-dark mt-1",
                                                children: needsTeacherOnboarding ? "Start teaching on platform" : "Manage your classes"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/page.tsx",
                                                lineNumber: 467,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 461,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 447,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 410,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/dashboard/page.tsx",
                lineNumber: 406,
                columnNumber: 7
            }, this),
            showTeacherOnboarding && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$auth$2f$components$2f$TeacherOnboardingModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                onComplete: ()=>{
                    setShowTeacherOnboarding(false);
                    refreshTeacherProfile();
                }
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/page.tsx",
                lineNumber: 479,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/dashboard/page.tsx",
        lineNumber: 112,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=src_0b31f2c2._.js.map