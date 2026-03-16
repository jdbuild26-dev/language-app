"use client";

import { useRouter, useSearchParams } from "next/navigation";

/**
 * Hook to handle navigation back to the Practice page with the correct tab preserved.
 * Reads the 'from' query parameter (set when entering an exercise) and navigates back
 * to /practice?tab={category} so the user returns to the same category tab.
 */
export function usePracticeExit() {
  const router = useRouter();
  const [searchParams] = useSearchParams();

  const handleExit = () => {
    const fromCategory = searchParams.get("from");
    if (fromCategory) {
      router.push(`/practice?tab=${fromCategory}`);
    } else {
      router.push("/practice");
    }
  };

  return handleExit;
}
