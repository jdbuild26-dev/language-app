import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/app/providers";
import Header from "@/components/layout/Header";
import SecondaryNav from "@/components/layout/SecondaryNav";
import FooterWrapper from "@/components/layout/FooterWrapper";
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
            <Header />
            <SecondaryNav />
            {children}
            <FooterWrapper />
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
