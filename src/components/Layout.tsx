import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { UserProfile } from "../types";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { Shield, LayoutDashboard, PlusCircle, LogOut, FileText, Settings, User } from "lucide-react";
import { motion } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  user: UserProfile | null;
}

export default function Layout({ user }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/auth");
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "New Claim", path: "/claims/new", icon: PlusCircle },
    { label: "Settings", path: "/settings", icon: Settings },
    ...(user?.role === "admin" ? [{ label: "Admin Panel", path: "/admin", icon: Shield }] : []),
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-slate-950 p-6 flex flex-col">
        <Link to="/dashboard" className="flex items-center gap-3 mb-10 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 group-hover:scale-110 transition-transform">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white italic">SHIELD<span className="text-blue-500 text-sm not-italic ml-1">AI</span></span>
        </Link>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/5 pt-6 space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-blue-400 border border-white/5">
              {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium text-white truncate">{user?.displayName || "User"}</span>
              <span className="text-xs text-slate-500 truncate">{user?.email}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-950/50 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -mr-64 -mt-64 z-0 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/5 blur-[120px] rounded-full -ml-32 -mb-32 z-0 pointer-events-none"></div>
        
        <div className="relative z-10 p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
