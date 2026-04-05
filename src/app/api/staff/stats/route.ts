import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Staff from "@/models/Staff";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const [total, active, doctors, hygienists, assistants, radiusData] =
      await Promise.all([
        Staff.countDocuments(),
        Staff.countDocuments({ status: "Active" }),
        Staff.countDocuments({ jobType: "Doctor" }),
        Staff.countDocuments({ jobType: "Hygienist" }),
        Staff.countDocuments({ jobType: "Assistant" }),
        Staff.aggregate([
          { $group: { _id: null, avgRadius: { $avg: "$travelRadius" } } },
        ]),
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
    });
  } catch (error) {
    console.error("GET /api/staff/stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
