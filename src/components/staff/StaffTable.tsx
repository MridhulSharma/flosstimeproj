"use client";

import { useState } from "react";
import { IStaff } from "@/types";
import { RoleBadge, StatusBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface StaffTableProps {
  staff: IStaff[];
  onEdit: (s: IStaff) => void;
  onDelete: (s: IStaff) => void;
}

const roleAvatarBg: Record<string, string> = {
  Doctor: "bg-role-doctor-bg text-role-doctor",
  Hygienist: "bg-role-hygienist-bg text-role-hygienist",
  Assistant: "bg-role-assistant-bg text-role-assistant",
};

const DAY_LABELS: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getCityFromAddress(addr: string) {
  if (!addr) return "";
  const parts = addr.split(",").map((p) => p.trim());
  return parts.length >= 2 ? parts[parts.length - 2] : parts[0];
}

export default function StaffTable({ staff, onEdit, onDelete }: StaffTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (staff.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
        <p className="text-4xl mb-3">🦷</p>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No staff members yet</h3>
        <p className="text-sm text-gray-500">Add your first team member to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-gray-500">Staff Member</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-gray-500">Role</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-gray-500">Contact</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-gray-500">Available</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-gray-500">Travel</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-gray-500">Status</th>
            <th className="text-right px-4 py-3 text-xs font-semibold uppercase text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((s) => (
            <StaffRow
              key={s._id}
              staff={s}
              expanded={expandedId === s._id}
              onToggle={() => setExpandedId(expandedId === s._id ? null : s._id)}
              onEdit={() => onEdit(s)}
              onDelete={() => onDelete(s)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StaffRow({
  staff,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  staff: IStaff;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <>
      <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
        {/* Staff Member */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${roleAvatarBg[staff.jobType]}`}>
              {getInitials(staff.name)}
            </div>
            <div>
              <p className="font-medium text-gray-900">{staff.name}</p>
              <p className="text-xs text-gray-400">{getCityFromAddress(staff.homeAddress)}</p>
            </div>
          </div>
        </td>
        {/* Role */}
        <td className="px-4 py-3">
          <RoleBadge role={staff.jobType} />
        </td>
        {/* Contact */}
        <td className="px-4 py-3">
          <p className="text-gray-700">{staff.email}</p>
          <p className="text-xs text-gray-400">{staff.phone}</p>
        </td>
        {/* Available Days */}
        <td className="px-4 py-3">
          <div className="flex gap-1 flex-wrap">
            {staff.availableDays.map((d) => (
              <span key={d} className="px-1.5 py-0.5 rounded bg-brand-teal-bg text-brand-teal text-[10px] font-semibold">
                {DAY_LABELS[d] || d}
              </span>
            ))}
          </div>
        </td>
        {/* Travel */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-teal rounded-full"
                style={{ width: `${Math.min((staff.travelRadius / 100) * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-600">{staff.travelRadius} mi</span>
          </div>
        </td>
        {/* Status */}
        <td className="px-4 py-3">
          <StatusBadge status={staff.status} />
        </td>
        {/* Actions */}
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={onToggle} title="Expand">
              {expanded ? "▲" : "▼"}
            </Button>
            <Button variant="ghost" size="sm" onClick={onEdit} title="Edit">
              ✏️
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} title="Remove">
              🗑️
            </Button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50/80">
          <td colSpan={7} className="px-6 py-4">
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400 mb-1">Full Address</p>
                <p className="text-gray-700">{staff.homeAddress || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400 mb-1">All Available Days</p>
                <p className="text-gray-700">{staff.availableDays.join(", ") || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400 mb-1">Notes</p>
                <p className="text-gray-700">{staff.notes || "—"}</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
