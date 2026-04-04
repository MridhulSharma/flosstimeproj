export default function AIAssistantPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 max-w-md text-center">
        <span className="text-5xl block mb-4">🤖</span>
        <h1 className="text-xl font-bold text-gray-900 mb-2">AI Scheduling Assistant</h1>
        <p className="text-sm text-gray-500 mb-4">
          Ask the AI to find the best team for any worksite based on
          availability, travel radius, and role requirements.
        </p>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full">
          ⚡ Coming in Phase 4
        </span>
      </div>
    </div>
  );
}
