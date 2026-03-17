"use client";

import { useRouter } from "next/navigation";

/**
 * Hook to handle navigation back to the Practice page with the correct tab preserved.
 * Reads the 'from' query parameter from the current URL at click time (client-side only).
 */
export function usePracticeExit() {
  const router = useRouter();

  const handleExit = () => {
    // Read search params at call time (client-side) to avoid useSearchParams Suspense requirement
    const params = typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
    const fromCategory = params?.get("from");
    if (fromCategory) {
      router.push(`/practice?tab=${fromCategory}`);
    } else {
      router.push("/practice");
    }
  };

  return handleExit;
}
