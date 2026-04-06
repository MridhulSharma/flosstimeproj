"use client";

import { useState, useEffect } from "react";
import { IWorksite, WorksiteFormData } from "@/types";
import Button from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/Icon";

interface WorksiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: WorksiteFormData) => Promise<void>;
  worksite?: IWorksite | null;
}

const emptyForm: WorksiteFormData = {
  clientName: "",
  address: "",
  city: "",
  state: "MA",
  zipCode: "",
  primaryContact: { name: "", title: "", email: "", phone: "" },
  notes: "",
  status: "Active",
  contractStart: undefined,
  contractEnd: undefined,
};

interface FieldErrors {
  clientName?: string;
  address?: string;
  city?: string;
  contactEmail?: string;
}

export default function WorksiteModal({ isOpen, onClose, onSave, worksite }: WorksiteModalProps) {
  const [form, setForm] = useState<WorksiteFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (worksite) {
      setForm({
        clientName: worksite.clientName,
        address: worksite.address,
        city: worksite.city,
        state: worksite.state,
        zipCode: worksite.zipCode,
        primaryContact: { ...worksite.primaryContact },
        notes: worksite.notes,
        status: worksite.status,
        contractStart: worksite.contractStart ? worksite.contractStart.slice(0, 10) : undefined,
        contractEnd: worksite.contractEnd ? worksite.contractEnd.slice(0, 10) : undefined,
      });
    } else {
      setForm(emptyForm);
    }
    setError("");
    setFieldErrors({});
  }, [worksite, isOpen]);

  const updateContact = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      primaryContact: { ...prev.primaryContact, [field]: value },
    }));
  };

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    if (!form.clientName.trim()) errors.clientName = "Client name is required.";
    if (!form.address.trim()) errors.address = "Address is required.";
    if (!form.city.trim()) errors.city = "City is required.";
    if (form.primaryContact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.primaryContact.email)) {
      errors.contactEmail = "Please enter a valid email.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setError("");
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save worksite.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const inputCls = (hasError?: string) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal ${hasError ? "border-red-300" : "border-gray-200"}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {worksite ? "Edit Worksite" : "Add Worksite"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
          )}

          {/* Client Information */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-brand-teal mb-3 pb-1 border-b border-brand-teal/20">
              Client Information
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Client Name *</label>
                <input type="text" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} className={inputCls(fieldErrors.clientName)} />
                {fieldErrors.clientName && <p className="text-xs text-red-500 mt-1">{fieldErrors.clientName}</p>}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "Active" | "Inactive" })} className={inputCls()}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-brand-teal mb-3 pb-1 border-b border-brand-teal/20">
              Location
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Street Address *</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls(fieldErrors.address)} />
                {fieldErrors.address && <p className="text-xs text-red-500 mt-1">{fieldErrors.address}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">City *</label>
                <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls(fieldErrors.city)} />
                {fieldErrors.city && <p className="text-xs text-red-500 mt-1">{fieldErrors.city}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">State</label>
                <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputCls()} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">ZIP Code</label>
                <input type="text" value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} className={inputCls()} />
              </div>
            </div>
          </div>

          {/* Primary Contact */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-brand-teal mb-3 pb-1 border-b border-brand-teal/20">
              Primary Contact
            </h3>
            <p className="text-xs text-gray-400 mb-3">The main point of contact at this location</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Contact Name</label>
                <input type="text" value={form.primaryContact.name} onChange={(e) => updateContact("name", e.target.value)} className={inputCls()} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Title / Role</label>
                <input type="text" value={form.primaryContact.title} onChange={(e) => updateContact("title", e.target.value)} placeholder="HR Manager, Office Coordinator, etc." className={inputCls()} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Contact Email</label>
                <input type="email" value={form.primaryContact.email} onChange={(e) => updateContact("email", e.target.value)} className={inputCls(fieldErrors.contactEmail)} />
                {fieldErrors.contactEmail && <p className="text-xs text-red-500 mt-1">{fieldErrors.contactEmail}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Contact Phone</label>
                <input type="tel" value={form.primaryContact.phone} onChange={(e) => updateContact("phone", e.target.value)} className={inputCls()} />
              </div>
            </div>
          </div>

          {/* Contract Dates */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-brand-teal mb-3 pb-1 border-b border-brand-teal/20">
              Contract Dates
            </h3>
            <p className="text-xs text-gray-400 mb-3">Leave blank if not yet confirmed</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Contract Start</label>
                <input type="date" value={form.contractStart || ""} onChange={(e) => setForm({ ...form, contractStart: e.target.value || undefined })} className={inputCls()} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Contract End</label>
                <input type="date" value={form.contractEnd || ""} onChange={(e) => setForm({ ...form, contractEnd: e.target.value || undefined })} className={inputCls()} />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-brand-teal mb-3 pb-1 border-b border-brand-teal/20">
              Notes
            </h3>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} placeholder="Parking instructions, access codes, special requirements, etc." className={`${inputCls()} resize-none`} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : worksite ? "Update" : "Add Worksite"}
          </Button>
        </div>
      </div>
    </div>
  );
}
