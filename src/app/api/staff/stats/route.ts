import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Staff from "@/models/Staff";
import Worksite from "@/models/Worksite";
import Assignment from "@/models/Assignment";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    // Current month range
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [total, active, doctors, hygienists, assistants, radiusData, totalWorksites, scheduledThisMonth] =
      await Promise.all([
        Staff.countDocuments(),
        Staff.countDocuments({ status: "Active" }),
        Staff.countDocuments({ jobType: "Doctor" }),
        Staff.countDocuments({ jobType: "Hygienist" }),
        Staff.countDocuments({ jobType: "Assistant" }),
        Staff.aggregate([
          { $group: { _id: null, avgRadius: { $avg: "$travelRadius" } } },
        ]),
        Worksite.countDocuments({ status: "Active" }),
        Assignment.countDocuments({
          date: { $gte: monthStart, $lte: monthEnd },
          status: { $in: ["Scheduled", "Confirmed"] },
        }),
      ]);

    const avgRadius = radiusData[0]?.avgRadius
      ? Math.round(radiusData[0].avgRadius)
      : 0;

    return NextResponse.json({
      total,
      active,
      doctors,
      hygienists,
      assistants,
      avgRadius,
      totalWorksites,
      scheduledThisMonth,
    });
  } catch (error) {
    console.error("GET /api/staff/stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
