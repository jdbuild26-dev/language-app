"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/layout/Footer";

export default function FooterWrapper() {
  const pathname = usePathname();
  const hideOn = ["/sign-in", "/sign-up", "/onboarding"];
  if (hideOn.some((p) => pathname.startsWith(p))) return null;
  const isPracticeExercise =
    pathname.startsWith("/practice/") &&
    !pathname.startsWith("/practice/select-topic");
  if (isPracticeExercise) return null;
  return <Footer />;
}
