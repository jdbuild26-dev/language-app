"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// AI Practice currently exposes the CSV-backed Chat experience only.
export default function AIPracticePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/ai-practice/scenarios/chats");
  }, [router]);
  return null;
}
