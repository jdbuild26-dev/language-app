import { Outlet } from "react-router-dom";
import Header from "./Header";
import SecondaryNav from "./SecondaryNav";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-body-dark">
      <Header />
      <SecondaryNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
