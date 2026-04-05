"use client";

import { SearchIcon } from "@/components/ui/Icon";

interface StaffFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  jobTypeFilter: string;
  onJobTypeChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
  sortBy: string;
  onSortChange: (val: string) => void;
}

const jobTypes: Array<{ label: string; value: string }> = [
  { label: "All", value: "" },
  { label: "Doctor", value: "Doctor" },
  { label: "Hygienist", value: "Hygienist" },
  { label: "Assistant", value: "Assistant" },
];

const statuses: Array<{ label: string; value: string }> = [
  { label: "All", value: "" },
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

export default function StaffFilters({
  search,
  onSearchChange,
  jobTypeFilter,
  onJobTypeChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
}: StaffFiltersProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search staff by name, email, or address..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal"
          />
        </div>

        {/* Role filter */}
        <div className="flex items-center gap-1">
          {jobTypes.map((jt) => (
            <button
              key={jt.value}
              onClick={() => onJobTypeChange(jt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                jobTypeFilter === jt.value
                  ? "bg-brand-teal text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {jt.label}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => onStatusChange(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s.value
                  ? "bg-brand-navy text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
        >
          <option value="name">Name A→Z</option>
          <option value="jobType">By Role</option>
          <option value="travelRadius">By Radius</option>
        </select>
      </div>
    </div>
  );
}
