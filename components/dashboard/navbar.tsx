"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { logout } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

interface NavbarProps {
  user: {
    email: string;
    displayName: string;
    role: string;
    familyId: string;
  };
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ...(user.role === "admin"
      ? [{ href: "/admin", label: "Admin", icon: Settings }]
      : []),
  ];

  return (
    <>
      {/* Desktop nav */}
      <header className="bg-[#1e3a2f] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Brand */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            <span className="text-xl">🔒</span>
            <span className="hidden sm:block">Family Vault</span>
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  pathname.startsWith(link.href)
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm text-white/70">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <span>{user.displayName}</span>
            </div>

            <form action={logout}>
              <button
                type="submit"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </form>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#1e3a2f] px-4 pb-4 pt-2">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{user.displayName}</p>
                <p className="text-xs text-white/60">{user.email}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname.startsWith(link.href)
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}

              <form action={logout}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </form>
            </nav>
          </div>
        )}
      </header>

      {/* Mobile bottom tabs */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 shadow-lg">
        <div className="flex">
          <Link
            href="/dashboard"
            className={cn(
              "flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors",
              pathname === "/dashboard"
                ? "text-[#1e3a2f]"
                : "text-stone-400"
            )}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            Dashboard
          </Link>
          <Link
            href="/entry/new"
            className="flex-1 flex flex-col items-center py-2 text-xs font-medium text-stone-400"
          >
            <div className="w-8 h-8 rounded-full bg-[#1e3a2f] text-white flex items-center justify-center text-lg -mt-3 shadow-md">
              +
            </div>
            Add
          </Link>
          {user.role === "admin" && (
            <Link
              href="/admin"
              className={cn(
                "flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors",
                pathname.startsWith("/admin")
                  ? "text-[#1e3a2f]"
                  : "text-stone-400"
              )}
            >
              <Settings className="w-5 h-5 mb-0.5" />
              Admin
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
