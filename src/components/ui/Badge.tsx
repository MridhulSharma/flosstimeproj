"use client";

import { JobType, StaffStatus } from "@/types";

const roleStyles: Record<JobType, string> = {
  Doctor: "bg-role-doctor-bg text-role-doctor",
  Hygienist: "bg-role-hygienist-bg text-role-hygienist",
  Assistant: "bg-role-assistant-bg text-role-assistant",
};

const statusStyles: Record<StaffStatus, string> = {
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-gray-100 text-gray-500",
};

export function RoleBadge({ role }: { role: JobType }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleStyles[role]}`}>
      {role}
    </span>
  );
}

export function StatusBadge({ status }: { status: StaffStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[status]}`}>
      {status}
    </span>
  );
}
