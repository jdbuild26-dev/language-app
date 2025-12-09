import { Outlet } from "react-router-dom";
import LangLearnNavbar from "./LangLearnNavbar";
import SecondaryNavbar from "./navbar/SecondaryNavbar";
import FooterSection from "./footer";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-body-dark">
      <LangLearnNavbar />
      <SecondaryNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <FooterSection />
    </div>
  );
}
