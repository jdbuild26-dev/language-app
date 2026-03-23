import Header from "@/components/layout/Header";
import SecondaryNav from "@/components/layout/SecondaryNav";
import Footer from "@/components/layout/Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-body-dark text-slate-900 dark:text-slate-100 transition-colors">
      <Header />
      <SecondaryNav />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
