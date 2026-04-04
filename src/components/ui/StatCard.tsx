"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
  bgColor?: string;
}

export default function StatCard({ label, value, icon, color = "text-brand-navy", bgColor = "bg-gray-50" }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <span className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center text-lg`}>
          {icon}
        </span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
