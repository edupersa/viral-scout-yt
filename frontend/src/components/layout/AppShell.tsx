import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, History, LogOut, TrendingUp } from "lucide-react";
import { useCurrentUser, useLogout } from "../../api/hooks/useAuth";

interface AppShellProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/explore", label: "Explorar", icon: TrendingUp },
  { to: "/history", label: "History", icon: History },
];

export function AppShell({ children }: AppShellProps) {
  const { pathname } = useLocation();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-900/50">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-zinc-800">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-zinc-100">
              Viral<span className="text-red-500">Scout</span>
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === to
                  ? "bg-red-600/20 text-red-400 font-medium"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-zinc-800">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-300 truncate">
                {user?.email ?? "…"}
              </p>
              <p className="text-xs text-zinc-600">Free plan</p>
            </div>
            <button
              onClick={logout}
              className="text-zinc-500 hover:text-zinc-300 transition-colors focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none rounded p-1"
              aria-label="Log out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
