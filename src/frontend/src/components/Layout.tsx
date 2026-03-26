import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  LayoutDashboard,
  ListChecks,
  LogOut,
  PlusCircle,
  UserCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import type { NavState } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

interface LayoutProps {
  children: ReactNode;
  nav: NavState;
  onNavigate: (state: NavState) => void;
}

export default function Layout({ children, nav, onNavigate }: LayoutProps) {
  const { clear, identity } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();

  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 8)}...${principal.slice(-4)}`
    : "";

  const NAV_ITEMS = [
    { page: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { page: "daftar" as const, label: "Daftar Kwarran", icon: ListChecks },
    { page: "tambah" as const, label: "Tambah Kwarran", icon: PlusCircle },
    ...(isAdmin
      ? [
          {
            page: "approval" as const,
            label: "Persetujuan Akun",
            icon: UserCheck,
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border h-14 flex items-center px-4 gap-4 shadow-xs">
        <div className="flex items-center gap-2 flex-1">
          <img
            src="/assets/tergiat-019d28b4-1904-700e-be4b-70725b6daedf.png"
            alt="Logo"
            className="w-9 h-9 object-contain"
          />
          <span className="font-bold text-sm text-foreground hidden sm:block">
            Penilaian Kwartir Ranting Tergiat
          </span>
          <span className="font-bold text-sm text-foreground sm:hidden">
            Pramuka Tergiat
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-success" />
            {shortPrincipal}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            className="text-muted-foreground hover:text-destructive h-8 gap-1.5 text-xs"
            data-ocid="header.secondary_button"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 bg-card border-r border-border flex flex-col shrink-0">
          <nav className="flex-1 p-3 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                nav.page === item.page ||
                (item.page === "tambah" && nav.page === "edit");
              return (
                <button
                  type="button"
                  key={item.page}
                  data-ocid={`nav.${item.page}.link`}
                  onClick={() => onNavigate({ page: item.page })}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-border">
            <div className="text-xs text-muted-foreground text-center">
              &copy; {new Date().getFullYear()}{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
