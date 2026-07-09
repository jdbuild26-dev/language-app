import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/app/providers";
import AppChrome from "@/components/layout/AppChrome";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LangLearn- Master any Language",
  description: "Master New Languages With Confidence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider>
          <Providers>
            <AppChrome>{children}</AppChrome>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
