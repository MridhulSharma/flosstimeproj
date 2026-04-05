import { ScheduleIcon } from "@/components/ui/Icon";

export default function SchedulePage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 max-w-md text-center">
        <ScheduleIcon size={52} color="#00B4A6" strokeWidth={1} className="mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Schedule Builder</h1>
        <p className="text-sm text-gray-500 mb-4">
          Drag-and-drop weekly calendar to assign dental teams to worksites.
          Handle callouts and build monthly deployment plans.
        </p>
        <span className="inline-block border-l-[3px] border-brand-teal bg-brand-teal-bg text-brand-teal-dark text-[13px] font-bold py-2 px-3.5 rounded-r-lg">
          Coming in Phase 3
        </span>
      </div>
    </div>
  );
}
