import { connectDB } from "@/lib/mongodb";
import Staff from "@/models/Staff";
import Worksite from "@/models/Worksite";
import Assignment from "@/models/Assignment";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

async function getStats() {
  await connectDB();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const allStaff = await Staff.find({}).lean();
  const total = allStaff.length;
  const active = allStaff.filter((s) => s.status === "Active").length;
  const doctors = allStaff.filter((s) => s.jobType === "Doctor").length;
  const hygienists = allStaff.filter((s) => s.jobType === "Hygienist").length;
  const assistants = allStaff.filter((s) => s.jobType === "Assistant").length;
  const avgRadius = total > 0 ? Math.round(allStaff.reduce((sum, s) => sum + (s.travelRadius || 0), 0) / total) : 0;

  const totalWorksites = await Worksite.countDocuments({ status: "Active" });
  const scheduledThisMonth = await Assignment.countDocuments({
    date: { $gte: monthStart, $lte: monthEnd },
    status: { $in: ["Scheduled", "Confirmed"] },
  });

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
  const availability = days.map((day) => ({
    day,
    count: allStaff.filter((s) => s.availableDays?.includes(day)).length,
  }));

  return {
    stats: { total, active, doctors, hygienists, assistants, avgRadius, totalWorksites, scheduledThisMonth },
    availability,
  };
}

export default async function DashboardPage() {
  const { stats, availability } = await getStats();
  return <DashboardClient stats={stats} availability={availability} />;
}
