import { connectDB } from "@/lib/mongodb";
import Staff from "@/models/Staff";
import Worksite from "@/models/Worksite";
import Assignment from "@/models/Assignment";

export interface AIContext {
  staffSummary: {
    total: number;
    active: number;
    inactive: number;
    doctors: number;
    hygienists: number;
    assistants: number;
    avgRadius: number;
  };
  worksiteSummary: {
    total: number;
    active: number;
    inactive: number;
  };
  scheduleSummary: {
    thisMonth: number;
    upcoming: number;
    confirmed: number;
  };
  staffList: Array<{
    name: string;
    jobType: string;
    status: string;
    availableDays: string[];
    travelRadius: number;
  }>;
  worksiteList: Array<{
    clientName: string;
    city: string;
    state: string;
    status: string;
  }>;
  recentAssignments: Array<{
    title: string;
    clientName: string;
    date: string;
    status: string;
    teamSize: number;
  }>;
}

export async function gatherAIContext(): Promise<AIContext> {
  await connectDB();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [allStaff, allWorksites, monthAssignments, upcomingAssignments] =
    await Promise.all([
      Staff.find({}).lean(),
      Worksite.find({}).lean(),
      Assignment.countDocuments({
        date: { $gte: monthStart, $lte: monthEnd },
        status: { $in: ["Scheduled", "Confirmed"] },
      }),
      Assignment.find({ date: { $gte: now } })
        .sort({ date: 1 })
        .limit(10)
        .lean(),
    ]);

  const total = allStaff.length;
  const active = allStaff.filter((s: any) => s.status === "Active").length;
  const doctors = allStaff.filter((s: any) => s.jobType === "Doctor").length;
  const hygienists = allStaff.filter((s: any) => s.jobType === "Hygienist").length;
  const assistants = allStaff.filter((s: any) => s.jobType === "Assistant").length;
  const avgRadius =
    total > 0
      ? Math.round(
          allStaff.reduce((sum: number, s: any) => sum + (s.travelRadius || 0), 0) / total
        )
      : 0;

  const activeWorksites = allWorksites.filter((w: any) => w.status === "Active").length;
  const confirmed = upcomingAssignments.filter((a: any) => a.status === "Confirmed").length;

  return {
    staffSummary: {
      total,
      active,
      inactive: total - active,
      doctors,
      hygienists,
      assistants,
      avgRadius,
    },
    worksiteSummary: {
      total: allWorksites.length,
      active: activeWorksites,
      inactive: allWorksites.length - activeWorksites,
    },
    scheduleSummary: {
      thisMonth: monthAssignments,
      upcoming: upcomingAssignments.length,
      confirmed,
    },
    staffList: allStaff.map((s: any) => ({
      name: s.name,
      jobType: s.jobType,
      status: s.status,
      availableDays: s.availableDays || [],
      travelRadius: s.travelRadius || 0,
    })),
    worksiteList: allWorksites.map((w: any) => ({
      clientName: w.clientName,
      city: w.city,
      state: w.state,
      status: w.status,
    })),
    recentAssignments: upcomingAssignments.map((a: any) => ({
      title: a.title,
      clientName: a.clientName,
      date: a.date?.toISOString?.() || String(a.date),
      status: a.status,
      teamSize: a.teamSize || 0,
    })),
  };
}
