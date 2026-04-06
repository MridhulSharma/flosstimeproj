"use client";

import { useState, useEffect, useCallback } from "react";
import { IAssignment, IWorksite, IStaff, IAssignmentMember, AvailableDay } from "@/types";
import Button from "@/components/ui/Button";
import {
  ScheduleIcon, LeftArrowIcon, RightArrowIcon, MinusIcon, AddIcon,
  BuildingIcon, SearchIcon, CheckCircleIcon, AlertIcon, DeleteIcon, CloseIcon,
} from "@/components/ui/Icon";

const DAY_NAMES: AvailableDay[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const STATUS_COLORS: Record<string, string> = {
  Scheduled: "bg-blue-100 text-blue-700",
  Confirmed: "bg-green-100 text-green-700",
  Completed: "bg-gray-100 text-gray-500",
  Cancelled: "bg-red-100 text-red-600",
};

const ROLE_AVATAR: Record<string, string> = {
  Doctor: "bg-role-doctor-bg text-role-doctor",
  Hygienist: "bg-role-hygienist-bg text-role-hygienist",
  Assistant: "bg-role-assistant-bg text-role-assistant",
  Coordinator: "bg-amber-100 text-amber-700",
};

export default function SchedulePage() {
  // Assignments
  const [assignments, setAssignments] = useState<IAssignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");

  // Form state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedWorksite, setSelectedWorksite] = useState<IWorksite | null>(null);
  const [teamSize, setTeamSize] = useState(3);
  const [teamMembers, setTeamMembers] = useState<IAssignmentMember[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Data sources
  const [worksites, setWorksites] = useState<IWorksite[]>([]);
  const [allStaff, setAllStaff] = useState<IStaff[]>([]);

  // Calendar
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  // Worksite dropdown
  const [wsDropOpen, setWsDropOpen] = useState(false);
  const [wsSearch, setWsSearch] = useState("");

  // Fetch assignments
  const fetchAssignments = useCallback(async () => {
    setLoadingAssignments(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (clientFilter) params.set("worksiteId", clientFilter);
      const res = await fetch(`/api/assignments?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments);
      }
    } catch { /* ignore */ } finally {
      setLoadingAssignments(false);
    }
  }, [statusFilter, clientFilter]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  // Fetch worksites + staff on mount
  useEffect(() => {
    fetch("/api/worksites?status=Active").then((r) => r.json()).then((d) => setWorksites(d.worksites || [])).catch(() => {});
    fetch("/api/staff?status=Active").then((r) => r.json()).then((d) => setAllStaff(d.staff || [])).catch(() => {});
  }, []);

  // Available staff for selected day
  const availableStaff = selectedDate
    ? allStaff.filter((s) => {
        const dayName = DAY_NAMES[selectedDate.getDay()];
        return s.availableDays.includes(dayName as AvailableDay);
      })
    : [];

  const addMember = (staff: IStaff) => {
    if (teamMembers.find((m) => m.staffId === staff._id)) return;
    setTeamMembers((prev) => [...prev, {
      staffId: staff._id,
      name: staff.name,
      jobType: staff.jobType,
      role: staff.jobType,
    }]);
  };

  const removeMember = (staffId: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.staffId !== staffId));
  };

  const updateMemberRole = (staffId: string, role: string) => {
    setTeamMembers((prev) => prev.map((m) => m.staffId === staffId ? { ...m, role } : m));
  };

  const handleSave = async () => {
    if (!selectedDate || !selectedWorksite) return;
    setSaving(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worksiteId: selectedWorksite._id,
          date: selectedDate.toISOString(),
          teamSize,
          teamMembers,
          notes,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      setSuccessMsg(`Assignment booked — ${data.clientName}, ${new Date(data.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`);
      setTimeout(() => setSuccessMsg(""), 3000);
      // Reset form
      setSelectedDate(null);
      setSelectedWorksite(null);
      setTeamSize(3);
      setTeamMembers([]);
      setNotes("");
      fetchAssignments();
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  };

  const clearForm = () => {
    setSelectedDate(null);
    setSelectedWorksite(null);
    setTeamSize(3);
    setTeamMembers([]);
    setNotes("");
  };

  // Calendar helpers
  const calDays = getCalendarDays(calYear, calMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const assignmentDates = new Set(
    assignments.map((a) => new Date(a.date).toDateString())
  );

  const filteredWs = worksites.filter((w) =>
    w.clientName.toLowerCase().includes(wsSearch.toLowerCase()) ||
    w.city.toLowerCase().includes(wsSearch.toLowerCase())
  );

  // Suggested composition
  const getSuggested = (size: number) => {
    if (size === 1) return ["Hygienist"];
    if (size === 2) return ["Doctor", "Hygienist"];
    if (size === 3) return ["Doctor", "Hygienist", "Assistant"];
    const hyg = Math.ceil(size / 2);
    const asst = size - 1 - hyg;
    return ["Doctor", ...Array(hyg).fill("Hygienist"), ...Array(Math.max(0, asst)).fill("Assistant")];
  };

  return (
    <div className="flex gap-6 min-h-[calc(100vh-8rem)]">
      {/* Left Panel — Assignments */}
      <div className="flex-[3] min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Schedule Builder</h1>
            <p className="text-sm text-gray-500 mt-1">{assignments.length} assignments</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {["", "Scheduled", "Confirmed", "Completed", "Cancelled"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? "bg-brand-navy text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {s || "All"}
            </button>
          ))}
        </div>

        {/* Success banner */}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
            <CheckCircleIcon size={16} /> {successMsg}
          </div>
        )}

        {/* Assignment list */}
        {loadingAssignments ? (
          <AssignmentSkeleton />
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
            <ScheduleIcon size={52} color="#00B4A6" strokeWidth={1} className="mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No assignments yet</h3>
            <p className="text-sm text-gray-500">Use the form to add your first deployment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((a) => (
              <AssignmentCard key={a._id} assignment={a} onRefresh={fetchAssignments} />
            ))}
          </div>
        )}
      </div>

      {/* Right Panel — New Assignment Form */}
      <div className="flex-[2] min-w-[340px] max-w-[440px]">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-8">
          <h2 className="text-lg font-bold text-gray-900 mb-1">New Assignment</h2>
          <p className="text-xs text-gray-400 mb-5">Book a team deployment</p>

          {/* 1. Calendar */}
          <div className="mb-5">
            <label className="block text-xs font-bold uppercase text-gray-600 mb-2">Deployment Date</label>
            <MiniCalendar
              month={calMonth} year={calYear}
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
              onMonthChange={(m, y) => { setCalMonth(m); setCalYear(y); }}
              busyDates={assignmentDates}
              today={today}
            />
            {selectedDate && (
              <p className="text-xs text-brand-teal mt-2 font-medium">
                Selected: {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>

          {/* 2. Client */}
          <div className="mb-5 relative">
            <label className="block text-xs font-bold uppercase text-gray-600 mb-2">Client / Worksite</label>
            {selectedWorksite ? (
              <div className="flex items-center gap-2 p-2 bg-brand-teal-bg rounded-lg">
                <BuildingIcon size={16} className="text-brand-teal" />
                <span className="text-sm font-medium text-gray-900 flex-1">{selectedWorksite.clientName}</span>
                <button onClick={() => setSelectedWorksite(null)} className="text-gray-400 hover:text-gray-600"><CloseIcon size={14} /></button>
              </div>
            ) : (
              <div>
                <button onClick={() => setWsDropOpen(!wsDropOpen)} className="w-full text-left px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 hover:border-brand-teal/30">
                  Select a client...
                </button>
                {wsDropOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b border-gray-100">
                      <div className="relative">
                        <SearchIcon size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search clients..." value={wsSearch} onChange={(e) => setWsSearch(e.target.value)} className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-teal/30" autoFocus />
                      </div>
                    </div>
                    {filteredWs.length === 0 ? (
                      <p className="p-3 text-xs text-gray-400">No worksites found. Add one in Worksite Management.</p>
                    ) : (
                      filteredWs.map((w) => (
                        <button key={w._id} onClick={() => { setSelectedWorksite(w); setWsDropOpen(false); setWsSearch(""); }} className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors">
                          <p className="text-sm font-medium text-gray-900">{w.clientName}</p>
                          <p className="text-xs text-gray-400">{w.city}, {w.state}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Team Size */}
          <div className="mb-5">
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Team Size</label>
            <p className="text-[10px] text-gray-400 mb-2">Total number of staff for this deployment</p>
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => setTeamSize(Math.max(1, teamSize - 1))} disabled={teamSize <= 1} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-brand-teal disabled:text-gray-300 disabled:border-gray-100 hover:border-brand-teal/30 transition-colors">
                <MinusIcon size={16} />
              </button>
              <span className="text-2xl font-bold text-brand-navy w-10 text-center">{teamSize}</span>
              <button onClick={() => setTeamSize(Math.min(20, teamSize + 1))} disabled={teamSize >= 20} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-brand-teal disabled:text-gray-300 disabled:border-gray-100 hover:border-brand-teal/30 transition-colors">
                <AddIcon size={16} />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mb-1">Suggested team composition:</p>
            <div className="flex flex-wrap gap-1">
              {getSuggested(teamSize).map((role, i) => (
                <span key={i} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${ROLE_AVATAR[role] || "bg-gray-100 text-gray-600"}`}>{role}</span>
              ))}
            </div>
          </div>

          {/* 4. Team Selection */}
          <div className="mb-5">
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Select Team Members</label>
            <p className="text-[10px] text-gray-400 mb-2">{teamMembers.length} of {teamSize} slots filled</p>

            {/* Progress bar */}
            <div className="h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${teamMembers.length >= teamSize ? "bg-green-500" : "bg-brand-teal"}`} style={{ width: `${Math.min((teamMembers.length / teamSize) * 100, 100)}%` }} />
            </div>

            {!selectedDate || !selectedWorksite ? (
              <p className="text-xs text-gray-400 italic">Select a client and date first to see available staff.</p>
            ) : (
              <>
                {/* Selected team */}
                {teamMembers.length > 0 && (
                  <div className="mb-3 space-y-1">
                    {teamMembers.map((m) => (
                      <div key={m.staffId} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${ROLE_AVATAR[m.jobType] || "bg-gray-100"}`}>
                          {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="text-xs font-medium text-gray-900 flex-1">{m.name}</span>
                        <select value={m.role} onChange={(e) => updateMemberRole(m.staffId, e.target.value)} className="text-[10px] border border-gray-200 rounded px-1 py-0.5">
                          <option value="Doctor">Doctor</option>
                          <option value="Hygienist">Hygienist</option>
                          <option value="Assistant">Assistant</option>
                          <option value="Coordinator">Coordinator</option>
                        </select>
                        <button onClick={() => removeMember(m.staffId)} className="text-gray-400 hover:text-red-500"><CloseIcon size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Available staff */}
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {availableStaff.filter((s) => !teamMembers.find((m) => m.staffId === s._id)).map((s) => (
                    <div key={s._id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${ROLE_AVATAR[s.jobType] || "bg-gray-100"}`}>
                        {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900">{s.name}</p>
                        <p className="text-[10px] text-gray-400">{s.homeAddress ? s.homeAddress.split(",")[s.homeAddress.split(",").length - 2]?.trim() : ""} &middot; {s.travelRadius} mi</p>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${ROLE_AVATAR[s.jobType]}`}>{s.jobType}</span>
                      <button onClick={() => addMember(s)} className="px-2 py-1 text-[10px] font-medium text-brand-teal border border-brand-teal/30 rounded hover:bg-brand-teal-bg transition-colors">
                        + Add
                      </button>
                    </div>
                  ))}
                  {availableStaff.filter((s) => !teamMembers.find((m) => m.staffId === s._id)).length === 0 && (
                    <p className="text-xs text-gray-400 italic py-2">No available staff for this day.</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* 5. Notes */}
          <div className="mb-5">
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Assignment Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Special instructions, equipment needs, parking details, etc." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30 resize-none" />
          </div>

          {/* 6. Save */}
          <Button className="w-full" onClick={handleSave} disabled={!selectedDate || !selectedWorksite || saving}>
            {saving ? "Saving..." : "Book Assignment"}
          </Button>
          <button onClick={clearForm} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-2">Clear Form</button>
        </div>
      </div>
    </div>
  );
}

// ─── Mini Calendar ─────────────────────────────────────────

function MiniCalendar({
  month, year, selectedDate, onSelect, onMonthChange, busyDates, today,
}: {
  month: number; year: number;
  selectedDate: Date | null;
  onSelect: (d: Date) => void;
  onMonthChange: (m: number, y: number) => void;
  busyDates: Set<string>;
  today: Date;
}) {
  const days = getCalendarDays(year, month);
  const monthName = new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const prevMonth = () => {
    const d = new Date(year, month - 1);
    onMonthChange(d.getMonth(), d.getFullYear());
  };
  const nextMonth = () => {
    const d = new Date(year, month + 1);
    onMonthChange(d.getMonth(), d.getFullYear());
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="p-1 rounded hover:bg-gray-100"><LeftArrowIcon size={16} /></button>
        <span className="text-sm font-semibold text-gray-900">{monthName}</span>
        <button onClick={nextMonth} className="p-1 rounded hover:bg-gray-100"><RightArrowIcon size={16} /></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-[10px] font-semibold text-gray-400 py-1">{d}</div>
        ))}
        {days.map((day, i) => {
          if (!day) return <div key={i} />;
          const date = new Date(year, month, day);
          const isPast = date < today;
          const isToday = date.toDateString() === today.toDateString();
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          const isBusy = busyDates.has(date.toDateString());

          return (
            <button
              key={i}
              onClick={() => !isPast && onSelect(date)}
              disabled={isPast}
              className={`relative w-8 h-8 mx-auto rounded-full text-xs font-medium transition-colors
                ${isPast ? "text-gray-300 cursor-default" : "hover:bg-brand-teal-bg cursor-pointer"}
                ${isToday && !isSelected ? "ring-1 ring-brand-teal text-brand-teal" : ""}
                ${isSelected ? "bg-brand-teal text-white" : ""}
              `}
            >
              {day}
              {isBusy && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-teal" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Assignment Card ───────────────────────────────────────

function AssignmentCard({ assignment: a, onRefresh }: { assignment: IAssignment; onRefresh: () => void }) {
  const date = new Date(a.date);
  const dayName = date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const dayNum = date.getDate();
  const monthName = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();

  const borderColor = a.status === "Confirmed" ? "border-l-green-500" : a.status === "Cancelled" ? "border-l-red-400" : date < new Date() ? "border-l-gray-300" : "border-l-brand-teal";

  const handleCancel = async () => {
    await fetch(`/api/assignments/${a._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Cancelled" }),
    });
    onRefresh();
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-4 border-l-4 ${borderColor}`}>
      <div className="text-center w-14 flex-shrink-0">
        <p className="text-[10px] font-semibold text-gray-400">{dayName}</p>
        <p className="text-2xl font-bold text-brand-navy">{dayNum}</p>
        <p className="text-[10px] font-semibold text-gray-400">{monthName}</p>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900 text-sm">{a.clientName}</h3>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[a.status]}`}>{a.status}</span>
        </div>
        <p className="text-xs text-gray-500 mb-2">Team: {a.teamMembers.length} assigned / {a.teamSize} slots</p>
        <div className="flex items-center gap-1">
          {a.teamMembers.slice(0, 3).map((m, i) => (
            <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${ROLE_AVATAR[m.jobType] || "bg-gray-100"}`} title={m.name}>
              {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
          ))}
          {a.teamMembers.length > 3 && <span className="text-[10px] text-gray-400 ml-1">+{a.teamMembers.length - 3} more</span>}
        </div>
      </div>
      {a.status !== "Cancelled" && a.status !== "Completed" && (
        <button onClick={handleCancel} className="self-start text-gray-400 hover:text-red-500 transition-colors" title="Cancel">
          <DeleteIcon size={14} />
        </button>
      )}
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────

function AssignmentSkeleton() {
  return (
    <>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-4">
            <div style={{ width: 56, height: 56, borderRadius: 8, background: "linear-gradient(90deg, #E4ECF2 25%, #F5F8FA 50%, #E4ECF2 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
            <div className="flex-1 space-y-2">
              {[200, 150, 100].map((w, j) => (
                <div key={j} style={{ width: w, height: 12, borderRadius: 6, background: "linear-gradient(90deg, #E4ECF2 25%, #F5F8FA 50%, #E4ECF2 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Helper ────────────────────────────────────────────────

function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
}
