"use client";

import { useState, useEffect } from "react";
import { IStaff, StaffFormData, JobType, AvailableDay, StaffStatus } from "@/types";
import Button from "@/components/ui/Button";

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: StaffFormData) => Promise<void>;
  staff?: IStaff | null;
}

const DAYS: AvailableDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_LABELS: Record<AvailableDay, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

const emptyForm: StaffFormData = {
  name: "",
  email: "",
  phone: "",
  jobType: "Hygienist",
  availableDays: [],
  homeAddress: "",
  travelRadius: 25,
  status: "Active",
  notes: "",
};

export default function StaffModal({ isOpen, onClose, onSave, staff }: StaffModalProps) {
  const [form, setForm] = useState<StaffFormData>(emptyForm);
  const [loading, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (staff) {
      setForm({
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        jobType: staff.jobType,
        availableDays: staff.availableDays,
        homeAddress: staff.homeAddress,
        travelRadius: staff.travelRadius,
        status: staff.status,
        notes: staff.notes,
      });
    } else {
      setForm(emptyForm);
    }
    setError("");
  }, [staff, isOpen]);

  const toggleDay = (day: AvailableDay) => {
    setForm((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save staff member.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {staff ? "Edit Staff Member" : "Add Staff Member"}
          </h2>
        </div>

        <div className="px-6 py-5 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Personal Information */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-brand-teal mb-3 pb-1 border-b border-brand-teal/20">
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Job Type *</label>
                <select
                  value={form.jobType}
                  onChange={(e) => setForm({ ...form, jobType: e.target.value as JobType })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Hygienist">Hygienist</option>
                  <option value="Assistant">Assistant</option>
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal"
                />
              </div>
            </div>
          </div>

          {/* Location & Travel */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-brand-teal mb-3 pb-1 border-b border-brand-teal/20">
              Location & Travel
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Home Address</label>
                <input
                  type="text"
                  value={form.homeAddress}
                  onChange={(e) => setForm({ ...form, homeAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Travel Radius
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-brand-teal text-white text-[10px] font-bold">
                    {form.travelRadius} mi
                  </span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={form.travelRadius}
                  onChange={(e) => setForm({ ...form, travelRadius: Number(e.target.value) })}
                  className="w-full accent-brand-teal"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>5 mi</span>
                  <span>100 mi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-brand-teal mb-3 pb-1 border-b border-brand-teal/20">
              Availability
            </h3>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    form.availableDays.includes(day)
                      ? "bg-brand-teal text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {DAY_LABELS[day]}
                </button>
              ))}
            </div>
          </div>

          {/* Status & Notes */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-brand-teal mb-3 pb-1 border-b border-brand-teal/20">
              Status & Notes
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as StaffStatus })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : staff ? "Update" : "Add Staff"}
          </Button>
        </div>
      </div>
    </div>
  );
}
