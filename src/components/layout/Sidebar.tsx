"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { label: "Dashboard", icon: "⊞", href: "/dashboard" },
  { label: "Staff", icon: "👥", href: "/dashboard/staff", showBadge: true },
  { label: "Worksites", icon: "📍", href: "/dashboard/worksites" },
  { label: "Schedule Builder", icon: "📅", href: "/dashboard/schedule" },
  { label: "AI Assistant", icon: "🤖", href: "/dashboard/ai" },
  { label: "Reports", icon: "📊", href: "/dashboard/reports" },
  { label: "Settings", icon: "⚙️", href: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-brand-navy flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-teal flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C8 2 6 5 6 8c0 2 1 3 1 5s-1 4 0 6c1 1 3 1 5 1s4 0 5-1c1-2 0-4 0-6s1-3 1-5c0-3-2-6-6-6z" />
            <line x1="12" y1="2" x2="12" y2="22" />
          </svg>
        </div>
        <div>
          <span className="text-lg font-extrabold">
            <span className="text-white">Floss</span>
            <span className="text-brand-teal">Time</span>
          </span>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Staff Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2">
        <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.15em] text-gray-500 font-semibold">
          Navigation
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "text-brand-teal bg-brand-teal/10 border-l-[3px] border-brand-teal"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-teal flex items-center justify-center text-white text-sm font-bold">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Administrator</p>
            <p className="text-[11px] text-gray-400">Full Access</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-gray-400 hover:text-white transition-colors text-lg"
            title="Sign out"
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  );
}
