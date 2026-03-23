"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Toaster } from "react-hot-toast";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ProfileProvider>
        <LanguageProvider>
          <Toaster position="top-center" reverseOrder={false} />
          {children}
        </LanguageProvider>
      </ProfileProvider>
    </QueryClientProvider>
  );
}
