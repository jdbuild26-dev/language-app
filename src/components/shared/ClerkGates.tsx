"use client";

import { useAuth } from "@clerk/nextjs";

/**
 * Compatibility wrappers for Clerk v7 which removed SignedIn/SignedOut components.
 * Use these instead of importing from @clerk/nextjs directly.
 */

export function SignedIn({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded || !isSignedIn) return null;
  return <>{children}</>;
}

export function SignedOut({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded || isSignedIn) return null;
  return <>{children}</>;
}
