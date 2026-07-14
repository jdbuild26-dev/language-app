"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import SecondaryNav from "@/components/layout/SecondaryNav";
import FooterWrapper from "@/components/layout/FooterWrapper";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isFullScreenLesson = /^\/grammar\/lessons\/[^/]+/.test(pathname);
  const isFullScreenGrammarPractice = /^\/grammar\/practice\/[^/]+/.test(pathname);

  if (isFullScreenLesson || isFullScreenGrammarPractice) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <SecondaryNav />
      {children}
      <FooterWrapper />
    </>
  );
}
