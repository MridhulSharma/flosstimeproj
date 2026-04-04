import { connectDB } from "@/lib/mongodb";
import Staff from "@/models/Staff";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

async function getStats() {
  await connectDB();

  const allStaff = await Staff.find({}).lean();
  const total = allStaff.length;
  const active = allStaff.filter((s) => s.status === "Active").length;
  const doctors = allStaff.filter((s) => s.jobType === "Doctor").length;
  const hygienists = allStaff.filter((s) => s.jobType === "Hygienist").length;
  const assistants = allStaff.filter((s) => s.jobType === "Assistant").length;
  const avgRadius = total > 0 ? Math.round(allStaff.reduce((sum, s) => sum + (s.travelRadius || 0), 0) / total) : 0;

  // Weekly availability counts
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
  const availability = days.map((day) => ({
    day,
    count: allStaff.filter((s) => s.availableDays?.includes(day)).length,
  }));

  return {
    stats: { total, active, doctors, hygienists, assistants, avgRadius },
    availability,
  };
}

export default async function DashboardPage() {
  const { stats, availability } = await getStats();
  return <DashboardClient stats={stats} availability={availability} />;
}
