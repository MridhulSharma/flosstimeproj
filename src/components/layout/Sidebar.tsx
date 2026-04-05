"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  DashboardIcon,
  StaffIcon,
  WorksiteIcon,
  ScheduleIcon,
  AIIcon,
  ReportsIcon,
  SettingsIcon,
  SignOutIcon,
  ToothIcon,
} from "@/components/ui/Icon";

const navItems = [
  { label: "Dashboard", icon: DashboardIcon, href: "/dashboard" },
  { label: "Staff", icon: StaffIcon, href: "/dashboard/staff" },
  { label: "Worksites", icon: WorksiteIcon, href: "/dashboard/worksites" },
  { label: "Schedule Builder", icon: ScheduleIcon, href: "/dashboard/schedule" },
  { label: "AI Assistant", icon: AIIcon, href: "/dashboard/ai" },
  { label: "Reports", icon: ReportsIcon, href: "/dashboard/reports" },
  { label: "Settings", icon: SettingsIcon, href: "/dashboard/settings" },
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
          <ToothIcon size={22} color="white" strokeWidth={1.2} />
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
            const Icon = item.icon;
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
                  <Icon size={17} />
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
            className="text-gray-400 hover:text-white transition-colors"
            title="Sign out"
          >
            <SignOutIcon size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
