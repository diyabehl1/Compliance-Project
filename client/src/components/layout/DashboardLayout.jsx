import { Outlet } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./Sidebar.jsx";
import TopBar from "./TopBar.jsx";

export default function DashboardLayout() {
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <AnimatePresence>
        {mobileNav && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setMobileNav(false)}
          />
        )}
      </AnimatePresence>
      <motion.aside
        initial={false}
        animate={{ x: mobileNav ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className="fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-200 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-blue-500/10 dark:bg-ink-950/98 md:hidden"
        style={{ pointerEvents: mobileNav ? "auto" : "none" }}
      >
        <div className="h-full overflow-y-auto pt-4">
          <Sidebar variant="mobile" onNavigate={() => setMobileNav(false)} />
        </div>
      </motion.aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenu={() => setMobileNav(true)} />
        <main className="relative flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
