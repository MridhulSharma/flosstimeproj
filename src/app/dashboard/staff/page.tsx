"use client";

import { useState, useEffect, useCallback } from "react";
import { IStaff, StaffFormData } from "@/types";
import StaffTable from "@/components/staff/StaffTable";
import StaffModal from "@/components/staff/StaffModal";
import StaffFilters from "@/components/staff/StaffFilters";
import Button from "@/components/ui/Button";
import { AddIcon, AlertIcon, ToothIcon, SearchIcon } from "@/components/ui/Icon";

export default function StaffPage() {
  const [staff, setStaff] = useState<IStaff[]>([]);
  const [total, setTotal] = useState(0);
  const [unfilteredTotal, setUnfilteredTotal] = useState(0);
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

      // Also fetch unfiltered total for empty state detection
      if (search || jobTypeFilter || statusFilter) {
        const totalRes = await fetch("/api/staff?");
        if (totalRes.ok) {
          const totalData = await totalRes.json();
          setUnfilteredTotal(totalData.total);
        }
      } else {
        setUnfilteredTotal(data.total);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load staff. Check your connection.");
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
      if (res.status === 409) {
        throw new Error("A staff member with this email already exists.");
      }
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
      setError("Failed to delete staff member. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setJobTypeFilter("");
    setStatusFilter("");
    setSortBy("name");
  };

  const hasFilters = !!(search || jobTypeFilter || statusFilter);
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
          <AddIcon size={16} /> Add Staff Member
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

      {/* Error state */}
      {error && !loading && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center mb-4">
          <AlertIcon size={44} color="#EF4444" strokeWidth={1} className="mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Could not load staff data</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchStaff}>Try Again</Button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && <LoadingSkeleton />}

      {/* Content */}
      {!loading && !error && staff.length > 0 && (
        <StaffTable
          staff={staff}
          onEdit={(s) => {
            setEditingStaff(s);
            setModalOpen(true);
          }}
          onDelete={setDeleteTarget}
        />
      )}

      {/* Empty state: no data at all */}
      {!loading && !error && staff.length === 0 && !hasFilters && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <ToothIcon size={44} color="#00B4A6" strokeWidth={1} className="mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No team members yet</h3>
          <p className="text-sm text-gray-500 mb-4">Add your first staff member to get started.</p>
          <Button
            onClick={() => {
              setEditingStaff(null);
              setModalOpen(true);
            }}
          >
            <AddIcon size={16} /> Add Staff Member
          </Button>
        </div>
      )}

      {/* Empty state: filters active but no results */}
      {!loading && !error && staff.length === 0 && hasFilters && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <SearchIcon size={44} color="#8B9AB0" strokeWidth={1} className="mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No results found</h3>
          <p className="text-sm text-gray-500 mb-4">Try adjusting your search or filters.</p>
          <Button variant="secondary" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Footer count */}
      {!loading && staff.length > 0 && (
        <p className="text-xs text-gray-400 text-center mt-4">
          Showing {staff.length} of {unfilteredTotal} staff members
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

function LoadingSkeleton() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-3 flex gap-4">
          {[80, 50, 100, 70, 50, 50, 60].map((w, i) => (
            <div
              key={i}
              style={{
                width: w,
                height: 12,
                borderRadius: 6,
                background: "linear-gradient(90deg, #E4ECF2 25%, #F5F8FA 50%, #E4ECF2 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
              }}
            />
          ))}
        </div>
        {[...Array(5)].map((_, row) => (
          <div key={row} className="px-4 py-4 border-b border-gray-50 flex items-center gap-4">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(90deg, #E4ECF2 25%, #F5F8FA 50%, #E4ECF2 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
              }}
            />
            {[120, 60, 140, 80, 60, 50, 70].map((w, i) => (
              <div
                key={i}
                style={{
                  width: w,
                  height: 14,
                  borderRadius: 6,
                  background: "linear-gradient(90deg, #E4ECF2 25%, #F5F8FA 50%, #E4ECF2 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                  animationDelay: `${row * 0.1}s`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
