"use client";

import { useState, useEffect, useCallback } from "react";
import { IWorksite, WorksiteFormData } from "@/types";
import Button from "@/components/ui/Button";
import WorksiteModal from "@/components/worksites/WorksiteModal";
import { StatusBadge } from "@/components/ui/Badge";
import {
  AddIcon, AlertIcon, BuildingIcon, SearchIcon,
  ContactIcon, EmailIcon, PhoneIcon, EditIcon, DeleteIcon,
} from "@/components/ui/Icon";

export default function WorksitesPage() {
  const [worksites, setWorksites] = useState<IWorksite[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("clientName");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IWorksite | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IWorksite | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchWorksites = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (sortBy) params.set("sortBy", sortBy);
      const res = await fetch(`/api/worksites?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch worksites");
      const data = await res.json();
      setWorksites(data.worksites);
      setTotal(data.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load worksites.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortBy]);

  useEffect(() => {
    const timer = setTimeout(fetchWorksites, 300);
    return () => clearTimeout(timer);
  }, [fetchWorksites]);

  const handleSave = async (formData: WorksiteFormData) => {
    if (editing) {
      const res = await fetch(`/api/worksites/${editing._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update worksite");
      }
    } else {
      const res = await fetch("/api/worksites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.status === 409) throw new Error("A worksite with this client name already exists.");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add worksite");
      }
    }
    setEditing(null);
    fetchWorksites();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/worksites/${deleteTarget._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setDeleteTarget(null);
      fetchWorksites();
    } catch {
      setError("Failed to delete worksite.");
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = !!(search || statusFilter);
  const activeCount = worksites.filter((w) => w.status === "Active").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Worksite Management</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total &middot; {activeCount} active</p>
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
          <AddIcon size={16} /> Add Worksite
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by client name, city, or address..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal" />
          </div>
          <div className="flex items-center gap-1">
            {["", "Active", "Inactive"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? "bg-brand-navy text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {s || "All"}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal/30">
            <option value="clientName">Client Name A-Z</option>
            <option value="city">City</option>
            <option value="createdAt">Date Added</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center mb-4">
          <AlertIcon size={44} color="#EF4444" strokeWidth={1} className="mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Could not load worksites</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchWorksites}>Try Again</Button>
        </div>
      )}

      {/* Loading */}
      {loading && <WorksiteSkeleton />}

      {/* Cards grid */}
      {!loading && !error && worksites.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {worksites.map((w) => (
            <WorksiteCard key={w._id} worksite={w} onEdit={() => { setEditing(w); setModalOpen(true); }} onDelete={() => setDeleteTarget(w)} />
          ))}
        </div>
      )}

      {/* Empty: no data */}
      {!loading && !error && worksites.length === 0 && !hasFilters && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <BuildingIcon size={52} color="#00B4A6" strokeWidth={1} className="mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No worksites added yet</h3>
          <p className="text-sm text-gray-500 mb-4">Add your first client location to get started.</p>
          <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
            <AddIcon size={16} /> Add Worksite
          </Button>
        </div>
      )}

      {/* Empty: filter no results */}
      {!loading && !error && worksites.length === 0 && hasFilters && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <SearchIcon size={44} color="#8B9AB0" strokeWidth={1} className="mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No worksites match your search</h3>
          <p className="text-sm text-gray-500 mb-4">Try adjusting your search or filters.</p>
          <Button variant="secondary" onClick={() => { setSearch(""); setStatusFilter(""); }}>Clear Filters</Button>
        </div>
      )}

      {/* Modal */}
      <WorksiteModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} worksite={editing} />

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Remove Worksite</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to remove <strong>{deleteTarget.clientName}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
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

function WorksiteCard({ worksite: w, onEdit, onDelete }: { worksite: IWorksite; onEdit: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const notesLong = w.notes.length > 100;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-teal-bg flex items-center justify-center text-brand-teal">
            <BuildingIcon size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{w.clientName}</h3>
            <p className="text-xs text-gray-500">{w.address}, {w.city}, {w.state} {w.zipCode}</p>
          </div>
        </div>
        <StatusBadge status={w.status} />
      </div>

      {/* Primary Contact */}
      {(w.primaryContact.name || w.primaryContact.email || w.primaryContact.phone) && (
        <div>
          <p className="text-[10px] uppercase font-bold text-gray-400 mb-2 pl-2 border-l-2 border-brand-teal">Primary Contact</p>
          <div className="space-y-1 text-sm">
            {w.primaryContact.name && (
              <div className="flex items-center gap-2 text-gray-700">
                <ContactIcon size={14} className="text-gray-400" />
                <span>{w.primaryContact.name}{w.primaryContact.title && ` — ${w.primaryContact.title}`}</span>
              </div>
            )}
            {w.primaryContact.email && (
              <div className="flex items-center gap-2 text-gray-600">
                <EmailIcon size={14} className="text-gray-400" />
                <span>{w.primaryContact.email}</span>
              </div>
            )}
            {w.primaryContact.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <PhoneIcon size={14} className="text-gray-400" />
                <span>{w.primaryContact.phone}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {w.notes && (
        <div>
          <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 pl-2 border-l-2 border-brand-teal">Notes</p>
          <p className={`text-sm text-gray-600 ${!expanded && notesLong ? "line-clamp-2" : ""}`}>{w.notes}</p>
          {notesLong && (
            <button onClick={() => setExpanded(!expanded)} className="text-xs text-brand-teal font-medium mt-1">
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
        <Button variant="secondary" size="sm" onClick={onEdit}>
          <EditIcon size={14} /> Edit
        </Button>
        <Button variant="danger" size="sm" onClick={onDelete}>
          <DeleteIcon size={14} /> Remove
        </Button>
      </div>
    </div>
  );
}

function WorksiteSkeleton() {
  return (
    <>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            {[200, 300, 150, 100].map((w, j) => (
              <div key={j} style={{ width: w, height: 14, borderRadius: 6, background: "linear-gradient(90deg, #E4ECF2 25%, #F5F8FA 50%, #E4ECF2 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
