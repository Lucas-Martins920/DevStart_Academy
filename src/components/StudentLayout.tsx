import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Target, Trophy, Award, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import SuggestionButton from "./SuggestionButton";

const navItems = [
  { label: "Aprender", icon: BookOpen, path: "/" },
  { label: "Missões", icon: Target, path: "/missions" },
  { label: "Ranking", icon: Trophy, path: "/ranking" },
  { label: "Conquistas", icon: Award, path: "/achievements" },
  { label: "Perfil", icon: User, path: "/profile" },
];

const StudentLayout = ({ children }: { children: React.ReactNode }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-surface-0 flex">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface-1 border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐱</span>
          <span className="font-syne font-extrabold text-base text-text-high">DEVSTART</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-text-mid">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-surface-1 border-r border-border p-6 flex flex-col shrink-0 transition-transform duration-300
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        lg:translate-x-0
      `}>
        <div className="flex items-center gap-3 mb-8 mt-0 lg:mt-0">
          <span className="text-2xl">🐱</span>
          <span className="font-syne font-extrabold text-lg text-text-high tracking-tight">DEVSTART</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-spark/15 text-spark"
                    : "text-text-mid hover:bg-surface-2 hover:text-text-high"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-text-mid text-sm font-medium hover:text-text-high transition-colors w-full"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto mt-14 lg:mt-0">
        {children}
      </main>

      <SuggestionButton />
    </div>
  );
};

export default StudentLayout;
