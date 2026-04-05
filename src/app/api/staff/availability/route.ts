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

    const staff = await Staff.find({}, { availableDays: 1 }).lean();
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const counts = days.map((day) => ({
      day,
      count: staff.filter((s) =>
        (s.availableDays as string[])?.includes(day)
      ).length,
    }));

    return NextResponse.json({ counts, total: staff.length });
  } catch (error) {
    console.error("GET /api/staff/availability error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
