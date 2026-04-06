import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Assignment from "@/models/Assignment";
import Worksite from "@/models/Worksite";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = request.nextUrl;
    const worksiteId = searchParams.get("worksiteId") || "";
    const staffId = searchParams.get("staffId") || "";
    const status = searchParams.get("status") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const sortBy = searchParams.get("sortBy") || "date";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (worksiteId) filter.worksiteId = worksiteId;
    if (staffId) filter["teamMembers.staffId"] = staffId;
    if (status) filter.status = status;
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "desc" ? -1 : 1,
    };

    const assignments = await Assignment.find(filter).sort(sort).lean();

    return NextResponse.json({ assignments, total: assignments.length });
  } catch (error) {
    console.error("GET /api/assignments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const body = await request.json();
    const { worksiteId, date, teamSize } = body;

    if (!worksiteId || !date || !teamSize) {
      return NextResponse.json(
        { error: "Worksite, date, and team size are required" },
        { status: 400 }
      );
    }

    // Look up worksite for denormalized clientName
    const worksite = await Worksite.findById(worksiteId).lean();
    if (!worksite) {
      return NextResponse.json({ error: "Worksite not found" }, { status: 404 });
    }

    const clientName = (worksite as { clientName: string }).clientName;

    // Auto-generate title if not provided
    if (!body.title) {
      const d = new Date(date);
      const formatted = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      body.title = `${clientName} — ${formatted}`;
    }

    body.clientName = clientName;

    const assignment = await Assignment.create(body);
    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("POST /api/assignments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
