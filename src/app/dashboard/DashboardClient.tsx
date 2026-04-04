"use client";

import Link from "next/link";
import StatCard from "@/components/ui/StatCard";
import { DashboardStats } from "@/types";

interface DashboardClientProps {
  stats: DashboardStats;
  availability: Array<{ day: string; count: number }>;
}

export default function DashboardClient({ stats, availability }: DashboardClientProps) {
  if (stats.total === 0) {
    return <EmptyState />;
  }

  const roleData = [
    { label: "Doctors", count: stats.doctors, color: "bg-role-doctor", bgColor: "bg-role-doctor-bg" },
    { label: "Hygienists", count: stats.hygienists, color: "bg-role-hygienist", bgColor: "bg-role-hygienist-bg" },
    { label: "Assistants", count: stats.assistants, color: "bg-role-assistant", bgColor: "bg-role-assistant-bg" },
  ];

  const maxAvail = Math.max(...availability.map((a) => a.count), 1);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">FlossTime staff overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total Staff" value={stats.total} icon="👥" />
        <StatCard label="Active" value={stats.active} icon="✅" color="text-green-600" bgColor="bg-green-50" />
        <StatCard label="Doctors" value={stats.doctors} icon="🩺" color="text-role-doctor" bgColor="bg-role-doctor-bg" />
        <StatCard label="Hygienists" value={stats.hygienists} icon="🦷" color="text-role-hygienist" bgColor="bg-role-hygienist-bg" />
        <StatCard label="Assistants" value={stats.assistants} icon="🤝" color="text-role-assistant" bgColor="bg-role-assistant-bg" />
        <StatCard label="Avg Radius" value={`${stats.avgRadius} mi`} icon="📍" color="text-brand-teal" bgColor="bg-brand-teal-bg" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Team Composition */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Team Composition</h2>
          <div className="space-y-4">
            {roleData.map((role) => {
              const pct = stats.total > 0 ? Math.round((role.count / stats.total) * 100) : 0;
              return (
                <div key={role.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">{role.label}</span>
                    <span className="text-gray-500">{role.count} ({pct}%)</span>
                  </div>
                  <div className={`h-3 rounded-full ${role.bgColor} overflow-hidden`}>
                    <div
                      className={`h-full rounded-full ${role.color} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Availability */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Weekly Availability</h2>
          <div className="flex items-end gap-3 h-40">
            {availability.map((a) => (
              <div key={a.day} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-xs font-bold text-brand-teal mb-1">{a.count}</span>
                <div className="w-full bg-brand-teal-bg rounded-t-md overflow-hidden flex-1 flex flex-col justify-end">
                  <div
                    className="bg-brand-teal rounded-t-md transition-all"
                    style={{ height: `${maxAvail > 0 ? (a.count / maxAvail) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-500 mt-2 font-medium">{a.day.slice(0, 3)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction href="/dashboard/staff" icon="👤" label="Add Staff Member" />
          <QuickAction href="/dashboard/worksites" icon="📍" label="Add Worksite" />
          <QuickAction href="/dashboard/schedule" icon="📅" label="Build Schedule" />
          <QuickAction href="/dashboard/ai" icon="🤖" label="AI Assistant" />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-brand-teal/30 hover:shadow-md transition-all group"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-medium text-gray-700 group-hover:text-brand-teal transition-colors">
        {label}
      </span>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <span className="text-6xl mb-4">🦷</span>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to FlossTime!</h1>
      <p className="text-gray-500 mb-6 max-w-md">
        Your staff scheduling portal is ready. Start by adding your first team member.
      </p>
      <Link
        href="/dashboard/staff"
        className="px-6 py-3 bg-brand-teal hover:bg-brand-teal-dark text-white font-semibold rounded-xl transition-colors"
      >
        + Add First Staff Member
      </Link>
    </div>
  );
}
