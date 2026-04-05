import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Staff from "@/models/Staff";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = request.nextUrl;
    const action = searchParams.get("action");

    if (action === "count") {
      const total = await Staff.countDocuments();
      const active = await Staff.countDocuments({ status: "Active" });
      const doctors = await Staff.countDocuments({ jobType: "Doctor" });
      const hygienists = await Staff.countDocuments({ jobType: "Hygienist" });
      const assistants = await Staff.countDocuments({ jobType: "Assistant" });
      return NextResponse.json({ total, active, doctors, hygienists, assistants });
    }

    if (action === "list") {
      const staff = await Staff.find({}).lean();
      return NextResponse.json({ staff, total: staff.length });
    }

    return NextResponse.json({
      status: "connected",
      message: "MongoDB connection successful",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
