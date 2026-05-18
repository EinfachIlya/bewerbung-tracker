"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Briefcase, LayoutGrid, List, BarChart2, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { cn } from "@/utils/helpers";

const navItems = [
  { href: "/board", label: "Kanban", icon: LayoutGrid },
  { href: "/list", label: "Liste", icon: List },
  { href: "/dashboard", label: "Dashboard", icon: BarChart2 },
];

export default function Navbar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/board" className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-600 rounded-lg">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-slate-900 hidden sm:block">Bewerbungen</span>
            </Link>

            <div className="flex items-center gap-1">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    pathname === href
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:block">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {userEmail && (
              <span className="text-xs text-slate-500 hidden md:block">{userEmail}</span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Abmelden</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
