"use client";

import Link from "next/link";
import StatCard from "@/components/ui/StatCard";
import { DashboardStats } from "@/types";
import {
  StaffIcon,
  CheckIcon,
  DoctorIcon,
  HygienistIcon,
  AssistantIcon,
  RadiusIcon,
  AddIcon,
  WorksiteIcon,
  ScheduleIcon,
  AIIcon,
  ToothIcon,
  BuildingIcon,
} from "@/components/ui/Icon";
import { ReactNode } from "react";
import AskAIButton from "@/components/ai/AskAIButton";
import { useAIAssistant } from "@/components/ai/AIAssistantContext";

interface DashboardClientProps {
  stats: DashboardStats;
  availability: Array<{ day: string; count: number }>;
}

export default function DashboardClient({ stats, availability }: DashboardClientProps) {
  const { openAssistant } = useAIAssistant();
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
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <AskAIButton context="dashboard" label="Ask AI" />
        </div>
        <p className="text-sm text-gray-500 mt-1">FlossTime staff overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Staff" value={stats.total} icon={<StaffIcon size={20} />} />
        <StatCard label="Active Staff" value={stats.active} icon={<CheckIcon size={20} />} color="text-green-600" bgColor="bg-green-50" />
        <StatCard label="Total Worksites" value={stats.totalWorksites} icon={<BuildingIcon size={20} />} color="text-brand-teal" bgColor="bg-brand-teal-bg" />
        <StatCard label="This Month" value={stats.scheduledThisMonth} icon={<ScheduleIcon size={20} />} color="text-blue-600" bgColor="bg-blue-50" />
      </div>

      {/* Role breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Doctors" value={stats.doctors} icon={<DoctorIcon size={20} />} color="text-role-doctor" bgColor="bg-role-doctor-bg" />
        <StatCard label="Hygienists" value={stats.hygienists} icon={<HygienistIcon size={20} />} color="text-role-hygienist" bgColor="bg-role-hygienist-bg" />
        <StatCard label="Assistants" value={stats.assistants} icon={<AssistantIcon size={20} />} color="text-role-assistant" bgColor="bg-role-assistant-bg" />
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
          <QuickAction href="/dashboard/staff" icon={<AddIcon size={16} />} label="Add Staff Member" />
          <QuickAction href="/dashboard/worksites" icon={<WorksiteIcon size={16} />} label="Add Worksite" />
          <QuickAction href="/dashboard/schedule" icon={<ScheduleIcon size={16} />} label="Build Schedule" />
          <QuickAction onClick={() => openAssistant()} icon={<AIIcon size={16} />} label="AI Assistant" />
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  onClick,
  icon,
  label,
}: {
  href?: string;
  onClick?: () => void;
  icon: ReactNode;
  label: string;
}) {
  const className =
    "flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-brand-teal/30 hover:shadow-md transition-all group text-left w-full";
  const inner = (
    <>
      <span className="text-gray-500 group-hover:text-brand-teal transition-colors">{icon}</span>
      <span className="text-sm font-medium text-gray-700 group-hover:text-brand-teal transition-colors">
        {label}
      </span>
    </>
  );
  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <ToothIcon size={48} color="#00B4A6" strokeWidth={1} className="mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to FlossTime!</h1>
      <p className="text-gray-500 mb-6 max-w-md">
        Your staff scheduling portal is ready. Start by adding your first team member.
      </p>
      <Link
        href="/dashboard/staff"
        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-teal hover:bg-brand-teal-dark text-white font-semibold rounded-xl transition-colors"
      >
        <AddIcon size={16} /> Add First Staff Member
      </Link>
    </div>
  );
}
