export default function WorksitesPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 max-w-md text-center">
        <span className="text-5xl block mb-4">📍</span>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Worksite Management</h1>
        <p className="text-sm text-gray-500 mb-4">
          Add client locations like UMass Boston, Wellesley, and Nantucket.
          View on an interactive map with travel radius overlays.
        </p>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full">
          ⚡ Coming in Phase 2
        </span>
      </div>
    </div>
  );
}
