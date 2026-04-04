"use client";

import { useState, useEffect, useCallback } from "react";
import { IStaff, StaffFormData } from "@/types";
import StaffTable from "@/components/staff/StaffTable";
import StaffModal from "@/components/staff/StaffModal";
import StaffFilters from "@/components/staff/StaffFilters";
import Button from "@/components/ui/Button";

export default function StaffPage() {
  const [staff, setStaff] = useState<IStaff[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<IStaff | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<IStaff | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (jobTypeFilter) params.set("jobType", jobTypeFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (sortBy) params.set("sortBy", sortBy);

      const res = await fetch(`/api/staff?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch staff");
      const data = await res.json();
      setStaff(data.staff);
      setTotal(data.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load staff");
    } finally {
      setLoading(false);
    }
  }, [search, jobTypeFilter, statusFilter, sortBy]);

  useEffect(() => {
    const timer = setTimeout(fetchStaff, 300);
    return () => clearTimeout(timer);
  }, [fetchStaff]);

  const handleSave = async (formData: StaffFormData) => {
    if (editingStaff) {
      const res = await fetch(`/api/staff/${editingStaff._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update staff member");
      }
    } else {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add staff member");
      }
    }
    setEditingStaff(null);
    fetchStaff();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/staff/${deleteTarget._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setDeleteTarget(null);
      fetchStaff();
    } catch {
      setError("Failed to delete staff member");
    } finally {
      setDeleting(false);
    }
  };

  const activeCount = staff.filter((s) => s.status === "Active").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} total members &middot; {activeCount} active
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingStaff(null);
            setModalOpen(true);
          }}
        >
          + Add Staff Member
        </Button>
      </div>

      {/* Filters */}
      <StaffFilters
        search={search}
        onSearchChange={setSearch}
        jobTypeFilter={jobTypeFilter}
        onJobTypeChange={setJobTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading staff...</p>
        </div>
      ) : (
        <StaffTable
          staff={staff}
          onEdit={(s) => {
            setEditingStaff(s);
            setModalOpen(true);
          }}
          onDelete={setDeleteTarget}
        />
      )}

      {/* Footer count */}
      {!loading && staff.length > 0 && (
        <p className="text-xs text-gray-400 text-center mt-4">
          Showing {staff.length} of {total} staff members
        </p>
      )}

      {/* Add/Edit Modal */}
      <StaffModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingStaff(null);
        }}
        onSave={handleSave}
        staff={editingStaff}
      />

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Remove Staff Member</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to remove <strong>{deleteTarget.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Removing..." : "Remove"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
