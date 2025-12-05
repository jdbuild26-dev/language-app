import { Outlet } from "react-router-dom";
import LangLearnNavbar from "./LangLearnNavbar";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <LangLearnNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
